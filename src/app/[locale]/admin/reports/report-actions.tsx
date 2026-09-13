"use client";

import { useTranslations } from "next-intl";
import { resolveReport, dismissReport, removeReportedContent } from "./actions";

export function ReportActions({
  locale,
  reportId,
  targetType,
  targetId,
}: {
  locale: string;
  reportId: string;
  targetType: "profile" | "listing";
  targetId: string;
}) {
  const t = useTranslations("Admin");
  const boundResolve = resolveReport.bind(null, locale, reportId);
  const boundDismiss = dismissReport.bind(null, locale, reportId);
  const boundRemove = removeReportedContent.bind(null, locale, reportId, targetType, targetId);

  return (
    <div className="flex gap-3">
      <form action={boundResolve}>
        <button type="submit" className="text-sm font-medium text-[#3f6b3f]">
          {t("resolve")}
        </button>
      </form>
      <form action={boundDismiss}>
        <button type="submit" className="text-sm font-medium text-[#55503f]">
          {t("dismiss")}
        </button>
      </form>
      <form
        action={boundRemove}
        onSubmit={(e) => {
          if (!confirm(t("removeConfirm"))) e.preventDefault();
        }}
      >
        <button type="submit" className="text-sm font-medium text-red-600">
          {t("removeContent")}
        </button>
      </form>
    </div>
  );
}
