import { type CategoryRow, getSelfAndDescendantIds } from "@/lib/categories";

export const FEED_ROOT_SLUG = "baribas";

export function getFeedCategoryIds(categories: CategoryRow[]): Set<string> {
  const root = categories.find((c) => c.slug === FEED_ROOT_SLUG);
  return root ? new Set(getSelfAndDescendantIds(categories, root.id)) : new Set<string>();
}
