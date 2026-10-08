import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const supabase = await createClient();
  const { data: logoSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "logo_url")
    .maybeSingle();
  const logoUrl = logoSetting?.value ?? null;

  return (
    <footer className="bg-[#2f4254] text-[#d6dee6]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-11 pb-7 sm:px-6">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="flex max-w-[340px] flex-col gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt="lauks24.lv" width={120} height={26} className="h-[26px] w-auto self-start" />
            ) : (
              <span className="font-sans text-base font-bold text-white">lauks24.lv</span>
            )}
            <p className="m-0 text-sm leading-relaxed">{t("tagline")}</p>
          </div>
          <div className="flex flex-wrap gap-14 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-white">{t("platform")}</span>
              <Link href="/map" className="transition hover:text-white">
                {tNav("map")}
              </Link>
              <Link href={{ pathname: "/map", query: { mode: "sell" } }} className="transition hover:text-white">
                {tNav("listings")}
              </Link>
              <Link href="/auth/sign-up" className="transition hover:text-white">
                {tNav("createProfile")}
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-white">{t("information")}</span>
              <Link href="/privacy" className="transition hover:text-white">
                {t("privacyPolicy")}
              </Link>
              <Link href="/terms" className="transition hover:text-white">
                {t("terms")}
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/12 pt-5 text-[13px] text-[#aebccb]">
          {t("rights", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
