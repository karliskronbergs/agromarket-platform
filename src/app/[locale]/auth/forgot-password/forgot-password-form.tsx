"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Spinner } from "@/components/spinner";
import { requestPasswordReset, type AuthState } from "../actions";

const inputClass =
  "rounded-lg border border-[#e7e2d8] bg-white px-3 py-2.5 text-sm text-[#2b2a24] outline-none transition focus:border-[#3f6b3f] focus:ring-2 focus:ring-[#3f6b3f]/15";

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("Auth");
  const boundRequest = requestPasswordReset.bind(null, locale);
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(boundRequest, {
    error: null,
  });

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-[#3f6b3f]">{t("resetEmailSent")}</p>
        <Link href="/auth/login" className="text-sm font-medium text-[#3f6b3f]">
          {t("signInCta")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[#2b2a24]">
          {t("email")}
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-full bg-[#3f6b3f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f5233] disabled:opacity-60"
      >
        {isPending && <Spinner className="h-4 w-4" />}
        {t("sendResetLink")}
      </button>
      <p className="text-center text-sm text-[#55503f]">
        <Link href="/auth/login" className="font-medium text-[#3f6b3f]">
          {t("signInCta")}
        </Link>
      </p>
    </form>
  );
}
