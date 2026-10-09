import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "./delete-button";
import { ReactivateButton } from "./reactivate-button";
import { HideButton } from "./hide-button";
import { DashboardToast } from "@/components/dashboard-toast";
import { priceUnitSuffix, formatRelativeDays } from "@/lib/format";

export const dynamic = "force-dynamic";

const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 8px, #e4e7e1 8px, #e4e7e1 16px)",
};

function isPast(dateString: string) {
  return new Date(dateString).getTime() < Date.now();
}

type Filter = "all" | "active" | "hidden";

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { locale } = await params;
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = rawFilter === "active" || rawFilter === "hidden" ? rawFilter : "all";
  const t = await getTranslations("Dashboard");
  const tListing = await getTranslations("Listing");
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
    .select(
      "id, title, listing_type, price, price_unit, price_plus_vat, status, expires_at, created_at, categories(name_lv, name_en), listing_images(url, sort_order)",
    )
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  const all = listings ?? [];
  const decorated = all.map((l) => {
    const expired = l.status === "active" && isPast(l.expires_at);
    const active = l.status === "active" && !expired;
    return { ...l, expired, active };
  });

  const filtered = decorated.filter((l) => {
    if (filter === "active") return l.active;
    if (filter === "hidden") return l.expired;
    return true;
  });

  const filterTabs: { id: Filter; label: string }[] = [
    { id: "all", label: t("filterAll") },
    { id: "active", label: t("filterActive") },
    { id: "hidden", label: t("filterHidden") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DashboardToast
        messages={{
          listingHidden: t("toastListingHidden"),
          listingShown: t("toastListingShown"),
          listingDeleted: t("toastListingDeleted"),
          listingSaved: t("toastListingSaved"),
          listingPublished: t("toastListingPublished"),
        }}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em] text-[#1d2329] sm:text-[30px]">
          {t("myListingsTitle")}
        </h1>
        <Link
          href="/dashboard/listings/new"
          className="rounded-[10px] bg-[#3f6e4a] px-[18px] py-3 text-[15px] font-semibold text-white transition hover:bg-[#355d3e]"
        >
          {t("addListing")}
        </Link>
      </div>

      <div className="flex w-fit gap-0.5 rounded-xl bg-[#eceeeb] p-1">
        {filterTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "all" ? "/dashboard/listings" : { pathname: "/dashboard/listings", query: { filter: tab.id } }}
            className={`rounded-[9px] px-3.5 py-2 text-sm font-medium transition ${
              filter === tab.id ? "bg-white text-[#1d2329]" : "text-[#5d6670]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#c9d0d5] bg-white p-10 text-center">
          <div className="text-[17px] font-semibold text-[#1d2329]">
            {all.length === 0 ? t("noListingsTitle") : t("noListingsInFilter")}
          </div>
          <Link
            href="/dashboard/listings/new"
            className="rounded-[10px] bg-[#3f6e4a] px-[18px] py-3 text-[15px] font-semibold text-white transition hover:bg-[#355d3e]"
          >
            {t("addListing")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((l) => {
            const images = (l.listing_images ?? []) as { url: string; sort_order: number }[];
            const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
            const catRaw = l.categories as unknown as
              | { name_lv: string; name_en: string }
              | { name_lv: string; name_en: string }[]
              | null;
            const cat = Array.isArray(catRaw) ? (catRaw[0] ?? null) : catRaw;
            const catName = cat ? (locale === "lv" ? cat.name_lv : cat.name_en) : null;
            const isSell = l.listing_type === "sell";
            const statusLabel =
              l.status === "removed"
                ? tListing("statusRemoved")
                : l.status === "pending"
                  ? tListing("statusPending")
                  : l.active
                    ? tListing("statusActive")
                    : t("statusHiddenDashboard");

            return (
              <div
                key={l.id}
                className="flex flex-wrap items-center gap-3.5 rounded-[14px] border border-[#e3e6e8] bg-white p-3.5"
              >
                <div
                  style={!firstImage ? STRIPE_BG : undefined}
                  className="relative h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-[10px]"
                >
                  {firstImage && <Image src={firstImage.url} alt="" fill sizes="88px" className="object-cover" />}
                </div>
                <div className="flex min-w-[180px] flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={isSell ? { background: "#e6efe6", color: "#2f5538" } : { background: "#f5ecd9", color: "#7a5516" }}
                    >
                      {isSell ? tListing("sell") : tListing("buy")}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={
                        l.active
                          ? { background: "#eef3ee", color: "#2f5538" }
                          : { background: "#eceeeb", color: "#5d6670" }
                      }
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="text-base font-medium leading-[1.3] text-[#1d2329]">{l.title}</div>
                  <div className="text-sm text-[#5d6670]">
                    {l.price != null && (
                      <span className="font-semibold text-[#1d2329]">
                        €{l.price}
                        {priceUnitSuffix(l.price_unit, locale)}
                        {l.price_plus_vat ? ` ${tListing("plusVat")}` : ""}
                      </span>
                    )}
                    {[catName, formatRelativeDays(l.created_at, locale)].filter(Boolean).length > 0 &&
                      (l.price != null ? " · " : "")}
                    {[catName, formatRelativeDays(l.created_at, locale)].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/dashboard/listings/${l.id}`}
                    className="rounded-[9px] border border-[#d9dee2] bg-white px-3.5 py-2 text-sm font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
                  >
                    {t("editListing")}
                  </Link>
                  {l.active && <HideButton locale={locale} listingId={l.id} />}
                  {l.expired && <ReactivateButton locale={locale} listingId={l.id} />}
                  <DeleteButton locale={locale} listingId={l.id} title={l.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
