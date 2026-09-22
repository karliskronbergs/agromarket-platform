"use client";

import { CONDITION_OPTIONS } from "@/lib/equipment";
import { IconClose } from "@/components/icons";
import { FilterPill, optionClass } from "@/components/filter-pill";

export type EquipmentFilters = {
  condition?: string;
};

type Labels = {
  filterCondition: string;
  anyCondition: string;
  clearFilters: string;
};

export function EquipmentFilterPanel({
  locale,
  filters,
  labels,
  onApply,
  onClear,
}: {
  locale: string;
  filters: EquipmentFilters;
  labels: Labels;
  onApply: (filters: EquipmentFilters) => void;
  onClear: () => void;
}) {
  const hasActiveFilters = Object.values(filters).some((v) => v);
  const selected = filters.condition
    ? CONDITION_OPTIONS.find((o) => o.value === filters.condition)
    : null;
  const conditionText = selected ? (locale === "lv" ? selected.name_lv : selected.name_en) : null;

  return (
    <div className="-mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
      <FilterPill label={conditionText ?? labels.filterCondition} active={!!filters.condition}>
        {(close) => (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                onApply({ ...filters, condition: undefined });
                close();
              }}
              className={optionClass(!filters.condition)}
            >
              {labels.anyCondition}
            </button>
            {CONDITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onApply({ ...filters, condition: opt.value });
                  close();
                }}
                className={optionClass(filters.condition === opt.value)}
              >
                {locale === "lv" ? opt.name_lv : opt.name_en}
              </button>
            ))}
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
