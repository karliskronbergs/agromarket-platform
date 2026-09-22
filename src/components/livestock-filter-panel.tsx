"use client";

import { useState } from "react";
import { BREED_OPTIONS, type AnimalGroup } from "@/lib/livestock";

export type LivestockFilters = {
  breed?: string;
  ageMin?: string;
  ageMax?: string;
  quantityMin?: string;
  priceMin?: string;
  priceMax?: string;
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
  labels: {
    anyBreed: string;
    ageMinPlaceholder: string;
    ageMaxPlaceholder: string;
    quantityMinPlaceholder: string;
    priceMinPlaceholder: string;
    priceMaxPlaceholder: string;
    applyFilters: string;
    clearFilters: string;
  };
  onApply: (filters: LivestockFilters) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState<LivestockFilters>(filters);
  const breedOptions = BREED_OPTIONS[animalGroup];
  const hasActiveFilters = Object.values(filters).some((v) => v);

  const fieldClass =
    "w-full rounded-lg border border-[#e7e2d8] bg-white px-3 py-2 text-sm text-[#2b2a24] outline-none transition focus:border-[#3f6b3f] focus:ring-2 focus:ring-[#3f6b3f]/15";

  return (
    <div className="flex flex-wrap items-end gap-2.5 rounded-xl border border-[#e7e2d8] bg-[#faf8f3] p-3">
      <select
        value={draft.breed ?? ""}
        onChange={(e) => setDraft((d) => ({ ...d, breed: e.target.value || undefined }))}
        className={`${fieldClass} w-40`}
      >
        <option value="">{labels.anyBreed}</option>
        {breedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {locale === "lv" ? opt.name_lv : opt.name_en}
          </option>
        ))}
      </select>
      <input
        type="number"
        min="0"
        placeholder={labels.ageMinPlaceholder}
        value={draft.ageMin ?? ""}
        onChange={(e) => setDraft((d) => ({ ...d, ageMin: e.target.value || undefined }))}
        className={`${fieldClass} w-32`}
      />
      <input
        type="number"
        min="0"
        placeholder={labels.ageMaxPlaceholder}
        value={draft.ageMax ?? ""}
        onChange={(e) => setDraft((d) => ({ ...d, ageMax: e.target.value || undefined }))}
        className={`${fieldClass} w-32`}
      />
      <input
        type="number"
        min="0"
        placeholder={labels.quantityMinPlaceholder}
        value={draft.quantityMin ?? ""}
        onChange={(e) => setDraft((d) => ({ ...d, quantityMin: e.target.value || undefined }))}
        className={`${fieldClass} w-32`}
      />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder={labels.priceMinPlaceholder}
        value={draft.priceMin ?? ""}
        onChange={(e) => setDraft((d) => ({ ...d, priceMin: e.target.value || undefined }))}
        className={`${fieldClass} w-32`}
      />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder={labels.priceMaxPlaceholder}
        value={draft.priceMax ?? ""}
        onChange={(e) => setDraft((d) => ({ ...d, priceMax: e.target.value || undefined }))}
        className={`${fieldClass} w-32`}
      />
      <button
        type="button"
        onClick={() => onApply(draft)}
        className="rounded-full bg-[#3f6b3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2f5233]"
      >
        {labels.applyFilters}
      </button>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setDraft({});
            onClear();
          }}
          className="rounded-full px-3 py-2 text-sm font-medium text-[#7a7566] transition hover:text-[#2b2a24]"
        >
          {labels.clearFilters}
        </button>
      )}
    </div>
  );
}
