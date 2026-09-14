"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const LISTING_LIFETIME_DAYS = 21;

export type RejectState = { error: string | null };

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

async function findOrCreateConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIdA: string,
  userIdB: string,
) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_one.eq.${userIdA},participant_two.eq.${userIdB}),and(participant_one.eq.${userIdB},participant_two.eq.${userIdA})`,
    )
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: created } = await supabase
    .from("conversations")
    .insert({ participant_one: userIdA, participant_two: userIdB })
    .select("id")
    .single();

  return created?.id as string | undefined;
}

export async function rejectListing(
  locale: string,
  listingId: string,
  _prevState: RejectState,
  formData: FormData,
): Promise<RejectState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 5) {
    return { error: "Please explain why (at least 5 characters) so the seller knows what to fix." };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("title, profiles(user_id)")
    .eq("id", listingId)
    .maybeSingle();

  const profile = Array.isArray(listing?.profiles) ? listing.profiles[0] : listing?.profiles;

  await supabase.from("listings").update({ status: "removed" }).eq("id", listingId);

  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "listing_rejected",
    target_type: "listing",
    target_id: listingId,
  });

  if (profile?.user_id) {
    const conversationId = await findOrCreateConversation(supabase, user!.id, profile.user_id);
    if (conversationId) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user!.id,
        body: `Your listing "${listing?.title}" was not approved. Reason: ${reason}`,
      });
    }
  }

  revalidatePath(`/${locale}/admin/listings`);
  return { error: null };
}
