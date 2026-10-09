"use client";

import { useTranslations } from "next-intl";
import { hideListing } from "./actions";

export function HideButton({ locale, listingId }: { locale: string; listingId: string }) {
  const t = useTranslations("Dashboard");
  const boundHide = hideListing.bind(null, locale, listingId);

  return (
    <form action={boundHide}>
      <button
        type="submit"
        className="rounded-[9px] border border-[#d9dee2] bg-white px-3.5 py-2 text-sm font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
      >
        {t("hideListing")}
      </button>
    </form>
  );
}
