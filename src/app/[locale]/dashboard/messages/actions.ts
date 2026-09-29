"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, emailLayout, emailButton } from "@/lib/email";
import { getUserEmail } from "@/lib/supabase/admin";

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

export async function markConversationRead(locale: string, conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  // The unread badge lives in the root layout's SiteHeader, shared across
  // every route -- revalidating it here is what actually clears the stale
  // client-side router cache for it on the next navigation.
  revalidatePath(`/${locale}`, "layout");
}

export async function notifyNewMessage(locale: string, messageId: string) {
  const supabase = await createClient();

  const { data: message } = await supabase
    .from("messages")
    .select("sender_id, conversation_id, conversations(participant_one, participant_two)")
    .eq("id", messageId)
    .maybeSingle();
  if (!message) return;

  const conversation = Array.isArray(message.conversations)
    ? message.conversations[0]
    : message.conversations;
  if (!conversation) return;

  const recipientId =
    conversation.participant_one === message.sender_id
      ? conversation.participant_two
      : conversation.participant_one;

  const [{ data: senderProfile }, email] = await Promise.all([
    supabase
      .from("profiles")
      .select("business_name")
      .eq("user_id", message.sender_id)
      .maybeSingle(),
    getUserEmail(recipientId),
  ]);
  if (!email) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lauks24.lv";
  await sendEmail({
    to: email,
    subject: `Jauna ziņa no ${senderProfile?.business_name ?? "lietotāja"}`,
    html: emailLayout(
      locale,
      `<p>Tev ir jauna ziņa no <strong>${senderProfile?.business_name ?? "lietotāja"}</strong>.</p>
       ${emailButton(`${siteUrl}/${locale}/dashboard/messages/${message.conversation_id}`, "Skatīt ziņu")}`,
    ),
  });
}
