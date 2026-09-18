"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function logListingView(listingId: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = headerList.get("user-agent") ?? "unknown";
  const viewerKey = createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");

  const supabase = await createClient();
  await supabase.rpc("log_listing_view", { p_listing_id: listingId, p_viewer_key: viewerKey });
}
