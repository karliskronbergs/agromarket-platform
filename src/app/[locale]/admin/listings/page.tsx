import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ListingReviewActions } from "./listing-review-actions";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Admin");
  const tListing = await getTranslations("Listing");
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, title, listing_type, price, created_at, profiles(business_name), categories(name_lv, name_en)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col gap-3">
      {(!listings || listings.length === 0) && (
        <p className="text-sm text-[#55503f]">{t("noPendingListings")}</p>
      )}
      {(listings ?? []).map((l) => {
        const profile = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
        const category = Array.isArray(l.categories) ? l.categories[0] : l.categories;
        return (
          <div
            key={l.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#e7e2d8] bg-white p-4"
          >
            <div>
              <div className="font-semibold text-[#2b2a24]">{l.title}</div>
              <div className="text-xs text-[#7a7566]">
                {profile?.business_name ?? t("unknownTarget")}
                {" · "}
                {l.listing_type === "sell" ? tListing("sell") : tListing("buy")}
                {category ? ` · ${locale === "lv" ? category.name_lv : category.name_en}` : ""}
                {l.price != null ? ` · €${l.price}` : ""}
              </div>
            </div>
            <ListingReviewActions locale={locale} listingId={l.id} />
          </div>
        );
      })}
    </div>
  );
}
