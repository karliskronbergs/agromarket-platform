import { createClient } from "@/lib/supabase/server";
import { LogoForm } from "./logo-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "logo_url")
    .maybeSingle();

  return (
    <div className="flex flex-col gap-4">
      <LogoForm locale={locale} currentLogoUrl={setting?.value ?? null} />
    </div>
  );
}
