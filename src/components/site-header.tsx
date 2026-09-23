import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/[locale]/auth/actions";
import { MobileNav } from "@/components/mobile-nav";

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
  if (user) {
    const { data: convos } = await supabase
      .from("conversations")
      .select("id")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`);
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

  const navLinks = (
    <>
      <Link href="/map" className="transition hover:opacity-70">
        {t("map")}
      </Link>
      {user ? (
        <>
          <Link href="/dashboard" className="transition hover:opacity-70">
            {t("dashboard")}
          </Link>
          <Link href="/dashboard/messages" className="relative inline-block transition hover:opacity-70">
            {t("messages")}
            {unreadCount > 0 && (
              <span className="absolute -right-3 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <form action={boundSignOut}>
            <button type="submit" className="cursor-pointer transition hover:opacity-70">
              {t("signOut")}
            </button>
          </form>
        </>
      ) : (
        <>
          <Link href="/auth/login" className="transition hover:opacity-70">
            {t("signIn")}
          </Link>
          <Link
            href="/auth/sign-up"
            className="w-fit rounded-full bg-[#d9713a] px-4 py-2 text-white transition hover:bg-[#c15f2c]"
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
      className={
        l === locale
          ? "font-semibold underline underline-offset-4"
          : "opacity-70 transition hover:opacity-100"
      }
    >
      {tLang(l)}
    </Link>
  ));

  return (
    <header className="relative border-b border-[#2f4359] bg-[#3b5168] px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center font-sans text-lg font-bold text-white">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Agromarket"
              width={140}
              height={36}
              className="h-9 w-auto"
              priority
            />
          ) : (
            "Agromarket"
          )}
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-[#cfd8e3] sm:flex">
          {navLinks}
          <span className="flex items-center gap-2 border-l border-white/20 pl-5">
            {langLinks}
          </span>
        </nav>

        <MobileNav>
          {navLinks}
          <span className="flex items-center gap-3 border-t border-[#e7e2d8] pt-4">
            {langLinks}
          </span>
        </MobileNav>
      </div>
    </header>
  );
}
