"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

type TabId = "home" | "map" | "list" | "me";

export function MobileTabBarClient({
  loggedIn,
  labels,
}: {
  loggedIn: boolean;
  labels: { home: string; map: string; listings: string; profile: string; login: string };
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const segment = pathname?.split("/").filter(Boolean)[1] ?? "";

  const visible = segment === "" || segment === "map";
  if (!visible) return null;

  const isMapPage = segment === "map";
  const mapMode = searchParams.get("mode");
  const isListMode = isMapPage && (mapMode === "sell" || mapMode === "buy");
  const active: TabId = segment === "" ? "home" : isListMode ? "list" : "map";

  const tabs: { id: TabId; label: string; radius: string; onClick: () => void }[] = [
    { id: "home", label: labels.home, radius: "6px", onClick: () => router.push("/") },
    {
      id: "map",
      label: labels.map,
      radius: "9999px",
      onClick: () => router.push({ pathname: "/map", query: { mode: "profiles" } }),
    },
    {
      id: "list",
      label: labels.listings,
      radius: "4px",
      onClick: () => router.push({ pathname: "/map", query: { mode: "sell" } }),
    },
    {
      id: "me",
      label: loggedIn ? labels.profile : labels.login,
      radius: "9999px 9999px 6px 6px",
      onClick: () => router.push(loggedIn ? "/dashboard" : "/auth/sign-up"),
    },
  ];

  return (
    <>
      <div className="h-[76px] sm:hidden" aria-hidden />
      <nav className="fixed inset-x-0 bottom-0 z-[2000] grid grid-cols-4 bg-white px-2 pb-[22px] pt-1.5 shadow-[0_-1px_0_#e3e6e8] sm:hidden">
        {tabs.map((tab) => {
          const on = tab.id === active;
          const color = on ? "#3f6e4a" : "#8a929a";
          return (
            <button
              key={tab.id}
              type="button"
              onClick={tab.onClick}
              className="flex min-h-11 flex-col items-center justify-center gap-1 px-0.5 py-1.5"
            >
              <span
                className="block h-[22px] w-[22px] border-2 box-border"
                style={{ borderRadius: tab.radius, borderColor: color, background: on ? "#e6efe6" : "transparent" }}
              />
              <span className="text-[11px]" style={{ color, fontWeight: on ? 600 : 500 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
