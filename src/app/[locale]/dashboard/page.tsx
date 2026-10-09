import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { IconCheck } from "@/components/icons";
import { priceUnitSuffix } from "@/lib/format";
import { requestVerification } from "./profile/actions";

const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 8px, #e4e7e1 8px, #e4e7e1 16px)",
};

function isPast(dateString: string) {
  return new Date(dateString).getTime() < Date.now();
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Dashboard");
  const tProfile = await getTranslations("Profile");
  const tListing = await getTranslations("Listing");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, business_name, slug, address, avatar_url, verified, verification_requested_at, view_count, listing_view_count",
    )
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#c9d0d5] bg-white p-8 text-center">
        <p className="text-[15px] text-[#5d6670]">{tProfile("noProfileYet")}</p>
        <Link
          href="/dashboard/profile"
          className="mx-auto w-fit rounded-[10px] bg-[#3f6e4a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#355d3e]"
        >
          {tProfile("createCta")}
        </Link>
      </div>
    );
  }

  const [{ data: primaryCategory }, { data: listings }] = await Promise.all([
    supabase
      .from("profile_categories")
      .select("categories(name_lv, name_en)")
      .eq("profile_id", profile.id)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("listings")
      .select("id, title, price, price_unit, status, expires_at, listing_images(url, sort_order)")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const catRaw = primaryCategory?.categories as unknown as
    | { name_lv: string; name_en: string }
    | { name_lv: string; name_en: string }[]
    | null
    | undefined;
  const cat = Array.isArray(catRaw) ? (catRaw[0] ?? null) : (catRaw ?? null);
  const specLabel = cat ? (locale === "lv" ? cat.name_lv : cat.name_en) : null;

  const allListings = listings ?? [];
  const activeCount = allListings.filter((l) => l.status === "active" && !isPast(l.expires_at)).length;
  const previewRows = allListings.slice(0, 3);
  const totalCount = allListings.length;

  const boundRequestVerification = requestVerification.bind(null, locale);
  const initials = profile.business_name.slice(0, 1).toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 mb-1 text-2xl font-semibold tracking-[-0.01em] text-[#1d2329] sm:text-[30px]">
            {t("greeting")}
          </h1>
          <div className="text-[15px] text-[#5d6670]">{user!.email}</div>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="rounded-[10px] bg-[#3f6e4a] px-[18px] py-3 text-[15px] font-semibold text-white transition hover:bg-[#355d3e]"
        >
          {t("addListing")}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e3e6e8] bg-white p-5">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-[#e4eaf0]">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-[#3b5166]">
              {initials}
            </div>
          )}
        </div>
        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[19px] font-semibold text-[#1d2329]">{profile.business_name}</span>
            {profile.verified && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#eef3ee] px-2.5 py-1 text-xs font-medium text-[#2f5538]">
                <IconCheck className="h-3.5 w-3.5 flex-shrink-0 text-[#3f6e4a]" />
                {tProfile("verifiedShort")}
              </span>
            )}
          </div>
          <div className="text-sm text-[#5d6670]">{[specLabel, profile.address].filter(Boolean).join(" · ")}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/profile"
            className="rounded-[10px] border border-[#d9dee2] bg-white px-3.5 py-2.5 text-sm font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
          >
            {t("editProfileCta")}
          </Link>
          <Link
            href={`/profiles/${profile.slug}`}
            className="rounded-[10px] border border-[#d9dee2] bg-white px-3.5 py-2.5 text-sm font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
          >
            {t("viewPublicProfileCta")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-[14px] border border-[#e3e6e8] bg-white p-[18px]">
          <span className="text-[13px] text-[#5d6670]">{t("profileViews")}</span>
          <span className="text-[28px] font-semibold tracking-[-0.01em] text-[#1d2329]">
            {(profile.view_count ?? 0) + (profile.listing_view_count ?? 0)}
          </span>
        </div>
        <Link
          href="/dashboard/listings"
          className="flex flex-col gap-1 rounded-[14px] border border-[#e3e6e8] bg-white p-[18px] transition hover:border-[#3f6e4a]"
        >
          <span className="text-[13px] text-[#5d6670]">{t("activeListings")}</span>
          <span className="text-[28px] font-semibold tracking-[-0.01em] text-[#1d2329]">{activeCount}</span>
        </Link>
      </div>

      {!profile.verified && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-[#eef3ee] p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3f6e4a] font-semibold text-white">
            ✓
          </div>
          <div className="min-w-[220px] flex-1">
            <div className="mb-0.5 text-base font-semibold text-[#1d2329]">
              {profile.verification_requested_at ? t("verifyCardTitlePending") : t("verifyCardTitle")}
            </div>
            <div className="text-sm leading-[1.5] text-[#2f5538]">
              {profile.verification_requested_at ? t("verifyCardTextPending") : t("verifyCardText")}
            </div>
          </div>
          {!profile.verification_requested_at && (
            <form action={boundRequestVerification}>
              <button
                type="submit"
                className="rounded-[10px] bg-[#3f6e4a] px-4 py-[11px] text-sm font-semibold text-white transition hover:bg-[#355d3e]"
              >
                {t("requestVerification")}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="mt-2 flex items-baseline justify-between">
        <h2 className="m-0 text-xl font-semibold text-[#1d2329]">{t("myListingsTitle")}</h2>
        {totalCount > 0 && (
          <Link href="/dashboard/listings" className="text-sm font-medium text-[#3f6e4a]">
            {t("viewAllListings", { count: totalCount })}
          </Link>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-[#c9d0d5] bg-white px-6 py-10 text-center">
          <div className="text-lg font-semibold text-[#1d2329]">{t("noListingsTitle")}</div>
          <div className="max-w-[420px] text-[15px] leading-[1.5] text-[#5d6670]">{t("noListingsBody")}</div>
          <Link
            href="/dashboard/listings/new"
            className="mt-2 rounded-[10px] bg-[#3f6e4a] px-5 py-[13px] text-[15px] font-semibold text-white transition hover:bg-[#355d3e]"
          >
            {t("addFirstListing")}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white">
          {previewRows.map((l) => {
            const images = (l.listing_images ?? []) as { url: string; sort_order: number }[];
            const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
            const expired = l.status === "active" && isPast(l.expires_at);
            const active = l.status === "active" && !expired;
            return (
              <div
                key={l.id}
                className="flex items-center gap-3.5 border-b border-[#eef0f1] px-4 py-3.5 last:border-b-0"
              >
                <div style={!firstImage ? STRIPE_BG : undefined} className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[10px]">
                  {firstImage && <Image src={firstImage.url} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-medium leading-[1.3] text-[#1d2329]">{l.title}</div>
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#5d6670]">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={
                        active
                          ? { background: "#eef3ee", color: "#2f5538" }
                          : { background: "#eceeeb", color: "#5d6670" }
                      }
                    >
                      {active ? tListing("statusActive") : t("statusHiddenDashboard")}
                    </span>
                    {l.price != null && (
                      <span>
                        €{l.price}
                        {priceUnitSuffix(l.price_unit, locale)}
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/dashboard/listings/${l.id}`} className="flex-shrink-0 text-sm font-medium text-[#3f6e4a]">
                  {t("editListing")}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
