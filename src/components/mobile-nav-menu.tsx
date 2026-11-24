"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { springDefault, fadeTransition, usePrefersReducedMotion } from "@/lib/motion";
import { useMapNavActive } from "@/components/site-nav-links";

export function MobileNavMenu({
  loggedIn,
  unreadCount,
  signOutAction,
  labels,
}: {
  loggedIn: boolean;
  unreadCount: number;
  signOutAction: () => Promise<void>;
  labels: {
    map: string;
    listings: string;
    howItWorks: string;
    signIn: string;
    createProfile: string;
    messages: string;
    myProfile: string;
    signOut: string;
    menu: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const pathname = usePathname();
  const { isMapActive, isListingsActive } = useMapNavActive();
  const isSignInActive = pathname === "/auth/login";

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const itemClass = "rounded-xl px-3.5 py-3 text-base font-medium text-[#1d2329]";
  // design_handoff_v2/Lauks24 Fluid.dc.html "menuItems": the current page
  // is bold + green here, not a background tint like the desktop nav.
  const activeItemClass = "rounded-xl px-3.5 py-3 text-base font-semibold text-[#2f5538]";

  return (
    <>
      <button
        type="button"
        aria-label={labels.menu}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="-mr-2 flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-[5px] rounded-full"
      >
        <span className="h-[2px] w-[18px] rounded-sm bg-white" />
        <span className="h-[2px] w-[18px] rounded-sm bg-white" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[2500]"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
            />
            <motion.div
              ref={menuRef}
              style={{ transformOrigin: "calc(100% - 20px) 0" }}
              className="fixed right-3 top-[60px] z-[2501] flex w-[min(280px,calc(100%-24px))] flex-col gap-0.5 rounded-[20px] bg-white/90 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_16px_48px_rgba(20,26,32,0.22)] backdrop-blur-[24px] backdrop-saturate-[1.8]"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              transition={reducedMotion ? fadeTransition : springDefault}
            >
            <Link href="/map" onClick={() => setOpen(false)} className={isMapActive ? activeItemClass : itemClass}>
              {labels.map}
            </Link>
            <Link
              href={{ pathname: "/map", query: { mode: "sell" } }}
              onClick={() => setOpen(false)}
              className={isListingsActive ? activeItemClass : itemClass}
            >
              {labels.listings}
            </Link>
            <Link href="/#how" onClick={() => setOpen(false)} className={itemClass}>
              {labels.howItWorks}
            </Link>

            {loggedIn ? (
              <>
                <div className="my-1 h-px bg-[#e3e6e8]" />
                <Link href="/dashboard" onClick={() => setOpen(false)} className={itemClass}>
                  {labels.myProfile}
                </Link>
                <Link
                  href="/dashboard/messages"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between gap-2 ${itemClass}`}
                >
                  <span>{labels.messages}</span>
                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <form action={signOutAction}>
                  <button type="submit" className={`w-full text-left text-[#5d6670] ${itemClass}`}>
                    {labels.signOut}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className={isSignInActive ? activeItemClass : itemClass}
                >
                  {labels.signIn}
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setOpen(false)}
                  className="mt-1.5 rounded-xl bg-[#3f6e4a] py-3.5 text-center text-base font-semibold text-white"
                >
                  {labels.createProfile}
                </Link>
              </>
            )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
