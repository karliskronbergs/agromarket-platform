import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "../listing-form";

export const dynamic = "force-dynamic";

export default async function NewListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Listing");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!profile) redirect(`/${locale}/dashboard/profile`);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_lv, name_en")
    .order("name_lv");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("createTitle")}</h1>
      <div className="rounded-2xl border border-[#e7e2d8] bg-white p-6 shadow-sm sm:p-8">
        <ListingForm
          locale={locale}
          listingId={null}
          categories={categories ?? []}
          existingImages={[]}
        />
      </div>
    </div>
  );
}
