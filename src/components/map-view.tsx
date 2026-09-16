"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@/i18n/navigation";
import { IconPin, IconCheck, IconShield } from "@/components/icons";
import { CategoryFilterMenu } from "@/components/category-filter-menu";
import type { CategoryRow } from "@/lib/categories";

export type MapMode = "profiles" | "sell" | "buy";

export type MapPoint = {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  href: string;
  imageUrl?: string;
  badge?: string;
  verified?: boolean;
  adminBadge?: boolean;
};

type Category = CategoryRow & { slug?: string };

const MODE_COLORS: Record<MapMode, string> = {
  profiles: "#3f6b3f",
  sell: "#d9713a",
  buy: "#2f6690",
};

const LATVIA_CENTER: [number, number] = [56.9, 24.6];

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function MapView({
  mode,
  points,
  categories,
  selectedCategory,
  locale,
  labels,
}: {
  mode: MapMode;
  points: MapPoint[];
  categories: Category[];
  selectedCategory?: string;
  locale: string;
  labels: {
    profiles: string;
    sell: string;
    buy: string;
    all: string;
    empty: string;
  };
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapContainerRef.current).setView(LATVIA_CENTER, 7);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(leafletMapRef.current);
      }

      const map = leafletMapRef.current;

      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      const icon = L.divIcon({
        className: "",
        html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${MODE_COLORS[mode]};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -8],
      });

      points.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], { icon }).addTo(map);
        const verifiedBadgeHtml =
          mode === "profiles" && point.verified
            ? `<span style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid white;display:flex;align-items:center;justify-content:center;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M7.5 12.5l3 3 6-6.5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
            : "";
        const adminBadgeHtml =
          mode === "profiles" && point.adminBadge
            ? `<span style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:#dc2626;display:flex;align-items:center;justify-content:center;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
            : "";
        const imageHtml = point.imageUrl
          ? `<div style="position:relative;flex-shrink:0;">
              <img src="${escapeHtml(point.imageUrl)}" style="width:44px;height:44px;border-radius:${
                mode === "profiles" ? "50%" : "8px"
              };object-fit:cover;display:block;" />
              ${verifiedBadgeHtml}
              ${adminBadgeHtml}
            </div>`
          : "";
        const badgeHtml = point.badge
          ? `<div style="display:inline-block;margin-top:3px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;background:#e7efe1;color:#3f6b3f;">${escapeHtml(point.badge)}</div>`
          : "";
        marker.bindPopup(
          `<a href="${point.href}" style="display:flex;gap:10px;align-items:flex-start;min-width:170px;font-family:'Work Sans',sans-serif;color:inherit;text-decoration:none;">
            ${imageHtml}
            <div style="min-width:0;">
              <div style="font-weight:600;font-size:13px;color:#2b2a24;">${escapeHtml(point.title)}</div>
              ${badgeHtml}
              <div style="font-size:12px;color:#7a7566;margin-top:3px;">${escapeHtml(point.subtitle)}</div>
            </div>
          </a>`,
          { minWidth: 200 },
        );
        markersRef.current[point.id] = marker;
      });

      if (points.length > 0) {
        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.2), { maxZoom: 12 });
      } else {
        map.setView(LATVIA_CENTER, 7);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [points, mode]);

  useEffect(() => {
    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, []);

  function focus(point: MapPoint) {
    const map = leafletMapRef.current;
    const marker = markersRef.current[point.id];
    if (map && marker) {
      map.setView([point.lat, point.lng], 14);
      marker.openPopup();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e2d8] bg-white px-6 py-4">
        <div className="flex gap-1 rounded-full bg-[#f1efe6] p-1">
          {(["profiles", "sell", "buy"] as MapMode[]).map((m) => (
            <Link
              key={m}
              href={{
                pathname: "/map",
                query: selectedCategory ? { mode: m, category: selectedCategory } : { mode: m },
              }}
              className="rounded-full px-4 py-1.5 text-sm font-semibold text-[#55503f]"
              style={mode === m ? { background: MODE_COLORS[m], color: "white" } : undefined}
            >
              {labels[m]}
            </Link>
          ))}
        </div>
        <CategoryFilterMenu
          categories={categories}
          selectedCategory={selectedCategory}
          locale={locale}
          allLabel={labels.all}
          onSelect={(id) => {
            const query: Record<string, string> = { mode };
            if (id) query.category = id;
            router.push({ pathname: "/map", query });
          }}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
        <div className="order-2 max-h-56 w-full overflow-y-auto border-t border-[#e7e2d8] bg-[#faf8f3] p-4 sm:order-1 sm:max-h-none sm:w-80 sm:min-w-80 sm:border-t-0 sm:border-r">
          {points.length === 0 && <p className="text-sm text-[#7a7566]">{labels.empty}</p>}
          {points.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => focus(p)}
              className={`mb-3 flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm shadow-sm transition ${
                mode === "profiles" && p.adminBadge
                  ? "border-red-200 bg-red-50 hover:border-red-400"
                  : "border-[#e7e2d8] bg-white hover:border-[#3f6b3f]"
              }`}
            >
              {mode === "profiles" ? (
                <div className="relative h-10 w-10 flex-shrink-0">
                  <div
                    className={`h-full w-full overflow-hidden rounded-full ${p.imageUrl ? "bg-white" : "bg-[#3f6b3f]"}`}
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                        {p.title.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {p.verified && (
                    <IconCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full text-[#2563eb] ring-2 ring-white" />
                  )}
                  {p.adminBadge && (
                    <IconShield className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full text-red-600" />
                  )}
                </div>
              ) : (
                <div
                  className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg"
                  style={{
                    background: p.imageUrl ? undefined : `linear-gradient(135deg, ${MODE_COLORS[mode]}, #7b8496)`,
                  }}
                >
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold text-[#2b2a24]">{p.title}</span>
                </div>
                {p.badge && (
                  <span className="mt-1 inline-block rounded-full bg-[#e7efe1] px-2 py-0.5 text-xs font-semibold text-[#3f6b3f]">
                    {p.badge}
                  </span>
                )}
                {p.subtitle && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-[#7a7566]">
                    {mode === "profiles" && <IconPin className="h-3 w-3 flex-shrink-0" />}
                    <span className="truncate">{p.subtitle}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        <div ref={mapContainerRef} className="order-1 min-h-64 flex-1 sm:order-2" />
      </div>
    </div>
  );
}
