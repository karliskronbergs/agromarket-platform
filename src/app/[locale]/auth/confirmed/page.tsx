import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ConfirmedPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-[#e3e6e8] bg-white p-8 text-center">
        <p className="text-[#1d2329]">{t("emailConfirmed")}</p>
        <Link
          href="/auth/login"
          className="rounded-[10px] bg-[#3f6e4a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#355d3e]"
        >
          {t("signInCta")}
        </Link>
      </div>
    </div>
  );
}
