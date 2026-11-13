-- Lets a seller opt a listing into automatic renewal so it never falls
-- out of the 21-day expiry window on its own. The daily expire-listings
-- cron checks this flag instead of (or as well as) emailing an
-- expiry notice.
alter table listings add column auto_renew boolean not null default false;
