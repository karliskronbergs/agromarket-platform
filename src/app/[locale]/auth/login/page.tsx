import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Auth");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-[#faf8f3] px-6 py-16">
      <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("signInTitle")}</h1>
      <LoginForm locale={locale} />
    </div>
  );
}
