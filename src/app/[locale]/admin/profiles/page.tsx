import { createClient } from "@/lib/supabase/server";
import { ProfilesTable, type AdminProfileRow } from "./profiles-table";

export const dynamic = "force-dynamic";

export default async function AdminProfilesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const [{ data: profiles }, { data: profileCategories }, { data: activeListings }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, business_name, slug, address, status, verified, admin_badge, view_count, listing_view_count, contact_email, phone, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase.from("profile_categories").select("profile_id, categories(name_lv, name_en)"),
    supabase.from("listings").select("profile_id").eq("status", "active"),
  ]);

  const categoriesByProfile = new Map<string, string[]>();
  for (const pc of profileCategories ?? []) {
    const cat = pc.categories as unknown as { name_lv: string; name_en: string } | null;
    if (!cat) continue;
    const list = categoriesByProfile.get(pc.profile_id) ?? [];
    list.push(locale === "lv" ? cat.name_lv : cat.name_en);
    categoriesByProfile.set(pc.profile_id, list);
  }

  const listingsCountByProfile = new Map<string, number>();
  for (const l of activeListings ?? []) {
    listingsCountByProfile.set(l.profile_id, (listingsCountByProfile.get(l.profile_id) ?? 0) + 1);
  }

  const rows: AdminProfileRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    businessName: p.business_name,
    slug: p.slug,
    address: p.address,
    status: p.status,
    verified: p.verified,
    adminBadge: p.admin_badge,
    viewCount: p.view_count ?? 0,
    listingViewCount: p.listing_view_count ?? 0,
    listingsCount: listingsCountByProfile.get(p.id) ?? 0,
    createdAt: p.created_at,
    contactEmail: p.contact_email,
    phone: p.phone,
    categories: categoriesByProfile.get(p.id) ?? [],
  }));

  return <ProfilesTable locale={locale} profiles={rows} />;
}
