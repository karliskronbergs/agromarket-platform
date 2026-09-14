import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThreadView } from "./thread-view";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Messages");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, participant_one, participant_two")
    .eq("id", id)
    .maybeSingle();

  if (!conversation) notFound();

  const otherId =
    conversation.participant_one === user!.id
      ? conversation.participant_two
      : conversation.participant_one;

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("business_name, slug")
    .eq("user_id", otherId)
    .maybeSingle();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .neq("sender_id", user!.id)
    .is("read_at", null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <Link href="/dashboard/messages" className="text-sm text-[#7a7566] hover:text-[#3f6b3f]">
          &larr; {t("inbox")}
        </Link>
        <h1 className="font-sans text-xl font-semibold text-[#2b2a24]">
          {otherProfile?.business_name ?? t("unknownUser")}
        </h1>
      </div>
      <ThreadView
        conversationId={id}
        currentUserId={user!.id}
        initialMessages={messages ?? []}
        placeholder={t("placeholder")}
        send={t("send")}
      />
    </div>
  );
}
