import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/[locale]/auth/actions";

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const tLang = await getTranslations("Language");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const boundSignOut = signOut.bind(null, locale);

  return (
    <header className="flex items-center justify-between border-b border-[#e7e2d8] bg-white px-6 py-4">
      <Link href="/" className="font-sans text-lg font-bold text-[#2b2a24]">
        Agromarket
      </Link>
      <nav className="flex items-center gap-5 text-sm font-medium text-[#55503f]">
        <Link href="/map">{t("map")}</Link>
        {user ? (
          <>
            <Link href="/dashboard">{t("dashboard")}</Link>
            <form action={boundSignOut}>
              <button type="submit" className="cursor-pointer">
                {t("signOut")}
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/auth/login">{t("signIn")}</Link>
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-[#d9713a] px-4 py-2 text-white"
            >
              {t("createProfile")}
            </Link>
          </>
        )}
        <span className="flex items-center gap-2 border-l border-[#e7e2d8] pl-5">
          {routing.locales.map((l) => (
            <Link
              key={l}
              href="/"
              locale={l}
              className={l === locale ? "font-semibold text-[#2b2a24]" : ""}
            >
              {tLang(l)}
            </Link>
          ))}
        </span>
      </nav>
    </header>
  );
}
