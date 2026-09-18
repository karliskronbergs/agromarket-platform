import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "./delete-button";
import { ReactivateButton } from "./reactivate-button";
import { priceUnitSuffix } from "@/lib/format";

export const dynamic = "force-dynamic";

function isPast(dateString: string) {
  return new Date(dateString).getTime() < Date.now();
}

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
    .select("id, title, listing_type, price, price_unit, price_plus_vat, status, expires_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
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
        {(listings ?? []).map((l) => {
          const isExpired = l.status === "active" && isPast(l.expires_at);
          const statusLabel =
            l.status === "removed"
              ? t("statusRemoved")
              : l.status === "pending"
                ? t("statusPending")
                : isExpired
                  ? t("statusExpired")
                  : t("statusActive");

          return (
            <div
              key={l.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#e7e2d8] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-1.5">
                <div className="font-medium text-[#2b2a24]">{l.title}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      l.listing_type === "sell"
                        ? "bg-[#fbe6da] text-[#d9713a]"
                        : "bg-[#dde8ef] text-[#2f6690]"
                    }`}
                  >
                    {l.listing_type === "sell" ? t("sell") : t("buy")}
                  </span>
                  {l.price != null && (
                    <span className="text-xs text-[#7a7566]">
                      €{l.price}
                      {priceUnitSuffix(l.price_unit)}
                      {l.price_plus_vat ? ` ${t("plusVat")}` : ""}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium ${
                      l.status === "removed"
                        ? "text-red-600"
                        : l.status === "pending"
                          ? "text-[#7a7566]"
                          : isExpired
                            ? "text-[#d9713a]"
                            : "text-[#3f6b3f]"
                    }`}
                  >
                    · {statusLabel}
                  </span>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-4">
                {isExpired && <ReactivateButton locale={locale} listingId={l.id} />}
                <Link
                  href={`/dashboard/listings/${l.id}`}
                  className="text-sm font-medium text-[#3f6b3f]"
                >
                  {t("edit")}
                </Link>
                <DeleteButton locale={locale} listingId={l.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
