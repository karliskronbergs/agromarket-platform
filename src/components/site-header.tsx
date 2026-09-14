import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/[locale]/auth/actions";
import { IconMenu, IconClose } from "@/components/icons";

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const tLang = await getTranslations("Language");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const boundSignOut = signOut.bind(null, locale);

  const navLinks = (
    <>
      <Link href="/map">{t("map")}</Link>
      {user ? (
        <>
          <Link href="/dashboard">{t("dashboard")}</Link>
          <Link href="/dashboard/messages">{t("messages")}</Link>
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
            className="w-fit rounded-full bg-[#d9713a] px-4 py-2 text-white"
          >
            {t("createProfile")}
          </Link>
        </>
      )}
    </>
  );

  const langLinks = routing.locales.map((l) => (
    <Link
      key={l}
      href="/"
      locale={l}
      className={l === locale ? "font-semibold text-[#2b2a24]" : ""}
    >
      {tLang(l)}
    </Link>
  ));

  return (
    <header className="relative border-b border-[#e7e2d8] bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-sans text-lg font-bold text-[#2b2a24]">
          Agromarket
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-[#55503f] sm:flex">
          {navLinks}
          <span className="flex items-center gap-2 border-l border-[#e7e2d8] pl-5">
            {langLinks}
          </span>
        </nav>

        <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />
        <label
          htmlFor="mobile-nav-toggle"
          className="flex h-9 w-9 cursor-pointer items-center justify-center text-[#2b2a24] peer-checked:hidden sm:hidden"
        >
          <IconMenu className="h-6 w-6" />
        </label>
        <label
          htmlFor="mobile-nav-toggle"
          className="hidden h-9 w-9 cursor-pointer items-center justify-center text-[#2b2a24] peer-checked:flex sm:hidden"
        >
          <IconClose className="h-6 w-6" />
        </label>

        <nav className="absolute inset-x-0 top-full z-10 hidden flex-col gap-4 border-b border-[#e7e2d8] bg-white px-4 py-4 text-sm font-medium text-[#55503f] peer-checked:flex sm:hidden">
          {navLinks}
          <span className="flex items-center gap-3 border-t border-[#e7e2d8] pt-4">
            {langLinks}
          </span>
        </nav>
      </div>
    </header>
  );
}
