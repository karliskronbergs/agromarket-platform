"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { buildCategoryTree, flattenCategoryTree, type CategoryNode, type CategoryRow } from "@/lib/categories";
import { CATEGORY_ICONS, IconChevronDown, IconChevronLeft, IconCheckmark } from "@/components/icons";

// design_handoff_v2/FLUID.md "Category chip carousel": the selected chip is
// solid green with a white icon/label, not just tinted -- everything else
// stays neutral.
const chipClass = (active: boolean) =>
  `flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium shadow-sm transition ${
    active ? "bg-[#3f6e4a] text-white" : "border border-[#e3e6e8] bg-white text-[#5d6670] hover:border-[#3f6e4a]"
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
      <button data-chip={root.id} type="button" onClick={() => onSelect(root.id, [])} className={chipClass(isActive)}>
        {CategoryIcon && <CategoryIcon className="h-4 w-4 flex-shrink-0" />}
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

  // The dropdown lists every descendant at every depth (the real tree goes
  // 3-4 levels deep), not just direct children -- so a parent and one of
  // its own descendants can both end up checked at once. Counting both
  // would double-count: a checked ancestor's count already rolls up every
  // checked descendant beneath it. Only the topmost checked node in each
  // branch contributes to the total.
  const flatDescendants = flattenCategoryTree(root.children);
  const descendantById = new Map(flatDescendants.map((entry) => [entry.node.id, entry.node]));

  function hasCheckedAncestor(id: string, checked: Set<string>): boolean {
    let current = descendantById.get(id);
    while (current?.parent_id && current.parent_id !== root.id) {
      if (checked.has(current.parent_id)) return true;
      current = descendantById.get(current.parent_id);
    }
    return false;
  }

  const previewCount =
    draft.size > 0
      ? Array.from(draft)
          .filter((id) => !hasCheckedAncestor(id, draft))
          .reduce((sum, id) => sum + (counts[id] ?? 0), 0)
      : root.children.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0);

  const chipLabel =
    isActive && selectedSubcategories.length > 0 ? `${label(root)} · ${selectedSubcategories.length}` : label(root);

  return (
    <>
      <button data-chip={root.id} ref={buttonRef} type="button" onClick={toggle} className={chipClass(isActive)}>
        {CategoryIcon && <CategoryIcon className="h-4 w-4 flex-shrink-0" />}
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
              {flatDescendants.map(({ node: child, depth }) => {
                const checked = draft.has(child.id);
                const count = counts[child.id] ?? 0;
                return (
                  <button
                    key={child.id}
                    type="button"
                    style={{ paddingLeft: 12 + depth * 16 }}
                    onClick={() =>
                      setDraft((prev) => {
                        const next = new Set(prev);
                        if (next.has(child.id)) next.delete(child.id);
                        else next.add(child.id);
                        return next;
                      })
                    }
                    className={`flex w-full items-center justify-between gap-2 rounded-lg py-2.5 pr-3 text-left text-sm transition ${
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
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [canScrollL, setCanScrollL] = useState(false);
  const [canScrollR, setCanScrollR] = useState(false);
  const firstRevealRef = useRef(true);

  const updateEdges = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollL(el.scrollLeft > 4);
    setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    Array.from(el.children).forEach((child) => ro.observe(child));
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, tree.length]);

  // Keep the selected chip in view -- on first mount (e.g. a category is
  // already selected from the URL) this is instant; after that, a user
  // picking a different chip scrolls smoothly.
  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const id = selectedCategory ?? "all";
    const chip = el.querySelector<HTMLElement>(`[data-chip="${id}"]`);
    if (!chip) return;
    chip.scrollIntoView({
      behavior: firstRevealRef.current ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
    firstRevealRef.current = false;
  }, [selectedCategory]);

  function step(dir: 1 | -1) {
    const el = rowRef.current;
    if (!el) return;
    const chips = Array.from(el.querySelectorAll<HTMLElement>("[data-chip]"));
    const vw = el.clientWidth;
    const sl = el.scrollLeft;
    let target: number;
    if (dir > 0) {
      const next = chips.find((c) => c.offsetLeft + c.offsetWidth > sl + vw - 40);
      target = next ? next.offsetLeft - 40 : el.scrollWidth;
    } else {
      const prev = [...chips].reverse().find((c) => c.offsetLeft < sl + 40);
      target = prev ? prev.offsetLeft + prev.offsetWidth + 40 - vw : 0;
    }
    el.scrollTo({ left: target, behavior: "smooth" });
  }

  // Edges fade out only on the side where more chips are hidden, so people
  // can tell the row continues -- design_handoff_v2/FLUID.md "Category chip
  // carousel".
  const mask = `linear-gradient(to right,${canScrollL ? "transparent 0,transparent 8px,#000 28px" : "#000 0"},${
    canScrollR ? "#000 calc(100% - 28px),transparent calc(100% - 8px),transparent 100%" : "#000 100%"
  })`;

  return (
    <div className="relative -mx-6 sm:mx-0">
      <div
        ref={rowRef}
        onWheel={(e) => {
          const el = rowRef.current;
          if (!el || el.scrollWidth <= el.clientWidth) return;
          if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }}
        style={{ WebkitMaskImage: mask, maskImage: mask }}
        className="flex gap-2.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        <button data-chip="all" type="button" onClick={() => onSelect(null, [])} className={chipClass(!selectedCategory)}>
          {allLabel}
        </button>
        {tree.map((root) => (
          <div key={root.id} className="flex flex-shrink-0">
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
      {canScrollL && (
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Iepriekšējās kategorijas"
          className="absolute left-2 top-1/2 hidden h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-[#1d2329] shadow-[0_1px_2px_rgba(20,26,32,0.1),0_4px_12px_rgba(20,26,32,0.12)] backdrop-blur-[12px] transition hover:bg-white active:scale-90 sm:flex"
        >
          <IconChevronLeft className="h-3 w-3" />
        </button>
      )}
      {canScrollR && (
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Vairāk kategoriju"
          className="absolute right-2 top-1/2 hidden h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-[#1d2329] shadow-[0_1px_2px_rgba(20,26,32,0.1),0_4px_12px_rgba(20,26,32,0.12)] backdrop-blur-[12px] transition hover:bg-white active:scale-90 sm:flex"
        >
          <IconChevronLeft className="h-3 w-3 rotate-180" />
        </button>
      )}
    </div>
  );
}
