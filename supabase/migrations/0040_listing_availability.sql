-- Lets a seller mark a listing as available right away or reservation-only.
-- A single enum column (not two independent booleans) so the two states
-- the UI presents as checkboxes stay mutually exclusive at the data level.
alter table listings
  add column availability text not null default 'immediate'
  check (availability in ('immediate', 'reservation'));
