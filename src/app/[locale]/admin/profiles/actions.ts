"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteProfileAsAdmin(locale: string, profileId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("profiles").delete().eq("id", profileId);
  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "profile_deleted",
    target_type: "profile",
    target_id: profileId,
  });

  revalidatePath(`/${locale}/admin/profiles`);
}
