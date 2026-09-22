"use client";

import { useState } from "react";
import { BREED_OPTIONS, type AnimalGroup } from "@/lib/livestock";
import { IconClose } from "@/components/icons";
import { FilterPill, CheckboxPill, optionClass, filterFieldClass as fieldClass } from "@/components/filter-pill";

export type LivestockFilters = {
  breed?: string;
  ageMin?: string;
  ageMax?: string;
  quantityMin?: string;
  priceMin?: string;
  priceMax?: string;
  organic?: string;
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
  organicCertified: string;
};

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

      <CheckboxPill
        label={labels.organicCertified}
        checked={!!filters.organic}
        onToggle={() => onApply({ ...filters, organic: filters.organic ? undefined : "1" })}
      />

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
