"use client";

import { usePathname, useRouter as useNextRouter } from "next/navigation";
import { IconChevronLeft } from "@/components/icons";

const BACK_SEGMENTS = new Set(["listings", "profiles", "auth"]);

export function MobileBackButton() {
  const pathname = usePathname();
  const router = useNextRouter();
  const segment = pathname?.split("/").filter(Boolean)[1] ?? "";
  if (!BACK_SEGMENTS.has(segment)) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Back"
      className="-ml-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] text-white active:bg-white/15"
    >
      <IconChevronLeft className="h-5 w-5" />
    </button>
  );
}
