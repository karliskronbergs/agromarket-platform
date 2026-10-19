"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Vercel's edge can occasionally serve a stale 404 for a route that genuinely
// exists, right after a cold start (seen on mobile opening the site after it
// sat idle a while). A plain reload always fixes it, so do that once,
// automatically. The sessionStorage guard makes sure a genuinely missing page
// only retries once per tab instead of reloading forever.
export default function NotFound() {
  const t = useTranslations("NotFound");

  useEffect(() => {
    try {
      const key = `nf-retry:${window.location.pathname}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    } catch {
      // sessionStorage unavailable (e.g. private browsing) — nothing to retry
    }
  }, []);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#8a929a]">404</p>
      <h1 className="text-2xl font-semibold text-[#1d2329]">{t("title")}</h1>
      <p className="text-[15px] text-[#5d6670]">{t("body")}</p>
      <Link
        href="/"
        className="mt-2 rounded-[10px] bg-[#3f6e4a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#345a3d]"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
