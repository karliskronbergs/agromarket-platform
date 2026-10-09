import { useTranslations } from "next-intl";

export default function AuthCodeErrorPage() {
  const t = useTranslations("Auth");
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-[#e3e6e8] bg-white p-8 text-center">
        <p className="text-sm text-red-600">{t("codeError")}</p>
      </div>
    </div>
  );
}
