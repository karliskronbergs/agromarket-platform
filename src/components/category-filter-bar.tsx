"use client";

import { buildCategoryTree, findCategoryPath, type CategoryNode, type CategoryRow } from "@/lib/categories";

function LevelSelect({
  node,
  selectedCategory,
  locale,
  allLabel,
  onSelect,
}: {
  node: CategoryNode<CategoryRow>;
  selectedCategory?: string;
  locale: string;
  allLabel: string;
  onSelect: (id: string) => void;
}) {
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);

  if (node.children.length === 0) return null;

  const path = findCategoryPath([node], selectedCategory);
  const chosenChild = path[1];
  const value = selectedCategory === node.id ? node.id : (chosenChild ? chosenChild.id : "");

  return (
    <>
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value) onSelect(e.target.value);
        }}
        className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
          value
            ? "border-[#3f6b3f] bg-[#e7efe1] text-[#3f6b3f]"
            : "border-[#e7e2d8] bg-white text-[#55503f]"
        }`}
      >
        <option value="" disabled>
          {label(node)}
        </option>
        <option value={node.id}>
          {allLabel} — {label(node)}
        </option>
        {node.children.map((child) => (
          <option key={child.id} value={child.id}>
            {label(child)}
          </option>
        ))}
      </select>
      {chosenChild && (
        <LevelSelect
          node={chosenChild}
          selectedCategory={selectedCategory}
          locale={locale}
          allLabel={allLabel}
          onSelect={onSelect}
        />
      )}
    </>
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
      {tree.map((root) =>
        root.children.length === 0 ? (
          <button
            key={root.id}
            type="button"
            onClick={() => onSelect(root.id)}
            className={`flex-shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
              selectedCategory === root.id
                ? "border-[#3f6b3f] bg-[#e7efe1] text-[#3f6b3f]"
                : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f]"
            }`}
          >
            {locale === "lv" ? root.name_lv : root.name_en}
          </button>
        ) : (
          <LevelSelect
            key={root.id}
            node={root}
            selectedCategory={selectedCategory}
            locale={locale}
            allLabel={allLabel}
            onSelect={onSelect}
          />
        ),
      )}
    </div>
  );
}
