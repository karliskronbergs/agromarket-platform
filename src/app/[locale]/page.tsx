import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-[#faf8f3] px-6 text-center">
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
  );
}
