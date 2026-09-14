-- Listings expire 21 days after creation by default. Expiry is purely a
-- query-time comparison against expires_at (no cron job needed to flip a
-- status) -- status stays reserved for admin moderation (active/removed).

alter table listings alter column expires_at set default (now() + interval '21 days');

update listings set expires_at = created_at + interval '21 days' where expires_at is null;
