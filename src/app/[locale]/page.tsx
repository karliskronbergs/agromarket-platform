import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations("Home");
  const tLang = useTranslations("Language");

  return (
    <div className="flex flex-1 flex-col bg-[#faf8f3]">
      <header className="flex items-center justify-end gap-3 px-6 py-4 text-sm">
        {routing.locales.map((locale) => (
          <Link
            key={locale}
            href="/"
            locale={locale}
            className="rounded-full px-3 py-1 font-medium text-[#55503f] hover:bg-[#f1efe6]"
          >
            {tLang(locale)}
          </Link>
        ))}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="max-w-2xl font-sans text-3xl font-semibold tracking-tight text-[#2b2a24] sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-[#55503f]">{t("subtitle")}</p>
        <Link
          href="/map"
          className="rounded-full bg-[#3f6b3f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2f5233]"
        >
          {t("cta")}
        </Link>
      </main>
    </div>
  );
}
