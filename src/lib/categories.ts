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
