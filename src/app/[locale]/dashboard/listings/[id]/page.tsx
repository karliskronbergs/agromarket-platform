import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
    .select("id, address")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!profile) redirect(`/${locale}/dashboard/profile`);

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, listing_type, title, description, category_id, price, price_unit, price_plus_vat, breed, age_months, quantity, condition, manufacturer, model, organic_certified, profile_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.profile_id !== profile.id) notFound();

  const [{ data: categories }, { data: images }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name_lv, name_en, parent_id")
      .order("sort_order")
      .order("name_lv"),
    supabase
      .from("listing_images")
      .select("id, url")
      .eq("listing_id", id)
      .order("sort_order"),
  ]);

  return (
    <div className="flex flex-col gap-1.5">
      <Link href="/dashboard/listings" className="w-fit text-sm font-medium text-[#3f6e4a]">
        ← {t("myListings")}
      </Link>
      <h1 className="m-0 mb-2.5 text-2xl font-semibold tracking-[-0.01em] text-[#1d2329] sm:text-[30px]">
        {t("editTitle")}
      </h1>
      <ListingForm
        locale={locale}
        listingId={listing.id}
        categories={categories ?? []}
        existingImages={images ?? []}
        address={profile.address ?? ""}
        initial={{
          listingType: listing.listing_type,
          title: listing.title,
          description: listing.description ?? "",
          categoryId: listing.category_id ?? "",
          price: listing.price != null ? String(listing.price) : "",
          priceUnit: listing.price_unit,
          plusVat: listing.price_plus_vat,
          breed: listing.breed,
          ageMonths: listing.age_months != null ? String(listing.age_months) : null,
          quantity: listing.quantity != null ? String(listing.quantity) : null,
          condition: listing.condition,
          manufacturer: listing.manufacturer,
          model: listing.model,
          organicCertified: listing.organic_certified,
        }}
      />
    </div>
  );
}
