-- Condition filter (new/used) for the Fermu aprikojums un iekartas category branch.
alter table listings add column condition text;

create index listings_condition_idx on listings (condition);
