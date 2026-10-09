"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/app/[locale]/auth/actions";

type NavId = "overview" | "listings" | "profile" | "account";

export function DashboardShell({
  locale,
  name,
  email,
  avatarUrl,
  listingsCount,
  signOutLabel,
  nav,
  children,
}: {
  locale: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  listingsCount: number;
  signOutLabel: string;
  nav: { id: NavId; label: string; href: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] is the locale, segments[1] is "dashboard", segments[2] (if any) is the sub-section.
  const section = segments[2];
  const active: NavId =
    section === "listings" ? "listings" : section === "profile" ? "profile" : section === "account" ? "account" : "overview";

  const initials = (name || "?").slice(0, 1).toUpperCase();
  const boundSignOut = signOut.bind(null, locale);

  return (
    <>
      {/* Mobile: sticky horizontally-scrolling pill sub-nav */}
      <div className="sticky top-14 z-40 flex gap-1.5 overflow-x-auto border-b border-[#e3e6e8] bg-white px-3 py-2.5 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
        {nav.map((n) => {
          const on = n.id === active;
          return (
            <Link
              key={n.id}
              href={n.href}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                on ? "bg-[#3b5166] text-white" : "bg-[#f0f2f0] text-[#1d2329]"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </div>

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-start gap-8 px-4 pb-[104px] pt-4 sm:px-6 sm:pb-[72px] sm:pt-8">
        {/* Desktop sidebar */}
        <aside className="sticky top-24 hidden w-[232px] flex-shrink-0 flex-col gap-1 sm:flex">
          <div className="flex items-center gap-3 px-2 pb-[18px]">
            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-[#e4eaf0]">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill sizes="44px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-semibold text-[#3b5166]">
                  {initials}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold text-[#1d2329]">{name}</div>
              <div className="truncate text-xs text-[#5d6670]">{email}</div>
            </div>
          </div>

          {nav.map((n) => {
            const on = n.id === active;
            return (
              <Link
                key={n.id}
                href={n.href}
                className={`flex items-center justify-between rounded-[10px] px-3.5 py-[11px] text-[15px] font-medium transition hover:bg-white ${
                  on ? "bg-white text-[#1d2329] shadow-[0_1px_3px_rgba(29,35,41,0.08)]" : "text-[#4a535b]"
                }`}
              >
                <span>{n.label}</span>
                {n.id === "listings" && <span className="text-[13px] text-[#5d6670]">{listingsCount}</span>}
              </Link>
            );
          })}

          <div className="mx-2 my-3 h-px bg-[#e3e6e8]" />

          <form action={boundSignOut}>
            <button
              type="submit"
              className="w-full rounded-[10px] px-3.5 py-[11px] text-left text-[15px] font-medium text-[#5d6670] transition hover:bg-white"
            >
              {signOutLabel}
            </button>
          </form>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-5">{children}</main>
      </div>
    </>
  );
}
