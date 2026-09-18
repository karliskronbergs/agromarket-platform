"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { compressImage } from "@/lib/compress-image";
import { Spinner } from "@/components/spinner";
import { updateSiteLogo, removeSiteLogo, type LogoState } from "./actions";

export function LogoForm({ locale, currentLogoUrl }: { locale: string; currentLogoUrl: string | null }) {
  const t = useTranslations("Admin");
  const boundUpdate = updateSiteLogo.bind(null, locale);
  const boundRemove = removeSiteLogo.bind(null, locale);
  const [state, formAction, isPending] = useActionState<LogoState, FormData>(boundUpdate, {
    error: null,
  });
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#e7e2d8] bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e7e2d8] bg-[#faf8f3]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-[#7a7566]">{t("noLogo")}</span>
          )}
        </div>
        <div className="text-sm text-[#55503f]">{t("logoHint")}</div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form action={formAction} encType="multipart/form-data" className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={async (e) => {
              const input = e.target;
              const file = input.files?.[0];
              if (!file) return;

              const compressed = await compressImage(file);
              const dt = new DataTransfer();
              dt.items.add(compressed);
              input.files = dt.files;
              setPreview(URL.createObjectURL(compressed));
            }}
            className="text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-full bg-[#3f6b3f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending && <Spinner className="h-4 w-4" />}
            {t("uploadLogo")}
          </button>
        </form>
        {currentLogoUrl && (
          <form
            action={boundRemove}
            onSubmit={(e) => {
              if (!confirm(t("removeLogoConfirm"))) e.preventDefault();
            }}
          >
            <button type="submit" className="text-sm font-medium text-red-600">
              {t("removeLogo")}
            </button>
          </form>
        )}
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
