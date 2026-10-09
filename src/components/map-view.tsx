"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import type { Map as LeafletMap, CircleMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconCheck, IconShield } from "@/components/icons";
import { CategoryFilterBar } from "@/components/category-filter-bar";
import { FiltriButton } from "@/components/filtri-button";
import { LivestockFilterPanel, type LivestockFilters } from "@/components/livestock-filter-panel";
import { EquipmentFilterPanel, type EquipmentFilters } from "@/components/equipment-filter-panel";
import { MachineryFilterPanel, type MachineryFilters } from "@/components/machinery-filter-panel";
import { SeedsFilterPanel, type SeedsFilters } from "@/components/seeds-filter-panel";
import { SortMenu } from "@/components/sort-menu";
import { MapSearchBar } from "@/components/map-search-bar";
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
  selectedSubcategory,
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
  selectedSubcategory?: string;
  locale: string;
  sort?: string;
  search?: string;
  labels: {
    profiles: string;
    sell: string;
    buy: string;
    all: string;
    allSubcategories: string;
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
    tapPointHint: string;
    toggleShowMap: string;
    toggleShowList: string;
    addListingCta: string;
    verifiedShort: string;
  };
  livestockFilters: LivestockFilters;
  equipmentFilters: EquipmentFilters;
  machineryFilters: MachineryFilters;
  seedsFilters: SeedsFilters;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, CircleMarker>>({});
  const prevPointIdsRef = useRef<string>("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  function navigate(query: Record<string, string>) {
    startTransition(() => {
      router.push({ pathname: "/map", query });
    });
  }

  // The most specific category id currently in effect -- a selected
  // subcategory wins over the top-level category it belongs to.
  const effectiveCategoryId = selectedSubcategory || selectedCategory;

  const animalGroup = mode !== "profiles" ? getAnimalGroupForCategory(categories, effectiveCategoryId) : null;
  const isEquipment =
    mode !== "profiles" && !!effectiveCategoryId && getEquipmentCategoryIds(categories).has(effectiveCategoryId);
  const isMachinery =
    mode !== "profiles" && !!effectiveCategoryId && getMachineryCategoryIds(categories).has(effectiveCategoryId);
  const isSeeds =
    (mode !== "profiles" && !!effectiveCategoryId && getSeedsCategoryIds(categories).has(effectiveCategoryId)) ||
    (mode !== "profiles" && !!effectiveCategoryId && getFeedCategoryIds(categories).has(effectiveCategoryId));
  const hasSpecificFilters = !!animalGroup || isEquipment || isMachinery || isSeeds;

  const specificFilterCount = animalGroup
    ? Object.values(livestockFilters).filter(Boolean).length
    : isEquipment
      ? Object.values(equipmentFilters).filter(Boolean).length
      : isMachinery
        ? Object.values(machineryFilters).filter(Boolean).length
        : isSeeds
          ? Object.values(seedsFilters).filter(Boolean).length
          : 0;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapContainerRef.current, { zoomControl: true }).setView(
          LATVIA_CENTER,
          7,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(leafletMapRef.current);
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
        }).addTo(map);
        marker.bindTooltip(point.title, { direction: "top", offset: [0, -8] });
        marker.on("click", () => setSelected(point.id));
        markersRef.current[point.id] = marker;
      });

      const ids = points
        .map((p) => p.id)
        .sort()
        .join(",");
      if (ids !== prevPointIdsRef.current) {
        if (points.length > 1) {
          const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
          map.fitBounds(bounds.pad(0.2), { maxZoom: 12 });
        } else if (points.length === 1) {
          map.setView([points[0].lat, points[0].lng], 11);
        } else {
          map.setView(LATVIA_CENTER, 7);
        }
        prevPointIdsRef.current = ids;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [points]);

  // Re-style markers (radius/color) when selection changes, without re-fitting bounds.
  useEffect(() => {
    for (const [id, marker] of Object.entries(markersRef.current)) {
      const isSel = id === selected;
      marker.setStyle({ radius: isSel ? 11 : 8, fillColor: isSel ? PIN_SELECTED : PIN });
      if (isSel) marker.bringToFront();
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
    if (selectedSubcategory) query.subcategory = selectedSubcategory;
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

  const filterBar = (
    <div className="flex-shrink-0 border-b border-[#e3e6e8] bg-white">
      <div className="mx-auto flex max-w-[1648px] flex-col gap-3 px-4 py-3 sm:gap-3.5 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="grid flex-shrink-0 grid-cols-3 gap-0.5 rounded-xl bg-[#f0f2f0] p-1 sm:flex sm:gap-0.5">
            {(["profiles", "sell", "buy"] as MapMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => navigate({ mode: m, ...categoryQuery() })}
                className={`rounded-[9px] px-2 py-2 text-sm font-medium transition sm:px-4 ${
                  mode === m ? "bg-white text-[#1d2329] shadow-sm" : "text-[#5d6670]"
                }`}
              >
                {labels[m]}
              </button>
            ))}
          </div>
          <Spinner
            className={`hidden h-4 w-4 flex-shrink-0 text-[#3f6e4a] transition-opacity sm:block ${isPending ? "opacity-100" : "opacity-0"}`}
          />
          {!hasSpecificFilters && (
            <div className="hidden sm:block sm:flex-1">
              <MapSearchBar
                value={search}
                placeholder={mode === "profiles" ? labels.searchPlaceholderProfiles : labels.searchPlaceholderListings}
                onSearch={(q) => {
                  const query: Record<string, string> = { mode, ...categoryQuery() };
                  if (q) query.q = q;
                  navigate(query);
                }}
              />
            </div>
          )}
          {mode !== "profiles" && (
            <div className="ml-auto hidden items-center gap-2 sm:flex">
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
        </div>

        {!hasSpecificFilters && (
          <div className="sm:hidden">
            <MapSearchBar
              value={search}
              placeholder={mode === "profiles" ? labels.searchPlaceholderProfiles : labels.searchPlaceholderListings}
              onSearch={(q) => {
                const query: Record<string, string> = { mode, ...categoryQuery() };
                if (q) query.q = q;
                navigate(query);
              }}
            />
          </div>
        )}

        <CategoryFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          locale={locale}
          allLabel={labels.all}
          allSubcategoryLabel={labels.allSubcategories}
          onSelect={(categoryId, subcategoryId) => {
            const query: Record<string, string> = { mode };
            if (categoryId) query.category = categoryId;
            if (subcategoryId) query.subcategory = subcategoryId;
            navigate(query);
          }}
          trailing={
            hasSpecificFilters ? (
              <FiltriButton
                label={labels.filtri}
                count={specificFilterCount}
                clearLabel={labels.clearFilters}
                onClear={clearSpecificFilters}
              >
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
              </FiltriButton>
            ) : undefined
          }
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col overflow-hidden sm:h-[calc(100dvh-44px)]">
      {filterBar}

      <div className="relative flex flex-1 overflow-hidden">
        {/* List pane */}
        <div
          className={`absolute inset-0 z-10 flex flex-col gap-2.5 overflow-y-auto bg-[#f6f7f5] p-4 pb-24 sm:static sm:z-auto sm:w-[440px] sm:flex-shrink-0 sm:border-r sm:border-[#e3e6e8] sm:pb-4 ${
            mobileView === "map" ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="px-1 pb-1 text-[13px] text-[#5d6670]">{resultLabel}</div>
          {points.length === 0 ? (
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
              />
            ))
          )}
        </div>

        {/* Map pane (always mounted to avoid Leaflet sizing issues when hidden) */}
        <div
          className={`absolute inset-0 bg-[#e8ece6] transition-opacity sm:relative sm:flex-1 sm:opacity-100 ${
            mobileView === "list" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <div ref={mapContainerRef} className="absolute inset-0" />

          {/* Mobile-only selection surface */}
          <div className="sm:hidden">
            {selectedPoint ? (
              <Link
                href={selectedPoint.href}
                className="absolute inset-x-3 bottom-[76px] z-[600] flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(29,35,41,0.18)]"
              >
                <div
                  style={{
                    backgroundImage:
                      !selectedPoint.imageUrl && mode !== "profiles"
                        ? "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 8px, #e4e7e1 8px, #e4e7e1 16px)"
                        : undefined,
                  }}
                  className={`relative h-14 w-14 flex-shrink-0 overflow-hidden ${mode === "profiles" ? "rounded-full bg-[#e4eaf0]" : "rounded-[10px]"}`}
                >
                  {selectedPoint.imageUrl ? (
                    <Image src={selectedPoint.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                  ) : mode === "profiles" ? (
                    <div className="flex h-full w-full items-center justify-center font-semibold text-[#3b5166]">
                      {initialsFor(selectedPoint.title)}
                    </div>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold leading-[1.25] text-[#1d2329]">
                    {selectedPoint.title}
                  </div>
                  <div className="truncate text-[13px] text-[#5d6670]">{selectedPoint.subtitle}</div>
                </div>
                <span className="text-lg text-[#3f6e4a]">→</span>
              </Link>
            ) : (
              <div className="absolute left-1/2 top-3 z-[600] -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3.5 py-2 text-[13px] text-[#5d6670] shadow-[0_4px_12px_rgba(29,35,41,0.12)]">
                {resultLabel} · {labels.tapPointHint}
              </div>
            )}
          </div>
        </div>

        {/* Mobile-only floating controls */}
        <button
          type="button"
          onClick={() => setMobileView((v) => (v === "list" ? "map" : "list"))}
          className="absolute bottom-4 left-1/2 z-[700] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1d2329] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(29,35,41,0.25)] sm:hidden"
        >
          {mobileView === "list" ? labels.toggleShowMap : labels.toggleShowList}
        </button>
        {mode !== "profiles" && (
          <Link
            href={`/${locale}/dashboard/listings/new`}
            className="absolute bottom-4 right-4 z-[700] flex h-12 w-12 items-center justify-center rounded-full bg-[#3f6e4a] text-2xl text-white shadow-[0_8px_20px_rgba(29,35,41,0.25)] sm:hidden"
          >
            +
          </Link>
        )}
      </div>
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
}: {
  p: MapPoint;
  mode: MapMode;
  selected: string | null;
  onHover: (id: string) => void;
  locale: string;
  verifiedLabel: string;
}) {
  const isSel = p.id === selected;
  return (
    <Link
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
          <div className="relative h-full w-full overflow-hidden rounded-full bg-[#e4eaf0]">
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
