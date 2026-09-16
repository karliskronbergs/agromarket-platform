"use client";

import { buildCategoryTree, type CategoryNode, type CategoryRow } from "@/lib/categories";
import { IconChevronDown, IconCheck } from "@/components/icons";

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
  leafOnly,
}: {
  categories: CategoryRow[];
  locale: string;
  name: string;
  type: "checkbox" | "radio";
  isSelected: (id: string) => boolean;
  leafOnly?: boolean;
}) {
  const tree = buildCategoryTree(categories);
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);

  function renderNode(node: CategoryNode<CategoryRow>, depth: number) {
    const isLeaf = node.children.length === 0;

    if (isLeaf) {
      return (
        <label
          key={node.id}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#e7e2d8] bg-white px-3.5 py-2 text-sm font-medium text-[#55503f] shadow-sm transition hover:border-[#3f6b3f] has-checked:border-[#3f6b3f] has-checked:bg-[#3f6b3f] has-checked:text-white"
        >
          <input
            type={type}
            name={name}
            value={node.id}
            defaultChecked={isSelected(node.id)}
            className="peer sr-only"
          />
          <IconCheck className="hidden h-3.5 w-3.5 peer-checked:inline" />
          {label(node)}
        </label>
      );
    }

    const headerContent =
      leafOnly ? (
        <span className="text-sm font-semibold text-[#2b2a24]">{label(node)}</span>
      ) : (
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

    return (
      <details
        key={node.id}
        className="group overflow-hidden rounded-xl border border-[#e7e2d8] bg-white shadow-sm"
        open={hasSelectedDescendant(node, isSelected)}
        style={depth > 0 ? { marginLeft: 16 } : undefined}
      >
        <summary className="flex cursor-pointer select-none items-center justify-between gap-2 bg-[#faf8f3] px-3.5 py-2.5">
          {headerContent}
          <IconChevronDown className="h-4 w-4 flex-shrink-0 text-[#7a7566] transition-transform group-open:rotate-180" />
        </summary>
        <div className="flex flex-wrap gap-2 p-3">
          {node.children.map((child) => renderNode(child, depth + 1))}
        </div>
      </details>
    );
  }

  return <div className="flex flex-col gap-2">{tree.map((node) => renderNode(node, 0))}</div>;
}
