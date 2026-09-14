"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { approveListing, rejectListing, type RejectState } from "./actions";

export function ListingReviewActions({
  locale,
  listingId,
}: {
  locale: string;
  listingId: string;
}) {
  const t = useTranslations("Admin");
  const [showReject, setShowReject] = useState(false);
  const boundApprove = approveListing.bind(null, locale, listingId);
  const boundReject = rejectListing.bind(null, locale, listingId);
  const [state, formAction, isPending] = useActionState<RejectState, FormData>(boundReject, {
    error: null,
  });

  if (showReject) {
    return (
      <form action={formAction} className="flex flex-col gap-2">
        <textarea
          name="reason"
          required
          rows={2}
          placeholder={t("rejectReasonPlaceholder")}
          className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
        />
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="text-sm font-medium text-red-600 disabled:opacity-60"
          >
            {t("sendAndReject")}
          </button>
          <button
            type="button"
            onClick={() => setShowReject(false)}
            className="text-sm font-medium text-[#55503f]"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-3">
      <form action={boundApprove}>
        <button type="submit" className="text-sm font-medium text-[#3f6b3f]">
          {t("approve")}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setShowReject(true)}
        className="text-sm font-medium text-red-600"
      >
        {t("reject")}
      </button>
    </div>
  );
}
