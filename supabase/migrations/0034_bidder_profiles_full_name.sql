-- The Izsole registration modal asks for name/company alongside phone
-- (design_handoff_v2/IZSOLE.md's registration modal spec).
alter table bidder_profiles add column full_name text;
