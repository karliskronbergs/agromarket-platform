import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const tProfile = await getTranslations("Profile");
  const tListing = await getTranslations("Listing");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, slug")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("title")}</h1>
        <p className="text-sm text-[#7a7566]">{t("welcome", { email: user!.email ?? "" })}</p>
      </div>

      {profile ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-[#e7e2d8] bg-white p-6 shadow-sm sm:p-8">
          <div className="font-sans text-lg font-semibold text-[#2b2a24]">
            {profile.business_name}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/profile"
              className="rounded-full border border-[#e7e2d8] px-4 py-2 text-sm font-medium text-[#55503f] hover:border-[#3f6b3f] hover:text-[#3f6b3f]"
            >
              {tProfile("editTitle")}
            </Link>
            <Link
              href="/dashboard/listings"
              className="rounded-full border border-[#e7e2d8] px-4 py-2 text-sm font-medium text-[#55503f] hover:border-[#3f6b3f] hover:text-[#3f6b3f]"
            >
              {tListing("myListings")}
            </Link>
            <Link
              href={`/profiles/${profile.slug}`}
              className="rounded-full bg-[#3f6b3f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2f5233]"
            >
              {tProfile("viewPublic")}
            </Link>
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
