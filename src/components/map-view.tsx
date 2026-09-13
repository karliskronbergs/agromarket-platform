"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@/i18n/navigation";

export type MapMode = "profiles" | "sell" | "buy";

export type MapPoint = {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  href: string;
};

type Category = { id: string; slug: string; name_lv: string; name_en: string };

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
    view: string;
  };
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});

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
        marker.bindPopup(
          `<strong>${escapeHtml(point.title)}</strong><br/>${escapeHtml(point.subtitle)}<br/><a href="${point.href}">${labels.view}</a>`,
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
  }, [points, mode, labels.view]);

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
        <div className="flex flex-wrap gap-2">
          <Link
            href={{ pathname: "/map", query: { mode } }}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              !selectedCategory
                ? "border-[#3f6b3f] bg-[#e7efe1] text-[#3f6b3f]"
                : "border-[#e7e2d8] text-[#55503f]"
            }`}
          >
            {labels.all}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={{ pathname: "/map", query: { mode, category: c.id } }}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                selectedCategory === c.id
                  ? "border-[#3f6b3f] bg-[#e7efe1] text-[#3f6b3f]"
                  : "border-[#e7e2d8] text-[#55503f]"
              }`}
            >
              {locale === "lv" ? c.name_lv : c.name_en}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
        <div className="order-2 max-h-56 w-full overflow-y-auto border-t border-[#e7e2d8] bg-[#faf8f3] p-4 sm:order-1 sm:max-h-none sm:w-80 sm:min-w-80 sm:border-t-0 sm:border-r">
          {points.length === 0 && <p className="text-sm text-[#7a7566]">{labels.empty}</p>}
          {points.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => focus(p)}
              className="mb-3 block w-full rounded-lg border border-[#e7e2d8] bg-white p-3 text-left text-sm hover:border-[#3f6b3f]"
            >
              <div className="font-semibold text-[#2b2a24]">{p.title}</div>
              <div className="text-[#7a7566]">{p.subtitle}</div>
            </button>
          ))}
        </div>
        <div ref={mapContainerRef} className="order-1 min-h-64 flex-1 sm:order-2" />
      </div>
    </div>
  );
}
