import { useTranslations } from "next-intl";

export default function AuthCodeErrorPage() {
  const t = useTranslations("Auth");
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#faf8f3] px-6 py-16 text-center">
      <p className="text-sm text-red-600">{t("codeError")}</p>
    </div>
  );
}
