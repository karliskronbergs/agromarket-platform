import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { buildCategoryTree, getSelfAndDescendantIds } from "@/lib/categories";
import { DailyBarChart, HorizontalBarList, type DayCount } from "./bar-chart";

export const dynamic = "force-dynamic";

const CHART_DAYS = 30;

function bucketByDay(timestamps: string[], days: number): DayCount[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const ts of timestamps) {
    const day = ts.slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Admin");
  const supabase = await createClient();

  const now = new Date();
  const since30d = new Date(now.getTime() - CHART_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: activeProfilesCount },
    { count: activeListingsCount },
    { count: newProfilesWeekCount },
    { count: messagesCount },
    { count: openReportsCount },
    { data: viewCounts },
    { data: profileViewEvents },
    { data: listingViewEvents },
    { data: newProfileEvents },
    { data: topProfiles },
    { data: categories },
    { data: activeListingCategoryIds },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since7d),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("profiles").select("view_count, listing_view_count"),
    supabase.from("profile_views").select("viewed_at").gte("viewed_at", since30d),
    supabase.from("listing_views").select("viewed_at").gte("viewed_at", since30d),
    supabase.from("profiles").select("created_at").gte("created_at", since30d),
    supabase
      .from("profiles")
      .select("business_name, view_count, listing_view_count")
      .order("view_count", { ascending: false })
      .limit(8),
    supabase.from("categories").select("id, slug, name_lv, name_en, parent_id"),
    supabase.from("listings").select("category_id").eq("status", "active"),
  ]);

  const totalViews = (viewCounts ?? []).reduce(
    (sum, p) => sum + (p.view_count ?? 0) + (p.listing_view_count ?? 0),
    0,
  );

  const viewsChartData = bucketByDay(
    [
      ...(profileViewEvents ?? []).map((v) => v.viewed_at as string),
      ...(listingViewEvents ?? []).map((v) => v.viewed_at as string),
    ],
    CHART_DAYS,
  );

  const signupsChartData = bucketByDay(
    (newProfileEvents ?? []).map((p) => p.created_at as string),
    CHART_DAYS,
  );

  const topProfilesList = (topProfiles ?? [])
    .map((p) => ({
      label: p.business_name as string,
      value: (p.view_count ?? 0) + (p.listing_view_count ?? 0),
    }))
    .filter((p) => p.value > 0);

  const categoryTree = buildCategoryTree(categories ?? []);
  const topLevelCategories = categoryTree;
  const listingCategoryIds = (activeListingCategoryIds ?? []).map((l) => l.category_id as string);
  const categoryBreakdown = topLevelCategories
    .map((cat) => {
      const descendantIds = new Set(getSelfAndDescendantIds(categories ?? [], cat.id));
      const count = listingCategoryIds.filter((id) => descendantIds.has(id)).length;
      return { label: locale === "lv" ? cat.name_lv : cat.name_en, value: count };
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label={t("statActiveProfiles")} value={activeProfilesCount ?? 0} />
        <StatCard label={t("statActiveListings")} value={activeListingsCount ?? 0} />
        <StatCard label={t("statTotalViews")} value={totalViews} />
        <StatCard label={t("statNewProfilesWeek")} value={newProfilesWeekCount ?? 0} />
        <StatCard label={t("statMessages")} value={messagesCount ?? 0} />
        <StatCard label={t("statOpenReports")} value={openReportsCount ?? 0} />
      </div>

      <ChartSection title={t("chartViews30d")}>
        <DailyBarChart data={viewsChartData} color="#3f6b3f" />
      </ChartSection>

      <ChartSection title={t("chartSignups30d")}>
        <DailyBarChart data={signupsChartData} color="#d9713a" />
      </ChartSection>

      <ChartSection title={t("topProfiles")}>
        {topProfilesList.length > 0 ? (
          <HorizontalBarList items={topProfilesList} />
        ) : (
          <p className="text-sm text-[#7a7566]">{t("noViewsYet")}</p>
        )}
      </ChartSection>

      <ChartSection title={t("listingsByCategory")}>
        {categoryBreakdown.length > 0 ? (
          <HorizontalBarList items={categoryBreakdown} />
        ) : (
          <p className="text-sm text-[#7a7566]">{t("noProfiles")}</p>
        )}
      </ChartSection>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[#e7e2d8] bg-white p-4">
      <span className="font-sans text-2xl font-semibold text-[#2b2a24]">{value}</span>
      <span className="text-xs text-[#7a7566]">{label}</span>
    </div>
  );
}

function ChartSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#e7e2d8] bg-white p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[#7a7566]">{title}</h2>
      {children}
    </div>
  );
}
