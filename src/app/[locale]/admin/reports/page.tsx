import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ReportActions } from "./report-actions";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Admin");
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, target_type, target_id, reason, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: true });

  const profileIds = (reports ?? [])
    .filter((r) => r.target_type === "profile")
    .map((r) => r.target_id);
  const listingIds = (reports ?? [])
    .filter((r) => r.target_type === "listing")
    .map((r) => r.target_id);

  const [{ data: profiles }, { data: listings }] = await Promise.all([
    profileIds.length
      ? supabase.from("profiles").select("id, business_name").in("id", profileIds)
      : Promise.resolve({ data: [] as { id: string; business_name: string }[] }),
    listingIds.length
      ? supabase.from("listings").select("id, title").in("id", listingIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p.business_name]));
  const listingById = new Map((listings ?? []).map((l) => [l.id, l.title]));

  return (
    <div className="flex flex-col gap-3">
      {(!reports || reports.length === 0) && (
        <p className="text-sm text-[#55503f]">{t("noReports")}</p>
      )}
      {(reports ?? []).map((r) => {
        const targetLabel =
          r.target_type === "profile"
            ? (profileById.get(r.target_id) ?? t("unknownTarget"))
            : (listingById.get(r.target_id) ?? t("unknownTarget"));

        return (
          <div key={r.id} className="flex flex-col gap-2 rounded-xl border border-[#e7e2d8] bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7566]">
              {r.target_type === "profile" ? t("profileLabel") : t("listingLabel")}: {targetLabel}
            </div>
            <p className="text-sm text-[#2b2a24]">{r.reason}</p>
            <ReportActions
              locale={locale}
              reportId={r.id}
              targetType={r.target_type}
              targetId={r.target_id}
            />
          </div>
        );
      })}
    </div>
  );
}
