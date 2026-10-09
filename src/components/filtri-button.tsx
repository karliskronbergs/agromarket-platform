"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BottomSheet } from "@/components/bottom-sheet";
import { IconSort } from "@/components/icons";

export function FiltriButton({
  label,
  count,
  clearLabel,
  onClear,
  children,
}: {
  label: string;
  count: number;
  clearLabel: string;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
  }

  function toggle() {
    if (open) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const panelWidth = 320;
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(8, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 8)),
      });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-popover-panel]")) return;
      close();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-[7px] text-sm transition ${
          count > 0
            ? "border-[#3f6e4a] bg-[#eef3ee] text-[#2f5538]"
            : "border-[#e3e6e8] bg-white text-[#1d2329] hover:border-[#3f6e4a]"
        }`}
      >
        <IconSort className="h-3.5 w-3.5" />
        {count > 0 ? `${label} · ${count}` : label}
      </button>

      {/* Desktop dropdown */}
      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: position.top, left: position.left, width: 320, zIndex: 1100 }}
            data-popover-panel
            className="hidden flex-col gap-3 rounded-xl border border-[#e3e6e8] bg-white p-4 shadow-lg sm:flex"
          >
            {children}
            <button
              type="button"
              onClick={() => {
                onClear();
                close();
              }}
              className="self-start text-sm font-medium text-[#5d6670] hover:text-[#1d2329]"
            >
              {clearLabel}
            </button>
          </div>,
          document.body,
        )}

      {/* Mobile bottom sheet (BottomSheet is sm:hidden internally) */}
      <BottomSheet open={open} onClose={close} title={label}>
        <div className="flex flex-col gap-3 py-2">
          {children}
          <button
            type="button"
            onClick={() => {
              onClear();
              close();
            }}
            className="self-start text-sm font-medium text-[#5d6670]"
          >
            {clearLabel}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
