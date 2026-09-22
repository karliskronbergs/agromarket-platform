"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BREED_OPTIONS, type AnimalGroup } from "@/lib/livestock";
import { IconChevronDown, IconClose } from "@/components/icons";

export type LivestockFilters = {
  breed?: string;
  ageMin?: string;
  ageMax?: string;
  quantityMin?: string;
  priceMin?: string;
  priceMax?: string;
};

type Labels = {
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
};

const fieldClass =
  "w-full rounded-lg border border-[#e7e2d8] bg-white px-3 py-2 text-sm text-[#2b2a24] outline-none transition focus:border-[#3f6b3f] focus:ring-2 focus:ring-[#3f6b3f]/15";

function optionClass(active: boolean) {
  return `rounded-lg px-3 py-2 text-left text-sm transition ${
    active ? "bg-[#f1efe6] font-medium text-[#2b2a24]" : "text-[#55503f] hover:bg-[#faf8f3]"
  }`;
}

function FilterPill({
  label,
  active,
  panelWidth = 240,
  children,
}: {
  label: string;
  active: boolean;
  panelWidth?: number;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
  }

  function toggle() {
    if (open) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8)),
      });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    }
    function onScroll(e: Event) {
      if (panelRef.current?.contains(e.target as Node)) return;
      close();
    }
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className={`flex flex-shrink-0 snap-start items-center gap-1 rounded-full border px-3.5 py-2 text-sm font-medium shadow-sm transition ${
          active
            ? "border-[#3f6b3f] bg-[#f1efe6] text-[#2b2a24]"
            : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f]"
        }`}
      >
        <span className="max-w-32 truncate">{label}</span>
        <IconChevronDown className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: position.top, left: position.left, width: panelWidth, zIndex: 1100 }}
            className="rounded-xl border border-[#e7e2d8] bg-white p-3 shadow-lg"
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </>
  );
}

export function LivestockFilterPanel({
  animalGroup,
  locale,
  filters,
  labels,
  onApply,
  onClear,
}: {
  animalGroup: AnimalGroup;
  locale: string;
  filters: LivestockFilters;
  labels: Labels;
  onApply: (filters: LivestockFilters) => void;
  onClear: () => void;
}) {
  const breedOptions = BREED_OPTIONS[animalGroup];
  const hasActiveFilters = Object.values(filters).some((v) => v);

  const [ageMin, setAgeMin] = useState(filters.ageMin ?? "");
  const [ageMax, setAgeMax] = useState(filters.ageMax ?? "");
  const [quantityMin, setQuantityMin] = useState(filters.quantityMin ?? "");
  const [priceMin, setPriceMin] = useState(filters.priceMin ?? "");
  const [priceMax, setPriceMax] = useState(filters.priceMax ?? "");

  const selectedBreed = filters.breed ? breedOptions.find((o) => o.value === filters.breed) : null;
  const breedText = selectedBreed ? (locale === "lv" ? selectedBreed.name_lv : selectedBreed.name_en) : null;

  const ageText =
    filters.ageMin && filters.ageMax
      ? `${filters.ageMin}–${filters.ageMax} ${labels.ageMonthsShort}`
      : filters.ageMin
        ? `${filters.ageMin}+ ${labels.ageMonthsShort}`
        : filters.ageMax
          ? `≤${filters.ageMax} ${labels.ageMonthsShort}`
          : null;

  const quantityText = filters.quantityMin ? `${filters.quantityMin}+` : null;

  const priceText =
    filters.priceMin && filters.priceMax
      ? `€${filters.priceMin}–${filters.priceMax}`
      : filters.priceMin
        ? `€${filters.priceMin}+`
        : filters.priceMax
          ? `≤€${filters.priceMax}`
          : null;

  return (
    <div className="-mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
      <FilterPill label={breedText ?? labels.filterBreed} active={!!filters.breed}>
        {(close) => (
          <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onApply({ ...filters, breed: undefined });
                close();
              }}
              className={optionClass(!filters.breed)}
            >
              {labels.anyBreed}
            </button>
            {breedOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onApply({ ...filters, breed: opt.value });
                  close();
                }}
                className={optionClass(filters.breed === opt.value)}
              >
                {locale === "lv" ? opt.name_lv : opt.name_en}
              </button>
            ))}
          </div>
        )}
      </FilterPill>

      <FilterPill label={ageText ?? labels.filterAge} active={!!ageText}>
        {(close) => (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                placeholder={labels.ageMinPlaceholder}
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                className={fieldClass}
              />
              <input
                type="number"
                min="0"
                placeholder={labels.ageMaxPlaceholder}
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                className={fieldClass}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onApply({ ...filters, ageMin: ageMin || undefined, ageMax: ageMax || undefined });
                close();
              }}
              className="rounded-full bg-[#3f6b3f] py-2 text-sm font-semibold text-white transition hover:bg-[#2f5233]"
            >
              {labels.apply}
            </button>
          </div>
        )}
      </FilterPill>

      <FilterPill label={quantityText ?? labels.filterQuantity} active={!!quantityText}>
        {(close) => (
          <div className="flex flex-col gap-2">
            <input
              type="number"
              min="0"
              placeholder={labels.quantityMinPlaceholder}
              value={quantityMin}
              onChange={(e) => setQuantityMin(e.target.value)}
              className={fieldClass}
            />
            <button
              type="button"
              onClick={() => {
                onApply({ ...filters, quantityMin: quantityMin || undefined });
                close();
              }}
              className="rounded-full bg-[#3f6b3f] py-2 text-sm font-semibold text-white transition hover:bg-[#2f5233]"
            >
              {labels.apply}
            </button>
          </div>
        )}
      </FilterPill>

      <FilterPill label={priceText ?? labels.filterPrice} active={!!priceText}>
        {(close) => (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={labels.priceMinPlaceholder}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className={fieldClass}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={labels.priceMaxPlaceholder}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className={fieldClass}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onApply({ ...filters, priceMin: priceMin || undefined, priceMax: priceMax || undefined });
                close();
              }}
              className="rounded-full bg-[#3f6b3f] py-2 text-sm font-semibold text-white transition hover:bg-[#2f5233]"
            >
              {labels.apply}
            </button>
          </div>
        )}
      </FilterPill>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex flex-shrink-0 snap-start items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-[#7a7566] transition hover:text-[#2b2a24]"
        >
          <IconClose className="h-3.5 w-3.5" />
          {labels.clearFilters}
        </button>
      )}
    </div>
  );
}
