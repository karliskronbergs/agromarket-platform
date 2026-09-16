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
