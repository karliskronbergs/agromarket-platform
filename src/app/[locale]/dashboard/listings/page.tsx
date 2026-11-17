import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardToast } from "@/components/dashboard-toast";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ListingRows, type DashboardListingRow } from "./listing-rows";

export const dynamic = "force-dynamic";

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
      "id, title, listing_type, price, price_unit, price_plus_vat, availability, status, expires_at, created_at, auto_renew, categories(name_lv, name_en), listing_images(url, sort_order)",
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
    { id: "all", label: `${t("filterAll")} (${decorated.length})` },
    { id: "active", label: `${t("filterActive")} (${decorated.filter((l) => l.active).length})` },
    { id: "hidden", label: `${t("filterHidden")} (${decorated.filter((l) => l.expired).length})` },
  ];

  const rows: DashboardListingRow[] = filtered.map((l) => {
    const images = (l.listing_images ?? []) as { url: string; sort_order: number }[];
    const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
    const catRaw = l.categories as unknown as
      | { name_lv: string; name_en: string }
      | { name_lv: string; name_en: string }[]
      | null;
    const cat = Array.isArray(catRaw) ? (catRaw[0] ?? null) : catRaw;
    const removed = l.status === "removed";
    return {
      id: l.id,
      title: l.title,
      price: l.price,
      priceUnit: l.price_unit,
      plusVat: !!l.price_plus_vat,
      createdAt: l.created_at,
      autoRenew: l.auto_renew,
      isSell: l.listing_type === "sell",
      reservation: l.listing_type === "sell" && l.availability === "reservation",
      active: l.active,
      expired: l.expired,
      removed,
      statusLabel: removed
        ? tListing("statusRemoved")
        : l.status === "pending"
          ? tListing("statusPending")
          : l.active
            ? tListing("statusActive")
            : t("statusHiddenDashboard"),
      categoryName: cat ? (locale === "lv" ? cat.name_lv : cat.name_en) : null,
      imageUrl: firstImage?.url ?? null,
    };
  });

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
          className="hidden rounded-[10px] bg-[#3f6e4a] px-[18px] py-3 text-[15px] font-semibold text-white transition hover:bg-[#355d3e] sm:inline-block"
        >
          {t("addListing")}
        </Link>
      </div>

      <SegmentedControl
        fill={false}
        value={filter}
        items={filterTabs.map((tab) => ({
          value: tab.id,
          label: tab.label,
          href: tab.id === "all" ? "/dashboard/listings" : { pathname: "/dashboard/listings", query: { filter: tab.id } },
        }))}
      />

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
        <ListingRows
          listings={rows}
          locale={locale}
          labels={{
            sell: tListing("sell"),
            buy: tListing("buy"),
            reservation: tListing("availabilityReservation"),
            editListing: t("editListing"),
            hideListing: t("hideListing"),
            reactivate: tListing("reactivate"),
            deleteCta: t("deleteListingCta"),
            deletedMessage: t("toastListingDeleted"),
            undo: t("undo"),
          }}
        />
      )}
    </div>
  );
}
