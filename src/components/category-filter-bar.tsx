"use client";

import { buildCategoryTree, findCategoryPath, type CategoryNode, type CategoryRow } from "@/lib/categories";

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
      className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
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
  const deepest = path[path.length - 1];

  let currentLevel: CategoryNode<CategoryRow>[];
  if (!deepest) {
    currentLevel = tree;
  } else if (deepest.children.length > 0) {
    currentLevel = deepest.children;
  } else {
    const parent = path[path.length - 2];
    currentLevel = parent ? parent.children : tree;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {path.length > 0 && (
        <div className="flex flex-nowrap items-center gap-1 overflow-x-auto text-xs text-[#7a7566]">
          <button type="button" onClick={() => onSelect(null)} className="flex-shrink-0 hover:text-[#3f6b3f]">
            {allLabel}
          </button>
          {path.map((node, i) => (
            <span key={node.id} className="flex flex-shrink-0 items-center gap-1">
              <span>›</span>
              <button
                type="button"
                onClick={() => onSelect(node.id)}
                className={`hover:text-[#3f6b3f] ${i === path.length - 1 ? "font-medium text-[#2b2a24]" : ""}`}
              >
                {label(node)}
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-0.5">
        {path.length === 0 && (
          <Pill active={!selectedCategory} onClick={() => onSelect(null)}>
            {allLabel}
          </Pill>
        )}
        {currentLevel.map((node) => (
          <Pill key={node.id} active={node.id === selectedCategory} onClick={() => onSelect(node.id)}>
            {label(node)}
          </Pill>
        ))}
      </div>
    </div>
  );
}
