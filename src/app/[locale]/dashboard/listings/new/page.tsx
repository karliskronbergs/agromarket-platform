import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
    .select("id, address")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!profile) redirect(`/${locale}/dashboard/profile`);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_lv, name_en, parent_id")
    .order("sort_order")
    .order("name_lv");

  return (
    <div className="flex flex-col gap-1.5">
      <Link href="/dashboard/listings" className="w-fit text-sm font-medium text-[#3f6e4a]">
        ← {t("myListings")}
      </Link>
      <h1 className="m-0 mb-2.5 text-2xl font-semibold tracking-[-0.01em] text-[#1d2329] sm:text-[30px]">
        {t("createTitle")}
      </h1>
      <ListingForm
        locale={locale}
        listingId={null}
        categories={categories ?? []}
        existingImages={[]}
        address={profile.address ?? ""}
      />
    </div>
  );
}
