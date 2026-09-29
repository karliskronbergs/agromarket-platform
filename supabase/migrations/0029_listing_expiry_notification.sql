-- Tracks whether we've already emailed a seller that their listing
-- expired, so the daily cron job doesn't re-notify on every run.
alter table listings add column expiry_notified_at timestamptz;
