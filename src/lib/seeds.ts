import { type CategoryRow, getSelfAndDescendantIds } from "@/lib/categories";

export const SEEDS_CATEGORY_SLUG = "seklas-un-graudi";

export function getSeedsCategoryIds(categories: CategoryRow[]): Set<string> {
  const root = categories.find((c) => c.slug === SEEDS_CATEGORY_SLUG);
  return root ? new Set(getSelfAndDescendantIds(categories, root.id)) : new Set<string>();
}
