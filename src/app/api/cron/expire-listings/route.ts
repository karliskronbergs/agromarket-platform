import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getUserEmail } from "@/lib/supabase/admin";
import { sendEmail, emailLayout, emailButton } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
  }

  const now = new Date();
  const LISTING_LIFETIME_DAYS = 21;
  const nextExpiry = new Date(now.getTime() + LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000);

  // Auto-renew opted-in listings before the notify query below runs, so a
  // renewed listing's new (future) expires_at excludes it from that query
  // naturally -- no separate "already renewed" bookkeeping needed.
  const { data: renewed } = await supabase
    .from("listings")
    .update({ expires_at: nextExpiry.toISOString() })
    .eq("status", "active")
    .eq("auto_renew", true)
    .lt("expires_at", now.toISOString())
    .select("id");

  const { data: expired } = await supabase
    .from("listings")
    .select("id, title, profiles(user_id)")
    .eq("status", "active")
    .eq("auto_renew", false)
    .lt("expires_at", now.toISOString())
    .is("expiry_notified_at", null);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lauks24.lv";
  let notified = 0;

  for (const listing of expired ?? []) {
    const profile = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
    if (profile?.user_id) {
      const email = await getUserEmail(profile.user_id);
      if (email) {
        await sendEmail({
          to: email,
          subject: `Sludinājumam beidzies termiņš: ${listing.title}`,
          html: emailLayout(
            "lv",
            `<p>Tavam sludinājumam <strong>${listing.title}</strong> ir beidzies termiņš un tas vairs nav redzams publiski.</p>
             ${emailButton(`${siteUrl}/lv/dashboard/listings`, "Aktivizēt no jauna")}`,
          ),
        });
        notified += 1;
      }
    }

    await supabase
      .from("listings")
      .update({ expiry_notified_at: now.toISOString() })
      .eq("id", listing.id);
  }

  return NextResponse.json({ renewed: renewed?.length ?? 0, checked: expired?.length ?? 0, notified });
}
