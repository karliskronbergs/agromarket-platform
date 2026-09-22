-- Organic certificate is now a per-listing flag (not the seller's profile
-- attribute), since one farm can sell both certified and non-certified
-- produce/animals across different listings.
alter table listings add column organic_certified boolean not null default false;

create index listings_organic_certified_idx on listings (organic_certified) where organic_certified;
