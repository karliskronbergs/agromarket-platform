"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveProfile, type ProfileState } from "./actions";

type Category = { id: string; name_lv: string; name_en: string };

export function ProfileForm({
  locale,
  categories,
  selectedCategoryIds,
  initial,
}: {
  locale: string;
  categories: Category[];
  selectedCategoryIds: string[];
  initial?: {
    businessName: string;
    description: string;
    phone: string;
    contactEmail: string;
    website: string;
    address: string;
  };
}) {
  const t = useTranslations("Profile");
  const boundSave = saveProfile.bind(null, locale);
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(boundSave, {
    error: null,
  });

  const categoryLabel = (c: Category) => (locale === "lv" ? c.name_lv : c.name_en);

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-5">
      <Field label={t("businessName")}>
        <input
          name="businessName"
          defaultValue={initial?.businessName}
          required
          className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
        />
      </Field>

      <Field label={t("description")}>
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={4}
          className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
        />
      </Field>

      <Field label={t("address")} hint={t("addressHint")}>
        <input
          name="address"
          defaultValue={initial?.address}
          required
          className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("phone")}>
          <input
            name="phone"
            defaultValue={initial?.phone}
            className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
          />
        </Field>
        <Field label={t("contactEmail")}>
          <input
            name="contactEmail"
            type="email"
            defaultValue={initial?.contactEmail}
            className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <Field label={t("website")}>
        <input
          name="website"
          defaultValue={initial?.website}
          className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-[#2b2a24]">{t("categories")}</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e2d8] px-3 py-1.5 text-sm has-checked:border-[#3f6b3f] has-checked:bg-[#e7efe1]"
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={c.id}
                defaultChecked={selectedCategoryIds.includes(c.id)}
                className="sr-only"
              />
              {categoryLabel(c)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("avatar")}>
          <input name="avatar" type="file" accept="image/*" className="text-sm" />
        </Field>
        <Field label={t("cover")}>
          <input name="cover" type="file" accept="image/*" className="text-sm" />
        </Field>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-[#3f6b3f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2f5233] disabled:opacity-60"
      >
        {t("save")}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-[#2b2a24]">{label}</span>
      {children}
      {hint && <span className="text-xs text-[#7a7566]">{hint}</span>}
    </label>
  );
}
