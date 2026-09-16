"use client";

import { buildCategoryTree, flattenCategoryTree, type CategoryNode, type CategoryRow } from "@/lib/categories";

function RootSelect({
  root,
  selectedCategory,
  locale,
  allLabel,
  onSelect,
}: {
  root: CategoryNode<CategoryRow>;
  selectedCategory?: string;
  locale: string;
  allLabel: string;
  onSelect: (id: string) => void;
}) {
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);
  const descendants = flattenCategoryTree(root.children);
  const isActiveBranch =
    root.id === selectedCategory || descendants.some(({ node }) => node.id === selectedCategory);

  return (
    <select
      value={isActiveBranch ? selectedCategory : ""}
      onChange={(e) => {
        if (e.target.value) onSelect(e.target.value);
      }}
      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        isActiveBranch
          ? "border-[#3f6b3f] bg-[#e7efe1] text-[#3f6b3f]"
          : "border-[#e7e2d8] bg-white text-[#55503f]"
      }`}
    >
      <option value="" disabled>
        {label(root)}
      </option>
      <option value={root.id}>
        {allLabel} — {label(root)}
      </option>
      {descendants.map(({ node, depth }) => (
        <option key={node.id} value={node.id}>
          {"› ".repeat(depth + 1)}
          {label(node)}
        </option>
      ))}
    </select>
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

  return (
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
      {tree.map((root) => (
        <RootSelect
          key={root.id}
          root={root}
          selectedCategory={selectedCategory}
          locale={locale}
          allLabel={allLabel}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
