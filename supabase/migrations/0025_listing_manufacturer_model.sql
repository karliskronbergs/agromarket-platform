-- Manufacturer/model text filters for the Lauksaimniecibas Tehnika category branch.
alter table listings add column manufacturer text;
alter table listings add column model text;

create index listings_manufacturer_idx on listings (lower(manufacturer));
create index listings_model_idx on listings (lower(model));
