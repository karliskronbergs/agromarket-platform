import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-only privileged lookups (e.g. resolving a
// user's login email by id for transactional notifications). Never import
// this from a client component or expose it to the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user.email ?? null;
}

// Real login emails for every account in the admins table, so admin
// notifications land in an inbox someone actually checks instead of a
// hardcoded address. Falls back to ADMIN_NOTIFICATION_EMAIL only if no
// admin email could be resolved (e.g. service role not configured yet).
export async function getAdminEmails(): Promise<string[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data: adminRows } = await admin.from("admins").select("user_id");
  if (!adminRows || adminRows.length === 0) return [];

  const emails = await Promise.all(adminRows.map((row) => getUserEmail(row.user_id)));
  return emails.filter((e): e is string => !!e);
}
