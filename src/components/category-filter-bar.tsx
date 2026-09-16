"use client";

import { buildCategoryTree, findCategoryPath, type CategoryNode, type CategoryRow } from "@/lib/categories";
import { IconChevronDown } from "@/components/icons";

const ACTIVE_CLASSES = "bg-[#f1efe6] text-[#2b2a24]";
const INACTIVE_CLASSES = "bg-white text-[#55503f]";

function LevelSelect({
  node,
  selectedCategory,
  locale,
  allLabel,
  onSelect,
  isFirst,
}: {
  node: CategoryNode<CategoryRow>;
  selectedCategory?: string;
  locale: string;
  allLabel: string;
  onSelect: (id: string) => void;
  isFirst: boolean;
}) {
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);

  if (node.children.length === 0) return null;

  const path = findCategoryPath([node], selectedCategory);
  const chosenChild = path[1];
  const isActive = selectedCategory === node.id || !!chosenChild;
  const value = selectedCategory === node.id ? node.id : chosenChild ? chosenChild.id : "";

  return (
    <>
      <div className={`relative flex items-stretch ${isFirst ? "" : "border-l border-[#e7e2d8]"}`}>
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value) onSelect(e.target.value);
          }}
          className={`appearance-none border-0 py-2.5 pl-4 pr-9 text-sm font-medium outline-none ${
            isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES
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
              {child.children.length > 0 ? " ›" : ""}
            </option>
          ))}
        </select>
        <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7a7566]" />
      </div>
      {chosenChild && (
        <LevelSelect
          node={chosenChild}
          selectedCategory={selectedCategory}
          locale={locale}
          allLabel={allLabel}
          onSelect={onSelect}
          isFirst={false}
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
    <div className="-mx-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
          !selectedCategory ? `border-[#3f6b3f] ${ACTIVE_CLASSES}` : `border-[#e7e2d8] ${INACTIVE_CLASSES} hover:border-[#3f6b3f]`
        }`}
      >
        {allLabel}
      </button>
      {tree.map((root) => {
        const isActiveRoot = findCategoryPath([root], selectedCategory).length > 0;

        if (root.children.length === 0) {
          return (
            <button
              key={root.id}
              type="button"
              onClick={() => onSelect(root.id)}
              className={`flex-shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
                isActiveRoot ? `border-[#3f6b3f] ${ACTIVE_CLASSES}` : `border-[#e7e2d8] ${INACTIVE_CLASSES} hover:border-[#3f6b3f]`
              }`}
            >
              {locale === "lv" ? root.name_lv : root.name_en}
            </button>
          );
        }

        return (
          <div
            key={root.id}
            className={`flex flex-shrink-0 snap-start items-stretch overflow-hidden rounded-full border shadow-sm transition ${
              isActiveRoot ? "border-[#3f6b3f]" : "border-[#e7e2d8]"
            }`}
          >
            <LevelSelect
              node={root}
              selectedCategory={selectedCategory}
              locale={locale}
              allLabel={allLabel}
              onSelect={onSelect}
              isFirst
            />
          </div>
        );
      })}
    </div>
  );
}
