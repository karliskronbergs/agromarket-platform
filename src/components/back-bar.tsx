"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { IconChevronLeft } from "@/components/icons";

const noSubscription = () => () => {};

function resolveLabel(href: string, labels: { map: string; listings: string; home: string }): string {
  let url: URL;
  try {
    url = new URL(href, "http://x");
  } catch {
    return labels.home;
  }
  const segments = url.pathname.split("/").filter(Boolean);
  // segments[0] is the locale; segments[1] (if any) is the route.
  if (segments.length <= 1) return labels.home;
  if (segments[1] !== "map") return labels.home;
  const mode = url.searchParams.get("mode");
  return !mode || mode === "profiles" ? labels.map : labels.listings;
}

/**
 * design_handoff_v2/FLUID.md "Back navigation": a sticky glass bar on
 * listing/profile pages with a pill showing where the user came from
 * (Karte / Sludinājumi / Sākums). The destination is whichever list page
 * (home or map, with its full filter/search/view state) was last visited,
 * remembered via RememberListContext / MapView -- falling back to a
 * sensible default when the page was opened directly (shared link, etc).
 */
export function BackBar({
  fallbackHref,
  fallbackLabel,
  labels,
}: {
  fallbackHref: string;
  fallbackLabel: string;
  labels: { map: string; listings: string; home: string };
}) {
  // Read once on mount, client-only -- getServerSnapshot returns null so
  // the server/first-client-paint markup matches (sessionStorage doesn't
  // exist on the server), avoiding a hydration mismatch.
  const stored = useSyncExternalStore(
    noSubscription,
    () => sessionStorage.getItem("lastListHref"),
    () => null,
  );

  const href = stored ?? fallbackHref;
  const label = stored ? resolveLabel(stored, labels) : fallbackLabel;

  return (
    <div className="sticky top-14 z-[900] border-b border-black/[0.06] bg-white/80 backdrop-blur-[20px] backdrop-saturate-[1.8] sm:top-[65px]">
      <div className="mx-auto max-w-[1328px] px-2.5 py-2 sm:px-6">
        <Link
          href={href}
          className="inline-flex items-center gap-1 rounded-full py-1.5 pl-2 pr-3.5 text-sm font-medium text-[#3f6e4a] hover:bg-[#eef3ee]"
        >
          <IconChevronLeft className="h-4 w-4" />
          {label}
        </Link>
      </div>
    </div>
  );
}
