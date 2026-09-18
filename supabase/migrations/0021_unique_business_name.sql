-- Prevents two profiles from using the same business name (case-insensitive),
-- so one business can't be impersonated by a second signup using an
-- identical display name. Enforced at the DB level (not just in the
-- saveProfile action) so it holds even under a race between two
-- simultaneous submissions.

create unique index profiles_business_name_unique_idx on profiles (lower(business_name));
