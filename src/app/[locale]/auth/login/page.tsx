import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Auth");

  return (
    <AuthShell mode="login" title={t("signInTitle")} subtitle={t("signInSubtitle")}>
      <LoginForm locale={locale} />
    </AuthShell>
  );
}
