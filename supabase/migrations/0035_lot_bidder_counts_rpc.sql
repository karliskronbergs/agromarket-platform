-- lot_max_bids' RLS policy (0030) only lets a bidder see their own row --
-- correct for protecting everyone's private max amount, but it also means
-- a plain `select bidder_user_id from lot_max_bids` only ever returns the
-- querying user's own row (or everything, for an admin). The public
-- "N dalībnieki" / bidder-count UI (auction cards, lot grid, lot price
-- tile) needs the full list of *who* has bid on a lot -- just not *how
-- much* -- so it's exposed through this SECURITY DEFINER function instead
-- of loosening the table's RLS/grants, keeping every bidder's max private.

create or replace function lot_bidder_user_ids(p_lot_ids uuid[])
returns table (lot_id uuid, bidder_user_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select lot_id, bidder_user_id
  from lot_max_bids
  where lot_id = any(p_lot_ids);
$$;

grant execute on function lot_bidder_user_ids(uuid[]) to anon, authenticated;
