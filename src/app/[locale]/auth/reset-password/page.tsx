import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-[#e3e6e8] bg-white p-8">
        <div className="mb-6 text-center">
          <div className="text-lg font-bold text-[#1d2329]">lauks24.lv</div>
          <h1 className="mt-1 text-xl font-semibold text-[#1d2329]">
            {t("resetPasswordTitle")}
          </h1>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
