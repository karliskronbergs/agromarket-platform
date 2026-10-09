import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Auth");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-[#e3e6e8] bg-white p-8">
        <div className="mb-6 text-center">
          <div className="text-lg font-bold text-[#1d2329]">lauks24.lv</div>
          <h1 className="mt-1 text-xl font-semibold text-[#1d2329]">
            {t("forgotPasswordTitle")}
          </h1>
          <p className="mt-2 text-sm text-[#5d6670]">{t("forgotPasswordHint")}</p>
        </div>
        <ForgotPasswordForm locale={locale} />
      </div>
    </div>
  );
}
