"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconChevronDown, IconCheck } from "@/components/icons";

export function optionClass(active: boolean) {
  return `rounded-lg px-3 py-2 text-left text-sm transition ${
    active ? "bg-[#f1efe6] font-medium text-[#2b2a24]" : "text-[#55503f] hover:bg-[#faf8f3]"
  }`;
}

export function CheckboxPill({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`flex flex-shrink-0 snap-start items-center gap-2.5 rounded-full border px-3.5 py-2 text-sm font-medium shadow-sm transition-all ${
        checked
          ? "border-[#3f6b3f] bg-[#eaf4e8] text-[#2f5233]"
          : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f]/50 hover:bg-[#faf8f3]"
      }`}
    >
      <span
        className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all ${
          checked
            ? "border-[#3f6b3f] bg-gradient-to-br from-[#4a7c4a] to-[#3f6b3f] shadow-sm"
            : "border-[#c9c3b3] bg-white"
        }`}
      >
        <IconCheck
          className={`h-3 w-3 text-white transition-all duration-150 ${
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

export const filterFieldClass =
  "w-full rounded-lg border border-[#e7e2d8] bg-white px-3 py-2 text-sm text-[#2b2a24] outline-none transition focus:border-[#3f6b3f] focus:ring-2 focus:ring-[#3f6b3f]/15";

export function FilterPill({
  label,
  active,
  panelWidth = 240,
  children,
}: {
  label: string;
  active: boolean;
  panelWidth?: number;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; maxHeight: number } | null>(
    null,
  );
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
      const top = rect.bottom + 8;
      setPosition({
        top,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8)),
        maxHeight: Math.max(160, window.innerHeight - top - 16),
      });
    }
    setOpen(true);
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

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className={`flex flex-shrink-0 snap-start items-center gap-1 rounded-full border px-3.5 py-2 text-sm font-medium shadow-sm transition ${
          active
            ? "border-[#3f6b3f] bg-[#f1efe6] text-[#2b2a24]"
            : "border-[#e7e2d8] bg-white text-[#55503f] hover:border-[#3f6b3f]"
        }`}
      >
        <span className="max-w-32 truncate">{label}</span>
        <IconChevronDown className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
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
              width: panelWidth,
              maxHeight: position.maxHeight,
              zIndex: 1100,
            }}
            className="overflow-y-auto overscroll-contain rounded-xl border border-[#e7e2d8] bg-white p-3 shadow-lg"
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </>
  );
}
