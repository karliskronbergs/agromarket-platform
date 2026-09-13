import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agromarket-platform-three.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: profiles }, { data: listings }] = await Promise.all([
    supabase.from("profiles").select("slug").eq("status", "active").limit(500),
    supabase.from("listings").select("id").eq("status", "active").limit(500),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({ url: `${SITE_URL}/${locale}`, changeFrequency: "weekly" });
    entries.push({ url: `${SITE_URL}/${locale}/map`, changeFrequency: "daily" });
    for (const p of profiles ?? []) {
      entries.push({ url: `${SITE_URL}/${locale}/profiles/${p.slug}`, changeFrequency: "weekly" });
    }
    for (const l of listings ?? []) {
      entries.push({ url: `${SITE_URL}/${locale}/listings/${l.id}`, changeFrequency: "weekly" });
    }
  }

  return entries;
}
