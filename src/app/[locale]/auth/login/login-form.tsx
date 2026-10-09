"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PasswordInput } from "@/components/password-input";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Spinner } from "@/components/spinner";
import { login, type AuthState } from "../actions";

const inputClass =
  "rounded-[10px] border border-[#d9dee2] bg-white px-3.5 py-3 text-base sm:text-[15px] text-[#1d2329] outline-none transition focus:border-[#3f6e4a]";

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("Auth");
  const boundLogin = login.bind(null, locale);
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(boundLogin, {
    error: null,
  });

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[#1d2329]">
          {t("email")}
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-[#1d2329]">
            {t("password")}
          </label>
          <Link href="/auth/forgot-password" className="text-xs font-medium text-[#3f6e4a]">
            {t("forgotPasswordLink")}
          </Link>
        </div>
        <PasswordInput id="password" name="password" className={inputClass} />
      </div>
      <TurnstileWidget />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 flex items-center justify-center gap-2 rounded-[10px] bg-[#3f6e4a] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#355d3e] disabled:opacity-60"
      >
        {isPending && <Spinner className="h-4 w-4" />}
        {t("signInSubmit")}
      </button>
    </form>
  );
}
