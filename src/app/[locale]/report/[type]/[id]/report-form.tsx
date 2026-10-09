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
    return <p className="text-sm text-[#3f6e4a]">{t("thanks")}</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="reason"
        required
        rows={5}
        placeholder={t("reasonLabel")}
        className="rounded-[10px] border border-[#d9dee2] px-3.5 py-3 text-base sm:text-[15px] outline-none transition focus:border-[#3f6e4a]"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-[10px] bg-[#3f6e4a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#355d3e] disabled:opacity-60"
      >
        {t("submit")}
      </button>
    </form>
  );
}
