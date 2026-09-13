"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { fileReport, type ReportState } from "./actions";

export function ReportForm({
  locale,
  targetType,
  targetId,
}: {
  locale: string;
  targetType: "profile" | "listing";
  targetId: string;
}) {
  const t = useTranslations("Report");
  const boundReport = fileReport.bind(null, locale, targetType, targetId);
  const [state, formAction, isPending] = useActionState<ReportState, FormData>(boundReport, {
    error: null,
  });

  if (state.success) {
    return <p className="text-sm text-[#3f6b3f]">{t("thanks")}</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="reason"
        required
        rows={5}
        placeholder={t("reasonLabel")}
        className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-[#3f6b3f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2f5233] disabled:opacity-60"
      >
        {t("submit")}
      </button>
    </form>
  );
}
