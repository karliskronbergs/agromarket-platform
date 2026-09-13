"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export function ThreadView({
  conversationId,
  currentUserId,
  initialMessages,
  placeholder,
  send,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  placeholder: string;
  send: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || isSending) return;

    setIsSending(true);
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: currentUserId, body });
    setIsSending(false);
    if (!error) setDraft("");
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-[#e7e2d8] bg-[#faf8f3] p-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                mine
                  ? "self-end bg-[#3f6b3f] text-white"
                  : "self-start bg-white text-[#2b2a24] border border-[#e7e2d8]"
              }`}
            >
              {m.body}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-full border border-[#e7e2d8] px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          className="rounded-full bg-[#3f6b3f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {send}
        </button>
      </form>
    </div>
  );
}
