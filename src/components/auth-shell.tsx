import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function AuthShell({
  mode,
  title,
  subtitle,
  children,
}: {
  mode: "login" | "signup";
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations("Auth");
  const supabase = await createClient();
  const { data: logoSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "logo_url")
    .maybeSingle();
  const logoUrl = logoSetting?.value ?? null;

  const features = [
    { title: t("feature1Title"), body: t("feature1Body"), mobile: t("feature1Mobile") },
    { title: t("feature2Title"), body: t("feature2Body"), mobile: t("feature2Mobile") },
    { title: t("feature3Title"), body: t("feature3Body"), mobile: t("feature3Mobile") },
  ];

  const tabClass = (active: boolean) =>
    `rounded-[9px] py-2.5 text-center text-[15px] font-medium transition sm:px-[18px] sm:py-2 ${
      active ? "bg-white text-[#1d2329] shadow-sm" : "text-[#5d6670]"
    }`;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-12">
      <div className="w-full max-w-[1040px] overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white sm:rounded-[24px] sm:[grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))] sm:grid">
        <div className="flex flex-col gap-[18px] p-5 sm:p-10">
          <div className="grid grid-cols-2 gap-0.5 self-start rounded-xl bg-[#e9ebe8] p-1 sm:flex sm:w-fit sm:gap-0.5 sm:bg-[#f0f2f0]">
            <Link href="/auth/login" className={tabClass(mode === "login")}>
              {t("signInCta")}
            </Link>
            <Link href="/auth/sign-up" className={tabClass(mode === "signup")}>
              {t("signUpCta")}
            </Link>
          </div>

          <div>
            <h1 className="m-0 mb-1.5 text-[26px] font-semibold tracking-[-0.01em] text-[#1d2329] sm:text-[28px]">
              {title}
            </h1>
            <p className="m-0 text-[15px] text-[#5d6670]">{subtitle}</p>
          </div>

          {children}

          {mode === "signup" && (
            <div className="flex flex-col gap-3 rounded-2xl bg-[#3b5166] p-[18px] text-white sm:hidden">
              <div className="text-[15px] font-semibold">{t("featuresTitle")}</div>
              {features.map((f, i) => (
                <div key={i} className="flex gap-2.5 text-sm leading-[1.4]">
                  <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md bg-white/15 text-xs font-semibold">
                    {i + 1}
                  </span>
                  {f.mobile}
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-[#5d6670]">
            {mode === "login" ? (
              <>
                {t("noAccount")} <Link href="/auth/sign-up" className="font-medium text-[#3f6e4a]">{t("signUpCta")}</Link>
              </>
            ) : (
              <>
                {t("haveAccount")} <Link href="/auth/login" className="font-medium text-[#3f6e4a]">{t("signInCta")}</Link>
              </>
            )}
          </p>
        </div>

        <div className="hidden flex-col gap-6 bg-[#3b5166] p-10 text-white sm:flex">
          {logoUrl ? (
            <Image src={logoUrl} alt="lauks24.lv" width={140} height={30} className="h-[30px] w-auto self-start" />
          ) : (
            <span className="self-start text-lg font-bold text-white">lauks24.lv</span>
          )}
          <h2 className="m-0 text-balance text-2xl font-semibold leading-[1.25]">{t("featuresTitle")}</h2>
          <div className="flex flex-col gap-[18px]">
            {features.map((f, i) => (
              <div key={i} className="flex gap-3.5">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 text-[13px] font-semibold">
                  {i + 1}
                </span>
                <div>
                  <div className="mb-0.5 font-semibold">{f.title}</div>
                  <div className="text-sm leading-[1.5] text-[#d6dee6]">{f.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
