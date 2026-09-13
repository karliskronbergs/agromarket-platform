"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveListing, type ListingState } from "./actions";

type Category = { id: string; name_lv: string; name_en: string };
type ExistingImage = { id: string; url: string };

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
  };
}) {
  const t = useTranslations("Listing");
  const boundSave = saveListing.bind(null, locale, listingId);
  const [state, formAction, isPending] = useActionState<ListingState, FormData>(boundSave, {
    error: null,
  });

  const categoryLabel = (c: Category) => (locale === "lv" ? c.name_lv : c.name_en);

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-5">
      <fieldset className="flex gap-4">
        <legend className="mb-1 text-sm font-medium text-[#2b2a24]">{t("type")}</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="listingType"
            value="sell"
            defaultChecked={(initial?.listingType ?? "sell") === "sell"}
          />
          {t("sell")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="listingType"
            value="buy"
            defaultChecked={initial?.listingType === "buy"}
          />
          {t("buy")}
        </label>
      </fieldset>

      <Field label={t("title")}>
        <input
          name="title"
          defaultValue={initial?.title}
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("category")}>
          <select
            name="categoryId"
            defaultValue={initial?.categoryId}
            required
            className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
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
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.price}
            className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
          />
        </Field>
      </div>

      {existingImages.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-[#2b2a24]">{t("existingImages")}</legend>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <label key={img.id} className="flex flex-col items-center gap-1 text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-20 w-20 rounded-lg border border-[#e7e2d8] object-cover"
                />
                <span className="flex items-center gap-1">
                  <input type="checkbox" name="removeImageIds" value={img.id} />
                  {t("remove")}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Field label={t("images")}>
        <input name="images" type="file" accept="image/*" multiple className="text-sm" />
      </Field>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-[#2b2a24]">{label}</span>
      {children}
    </label>
  );
}
