import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { IconShield, IconCheck } from "@/components/icons";
import { startConversation } from "./actions";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Messages");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("admin_badge", true)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  const adminUserId = adminProfile?.user_id;
  const showAdminContact = adminUserId && adminUserId !== user!.id;

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, participant_one, participant_two, created_at")
    .or(`participant_one.eq.${user!.id},participant_two.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  const otherConversations = (conversations ?? []).filter((c) => {
    const otherId = c.participant_one === user!.id ? c.participant_two : c.participant_one;
    return otherId !== adminUserId;
  });

  const otherUserIds = otherConversations.map((c) =>
    c.participant_one === user!.id ? c.participant_two : c.participant_one,
  );

  const { data: profiles } = otherUserIds.length
    ? await supabase
        .from("profiles")
        .select("user_id, business_name, slug, avatar_url, verified")
        .in("user_id", otherUserIds)
    : { data: [] };

  const conversationIds = otherConversations.map((c) => c.id);
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

  const { data: unreadRows } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .neq("sender_id", user!.id)
        .is("read_at", null)
    : { data: [] };
  const unreadConversationIds = new Set((unreadRows ?? []).map((r) => r.conversation_id));

  const profileByUserId = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  const boundStartAdminConversation = showAdminContact
    ? startConversation.bind(null, locale, adminUserId!, null)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("inbox")}</h1>

      {boundStartAdminConversation && (
        <>
          <form action={boundStartAdminConversation}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl border border-[#d9713a]/40 bg-[#fdf3ec] p-4 text-left shadow-sm transition hover:border-[#d9713a]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#d9713a] text-white">
                <IconShield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[#2b2a24]">{t("adminName")}</div>
                <div className="truncate text-sm text-[#8a4a26]">{t("adminPrompt")}</div>
              </div>
            </button>
          </form>
          <div className="-mt-2 h-px bg-[#e7e2d8]" />
        </>
      )}

      {otherConversations.length === 0 && !showAdminContact && (
        <p className="text-sm text-[#55503f]">{t("noConversations")}</p>
      )}

      <div className="flex flex-col gap-3">
        {otherConversations.map((c) => {
          const otherId = c.participant_one === user!.id ? c.participant_two : c.participant_one;
          const other = profileByUserId.get(otherId);
          const last = lastMessageByConversation.get(c.id);
          const isUnread = unreadConversationIds.has(c.id);
          return (
            <Link
              key={c.id}
              href={`/dashboard/messages/${c.id}`}
              className={`flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:border-[#3f6b3f] ${
                isUnread ? "border-[#3f6b3f]" : "border-[#e7e2d8]"
              }`}
            >
              <div className="relative h-10 w-10 flex-shrink-0">
                <div
                  className={`h-full w-full overflow-hidden rounded-full ${
                    other?.avatar_url ? "bg-white" : "bg-[#3f6b3f]"
                  }`}
                >
                  {other?.avatar_url ? (
                    <Image src={other.avatar_url} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                      {(other?.business_name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                {other?.verified && (
                  <IconCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full text-[#2563eb] ring-2 ring-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-[#2b2a24] ${isUnread ? "font-semibold" : "font-medium"}`}
                >
                  {other?.business_name ?? t("unknownUser")}
                </div>
                {last && (
                  <div
                    className={`truncate text-sm ${isUnread ? "font-medium text-[#2b2a24]" : "text-[#7a7566]"}`}
                  >
                    {last.body}
                  </div>
                )}
              </div>
              {isUnread && (
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#3f6b3f]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
