"use client";

import { FilterPill, optionClass } from "@/components/filter-pill";

export type SortValue = "" | "price-asc" | "price-desc" | "age-asc" | "age-desc";

type Labels = {
  sortLabel: string;
  sortDefault: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortAgeAsc: string;
  sortAgeDesc: string;
};

export function SortMenu({
  value,
  showAgeSort,
  labels,
  onChange,
}: {
  value?: string;
  showAgeSort: boolean;
  labels: Labels;
  onChange: (value: SortValue) => void;
}) {
  const options: { value: SortValue; label: string }[] = [
    { value: "price-asc", label: labels.sortPriceAsc },
    { value: "price-desc", label: labels.sortPriceDesc },
    ...(showAgeSort
      ? ([
          { value: "age-asc", label: labels.sortAgeAsc },
          { value: "age-desc", label: labels.sortAgeDesc },
        ] as const)
      : []),
  ];

  const activeLabel = options.find((o) => o.value === value)?.label;

  return (
    <FilterPill label={activeLabel ?? labels.sortLabel} active={!!value} panelWidth={220}>
      {(close) => (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => {
              onChange("");
              close();
            }}
            className={optionClass(!value)}
          >
            {labels.sortDefault}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                close();
              }}
              className={optionClass(value === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </FilterPill>
  );
}
