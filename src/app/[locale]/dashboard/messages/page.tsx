import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const t = await getTranslations("Messages");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, participant_one, participant_two, created_at")
    .or(`participant_one.eq.${user!.id},participant_two.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  const otherUserIds = (conversations ?? []).map((c) =>
    c.participant_one === user!.id ? c.participant_two : c.participant_one,
  );

  const { data: profiles } = otherUserIds.length
    ? await supabase
        .from("profiles")
        .select("user_id, business_name, slug, avatar_url")
        .in("user_id", otherUserIds)
    : { data: [] };

  const conversationIds = (conversations ?? []).map((c) => c.id);
  const { data: lastMessages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id, body, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const lastMessageByConversation = new Map<string, { body: string }>();
  for (const m of lastMessages ?? []) {
    if (!lastMessageByConversation.has(m.conversation_id)) {
      lastMessageByConversation.set(m.conversation_id, { body: m.body });
    }
  }

  const profileByUserId = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("inbox")}</h1>

      {(!conversations || conversations.length === 0) && (
        <p className="text-sm text-[#55503f]">{t("noConversations")}</p>
      )}

      <div className="flex flex-col gap-3">
        {(conversations ?? []).map((c) => {
          const otherId = c.participant_one === user!.id ? c.participant_two : c.participant_one;
          const other = profileByUserId.get(otherId);
          const last = lastMessageByConversation.get(c.id);
          return (
            <Link
              key={c.id}
              href={`/dashboard/messages/${c.id}`}
              className="flex items-center gap-3 rounded-2xl border border-[#e7e2d8] bg-white p-4 shadow-sm transition hover:border-[#3f6b3f]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3f6b3f] text-sm font-semibold text-white">
                {(other?.business_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[#2b2a24]">
                  {other?.business_name ?? t("unknownUser")}
                </div>
                {last && (
                  <div className="truncate text-sm text-[#7a7566]">{last.body}</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
