import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSellerButton } from "@/components/message-seller-button";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { MiniMap } from "@/components/mini-map";
import { IconCheck, IconShield, IconLeaf } from "@/components/icons";
import { formatRelativeDays, priceUnitSuffix } from "@/lib/format";
import { getAnimalGroupForCategory, breedLabel } from "@/lib/livestock";
import { conditionLabel } from "@/lib/equipment";
import { Gallery } from "./gallery";
import { ViewTracker } from "./view-tracker";
import { AttributeBadges, type AttributeInfo } from "@/components/attribute-badges";
import { getAttributesByProfileIds } from "@/lib/attributes";

export const dynamic = "force-dynamic";

const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 8px, #e4e7e1 8px, #e4e7e1 16px)",
};

function initialsFor(name: string): string {
  return name.slice(0, 1).toUpperCase();
}

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
  const tNav = await getTranslations("Nav");
  const tReport = await getTranslations("Report");
  const supabase = await createClient();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const { data: adminRow } = viewer
    ? await supabase.from("admins").select("user_id").eq("user_id", viewer.id).maybeSingle()
    : { data: null };
  const isAdmin = !!adminRow;

  const listingQuery = supabase
    .from("listings")
    .select(
      "id, listing_type, title, description, price, price_unit, price_plus_vat, breed, age_months, quantity, condition, manufacturer, model, organic_certified, category_id, status, lat, lng, created_at, profiles(id, user_id, business_name, slug, avatar_url, verified, admin_badge, address, phone, status), categories(name_lv, name_en)",
    )
    .eq("id", id);

  const { data: rawListing } = isAdmin
    ? await listingQuery.maybeSingle()
    : await listingQuery.eq("status", "active").gt("expires_at", new Date().toISOString()).maybeSingle();

  const rawProfile = rawListing
    ? Array.isArray(rawListing.profiles)
      ? rawListing.profiles[0]
      : rawListing.profiles
    : null;
  const listing = !isAdmin && rawProfile?.status !== "active" ? null : rawListing;

  if (!listing) notFound();

  const [{ data: images }, { data: allCategories }] = await Promise.all([
    supabase.from("listing_images").select("url").eq("listing_id", id).order("sort_order"),
    supabase.from("categories").select("id, slug, name_lv, name_en, parent_id"),
  ]);

  const profile = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
  const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;
  const categoryLabel = category ? (locale === "lv" ? category.name_lv : category.name_en) : null;
  const animalGroup = getAnimalGroupForCategory(allCategories ?? [], listing.category_id);
  const breedText = animalGroup && listing.breed ? breedLabel(animalGroup, listing.breed, locale) : null;
  const conditionText = listing.condition ? conditionLabel(listing.condition, locale) : null;
  const isSell = listing.listing_type === "sell";
  const priceText =
    listing.price != null
      ? `€${listing.price}${priceUnitSuffix(listing.price_unit, locale)}${listing.price_plus_vat ? ` ${t("plusVat")}` : ""}`
      : null;

  let activeListingsCount = 0;
  let sellerAttributes: AttributeInfo[] = [];
  let similar: {
    id: string;
    title: string;
    price: number | null;
    price_unit: string | null;
    listing_images: { url: string }[];
    profiles: { address: string | null } | { address: string | null }[] | null;
  }[] = [];
  if (profile) {
    const [{ count }, attributesByProfile, { data: similarData }] = await Promise.all([
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .eq("status", "active"),
      getAttributesByProfileIds(supabase, [profile.id]),
      listing.category_id
        ? supabase
            .from("listings")
            .select("id, title, price, price_unit, listing_images(url, sort_order), profiles(address)")
            .eq("category_id", listing.category_id)
            .eq("status", "active")
            .neq("id", listing.id)
            .gt("expires_at", new Date().toISOString())
            .limit(3)
        : Promise.resolve({ data: [] }),
    ]);
    activeListingsCount = count ?? 0;
    sellerAttributes = attributesByProfile.get(profile.id) ?? [];
    similar = similarData ?? [];
  }

  return (
    <div className="pb-24 sm:pb-0">
      <ViewTracker listingId={listing.id} />
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6">
        {isAdmin && (listing.status !== "active" || rawProfile?.status !== "active") && (
          <div className="rounded-lg bg-[#fbe9dd] px-3.5 py-2.5 text-xs font-medium text-[#8a4a26]">
            {t("adminPreviewNote")} ({listing.status}
            {rawProfile?.status !== "active" ? `, ${rawProfile?.status}` : ""})
          </div>
        )}

        <div className="hidden flex-wrap gap-2 text-sm text-[#5d6670] sm:flex">
          <Link href={{ pathname: "/map", query: { mode: listing.listing_type } }} className="text-[#3f6e4a]">
            {tNav("listings")}
          </Link>
          <span>/</span>
          <span>{categoryLabel}</span>
          <span>/</span>
          <span className="text-[#1d2329]">{listing.title}</span>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="min-w-0 flex-1 sm:flex sm:flex-col sm:gap-5">
            <Gallery images={(images ?? []).map((img) => img.url)} title={listing.title} />

            {/* Mobile: title/price/meta block right under the gallery */}
            <div className="flex flex-col gap-2.5 border-b border-[#e3e6e8] py-4 sm:hidden">
              <TypeAndCategoryRow isSell={isSell} categoryLabel={categoryLabel} organic={!!listing.organic_certified} t={t} />
              <h1 className="m-0 text-balance text-[22px] font-semibold leading-[1.25] tracking-[-0.01em] text-[#1d2329]">
                {listing.title}
              </h1>
              {priceText && (
                <div className="text-[26px] font-bold tracking-[-0.01em] text-[#1d2329]">{priceText}</div>
              )}
              <div className="text-[13px] text-[#5d6670]">
                {[profile?.address, formatRelativeDays(listing.created_at, locale)].filter(Boolean).join(" · ")}
              </div>
              {sellerAttributes.length > 0 && <AttributeBadges attributes={sellerAttributes} locale={locale} />}
            </div>

            {/* Mobile: seller card right after the top info block */}
            {profile && (
              <Link
                href={`/profiles/${profile.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-[#e3e6e8] bg-white p-3.5 sm:hidden"
              >
                <SellerAvatar profile={profile} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-semibold text-[#1d2329]">{profile.business_name}</span>
                    {profile.verified && <VerifiedDot />}
                  </div>
                  {categoryLabel && <div className="mt-0.5 text-[13px] text-[#5d6670]">{categoryLabel}</div>}
                </div>
                <span className="text-lg text-[#3f6e4a]">→</span>
              </Link>
            )}

            <div className="flex flex-col gap-5 rounded-2xl border border-[#e3e6e8] bg-white p-4 sm:p-6">
              {listing.description && (
                <div>
                  <h2 className="m-0 mb-2.5 text-lg font-semibold text-[#1d2329] sm:text-xl">{t("description")}</h2>
                  <p className="m-0 text-pretty text-[15px] leading-[1.6] text-[#1d2329] sm:text-base sm:leading-[1.65]">
                    {listing.description}
                  </p>
                </div>
              )}

              <div>
                <h2 className="m-0 mb-1.5 text-lg font-semibold text-[#1d2329] sm:text-xl">{t("details")}</h2>
                <div className="grid grid-cols-1 sm:[grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] sm:gap-x-6">
                  <DetailRow label={t("type")} value={isSell ? t("sell") : t("buy")} />
                  {categoryLabel && <DetailRow label={t("category")} value={categoryLabel} />}
                  {breedText && <DetailRow label={t("breed")} value={breedText} />}
                  {listing.manufacturer && <DetailRow label={t("manufacturer")} value={listing.manufacturer} />}
                  {listing.model && <DetailRow label={t("model")} value={listing.model} />}
                  {listing.age_months != null && (
                    <DetailRow label={t("ageMonths")} value={`${listing.age_months} ${t("ageMonthsShort")}`} />
                  )}
                  {listing.quantity != null && (
                    <DetailRow label={t("quantity")} value={`${listing.quantity} ${t("quantityAvailable")}`} />
                  )}
                  {conditionText && <DetailRow label={t("condition")} value={conditionText} />}
                  {profile?.address && <DetailRow label={t("location")} value={profile.address} />}
                  <DetailRow label={t("postedLabel")} value={formatRelativeDays(listing.created_at, locale)} />
                  <DetailRow label={t("listingNumber")} value={listing.id.slice(0, 8).toUpperCase()} />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#f0f2f0] px-3.5 py-3 text-[13px] leading-[1.5] text-[#4a535b] sm:hidden">
              {t("safetyTip")}
            </div>

            {similar.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="m-0 text-lg font-semibold text-[#1d2329] sm:text-2xl">{t("similarListings")}</h2>
                <div className="flex flex-col gap-2.5 sm:hidden">
                  {similar.map((l) => (
                    <SimilarRow key={l.id} listing={l} locale={locale} thumbSize={72} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop sticky sidebar */}
          <div className="hidden w-full flex-col gap-3.5 sm:sticky sm:top-[88px] sm:flex sm:w-full sm:max-w-[400px] sm:flex-1">
            <div className="flex flex-col gap-3.5 rounded-[18px] border border-[#e3e6e8] bg-white p-6">
              <TypeAndCategoryRow isSell={isSell} categoryLabel={categoryLabel} organic={!!listing.organic_certified} t={t} />
              <h1 className="m-0 text-balance text-[26px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#1d2329]">
                {listing.title}
              </h1>
              {priceText && (
                <div className="text-[30px] font-bold tracking-[-0.01em] text-[#1d2329]">{priceText}</div>
              )}
              <div className="text-sm text-[#5d6670]">
                {[profile?.address, formatRelativeDays(listing.created_at, locale)].filter(Boolean).join(" · ")}
              </div>
              {sellerAttributes.length > 0 && <AttributeBadges attributes={sellerAttributes} locale={locale} />}
              <div className="mt-1 flex flex-col gap-2">
                {profile && (
                  <MessageSellerButton
                    locale={locale}
                    viewerUserId={viewer?.id ?? null}
                    sellerUserId={profile.user_id}
                    listingId={listing.id}
                  />
                )}
                {profile?.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center justify-center rounded-[10px] border border-[#d9dee2] px-4 py-3.5 text-base font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
                  >
                    {t("callSeller")}
                  </a>
                )}
              </div>
            </div>

            {profile && (
              <Link
                href={`/profiles/${profile.slug}`}
                className="flex items-center gap-3.5 rounded-[18px] border border-[#e3e6e8] bg-white p-[18px] transition hover:border-[#3f6e4a]"
              >
                <SellerAvatar profile={profile} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-semibold text-[#1d2329]">{profile.business_name}</span>
                    {profile.verified && <VerifiedDot />}
                  </div>
                  {categoryLabel && <div className="mt-0.5 text-[13px] text-[#5d6670]">{categoryLabel}</div>}
                </div>
                <span className="flex-shrink-0 text-sm font-medium text-[#3f6e4a]">{t("viewProfile")}</span>
              </Link>
            )}

            <div className="hidden rounded-[14px] bg-[#f0f2f0] px-4 py-3.5 text-[13px] leading-[1.5] text-[#4a535b] sm:block">
              {t("safetyTip")}
            </div>

            {listing.lat != null && listing.lng != null && (
              <div className="overflow-hidden rounded-[18px] border border-[#e3e6e8] bg-[#e8ece6]">
                <div className="h-[200px]">
                  <MiniMap
                    lat={listing.lat}
                    lng={listing.lng}
                    color={isSell ? "#3f6e4a" : "#3b5166"}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm font-semibold text-[#3f6e4a]"
                >
                  {t("getDirections")} &rarr;
                </a>
              </div>
            )}

            {activeListingsCount > 1 && (
              <div className="text-sm text-[#5d6670]">
                {activeListingsCount} {t("activeListings")}
              </div>
            )}

            {viewer && (
              <Link href={`/report/listing/${listing.id}`} className="w-fit text-xs text-[#8a929a] underline">
                {tReport("reportLink")}
              </Link>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="hidden grid-cols-1 gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] sm:grid">
            {similar.map((l) => (
              <SimilarRow key={l.id} listing={l} locale={locale} thumbSize={80} />
            ))}
          </div>
        )}
      </div>

      {profile && (
        <MobileActionBar
          phone={profile.phone}
          phoneLabel={t("callSeller")}
          message={
            <MessageSellerButton
              locale={locale}
              viewerUserId={viewer?.id ?? null}
              sellerUserId={profile.user_id}
              listingId={listing.id}
            />
          }
        />
      )}
    </div>
  );
}

function TypeAndCategoryRow({
  isSell,
  categoryLabel,
  organic,
  t,
}: {
  isSell: boolean;
  categoryLabel: string | null;
  organic: boolean;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="rounded-full px-2.5 py-1 text-xs font-semibold"
        style={isSell ? { background: "#e6efe6", color: "#2f5538" } : { background: "#f5ecd9", color: "#7a5516" }}
      >
        {isSell ? t("sell") : t("buy")}
      </span>
      {categoryLabel && <span className="text-[13px] text-[#5d6670]">{categoryLabel}</span>}
      {organic && (
        <span className="flex items-center gap-1 rounded-full bg-[#eef3ee] px-2.5 py-1 text-xs font-semibold text-[#2f5538]">
          <IconLeaf className="h-3 w-3" />
          {t("organicCertified")}
        </span>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#eef0f1] py-3 text-[15px]">
      <span className="text-[#5d6670]">{label}</span>
      <span className="text-right font-medium text-[#1d2329]">{value}</span>
    </div>
  );
}

function VerifiedDot() {
  return <IconCheck className="h-[15px] w-[15px] flex-shrink-0 text-[#3f6e4a]" />;
}

type SellerLite = {
  avatar_url: string | null;
  business_name: string;
  verified: boolean | null;
  admin_badge: boolean | null;
};

function SellerAvatar({ profile, size }: { profile: SellerLite; size: number }) {
  return (
    <div className="relative flex-shrink-0 overflow-hidden rounded-full bg-[#e4eaf0]" style={{ width: size, height: size }}>
      {profile.avatar_url ? (
        <Image src={profile.avatar_url} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-[#3b5166]">
          {initialsFor(profile.business_name)}
        </div>
      )}
      {profile.admin_badge && (
        <IconShield className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white text-red-600" />
      )}
    </div>
  );
}

function SimilarRow({
  listing,
  locale,
  thumbSize,
}: {
  listing: {
    id: string;
    title: string;
    price: number | null;
    price_unit: string | null;
    listing_images: { url: string }[];
    profiles: { address: string | null } | { address: string | null }[] | null;
  };
  locale: string;
  thumbSize: number;
}) {
  const thumb = listing.listing_images?.[0]?.url;
  const p = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex gap-3 rounded-2xl border border-[#e3e6e8] bg-white p-2.5 transition hover:shadow-[0_8px_20px_rgba(29,35,41,0.08)]"
    >
      <div
        style={{ ...(!thumb ? STRIPE_BG : {}), width: thumbSize, height: thumbSize }}
        className="relative flex-shrink-0 overflow-hidden rounded-[10px]"
      >
        {thumb && <Image src={thumb} alt="" fill sizes={`${thumbSize}px`} className="object-cover" />}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <div className="line-clamp-2 text-[15px] font-medium leading-[1.3] text-[#1d2329]">{listing.title}</div>
        {listing.price != null && (
          <div className="text-[15px] font-semibold text-[#1d2329]">
            €{listing.price}
            <span className="ml-1 text-xs font-normal text-[#5d6670]">{priceUnitSuffix(listing.price_unit, locale)}</span>
          </div>
        )}
        {p?.address && <div className="truncate text-xs text-[#5d6670]">{p.address}</div>}
      </div>
    </Link>
  );
}
