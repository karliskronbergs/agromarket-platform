"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { Link } from "@/i18n/navigation";
import { priceUnitSuffix, formatRelativeDays } from "@/lib/format";
import { springDefault, fadeTransition, usePrefersReducedMotion, useMediaQuery } from "@/lib/motion";
import { IconClose } from "@/components/icons";

const STRIPE_BG = {
  backgroundImage: "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 10px, #e4e7e1 10px, #e4e7e1 20px)",
};

export type QuickLookListing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  priceUnit: string | null;
  plusVat: boolean;
  categoryName: string | null;
  isSell: boolean;
  reservation: boolean;
  imageUrl: string | null;
  address: string | null;
  createdAt: string;
  sellerName: string | null;
  badgeName: string | null;
  badgeIcon: ReactNode | null;
};

type Labels = {
  sell: string;
  buy: string;
  priceOnRequest: string;
  plusVat: string;
  reservation: string;
  message: string;
  openListing: string;
  close: string;
};

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function priceDisplay(l: QuickLookListing, locale: string, labels: Labels): ReactNode {
  if (l.price == null) return labels.priceOnRequest;
  return (
    <>
      €{l.price}
      <span className="ml-1 text-[13px] font-normal text-[#5d6670]">
        {priceUnitSuffix(l.priceUnit, locale)}
        {l.plusVat ? ` ${labels.plusVat}` : ""}
      </span>
    </>
  );
}

export function LatestListingsShelf({
  variant,
  listings,
  locale,
  labels,
}: {
  variant: "mobile" | "desktop";
  listings: QuickLookListing[];
  locale: string;
  labels: Labels;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = listings.find((l) => l.id === openId) ?? null;

  useEffect(() => {
    if (!openId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  return (
    <>
      {variant === "mobile" ? (
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {listings.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setOpenId(l.id)}
              className="flex flex-shrink-0 basis-[220px] flex-col overflow-hidden rounded-[14px] border border-[#e3e6e8] bg-white text-left"
            >
              <div style={STRIPE_BG} className="relative h-[130px]">
                {l.imageUrl && <Image src={l.imageUrl} alt={l.title} fill sizes="220px" className="object-cover" />}
                <span
                  className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold"
                  style={l.isSell ? { background: "#e6efe6", color: "#2f5538" } : { background: "#f5ecd9", color: "#7a5516" }}
                >
                  {l.isSell ? labels.sell : labels.buy}
                </span>
                {l.isSell && l.reservation && (
                  <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[#3b5166] px-2.5 py-[3px] text-[11px] font-semibold text-white">
                    {labels.reservation}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <div className="line-clamp-2 text-sm font-medium leading-tight text-[#1d2329]">{l.title}</div>
                <div className="text-base font-semibold text-[#1d2329]">{priceDisplay(l, locale, labels)}</div>
                <div className="mt-auto text-xs text-[#5d6670]">{l.address ?? ""}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {listings.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setOpenId(l.id)}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white text-left transition hover:shadow-[0_10px_24px_rgba(29,35,41,0.08)]"
            >
              <div style={STRIPE_BG} className="relative h-[170px]">
                {l.imageUrl && (
                  <Image src={l.imageUrl} alt={l.title} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
                )}
                <span
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={l.isSell ? { background: "#e6efe6", color: "#2f5538" } : { background: "#f5ecd9", color: "#7a5516" }}
                >
                  {l.isSell ? labels.sell : labels.buy}
                </span>
                {l.badgeIcon && (
                  <span
                    title={l.badgeName ?? undefined}
                    className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#2f5538]"
                  >
                    {l.badgeIcon}
                  </span>
                )}
                {l.isSell && l.reservation && (
                  <span className="absolute bottom-3 right-3 rounded-full bg-[#3b5166] px-2.5 py-1 text-xs font-semibold text-white">
                    {labels.reservation}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <div className="text-xs text-[#5d6670]">{l.categoryName ?? ""}</div>
                <div className="line-clamp-2 text-base font-medium leading-snug text-[#1d2329]">{l.title}</div>
                <div className="mt-0.5 text-lg font-semibold text-[#1d2329]">{priceDisplay(l, locale, labels)}</div>
                <div className="mt-auto flex justify-between gap-2 border-t border-[#eef0f1] pt-2.5 text-[13px] text-[#5d6670]">
                  <span className="truncate">{l.address ?? ""}</span>
                  <span className="flex-shrink-0">{formatRelativeDays(l.createdAt, locale)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <QuickLookSheet listing={open} locale={locale} labels={labels} onClose={() => setOpenId(null)} />
    </>
  );
}

function QuickLookSheet({
  listing,
  locale,
  labels,
  onClose,
}: {
  listing: QuickLookListing | null;
  locale: string;
  labels: Labels;
  onClose: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const isWide = useMediaQuery("(min-width: 640px)");

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 110 || info.velocity.y > 500) onClose();
  }

  return (
    <AnimatePresence>
      {listing && (
        <>
          <motion.div
            className="fixed inset-0 z-[3000] bg-[rgba(20,26,32,.4)]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
          />
          <div className="pointer-events-none fixed inset-0 z-[3001] flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              drag={!isWide && !reducedMotion ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={onDragEnd}
              initial={reducedMotion ? { opacity: 0 } : isWide ? { opacity: 0, scale: 0.92 } : { opacity: 0, y: "100%" }}
              animate={reducedMotion ? { opacity: 1 } : isWide ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : isWide ? { opacity: 0, scale: 0.92 } : { opacity: 0, y: "100%" }}
              transition={reducedMotion ? fadeTransition : springDefault}
              className="pointer-events-auto flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_30px_80px_rgba(20,26,32,0.3)] sm:w-[min(480px,calc(100%-32px))] sm:rounded-[22px]"
            >
              {!isWide && (
                <div className="flex flex-shrink-0 touch-none justify-center pb-2 pt-2.5">
                  <span className="h-[5px] w-10 rounded-full bg-[#d4d8dc]" />
                </div>
              )}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div style={STRIPE_BG} className="relative aspect-[16/10]">
                  {listing.imageUrl && (
                    <Image src={listing.imageUrl} alt={listing.title} fill sizes="480px" className="object-cover" />
                  )}
                  <span
                    className="absolute left-3.5 top-3.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={
                      listing.isSell
                        ? { background: "#e6efe6", color: "#2f5538" }
                        : { background: "#f5ecd9", color: "#7a5516" }
                    }
                  >
                    {listing.isSell ? labels.sell : labels.buy}
                  </span>
                  {listing.isSell && listing.reservation && (
                    <span className="absolute right-[60px] top-3.5 rounded-full bg-[#3b5166] px-2.5 py-1 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(20,26,32,.18)]">
                      {labels.reservation}
                    </span>
                  )}
                  {isWide && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label={labels.close}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/75 text-[#1d2329] backdrop-blur-[12px]"
                    >
                      <IconClose className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-4 p-5 sm:p-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-[#5d6670]">{listing.categoryName}</span>
                    <h3 className="m-0 text-balance text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-[#1d2329]">
                      {listing.title}
                    </h3>
                    <span className="text-[28px] font-semibold tracking-[-0.025em] text-[#1d2329]">
                      {priceDisplay(listing, locale, labels)}
                    </span>
                  </div>
                  {listing.description && (
                    <p className="m-0 text-pretty text-base leading-[1.55] text-[#33393f]">{listing.description}</p>
                  )}
                  {listing.sellerName && (
                    <div className="flex items-center gap-3 rounded-2xl bg-[#f5f6f4] p-3.5">
                      <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-[#e4eaf0] text-sm font-semibold text-[#3b5166]">
                        {initialsFor(listing.sellerName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-semibold text-[#1d2329]">{listing.sellerName}</div>
                        <div className="text-[13px] text-[#5d6670]">
                          {[listing.address, formatRelativeDays(listing.createdAt, locale)].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2.5">
                    <Link
                      href={`/listings/${listing.id}#contact`}
                      className="flex-1 basis-[160px] rounded-[14px] bg-[#3f6e4a] py-3.5 text-center text-base font-semibold text-white transition hover:bg-[#355d3e]"
                    >
                      {labels.message}
                    </Link>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="flex-1 basis-[160px] rounded-[14px] bg-[#eef0ee] py-3.5 text-center text-base font-medium text-[#1d2329]"
                    >
                      {labels.openListing}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
