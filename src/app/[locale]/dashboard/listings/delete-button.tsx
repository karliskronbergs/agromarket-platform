"use client";

import { useTranslations } from "next-intl";
import { deleteListing } from "./actions";

export function DeleteButton({ locale, listingId }: { locale: string; listingId: string }) {
  const t = useTranslations("Listing");
  const boundDelete = deleteListing.bind(null, locale, listingId);

  return (
    <form
      action={boundDelete}
      onSubmit={(e) => {
        if (!confirm(t("deleteConfirm"))) e.preventDefault();
      }}
    >
      <button type="submit" className="text-sm font-medium text-red-600">
        {t("delete")}
      </button>
    </form>
  );
}
