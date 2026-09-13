"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveProfile, type ProfileState } from "./actions";

type Category = { id: string; name_lv: string; name_en: string };

const inputClass =
  "rounded-lg border border-[#e7e2d8] bg-white px-3 py-2.5 text-sm text-[#2b2a24] outline-none transition focus:border-[#3f6b3f] focus:ring-2 focus:ring-[#3f6b3f]/15";

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
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-8">
      <Section>
        <Field label={t("businessName")}>
          <input
            name="businessName"
            defaultValue={initial?.businessName}
            required
            className={inputClass}
          />
        </Field>

        <Field label={t("description")}>
          <textarea
            name="description"
            defaultValue={initial?.description}
            rows={4}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title={t("address")}>
        <Field label={t("address")} hint={t("addressHint")}>
          <input
            name="address"
            defaultValue={initial?.address}
            required
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("phone")}>
            <input name="phone" defaultValue={initial?.phone} className={inputClass} />
          </Field>
          <Field label={t("contactEmail")}>
            <input
              name="contactEmail"
              type="email"
              defaultValue={initial?.contactEmail}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label={t("website")}>
          <input name="website" defaultValue={initial?.website} className={inputClass} />
        </Field>
      </Section>

      <Section title={t("categories")}>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e2d8] px-3 py-1.5 text-sm transition has-checked:border-[#3f6b3f] has-checked:bg-[#e7efe1] has-checked:text-[#3f6b3f]"
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
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("avatar")}>
            <input
              name="avatar"
              type="file"
              accept="image/*"
              className="rounded-lg border border-dashed border-[#e7e2d8] bg-[#faf8f3] px-3 py-2.5 text-sm"
            />
          </Field>
          <Field label={t("cover")}>
            <input
              name="cover"
              type="file"
              accept="image/*"
              className="rounded-lg border border-dashed border-[#e7e2d8] bg-[#faf8f3] px-3 py-2.5 text-sm"
            />
          </Field>
        </div>
      </Section>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-[#3f6b3f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f5233] disabled:opacity-60"
      >
        {t("save")}
      </button>
    </form>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-t border-[#e7e2d8] pt-6 first:border-t-0 first:pt-0">
      {title && (
        <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7566]">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </div>
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
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#2b2a24]">{label}</span>
      {children}
      {hint && <span className="text-xs text-[#7a7566]">{hint}</span>}
    </label>
  );
}
