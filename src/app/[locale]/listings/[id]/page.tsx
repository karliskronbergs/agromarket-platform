import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSellerButton } from "@/components/message-seller-button";
import { MiniMap } from "@/components/mini-map";
import { IconPin, IconPhone, IconCheck } from "@/components/icons";
import { formatRelativeDays } from "@/lib/format";
import { Gallery } from "./gallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("title, description")
    .eq("id", id)
    .maybeSingle();

  if (!listing) return {};
  return {
    title: listing.title,
    description: listing.description ?? undefined,
  };
}

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
      "id, listing_type, title, description, price, status, lat, lng, created_at, profiles(id, user_id, business_name, slug, avatar_url, verified, address, phone), categories(name_lv, name_en)",
    )
    .eq("id", id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!listing) notFound();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const { data: images } = await supabase
    .from("listing_images")
    .select("url")
    .eq("listing_id", id)
    .order("sort_order");

  const profile = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
  const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;
  const categoryLabel = category ? (locale === "lv" ? category.name_lv : category.name_en) : null;

  let activeListingsCount = 0;
  if (profile) {
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .eq("status", "active");
    activeListingsCount = count ?? 0;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6">
      <div className="mb-4 text-xs text-[#7a7566]">
        <Link href={{ pathname: "/map", query: { mode: listing.listing_type } }} className="hover:text-[#3f6b3f]">
          {t("myListings")}
        </Link>
        {categoryLabel && <> &rsaquo; {categoryLabel}</>} &rsaquo;{" "}
        <span className="font-medium text-[#2b2a24]">{listing.title}</span>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="min-w-0 flex-1">
          <Gallery images={(images ?? []).map((img) => img.url)} title={listing.title} />

          <h1 className="mt-5 font-sans text-xl font-bold text-[#2b2a24] sm:text-2xl">
            {listing.title}
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                listing.listing_type === "sell"
                  ? "bg-[#fbe6da] text-[#d9713a]"
                  : "bg-[#dde8ef] text-[#2f6690]"
              }`}
            >
              {listing.listing_type === "sell" ? t("sell") : t("buy")}
            </span>
            {categoryLabel && (
              <span className="rounded-full bg-[#e7efe1] px-2.5 py-1 text-xs font-semibold text-[#3f6b3f]">
                {categoryLabel}
              </span>
            )}
          </div>

          {listing.price != null && (
            <div className="mt-3 font-sans text-2xl font-bold text-[#d9713a] sm:text-3xl">
              €{listing.price}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#7a7566]">
            {profile?.address && (
              <span className="flex items-center gap-1">
                <IconPin className="h-3.5 w-3.5" />
                {profile.address}
              </span>
            )}
            <span>{formatRelativeDays(listing.created_at, locale)}</span>
          </div>

          {listing.description && (
            <>
              <h2 className="mb-2 mt-6 font-sans text-base font-semibold text-[#2b2a24]">
                {t("description")}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-[#55503f]">
                {listing.description}
              </p>
            </>
          )}

          <h2 className="mb-2 mt-6 font-sans text-base font-semibold text-[#2b2a24]">
            {t("details")}
          </h2>
          <table className="w-full max-w-lg border-collapse text-sm">
            <tbody>
              <tr className="border-b border-[#f0ede4]">
                <td className="py-2.5 pr-4 text-[#7a7566]">{t("type")}</td>
                <td className="py-2.5 font-medium text-[#2b2a24]">
                  {listing.listing_type === "sell" ? t("sell") : t("buy")}
                </td>
              </tr>
              {categoryLabel && (
                <tr className="border-b border-[#f0ede4]">
                  <td className="py-2.5 pr-4 text-[#7a7566]">{t("category")}</td>
                  <td className="py-2.5 font-medium text-[#2b2a24]">{categoryLabel}</td>
                </tr>
              )}
              {profile?.address && (
                <tr className="border-b border-[#f0ede4]">
                  <td className="py-2.5 pr-4 text-[#7a7566]">{t("location")}</td>
                  <td className="py-2.5 font-medium text-[#2b2a24]">{profile.address}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex w-full flex-col gap-4 sm:w-80 sm:flex-shrink-0">
          {profile && (
            <div className="rounded-xl border border-[#e7e2d8] bg-white p-4">
              <div className="mb-2.5 flex items-center gap-3">
                <div className="relative h-11 w-11 flex-shrink-0">
                  <div
                    className={`h-full w-full overflow-hidden rounded-full ${
                      profile.avatar_url ? "bg-white" : "bg-[#3f6b3f]"
                    }`}
                  >
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-sans text-sm font-bold text-white">
                        {profile.business_name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {profile.verified && (
                    <IconCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full text-[#2563eb] ring-2 ring-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold text-[#2b2a24]">
                      {profile.business_name}
                    </span>
                  </div>
                  {categoryLabel && (
                    <div className="text-xs text-[#7a7566]">{categoryLabel}</div>
                  )}
                </div>
              </div>

              <Link
                href={`/profiles/${profile.slug}`}
                className="mb-3 block text-xs font-semibold text-[#3f6b3f]"
              >
                {t("seller")} &middot; {activeListingsCount} {t("activeListings")}
              </Link>

              <div className="mb-3 h-px bg-[#e7e2d8]" />

              <div className="flex flex-col gap-2">
                <MessageSellerButton
                  locale={locale}
                  viewerUserId={viewer?.id ?? null}
                  sellerUserId={profile.user_id}
                  listingId={listing.id}
                />
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-[#3f6b3f] px-4 py-2.5 text-sm font-semibold text-[#3f6b3f]"
                  >
                    <IconPhone className="h-4 w-4" />
                    {t("callSeller")}
                  </a>
                )}
              </div>
            </div>
          )}


          {listing.lat != null && listing.lng != null && (
            <div className="overflow-hidden rounded-xl border border-[#e7e2d8] bg-white">
              <MiniMap
                lat={listing.lat}
                lng={listing.lng}
                color={listing.listing_type === "sell" ? "#d9713a" : "#2f6690"}
              />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3.5 py-2.5 text-sm font-semibold text-[#3f6b3f]"
              >
                {t("getDirections")} &rarr;
              </a>
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
      </div>
    </div>
  );
}
