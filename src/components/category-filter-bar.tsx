"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { buildCategoryTree, type CategoryNode, type CategoryRow } from "@/lib/categories";
import { CATEGORY_ICONS, IconChevronDown, IconCheckmark } from "@/components/icons";

const chipClass = (active: boolean) =>
  `flex flex-shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
    active
      ? "border-[#3f6e4a] bg-[#eef3ee] text-[#1d2329]"
      : "border-[#e3e6e8] bg-white text-[#5d6670] hover:border-[#3f6e4a]"
  }`;

function RootChip({
  root,
  selectedCategory,
  selectedSubcategories,
  counts,
  locale,
  onSelect,
}: {
  root: CategoryNode<CategoryRow>;
  selectedCategory?: string;
  selectedSubcategories: string[];
  counts: Record<string, number>;
  locale: string;
  onSelect: (category: string | null, subcategoryIds: string[]) => void;
}) {
  const t = useTranslations("Map");
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [position, setPosition] = useState<{ top: number; left: number; maxHeight: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isActive = selectedCategory === root.id;
  const CategoryIcon = CATEGORY_ICONS[root.slug ?? ""];

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
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
      <button type="button" onClick={() => onSelect(root.id, [])} className={chipClass(isActive)}>
        {CategoryIcon && <CategoryIcon className="h-[18px] w-[18px]" />}
        {label(root)}
      </button>
    );
  }

  function toggle() {
    if (open) {
      close();
      return;
    }
    setDraft(new Set(isActive ? selectedSubcategories : []));
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const panelWidth = 300;
      const top = rect.bottom + 8;
      setPosition({
        top,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8)),
        maxHeight: Math.max(200, window.innerHeight - top - 16),
      });
    }
    setOpen(true);
    // Selecting the top category (if not already selected) as soon as the
    // dropdown opens -- not only once "Rādīt N rezultātus" is pressed --
    // is what makes the server compute and send down this category's
    // per-child counts in time for the dropdown to show them.
    if (!isActive) onSelect(root.id, selectedSubcategories);
  }

  const previewCount =
    draft.size > 0
      ? root.children.reduce((sum, c) => sum + (draft.has(c.id) ? (counts[c.id] ?? 0) : 0), 0)
      : root.children.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0);

  const chipLabel =
    isActive && selectedSubcategories.length > 0 ? `${label(root)} · ${selectedSubcategories.length}` : label(root);

  return (
    <>
      <button ref={buttonRef} type="button" onClick={toggle} className={chipClass(isActive)}>
        {CategoryIcon && <CategoryIcon className="h-[18px] w-[18px]" />}
        {chipLabel}
        <IconChevronDown className={`h-3.5 w-3.5 flex-shrink-0 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            data-popover-panel
            style={{ position: "fixed", top: position.top, left: position.left, width: 300, maxHeight: position.maxHeight, zIndex: 1100 }}
            className="flex flex-col overflow-hidden rounded-xl border border-[#e3e6e8] bg-white shadow-lg"
          >
            <div className="flex-1 overflow-y-auto overscroll-contain p-1.5">
              <button
                type="button"
                onClick={() => setDraft(new Set())}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  draft.size === 0 ? "bg-[#eef3ee] font-medium text-[#1d2329]" : "text-[#5d6670] hover:bg-[#f5f6f4]"
                }`}
              >
                <span>{t("allSubcategories")}</span>
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    draft.size === 0 ? "border-[#3f6e4a] bg-[#3f6e4a]" : "border-[#d9dee2] bg-white"
                  }`}
                >
                  <IconCheckmark className={`h-3.5 w-3.5 text-white ${draft.size === 0 ? "opacity-100" : "opacity-0"}`} />
                </span>
              </button>
              <div className="my-1 h-px bg-[#eef0f1]" />
              {root.children.map((child) => {
                const checked = draft.has(child.id);
                const count = counts[child.id] ?? 0;
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => {
                        const next = new Set(prev);
                        if (next.has(child.id)) next.delete(child.id);
                        else next.add(child.id);
                        return next;
                      })
                    }
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      checked ? "bg-[#eef3ee] font-medium text-[#1d2329]" : "text-[#5d6670] hover:bg-[#f5f6f4]"
                    }`}
                  >
                    <span className="truncate">{label(child)}</span>
                    <span className="flex flex-shrink-0 items-center gap-2">
                      <span className="text-xs text-[#8a929a]">{count}</span>
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          checked ? "border-[#3f6e4a] bg-[#3f6e4a]" : "border-[#d9dee2] bg-white"
                        }`}
                      >
                        <IconCheckmark className={`h-3.5 w-3.5 text-white ${checked ? "opacity-100" : "opacity-0"}`} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-[#eef0f1] p-2">
              <button
                type="button"
                onClick={() => setDraft(new Set())}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#5d6670] hover:bg-[#f5f6f4]"
              >
                {t("clearFilters")}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelect(root.id, Array.from(draft));
                  close();
                }}
                className="rounded-lg bg-[#3f6e4a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#355d3e]"
              >
                {t("showSubcategoryResults", { count: previewCount })}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function CategoryFilterBar({
  categories,
  selectedCategory,
  selectedSubcategories,
  counts,
  locale,
  allLabel,
  onSelect,
}: {
  categories: CategoryRow[];
  selectedCategory?: string;
  selectedSubcategories: string[];
  counts: Record<string, number>;
  locale: string;
  allLabel: string;
  onSelect: (category: string | null, subcategoryIds: string[]) => void;
}) {
  const tree = buildCategoryTree(categories);

  return (
    <div className="-mx-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-6 pb-1 scroll-pl-6 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 sm:scroll-pl-0 [&::-webkit-scrollbar]:hidden">
      <button type="button" onClick={() => onSelect(null, [])} className={chipClass(!selectedCategory)}>
        {allLabel}
      </button>
      {tree.map((root) => (
        <div key={root.id} className="flex flex-shrink-0 snap-start">
          <RootChip
            root={root}
            selectedCategory={selectedCategory}
            selectedSubcategories={selectedCategory === root.id ? selectedSubcategories : []}
            counts={selectedCategory === root.id ? counts : {}}
            locale={locale}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
