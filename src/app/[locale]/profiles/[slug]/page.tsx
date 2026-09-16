import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSellerButton } from "@/components/message-seller-button";
import { IconPin, IconPhone, IconMail, IconCheck, IconShield } from "@/components/icons";
import { MiniMap } from "@/components/mini-map";

export const dynamic = "force-dynamic";

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
      .select("id, title, listing_type, price, price_plus_vat, listing_images(url)")
      .eq("profile_id", profile.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  const memberSince = new Date(profile.created_at).getFullYear();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6">
      <div className="relative">
        <div
          className="h-36 w-full overflow-hidden rounded-2xl sm:h-44"
          style={{ background: "linear-gradient(120deg,#3f6b3f,#5c8a2e,#7a9c4a)" }}
        >
          {profile.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="flex flex-col gap-4 px-2 pt-0 sm:flex-row sm:items-end sm:justify-between sm:px-4">
          <div className="flex items-end gap-4">
            <div className="relative -mt-10 h-20 w-20 flex-shrink-0 sm:-mt-12 sm:h-24 sm:w-24">
              <div
                className={`h-full w-full overflow-hidden rounded-full border-4 border-[#faf8f3] ${
                  profile.avatar_url ? "bg-white" : "bg-[#3f6b3f]"
                }`}
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-sans text-2xl font-bold text-white">
                    {profile.business_name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              {profile.verified && (
                <IconCheck className="absolute bottom-0 right-0 h-6 w-6 rounded-full text-[#2563eb] ring-2 ring-[#faf8f3]" />
              )}
              {profile.admin_badge && (
                <IconShield className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full text-red-600 ring-2 ring-[#faf8f3]" />
              )}
            </div>
            <div className="pb-1">
              <h1 className="font-sans text-xl font-bold text-[#2b2a24] sm:text-2xl">
                {profile.business_name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {(profileCategories ?? []).map((pc, i) => {
                  const cat = pc.categories as unknown as { name_lv: string; name_en: string } | null;
                  if (!cat) return null;
                  return (
                    <span
                      key={i}
                      className="rounded-full bg-[#e7efe1] px-2.5 py-0.5 text-xs font-semibold text-[#3f6b3f]"
                    >
                      {locale === "lv" ? cat.name_lv : cat.name_en}
                    </span>
                  );
                })}
                {profile.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-[#dbeafe] px-2.5 py-0.5 text-xs font-semibold text-[#2563eb]">
                    <IconCheck className="h-3.5 w-3.5 flex-shrink-0" />
                    {tProfile("verifiedBadge")}
                  </span>
                )}
                {profile.admin_badge && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                    <IconShield className="h-3.5 w-3.5 flex-shrink-0" />
                    {tProfile("adminBadge")}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#7a7566]">
                {profile.address && (
                  <span className="flex items-center gap-1">
                    <IconPin className="h-3 w-3 flex-shrink-0" />
                    {profile.address}
                  </span>
                )}
                <span>
                  {tProfile("memberSince")} {memberSince}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-shrink-0 gap-2">
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-2 rounded-lg border-[1.5px] border-[#3f6b3f] bg-white px-4 py-2 text-sm font-semibold text-[#3f6b3f]"
              >
                <IconPhone className="h-4 w-4" />
                {tProfile("call")}
              </a>
            )}
            <MessageSellerButton
              locale={locale}
              viewerUserId={viewer?.id ?? null}
              sellerUserId={profile.user_id}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 h-px bg-[#e7e2d8]" />

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <div className="min-w-0 flex-1">
          {profile.description && (
            <>
              <h2 className="mb-2 font-sans text-base font-semibold text-[#2b2a24]">
                {tProfile("about")}
              </h2>
              <p className="mb-7 max-w-xl text-sm leading-relaxed text-[#55503f]">
                {profile.description}
              </p>
            </>
          )}

          {listings && listings.length > 0 && (
            <div>
              <h2 className="mb-3 font-sans text-base font-semibold text-[#2b2a24]">
                {t("myListings")}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {listings.map((l) => {
                  const thumb = Array.isArray(l.listing_images)
                    ? l.listing_images[0]?.url
                    : undefined;
                  return (
                    <Link
                      key={l.id}
                      href={`/listings/${l.id}`}
                      className="overflow-hidden rounded-xl border border-[#e7e2d8] bg-white hover:border-[#3f6b3f]"
                    >
                      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#3f6b3f] to-[#7a9c4a]">
                        {thumb && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="p-3">
                        <div className="mb-1 line-clamp-2 text-sm font-semibold text-[#2b2a24]">
                          {l.title}
                        </div>
                        {l.price != null && (
                          <div className="mb-1 text-sm font-bold text-[#d9713a]">
                            €{l.price}
                            {l.price_plus_vat && (
                              <span className="ml-1 text-xs font-semibold text-[#7a7566]">
                                {t("plusVat")}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-[#7a7566]">
                          {l.listing_type === "sell" ? t("sell") : t("buy")}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-4 sm:w-80 sm:flex-shrink-0">
          <div className="rounded-xl border border-[#e7e2d8] bg-white p-4">
            <div className="mb-3 font-sans text-sm font-semibold text-[#2b2a24]">
              {tProfile("businessInfo")}
            </div>
            <div className="relative">
              <div
                className={`flex flex-col gap-2.5 text-sm text-[#55503f] ${
                  viewer ? "" : "pointer-events-none select-none blur-sm"
                }`}
              >
                {profile.address && (
                  <div className="flex items-start gap-2.5">
                    <IconPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7a7566]" />
                    {profile.address}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2.5">
                    <IconPhone className="h-4 w-4 flex-shrink-0 text-[#7a7566]" />
                    {profile.phone}
                  </div>
                )}
                {profile.contact_email && (
                  <div className="flex items-center gap-2.5">
                    <IconMail className="h-4 w-4 flex-shrink-0 text-[#7a7566]" />
                    {profile.contact_email}
                  </div>
                )}
              </div>

              {!viewer && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/85 p-3 text-center">
                  <p className="text-xs font-medium text-[#2b2a24]">
                    {tProfile("loginToViewContact")}
                  </p>
                  <Link
                    href="/auth/login"
                    className="rounded-full bg-[#3f6b3f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2f5233]"
                  >
                    {tAuth("signInCta")}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {profile.lat != null && profile.lng != null && (
            <div className="overflow-hidden rounded-xl border border-[#e7e2d8] bg-white">
              <MiniMap lat={profile.lat} lng={profile.lng} />
              <a
                href={`https://www.google.com/maps?q=${profile.lat},${profile.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3.5 py-2.5 text-sm font-semibold text-[#3f6b3f]"
              >
                {tProfile("viewOnMap")} &rarr;
              </a>
            </div>
          )}

          {viewer && (
            <Link
              href={`/report/profile/${profile.id}`}
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
