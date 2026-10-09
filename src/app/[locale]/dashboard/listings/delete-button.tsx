"use client";

import { useTranslations } from "next-intl";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteListing } from "./actions";

export function DeleteButton({ locale, listingId, title }: { locale: string; listingId: string; title: string }) {
  const t = useTranslations("Dashboard");
  const boundDelete = deleteListing.bind(null, locale, listingId);

  return (
    <ConfirmButton
      action={boundDelete}
      title={t("deleteListingTitle")}
      text={t("deleteListingText", { title })}
      cta={t("deleteListingCta")}
      cancelLabel={t("modalCancel")}
      triggerClassName="rounded-[9px] border border-[#f0d4d1] bg-white px-3.5 py-2 text-sm font-medium text-[#b3261e] transition hover:bg-[#fdf3f2]"
      triggerLabel={t("deleteListingCta")}
    />
  );
}
