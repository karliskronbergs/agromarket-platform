import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ConfirmedPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-[#e7e2d8] bg-white p-8 text-center shadow-sm">
        <p className="text-[#2b2a24]">{t("emailConfirmed")}</p>
        <Link
          href="/auth/login"
          className="rounded-full bg-[#3f6b3f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2f5233]"
        >
          {t("signInCta")}
        </Link>
      </div>
    </div>
  );
}
