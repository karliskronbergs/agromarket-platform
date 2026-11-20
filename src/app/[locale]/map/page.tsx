import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MapPageBody, buildMapMetadata, resolveMode, type MapFilters } from "./shared";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<MapFilters>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { mode: rawMode, category } = await searchParams;
  const mode = resolveMode(rawMode);

  const query = new URLSearchParams();
  if (rawMode) query.set("mode", rawMode);
  if (category) query.set("category", category);
  const queryString = query.toString();
  const pathAndQuery = `/map${queryString ? `?${queryString}` : ""}`;

  return buildMapMetadata(locale, mode, category, pathAndQuery);
}

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<MapFilters>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  const { mode: rawMode, category } = filters;
  const mode = resolveMode(rawMode);

  // design_handoff_v2/FLUID.md "3b": root categories get a clean, crawlable
  // URL (/map/[mode]/[categorySlug]). Permanently redirect the old
  // query-param form there for them, preserving every other filter as a
  // query param on the new path. Subcategories (parent_id set) don't get
  // their own URL -- they stay on this query-param page, same as today.
  if (category) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("slug, parent_id")
      .eq("id", category)
      .maybeSingle();

    if (data && !data.parent_id) {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (key !== "mode" && key !== "category" && value) qs.set(key, value);
      }
      const queryString = qs.toString();
      permanentRedirect(`/${locale}/map/${mode}/${data.slug}${queryString ? `?${queryString}` : ""}`);
    }
  }

  return <MapPageBody locale={locale} filters={filters} />;
}
