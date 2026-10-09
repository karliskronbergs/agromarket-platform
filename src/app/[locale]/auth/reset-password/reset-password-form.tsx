"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";
import { Spinner } from "@/components/spinner";

export function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // The recovery link may have already been processed by the time this
    // effect runs (detectSessionInUrl fires before React mounts), so also
    // check for an existing session directly.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement)
      .value;
    if (password !== confirmPassword) {
      setError(t("passwordsDontMatch"));
      return;
    }

    setError(null);
    setIsPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (done) {
    return <p className="text-center text-sm text-[#3f6e4a]">{t("passwordUpdated")}</p>;
  }

  if (!ready) {
    return <p className="text-center text-sm text-[#5d6670]">{t("resetLinkInvalid")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[#1d2329]">
          {t("newPassword")}
        </label>
        <PasswordInput
          id="password"
          name="password"
          minLength={8}
          className="rounded-[10px] border border-[#d9dee2] bg-white px-3.5 py-3 text-[15px] text-[#1d2329] outline-none transition focus:border-[#3f6e4a]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-[#1d2329]">
          {t("confirmPassword")}
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          minLength={8}
          className="rounded-[10px] border border-[#d9dee2] bg-white px-3.5 py-3 text-[15px] text-[#1d2329] outline-none transition focus:border-[#3f6e4a]"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-[10px] bg-[#3f6e4a] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#355d3e] disabled:opacity-60"
      >
        {isPending && <Spinner className="h-4 w-4" />}
        {t("updatePassword")}
      </button>
    </form>
  );
}
