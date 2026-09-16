"use client";

import { buildCategoryTree, findCategoryPath, type CategoryNode, type CategoryRow } from "@/lib/categories";
import { IconChevronDown, IconChevronLeft } from "@/components/icons";

function getParentNode(
  root: CategoryNode<CategoryRow>,
  node: CategoryNode<CategoryRow>,
): CategoryNode<CategoryRow> | null {
  const path = findCategoryPath([root], node.id);
  return path.length >= 2 ? path[path.length - 2] : null;
}

function RootFilter({
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

  if (root.children.length === 0) {
    return (
      <button
        type="button"
        onClick={() => onSelect(root.id)}
        className={`flex-shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
          selectedCategory === root.id
            ? "border-[#3f6b3f] bg-[#3f6b3f] text-white"
            : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f] hover:text-[#3f6b3f]"
        }`}
      >
        {label(root)}
      </button>
    );
  }

  const path = findCategoryPath([root], selectedCategory);
  const isActive = path.length > 0;
  const deepest = path[path.length - 1];

  let contextNode: CategoryNode<CategoryRow> = root;
  if (deepest) {
    contextNode = deepest.children.length > 0 ? deepest : (path[path.length - 2] ?? root);
  }

  const showBack = contextNode.id !== root.id;
  const backTarget = showBack ? getParentNode(root, contextNode) : null;

  return (
    <div
      className={`flex flex-shrink-0 items-stretch overflow-hidden rounded-full border shadow-sm transition ${
        isActive ? "border-[#3f6b3f]" : "border-[#e7e2d8]"
      }`}
    >
      {showBack && (
        <button
          type="button"
          onClick={() => onSelect(backTarget ? backTarget.id : root.id)}
          aria-label="Back"
          className="flex items-center border-r border-[#e7e2d8] bg-[#faf8f3] px-3 text-[#55503f] transition hover:bg-[#f1efe6] hover:text-[#3f6b3f]"
        >
          <IconChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div className="relative flex items-stretch">
        <select
          value={isActive ? selectedCategory : ""}
          onChange={(e) => {
            if (e.target.value) onSelect(e.target.value);
          }}
          className={`appearance-none border-0 py-2.5 pl-4 pr-9 text-sm font-medium outline-none ${
            isActive ? "bg-[#3f6b3f] text-white" : "bg-white text-[#55503f]"
          }`}
        >
          <option value="" disabled>
            {label(root)}
          </option>
          <option value={contextNode.id}>
            {allLabel} — {label(contextNode)}
          </option>
          {contextNode.children.map((child) => (
            <option key={child.id} value={child.id}>
              {label(child)}
              {child.children.length > 0 ? " ›" : ""}
            </option>
          ))}
        </select>
        <IconChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${
            isActive ? "text-white" : "text-[#7a7566]"
          }`}
        />
      </div>
    </div>
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
    <div className="-mx-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
          !selectedCategory
            ? "border-[#3f6b3f] bg-[#3f6b3f] text-white"
            : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f] hover:text-[#3f6b3f]"
        }`}
      >
        {allLabel}
      </button>
      {tree.map((root) => (
        <div key={root.id} className="flex flex-shrink-0 snap-start">
          <RootFilter
            root={root}
            selectedCategory={selectedCategory}
            locale={locale}
            allLabel={allLabel}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
