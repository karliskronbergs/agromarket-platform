"use client";

import { useTranslations } from "next-intl";
import { reactivateListing } from "./actions";

export function ReactivateButton({ locale, listingId }: { locale: string; listingId: string }) {
  const t = useTranslations("Listing");
  const boundReactivate = reactivateListing.bind(null, locale, listingId);

  return (
    <form action={boundReactivate}>
      <button type="submit" className="text-sm font-medium text-[#3f6b3f]">
        {t("reactivate")}
      </button>
    </form>
  );
}
