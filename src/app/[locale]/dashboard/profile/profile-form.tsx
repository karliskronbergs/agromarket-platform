"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CategoryRow } from "@/lib/categories";
import { CategoryFieldTree } from "@/components/category-field-tree";
import type { AttributeInfo } from "@/components/attribute-badges";
import { MiniMap } from "@/components/mini-map";
import { Spinner } from "@/components/spinner";
import { saveProfile, type ProfileState } from "./actions";
import { ProfileMediaEditor } from "./media-editor";
import { AddressAutocomplete } from "./address-autocomplete";

type Category = CategoryRow;
type Attribute = AttributeInfo & { id: string };

const inputClass =
  "rounded-[10px] border border-[#d9dee2] bg-white px-3.5 py-3 text-base sm:text-[15px] text-[#1d2329] outline-none transition focus:border-[#3f6e4a]";

export function ProfileForm({
  locale,
  categories,
  selectedCategoryIds,
  attributes,
  selectedAttributeIds,
  initial,
  lat,
  lng,
}: {
  locale: string;
  categories: Category[];
  selectedCategoryIds: string[];
  attributes: Attribute[];
  selectedAttributeIds: string[];
  lat: number | null;
  lng: number | null;
  initial?: {
    businessName: string;
    description: string;
    phone: string;
    contactEmail: string;
    website: string;
    address: string;
    avatarUrl: string;
    coverUrl: string;
  };
}) {
  const t = useTranslations("Profile");
  const td = useTranslations("Dashboard");
  const boundSave = saveProfile.bind(null, locale);
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(boundSave, {
    error: null,
  });
  const [businessName, setBusinessName] = useState(initial?.businessName ?? "");

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-2xl border border-[#e3e6e8] bg-white p-4 sm:p-6">
        <ProfileMediaEditor
          businessName={businessName}
          namePlaceholder={t("businessName")}
          initialAvatarUrl={initial?.avatarUrl}
          initialCoverUrl={initial?.coverUrl}
          changeCoverLabel={t("changeCover")}
          changeAvatarLabel={t("changeAvatar")}
        />

        <Field label={t("businessName")}>
          <input
            name="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("address")} hint={t("addressHint")}>
            <AddressAutocomplete id="address" name="address" defaultValue={initial?.address} className={inputClass} />
          </Field>
          <Field label={t("phone")}>
            <input name="phone" defaultValue={initial?.phone} className={inputClass} />
          </Field>
          <Field label={t("contactEmail")}>
            <input name="contactEmail" type="email" defaultValue={initial?.contactEmail} className={inputClass} />
          </Field>
          <Field label={t("website")}>
            <input name="website" defaultValue={initial?.website} className={inputClass} />
          </Field>
        </div>

        <Field label={t("description")}>
          <textarea name="description" defaultValue={initial?.description} rows={4} className={inputClass} />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#1d2329]">{t("categories")}</span>
          <CategoryFieldTree
            categories={categories}
            locale={locale}
            name="categoryIds"
            type="checkbox"
            isSelected={(id) => selectedCategoryIds.includes(id)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#1d2329]">{t("attributes")}</span>
          <div className="flex flex-wrap gap-2">
            {attributes.map((a) => (
              <label
                key={a.id}
                className="group inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#d9dee2] bg-white px-3 py-[7px] text-[13px] font-medium text-[#1d2329] transition has-checked:border-[#3f6e4a] has-checked:bg-[#eef3ee] has-checked:text-[#2f5538]"
              >
                <input
                  type="checkbox"
                  name="attributeIds"
                  value={a.id}
                  defaultChecked={selectedAttributeIds.includes(a.id)}
                  className="peer sr-only"
                />
                <span className="peer-checked:hidden">+</span>
                <span className="hidden peer-checked:inline">✓</span>
                {locale === "lv" ? a.name_lv : a.name_en}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#1d2329]">{td("profileMapTitle")}</span>
          {lat != null && lng != null ? (
            <div className="h-[180px] overflow-hidden rounded-xl border border-[#e3e6e8] bg-[#e8ece6]">
              <MiniMap lat={lat} lng={lng} />
            </div>
          ) : (
            <div className="flex h-[180px] items-center justify-center rounded-xl bg-[#f0f2f0] px-4 text-center text-[13px] text-[#5d6670]">
              {td("profileMapHint")}
            </div>
          )}
          <span className="text-xs text-[#5d6670]">{td("profileMapHint")}</span>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex flex-wrap justify-end gap-2.5">
        <Link
          href="/dashboard"
          className="rounded-[10px] border border-[#d9dee2] bg-white px-[18px] py-3 text-[15px] font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
        >
          {td("profileCancel")}
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-[10px] bg-[#3f6e4a] px-[22px] py-3 text-[15px] font-semibold text-white transition hover:bg-[#355d3e] disabled:opacity-60"
        >
          {isPending && <Spinner className="h-4 w-4" />}
          {t("save")}
        </button>
      </div>
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
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#1d2329]">{label}</span>
      {children}
      {hint && <span className="text-xs text-[#5d6670]">{hint}</span>}
    </label>
  );
}
