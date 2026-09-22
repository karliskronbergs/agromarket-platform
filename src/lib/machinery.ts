import { type CategoryRow, getSelfAndDescendantIds } from "@/lib/categories";

export const MACHINERY_ROOT_SLUG = "lauksaimnicibas-tehnika";

export function getMachineryCategoryIds(categories: CategoryRow[]): Set<string> {
  const root = categories.find((c) => c.slug === MACHINERY_ROOT_SLUG);
  return root ? new Set(getSelfAndDescendantIds(categories, root.id)) : new Set<string>();
}
