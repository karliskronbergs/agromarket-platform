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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("title")}</h1>
      <p className="text-sm text-[#55503f]">{t("welcome", { email: user!.email ?? "" })}</p>

      {profile ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[#e7e2d8] bg-white p-6">
          <div className="text-lg font-semibold text-[#2b2a24]">{profile.business_name}</div>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard/profile" className="font-medium text-[#3f6b3f]">
              {tProfile("editTitle")}
            </Link>
            <Link href="/dashboard/listings" className="font-medium text-[#3f6b3f]">
              {tListing("myListings")}
            </Link>
            <Link
              href={`/profiles/${profile.slug}`}
              className="font-medium text-[#3f6b3f]"
            >
              {tProfile("viewPublic")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[#e7e2d8] bg-white p-6">
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
