"use client";

import { buildCategoryTree, findCategoryPath, type CategoryNode, type CategoryRow } from "@/lib/categories";

function getParentNode(
  tree: CategoryNode<CategoryRow>[],
  node: CategoryNode<CategoryRow>,
): CategoryNode<CategoryRow> | null {
  const path = findCategoryPath(tree, node.id);
  return path.length >= 2 ? path[path.length - 2] : null;
}

export function CategoryFilterBar({
  categories,
  selectedCategory,
  locale,
  allLabel,
  backLabel,
  onSelect,
}: {
  categories: CategoryRow[];
  selectedCategory?: string;
  locale: string;
  allLabel: string;
  backLabel: string;
  onSelect: (id: string | null) => void;
}) {
  const tree = buildCategoryTree(categories);
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);
  const path = findCategoryPath(tree, selectedCategory);
  const deepest = path[path.length - 1];

  let contextNode: CategoryNode<CategoryRow> | null = null;
  if (deepest) {
    contextNode = deepest.children.length > 0 ? deepest : (path[path.length - 2] ?? null);
  }

  const options = contextNode ? contextNode.children : tree;
  const backTarget = contextNode ? getParentNode(tree, contextNode) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
            !selectedCategory
              ? "border-[#3f6b3f] bg-[#e7efe1] text-[#3f6b3f]"
              : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f]"
          }`}
        >
          {allLabel}
        </button>
        {contextNode && (
          <button
            type="button"
            onClick={() => onSelect(backTarget ? backTarget.id : null)}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#e7e2d8] bg-white px-4 py-2.5 text-sm font-medium text-[#55503f] hover:border-[#3f6b3f]"
          >
            <span aria-hidden>←</span>
            {backTarget ? label(backTarget) : backLabel}
          </button>
        )}
      </div>
      <select
        value={selectedCategory ?? ""}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full rounded-full border border-[#e7e2d8] bg-white px-4 py-2.5 text-sm font-medium text-[#55503f]"
      >
        {contextNode ? (
          <option value={contextNode.id}>
            {allLabel} — {label(contextNode)}
          </option>
        ) : (
          <option value="">{allLabel}</option>
        )}
        {options.map((node) => (
          <option key={node.id} value={node.id}>
            {label(node)}
          </option>
        ))}
      </select>
    </div>
  );
}
