import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSellerButton } from "@/components/message-seller-button";
import { IconPin, IconPhone, IconMail, IconGlobe, IconCheck } from "@/components/icons";
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
  const tReport = await getTranslations("Report");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, user_id, business_name, description, phone, contact_email, website, address, avatar_url, cover_url, verified, lat, lng",
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
      .select("id, title, listing_type, price")
      .eq("profile_id", profile.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <div className="h-40 w-full overflow-hidden rounded-xl bg-[#e7efe1] sm:h-56">
          {profile.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex items-end gap-4 px-4 -mt-10">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-4 border-[#faf8f3] bg-[#3f6b3f]">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-sans text-2xl font-bold text-white">
                {profile.business_name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 pb-2">
            <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">
              {profile.business_name}
            </h1>
            {profile.verified && <IconCheck className="h-5 w-5 flex-shrink-0 text-[#3f6b3f]" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex flex-col gap-5 sm:col-span-2">
          <div className="flex flex-wrap gap-2">
            {(profileCategories ?? []).map((pc, i) => {
              const cat = pc.categories as unknown as { name_lv: string; name_en: string } | null;
              if (!cat) return null;
              return (
                <span
                  key={i}
                  className="rounded-full bg-[#e7efe1] px-3 py-1 text-xs font-semibold text-[#3f6b3f]"
                >
                  {locale === "lv" ? cat.name_lv : cat.name_en}
                </span>
              );
            })}
          </div>

          {profile.description && (
            <p className="rounded-xl bg-white p-4 text-[#55503f]">{profile.description}</p>
          )}

          {listings && listings.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="font-sans text-lg font-semibold text-[#2b2a24]">{t("myListings")}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {listings.map((l) => (
                  <Link
                    key={l.id}
                    href={`/listings/${l.id}`}
                    className="flex flex-col gap-1 rounded-xl border border-[#e7e2d8] bg-white p-4 hover:border-[#3f6b3f]"
                  >
                    <span className="font-medium text-[#2b2a24]">{l.title}</span>
                    <span className="text-xs text-[#7a7566]">
                      {l.listing_type === "sell" ? t("sell") : t("buy")}
                      {l.price ? ` · €${l.price}` : ""}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-[#e7e2d8] bg-white p-4">
          <div className="flex flex-col gap-2 text-sm text-[#55503f]">
            {profile.address && (
              <div className="flex items-center gap-2">
                <IconPin className="h-4 w-4 flex-shrink-0 text-[#7a7566]" />
                {profile.address}
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2">
                <IconPhone className="h-4 w-4 flex-shrink-0 text-[#7a7566]" />
                {profile.phone}
              </div>
            )}
            {profile.contact_email && (
              <div className="flex items-center gap-2">
                <IconMail className="h-4 w-4 flex-shrink-0 text-[#7a7566]" />
                {profile.contact_email}
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-2">
                <IconGlobe className="h-4 w-4 flex-shrink-0 text-[#7a7566]" />
                {profile.website}
              </div>
            )}
          </div>

          {profile.lat != null && profile.lng != null && (
            <MiniMap lat={profile.lat} lng={profile.lng} />
          )}

          <MessageSellerButton
            locale={locale}
            viewerUserId={viewer?.id ?? null}
            sellerUserId={profile.user_id}
          />

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
