import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/[locale]/auth/actions";
import { MobileNav } from "@/components/mobile-nav";

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const tLang = await getTranslations("Language");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: logoSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "logo_url")
    .maybeSingle();
  const logoUrl = logoSetting?.value ?? null;

  const boundSignOut = signOut.bind(null, locale);

  let unreadCount = 0;
  let businessName: string | null = null;
  if (user) {
    const [{ data: convos }, { data: profile }] = await Promise.all([
      supabase
        .from("conversations")
        .select("id")
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`),
      supabase.from("profiles").select("business_name").eq("user_id", user.id).maybeSingle(),
    ]);
    businessName = profile?.business_name ?? null;

    const conversationIds = (convos ?? []).map((c) => c.id);
    if (conversationIds.length > 0) {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", user.id)
        .is("read_at", null);
      unreadCount = count ?? 0;
    }
  }

  const navItemClass = "rounded-lg px-3 py-2 text-[15px] font-medium text-white transition hover:bg-white/10";

  const navLinks = (
    <>
      <Link href="/map" className={navItemClass}>
        {t("map")}
      </Link>
      <Link href={{ pathname: "/map", query: { mode: "sell" } }} className={navItemClass}>
        {t("listings")}
      </Link>
      <Link href="/#how" className={navItemClass}>
        {t("howItWorks")}
      </Link>
    </>
  );

  const langLinks = routing.locales.map((l) => (
    <Link
      key={l}
      href="/"
      locale={l}
      className={`px-1.5 py-1 text-sm ${
        l === locale
          ? "border-b-2 border-white font-semibold text-white"
          : "text-white/75 transition hover:text-white"
      }`}
    >
      {tLang(l)}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-[2000] bg-[#3b5166] shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex min-h-11 max-w-[1280px] flex-wrap items-center gap-5 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="lauks24.lv"
              width={140}
              height={30}
              className="h-[30px] w-auto"
              priority
            />
          ) : (
            <span className="font-sans text-lg font-bold text-white">lauks24.lv</span>
          )}
        </Link>

        <nav className="hidden flex-1 items-center gap-1 sm:flex">{navLinks}</nav>

        <div className="hidden items-center gap-1.5 text-sm sm:flex">{langLinks}</div>

        {user ? (
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/dashboard/messages" className={`relative inline-block ${navItemClass}`}>
              {t("messages")}
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full bg-white/12 py-[5px] pl-[5px] pr-3 transition hover:bg-white/20"
            >
              <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#3b5166]">
                {businessName ? initialsFor(businessName) : "?"}
              </span>
              <span className="text-sm font-medium text-white">{t("myProfile")}</span>
            </Link>
            <form action={boundSignOut}>
              <button type="submit" className={`cursor-pointer ${navItemClass}`}>
                {t("signOut")}
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/auth/login" className={navItemClass}>
              {t("signIn")}
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg bg-white px-4 py-2.5 text-[15px] font-semibold text-[#3b5166] transition hover:bg-[#e9eef3]"
            >
              {t("createProfile")}
            </Link>
          </div>
        )}

        <MobileNav>
          {navLinks}
          {user ? (
            <>
              <Link href="/dashboard/messages" className="relative inline-block text-[#2b2a24]">
                {t("messages")}
                {unreadCount > 0 && (
                  <span className="absolute -right-3 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/dashboard" className="text-[#2b2a24]">
                {t("myProfile")}
              </Link>
              <form action={boundSignOut}>
                <button type="submit" className="cursor-pointer text-[#2b2a24]">
                  {t("signOut")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-[#2b2a24]">
                {t("signIn")}
              </Link>
              <Link
                href="/auth/sign-up"
                className="w-fit rounded-lg bg-[#3b5166] px-4 py-2 text-white"
              >
                {t("createProfile")}
              </Link>
            </>
          )}
          <span className="flex items-center gap-3 border-t border-[#e7e2d8] pt-4">
            {routing.locales.map((l) => (
              <Link
                key={l}
                href="/"
                locale={l}
                className={l === locale ? "font-semibold text-[#2b2a24]" : "text-[#7a7566]"}
              >
                {tLang(l)}
              </Link>
            ))}
          </span>
        </MobileNav>
      </div>
    </header>
  );
}
