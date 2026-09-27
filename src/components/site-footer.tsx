import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-[#e7e2d8] bg-white px-4 py-6 text-sm text-[#7a7566] sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
        <span>{t("rights", { year: new Date().getFullYear() })}</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="transition hover:text-[#3f6b3f]">
            {t("privacyPolicy")}
          </Link>
          <Link href="/terms" className="transition hover:text-[#3f6b3f]">
            {t("terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
