import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSelfAndDescendantIds } from "@/lib/categories";
import { getAttributesByProfileIds } from "@/lib/attributes";
import { priceUnitSuffix, formatRelativeDays } from "@/lib/format";
import { MapView, type MapMode, type MapPoint } from "@/components/map-view";
import { buildLanguageAlternates } from "@/lib/alternates";

export const dynamic = "force-dynamic";

type MapSearchParams = {
  mode?: string;
  category?: string;
};

// design_handoff_v2/FLUID.md "3b. Category heading on the map page (SEO)":
// each category's own seo_h1 / seo_h1_companies / seo_description drive
// both the page's <title>/<meta description> and the on-page <h1> -- so
// this and the page body below both need the same lookup.
async function resolveSeo(mode: MapMode, category: string | undefined, locale: string) {
  const t = await getTranslations({ locale, namespace: "Map" });
  const supabase = await createClient();
  const isProfiles = mode === "profiles";

  let h1 = isProfiles ? t("seoFallbackProfilesH1") : t("seoFallbackListingsH1");
  let description = isProfiles ? t("seoFallbackProfilesDescription") : t("seoFallbackListingsDescription");
  let metaTitle: string | null = null;

  if (category) {
    const { data } = await supabase
      .from("categories")
      .select("seo_h1, seo_h1_companies, seo_description, meta_title")
      .eq("id", category)
      .maybeSingle();
    if (data) {
      h1 = (isProfiles ? data.seo_h1_companies : data.seo_h1) ?? h1;
      description = data.seo_description ?? description;
      metaTitle = data.meta_title;
    }
  }

  return { h1, description, metaTitle };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<MapSearchParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { mode: rawMode, category } = await searchParams;
  const mode: MapMode = rawMode === "sell" || rawMode === "buy" ? rawMode : "profiles";
  const { h1, description, metaTitle } = await resolveSeo(mode, category, locale);

  const query = new URLSearchParams();
  if (rawMode) query.set("mode", rawMode);
  if (category) query.set("category", category);
  const queryString = query.toString();
  const pathAndQuery = `/map${queryString ? `?${queryString}` : ""}`;

  return {
    title: metaTitle ?? h1,
    description,
    alternates: { languages: buildLanguageAlternates(pathAndQuery) },
  };
}

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    mode?: string;
    category?: string;
    subcategories?: string;
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
    sort?: string;
    q?: string;
    lat?: string;
    lng?: string;
    zoom?: string;
  }>;
}) {
  const { locale } = await params;
  const {
    mode: rawMode,
    category,
    subcategories,
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
    sort,
    q,
    lat,
    lng,
    zoom,
  } = await searchParams;
  const mode: MapMode = rawMode === "sell" || rawMode === "buy" ? rawMode : "profiles";
  const selectedSubcategoryIds = subcategories ? subcategories.split(",").filter(Boolean) : [];
  const initialView =
    lat && lng && zoom && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng)) && !Number.isNaN(Number(zoom))
      ? { lat: Number(lat), lng: Number(lng), zoom: Number(zoom) }
      : undefined;

  const tListing = await getTranslations("Listing");
  const tProfile = await getTranslations("Profile");
  const t = await getTranslations("Map");
  const supabase = await createClient();
  const seo = await resolveSeo(mode, category, locale);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_lv, name_en, parent_id")
    .order("sort_order")
    .order("name_lv");

  let points: MapPoint[] = [];
  const categoryIds =
    selectedSubcategoryIds.length > 0
      ? Array.from(
          new Set(selectedSubcategoryIds.flatMap((id) => getSelfAndDescendantIds(categories ?? [], id))),
        )
      : category
        ? getSelfAndDescendantIds(categories ?? [], category)
        : null;

  // Counts for the currently open top category's direct children, for the
  // subcategory dropdown's per-row counts and its "Rādīt N rezultātus"
  // preview. Each child's count includes its own descendants (a listing
  // tagged two levels down under a child still counts toward that child's
  // row). Scoped to mode + search only (not the other active filters),
  // same as the chip row itself.
  const subcategoryCounts: Record<string, number> = {};
  if (category) {
    const children = (categories ?? []).filter((c) => c.parent_id === category);
    if (children.length > 0) {
      const idToChild = new Map<string, string>();
      for (const child of children) {
        subcategoryCounts[child.id] = 0;
        for (const id of getSelfAndDescendantIds(categories ?? [], child.id)) {
          idToChild.set(id, child.id);
        }
      }
      const allIds = Array.from(idToChild.keys());

      if (mode === "profiles") {
        let countQuery = supabase
          .from("profile_categories")
          .select("category_id, profiles!inner(status)")
          .in("category_id", allIds)
          .eq("profiles.status", "active");
        if (q) countQuery = countQuery.ilike("profiles.business_name", `%${q}%`);
        const { data: countRows } = await countQuery;
        for (const row of countRows ?? []) {
          const childId = idToChild.get(row.category_id);
          if (childId) subcategoryCounts[childId] += 1;
        }
      } else {
        let countQuery = supabase
          .from("listings")
          .select("category_id")
          .in("category_id", allIds)
          .eq("status", "active")
          .eq("listing_type", mode)
          .gt("expires_at", new Date().toISOString());
        if (q) countQuery = countQuery.ilike("title", `%${q}%`);
        const { data: countRows } = await countQuery;
        for (const row of countRows ?? []) {
          const childId = idToChild.get(row.category_id);
          if (childId) subcategoryCounts[childId] += 1;
        }
      }
    }
  }

  if (mode === "profiles") {
    let profilesQuery = categoryIds
      ? supabase
          .from("profiles")
          .select(
            "id, business_name, slug, address, lat, lng, avatar_url, verified, admin_badge, view_count, listing_view_count, profile_categories!inner(category_id)",
          )
          .eq("status", "active")
          .not("lat", "is", null)
          .in("profile_categories.category_id", categoryIds)
      : supabase
          .from("profiles")
          .select(
            "id, business_name, slug, address, lat, lng, avatar_url, verified, admin_badge, view_count, listing_view_count",
          )
          .eq("status", "active")
          .not("lat", "is", null);
    if (q) profilesQuery = profilesQuery.ilike("business_name", `%${q}%`);

    const { data } = await profilesQuery;

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
        "id, title, price, price_unit, price_plus_vat, breed, age_months, quantity, condition, manufacturer, model, organic_certified, availability, category_id, lat, lng, created_at, profiles!inner(id, lat, lng, address), categories(name_lv, name_en), listing_images(url, sort_order)",
      )
      .eq("status", "active")
      .eq("listing_type", mode)
      .eq("profiles.status", "active")
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
    if (q) query = query.ilike("title", `%${q}%`);
    if (organic) query = query.eq("organic_certified", true);

    if (sort === "price-asc") query = query.order("price", { ascending: true, nullsFirst: false });
    else if (sort === "price-desc") query = query.order("price", { ascending: false, nullsFirst: false });
    else if (sort === "age-asc") query = query.order("age_months", { ascending: true, nullsFirst: false });
    else if (sort === "age-desc") query = query.order("age_months", { ascending: false, nullsFirst: false });

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
        const priceText =
          l.price != null
            ? `€${l.price}${priceUnitSuffix(l.price_unit, locale)}${l.price_plus_vat ? ` ${tListing("plusVat")}` : ""}`
            : tListing("priceOnRequest");
        const locationAndDate = [profile?.address, formatRelativeDays(l.created_at as string, locale)]
          .filter(Boolean)
          .join(" · ");
        return {
          id: l.id as string,
          title: l.title as string,
          subtitle: locationAndDate,
          price: priceText,
          lat,
          lng,
          href: `/${locale}/listings/${l.id}`,
          badge: cat ? (locale === "lv" ? cat.name_lv : cat.name_en) : undefined,
          imageUrl: firstImage?.url,
          reservation: mode === "sell" && l.availability === "reservation",
          attributes: profile?.id ? (attributesByProfile.get(profile.id) ?? []) : [],
        };
      })
      .filter((p) => p.lat != null && p.lng != null) as MapPoint[];
  }

  return (
    <MapView
      mode={mode}
      points={points}
      seoH1={seo.h1}
      loggedOut={!user}
      categories={categories ?? []}
      selectedCategory={category}
      selectedSubcategories={selectedSubcategoryIds}
      subcategoryCounts={subcategoryCounts}
      initialView={initialView}
      locale={locale}
      sort={sort}
      search={q}
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
        filtri: t("filtri"),
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
        sortLabel: t("sortLabel"),
        sortDefault: t("sortDefault"),
        sortPriceAsc: t("sortPriceAsc"),
        sortPriceDesc: t("sortPriceDesc"),
        sortAgeAsc: t("sortAgeAsc"),
        sortAgeDesc: t("sortAgeDesc"),
        searchPlaceholderProfiles: t("searchPlaceholderProfiles"),
        searchPlaceholderListings: t("searchPlaceholderListings"),
        empty: t("empty"),
        resultLabel:
          mode === "profiles"
            ? t("resultCountProfiles", { count: points.length })
            : t("resultCountListings", { count: points.length }),
        noResultsTitle: t("noResultsTitle"),
        noResultsBody: t("noResultsBody"),
        addListingCta: t("addListingCta"),
        createProfileCta: t("createProfileCta"),
        verifiedShort: tProfile("verifiedShort"),
        reservation: tListing("availabilityReservation"),
        closePin: t("closePin"),
      }}
    />
  );
}
