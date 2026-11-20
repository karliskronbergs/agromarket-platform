import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agromarket-platform-three.vercel.app";

const MAP_MODES = ["sell", "buy", "profiles"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: profiles }, { data: listings }, { data: rootCategories }] = await Promise.all([
    supabase.from("profiles").select("slug").eq("status", "active").limit(500),
    supabase
      .from("listings")
      .select("id")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .limit(500),
    supabase.from("categories").select("slug").is("parent_id", null),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({ url: `${SITE_URL}/${locale}`, changeFrequency: "weekly" });
    entries.push({ url: `${SITE_URL}/${locale}/map`, changeFrequency: "daily" });
    // design_handoff_v2/FLUID.md "3b": each root category's clean URL,
    // for every mode -- these are the pages the category SEO copy lives on.
    for (const c of rootCategories ?? []) {
      for (const mode of MAP_MODES) {
        entries.push({ url: `${SITE_URL}/${locale}/map/${mode}/${c.slug}`, changeFrequency: "daily" });
      }
    }
    for (const p of profiles ?? []) {
      entries.push({ url: `${SITE_URL}/${locale}/profiles/${p.slug}`, changeFrequency: "weekly" });
    }
    for (const l of listings ?? []) {
      entries.push({ url: `${SITE_URL}/${locale}/listings/${l.id}`, changeFrequency: "weekly" });
    }
  }

  return entries;
}
