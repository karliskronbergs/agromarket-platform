"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveListing, type ListingState } from "./actions";

type Category = { id: string; name_lv: string; name_en: string };
type ExistingImage = { id: string; url: string };

const inputClass =
  "rounded-lg border border-[#e7e2d8] bg-white px-3 py-2.5 text-sm text-[#2b2a24] outline-none transition focus:border-[#3f6b3f] focus:ring-2 focus:ring-[#3f6b3f]/15";

export function ListingForm({
  locale,
  listingId,
  categories,
  initial,
  existingImages,
}: {
  locale: string;
  listingId: string | null;
  categories: Category[];
  existingImages: ExistingImage[];
  initial?: {
    listingType: "sell" | "buy";
    title: string;
    description: string;
    categoryId: string;
    price: string;
    plusVat: boolean;
  };
}) {
  const t = useTranslations("Listing");
  const boundSave = saveListing.bind(null, locale, listingId);
  const [state, formAction, isPending] = useActionState<ListingState, FormData>(boundSave, {
    error: null,
  });

  const categoryLabel = (c: Category) => (locale === "lv" ? c.name_lv : c.name_en);

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-8">
      <Section>
        <fieldset className="flex w-fit gap-1 rounded-full bg-[#f1efe6] p-1">
          <legend className="sr-only">{t("type")}</legend>
          <label className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold text-[#55503f] transition has-checked:bg-[#d9713a] has-checked:text-white">
            <input
              type="radio"
              name="listingType"
              value="sell"
              defaultChecked={(initial?.listingType ?? "sell") === "sell"}
              className="sr-only"
            />
            {t("sell")}
          </label>
          <label className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold text-[#55503f] transition has-checked:bg-[#2f6690] has-checked:text-white">
            <input
              type="radio"
              name="listingType"
              value="buy"
              defaultChecked={initial?.listingType === "buy"}
              className="sr-only"
            />
            {t("buy")}
          </label>
        </fieldset>

        <Field label={t("title")}>
          <input name="title" defaultValue={initial?.title} required className={inputClass} />
        </Field>

        <Field label={t("description")}>
          <textarea
            name="description"
            defaultValue={initial?.description}
            rows={4}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("category")}>
            <select
              name="categoryId"
              defaultValue={initial?.categoryId}
              required
              className={inputClass}
            >
              <option value="" disabled>
                {t("category")}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("price")}>
            <div className="flex items-center gap-3">
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initial?.price}
                className={`flex-1 ${inputClass}`}
              />
              <label className="flex cursor-pointer items-center gap-2">
                <span className="relative inline-block h-5 w-9 flex-shrink-0">
                  <input
                    type="checkbox"
                    name="plusVat"
                    defaultChecked={initial?.plusVat}
                    className="peer sr-only"
                  />
                  <span className="absolute inset-0 rounded-full bg-[#e7e2d8] transition-colors peer-checked:bg-[#3f6b3f] after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                </span>
                <span className="text-sm font-medium text-[#2b2a24]">{t("plusVat")}</span>
              </label>
            </div>
          </Field>
        </div>
      </Section>

      <Section title={t("images")}>
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <label key={img.id} className="flex flex-col items-center gap-1 text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-20 w-20 rounded-lg border border-[#e7e2d8] object-cover"
                />
                <span className="flex items-center gap-1 text-[#7a7566]">
                  <input type="checkbox" name="removeImageIds" value={img.id} />
                  {t("remove")}
                </span>
              </label>
            ))}
          </div>
        )}

        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="rounded-lg border border-dashed border-[#e7e2d8] bg-[#faf8f3] px-3 py-2.5 text-sm"
        />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#2b2a24]">{label}</span>
      {children}
    </label>
  );
}
