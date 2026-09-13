"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signUp, type AuthState } from "../actions";

export function SignUpForm({ locale }: { locale: string }) {
  const t = useTranslations("Auth");
  const boundSignUp = signUp.bind(null, locale);
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(boundSignUp, {
    error: null,
  });

  if (state.success) {
    return <p className="text-sm text-[#3f6b3f]">{t("checkEmail")}</p>;
  }

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-[#2b2a24]">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-[#2b2a24]">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-[#3f6b3f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2f5233] disabled:opacity-60"
      >
        {t("signUpSubmit")}
      </button>
      <p className="text-sm text-[#55503f]">
        {t("haveAccount")}{" "}
        <Link href="/auth/login" className="font-medium text-[#3f6b3f]">
          {t("signInCta")}
        </Link>
      </p>
    </form>
  );
}
