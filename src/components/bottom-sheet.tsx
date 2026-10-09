"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/icons";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[3000] sm:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[75vh] flex-col rounded-t-[20px] bg-white shadow-[0_-8px_24px_rgba(29,35,41,0.2)]">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[#eef0f1] px-4 py-3.5">
          <span className="text-[15px] font-semibold text-[#1d2329]">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d6670] hover:bg-[#f6f7f5]"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 py-2">{children}</div>
        <div className="h-[env(safe-area-inset-bottom,16px)] flex-shrink-0" />
      </div>
    </div>,
    document.body,
  );
}
