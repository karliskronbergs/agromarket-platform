-- Livestock-specific listing fields (breed, age, how many are available),
-- for the Dzīvnieki category branch. Generic column names since a later
-- category group (eg. machinery) may reuse quantity/age differently.

alter table listings add column breed text;
alter table listings add column age_months integer;
alter table listings add column quantity integer;

create index listings_breed_idx on listings (breed);
