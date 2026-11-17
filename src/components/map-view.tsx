"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValue, animate, type PanInfo } from "motion/react";
import { useRouter } from "@/i18n/navigation";
import type { Map as LeafletMap, CircleMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconCheck, IconClose, IconShield } from "@/components/icons";
import { CategoryFilterBar } from "@/components/category-filter-bar";
import type { LivestockFilters } from "@/components/livestock-filter-panel";
import type { EquipmentFilters } from "@/components/equipment-filter-panel";
import type { MachineryFilters } from "@/components/machinery-filter-panel";
import type { SeedsFilters } from "@/components/seeds-filter-panel";

// Only one of these four ever renders at a time (by category), and on the
// common first load (no category drilled into) none of them do -- loading
// them on demand keeps their code out of the map page's initial bundle.
const LivestockFilterPanel = dynamic(() =>
  import("@/components/livestock-filter-panel").then((m) => m.LivestockFilterPanel),
);
const EquipmentFilterPanel = dynamic(() =>
  import("@/components/equipment-filter-panel").then((m) => m.EquipmentFilterPanel),
);
const MachineryFilterPanel = dynamic(() =>
  import("@/components/machinery-filter-panel").then((m) => m.MachineryFilterPanel),
);
const SeedsFilterPanel = dynamic(() =>
  import("@/components/seeds-filter-panel").then((m) => m.SeedsFilterPanel),
);
import { SortMenu } from "@/components/sort-menu";
import { MapSearchBar } from "@/components/map-search-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  springDefault,
  springMomentum,
  fadeTransition,
  usePrefersReducedMotion,
  rubberband,
  projectMomentum,
  nearestSnapPoint,
} from "@/lib/motion";
import { AttributeIconRow, type AttributeInfo } from "@/components/attribute-badges";
import { Spinner } from "@/components/spinner";
import type { CategoryRow } from "@/lib/categories";
import { getAnimalGroupForCategory } from "@/lib/livestock";
import { getEquipmentCategoryIds } from "@/lib/equipment";
import { getMachineryCategoryIds } from "@/lib/machinery";
import { getSeedsCategoryIds } from "@/lib/seeds";
import { getFeedCategoryIds } from "@/lib/feed";

export type MapMode = "profiles" | "sell" | "buy";

export type MapPoint = {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  lat: number;
  lng: number;
  href: string;
  imageUrl?: string;
  badge?: string;
  verified?: boolean;
  adminBadge?: boolean;
  reservation?: boolean;
  attributes?: AttributeInfo[];
};

type Category = CategoryRow & { slug?: string };

const PIN = "#3f6e4a";
const PIN_SELECTED = "#3b5166";
const LATVIA_CENTER: [number, number] = [56.9, 24.6];

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function MapView({
  mode,
  points,
  categories,
  selectedCategory,
  selectedSubcategories,
  subcategoryCounts,
  initialView,
  locale,
  labels,
  livestockFilters,
  equipmentFilters,
  machineryFilters,
  seedsFilters,
  sort,
  search,
}: {
  mode: MapMode;
  points: MapPoint[];
  categories: Category[];
  selectedCategory?: string;
  selectedSubcategories: string[];
  subcategoryCounts: Record<string, number>;
  initialView?: { lat: number; lng: number; zoom: number };
  locale: string;
  sort?: string;
  search?: string;
  labels: {
    profiles: string;
    sell: string;
    buy: string;
    all: string;
    filtri: string;
    back: string;
    empty: string;
    filterBreed: string;
    anyBreed: string;
    filterAge: string;
    ageMinPlaceholder: string;
    ageMaxPlaceholder: string;
    filterQuantity: string;
    quantityMinPlaceholder: string;
    filterPrice: string;
    priceMinPlaceholder: string;
    priceMaxPlaceholder: string;
    apply: string;
    clearFilters: string;
    ageMonthsShort: string;
    filterCondition: string;
    anyCondition: string;
    filterManufacturer: string;
    manufacturerPlaceholder: string;
    filterModel: string;
    modelPlaceholder: string;
    filterTitle: string;
    titlePlaceholder: string;
    organicCertified: string;
    sortLabel: string;
    sortDefault: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortAgeAsc: string;
    sortAgeDesc: string;
    searchPlaceholderProfiles: string;
    searchPlaceholderListings: string;
    resultLabel: string;
    noResultsTitle: string;
    noResultsBody: string;
    addListingCta: string;
    verifiedShort: string;
    reservation: string;
    closePin: string;
  };
  livestockFilters: LivestockFilters;
  equipmentFilters: EquipmentFilters;
  machineryFilters: MachineryFilters;
  seedsFilters: SeedsFilters;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, CircleMarker>>({});
  const cardRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const prevPointIdsRef = useRef<string>("");
  const selectedRef = useRef<string | null>(null);
  const skippedInitialFitRef = useRef(false);
  const programmaticMoveRef = useRef(false);
  const viewSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // A single programmatic view change (fitBounds, setView, panBy) can fire
  // both "moveend" and "zoomend", and -- since these are animated -- only
  // once the animation settles, not synchronously. Clearing the flag after
  // a delay comfortably longer than Leaflet's default animation (instead of
  // the first handler call consuming it immediately) makes sure every event
  // from this one change sees it.
  function markProgrammaticMove() {
    programmaticMoveRef.current = true;
    setTimeout(() => {
      programmaticMoveRef.current = false;
    }, 600);
  }
  const desktopListRef = useRef<HTMLDivElement | null>(null);
  const mobileListRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState(390);
  const [viewportHeight, setViewportHeight] = useState(800);
  const reducedMotion = usePrefersReducedMotion();

  // Mobile 3-stop sheet (peek / half / full) -- design_handoff_v2/FLUID.md
  // "Map" section. `sheetY` is how far the sheet is pushed down from its
  // fully-open position; dragging/snapping only ever moves this value.
  const sheetY = useMotionValue(0);
  const sheetFullHeight = Math.max(320, viewportHeight - 72);
  const sheetStops = {
    full: 0,
    half: Math.max(0, sheetFullHeight - viewportHeight * 0.5),
    peek: Math.max(0, sheetFullHeight - 112),
  };
  const sheetStopValues = [sheetStops.full, sheetStops.half, sheetStops.peek];
  const panStartY = useRef(0);

  useEffect(() => {
    sheetY.set(sheetStops.half);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onResize() {
      setViewportHeight(window.innerHeight);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function snapSheetTo(stop: "full" | "half" | "peek", velocity = 0) {
    // A little bounce, but only when the gesture itself carried momentum
    // (a flick) -- a tap-triggered snap stays critically damped.
    const spring = Math.abs(velocity) > 300 ? springMomentum : springDefault;
    animate(sheetY, sheetStops[stop], { ...(reducedMotion ? fadeTransition : spring), velocity });
  }

  function handleSheetPanStart() {
    panStartY.current = sheetY.get();
  }

  function handleSheetPan(_: unknown, info: PanInfo) {
    let next = panStartY.current + info.offset.y;
    if (next < sheetStops.full) next = sheetStops.full - rubberband(sheetStops.full - next, sheetFullHeight);
    if (next > sheetStops.peek) next = sheetStops.peek + rubberband(next - sheetStops.peek, sheetFullHeight);
    sheetY.set(next);
  }

  function handleSheetPanEnd(_: unknown, info: PanInfo) {
    const projected = sheetY.get() + projectMomentum(info.velocity.y);
    const target = nearestSnapPoint(projected, sheetStopValues);
    const stop = (Object.keys(sheetStops) as (keyof typeof sheetStops)[]).find((k) => sheetStops[k] === target) ?? "half";
    snapSheetTo(stop, info.velocity.y);
  }

  function stepSheetUp() {
    const current = sheetY.get();
    if (current > sheetStops.half + 4) snapSheetTo("half");
    else snapSheetTo("full");
  }

  function navigate(query: Record<string, string>) {
    startTransition(() => {
      router.push({ pathname: "/map", query });
    });
  }

  // All of a top category's subcategories share the same specific-filter
  // group (livestock/equipment/machinery/seeds), so the top category id
  // alone is enough to pick which filter panel applies.
  const effectiveCategoryId = selectedCategory;

  const animalGroup = mode !== "profiles" ? getAnimalGroupForCategory(categories, effectiveCategoryId) : null;
  const isEquipment =
    mode !== "profiles" && !!effectiveCategoryId && getEquipmentCategoryIds(categories).has(effectiveCategoryId);
  const isMachinery =
    mode !== "profiles" && !!effectiveCategoryId && getMachineryCategoryIds(categories).has(effectiveCategoryId);
  const isSeeds =
    (mode !== "profiles" && !!effectiveCategoryId && getSeedsCategoryIds(categories).has(effectiveCategoryId)) ||
    (mode !== "profiles" && !!effectiveCategoryId && getFeedCategoryIds(categories).has(effectiveCategoryId));
  const hasSpecificFilters = !!animalGroup || isEquipment || isMachinery || isSeeds;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        markProgrammaticMove();
        leafletMapRef.current = L.map(mapContainerRef.current, { zoomControl: true }).setView(
          initialView ? [initialView.lat, initialView.lng] : LATVIA_CENTER,
          initialView ? initialView.zoom : 7,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(leafletMapRef.current);

        // Keep the mobile selected-marker popup anchored to its marker as the
        // map pans/zooms, instead of recomputing only on selection change.
        leafletMapRef.current.on("move zoom", () => {
          const m = leafletMapRef.current;
          const id = selectedRef.current;
          const marker = id ? markersRef.current[id] : null;
          if (!m || !marker) return;
          const pt = m.latLngToContainerPoint(marker.getLatLng());
          setPopupPos({ x: pt.x, y: pt.y });
          if (mapContainerRef.current) setContainerWidth(mapContainerRef.current.clientWidth);
        });

        // design_handoff_v2/FLUID.md "Back navigation": keep the map center
        // and zoom in the URL (via replaceState, so panning never triggers a
        // server round-trip) so the browser's Back button restores the exact
        // view. Programmatic moves (fitBounds, the initial setView, the
        // marker-click pan) set programmaticMoveRef first and are excluded --
        // only moves the user actually drove get written back.
        leafletMapRef.current.on("moveend zoomend", () => {
          if (programmaticMoveRef.current) return;
          clearTimeout(viewSyncTimeoutRef.current);
          viewSyncTimeoutRef.current = setTimeout(() => {
            const m = leafletMapRef.current;
            if (!m) return;
            const center = m.getCenter();
            const params = new URLSearchParams(window.location.search);
            params.set("lat", center.lat.toFixed(5));
            params.set("lng", center.lng.toFixed(5));
            params.set("zoom", String(m.getZoom()));
            window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
          }, 400);
        });

        // Tapping empty map closes the pin card, per FLUID.md's pin card
        // spec (marker clicks have bubblingMouseEvents:false, so they don't
        // reach this handler and immediately re-close what they just opened).
        leafletMapRef.current.on("click", () => setSelected(null));
      }

      const map = leafletMapRef.current;

      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      points.forEach((point) => {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 8,
          color: "#fff",
          weight: 3,
          fillColor: PIN,
          fillOpacity: 1,
          // Path layers bubble mouse events to the map by default, which
          // would fire the map's own "click closes the pin card" handler
          // right after this marker's click opened it.
          bubblingMouseEvents: false,
        }).addTo(map);
        marker.on("click", () => {
          setSelected(point.id);
          cardRefs.current[point.id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          // Desktop: the floating panel sits over the map's left ~430px --
          // pan so a newly selected pin isn't hidden under it. Mobile: drop
          // the sheet to peek so the map (and the pin's popup) is visible.
          if (window.innerWidth >= 640) {
            const panelRight = 16 + 400 + 24;
            const pt = map.latLngToContainerPoint([point.lat, point.lng]);
            if (pt.x < panelRight) {
              markProgrammaticMove();
              map.panBy([-(panelRight - pt.x), 0], { animate: true });
            }
          } else {
            snapSheetTo("peek");
          }
        });
        markersRef.current[point.id] = marker;
      });

      const ids = points
        .map((p) => p.id)
        .sort()
        .join(",");
      if (ids !== prevPointIdsRef.current) {
        // A restored view from the URL wins once, on the very first point
        // set -- after that (the user changed a filter), fit the new
        // results as usual.
        if (initialView && !skippedInitialFitRef.current) {
          skippedInitialFitRef.current = true;
        } else {
          markProgrammaticMove();
          if (points.length > 1) {
            const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
            // Capped lower than the "fits nicely" zoom would otherwise go:
            // a tight, data-specific zoom/bbox is a tile combination almost
            // nobody else requests, so it's cold at the tile server's own
            // cache, unlike a zoomed-out view that overlaps what countless
            // other map consumers already requested.
            map.fitBounds(bounds.pad(0.2), { maxZoom: 10 });
          } else if (points.length === 1) {
            map.setView([points[0].lat, points[0].lng], 10);
          } else {
            map.setView(LATVIA_CENTER, 7);
          }
        }
        prevPointIdsRef.current = ids;
      }
    })();

    return () => {
      cancelled = true;
    };
    // snapSheetTo intentionally omitted -- this effect should only
    // re-create markers when the point set changes, not on every sheet
    // layout change (viewport resize, reduced-motion toggle).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // design_handoff_v2/FLUID.md "Back navigation": remember this as the
  // list page a listing/profile's back bar should return to.
  useEffect(() => {
    try {
      sessionStorage.setItem("lastListHref", `${window.location.pathname}${window.location.search}`);
    } catch {}
  });

  // design_handoff_v2/FLUID.md "Back navigation": restore the results
  // list's scroll position when returning to this exact filtered view.
  // A fresh MapView instance mounts on every navigation (the server
  // component re-renders), so this has to be sessionStorage, keyed by the
  // full URL, rather than state that would just survive on its own.
  useEffect(() => {
    const key = `mapScroll:${window.location.pathname}${window.location.search}`;
    const saved = Number(sessionStorage.getItem(key) ?? "");
    const els = [desktopListRef.current, mobileListRef.current].filter(
      (el): el is HTMLDivElement => !!el,
    );
    if (!Number.isNaN(saved)) {
      for (const el of els) el.scrollTop = saved;
    }
    function onScroll(e: Event) {
      sessionStorage.setItem(key, String((e.currentTarget as HTMLDivElement).scrollTop));
    }
    for (const el of els) el.addEventListener("scroll", onScroll);
    return () => {
      for (const el of els) el.removeEventListener("scroll", onScroll);
    };
    // Runs once per mount (a fresh instance per navigation) -- re-running
    // on every point/selection change would thrash the saved value.
  }, []);

  // Re-style markers (radius/color) when selection changes, without re-fitting bounds.
  useEffect(() => {
    selectedRef.current = selected;
    for (const [id, marker] of Object.entries(markersRef.current)) {
      const isSel = id === selected;
      marker.setStyle({ radius: isSel ? 11 : 8, fillColor: isSel ? PIN_SELECTED : PIN });
      if (isSel) marker.bringToFront();
    }

    const map = leafletMapRef.current;
    const marker = selected ? markersRef.current[selected] : null;
    if (map && marker) {
      const pt = map.latLngToContainerPoint(marker.getLatLng());
      setPopupPos({ x: pt.x, y: pt.y });
      if (mapContainerRef.current) setContainerWidth(mapContainerRef.current.clientWidth);
    } else {
      setPopupPos(null);
    }
  }, [selected]);

  useEffect(() => {
    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, []);

  const selectedPoint = points.find((p) => p.id === selected) ?? null;
  const resultLabel = labels.resultLabel;

  function categoryQuery(): Record<string, string> {
    const query: Record<string, string> = {};
    if (selectedCategory) query.category = selectedCategory;
    if (selectedSubcategories.length > 0) query.subcategories = selectedSubcategories.join(",");
    return query;
  }

  // Full reset: used by the empty state ("Notīrīt filtrus" there clears the
  // whole search, including category/subcategory, matching the prototype).
  function clearAllFilters() {
    navigate({ mode });
  }

  // Clears just the current category's specific fields (breed/condition/...),
  // keeping mode/category/subcategory/sort -- used by each filter panel's
  // own "Notīrīt filtrus" and by the Filtri button.
  function clearSpecificFilters() {
    const query: Record<string, string> = { mode, ...categoryQuery() };
    if (sort) query.sort = sort;
    navigate(query);
  }

  function applyFilterQuery(extra: Record<string, string>) {
    const query: Record<string, string> = { mode, ...categoryQuery(), ...extra };
    if (sort) query.sort = sort;
    navigate(query);
  }

  const resultList =
    points.length === 0 ? (
      <EmptyState
        title={labels.noResultsTitle}
        body={labels.noResultsBody}
        clearLabel={labels.clearFilters}
        onClear={clearAllFilters}
      />
    ) : (
      points.map((p) => (
        <ResultCard
          key={p.id}
          p={p}
          mode={mode}
          selected={selected}
          onHover={setSelected}
          locale={locale}
          verifiedLabel={labels.verifiedShort}
          reservationLabel={labels.reservation}
          cardRef={(el) => {
            cardRefs.current[p.id] = el;
          }}
        />
      ))
    );

  const filterContent = (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <SegmentedControl
          className="flex-shrink-0"
          fill={false}
          items={(["profiles", "sell", "buy"] as MapMode[]).map((m) => ({ value: m, label: labels[m] }))}
          value={mode}
          onChange={(m) => navigate({ mode: m, ...categoryQuery() })}
        />
        <Spinner
          className={`h-4 w-4 flex-shrink-0 text-[#3f6e4a] transition-opacity ${isPending ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {!hasSpecificFilters && (
        <MapSearchBar
          value={search}
          placeholder={mode === "profiles" ? labels.searchPlaceholderProfiles : labels.searchPlaceholderListings}
          onFocus={() => snapSheetTo("full")}
          onSearch={(q) => {
            const query: Record<string, string> = { mode, ...categoryQuery() };
            if (q) query.q = q;
            navigate(query);
          }}
        />
      )}

      {mode !== "profiles" && (
        <div className="flex items-center gap-2">
          <SortMenu
            value={sort}
            showAgeSort={!!animalGroup}
            labels={labels}
            onChange={(newSort) => {
              const query: Record<string, string> = { mode, ...categoryQuery() };
              if (animalGroup) {
                if (livestockFilters.breed) query.breed = livestockFilters.breed;
                if (livestockFilters.ageMin) query.ageMin = livestockFilters.ageMin;
                if (livestockFilters.ageMax) query.ageMax = livestockFilters.ageMax;
                if (livestockFilters.quantityMin) query.quantityMin = livestockFilters.quantityMin;
                if (livestockFilters.priceMin) query.priceMin = livestockFilters.priceMin;
                if (livestockFilters.priceMax) query.priceMax = livestockFilters.priceMax;
                if (livestockFilters.organic) query.organic = livestockFilters.organic;
              } else if (isEquipment) {
                if (equipmentFilters.condition) query.condition = equipmentFilters.condition;
                if (equipmentFilters.priceMin) query.priceMin = equipmentFilters.priceMin;
                if (equipmentFilters.priceMax) query.priceMax = equipmentFilters.priceMax;
              } else if (isMachinery) {
                if (machineryFilters.manufacturer) query.manufacturer = machineryFilters.manufacturer;
                if (machineryFilters.model) query.model = machineryFilters.model;
                if (machineryFilters.condition) query.condition = machineryFilters.condition;
                if (machineryFilters.priceMin) query.priceMin = machineryFilters.priceMin;
                if (machineryFilters.priceMax) query.priceMax = machineryFilters.priceMax;
              } else if (isSeeds) {
                if (seedsFilters.title) query.title = seedsFilters.title;
                if (seedsFilters.priceMin) query.priceMin = seedsFilters.priceMin;
                if (seedsFilters.priceMax) query.priceMax = seedsFilters.priceMax;
                if (seedsFilters.organic) query.organic = seedsFilters.organic;
              }
              if (newSort) query.sort = newSort;
              navigate(query);
            }}
          />
          <Link
            href={`/${locale}/dashboard/listings/new`}
            className="flex-shrink-0 whitespace-nowrap rounded-[10px] bg-[#3f6e4a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#355d3e]"
          >
            {labels.addListingCta}
          </Link>
        </div>
      )}

      <CategoryFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSubcategories={selectedSubcategories}
        counts={subcategoryCounts}
        locale={locale}
        allLabel={labels.all}
        onSelect={(categoryId, subcategoryIds) => {
          const query: Record<string, string> = { mode };
          if (categoryId) query.category = categoryId;
          if (subcategoryIds.length > 0) query.subcategories = subcategoryIds.join(",");
          navigate(query);
        }}
      />

      {animalGroup && (
        <LivestockFilterPanel
          key={effectiveCategoryId}
          animalGroup={animalGroup}
          locale={locale}
          filters={livestockFilters}
          labels={labels}
          onApply={(f) =>
            applyFilterQuery({
              ...(f.breed ? { breed: f.breed } : {}),
              ...(f.ageMin ? { ageMin: f.ageMin } : {}),
              ...(f.ageMax ? { ageMax: f.ageMax } : {}),
              ...(f.quantityMin ? { quantityMin: f.quantityMin } : {}),
              ...(f.priceMin ? { priceMin: f.priceMin } : {}),
              ...(f.priceMax ? { priceMax: f.priceMax } : {}),
              ...(f.organic ? { organic: f.organic } : {}),
            })
          }
          onClear={clearSpecificFilters}
        />
      )}
      {isEquipment && (
        <EquipmentFilterPanel
          key={effectiveCategoryId}
          locale={locale}
          filters={equipmentFilters}
          labels={labels}
          onApply={(f) =>
            applyFilterQuery({
              ...(f.condition ? { condition: f.condition } : {}),
              ...(f.priceMin ? { priceMin: f.priceMin } : {}),
              ...(f.priceMax ? { priceMax: f.priceMax } : {}),
            })
          }
          onClear={clearSpecificFilters}
        />
      )}
      {isMachinery && (
        <MachineryFilterPanel
          key={effectiveCategoryId}
          locale={locale}
          filters={machineryFilters}
          labels={labels}
          onApply={(f) =>
            applyFilterQuery({
              ...(f.manufacturer ? { manufacturer: f.manufacturer } : {}),
              ...(f.model ? { model: f.model } : {}),
              ...(f.condition ? { condition: f.condition } : {}),
              ...(f.priceMin ? { priceMin: f.priceMin } : {}),
              ...(f.priceMax ? { priceMax: f.priceMax } : {}),
            })
          }
          onClear={clearSpecificFilters}
        />
      )}
      {isSeeds && (
        <SeedsFilterPanel
          key={effectiveCategoryId}
          filters={seedsFilters}
          labels={labels}
          onApply={(f) =>
            applyFilterQuery({
              ...(f.title ? { title: f.title } : {}),
              ...(f.priceMin ? { priceMin: f.priceMin } : {}),
              ...(f.priceMax ? { priceMax: f.priceMax } : {}),
              ...(f.organic ? { organic: f.organic } : {}),
            })
          }
          onClear={clearSpecificFilters}
        />
      )}
    </div>
  );

  return (
    <div className="relative h-[calc(100dvh-56px)] overflow-hidden sm:h-[calc(100dvh-44px)]">
      {/* Map pane -- always full-bleed, under the floating panel/sheet */}
      <div className="absolute inset-0 bg-[#e8ece6]">
        <div ref={mapContainerRef} className="absolute inset-0" />

          {/* Selected-marker card, shown on click at any screen size */}
          <AnimatePresence>
            {selectedPoint && popupPos && (
              <motion.div
                key={selectedPoint.id}
                style={{
                  left: Math.min(Math.max(popupPos.x, 138), containerWidth - 138),
                  top: Math.max(popupPos.y - 18, 8),
                  transformOrigin: "bottom center",
                }}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                transition={reducedMotion ? fadeTransition : springDefault}
                className="absolute z-[600] w-[276px] -translate-x-1/2 -translate-y-full"
              >
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label={labels.closePin}
                  className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#5d6670] shadow-[0_2px_6px_rgba(29,35,41,0.25)] transition active:scale-90"
                >
                  <IconClose className="h-3 w-3" />
                </button>
                <Link
                  href={selectedPoint.href}
                  className="flex items-center gap-2.5 rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_rgba(29,35,41,0.18)]"
                >
                  <div
                    style={{
                      backgroundImage:
                        !selectedPoint.imageUrl && mode !== "profiles"
                          ? "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 8px, #e4e7e1 8px, #e4e7e1 16px)"
                          : undefined,
                    }}
                    className={`relative h-11 w-11 flex-shrink-0 overflow-hidden ${
                      mode === "profiles"
                        ? selectedPoint.imageUrl
                          ? "rounded-full bg-white"
                          : "rounded-full bg-[#e4eaf0]"
                        : "rounded-[10px]"
                    }`}
                  >
                    {selectedPoint.imageUrl ? (
                      <Image src={selectedPoint.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                    ) : mode === "profiles" ? (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#3b5166]">
                        {initialsFor(selectedPoint.title)}
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold leading-[1.25] text-[#1d2329]">
                        {selectedPoint.title}
                      </span>
                      {selectedPoint.reservation && (
                        <span className="flex-shrink-0 rounded-full bg-[#3b5166] px-[7px] py-[1px] text-[10px] font-semibold text-white">
                          {labels.reservation}
                        </span>
                      )}
                    </div>
                    {mode !== "profiles" && selectedPoint.price ? (
                      <div className="truncate text-[13px] font-semibold text-[#1d2329]">{selectedPoint.price}</div>
                    ) : (
                      <div className="truncate text-[11px] text-[#5d6670]">{selectedPoint.subtitle}</div>
                    )}
                  </div>
                  <span className="flex-shrink-0 text-base text-[#3f6e4a]">→</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop: a frosted results panel floating over the full-bleed map */}
        <div className="absolute inset-y-4 left-4 z-[500] hidden w-[400px] flex-col overflow-hidden rounded-[22px] bg-white/[0.86] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_40px_rgba(20,26,32,0.18)] backdrop-blur-[24px] backdrop-saturate-[1.8] sm:flex">
          <div className="flex-shrink-0 border-b border-black/[0.06]">{filterContent}</div>
          <div ref={desktopListRef} className="flex-1 overflow-y-auto overscroll-contain px-2 pb-4">
            <div className="px-2 pb-2 pt-3 text-[13px] font-medium text-[#4a535b]">{resultLabel}</div>
            <div className="flex flex-col gap-2 px-0">{resultList}</div>
          </div>
        </div>

        {/* Mobile: a draggable 3-stop sheet (peek / half / full) over the full-bleed map */}
        <motion.div
          style={{ y: sheetY, height: sheetFullHeight }}
          className="fixed inset-x-0 bottom-0 z-[600] flex flex-col overflow-hidden rounded-t-[22px] bg-white/[0.86] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_-8px_30px_rgba(20,26,32,0.18)] backdrop-blur-[24px] backdrop-saturate-[1.8] sm:hidden"
        >
          <motion.div
            onPanStart={handleSheetPanStart}
            onPan={handleSheetPan}
            onPanEnd={handleSheetPanEnd}
            onClick={stepSheetUp}
            className="flex flex-shrink-0 touch-none flex-col items-center gap-2 pb-1.5 pt-2"
            style={{ cursor: "grab" }}
          >
            <span className="h-[5px] w-10 rounded-full bg-black/[0.18]" />
            <span className="self-stretch px-4 text-[13px] font-medium text-[#4a535b]">{resultLabel}</span>
          </motion.div>
          <div className="flex-shrink-0 border-b border-black/[0.06]">{filterContent}</div>
          <div ref={mobileListRef} className="flex-1 overflow-y-auto overscroll-contain px-2 pb-6">
            <div className="flex flex-col gap-2">{resultList}</div>
          </div>
        </motion.div>
      </div>
  );
}

function EmptyState({
  title,
  body,
  clearLabel,
  onClear,
}: {
  title: string;
  body: string;
  clearLabel: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-9 text-center text-[#5d6670]">
      <div className="text-base font-medium text-[#1d2329]">{title}</div>
      <div className="text-sm">{body}</div>
      <button
        type="button"
        onClick={onClear}
        className="rounded-[10px] border border-[#d9dee2] bg-white px-4 py-2.5 text-sm text-[#1d2329]"
      >
        {clearLabel}
      </button>
    </div>
  );
}

function ResultCard({
  p,
  mode,
  selected,
  onHover,
  locale,
  verifiedLabel,
  reservationLabel,
  cardRef,
}: {
  p: MapPoint;
  mode: MapMode;
  selected: string | null;
  onHover: (id: string) => void;
  locale: string;
  verifiedLabel: string;
  reservationLabel: string;
  cardRef: (el: HTMLAnchorElement | null) => void;
}) {
  const isSel = p.id === selected;
  return (
    <Link
      ref={cardRef}
      href={p.href}
      onMouseEnter={() => onHover(p.id)}
      className="flex gap-3.5 rounded-2xl border p-3.5 transition sm:p-3.5"
      style={{
        borderColor: isSel ? "#3f6e4a" : "#e3e6e8",
        background: isSel ? "#f3f7f3" : "#fff",
      }}
    >
      {mode === "profiles" ? (
        <div className="relative h-12 w-12 flex-shrink-0">
          <div className={`relative h-full w-full overflow-hidden rounded-full ${p.imageUrl ? "bg-white" : "bg-[#e4eaf0]"}`}>
            {p.imageUrl ? (
              <Image src={p.imageUrl} alt="" fill sizes="48px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[15px] font-semibold text-[#3b5166]">
                {initialsFor(p.title)}
              </div>
            )}
          </div>
          {p.adminBadge ? (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#dc2626]">
              <IconShield className="h-2.5 w-2.5 text-white" />
            </span>
          ) : (
            p.verified && (
              <IconCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full text-[#3f6e4a] ring-2 ring-white" />
            )
          )}
        </div>
      ) : (
        <div
          style={{
            backgroundImage: p.imageUrl
              ? undefined
              : "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 8px, #e4e7e1 8px, #e4e7e1 16px)",
          }}
          className="relative h-[92px] w-[92px] flex-shrink-0 overflow-hidden rounded-[10px]"
        >
          {p.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="92px" className="object-cover" />}
          {p.reservation && (
            <span className="absolute bottom-1 right-1 rounded-full bg-[#3b5166] px-[7px] py-[2px] text-[9px] font-semibold text-white">
              {reservationLabel}
            </span>
          )}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        {mode === "profiles" ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-semibold text-[#1d2329]">{p.title}</span>
              {p.verified && (
                <span title={verifiedLabel} className="flex-shrink-0">
                  <IconCheck className="h-4 w-4 text-[#3f6e4a]" />
                </span>
              )}
            </div>
            {p.badge && (
              <span className="self-start rounded-md bg-[#eef3ee] px-2.5 py-[3px] text-xs font-medium text-[#2f5538]">
                {p.badge}
              </span>
            )}
            {p.subtitle && <div className="truncate text-[13px] text-[#5d6670]">{p.subtitle}</div>}
          </>
        ) : (
          <>
            <div className="truncate text-xs text-[#5d6670]">{p.badge ?? ""}</div>
            <div className="line-clamp-2 text-[15px] font-medium leading-[1.3] text-[#1d2329]">{p.title}</div>
            {p.price && <div className="text-base font-semibold text-[#1d2329]">{p.price}</div>}
            <div className="mt-auto truncate text-xs text-[#5d6670]">{p.subtitle}</div>
          </>
        )}
        {p.attributes && p.attributes.length > 0 && (
          <div className="mt-0.5">
            <AttributeIconRow attributes={p.attributes} locale={locale} />
          </div>
        )}
      </div>
    </Link>
  );
}
