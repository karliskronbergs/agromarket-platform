import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSellerButton } from "@/components/message-seller-button";
import { IconPin, IconPhone, IconMail, IconCheck, IconShield } from "@/components/icons";
import { MiniMap } from "@/components/mini-map";
import { ViewTracker } from "./view-tracker";
import Image from "next/image";
import { AttributeBadges } from "@/components/attribute-badges";
import { getAttributesByProfileIds } from "@/lib/attributes";
import { priceUnitSuffix, formatRelativeDays } from "@/lib/format";
import { ProfileTabs } from "@/components/profile-tabs";
import { MobileActionBar } from "@/components/mobile-action-bar";

export const dynamic = "force-dynamic";

const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 10px, #e4e7e1 10px, #e4e7e1 20px)",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) return {};
  return {
    title: profile.business_name,
    description: profile.description ?? undefined,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("Listing");
  const tProfile = await getTranslations("Profile");
  const tReport = await getTranslations("Report");
  const tAuth = await getTranslations("Auth");
  const tNav = await getTranslations("Nav");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, user_id, business_name, description, phone, contact_email, website, address, avatar_url, cover_url, verified, admin_badge, lat, lng, created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) notFound();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const [{ data: profileCategories }, { data: listings }] = await Promise.all([
    supabase
      .from("profile_categories")
      .select("categories(name_lv, name_en)")
      .eq("profile_id", profile.id),
    supabase
      .from("listings")
      .select("id, title, listing_type, price, price_unit, price_plus_vat, created_at, listing_images(url, sort_order)")
      .eq("profile_id", profile.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  const attributesByProfile = await getAttributesByProfileIds(supabase, [profile.id]);
  const attributes = attributesByProfile.get(profile.id) ?? [];

  const memberSince = new Date(profile.created_at).getFullYear();
  const categories = (profileCategories ?? [])
    .map((pc) => pc.categories as unknown as { name_lv: string; name_en: string } | null)
    .filter((c): c is { name_lv: string; name_en: string } => !!c);
  const primaryCategoryName = categories[0] ? (locale === "lv" ? categories[0].name_lv : categories[0].name_en) : "";
  const initials = profile.business_name.slice(0, 1).toUpperCase();

  const listingsTabContent =
    listings && listings.length > 0 ? (
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        {listings.map((l) => {
          const images = (l.listing_images ?? []) as { url: string; sort_order: number }[];
          const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
          const isSell = l.listing_type === "sell";
          return (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white transition hover:shadow-[0_8px_20px_rgba(29,35,41,0.08)]"
            >
              <div style={STRIPE_BG} className="relative h-[140px]">
                {firstImage && <Image src={firstImage.url} alt="" fill sizes="240px" className="object-cover" />}
                <span
                  className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-[3px] text-xs font-semibold"
                  style={isSell ? { background: "#e6efe6", color: "#2f5538" } : { background: "#f5ecd9", color: "#7a5516" }}
                >
                  {isSell ? t("sell") : t("buy")}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3.5">
                <div className="line-clamp-2 text-[15px] font-medium text-[#1d2329]">{l.title}</div>
                {l.price != null && (
                  <div className="text-base font-semibold text-[#1d2329]">
                    €{l.price}
                    <span className="ml-1 text-xs font-normal text-[#5d6670]">
                      {priceUnitSuffix(l.price_unit, locale)}
                      {l.price_plus_vat ? ` ${t("plusVat")}` : ""}
                    </span>
                  </div>
                )}
                <div className="text-xs text-[#5d6670]">{formatRelativeDays(l.created_at, locale)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    ) : (
      <p className="text-sm text-[#5d6670]">{t("noListingsForProfile")}</p>
    );

  const aboutTabContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e3e6e8] bg-white p-6">
        {profile.description && (
          <p className="m-0 text-pretty text-base leading-[1.65] text-[#1d2329]">{profile.description}</p>
        )}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((c, i) => (
              <span key={i} className="rounded-full bg-[#f0f2f0] px-3 py-1.5 text-[13px] text-[#1d2329]">
                {locale === "lv" ? c.name_lv : c.name_en}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="sm:hidden">
        <ContactsCard
          profile={profile}
          viewer={viewer}
          tProfile={tProfile}
          tAuth={tAuth}
          memberSince={memberSince}
          showSince
        />
      </div>
      {profile.lat != null && profile.lng != null && (
        <div className="h-[180px] overflow-hidden rounded-2xl border border-[#e3e6e8] bg-[#e8ece6] sm:hidden">
          <MiniMap lat={profile.lat} lng={profile.lng} />
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-24 sm:pb-0">
      <ViewTracker profileId={profile.id} />
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6">
        <div className="hidden flex-wrap gap-2 text-sm text-[#5d6670] sm:flex">
          <Link href="/map" className="text-[#3f6e4a]">
            {tNav("map")}
          </Link>
          <span>/</span>
          <span>{primaryCategoryName}</span>
          <span>/</span>
          <span className="text-[#1d2329]">{profile.business_name}</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white sm:rounded-[20px]">
          <div
            style={!profile.cover_url ? STRIPE_BG : undefined}
            className="relative h-[120px] font-mono text-[11px] text-[#7a8279] sm:h-40"
          >
            {profile.cover_url ? (
              <Image src={profile.cover_url} alt="" fill sizes="(max-width: 640px) 100vw, 1248px" className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center">{tProfile("coverPlaceholder")}</div>
            )}
          </div>
          <div className="flex flex-col gap-4 px-4 pb-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6 sm:px-7 sm:pb-7">
            <div className="relative -mt-[42px] h-[84px] w-[84px] flex-shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#e4eaf0] sm:-mt-[52px] sm:h-[104px] sm:w-[104px]">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill sizes="104px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[26px] font-semibold text-[#3b5166] sm:text-[32px]">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:min-w-[260px] sm:pt-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em] text-[#1d2329] sm:text-[30px]">
                  {profile.business_name}
                </h1>
                {profile.verified && (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#eef3ee] px-2.5 py-1 text-[13px] font-medium text-[#2f5538] sm:px-2.5">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3f6e4a] text-white">
                      <IconCheck className="h-2 w-2" />
                    </span>
                    {tProfile("verifiedShort")}
                  </span>
                )}
                {profile.admin_badge && (
                  <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[13px] font-medium text-red-600">
                    <IconShield className="h-3.5 w-3.5" />
                    {tProfile("adminBadge")}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 text-sm text-[#5d6670] sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5 sm:text-[15px]">
                {primaryCategoryName && <span className="font-medium text-[#1d2329]">{primaryCategoryName}</span>}
                {profile.address && <span>{profile.address}</span>}
                <span className="hidden sm:inline">{tProfile("onPlatformSince", { year: memberSince })}</span>
              </div>
              {attributes.length > 0 && (
                <div>
                  <AttributeBadges attributes={attributes} locale={locale} />
                </div>
              )}
            </div>

            <div className="hidden flex-shrink-0 gap-2.5 sm:flex">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center rounded-[10px] border border-[#d9dee2] bg-white px-[18px] py-3 text-[15px] font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
                >
                  {tProfile("call")}
                </a>
              )}
              <MessageSellerButton locale={locale} viewerUserId={viewer?.id ?? null} sellerUserId={profile.user_id} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <ProfileTabs
              listingsLabel={t("myListings")}
              aboutLabel={tProfile("tabAbout")}
              listingsContent={listingsTabContent}
              aboutContent={aboutTabContent}
            />
          </div>

          <div className="hidden w-full flex-col gap-4 sm:flex sm:w-full sm:max-w-[400px] sm:flex-1">
            <ContactsCard profile={profile} viewer={viewer} tProfile={tProfile} tAuth={tAuth} memberSince={memberSince} />
            {profile.lat != null && profile.lng != null && (
              <div className="h-[240px] overflow-hidden rounded-2xl border border-[#e3e6e8] bg-[#e8ece6]">
                <MiniMap lat={profile.lat} lng={profile.lng} />
              </div>
            )}
            {viewer && (
              <Link href={`/report/profile/${profile.id}`} className="w-fit text-xs text-[#8a929a] underline">
                {tReport("reportLink")}
              </Link>
            )}
          </div>
        </div>
      </div>

      <MobileActionBar
        phone={profile.phone}
        phoneLabel={tProfile("call")}
        message={<MessageSellerButton locale={locale} viewerUserId={viewer?.id ?? null} sellerUserId={profile.user_id} />}
      />
    </div>
  );
}

type ProfileRow = {
  id: string;
  user_id: string;
  phone: string | null;
  contact_email: string | null;
  address: string | null;
};

function ContactsCard({
  profile,
  viewer,
  tProfile,
  tAuth,
  memberSince,
  showSince,
}: {
  profile: ProfileRow;
  viewer: { id: string } | null;
  tProfile: Awaited<ReturnType<typeof getTranslations>>;
  tAuth: Awaited<ReturnType<typeof getTranslations>>;
  memberSince: number;
  showSince?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-[#e3e6e8] bg-white p-5">
      <div className="text-base font-semibold text-[#1d2329]">{tProfile("contactsTitle")}</div>
      <div className="relative">
        <div className={`flex flex-col gap-3 ${viewer ? "" : "pointer-events-none select-none blur-sm"}`}>
          {profile.address && (
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-xs text-[#5d6670]">
                <IconPin className="h-3.5 w-3.5" />
                {tProfile("address")}
              </span>
              <span className="text-[15px] text-[#1d2329]">{profile.address}</span>
            </div>
          )}
          {profile.phone && (
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-xs text-[#5d6670]">
                <IconPhone className="h-3.5 w-3.5" />
                {tProfile("phone")}
              </span>
              <span className="text-[15px] text-[#1d2329]">{profile.phone}</span>
            </div>
          )}
          {profile.contact_email && (
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-xs text-[#5d6670]">
                <IconMail className="h-3.5 w-3.5" />
                {tProfile("emailLabel")}
              </span>
              <span className="text-[15px] text-[#1d2329]">{profile.contact_email}</span>
            </div>
          )}
          {showSince && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#5d6670]">{tProfile("onPlatformLabel")}</span>
              <span className="text-[15px] text-[#1d2329]">{tProfile("sinceShort", { year: memberSince })}</span>
            </div>
          )}
        </div>

        {!viewer && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/85 p-3 text-center">
            <p className="text-xs font-medium text-[#1d2329]">{tProfile("loginToViewContact")}</p>
            <Link href="/auth/login" className="rounded-[10px] bg-[#3f6e4a] px-4 py-2 text-xs font-semibold text-white">
              {tAuth("signInCta")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
