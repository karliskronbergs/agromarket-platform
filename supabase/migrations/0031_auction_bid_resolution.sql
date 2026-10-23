-- Resolves a bidder's submitted max (proxy) bid into the lot's public
-- price/leader and applies the auction's soft-close extension. This is the
-- one place bids actually get written -- clients never insert into `bids`
-- or `lot_max_bids` directly (see 0030_auction_schema.sql's grants).
--
-- Algorithm (classic proxy/eBay-style bidding, fixed €-increment steps):
--   - Each bidder has one standing max per lot (lot_max_bids), which can
--     only ever go up.
--   - The public price = the smallest amount that beats the second-highest
--     standing max by one bid_increment, capped at the leader's own max.
--     With only one bidder registered, the price sits at the lot's
--     starting_price -- no competition, nothing to spend their max on.
--   - A bids row is only appended when the price or the leader actually
--     changes; is_auto marks a row where the system re-asserted the
--     PREVIOUS leader's position automatically, rather than the caller
--     taking the lead themselves.
--
-- Soft close: the trigger window is always "a qualifying bid landed inside
-- the final minute before the auction's current close time" -- that part
-- never changes. What changes is how much it extends by: +1 minute while
-- current_end_at is still within 30 minutes of the auction's original
-- scheduled_end_at, +30 seconds once it's been pushed further than that.
-- It keeps extending until a full window passes with no qualifying bid.

create or replace function place_proxy_bid(p_lot_id uuid, p_max_amount numeric)
returns table (
  new_current_price numeric,
  new_leader_user_id uuid,
  you_are_leading boolean,
  auction_current_end_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bidder uuid := auth.uid();
  v_lot lots%rowtype;
  v_auction auctions%rowtype;
  v_existing_max numeric;
  v_top_user uuid;
  v_top_max numeric;
  v_second_max numeric;
  v_previous_price numeric;
  v_previous_leader uuid;
  v_new_price numeric;
  v_new_leader uuid;
  v_extend interval;
begin
  if v_bidder is null then
    raise exception 'must be signed in to bid';
  end if;

  if not exists (
    select 1 from bidder_profiles
    where user_id = v_bidder and status = 'approved'
  ) then
    raise exception 'bidder registration not approved';
  end if;

  if p_max_amount <= 0 then
    raise exception 'max bid must be greater than zero';
  end if;

  -- lock the lot so two concurrent bids on it can't both read a stale
  -- leader/price before either has written
  select * into v_lot from lots where id = p_lot_id for update;
  if not found or v_lot.status != 'active' then
    raise exception 'lot is not open for bidding';
  end if;

  select * into v_auction from auctions where id = v_lot.auction_id;
  if v_auction.status != 'live' or now() >= v_auction.current_end_at then
    raise exception 'auction is not currently open';
  end if;

  select max_amount into v_existing_max
  from lot_max_bids where lot_id = p_lot_id and bidder_user_id = v_bidder;

  if v_existing_max is null then
    if p_max_amount < v_lot.starting_price then
      raise exception 'max bid must be at least the starting price (%)', v_lot.starting_price;
    end if;
  elsif p_max_amount <= v_existing_max then
    raise exception 'your standing max bid is already % or higher', v_existing_max;
  end if;

  insert into lot_max_bids (lot_id, bidder_user_id, max_amount)
  values (p_lot_id, v_bidder, p_max_amount)
  on conflict (lot_id, bidder_user_id)
  do update set max_amount = excluded.max_amount, updated_at = now();

  select amount, bidder_user_id into v_previous_price, v_previous_leader
  from bids where lot_id = p_lot_id
  order by created_at desc limit 1;

  select bidder_user_id, max_amount into v_top_user, v_top_max
  from lot_max_bids where lot_id = p_lot_id
  order by max_amount desc, updated_at asc
  limit 1;

  select max_amount into v_second_max
  from lot_max_bids
  where lot_id = p_lot_id and bidder_user_id != v_top_user
  order by max_amount desc
  limit 1;

  v_new_leader := v_top_user;
  v_new_price := case
    when v_second_max is null then v_lot.starting_price
    else least(v_top_max, v_second_max + v_lot.bid_increment)
  end;

  if v_previous_price is distinct from v_new_price
     or v_previous_leader is distinct from v_new_leader then
    insert into bids (lot_id, bidder_user_id, amount, is_auto)
    values (p_lot_id, v_new_leader, v_new_price, v_new_leader != v_bidder);

    if now() >= v_auction.current_end_at - interval '1 minute' then
      v_extend := case
        when v_auction.current_end_at < v_auction.scheduled_end_at + interval '30 minutes'
          then interval '1 minute'
        else interval '30 seconds'
      end;
      update auctions
      set current_end_at = current_end_at + v_extend
      where id = v_auction.id
      returning current_end_at into v_auction.current_end_at;
    end if;
  end if;

  return query select v_new_price, v_new_leader, v_new_leader = v_bidder, v_auction.current_end_at;
end;
$$;

grant execute on function place_proxy_bid(uuid, numeric) to authenticated;
