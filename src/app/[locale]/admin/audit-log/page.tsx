import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  const t = await getTranslations("Admin");
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("admin_audit_log")
    .select("id, action, target_type, target_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-2">
      {(!logs || logs.length === 0) && <p className="text-sm text-[#55503f]">{t("noLogs")}</p>}
      {(logs ?? []).map((l) => (
        <div
          key={l.id}
          className="flex items-center justify-between rounded-lg border border-[#e7e2d8] bg-white p-3 text-sm"
        >
          <span className="font-medium text-[#2b2a24]">{l.action}</span>
          <span className="text-xs text-[#7a7566]">
            {l.target_type ? `${l.target_type} · ` : ""}
            {new Date(l.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
