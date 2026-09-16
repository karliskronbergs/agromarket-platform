"use client";

import { buildCategoryTree, findCategoryPath, type CategoryRow } from "@/lib/categories";

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-[#3f6b3f] bg-[#e7efe1] text-[#3f6b3f]"
          : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f]"
      }`}
    >
      {children}
    </button>
  );
}

export function CategoryFilterBar({
  categories,
  selectedCategory,
  locale,
  allLabel,
  onSelect,
}: {
  categories: CategoryRow[];
  selectedCategory?: string;
  locale: string;
  allLabel: string;
  onSelect: (id: string | null) => void;
}) {
  const tree = buildCategoryTree(categories);
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);
  const path = findCategoryPath(tree, selectedCategory);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Pill active={!selectedCategory} onClick={() => onSelect(null)}>
          {allLabel}
        </Pill>
        {tree.map((root) => (
          <Pill key={root.id} active={path[0]?.id === root.id} onClick={() => onSelect(root.id)}>
            {label(root)}
          </Pill>
        ))}
      </div>
      {path.map((node, i) =>
        node.children.length > 0 ? (
          <div key={node.id} className="flex flex-wrap gap-2 pl-3">
            {node.children.map((child) => (
              <Pill
                key={child.id}
                active={path[i + 1]?.id === child.id}
                onClick={() => onSelect(child.id)}
              >
                {label(child)}
              </Pill>
            ))}
          </div>
        ) : null,
      )}
    </div>
  );
}
