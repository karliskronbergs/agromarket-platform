import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSelfAndDescendantIds } from "@/lib/categories";
import { getAttributesByProfileIds } from "@/lib/attributes";
import { getAnimalGroupForCategory, breedLabel } from "@/lib/livestock";
import { conditionLabel } from "@/lib/equipment";
import { priceUnitSuffix } from "@/lib/format";
import { MapView, type MapMode, type MapPoint } from "@/components/map-view";

export const dynamic = "force-dynamic";

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    mode?: string;
    category?: string;
    breed?: string;
    ageMin?: string;
    ageMax?: string;
    quantityMin?: string;
    priceMin?: string;
    priceMax?: string;
    condition?: string;
    manufacturer?: string;
    model?: string;
    title?: string;
    organic?: string;
  }>;
}) {
  const { locale } = await params;
  const {
    mode: rawMode,
    category,
    breed,
    ageMin,
    ageMax,
    quantityMin,
    priceMin,
    priceMax,
    condition,
    manufacturer,
    model,
    title: titleSearch,
    organic,
  } = await searchParams;
  const mode: MapMode = rawMode === "sell" || rawMode === "buy" ? rawMode : "profiles";

  const tListing = await getTranslations("Listing");
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_lv, name_en, parent_id")
    .order("sort_order")
    .order("name_lv");

  let points: MapPoint[] = [];
  const categoryIds = category ? getSelfAndDescendantIds(categories ?? [], category) : null;

  let organicProfileIds: string[] | null = null;
  if (organic) {
    const { data: organicAttr } = await supabase
      .from("attributes")
      .select("id")
      .eq("slug", "organic-certified")
      .maybeSingle();
    const { data: links } = organicAttr
      ? await supabase
          .from("profile_attribute_links")
          .select("profile_id")
          .eq("attribute_id", organicAttr.id)
      : { data: [] };
    organicProfileIds = (links ?? []).map((l) => l.profile_id);
  }

  if (mode === "profiles") {
    const { data } = categoryIds
      ? await supabase
          .from("profiles")
          .select(
            "id, business_name, slug, address, lat, lng, avatar_url, verified, admin_badge, view_count, listing_view_count, profile_categories!inner(category_id)",
          )
          .eq("status", "active")
          .not("lat", "is", null)
          .in("profile_categories.category_id", categoryIds)
      : await supabase
          .from("profiles")
          .select(
            "id, business_name, slug, address, lat, lng, avatar_url, verified, admin_badge, view_count, listing_view_count",
          )
          .eq("status", "active")
          .not("lat", "is", null);

    (data ?? []).sort((a, b) => {
      const adminDiff = Number(b.admin_badge) - Number(a.admin_badge);
      if (adminDiff !== 0) return adminDiff;
      const aScore = (a.view_count ?? 0) + (a.listing_view_count ?? 0);
      const bScore = (b.view_count ?? 0) + (b.listing_view_count ?? 0);
      return bScore - aScore;
    });

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

    const attributesByProfile = await getAttributesByProfileIds(supabase, profileIds);

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
      attributes: attributesByProfile.get(p.id) ?? [],
    }));
  } else {
    let query = supabase
      .from("listings")
      .select(
        "id, title, price, price_unit, price_plus_vat, breed, age_months, quantity, condition, manufacturer, model, category_id, lat, lng, profiles(id, lat, lng), categories(name_lv, name_en), listing_images(url, sort_order)",
      )
      .eq("status", "active")
      .eq("listing_type", mode)
      .not("lat", "is", null)
      .gt("expires_at", new Date().toISOString());

    if (categoryIds) query = query.in("category_id", categoryIds);
    if (breed) query = query.eq("breed", breed);
    if (ageMin) query = query.gte("age_months", Number(ageMin));
    if (ageMax) query = query.lte("age_months", Number(ageMax));
    if (quantityMin) query = query.gte("quantity", Number(quantityMin));
    if (priceMin) query = query.gte("price", Number(priceMin));
    if (priceMax) query = query.lte("price", Number(priceMax));
    if (condition) query = query.eq("condition", condition);
    if (manufacturer) query = query.ilike("manufacturer", `%${manufacturer}%`);
    if (model) query = query.ilike("model", `%${model}%`);
    if (titleSearch) query = query.ilike("title", `%${titleSearch}%`);
    if (organicProfileIds) {
      query =
        organicProfileIds.length > 0
          ? query.in("profile_id", organicProfileIds)
          : query.eq("id", "00000000-0000-0000-0000-000000000000");
    }

    const { data } = await query;

    const listingProfileIds = Array.from(
      new Set(
        (data ?? [])
          .map((l) => (Array.isArray(l.profiles) ? l.profiles[0] : l.profiles)?.id)
          .filter((id): id is string => !!id),
      ),
    );
    const attributesByProfile = await getAttributesByProfileIds(supabase, listingProfileIds);

    points = (data ?? [])
      .map((l) => {
        const profile = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
        const cat = Array.isArray(l.categories) ? l.categories[0] : l.categories;
        const images = (l.listing_images ?? []) as { url: string; sort_order: number }[];
        const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
        const lat = (l.lat as number | null) ?? profile?.lat ?? null;
        const lng = (l.lng as number | null) ?? profile?.lng ?? null;
        const animalGroup = getAnimalGroupForCategory(categories ?? [], l.category_id as string | null);
        const priceText =
          l.price != null
            ? `€${l.price}${priceUnitSuffix(l.price_unit)}${l.price_plus_vat ? ` ${tListing("plusVat")}` : ""}`
            : "";
        const breedText =
          animalGroup && l.breed ? breedLabel(animalGroup, l.breed as string, locale) : "";
        const conditionText = l.condition ? conditionLabel(l.condition as string, locale) : "";
        const manufacturerModelText = [l.manufacturer, l.model].filter(Boolean).join(" ");
        return {
          id: l.id as string,
          title: l.title as string,
          subtitle: [manufacturerModelText || breedText || conditionText, priceText]
            .filter(Boolean)
            .join(" · "),
          lat,
          lng,
          href: `/${locale}/listings/${l.id}`,
          badge: cat ? (locale === "lv" ? cat.name_lv : cat.name_en) : undefined,
          imageUrl: firstImage?.url,
          attributes: profile?.id ? (attributesByProfile.get(profile.id) ?? []) : [],
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
      livestockFilters={{
        breed,
        ageMin,
        ageMax,
        quantityMin,
        priceMin,
        priceMax,
        organic,
      }}
      equipmentFilters={{ condition, priceMin, priceMax }}
      machineryFilters={{ manufacturer, model, condition, priceMin, priceMax }}
      seedsFilters={{ title: titleSearch, priceMin, priceMax, organic }}
      labels={{
        profiles: t("modeProfiles"),
        sell: t("modeSell"),
        buy: t("modeBuy"),
        all: t("allCategories"),
        back: t("back"),
        filterBreed: t("filterBreed"),
        anyBreed: t("anyBreed"),
        filterAge: t("filterAge"),
        ageMinPlaceholder: t("ageMinPlaceholder"),
        ageMaxPlaceholder: t("ageMaxPlaceholder"),
        filterQuantity: t("filterQuantity"),
        quantityMinPlaceholder: t("quantityMinPlaceholder"),
        filterPrice: t("filterPrice"),
        priceMinPlaceholder: t("priceMinPlaceholder"),
        priceMaxPlaceholder: t("priceMaxPlaceholder"),
        apply: t("apply"),
        clearFilters: t("clearFilters"),
        ageMonthsShort: tListing("ageMonthsShort"),
        filterCondition: t("filterCondition"),
        anyCondition: t("anyCondition"),
        filterManufacturer: t("filterManufacturer"),
        manufacturerPlaceholder: t("manufacturerPlaceholder"),
        filterModel: t("filterModel"),
        modelPlaceholder: t("modelPlaceholder"),
        filterTitle: tListing("title"),
        titlePlaceholder: t("titlePlaceholder"),
        organicCertified: t("organicCertified"),
        empty: t("empty"),
      }}
    />
  );
}
