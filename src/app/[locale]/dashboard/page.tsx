import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  IconCheck,
  IconShield,
  IconPin,
  IconEye,
  IconTag,
  IconEdit,
  IconExternalLink,
} from "@/components/icons";
import { AttributeBadges, type AttributeInfo } from "@/components/attribute-badges";
import { getAttributesByProfileIds } from "@/lib/attributes";
import { requestVerification } from "./profile/actions";
import { DeleteProfileButton } from "./profile/delete-profile-button";

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
      "id, business_name, slug, address, avatar_url, verified, admin_badge, verification_requested_at, view_count, listing_view_count",
    )
    .eq("user_id", user!.id)
    .maybeSingle();

  let activeListingsCount = 0;
  let attributes: AttributeInfo[] = [];
  if (profile) {
    const [{ count }, attributesByProfile] = await Promise.all([
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .eq("status", "active"),
      getAttributesByProfileIds(supabase, [profile.id]),
    ]);
    activeListingsCount = count ?? 0;
    attributes = attributesByProfile.get(profile.id) ?? [];
  }

  const boundRequestVerification = requestVerification.bind(null, locale);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("title")}</h1>
        <p className="text-sm text-[#7a7566]">{t("welcome", { email: user!.email ?? "" })}</p>
      </div>

      {profile ? (
        <div className="flex flex-col gap-6 rounded-2xl border border-[#e7e2d8] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-[#3f6b3f] shadow-sm">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-sans text-2xl font-bold text-white">
                  {profile.business_name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate font-sans text-lg font-semibold text-[#2b2a24]">
                  {profile.business_name}
                </h2>
                {profile.admin_badge && (
                  <IconShield className="h-4 w-4 flex-shrink-0 text-red-600" />
                )}
                {profile.verified && (
                  <IconCheck className="h-4 w-4 flex-shrink-0 text-[#2563eb]" />
                )}
              </div>
              {profile.address && (
                <div className="mt-0.5 flex items-center gap-1 text-sm text-[#7a7566]">
                  <IconPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{profile.address}</span>
                </div>
              )}
            </div>
          </div>

          {attributes.length > 0 && <AttributeBadges attributes={attributes} locale={locale} />}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-[#faf8f3] px-4 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e7efe1] text-[#3f6b3f]">
                <IconEye className="h-4 w-4" />
              </div>
              <div>
                <div className="font-sans text-lg font-semibold leading-none text-[#2b2a24]">
                  {(profile.view_count ?? 0) + (profile.listing_view_count ?? 0)}
                </div>
                <div className="text-xs text-[#7a7566]">{t("views")}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#faf8f3] px-4 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#fbe6da] text-[#d9713a]">
                <IconTag className="h-4 w-4" />
              </div>
              <div>
                <div className="font-sans text-lg font-semibold leading-none text-[#2b2a24]">
                  {activeListingsCount}
                </div>
                <div className="text-xs text-[#7a7566]">{tListing("activeListings")}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 rounded-full border border-[#e7e2d8] px-4 py-2 text-sm font-medium text-[#55503f] transition hover:border-[#3f6b3f] hover:text-[#3f6b3f]"
            >
              <IconEdit className="h-4 w-4" />
              {tProfile("editTitle")}
            </Link>
            <Link
              href="/dashboard/listings"
              className="flex items-center gap-1.5 rounded-full border border-[#e7e2d8] px-4 py-2 text-sm font-medium text-[#55503f] transition hover:border-[#3f6b3f] hover:text-[#3f6b3f]"
            >
              <IconTag className="h-4 w-4" />
              {tListing("myListings")}
            </Link>
            <Link
              href={`/profiles/${profile.slug}`}
              className="flex items-center gap-1.5 rounded-full bg-[#3f6b3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2f5233]"
            >
              <IconExternalLink className="h-4 w-4" />
              {tProfile("viewPublic")}
            </Link>
          </div>

          <div className="border-t border-[#e7e2d8] pt-5">
            {profile.verified ? (
              <div className="flex w-fit items-center gap-1.5 rounded-full bg-[#dbeafe] px-3 py-1.5 text-sm font-semibold text-[#2563eb]">
                <IconCheck className="h-4 w-4 flex-shrink-0" />
                {tProfile("verifiedBadge")}
              </div>
            ) : profile.verification_requested_at ? (
              <div className="flex items-center gap-2 text-sm text-[#7a7566]">
                <IconShield className="h-4 w-4 flex-shrink-0 text-[#7a7566]" />
                {tProfile("verificationPending")}
              </div>
            ) : (
              <form action={boundRequestVerification}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full border border-[#3f6b3f] px-4 py-2 text-sm font-semibold text-[#3f6b3f] transition hover:bg-[#e7efe1]"
                >
                  <IconShield className="h-4 w-4" />
                  {tProfile("requestVerification")}
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-[#e7e2d8] pt-5">
            <DeleteProfileButton locale={locale} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#e7e2d8] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-[#55503f]">{tProfile("noProfileYet")}</p>
          <Link
            href="/dashboard/profile"
            className="w-fit rounded-full bg-[#3f6b3f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2f5233]"
          >
            {tProfile("createCta")}
          </Link>
        </div>
      )}
    </div>
  );
}
