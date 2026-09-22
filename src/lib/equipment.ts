import { type CategoryRow, getSelfAndDescendantIds } from "@/lib/categories";

export const EQUIPMENT_ROOT_SLUG = "fermu-aprikojums";

export type ConditionOption = { value: string; name_lv: string; name_en: string };

export const CONDITION_OPTIONS: ConditionOption[] = [
  { value: "new", name_lv: "Jauns", name_en: "New" },
  { value: "used", name_lv: "Lietots", name_en: "Used" },
];

export function getEquipmentCategoryIds(categories: CategoryRow[]): Set<string> {
  const root = categories.find((c) => c.slug === EQUIPMENT_ROOT_SLUG);
  return root ? new Set(getSelfAndDescendantIds(categories, root.id)) : new Set<string>();
}

export function conditionLabel(value: string, locale: string): string {
  const option = CONDITION_OPTIONS.find((o) => o.value === value);
  if (!option) return value;
  return locale === "lv" ? option.name_lv : option.name_en;
}
