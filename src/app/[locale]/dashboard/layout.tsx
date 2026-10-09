import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Dashboard");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, business_name, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  const { count: listingsCount } = profile
    ? await supabase.from("listings").select("id", { count: "exact", head: true }).eq("profile_id", profile.id)
    : { count: 0 };

  const nav = [
    { id: "overview" as const, label: t("navOverview"), href: "/dashboard" },
    { id: "listings" as const, label: t("navListings"), href: "/dashboard/listings" },
    { id: "profile" as const, label: t("navProfile"), href: "/dashboard/profile" },
    { id: "account" as const, label: t("navAccount"), href: "/dashboard/account" },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#f6f7f5]">
      <DashboardShell
        locale={locale}
        name={profile?.business_name ?? user.email ?? ""}
        email={user.email ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
        listingsCount={listingsCount ?? 0}
        signOutLabel={t("signOut")}
        nav={nav}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
