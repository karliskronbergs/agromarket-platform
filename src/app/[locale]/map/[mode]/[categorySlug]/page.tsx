import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MapMode } from "@/components/map-view";
import { MapPageBody, buildMapMetadata, type MapFilters } from "../../shared";

export const dynamic = "force-dynamic";

const VALID_MODES: MapMode[] = ["sell", "buy", "profiles"];

// Only root categories (parent_id null) get a clean URL -- subcategories
// stay reachable through the dropdown on the root category's page, not
// their own route (design_handoff_v2/FLUID.md "3b").
async function resolveRootCategory(categorySlug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (!data || data.parent_id) return null;
  return data;
}

function buildQueryString(searchParams: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) qs.set(key, value);
  }
  return qs.toString();
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; mode: string; categorySlug: string }>;
  searchParams: Promise<Omit<MapFilters, "mode" | "category">>;
}): Promise<Metadata> {
  const { locale, mode: rawMode, categorySlug } = await params;
  if (!VALID_MODES.includes(rawMode as MapMode)) return {};

  const category = await resolveRootCategory(categorySlug);
  if (!category) return {};

  const sp = await searchParams;
  const queryString = buildQueryString(sp);
  const pathAndQuery = `/map/${rawMode}/${categorySlug}${queryString ? `?${queryString}` : ""}`;

  return buildMapMetadata(locale, rawMode as MapMode, category.id, pathAndQuery);
}

export default async function MapCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; mode: string; categorySlug: string }>;
  searchParams: Promise<Omit<MapFilters, "mode" | "category">>;
}) {
  const { locale, mode: rawMode, categorySlug } = await params;
  if (!VALID_MODES.includes(rawMode as MapMode)) notFound();

  const category = await resolveRootCategory(categorySlug);
  if (!category) notFound();

  const sp = await searchParams;
  return <MapPageBody locale={locale} filters={{ ...sp, mode: rawMode, category: category.id }} />;
}
