-- izsole.lauks24.lv "Country field + flags": a country on the seller's
-- marketplace profile, plus an optional link from an auction to that
-- profile so the auction can show the seller's country without it being
-- entered (and potentially getting out of sync) per auction.
--
-- organizer_name/organizer_logo_url on auctions stay as the primary,
-- always-required display fields -- seller_profile_id is a purely
-- additive enrichment for country (and future profile-derived display),
-- not a replacement, so every already-shipped page that reads
-- organizer_name keeps working unchanged.

alter table profiles add column country text not null default 'LV';

alter table auctions
  add column seller_profile_id uuid references profiles (id) on delete set null;
