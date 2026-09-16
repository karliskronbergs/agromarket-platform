import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSelfAndDescendantIds } from "@/lib/categories";
import { MapView, type MapMode, type MapPoint } from "@/components/map-view";

export const dynamic = "force-dynamic";

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { mode: rawMode, category } = await searchParams;
  const mode: MapMode = rawMode === "sell" || rawMode === "buy" ? rawMode : "profiles";

  const tListing = await getTranslations("Listing");
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_lv, name_en, parent_id")
    .order("name_lv");

  let points: MapPoint[] = [];
  const categoryIds = category ? getSelfAndDescendantIds(categories ?? [], category) : null;

  if (mode === "profiles") {
    const { data } = categoryIds
      ? await supabase
          .from("profiles")
          .select(
            "id, business_name, slug, address, lat, lng, avatar_url, verified, admin_badge, profile_categories!inner(category_id)",
          )
          .eq("status", "active")
          .not("lat", "is", null)
          .in("profile_categories.category_id", categoryIds)
      : await supabase
          .from("profiles")
          .select("id, business_name, slug, address, lat, lng, avatar_url, verified, admin_badge")
          .eq("status", "active")
          .not("lat", "is", null);

    const profileIds = (data ?? []).map((p) => p.id);
    const { data: profileCategories } = profileIds.length
      ? await supabase
          .from("profile_categories")
          .select("profile_id, categories(name_lv, name_en)")
          .in("profile_id", profileIds)
      : { data: [] as { profile_id: string; categories: { name_lv: string; name_en: string } | null }[] };

    const badgeByProfile = new Map<string, string>();
    for (const pc of profileCategories ?? []) {
      if (badgeByProfile.has(pc.profile_id)) continue;
      const cat = pc.categories as unknown as { name_lv: string; name_en: string } | null;
      if (cat) badgeByProfile.set(pc.profile_id, locale === "lv" ? cat.name_lv : cat.name_en);
    }

    points = (data ?? []).map((p) => ({
      id: p.id,
      title: p.business_name,
      subtitle: p.address ?? "",
      lat: p.lat as number,
      lng: p.lng as number,
      href: `/${locale}/profiles/${p.slug}`,
      imageUrl: p.avatar_url ?? undefined,
      verified: p.verified ?? false,
      adminBadge: p.admin_badge ?? false,
      badge: badgeByProfile.get(p.id),
    }));
  } else {
    let query = supabase
      .from("listings")
      .select(
        "id, title, price, price_plus_vat, lat, lng, profiles(lat, lng), categories(name_lv, name_en), listing_images(url, sort_order)",
      )
      .eq("status", "active")
      .eq("listing_type", mode)
      .not("lat", "is", null)
      .gt("expires_at", new Date().toISOString());

    if (categoryIds) query = query.in("category_id", categoryIds);

    const { data } = await query;

    points = (data ?? [])
      .map((l) => {
        const profile = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
        const cat = Array.isArray(l.categories) ? l.categories[0] : l.categories;
        const images = (l.listing_images ?? []) as { url: string; sort_order: number }[];
        const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
        const lat = (l.lat as number | null) ?? profile?.lat ?? null;
        const lng = (l.lng as number | null) ?? profile?.lng ?? null;
        return {
          id: l.id as string,
          title: l.title as string,
          subtitle: l.price != null ? `€${l.price}${l.price_plus_vat ? ` ${tListing("plusVat")}` : ""}` : "",
          lat,
          lng,
          href: `/${locale}/listings/${l.id}`,
          badge: cat ? (locale === "lv" ? cat.name_lv : cat.name_en) : undefined,
          imageUrl: firstImage?.url,
        };
      })
      .filter((p) => p.lat != null && p.lng != null) as MapPoint[];
  }

  const t = await getTranslations("Map");

  return (
    <MapView
      mode={mode}
      points={points}
      categories={categories ?? []}
      selectedCategory={category}
      locale={locale}
      labels={{
        profiles: t("modeProfiles"),
        sell: t("modeSell"),
        buy: t("modeBuy"),
        all: t("allCategories"),
        back: t("back"),
        empty: t("empty"),
      }}
    />
  );
}
