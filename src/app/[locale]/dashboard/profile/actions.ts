"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error: string | null };

const profileSchema = z.object({
  businessName: z.string().min(2, "Business name is required.").max(120),
  description: z.string().max(2000).optional(),
  phone: z.string().max(40).optional(),
  contactEmail: z.string().max(200).optional(),
  website: z.string().max(200).optional(),
  address: z.string().min(3, "Address is required.").max(200),
  categoryIds: z.array(z.string().uuid()).min(1, "Pick at least one category."),
  attributeIds: z.array(z.string().uuid()).optional(),
});

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "profile"
  );
}

async function geocode(address: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=lv&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "agromarket-platform (contact: kronberg.karlis@gmail.com)" },
    });
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

export async function saveProfile(
  locale: string,
  _prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const parsed = profileSchema.safeParse({
    businessName: formData.get("businessName"),
    description: formData.get("description") || undefined,
    phone: formData.get("phone") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
    website: formData.get("website") || undefined,
    address: formData.get("address"),
    categoryIds: formData.getAll("categoryIds").map(String),
    attributeIds: formData.getAll("attributeIds").map(String),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, slug, address, lat, lng")
    .eq("user_id", user.id)
    .maybeSingle();

  let slug = existing?.slug;
  if (!slug) {
    const base = slugify(parsed.data.businessName);
    slug = base;
    let n = 1;
    while (true) {
      const { data: clash } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!clash) break;
      n += 1;
      slug = `${base}-${n}`;
    }
  }

  const addressChanged = !existing || existing.address !== parsed.data.address;
  const geo = addressChanged
    ? await geocode(parsed.data.address)
    : { lat: existing?.lat, lng: existing?.lng };

  const avatarFile = formData.get("avatar") as File | null;
  const coverFile = formData.get("cover") as File | null;
  let avatarUrl: string | undefined;
  let coverUrl: string | undefined;

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });
    if (!upErr) {
      const { publicUrl } = supabase.storage.from("avatars").getPublicUrl(path).data;
      avatarUrl = `${publicUrl}?v=${Date.now()}`;
    }
  }

  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/cover.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("covers")
      .upload(path, coverFile, { upsert: true });
    if (!upErr) {
      const { publicUrl } = supabase.storage.from("covers").getPublicUrl(path).data;
      coverUrl = `${publicUrl}?v=${Date.now()}`;
    }
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(
      {
        ...(existing?.id ? { id: existing.id } : {}),
        user_id: user.id,
        business_name: parsed.data.businessName,
        slug,
        description: parsed.data.description ?? null,
        phone: parsed.data.phone ?? null,
        contact_email: parsed.data.contactEmail ?? null,
        website: parsed.data.website ?? null,
        address: parsed.data.address,
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        ...(coverUrl ? { cover_url: coverUrl } : {}),
      },
      { onConflict: "user_id" },
    )
    .select("id, slug")
    .single();

  if (error || !profile) {
    return { error: error?.message ?? "Could not save profile." };
  }

  await supabase.from("profile_categories").delete().eq("profile_id", profile.id);
  await supabase.from("profile_categories").insert(
    parsed.data.categoryIds.map((categoryId) => ({
      profile_id: profile.id,
      category_id: categoryId,
    })),
  );

  await supabase.from("profile_attribute_links").delete().eq("profile_id", profile.id);
  if (parsed.data.attributeIds && parsed.data.attributeIds.length > 0) {
    await supabase.from("profile_attribute_links").insert(
      parsed.data.attributeIds.map((attributeId) => ({
        profile_id: profile.id,
        attribute_id: attributeId,
      })),
    );
  }

  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/profiles/${profile.slug}`);
}

export async function requestVerification(locale: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  await supabase
    .from("profiles")
    .update({ verification_requested_at: new Date().toISOString() })
    .eq("user_id", user.id);

  revalidatePath(`/${locale}/dashboard`);
}

export async function deleteProfile(locale: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  await supabase.from("profiles").delete().eq("user_id", user.id);

  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard`);
}
