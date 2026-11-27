export type CategoryRow = {
  id: string;
  slug?: string;
  name_lv: string;
  name_en: string;
  parent_id: string | null;
};

export type CategoryNode<T extends CategoryRow = CategoryRow> = T & { children: CategoryNode<T>[] };

export function buildCategoryTree<T extends CategoryRow>(categories: T[]): CategoryNode<T>[] {
  const byId = new Map<string, CategoryNode<T>>();
  categories.forEach((c) => byId.set(c.id, { ...c, children: [] }));

  const roots: CategoryNode<T>[] = [];
  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function flattenCategoryTree<T extends CategoryRow>(
  nodes: CategoryNode<T>[],
  depth = 0,
): Array<{ node: CategoryNode<T>; depth: number }> {
  const out: Array<{ node: CategoryNode<T>; depth: number }> = [];
  for (const node of nodes) {
    out.push({ node, depth });
    out.push(...flattenCategoryTree(node.children, depth + 1));
  }
  return out;
}

export function findCategoryPath<T extends CategoryRow>(
  nodes: CategoryNode<T>[],
  id?: string | null,
): CategoryNode<T>[] {
  if (!id) return [];
  for (const node of nodes) {
    if (node.id === id) return [node];
    const childPath = findCategoryPath(node.children, id);
    if (childPath.length > 0) return [node, ...childPath];
  }
  return [];
}

// A parent and one of its own descendants can both end up checked at once
// in a multi-select subcategory picker (the tree goes 3-4 levels deep, and
// every depth is selectable). Counting both would double-count: a checked
// ancestor's count already rolls up every checked descendant beneath it.
// `rootId` bounds the walk to one root's own branch (a dropdown only ever
// resolves ancestors up to the root chip it belongs to, never past it).
export function hasCheckedAncestor<T extends CategoryRow>(
  id: string,
  checked: ReadonlySet<string>,
  descendantById: ReadonlyMap<string, T>,
  rootId: string,
): boolean {
  let current = descendantById.get(id);
  while (current?.parent_id && current.parent_id !== rootId) {
    if (checked.has(current.parent_id)) return true;
    current = descendantById.get(current.parent_id);
  }
  return false;
}

// Sums `counts` across only the topmost checked id in each branch, so a
// checked parent + checked child never get added together.
export function sumTopmostCheckedCounts<T extends CategoryRow>(
  checked: ReadonlySet<string>,
  descendantById: ReadonlyMap<string, T>,
  rootId: string,
  counts: Record<string, number>,
): number {
  return Array.from(checked)
    .filter((id) => !hasCheckedAncestor(id, checked, descendantById, rootId))
    .reduce((sum, id) => sum + (counts[id] ?? 0), 0);
}

export function getSelfAndDescendantIds(categories: CategoryRow[], rootId: string): string[] {
  const childrenByParent = new Map<string, string[]>();
  for (const c of categories) {
    if (!c.parent_id) continue;
    const siblings = childrenByParent.get(c.parent_id) ?? [];
    siblings.push(c.id);
    childrenByParent.set(c.parent_id, siblings);
  }

  const ids: string[] = [rootId];
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const childId of childrenByParent.get(current) ?? []) {
      ids.push(childId);
      stack.push(childId);
    }
  }
  return ids;
}
