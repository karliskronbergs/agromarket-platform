import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "business_name, description, phone, contact_email, website, address, avatar_url, cover_url",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) notFound();

  const { data: profileCategories } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .single();

  const categories = profileCategories
    ? await supabase
        .from("profile_categories")
        .select("categories(name_lv, name_en)")
        .eq("profile_id", profileCategories.id)
    : { data: [] };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      {profile.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.cover_url}
          alt=""
          className="h-48 w-full rounded-xl object-cover"
        />
      )}
      <div className="flex items-center gap-4">
        {profile.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        )}
        <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">
          {profile.business_name}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {(categories.data ?? []).map((pc, i) => {
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

      {profile.description && <p className="text-[#55503f]">{profile.description}</p>}

      <div className="flex flex-col gap-1 text-sm text-[#55503f]">
        {profile.address && <div>{profile.address}</div>}
        {profile.phone && <div>{profile.phone}</div>}
        {profile.contact_email && <div>{profile.contact_email}</div>}
        {profile.website && <div>{profile.website}</div>}
      </div>
    </div>
  );
}
