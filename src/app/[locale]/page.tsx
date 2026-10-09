import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildCategoryTree, type CategoryRow } from "@/lib/categories";
import { priceUnitSuffix, formatRelativeDays } from "@/lib/format";
import { getAttributesByProfileIds } from "@/lib/attributes";
import { ATTRIBUTE_ICONS } from "@/components/attribute-badges";
import { IconStar } from "@/components/icons";
import { HeroSearch } from "@/components/hero-search";
import { HomeMapPreview } from "@/components/home-map-preview";

const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 10px, #e4e7e1 10px, #e4e7e1 20px)",
};

const CATEGORY_PLACEHOLDER: Record<string, Record<string, string>> = {
  lv: {
    lopkopiba: "foto: liellopi ganībās",
    "lauksaimnicibas-tehnika": "foto: traktors",
    "seklas-un-graudi": "foto: graudu lauks",
    mezsaimnieciba: "foto: mežs / kokmateriāli",
    dazadi: "foto: saimniecības produkcija",
  },
  en: {
    lopkopiba: "photo: cattle grazing",
    "lauksaimnicibas-tehnika": "photo: tractor",
    "seklas-un-graudi": "photo: grain field",
    mezsaimnieciba: "photo: forest / timber",
    dazadi: "photo: farm produce",
  },
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Home");
  const tListing = await getTranslations("Listing");
  const tMap = await getTranslations("Map");
  const supabase = await createClient();

  const [{ data: allCategories }, { data: mapProfiles }, { data: latestListings }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name_lv, name_en, parent_id")
      .order("sort_order")
      .order("name_lv"),
    supabase
      .from("profiles")
      .select("id, lat, lng")
      .eq("status", "active")
      .not("lat", "is", null)
      .limit(300),
    supabase
      .from("listings")
      .select(
        "id, title, price, price_unit, price_plus_vat, listing_type, created_at, profiles(id, address), categories(name_lv, name_en), listing_images(url, sort_order)",
      )
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const categoryTree = buildCategoryTree<CategoryRow>(allCategories ?? []);
  const topCategories = categoryTree.slice(0, 5);

  const listingProfileIds = Array.from(
    new Set((latestListings ?? []).map((l) => (Array.isArray(l.profiles) ? l.profiles[0] : l.profiles)?.id)),
  ).filter((id): id is string => !!id);
  const attributesByProfile = await getAttributesByProfileIds(supabase, listingProfileIds);

  const mapPoints = (mapProfiles ?? [])
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({ lat: p.lat as number, lng: p.lng as number }));

  const listingCards = (latestListings ?? []).map((l) => {
    const profile = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
    const category = Array.isArray(l.categories) ? l.categories[0] : l.categories;
    const images = (l.listing_images ?? []) as { url: string; sort_order: number }[];
    const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
    const isSell = l.listing_type === "sell";
    const badge = profile?.id ? attributesByProfile.get(profile.id)?.[0] : undefined;
    const BadgeIcon = badge ? (ATTRIBUTE_ICONS[badge.icon] ?? IconStar) : null;
    return { listing: l, profile, category, firstImage, isSell, badge, BadgeIcon };
  });

  return (
    <main className="flex flex-1 flex-col">
      {/* ======================= MOBILE ======================= */}
      <div className="sm:hidden">
        <section className="flex flex-col gap-4 border-b border-[#e3e6e8] bg-white px-4 pb-7 pt-6">
          <h1 className="m-0 text-balance text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#1d2329]">
            {t("title")}
          </h1>
          <p className="m-0 text-pretty text-base leading-[1.5] text-[#5d6670]">{t("subtitle")}</p>
          <HeroSearch
            labels={{
              tabProfiles: t("heroTabProfiles"),
              tabSell: t("heroTabSell"),
              tabBuy: t("heroTabBuy"),
              placeholderProfiles: tMap("searchPlaceholderProfiles"),
              placeholderListings: tMap("searchPlaceholderListings"),
              searchCta: t("heroSearchCta"),
            }}
          />
        </section>

        <section className="px-4 pt-6">
          <Link
            href="/map"
            className="relative block h-[200px] overflow-hidden rounded-2xl border border-[#e3e6e8] bg-[#e8ece6]"
          >
            <HomeMapPreview points={mapPoints} />
            <div className="absolute inset-x-2.5 bottom-2.5 z-[500] flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_4px_14px_rgba(29,35,41,0.12)]">
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[#1d2329]">{t("mapPreviewTitleMobile")}</div>
                <div className="mt-0.5 text-xs text-[#5d6670]">{t("mapPreviewSubtitleMobile")}</div>
              </div>
              <span className="flex-shrink-0 rounded-[9px] bg-[#3b5166] px-3 py-2 text-[13px] font-semibold text-white">
                {t("mapPreviewCtaShort")}
              </span>
            </div>
          </Link>
        </section>

        {topCategories.length > 0 && (
          <section className="flex flex-col gap-3 pt-7">
            <h2 className="m-0 px-4 text-lg font-semibold text-[#1d2329]">{t("industriesLabel")}</h2>
            <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {topCategories.map((c) => (
                <Link
                  key={c.id}
                  href={{ pathname: "/map", query: { mode: "profiles", category: c.id } }}
                  className="flex-shrink-0 basis-[132px] overflow-hidden rounded-[14px] border border-[#e3e6e8] bg-white"
                >
                  <div
                    style={STRIPE_BG}
                    className="flex h-[84px] items-center justify-center p-1.5 text-center font-mono text-[10px] text-[#7a8279]"
                  >
                    {CATEGORY_PLACEHOLDER[locale]?.[c.slug ?? ""] ??
                      `${locale === "lv" ? "foto" : "photo"}: ${locale === "lv" ? c.name_lv : c.name_en}`}
                  </div>
                  <div className="px-3 py-2.5 text-sm font-medium leading-tight text-[#1d2329]">
                    {locale === "lv" ? c.name_lv : c.name_en}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {listingCards.length > 0 && (
          <section className="flex flex-col gap-3 pt-7">
            <div className="flex items-baseline justify-between px-4">
              <span className="text-lg font-semibold text-[#1d2329]">{t("latestListings")}</span>
              <Link href={{ pathname: "/map", query: { mode: "sell" } }} className="text-sm font-medium text-[#3f6e4a]">
                {t("allListingsShort")}
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {listingCards.map(({ listing: l, firstImage, isSell, profile }) => (
                <Link
                  key={l.id}
                  href={`/listings/${l.id}`}
                  className="flex flex-shrink-0 basis-[220px] flex-col overflow-hidden rounded-[14px] border border-[#e3e6e8] bg-white"
                >
                  <div style={STRIPE_BG} className="relative h-[130px]">
                    {firstImage && (
                      <Image src={firstImage.url} alt="" fill sizes="220px" className="object-cover" />
                    )}
                    <span
                      className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold"
                      style={isSell ? { background: "#e6efe6", color: "#2f5538" } : { background: "#f5ecd9", color: "#7a5516" }}
                    >
                      {isSell ? tListing("sell") : tListing("buy")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <div className="line-clamp-2 text-sm font-medium leading-tight text-[#1d2329]">{l.title}</div>
                    {l.price != null && (
                      <div className="text-base font-semibold text-[#1d2329]">
                        €{l.price}
                        <span className="ml-1 text-xs font-normal text-[#5d6670]">
                          {priceUnitSuffix(l.price_unit, locale)}
                        </span>
                      </div>
                    )}
                    <div className="mt-auto text-xs text-[#5d6670]">{profile?.address ?? ""}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3 px-4 pt-8">
          <div className="text-[13px] font-medium text-[#3f6e4a]">{t("howEyebrow")}</div>
          <div className="-mt-1.5 text-[22px] font-semibold tracking-[-0.01em] text-[#1d2329]">{t("howTitle")}</div>
          <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white">
            <MobileHowRow number={1} title={t("how1Title")} body={t("how1BodyShort")} href="/auth/sign-up" border />
            <MobileHowRow
              number={2}
              title={t("how2Title")}
              body={t("how2BodyShort")}
              href={{ pathname: "/map", query: { mode: "sell" } }}
              border
            />
            <MobileHowRow number={3} title={t("how3Title")} body={t("how3BodyShort")} href="/map" />
          </div>
        </section>

        <section className="px-4 pb-7 pt-7">
          <div className="flex flex-col gap-3.5 rounded-[20px] bg-[#3b5166] p-6">
            <div className="text-balance text-[21px] font-semibold leading-[1.25] text-white">{t("ctaTitle")}</div>
            <div className="text-sm leading-[1.5] text-[#d6dee6]">{t("ctaBodyShort")}</div>
            <Link
              href="/auth/sign-up"
              className="rounded-[10px] bg-white py-3.5 text-center font-semibold text-[#3b5166]"
            >
              {t("ctaPrimary")}
            </Link>
          </div>
        </section>
      </div>

      {/* ======================= DESKTOP ======================= */}
      <div className="hidden sm:block">
        {/* Hero */}
        <section className="border-b border-[#e3e6e8] bg-white">
          <div className="mx-auto grid max-w-[1328px] items-center gap-12 px-6 py-14 sm:py-16 [grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr))]">
            <div className="flex flex-col gap-[22px]">
              <h1 className="m-0 text-balance text-[clamp(34px,4.4vw,52px)] font-semibold leading-[1.08] tracking-[-0.02em] text-[#1d2329]">
                {t("title")}
              </h1>
              <p className="m-0 max-w-[540px] text-pretty text-lg leading-[1.55] text-[#5d6670]">
                {t("subtitle")}
              </p>

              <HeroSearch
                labels={{
                  tabProfiles: t("heroTabProfiles"),
                  tabSell: t("heroTabSell"),
                  tabBuy: t("heroTabBuy"),
                  placeholderProfiles: tMap("searchPlaceholderProfiles"),
                  placeholderListings: tMap("searchPlaceholderListings"),
                  searchCta: t("heroSearchCta"),
                }}
              />

              {topCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-sm text-[#5d6670]">{t("popularLabel")}</span>
                  {topCategories.map((c) => (
                    <Link
                      key={c.id}
                      href={{ pathname: "/map", query: { mode: "profiles", category: c.id } }}
                      className="rounded-full border border-[#e3e6e8] bg-white px-3 py-1.5 text-sm text-[#1d2329] transition hover:border-[#3f6e4a] hover:text-[#2f5538]"
                    >
                      {locale === "lv" ? c.name_lv : c.name_en}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="relative h-[460px] overflow-hidden rounded-[20px] border border-[#e3e6e8] bg-[#e8ece6]">
              <HomeMapPreview points={mapPoints} />
              <div className="absolute inset-x-4 bottom-4 z-[500] flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_6px_20px_rgba(29,35,41,0.12)]">
                <div className="min-w-[180px] flex-1">
                  <div className="text-[15px] font-semibold text-[#1d2329]">{t("mapPreviewTitle")}</div>
                  <div className="mt-0.5 text-[13px] text-[#5d6670]">{t("mapPreviewSubtitle")}</div>
                </div>
                <Link
                  href="/map"
                  className="rounded-[10px] bg-[#3b5166] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f4254]"
                >
                  {t("mapPreviewCta")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-[1328px] px-6 pb-6 pt-[72px]">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 text-sm font-medium text-[#3f6e4a]">{t("howEyebrow")}</div>
              <h2 className="m-0 text-[32px] font-semibold tracking-[-0.01em] text-[#1d2329]">{t("howTitle")}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-3">
            <HowCard number={1} title={t("how1Title")} body={t("how1Body")} cta={t("how1Cta")} href="/auth/sign-up" />
            <HowCard
              number={2}
              title={t("how2Title")}
              body={t("how2Body")}
              cta={t("how2Cta")}
              href={{ pathname: "/map", query: { mode: "sell" } }}
            />
            <HowCard number={3} title={t("how3Title")} body={t("how3Body")} cta={t("how3Cta")} href="/map" />
          </div>
        </section>

        {/* Browse by industry */}
        {topCategories.length > 0 && (
          <section className="mx-auto max-w-[1328px] px-6 pb-6 pt-14">
            <h2 className="mb-6 text-[28px] font-semibold tracking-[-0.01em] text-[#1d2329]">
              {t("browseByIndustry")}
            </h2>
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
              {topCategories.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(29,35,41,0.08)]"
                >
                  <Link href={{ pathname: "/map", query: { mode: "profiles", category: c.id } }}>
                    <div
                      style={STRIPE_BG}
                      className="flex h-[120px] items-center justify-center font-mono text-[11px] text-[#7a8279]"
                    >
                      {CATEGORY_PLACEHOLDER[locale]?.[c.slug ?? ""] ??
                        `${locale === "lv" ? "foto" : "photo"}: ${locale === "lv" ? c.name_lv : c.name_en}`}
                    </div>
                    <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                      <span className="text-[15px] font-medium text-[#1d2329]">
                        {locale === "lv" ? c.name_lv : c.name_en}
                      </span>
                      <span className="text-[#3f6e4a]">→</span>
                    </div>
                  </Link>
                  {c.children.length > 0 && (
                    <div className="flex flex-col gap-1 px-4 pb-3.5">
                      {c.children.slice(0, 3).map((sub) => (
                        <Link
                          key={sub.id}
                          href={{ pathname: "/map", query: { mode: "profiles", category: sub.id } }}
                          className="truncate text-[13px] text-[#5d6670] hover:text-[#2f5538]"
                        >
                          {locale === "lv" ? sub.name_lv : sub.name_en}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest listings */}
        {listingCards.length > 0 && (
          <section className="mx-auto max-w-[1328px] px-6 pb-6 pt-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="m-0 text-[28px] font-semibold tracking-[-0.01em] text-[#1d2329]">
                {t("latestListings")}
              </h2>
              <Link
                href={{ pathname: "/map", query: { mode: "sell" } }}
                className="text-[15px] font-medium text-[#3f6e4a] hover:text-[#2f5538]"
              >
                {t("allListings")}
              </Link>
            </div>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
              {listingCards.map(({ listing: l, profile, category, firstImage, isSell, badge, BadgeIcon }) => (
                <Link
                  key={l.id}
                  href={`/listings/${l.id}`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white transition hover:shadow-[0_10px_24px_rgba(29,35,41,0.08)]"
                >
                  <div style={STRIPE_BG} className="relative h-[170px]">
                    {firstImage && (
                      <Image src={firstImage.url} alt="" fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
                    )}
                    <span
                      className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={
                        isSell
                          ? { background: "#e6efe6", color: "#2f5538" }
                          : { background: "#f5ecd9", color: "#7a5516" }
                      }
                    >
                      {isSell ? tListing("sell") : tListing("buy")}
                    </span>
                    {badge && BadgeIcon && (
                      <span
                        title={locale === "lv" ? badge.name_lv : badge.name_en}
                        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#2f5538]"
                      >
                        <BadgeIcon className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <div className="text-xs text-[#5d6670]">
                      {category ? (locale === "lv" ? category.name_lv : category.name_en) : ""}
                    </div>
                    <div className="line-clamp-2 text-base font-medium leading-snug text-[#1d2329]">
                      {l.title}
                    </div>
                    {l.price != null && (
                      <div className="mt-0.5 text-lg font-semibold text-[#1d2329]">
                        €{l.price}
                        <span className="ml-1 text-[13px] font-normal text-[#5d6670]">
                          {priceUnitSuffix(l.price_unit, locale)}
                          {l.price_plus_vat ? ` ${tListing("plusVat")}` : ""}
                        </span>
                      </div>
                    )}
                    <div className="mt-auto flex justify-between gap-2 border-t border-[#eef0f1] pt-2.5 text-[13px] text-[#5d6670]">
                      <span className="truncate">{profile?.address ?? ""}</span>
                      <span className="flex-shrink-0">{formatRelativeDays(l.created_at, locale)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA band */}
        <section className="mx-auto max-w-[1328px] px-6 pb-20 pt-14">
          <div className="flex flex-wrap items-center justify-between gap-8 rounded-[24px] bg-[#3b5166] p-12">
            <div className="max-w-[620px]">
              <h2 className="m-0 mb-2.5 text-balance text-[30px] font-semibold tracking-[-0.01em] text-white">
                {t("ctaTitle")}
              </h2>
              <p className="m-0 text-base leading-[1.55] text-[#d6dee6]">{t("ctaBody")}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/auth/sign-up"
                className="rounded-[10px] bg-white px-5 py-3.5 font-semibold text-[#3b5166] transition hover:bg-[#e9eef3]"
              >
                {t("ctaPrimary")}
              </Link>
              <Link
                href="/map"
                className="rounded-[10px] border border-white/40 px-5 py-3.5 font-medium text-white transition hover:bg-white/10"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function HowCard({
  number,
  title,
  body,
  cta,
  href,
}: {
  number: number;
  title: string;
  body: string;
  cta: string;
  href: Parameters<typeof Link>[0]["href"];
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#e3e6e8] bg-white p-7">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ee] font-semibold text-[#2f5538]">
        {number}
      </div>
      <h3 className="m-0 text-xl font-semibold text-[#1d2329]">{title}</h3>
      <p className="m-0 text-[15px] leading-[1.55] text-[#5d6670]">{body}</p>
      <Link href={href} className="mt-auto pt-2 text-[15px] font-medium text-[#3f6e4a] hover:text-[#2f5538]">
        {cta}
      </Link>
    </div>
  );
}

function MobileHowRow({
  number,
  title,
  body,
  href,
  border,
}: {
  number: number;
  title: string;
  body: string;
  href: Parameters<typeof Link>[0]["href"];
  border?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex gap-3.5 p-4 ${border ? "border-b border-[#eef0f1]" : ""}`}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#eef3ee] font-semibold text-[#2f5538]">
        {number}
      </div>
      <div className="flex-1">
        <div className="mb-[3px] text-base font-semibold text-[#1d2329]">{title}</div>
        <div className="text-sm leading-[1.45] text-[#5d6670]">{body}</div>
      </div>
    </Link>
  );
}
