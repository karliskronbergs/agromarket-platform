"use client";

import { useEffect, useRef, useState } from "react";
import { buildCategoryTree, findCategoryPath, type CategoryNode, type CategoryRow } from "@/lib/categories";

function Panel({
  node,
  activePath,
  locale,
  onPick,
}: {
  node: CategoryNode<CategoryRow>;
  activePath: CategoryNode<CategoryRow>[];
  locale: string;
  onPick: (child: CategoryNode<CategoryRow>) => void;
}) {
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);

  return (
    <div className="max-h-72 w-60 overflow-y-auto rounded-xl border border-[#e7e2d8] bg-white p-1.5 shadow-lg">
      {node.children.map((child) => {
        const isActive = activePath.some((n) => n.id === child.id);
        return (
          <button
            key={child.id}
            type="button"
            onClick={() => onPick(child)}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
              isActive ? "bg-[#f1efe6] font-medium text-[#2b2a24]" : "text-[#55503f] hover:bg-[#faf8f3]"
            }`}
          >
            <span>{label(child)}</span>
            {child.children.length > 0 && <span className="text-[#7a7566]">›</span>}
          </button>
        );
      })}
    </div>
  );
}

function RootMenu({
  root,
  selectedCategory,
  locale,
  onSelect,
}: {
  root: CategoryNode<CategoryRow>;
  selectedCategory?: string;
  locale: string;
  onSelect: (id: string) => void;
}) {
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<CategoryNode<CategoryRow>[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isActiveRoot = findCategoryPath([root], selectedCategory).length > 0;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPath([]);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (root.children.length === 0) {
    return (
      <button
        type="button"
        onClick={() => onSelect(root.id)}
        className={`flex-shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
          selectedCategory === root.id
            ? "border-[#3f6b3f] bg-[#f1efe6] text-[#2b2a24]"
            : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f]"
        }`}
      >
        {label(root)}
      </button>
    );
  }

  function toggle() {
    if (open) {
      setOpen(false);
      setPath([]);
    } else {
      setOpen(true);
      setPath([root]);
      onSelect(root.id);
    }
  }

  function pick(depth: number, child: CategoryNode<CategoryRow>) {
    onSelect(child.id);
    if (child.children.length > 0) {
      setPath((p) => [...p.slice(0, depth + 1), child]);
    } else {
      setOpen(false);
      setPath([]);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={toggle}
        className={`rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
          isActiveRoot
            ? "border-[#3f6b3f] bg-[#f1efe6] text-[#2b2a24]"
            : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f]"
        }`}
      >
        {label(root)}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 flex flex-col gap-2">
          {path.map((node, i) => (
            <Panel
              key={node.id}
              node={node}
              activePath={path}
              locale={locale}
              onPick={(child) => pick(i, child)}
            />
          ))}
        </div>
      )}
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
            ? "border-[#3f6b3f] bg-[#f1efe6] text-[#2b2a24]"
            : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f]"
        }`}
      >
        {allLabel}
      </button>
      {tree.map((root) => (
        <div key={root.id} className="flex flex-shrink-0 snap-start">
          <RootMenu root={root} selectedCategory={selectedCategory} locale={locale} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
