"use client";

import { useState } from "react";
import {
  buildCategoryTree,
  findCategoryPath,
  flattenCategoryTree,
  type CategoryNode,
  type CategoryRow,
} from "@/lib/categories";
import { BottomSheet } from "@/components/bottom-sheet";
import { IconClose } from "@/components/icons";

const topChipClass = (active: boolean) =>
  `flex-shrink-0 snap-start whitespace-nowrap rounded-full border px-3.5 py-[7px] text-sm transition ${
    active
      ? "border-[#3f6e4a] bg-[#3f6e4a] text-white"
      : "border-[#e3e6e8] bg-white text-[#1d2329] hover:border-[#3f6e4a]"
  }`;

const subChipClass = (active: boolean) =>
  `flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition ${
    active ? "bg-[#eef3ee] text-[#2f5538]" : "bg-[#f0f2f0] text-[#1d2329] hover:bg-[#e3e6e8]"
  }`;

export function CategoryFilterBar({
  categories,
  selectedCategory,
  selectedSubcategory,
  locale,
  allLabel,
  allSubcategoryLabel,
  onSelect,
  trailing,
}: {
  categories: CategoryRow[];
  selectedCategory?: string;
  selectedSubcategory?: string;
  locale: string;
  allLabel: string;
  allSubcategoryLabel: string;
  onSelect: (category: string | null, subcategory: string | null) => void;
  trailing?: React.ReactNode;
}) {
  const label = (c: CategoryRow) => (locale === "lv" ? c.name_lv : c.name_en);
  const tree = buildCategoryTree(categories);
  const effectiveId = selectedSubcategory || selectedCategory;
  const path = findCategoryPath(tree, effectiveId);
  const root = path[0];
  const [sheetRoot, setSheetRoot] = useState<CategoryNode<CategoryRow> | null>(null);

  // Rows of subcategory chips: one per level of `path` that has children.
  const rows = path.filter((node) => node.children.length > 0);

  function pickTop(nodeId: string | null) {
    onSelect(nodeId, null);
  }

  function pickSub(rootId: string, subId: string | null) {
    onSelect(rootId, subId);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Top-level chips (shared row for both breakpoints) */}
      <div className="-mx-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        <button type="button" onClick={() => pickTop(null)} className={topChipClass(!root)}>
          {allLabel}
        </button>
        {tree.map((node) => {
          const isActiveRoot = root?.id === node.id;
          const hasDeepSelection = isActiveRoot && path.length > 1;
          return (
            <div key={node.id} className="contents sm:hidden">
              {hasDeepSelection ? (
                <span className={`${topChipClass(true)} flex items-center gap-1.5`}>
                  <button type="button" onClick={() => setSheetRoot(node)}>
                    {label(node)} · {label(path[path.length - 1])}
                  </button>
                  <button type="button" aria-label="Clear" onClick={() => pickTop(node.id)}>
                    <IconClose className="h-3 w-3" />
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => (node.children.length > 0 ? setSheetRoot(node) : pickTop(node.id))}
                  className={topChipClass(isActiveRoot)}
                >
                  {label(node)}
                </button>
              )}
            </div>
          );
        })}
        {tree.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => pickTop(node.id)}
            className={`${topChipClass(root?.id === node.id)} hidden sm:inline-flex`}
          >
            {label(node)}
          </button>
        ))}
        {trailing}
      </div>

      {/* Desktop: one chip row per drilled-down level */}
      <div className="hidden flex-col gap-2 sm:flex">
        {rows.map((node, i) => {
          const activeChildId = path[i + 1]?.id;
          return (
            <div key={node.id} className="flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => pickSub(root.id, node === root ? null : node.id)} className={subChipClass(!activeChildId)}>
                {allSubcategoryLabel}
              </button>
              {node.children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => pickSub(root.id, child.id)}
                  className={subChipClass(activeChildId === child.id)}
                >
                  {label(child)}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Mobile: bottom sheet for whichever root chip was tapped */}
      <BottomSheet open={!!sheetRoot} onClose={() => setSheetRoot(null)} title={sheetRoot ? label(sheetRoot) : ""}>
        {sheetRoot && (
          <div className="flex flex-col py-1">
            <SheetRow
              label={`${allSubcategoryLabel} — ${label(sheetRoot)}`}
              active={effectiveId === sheetRoot.id}
              depth={0}
              onClick={() => {
                pickSub(sheetRoot.id, null);
                setSheetRoot(null);
              }}
            />
            {flattenCategoryTree(sheetRoot.children).map(({ node, depth }) => (
              <SheetRow
                key={node.id}
                label={label(node)}
                active={effectiveId === node.id}
                depth={depth + 1}
                onClick={() => {
                  pickSub(sheetRoot.id, node.id);
                  setSheetRoot(null);
                }}
              />
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function SheetRow({
  label,
  active,
  depth,
  onClick,
}: {
  label: string;
  active: boolean;
  depth: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ paddingLeft: 16 + depth * 18 }}
      className="flex min-h-11 items-center gap-3 border-b border-[#eef0f1] py-3 pr-4 text-left text-[15px] last:border-b-0"
    >
      <span
        className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2"
        style={{ borderColor: active ? "#3f6e4a" : "#d9dee2" }}
      >
        {active && <span className="h-[9px] w-[9px] rounded-full bg-[#3f6e4a]" />}
      </span>
      <span className={active ? "font-medium text-[#1d2329]" : "text-[#1d2329]"}>{label}</span>
    </button>
  );
}
