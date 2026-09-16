"use client";

import { useEffect, useRef, useState } from "react";
import { buildCategoryTree, type CategoryNode, type CategoryRow } from "@/lib/categories";

export function CategoryFilterMenu({
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tree = buildCategoryTree(categories);
  const byId = new Map(categories.map((c) => [c.id, c]));
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);
  const selectedLabel =
    selectedCategory && byId.has(selectedCategory) ? label(byId.get(selectedCategory)!) : allLabel;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function isInBranch(node: CategoryNode<CategoryRow>): boolean {
    if (node.id === selectedCategory) return true;
    return node.children.some(isInBranch);
  }

  function selectCategory(id: string | null, keepOpen = false) {
    onSelect(id);
    if (!keepOpen) setOpen(false);
  }

  function renderNode(node: CategoryNode<CategoryRow>) {
    const isSelected = node.id === selectedCategory;

    if (node.children.length === 0) {
      return (
        <button
          key={node.id}
          type="button"
          onClick={() => selectCategory(node.id)}
          className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${
            isSelected ? "bg-[#e7efe1] font-medium text-[#3f6b3f]" : "text-[#55503f] hover:bg-[#faf8f3]"
          }`}
        >
          {label(node)}
        </button>
      );
    }

    return (
      <details key={node.id} open={isInBranch(node)} className="mt-0.5">
        <summary
          className={`cursor-pointer select-none rounded-md px-2 py-1.5 text-sm ${
            isSelected ? "bg-[#e7efe1] font-medium text-[#3f6b3f]" : "font-medium text-[#2b2a24] hover:bg-[#faf8f3]"
          }`}
          onClick={() => selectCategory(node.id, true)}
        >
          {label(node)}
        </summary>
        <div className="ml-3 flex flex-col gap-0.5 border-l border-[#e7e2d8] py-1 pl-2">
          {node.children.map(renderNode)}
        </div>
      </details>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-[#e7e2d8] bg-white px-3 py-1.5 text-xs font-medium text-[#55503f]"
      >
        {selectedLabel} ▾
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 max-h-96 w-72 overflow-y-auto rounded-lg border border-[#e7e2d8] bg-white p-2 shadow-lg">
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${
              !selectedCategory ? "bg-[#e7efe1] font-medium text-[#3f6b3f]" : "text-[#55503f] hover:bg-[#faf8f3]"
            }`}
          >
            {allLabel}
          </button>
          {tree.map(renderNode)}
        </div>
      )}
    </div>
  );
}
