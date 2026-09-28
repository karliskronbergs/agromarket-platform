import { type CategoryRow } from "@/lib/categories";

export type PriceUnitGroup = "kg-t" | "bale-t";

const KG_T_SLUGS = new Set(["seklas-un-graudi", "graudi-kombineta-baribas", "papildbariba"]);
const BALE_T_SLUGS = new Set(["rupja-lopbariba"]);

export type PriceUnitOption = { value: string; label_lv: string; label_en: string };

export const PRICE_UNIT_OPTIONS: Record<PriceUnitGroup, PriceUnitOption[]> = {
  "kg-t": [
    { value: "kg", label_lv: "€/kg", label_en: "€/kg" },
    { value: "t", label_lv: "€/t", label_en: "€/t" },
  ],
  "bale-t": [
    { value: "bale", label_lv: "€/rullis", label_en: "€/bale" },
    { value: "t", label_lv: "€/t", label_en: "€/t" },
  ],
};

export function getPriceUnitGroup(
  categories: CategoryRow[],
  categoryId?: string | null,
): PriceUnitGroup | null {
  if (!categoryId) return null;
  const byId = new Map(categories.map((c) => [c.id, c]));
  let current = byId.get(categoryId);
  while (current) {
    if (current.slug && KG_T_SLUGS.has(current.slug)) return "kg-t";
    if (current.slug && BALE_T_SLUGS.has(current.slug)) return "bale-t";
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return null;
}
