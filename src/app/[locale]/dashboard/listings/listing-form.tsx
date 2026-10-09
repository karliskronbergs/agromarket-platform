"use client";

import { useActionState, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSelfAndDescendantIds, type CategoryRow } from "@/lib/categories";
import { BREED_OPTIONS, getAnimalGroupForCategory, getLivestockCategoryIds } from "@/lib/livestock";
import { CONDITION_OPTIONS, getEquipmentCategoryIds } from "@/lib/equipment";
import { getMachineryCategoryIds } from "@/lib/machinery";
import { PRICE_UNIT_OPTIONS, getPriceUnitGroup } from "@/lib/price-units";
import { CategoryFieldTree } from "@/components/category-field-tree";
import { IconCheckmark } from "@/components/icons";
import { Spinner } from "@/components/spinner";
import { saveListing, type ListingState } from "./actions";
import { ImageUploader } from "./image-uploader";

type Category = CategoryRow;
type ExistingImage = { id: string; url: string };

const WEIGHT_UNIT_CATEGORY_SLUG = "seklas-un-graudi";

const inputClass =
  "rounded-[10px] border border-[#d9dee2] bg-white px-3.5 py-3 text-base sm:text-[15px] text-[#1d2329] outline-none transition focus:border-[#3f6e4a]";

export function ListingForm({
  locale,
  listingId,
  categories,
  initial,
  existingImages,
  address,
}: {
  locale: string;
  listingId: string | null;
  categories: Category[];
  existingImages: ExistingImage[];
  address: string;
  initial?: {
    listingType: "sell" | "buy";
    title: string;
    description: string;
    categoryId: string;
    price: string;
    priceUnit: "kg" | "t" | "bale" | null;
    plusVat: boolean;
    breed: string | null;
    ageMonths: string | null;
    quantity: string | null;
    condition: string | null;
    manufacturer: string | null;
    model: string | null;
    organicCertified: boolean;
  };
}) {
  const t = useTranslations("Listing");
  const td = useTranslations("Dashboard");
  const boundSave = saveListing.bind(null, locale, listingId);
  const [state, formAction, isPending] = useActionState<ListingState, FormData>(boundSave, {
    error: null,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState(initial?.categoryId ?? "");
  const [listingType, setListingType] = useState<"sell" | "buy">(initial?.listingType ?? "sell");
  const [negotiable, setNegotiable] = useState(!initial?.price);
  const [price, setPrice] = useState(initial?.price ?? "");

  const weightUnitCategoryIds = useMemo(() => {
    const root = categories.find((c) => c.slug === WEIGHT_UNIT_CATEGORY_SLUG);
    return root ? new Set(getSelfAndDescendantIds(categories, root.id)) : new Set<string>();
  }, [categories]);
  const showPriceUnit = weightUnitCategoryIds.has(selectedCategoryId);

  const livestockCategoryIds = useMemo(() => getLivestockCategoryIds(categories), [categories]);
  const showLivestockFields = livestockCategoryIds.has(selectedCategoryId);
  const animalGroup = useMemo(
    () => getAnimalGroupForCategory(categories, selectedCategoryId),
    [categories, selectedCategoryId],
  );
  const breedOptions = animalGroup ? BREED_OPTIONS[animalGroup] : [];

  const equipmentCategoryIds = useMemo(() => getEquipmentCategoryIds(categories), [categories]);
  const machineryCategoryIds = useMemo(() => getMachineryCategoryIds(categories), [categories]);
  const showMachineryFields = machineryCategoryIds.has(selectedCategoryId);
  const showCondition = equipmentCategoryIds.has(selectedCategoryId) || showMachineryFields;

  const showOrganicCertified = showLivestockFields || showPriceUnit;

  const priceUnitGroup = useMemo(
    () => getPriceUnitGroup(categories, selectedCategoryId),
    [categories, selectedCategoryId],
  );
  const priceUnitOptions = priceUnitGroup ? PRICE_UNIT_OPTIONS[priceUnitGroup] : [];

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-5">
      <div className="flex flex-col gap-[22px] rounded-2xl border border-[#e3e6e8] bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#1d2329]">{td("formWhatToDo")}</span>
          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                ["sell", td("formTypeSellTitle"), td("formTypeSellSub")],
                ["buy", td("formTypeBuyTitle"), td("formTypeBuySub")],
              ] as const
            ).map(([value, label, sub]) => (
              <label
                key={value}
                className="flex cursor-pointer flex-col gap-0.5 rounded-xl border-2 p-3.5 transition"
                style={{
                  borderColor: listingType === value ? "#3f6e4a" : "#e3e6e8",
                  background: listingType === value ? "#f3f7f3" : "#fff",
                }}
              >
                <input
                  type="radio"
                  name="listingType"
                  value={value}
                  checked={listingType === value}
                  onChange={() => setListingType(value)}
                  className="sr-only"
                />
                <span className="text-[15px] font-semibold text-[#1d2329]">{label}</span>
                <span className="text-[13px] leading-[1.35] text-[#5d6670]">{sub}</span>
              </label>
            ))}
          </div>
        </div>

        <Field label={t("title")}>
          <input name="title" defaultValue={initial?.title} required className={inputClass} />
        </Field>

        <Field label={t("category")}>
          <div
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              if (target.name === "categoryId") setSelectedCategoryId(target.value);
            }}
          >
            <CategoryFieldTree
              categories={categories}
              locale={locale}
              name="categoryId"
              type="radio"
              isSelected={(id) => id === initial?.categoryId}
              leafOnly
            />
          </div>
        </Field>

        {showLivestockFields && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label={t("breed")}>
              <select name="breed" defaultValue={initial?.breed ?? ""} className={inputClass}>
                <option value="">{t("breedSelect")}</option>
                {breedOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {locale === "lv" ? opt.name_lv : opt.name_en}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("ageMonths")}>
              <input
                name="ageMonths"
                type="number"
                min="0"
                step="1"
                defaultValue={initial?.ageMonths ?? undefined}
                className={inputClass}
              />
            </Field>
            <Field label={t("quantity")}>
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                defaultValue={initial?.quantity ?? undefined}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {showMachineryFields && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("manufacturer")}>
              <input name="manufacturer" type="text" defaultValue={initial?.manufacturer ?? undefined} className={inputClass} />
            </Field>
            <Field label={t("model")}>
              <input name="model" type="text" defaultValue={initial?.model ?? undefined} className={inputClass} />
            </Field>
          </div>
        )}

        {showCondition && (
          <Field label={t("condition")}>
            <div className="flex w-fit gap-1 rounded-xl bg-[#f0f2f0] p-1">
              {CONDITION_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="cursor-pointer rounded-[9px] px-3.5 py-2 text-sm font-medium text-[#5d6670] transition has-checked:bg-white has-checked:text-[#1d2329]"
                >
                  <input
                    type="radio"
                    name="condition"
                    value={opt.value}
                    defaultChecked={initial?.condition === opt.value}
                    className="sr-only"
                  />
                  {locale === "lv" ? opt.name_lv : opt.name_en}
                </label>
              ))}
            </div>
          </Field>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_1fr]">
          <Field label={t("price")}>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              disabled={negotiable}
              onChange={(e) => setPrice(e.target.value)}
              className={`${inputClass} disabled:bg-[#f6f7f5] disabled:text-[#8a929a]`}
            />
          </Field>
          {priceUnitGroup && (
            <Field label={t("priceUnit")}>
              <select name="priceUnit" defaultValue={initial?.priceUnit ?? ""} className={inputClass}>
                <option value="">{t("priceUnitTotal")}</option>
                {priceUnitOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {locale === "lv" ? opt.label_lv : opt.label_en}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
        <label className="-mt-2 flex w-fit cursor-pointer items-center gap-2.5 text-sm text-[#1d2329]">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={(e) => {
              setNegotiable(e.target.checked);
              if (e.target.checked) setPrice("");
            }}
            className="h-[18px] w-[18px] accent-[#3f6e4a]"
          />
          {td("formNegotiable")}
        </label>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-[#1d2329]">
          <input type="checkbox" name="plusVat" defaultChecked={initial?.plusVat} className="h-[18px] w-[18px] accent-[#3f6e4a]" />
          {t("plusVat")}
        </label>

        {showOrganicCertified && (
          <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-full border border-[#d9dee2] bg-white px-3.5 py-2 transition has-checked:border-[#3f6e4a] has-checked:bg-[#eef3ee]">
            <input
              type="checkbox"
              name="organicCertified"
              defaultChecked={initial?.organicCertified}
              className="peer sr-only"
            />
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#d9dee2] bg-white transition-all peer-checked:border-[#3f6e4a] peer-checked:bg-[#3f6e4a]">
              <IconCheckmark className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-sm font-medium text-[#1d2329]">{t("organicCertified")}</span>
          </label>
        )}

        <Field label={t("description")}>
          <textarea name="description" defaultValue={initial?.description} rows={5} className={inputClass} />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#1d2329]">{t("images")}</span>
          <ImageUploader existingImages={existingImages} />
        </div>

        <div className="rounded-xl bg-[#f0f2f0] px-3.5 py-3 text-[13px] leading-[1.5] text-[#4a535b]">
          {td("formLocationNote", { address })}
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex flex-wrap justify-end gap-2.5">
        <Link
          href="/dashboard/listings"
          className="rounded-[10px] border border-[#d9dee2] bg-white px-[18px] py-3 text-[15px] font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
        >
          {td("formCancel")}
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-[10px] bg-[#3f6e4a] px-[22px] py-3 text-[15px] font-semibold text-white transition hover:bg-[#355d3e] disabled:opacity-60"
        >
          {isPending && <Spinner className="h-4 w-4" />}
          {listingId ? td("formSaveChanges") : td("formPublish")}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#1d2329]">{label}</span>
      {children}
    </label>
  );
}
