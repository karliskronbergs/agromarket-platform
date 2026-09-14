"use client";

import { useTranslations } from "next-intl";
import { approveListing, rejectListing } from "./actions";

export function ListingReviewActions({
  locale,
  listingId,
}: {
  locale: string;
  listingId: string;
}) {
  const t = useTranslations("Admin");
  const boundApprove = approveListing.bind(null, locale, listingId);
  const boundReject = rejectListing.bind(null, locale, listingId);

  return (
    <div className="flex gap-3">
      <form action={boundApprove}>
        <button type="submit" className="text-sm font-medium text-[#3f6b3f]">
          {t("approve")}
        </button>
      </form>
      <form
        action={boundReject}
        onSubmit={(e) => {
          if (!confirm(t("rejectConfirm"))) e.preventDefault();
        }}
      >
        <button type="submit" className="text-sm font-medium text-red-600">
          {t("reject")}
        </button>
      </form>
    </div>
  );
}
