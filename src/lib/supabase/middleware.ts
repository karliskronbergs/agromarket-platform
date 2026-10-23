import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// See src/lib/supabase/client.ts for why this is conditional.
const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: cookieDomain ? { domain: cookieDomain } : undefined,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the auth token if needed so Server Components see a valid session.
  await supabase.auth.getUser();

  return response;
}
