"use client";

import { usePathname } from "next/navigation";

// The map page is a full-height, no-scroll layout -- the footer has no
// room there and was never meant to show on it (same reason /map has no
// loading.tsx: it's deliberately exempt from the normal page chrome). On
// mobile widths the footer only ever appears on the home page in the
// prototype -- other pages are compact, app-like screens with a fixed
// bottom tab/action bar instead.
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = pathname?.split("/").filter(Boolean).at(1) ?? "";
  if (segment === "map") return null;
  return <div className={segment === "" ? "" : "hidden sm:block"}>{children}</div>;
}
