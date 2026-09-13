"use client";

import { useTranslations } from "next-intl";
import { approveVerification, dismissVerification } from "./actions";

export function VerificationActions({
  locale,
  profileId,
}: {
  locale: string;
  profileId: string;
}) {
  const t = useTranslations("Admin");
  const boundApprove = approveVerification.bind(null, locale, profileId);
  const boundDismiss = dismissVerification.bind(null, locale, profileId);

  return (
    <div className="flex gap-3">
      <form action={boundApprove}>
        <button type="submit" className="text-sm font-medium text-[#3f6b3f]">
          {t("approve")}
        </button>
      </form>
      <form action={boundDismiss}>
        <button type="submit" className="text-sm font-medium text-[#55503f]">
          {t("dismiss")}
        </button>
      </form>
    </div>
  );
}
