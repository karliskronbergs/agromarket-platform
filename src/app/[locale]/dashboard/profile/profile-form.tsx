"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { buildCategoryTree, type CategoryNode, type CategoryRow } from "@/lib/categories";
import { saveProfile, type ProfileState } from "./actions";
import { ProfileMediaEditor } from "./media-editor";
import { AddressAutocomplete } from "./address-autocomplete";

type Category = CategoryRow;

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
    avatarUrl: string;
    coverUrl: string;
  };
}) {
  const t = useTranslations("Profile");
  const boundSave = saveProfile.bind(null, locale);
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(boundSave, {
    error: null,
  });
  const [businessName, setBusinessName] = useState(initial?.businessName ?? "");

  const categoryLabel = (c: Category) => (locale === "lv" ? c.name_lv : c.name_en);
  const categoryTree = buildCategoryTree(categories);

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-8">
      <ProfileMediaEditor
        businessName={businessName}
        namePlaceholder={t("businessName")}
        initialAvatarUrl={initial?.avatarUrl}
        initialCoverUrl={initial?.coverUrl}
        changeCoverLabel={t("changeCover")}
        changeAvatarLabel={t("changeAvatar")}
      />

      <Section>
        <Field label={t("businessName")}>
          <input
            name="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
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
          <AddressAutocomplete
            id="address"
            name="address"
            defaultValue={initial?.address}
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
        <div className="flex flex-col gap-2">
          {categoryTree.map((root) => (
            <CategoryGroup
              key={root.id}
              node={root}
              categoryLabel={categoryLabel}
              selectedCategoryIds={selectedCategoryIds}
            />
          ))}
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

function containsSelected(node: CategoryNode<Category>, selectedCategoryIds: string[]): boolean {
  if (selectedCategoryIds.includes(node.id)) return true;
  return node.children.some((child) => containsSelected(child, selectedCategoryIds));
}

function CategoryGroup({
  node,
  categoryLabel,
  selectedCategoryIds,
}: {
  node: CategoryNode<Category>;
  categoryLabel: (c: Category) => string;
  selectedCategoryIds: string[];
}) {
  return (
    <details
      className="rounded-lg border border-[#e7e2d8]"
      open={node.children.length > 0 && containsSelected(node, selectedCategoryIds)}
    >
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-[#2b2a24]">
        <label
          className="inline-flex cursor-pointer items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            name="categoryIds"
            value={node.id}
            defaultChecked={selectedCategoryIds.includes(node.id)}
          />
          {categoryLabel(node)}
        </label>
      </summary>
      {node.children.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-[#e7e2d8] p-3">
          {node.children.map((child) =>
            child.children.length > 0 ? (
              <div key={child.id} className="w-full">
                <CategoryGroup
                  node={child}
                  categoryLabel={categoryLabel}
                  selectedCategoryIds={selectedCategoryIds}
                />
              </div>
            ) : (
              <label
                key={child.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e2d8] px-3 py-1.5 text-sm transition has-checked:border-[#3f6b3f] has-checked:bg-[#e7efe1] has-checked:text-[#3f6b3f]"
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={child.id}
                  defaultChecked={selectedCategoryIds.includes(child.id)}
                  className="sr-only"
                />
                {categoryLabel(child)}
              </label>
            ),
          )}
        </div>
      )}
    </details>
  );
}
