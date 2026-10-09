import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "./sign-up-form";

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Auth");

  return (
    <AuthShell mode="signup" title={t("signUpTitle")} subtitle={t("signUpSubtitle")}>
      <SignUpForm locale={locale} />
    </AuthShell>
  );
}
