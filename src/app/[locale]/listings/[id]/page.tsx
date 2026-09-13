import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSellerButton } from "@/components/message-seller-button";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("Listing");
  const tReport = await getTranslations("Report");
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, listing_type, title, description, price, status, profiles(user_id, business_name, slug), categories(name_lv, name_en)",
    )
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (!listing) notFound();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const { data: images } = await supabase
    .from("listing_images")
    .select("id, url")
    .eq("listing_id", id)
    .order("sort_order");

  const profile = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
  const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      {images && images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.url}
              alt=""
              className="h-48 w-64 flex-shrink-0 rounded-xl object-cover"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            listing.listing_type === "sell"
              ? "bg-[#fbe6da] text-[#d9713a]"
              : "bg-[#dde8ef] text-[#2f6690]"
          }`}
        >
          {listing.listing_type === "sell" ? t("sell") : t("buy")}
        </span>
        {category && (
          <span className="rounded-full bg-[#e7efe1] px-3 py-1 text-xs font-semibold text-[#3f6b3f]">
            {locale === "lv" ? category.name_lv : category.name_en}
          </span>
        )}
      </div>

      <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{listing.title}</h1>

      {listing.price != null && (
        <div className="text-xl font-semibold text-[#2b2a24]">€{listing.price}</div>
      )}

      {listing.description && <p className="text-[#55503f]">{listing.description}</p>}

      {profile && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#e7e2d8] bg-white p-4">
          <div>
            <div className="mb-1 text-xs text-[#7a7566]">{t("seller")}</div>
            <Link
              href={`/profiles/${profile.slug}`}
              className="font-semibold text-[#3f6b3f]"
            >
              {profile.business_name}
            </Link>
          </div>
          <MessageSellerButton
            locale={locale}
            viewerUserId={viewer?.id ?? null}
            sellerUserId={profile.user_id}
            listingId={listing.id}
          />
        </div>
      )}

      {viewer && (
        <Link
          href={`/report/listing/${listing.id}`}
          className="w-fit text-xs text-[#7a7566] underline"
        >
          {tReport("reportLink")}
        </Link>
      )}
    </div>
  );
}
