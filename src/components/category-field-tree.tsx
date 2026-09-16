"use client";

import { buildCategoryTree, type CategoryNode, type CategoryRow } from "@/lib/categories";

function hasSelectedDescendant(
  node: CategoryNode<CategoryRow>,
  isSelected: (id: string) => boolean,
): boolean {
  if (isSelected(node.id)) return true;
  return node.children.some((child) => hasSelectedDescendant(child, isSelected));
}

export function CategoryFieldTree({
  categories,
  locale,
  name,
  type,
  isSelected,
}: {
  categories: CategoryRow[];
  locale: string;
  name: string;
  type: "checkbox" | "radio";
  isSelected: (id: string) => boolean;
}) {
  const tree = buildCategoryTree(categories);
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);

  function renderNode(node: CategoryNode<CategoryRow>) {
    const field = (
      <label
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e2d8] bg-white px-3 py-1.5 text-sm transition has-checked:border-[#3f6b3f] has-checked:bg-[#e7efe1] has-checked:text-[#3f6b3f]"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type={type}
          name={name}
          value={node.id}
          defaultChecked={isSelected(node.id)}
          className="sr-only"
        />
        {label(node)}
      </label>
    );

    if (node.children.length === 0) {
      return <div key={node.id}>{field}</div>;
    }

    return (
      <details
        key={node.id}
        className="rounded-lg border border-[#e7e2d8]"
        open={hasSelectedDescendant(node, isSelected)}
      >
        <summary className="cursor-pointer select-none px-3 py-2">{field}</summary>
        <div className="flex flex-wrap gap-2 border-t border-[#e7e2d8] p-3">
          {node.children.map(renderNode)}
        </div>
      </details>
    );
  }

  return <div className="flex flex-col gap-2">{tree.map(renderNode)}</div>;
}
