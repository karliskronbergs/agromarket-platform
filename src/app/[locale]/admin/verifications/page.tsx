import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { VerificationActions } from "./verification-actions";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Admin");
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("profiles")
    .select("id, business_name, slug, verification_requested_at")
    .eq("verified", false)
    .not("verification_requested_at", "is", null)
    .order("verification_requested_at", { ascending: true });

  return (
    <div className="flex flex-col gap-3">
      {(!requests || requests.length === 0) && (
        <p className="text-sm text-[#55503f]">{t("noVerifications")}</p>
      )}
      {(requests ?? []).map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-[#e7e2d8] bg-white p-4"
        >
          <div>
            <div className="font-semibold text-[#2b2a24]">{r.business_name}</div>
            <div className="text-xs text-[#7a7566]">
              {new Date(r.verification_requested_at!).toLocaleString()}
            </div>
          </div>
          <VerificationActions locale={locale} profileId={r.id} />
        </div>
      ))}
    </div>
  );
}
