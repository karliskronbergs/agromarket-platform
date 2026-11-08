-- Needed for the public auction page to show participant counts live, not
-- just the per-lot price (bids was already added in 0030).
alter publication supabase_realtime add table lot_max_bids;
