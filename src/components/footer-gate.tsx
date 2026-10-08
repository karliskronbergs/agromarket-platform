"use client";

import { usePathname } from "next/navigation";

// The map page is a full-height, no-scroll layout -- the footer has no
// room there and was never meant to show on it (same reason /map has no
// loading.tsx: it's deliberately exempt from the normal page chrome).
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMapPage = pathname?.split("/").filter(Boolean).at(1) === "map";
  if (isMapPage) return null;
  return <>{children}</>;
}
