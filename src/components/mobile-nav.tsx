"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { IconMenu, IconClose } from "@/components/icons";

export function MobileNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        className="flex h-9 w-9 cursor-pointer items-center justify-center text-white sm:hidden"
      >
        {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-full z-[1100] flex flex-col gap-4 border-b border-[#e7e2d8] bg-white px-4 py-4 text-sm font-medium text-[#55503f] shadow-sm sm:hidden">
          {children}
        </nav>
      )}
    </>
  );
}
