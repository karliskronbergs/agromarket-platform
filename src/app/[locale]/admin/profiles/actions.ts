"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setProfileStatus(
  locale: string,
  profileId: string,
  status: "active" | "suspended",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("profiles").update({ status }).eq("id", profileId);
  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: status === "suspended" ? "profile_suspended" : "profile_reactivated",
    target_type: "profile",
    target_id: profileId,
  });

  revalidatePath(`/${locale}/admin/profiles`);
}
