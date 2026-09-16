import { getTranslations } from "next-intl/server";
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
      <Link href="/map">{t("map")}</Link>
      {user ? (
        <>
          <Link href="/dashboard">{t("dashboard")}</Link>
          <Link href="/dashboard/messages" className="relative inline-block">
            {t("messages")}
            {unreadCount > 0 && (
              <span className="absolute -right-3 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
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
