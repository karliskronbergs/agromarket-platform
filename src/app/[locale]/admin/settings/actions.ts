"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LogoState = { error: string | null };

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export async function updateSiteLogo(
  locale: string,
  _prevState: LogoState,
  formData: FormData,
): Promise<LogoState> {
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image." };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { error: "Image must be under 2MB." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ext = file.name.split(".").pop() || "png";
  const path = `logo/logo.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(path, file, { upsert: true });
  if (uploadError) {
    return { error: uploadError.message };
  }

  const { publicUrl } = supabase.storage.from("site-assets").getPublicUrl(path).data;
  const url = `${publicUrl}?v=${Date.now()}`;

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "logo_url", value: url }, { onConflict: "key" });
  if (error) {
    return { error: error.message };
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "site_logo_updated",
    target_type: "site_settings",
    target_id: null,
  });

  revalidatePath(`/${locale}`, "layout");
  return { error: null };
}

export async function removeSiteLogo(locale: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("site_settings").delete().eq("key", "logo_url");

  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "site_logo_removed",
    target_type: "site_settings",
    target_id: null,
  });

  revalidatePath(`/${locale}`, "layout");
}
