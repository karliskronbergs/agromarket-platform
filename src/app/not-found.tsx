"use client";

import { useEffect } from "react";
import Link from "next/link";

// Fallback for 404s outside the [locale] segment (e.g. a route that doesn't
// match any locale at all). Same stale-edge-response workaround as
// src/app/[locale]/not-found.tsx — see that file for why this retries once.
export default function NotFound() {
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
    <html lang="lv">
      <body className="flex min-h-screen items-center justify-center bg-[#f6f7f5] px-6 text-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#8a929a]">404</p>
          <h1 className="text-2xl font-semibold text-[#1d2329]">Lapa nav atrasta / Page not found</h1>
          <Link
            href="/"
            className="mt-2 rounded-[10px] bg-[#3f6e4a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#345a3d]"
          >
            Uz sākumu / Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
