"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconTrash } from "@/components/icons";
import { deleteProfile } from "./actions";

export function DeleteProfileButton({ locale }: { locale: string }) {
  const t = useTranslations("Profile");
  const [confirming, setConfirming] = useState(false);
  const boundDelete = deleteProfile.bind(null, locale);

  if (confirming) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{t("deleteProfileWarning")}</p>
        <div className="flex gap-3">
          <form action={boundDelete}>
            <button
              type="submit"
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              {t("deleteProfileConfirm")}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full border border-[#e7e2d8] px-4 py-2 text-sm font-medium text-[#55503f]"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex w-fit items-center gap-1.5 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
    >
      <IconTrash className="h-4 w-4" />
      {t("deleteProfile")}
    </button>
  );
}
