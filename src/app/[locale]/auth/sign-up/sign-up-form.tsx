"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PasswordInput } from "@/components/password-input";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Spinner } from "@/components/spinner";
import { signUp, type AuthState } from "../actions";

const inputClass =
  "rounded-[10px] border border-[#d9dee2] bg-white px-3.5 py-3 text-base sm:text-[15px] text-[#1d2329] outline-none transition focus:border-[#3f6e4a]";
const inputErrorClass = "border-red-400 focus:border-red-400";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function SignUpForm({ locale }: { locale: string }) {
  const t = useTranslations("Auth");
  const boundSignUp = signUp.bind(null, locale);
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(boundSignUp, {
    error: null,
  });

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);

  const emailError = emailTouched && email && !EMAIL_RE.test(email) ? t("invalidEmail") : null;
  const passwordError = passwordTouched && password && password.length < 8 ? t("passwordTooShort") : null;
  const confirmError =
    confirmTouched && confirmPassword && confirmPassword !== password ? t("passwordsDontMatch") : null;

  if (state.success) {
    return <p className="text-center text-sm text-[#3f6e4a]">{t("checkEmail")}</p>;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);
    if (!EMAIL_RE.test(email) || password.length < 8 || confirmPassword !== password) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[#1d2329]">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          className={`${inputClass} ${emailError ? inputErrorClass : ""}`}
        />
        {emailError && <span className="text-xs text-red-600">{emailError}</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[#1d2329]">
          {t("password")}
        </label>
        <PasswordInput
          id="password"
          name="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          className={`${inputClass} ${passwordError ? inputErrorClass : ""}`}
        />
        <span className={`text-xs ${passwordError ? "text-red-600" : "text-[#5d6670]"}`}>
          {passwordError ?? t("passwordHint")}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-[#1d2329]">
          {t("confirmPassword")}
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setConfirmTouched(true)}
          className={`${inputClass} ${confirmError ? inputErrorClass : ""}`}
        />
        {confirmError && <span className="text-xs text-red-600">{confirmError}</span>}
      </div>
      <TurnstileWidget />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <p className="text-center text-xs text-[#5d6670]">
        {t("agreeToTerms")}{" "}
        <Link href="/terms" className="underline hover:text-[#3f6e4a]">
          {t("termsLink")}
        </Link>{" "}
        {t("and")}{" "}
        <Link href="/privacy" className="underline hover:text-[#3f6e4a]">
          {t("privacyLink")}
        </Link>
        .
      </p>
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 flex items-center justify-center gap-2 rounded-[10px] bg-[#3f6e4a] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#355d3e] disabled:opacity-60"
      >
        {isPending && <Spinner className="h-4 w-4" />}
        {t("signUpSubmit")}
      </button>
    </form>
  );
}
