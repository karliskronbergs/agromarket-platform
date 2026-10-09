"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buildCategoryTree, findCategoryPath, type CategoryNode, type CategoryRow } from "@/lib/categories";

const chipClass = (active: boolean) =>
  `flex-shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
    active
      ? "border-[#3f6e4a] bg-[#eef3ee] text-[#1d2329]"
      : "border-[#e3e6e8] bg-white text-[#5d6670] hover:border-[#3f6e4a]"
  }`;

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
    <div
      data-popover-panel
      className="max-h-72 w-60 overflow-y-auto overscroll-contain rounded-xl border border-[#e3e6e8] bg-white p-1.5 shadow-lg"
    >
      {node.children.map((child) => {
        const isActive = activePath.some((n) => n.id === child.id);
        return (
          <button
            key={child.id}
            type="button"
            onClick={() => onPick(child)}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
              isActive ? "bg-[#eef3ee] font-medium text-[#1d2329]" : "text-[#5d6670] hover:bg-[#f6f7f5]"
            }`}
          >
            <span>{label(child)}</span>
            {child.children.length > 0 && <span className="text-[#8a929a]">›</span>}
          </button>
        );
      })}
    </div>
  );
}

function RootMenu({
  root,
  selectedCategory,
  selectedSubcategory,
  locale,
  onSelect,
}: {
  root: CategoryNode<CategoryRow>;
  selectedCategory?: string;
  selectedSubcategory?: string;
  locale: string;
  onSelect: (category: string | null, subcategory: string | null) => void;
}) {
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<CategoryNode<CategoryRow>[]>([]);
  const [position, setPosition] = useState<{ top: number; left: number; maxHeight: number } | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const effectiveId = selectedSubcategory || selectedCategory;
  const isActiveRoot = findCategoryPath([root], effectiveId).length > 0;

  function close() {
    setOpen(false);
    setPath([]);
  }

  useEffect(() => {
    if (!open) return;

    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-popover-panel]")) return;
      close();
    }
    function onScroll(e: Event) {
      if (panelRef.current?.contains(e.target as Node)) return;
      close();
    }
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  if (root.children.length === 0) {
    return (
      <button type="button" onClick={() => onSelect(root.id, null)} className={chipClass(selectedCategory === root.id)}>
        {label(root)}
      </button>
    );
  }

  function toggle() {
    if (open) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const panelWidth = 240;
      const top = rect.bottom + 8;
      setPosition({
        top,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8)),
        // Leave room for the fixed bottom tab bar (76px, shown on this page)
        // so a tall cascading panel never ends up painted over by it.
        maxHeight: Math.max(160, window.innerHeight - top - 16 - 76),
      });
    }
    setOpen(true);
    setPath([root]);
    onSelect(root.id, null);
  }

  function pick(depth: number, child: CategoryNode<CategoryRow>) {
    if (child.children.length > 0) {
      onSelect(root.id, child.id);
      setPath((p) => [...p.slice(0, depth + 1), child]);
    } else {
      onSelect(root.id, child.id);
      close();
    }
  }

  return (
    <>
      <button ref={buttonRef} type="button" onClick={toggle} className={chipClass(isActiveRoot)}>
        {label(root)}
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              maxHeight: position.maxHeight,
              zIndex: 1100,
            }}
            className="flex flex-col gap-2 overflow-y-auto overscroll-contain"
          >
            {path.map((node, i) => (
              <Panel key={node.id} node={node} activePath={path} locale={locale} onPick={(child) => pick(i, child)} />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

export function CategoryFilterBar({
  categories,
  selectedCategory,
  selectedSubcategory,
  locale,
  allLabel,
  onSelect,
}: {
  categories: CategoryRow[];
  selectedCategory?: string;
  selectedSubcategory?: string;
  locale: string;
  allLabel: string;
  onSelect: (category: string | null, subcategory: string | null) => void;
}) {
  const tree = buildCategoryTree(categories);

  return (
    <div className="-mx-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
      <button type="button" onClick={() => onSelect(null, null)} className={chipClass(!selectedCategory)}>
        {allLabel}
      </button>
      {tree.map((root) => (
        <div key={root.id} className="flex flex-shrink-0 snap-start">
          <RootMenu
            root={root}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            locale={locale}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
