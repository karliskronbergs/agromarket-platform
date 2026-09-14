import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) redirect(`/${locale}/dashboard`);

  const t = await getTranslations("Admin");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("title")}</h1>
      <nav className="flex gap-5 border-b border-[#e7e2d8] pb-3 text-sm font-medium text-[#55503f]">
        <Link href="/admin/listings">{t("pendingListings")}</Link>
        <Link href="/admin/categories">{t("categories")}</Link>
        <Link href="/admin/reports">{t("reports")}</Link>
        <Link href="/admin/verifications">{t("verifications")}</Link>
        <Link href="/admin/audit-log">{t("auditLog")}</Link>
      </nav>
      {children}
    </div>
  );
}
