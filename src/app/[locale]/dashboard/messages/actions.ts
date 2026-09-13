"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startConversation(
  locale: string,
  otherUserId: string,
  listingId: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);
  if (user.id === otherUserId) redirect(`/${locale}/dashboard/messages`);

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`,
    )
    .maybeSingle();

  let conversationId = existing?.id as string | undefined;

  if (!conversationId) {
    const { data: created } = await supabase
      .from("conversations")
      .insert({
        participant_one: user.id,
        participant_two: otherUserId,
        listing_id: listingId,
      })
      .select("id")
      .single();
    conversationId = created?.id;
  }

  if (!conversationId) redirect(`/${locale}/dashboard/messages`);
  redirect(`/${locale}/dashboard/messages/${conversationId}`);
}
