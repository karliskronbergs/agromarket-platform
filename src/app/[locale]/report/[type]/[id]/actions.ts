"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ReportState = { error: string | null; success?: boolean };

const schema = z.object({ reason: z.string().min(5).max(1000) });

export async function fileReport(
  locale: string,
  targetType: "profile" | "listing",
  targetId: string,
  _prevState: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const parsed = schema.safeParse({ reason: formData.get("reason") });
  if (!parsed.success) {
    return { error: "Please describe the issue (at least 5 characters)." };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason: parsed.data.reason,
  });

  if (error) return { error: error.message };
  return { error: null, success: true };
}
