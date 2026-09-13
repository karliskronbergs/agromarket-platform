import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function ListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Listing");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!profile) redirect(`/${locale}/dashboard/profile`);

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, listing_type, price, status")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-semibold text-[#2b2a24]">{t("myListings")}</h1>
        <Link
          href="/dashboard/listings/new"
          className="rounded-full bg-[#3f6b3f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2f5233]"
        >
          {t("addListing")}
        </Link>
      </div>

      {(!listings || listings.length === 0) && (
        <p className="text-sm text-[#55503f]">{t("noListings")}</p>
      )}

      <div className="flex flex-col gap-3">
        {(listings ?? []).map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between rounded-xl border border-[#e7e2d8] bg-white p-4"
          >
            <div>
              <div className="font-semibold text-[#2b2a24]">{l.title}</div>
              <div className="text-xs text-[#7a7566]">
                {l.listing_type === "sell" ? t("sell") : t("buy")}
                {l.price ? ` · €${l.price}` : ""} · {l.status}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/listings/${l.id}`}
                className="text-sm font-medium text-[#3f6b3f]"
              >
                {t("edit")}
              </Link>
              <DeleteButton locale={locale} listingId={l.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
