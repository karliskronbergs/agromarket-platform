"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { buildCategoryTree, flattenCategoryTree, type CategoryNode, type CategoryRow } from "@/lib/categories";
import { CATEGORY_ICONS, IconChevronDown, IconChevronLeft, IconCheckmark } from "@/components/icons";
import { usePrefersReducedMotion, fadeTransition } from "@/lib/motion";
import type { MapMode } from "@/components/map-view";

// design_handoff_v2/MAP_PANEL_SPEC.md "2.4": the selected chip is solid
// green with a white label (icons use currentColor so they follow suit
// automatically), everything else stays neutral -- no border, no white fill.
const chipClass = (active: boolean, hasIcon: boolean) =>
  `flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full text-[13px] font-medium transition active:scale-95 ${
    hasIcon ? "py-[7px] pl-[10px] pr-3" : "px-3 py-[7px]"
  } ${active ? "bg-[#3f6e4a] text-white" : "bg-black/[0.06] text-[#1d2329]"}`;

// MAP_PANEL_SPEC.md "2.5": a round checkbox for "Visas apakškategorijas",
// a rounded-square one for every real subcategory row underneath it.
function Checkbox({ checked, square }: { checked: boolean; square?: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center transition-all ${
        square ? "rounded-[6px]" : "rounded-full"
      } ${checked ? "bg-[#3f6e4a]" : "bg-transparent shadow-[inset_0_0_0_1.5px_#c3c9ce]"}`}
    >
      <IconCheckmark className={`h-3.5 w-3.5 text-white ${checked ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}

function RootChip({
  root,
  mode,
  selectedCategory,
  selectedSubcategories,
  counts,
  locale,
  onSelect,
}: {
  root: CategoryNode<CategoryRow>;
  mode: MapMode;
  selectedCategory?: string;
  selectedSubcategories: string[];
  counts: Record<string, number>;
  locale: string;
  onSelect: (category: string | null, subcategoryIds: string[]) => void;
}) {
  const t = useTranslations("Map");
  const reducedMotion = usePrefersReducedMotion();
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [position, setPosition] = useState<{ top: number; left: number; width: number; maxHeight: number; originX: number } | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isActive = selectedCategory === root.id;
  const CategoryIcon = CATEGORY_ICONS[root.slug ?? ""];
  // createPortal needs to run unconditionally (not just while `open`) so
  // AnimatePresence can mount the exit animation -- but `document` doesn't
  // exist during SSR, so gate the portal on having mounted client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
      <button data-chip={root.id} type="button" onClick={() => onSelect(root.id, [])} className={chipClass(isActive, !!CategoryIcon)}>
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
    // MAP_PANEL_SPEC.md "2.5": the popover is roughly the panel's own width
    // minus 24px, not a fixed size -- the panel is this chip's nearest
    // [data-panel-root] ancestor (the desktop floating card or the mobile
    // sheet), so measure that instead of hardcoding a width.
    const panelRoot = buttonRef.current?.closest<HTMLElement>("[data-panel-root]");
    const panelWidth = panelRoot ? panelRoot.clientWidth - 24 : 300;
    if (rect) {
      const top = rect.bottom + 8;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8));
      setPosition({
        top,
        left,
        width: panelWidth,
        maxHeight: Math.max(200, window.innerHeight - top - 16),
        originX: rect.left + rect.width / 2 - left,
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

  const showResultsText = t(mode === "profiles" ? "showSubcategoryResultsProfiles" : "showSubcategoryResultsListings", {
    count: previewCount,
  });

  const chipLabel =
    isActive && selectedSubcategories.length > 0 ? `${label(root)} · ${selectedSubcategories.length}` : label(root);

  return (
    <>
      <button data-chip={root.id} ref={buttonRef} type="button" onClick={toggle} className={chipClass(isActive, !!CategoryIcon)}>
        {CategoryIcon && <CategoryIcon className="h-4 w-4 flex-shrink-0" />}
        {chipLabel}
        <IconChevronDown
          className={`h-2.5 w-2.5 flex-shrink-0 opacity-60 transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] ${open ? "rotate-180" : ""}`}
        />
      </button>
      {mounted &&
        createPortal(
        <AnimatePresence>
          {open && position && (
            <motion.div
              ref={panelRef}
              data-popover-panel
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
                zIndex: 1100,
                transformOrigin: `${position.originX}px top`,
              }}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              transition={reducedMotion ? fadeTransition : { type: "spring", bounce: 0, duration: 0.3 }}
              className="flex flex-col overflow-hidden rounded-[18px] bg-white/[0.94] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(20,26,32,0.06),0_18px_48px_rgba(20,26,32,0.22)] backdrop-blur-[24px] backdrop-saturate-[1.8]"
            >
              <div className="flex flex-shrink-0 items-center gap-2 px-3 pb-2 pt-3">
                {CategoryIcon && <CategoryIcon className="h-[22px] w-[22px] flex-shrink-0 text-[#1d2329]" />}
                <span className="flex-1 truncate text-[15px] font-semibold text-[#1d2329]">{label(root)}</span>
                {draft.size > 0 && (
                  <button type="button" onClick={() => setDraft(new Set())} className="text-[13px] font-medium text-[#3f6e4a]">
                    {t("clearFilters")}
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-1.5">
                <button
                  type="button"
                  onClick={() => setDraft(new Set())}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-[10px] py-[11px] text-left text-[15px] transition ${
                    draft.size === 0 ? "bg-[#eef3ee] font-medium text-[#1d2329]" : "text-[#1d2329] hover:bg-black/[0.03]"
                  }`}
                >
                  <span>{t("allSubcategories")}</span>
                  <Checkbox checked={draft.size === 0} />
                </button>
                <div className="my-1 h-px bg-[#eef0f1]" />
                {flatDescendants.map(({ node: child, depth }) => {
                  const checked = draft.has(child.id);
                  const count = counts[child.id] ?? 0;
                  return (
                    <button
                      key={child.id}
                      type="button"
                      style={{ paddingLeft: 10 + depth * 16 }}
                      onClick={() =>
                        setDraft((prev) => {
                          const next = new Set(prev);
                          if (next.has(child.id)) next.delete(child.id);
                          else next.add(child.id);
                          return next;
                        })
                      }
                      className={`flex w-full items-center justify-between gap-2 rounded-xl py-[11px] pr-[10px] text-left text-[15px] transition ${
                        checked ? "bg-[#eef3ee] font-medium text-[#1d2329]" : "text-[#1d2329] hover:bg-black/[0.03]"
                      }`}
                    >
                      <span className="truncate">{label(child)}</span>
                      <span className="flex flex-shrink-0 items-center gap-2">
                        <span className="text-[13px] [font-variant-numeric:tabular-nums] text-[#8a929a]">{count}</span>
                        <Checkbox checked={checked} square />
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex-shrink-0 p-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(root.id, Array.from(draft));
                    close();
                  }}
                  className="w-full rounded-xl bg-[#3f6e4a] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-[#355d3e]"
                >
                  {showResultsText}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export function CategoryFilterBar({
  categories,
  mode,
  selectedCategory,
  selectedSubcategories,
  counts,
  locale,
  allLabel,
  onSelect,
}: {
  categories: CategoryRow[];
  mode: MapMode;
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

  // MAP_PANEL_SPEC.md "2.4": clicking an arrow lands the first partly-hidden
  // chip 40px from that edge, not a fixed-pixel scroll.
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
  // can tell the row continues -- MAP_PANEL_SPEC.md "2.4".
  const mask = `linear-gradient(to right,${canScrollL ? "transparent 0,transparent 8px,#000 56px" : "#000 0"},${
    canScrollR ? "#000 calc(100% - 56px),transparent calc(100% - 8px),transparent 100%" : "#000 100%"
  })`;

  return (
    <div className="relative mx-[-16px]">
      <div
        ref={rowRef}
        onWheel={(e) => {
          // The subcategory dropdown is portaled to document.body, but
          // React bubbles its events up the *component* tree regardless --
          // so a scroll over the open dropdown still reaches this handler.
          // Without this guard it hijacks that scroll into the chip row's
          // own horizontal scroll (via preventDefault below) instead of
          // letting the dropdown's own overflow-y-auto panel scroll.
          if ((e.target as HTMLElement).closest("[data-popover-panel]")) return;
          const el = rowRef.current;
          if (!el || el.scrollWidth <= el.clientWidth) return;
          if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }}
        style={{ WebkitMaskImage: mask, maskImage: mask }}
        className="flex gap-1.5 overflow-x-auto px-4 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button data-chip="all" type="button" onClick={() => onSelect(null, [])} className={chipClass(!selectedCategory, false)}>
          {allLabel}
        </button>
        {tree.map((root) => (
          <div key={root.id} className="flex flex-shrink-0">
            <RootChip
              root={root}
              mode={mode}
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
          className="absolute left-2 top-1/2 hidden h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-[#1d2329] shadow-[0_1px_2px_rgba(20,26,32,0.1),0_4px_12px_rgba(20,26,32,0.12)] backdrop-blur-[12px] transition active:scale-90 min-[900px]:flex"
          style={{ marginTop: "-15px" }}
        >
          <IconChevronLeft className="h-3 w-3" />
        </button>
      )}
      {canScrollR && (
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Vairāk kategoriju"
          className="absolute right-2 top-1/2 hidden h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-[#1d2329] shadow-[0_1px_2px_rgba(20,26,32,0.1),0_4px_12px_rgba(20,26,32,0.12)] backdrop-blur-[12px] transition active:scale-90 min-[900px]:flex"
          style={{ marginTop: "-15px" }}
        >
          <IconChevronLeft className="h-3 w-3 rotate-180" />
        </button>
      )}
    </div>
  );
}
