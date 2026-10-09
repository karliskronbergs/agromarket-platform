import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { requestVerification, deleteProfile } from "../profile/actions";
import { ConfirmButton } from "@/components/confirm-button";
import { SignOutButton } from "./sign-out-button";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Dashboard");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("verified, verification_requested_at")
    .eq("user_id", user!.id)
    .maybeSingle();

  const verified = !!profile?.verified;
  const pending = !!profile?.verification_requested_at;
  const boundRequestVerification = requestVerification.bind(null, locale);
  const boundDeleteProfile = deleteProfile.bind(null, locale);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em] text-[#1d2329] sm:text-[30px]">
        {t("accountTitle")}
      </h1>

      <div className="overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white">
        <div className="border-b border-[#eef0f1] p-5 sm:p-6">
          <div className="mb-0.5 text-[15px] font-semibold text-[#1d2329]">{t("accountEmail")}</div>
          <div className="text-sm text-[#5d6670]">{user!.email}</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eef0f1] p-5 sm:p-6">
          <div>
            <div className="mb-0.5 text-[15px] font-semibold text-[#1d2329]">{t("accountPassword")}</div>
            <div className="text-sm text-[#5d6670]">••••••••</div>
          </div>
          <Link
            href="/auth/forgot-password"
            className="rounded-[9px] border border-[#d9dee2] px-3.5 py-2 text-sm font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
          >
            {t("accountChangePassword")}
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-[220px] flex-1">
            <div className="mb-0.5 text-[15px] font-semibold text-[#1d2329]">{t("accountVerification")}</div>
            <div className="text-sm leading-[1.5] text-[#5d6670]">
              {verified ? t("accountVerifiedStatus") : pending ? t("accountPendingStatus") : t("accountUnverifiedStatus")}
            </div>
          </div>
          {!verified && !pending && (
            <form action={boundRequestVerification}>
              <button
                type="submit"
                className="rounded-[9px] border border-[#3f6e4a] px-3.5 py-2 text-sm font-semibold text-[#2f5538] transition hover:bg-[#eef3ee]"
              >
                {t("requestVerification")}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#f0d4d1] bg-white p-5 sm:p-6">
        <div className="min-w-[220px] flex-1">
          <div className="mb-0.5 text-[15px] font-semibold text-[#b3261e]">{t("deleteProfileHeading")}</div>
          <div className="text-sm leading-[1.5] text-[#5d6670]">{t("deleteProfileText")}</div>
        </div>
        <ConfirmButton
          action={boundDeleteProfile}
          title={t("deleteProfileTitle")}
          text={t("deleteProfileText")}
          cta={t("deleteProfileCta")}
          cancelLabel={t("modalCancel")}
          triggerClassName="flex-shrink-0 rounded-[9px] border border-[#e3b5b0] bg-white px-3.5 py-2 text-sm font-semibold text-[#b3261e] transition hover:bg-[#fdf3f2]"
          triggerLabel={t("deleteProfileHeading")}
        />
      </div>

      <SignOutButton locale={locale} label={t("signOut")} />
    </div>
  );
}
