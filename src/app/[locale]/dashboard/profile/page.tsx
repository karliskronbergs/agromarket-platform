import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Profile");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: categories }, { data: profile }] = await Promise.all([
    supabase.from("categories").select("id, name_lv, name_en, parent_id").order("name_lv"),
    supabase
      .from("profiles")
      .select(
        "id, business_name, description, phone, contact_email, website, address, avatar_url, cover_url",
      )
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  let selectedCategoryIds: string[] = [];
  if (profile) {
    const { data: profileCategories } = await supabase
      .from("profile_categories")
      .select("category_id")
      .eq("profile_id", profile.id);
    selectedCategoryIds = (profileCategories ?? []).map((pc) => pc.category_id);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">
        {profile ? t("editTitle") : t("createTitle")}
      </h1>
      <div className="rounded-2xl border border-[#e7e2d8] bg-white p-6 shadow-sm sm:p-8">
        <ProfileForm
          locale={locale}
          categories={categories ?? []}
          selectedCategoryIds={selectedCategoryIds}
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
