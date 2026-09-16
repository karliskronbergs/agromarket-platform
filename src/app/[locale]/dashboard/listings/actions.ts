"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ListingState = { error: string | null };

const listingSchema = z.object({
  listingType: z.enum(["sell", "buy"]),
  title: z.string().min(2, "Title is required.").max(160),
  description: z.string().max(4000).optional(),
  categoryId: z.string().uuid("Pick a category."),
  price: z.string().optional(),
});

async function getOwnProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, lat, lng")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function saveListing(
  locale: string,
  listingId: string | null,
  _prevState: ListingState,
  formData: FormData,
): Promise<ListingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const profile = await getOwnProfile(user.id);
  if (!profile) redirect(`/${locale}/dashboard/profile`);

  const parsed = listingSchema.safeParse({
    listingType: formData.get("listingType"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    categoryId: formData.get("categoryId"),
    price: formData.get("price") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const price = parsed.data.price ? Number(parsed.data.price) : null;
  if (parsed.data.price && Number.isNaN(price)) {
    return { error: "Price must be a number." };
  }

  const { count: childCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", parsed.data.categoryId);
  if (childCount && childCount > 0) {
    return { error: "Pick a specific subcategory, not a main category." };
  }

  const payload = {
    profile_id: profile.id,
    listing_type: parsed.data.listingType,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    category_id: parsed.data.categoryId,
    price,
    price_plus_vat: formData.get("plusVat") === "on",
    lat: profile.lat,
    lng: profile.lng,
  };

  const { data: listing, error } = listingId
    ? await supabase
        .from("listings")
        .update(payload)
        .eq("id", listingId)
        .select("id")
        .single()
    : await supabase
        .from("listings")
        .insert({ ...payload, status: "pending", is_paid: false })
        .select("id")
        .single();

  if (error || !listing) {
    return { error: error?.message ?? "Could not save listing." };
  }

  const removeIds = formData.getAll("removeImageIds").map(String);
  if (removeIds.length > 0) {
    await supabase.from("listing_images").delete().in("id", removeIds);
  }

  const images = formData.getAll("images") as File[];
  const newImages = images.filter((f) => f && f.size > 0);
  if (newImages.length > 0) {
    const { data: existingImages } = await supabase
      .from("listing_images")
      .select("sort_order")
      .eq("listing_id", listing.id)
      .order("sort_order", { ascending: false })
      .limit(1);
    let nextOrder = (existingImages?.[0]?.sort_order ?? -1) + 1;

    for (const file of newImages) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${listing.id}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("listing-images")
        .upload(path, file);
      if (!upErr) {
        const url = supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl;
        await supabase
          .from("listing_images")
          .insert({ listing_id: listing.id, url, sort_order: nextOrder });
        nextOrder += 1;
      }
    }
  }

  revalidatePath(`/${locale}/dashboard/listings`);
  revalidatePath(`/${locale}/map`);

  if (!listingId) {
    // Brand-new listings start out pending admin approval, so the public
    // page would 404 immediately -- send the seller to their listings
    // list instead, where the pending status is visible.
    redirect(`/${locale}/dashboard/listings`);
  }
  redirect(`/${locale}/listings/${listing.id}`);
}

export async function deleteListing(locale: string, listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  await supabase.from("listings").delete().eq("id", listingId);

  revalidatePath(`/${locale}/dashboard/listings`);
  redirect(`/${locale}/dashboard/listings`);
}

const LISTING_LIFETIME_DAYS = 21;

export async function reactivateListing(locale: string, listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const expiresAt = new Date(Date.now() + LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
  await supabase
    .from("listings")
    .update({ expires_at: expiresAt.toISOString() })
    .eq("id", listingId);

  revalidatePath(`/${locale}/dashboard/listings`);
}
