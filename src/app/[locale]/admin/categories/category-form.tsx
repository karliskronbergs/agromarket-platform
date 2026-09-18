"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { buildCategoryTree, flattenCategoryTree, type CategoryRow } from "@/lib/categories";
import { Spinner } from "@/components/spinner";
import { addCategory, type CategoryState } from "./actions";

export function CategoryForm({
  locale,
  categories,
}: {
  locale: string;
  categories: CategoryRow[];
}) {
  const t = useTranslations("Admin");
  const boundAdd = addCategory.bind(null, locale);
  const [state, formAction, isPending] = useActionState<CategoryState, FormData>(boundAdd, {
    error: null,
  });
  const rows = flattenCategoryTree(buildCategoryTree(categories));

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-xl border border-[#e7e2d8] bg-white p-4">
      <Field label={t("slug")}>
        <input name="slug" required className="w-32 rounded-lg border border-[#e7e2d8] px-2 py-1.5 text-sm" />
      </Field>
      <Field label={t("nameLv")}>
        <input name="nameLv" required className="w-40 rounded-lg border border-[#e7e2d8] px-2 py-1.5 text-sm" />
      </Field>
      <Field label={t("nameEn")}>
        <input name="nameEn" required className="w-40 rounded-lg border border-[#e7e2d8] px-2 py-1.5 text-sm" />
      </Field>
      <Field label={t("parentCategory")}>
        <select name="parentId" defaultValue="" className="w-48 rounded-lg border border-[#e7e2d8] px-2 py-1.5 text-sm">
          <option value="">{t("noParent")}</option>
          {rows.map(({ node, depth }) => (
            <option key={node.id} value={node.id}>
              {"  ".repeat(depth)}
              {locale === "lv" ? node.name_lv : node.name_en}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("icon")}>
        <input name="icon" className="w-24 rounded-lg border border-[#e7e2d8] px-2 py-1.5 text-sm" />
      </Field>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-full bg-[#3f6b3f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending && <Spinner className="h-4 w-4" />}
        {t("addCategory")}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[#7a7566]">{label}</span>
      {children}
    </label>
  );
}
