"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function resolveReport(locale: string, reportId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "report_resolved",
    target_type: "report",
    target_id: reportId,
  });

  revalidatePath(`/${locale}/admin/reports`);
}

export async function dismissReport(locale: string, reportId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("reports").update({ status: "dismissed" }).eq("id", reportId);
  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "report_dismissed",
    target_type: "report",
    target_id: reportId,
  });

  revalidatePath(`/${locale}/admin/reports`);
}

export async function removeReportedContent(
  locale: string,
  reportId: string,
  targetType: "profile" | "listing",
  targetId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (targetType === "profile") {
    await supabase.from("profiles").update({ status: "suspended" }).eq("id", targetId);
  } else {
    await supabase.from("listings").update({ status: "removed" }).eq("id", targetId);
  }

  await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: `${targetType}_removed`,
    target_type: targetType,
    target_id: targetId,
  });

  revalidatePath(`/${locale}/admin/reports`);
}
