"use client";

import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";

// design_handoff_v2/Lauks24 Fluid.dc.html "navItems": the current page gets
// a persistent background highlight (rgba(255,255,255,.16)), not just the
// transient hover tint -- this needs the live pathname/mode, so it has to
// be a client component even though the rest of the header is server-only.
const baseClass =
  "rounded-full px-3 py-2 text-[15px] font-medium text-white transition hover:bg-white/[0.12] active:scale-[0.96]";

// Shared by the desktop nav and the mobile menu -- both need to know
// whether the current page is the map in "profiles" mode (Karte) or
// "sell"/"buy" mode (Sludinājumi), across both the query-param and the
// clean /map/[mode]/... URL forms.
export function useMapNavActive() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isMapRoute = pathname === "/map" || pathname.startsWith("/map/");
  const pathMode = pathname.match(/^\/map\/(sell|buy|profiles)(\/|$)/)?.[1];
  const queryMode = searchParams.get("mode");
  const effectiveMode = pathMode ?? (queryMode === "sell" || queryMode === "buy" ? queryMode : "profiles");

  return {
    isMapActive: isMapRoute && effectiveMode === "profiles",
    isListingsActive: isMapRoute && effectiveMode !== "profiles",
  };
}

export function SiteNavLinks({ mapLabel, listingsLabel }: { mapLabel: string; listingsLabel: string }) {
  const { isMapActive, isListingsActive } = useMapNavActive();

  return (
    <>
      <Link href="/map" className={`${baseClass} ${isMapActive ? "bg-white/[0.16]" : ""}`}>
        {mapLabel}
      </Link>
      <Link
        href={{ pathname: "/map", query: { mode: "sell" } }}
        className={`${baseClass} ${isListingsActive ? "bg-white/[0.16]" : ""}`}
      >
        {listingsLabel}
      </Link>
    </>
  );
}
