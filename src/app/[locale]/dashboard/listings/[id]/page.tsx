import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "../listing-form";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
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

  const { data: listing } = await supabase
    .from("listings")
    .select("id, listing_type, title, description, category_id, price, price_plus_vat, profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.profile_id !== profile.id) notFound();

  const [{ data: categories }, { data: images }] = await Promise.all([
    supabase.from("categories").select("id, name_lv, name_en").order("name_lv"),
    supabase
      .from("listing_images")
      .select("id, url")
      .eq("listing_id", id)
      .order("sort_order"),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("editTitle")}</h1>
      <div className="rounded-2xl border border-[#e7e2d8] bg-white p-6 shadow-sm sm:p-8">
        <ListingForm
          locale={locale}
          listingId={listing.id}
          categories={categories ?? []}
          existingImages={images ?? []}
          initial={{
            listingType: listing.listing_type,
            title: listing.title,
            description: listing.description ?? "",
            categoryId: listing.category_id ?? "",
            price: listing.price != null ? String(listing.price) : "",
            plusVat: listing.price_plus_vat,
          }}
        />
      </div>
    </div>
  );
}
