-- Base table-level privileges for Supabase's anon/authenticated roles.
-- RLS policies (from 0001_init.sql) are the real access control layer here —
-- these grants just allow the roles to attempt the operations at all; the
-- policies then decide which rows each request can actually see/affect.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.admins,
  public.profiles,
  public.categories,
  public.profile_categories,
  public.listings,
  public.listing_images,
  public.conversations,
  public.messages,
  public.reports,
  public.admin_audit_log
to anon, authenticated;

grant execute on function public.is_admin(uuid) to anon, authenticated;
