import { getTranslations } from "next-intl/server";
import { ReportForm } from "./report-form";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; type: string; id: string }>;
}) {
  const { locale, type, id } = await params;
  const t = await getTranslations("Report");
  const targetType = type === "listing" ? "listing" : "profile";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="font-sans text-xl font-semibold text-[#2b2a24]">{t("title")}</h1>
      <ReportForm locale={locale} targetType={targetType} targetId={id} />
    </div>
  );
}
