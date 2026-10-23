import { createBrowserClient } from "@supabase/ssr";

// domain unset (e.g. localhost) -> default host-only cookie, same as before.
// domain set (production, .lauks24.lv) -> cookie is shared with
// izsole.lauks24.lv, so a session started on either app carries over.
const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookieDomain ? { cookieOptions: { domain: cookieDomain } } : undefined,
  );
}
