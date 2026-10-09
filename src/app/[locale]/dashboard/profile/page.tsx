import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Profile");
  const td = await getTranslations("Dashboard");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: categories }, { data: attributes }, { data: profile }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name_lv, name_en, parent_id")
      .order("sort_order")
      .order("name_lv"),
    supabase.from("attributes").select("id, icon, name_lv, name_en").order("sort_order"),
    supabase
      .from("profiles")
      .select(
        "id, business_name, description, phone, contact_email, website, address, avatar_url, cover_url, lat, lng, slug",
      )
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  let selectedCategoryIds: string[] = [];
  let selectedAttributeIds: string[] = [];
  if (profile) {
    const [{ data: profileCategories }, { data: profileAttributes }] = await Promise.all([
      supabase.from("profile_categories").select("category_id").eq("profile_id", profile.id),
      supabase.from("profile_attribute_links").select("attribute_id").eq("profile_id", profile.id),
    ]);
    selectedCategoryIds = (profileCategories ?? []).map((pc) => pc.category_id);
    selectedAttributeIds = (profileAttributes ?? []).map((pa) => pa.attribute_id);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 mb-1 text-2xl font-semibold tracking-[-0.01em] text-[#1d2329] sm:text-[30px]">
            {profile ? t("editTitle") : t("createTitle")}
          </h1>
          {profile && <div className="text-[15px] leading-[1.45] text-[#5d6670]">{t("addressHint")}</div>}
        </div>
        {profile && (
          <Link href={`/profiles/${profile.slug}`} className="text-sm font-medium text-[#3f6e4a]">
            {td("viewPublicProfileCta")}
          </Link>
        )}
      </div>
      <div className="mt-2.5">
        <ProfileForm
          locale={locale}
          categories={categories ?? []}
          selectedCategoryIds={selectedCategoryIds}
          attributes={attributes ?? []}
          selectedAttributeIds={selectedAttributeIds}
          lat={profile?.lat ?? null}
          lng={profile?.lng ?? null}
          initial={
            profile
              ? {
                  businessName: profile.business_name ?? "",
                  description: profile.description ?? "",
                  phone: profile.phone ?? "",
                  contactEmail: profile.contact_email ?? "",
                  website: profile.website ?? "",
                  address: profile.address ?? "",
                  avatarUrl: profile.avatar_url ?? "",
                  coverUrl: profile.cover_url ?? "",
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
