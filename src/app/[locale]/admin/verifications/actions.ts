"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveVerification(locale: string, profileId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("profiles").update({ verified: true }).eq("id", profileId);
  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "profile_verified",
    target_type: "profile",
    target_id: profileId,
  });

  revalidatePath(`/${locale}/admin/verifications`);
}

export async function dismissVerification(locale: string, profileId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("profiles")
    .update({ verification_requested_at: null })
    .eq("id", profileId);
  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "verification_dismissed",
    target_type: "profile",
    target_id: profileId,
  });

  revalidatePath(`/${locale}/admin/verifications`);
}
