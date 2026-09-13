"use client";

import { useTranslations } from "next-intl";
import { deleteCategory } from "./actions";

export function DeleteCategoryButton({ locale, categoryId }: { locale: string; categoryId: string }) {
  const t = useTranslations("Admin");
  const boundDelete = deleteCategory.bind(null, locale, categoryId);

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
