"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";

export function DashboardToast({ messages }: { messages: Record<string, string> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const key = searchParams.get("toast");
  const [visible, setVisible] = useState(!!key);

  useEffect(() => {
    if (!key) return;
    setVisible(true);
    const hide = setTimeout(() => setVisible(false), 2400);
    const strip = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.delete("toast");
      const qs = next.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""), { scroll: false });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 2500);
    return () => {
      clearTimeout(hide);
      clearTimeout(strip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!key || !visible) return null;
  const text = messages[key];
  if (!text) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-[3100] -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#1d2329] px-[18px] py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(29,35,41,0.25)] sm:bottom-8">
      {text}
    </div>
  );
}
