"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const LISTING_LIFETIME_DAYS = 21;

export async function approveListing(locale: string, listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const expiresAt = new Date(Date.now() + LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
  await supabase
    .from("listings")
    .update({ status: "active", expires_at: expiresAt.toISOString() })
    .eq("id", listingId);

  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "listing_approved",
    target_type: "listing",
    target_id: listingId,
  });

  revalidatePath(`/${locale}/admin/listings`);
}

export async function rejectListing(locale: string, listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("listings").update({ status: "removed" }).eq("id", listingId);

  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "listing_rejected",
    target_type: "listing",
    target_id: listingId,
  });

  revalidatePath(`/${locale}/admin/listings`);
}
