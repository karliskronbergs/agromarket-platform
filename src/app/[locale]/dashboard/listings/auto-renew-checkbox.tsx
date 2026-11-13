"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { setAutoRenew } from "./actions";

export function AutoRenewCheckbox({
  locale,
  listingId,
  initialChecked,
}: {
  locale: string;
  listingId: string;
  initialChecked: boolean;
}) {
  const t = useTranslations("Dashboard");
  const [checked, setChecked] = useState(initialChecked);
  const [, startTransition] = useTransition();

  function toggle(next: boolean) {
    setChecked(next);
    startTransition(() => {
      setAutoRenew(locale, listingId, next);
    });
  }

  return (
    <label className="flex items-center gap-1.5 rounded-[9px] border border-[#d9dee2] bg-white px-3.5 py-2 text-sm font-medium text-[#1d2329]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => toggle(e.target.checked)}
        className="h-4 w-4 accent-[#3f6e4a]"
      />
      {t("autoRenew")}
    </label>
  );
}
