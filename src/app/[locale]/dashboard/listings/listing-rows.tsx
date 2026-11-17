"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { motion, useMotionValue, animate, type PanInfo } from "motion/react";
import { springDefault, fadeTransition, usePrefersReducedMotion, useMediaQuery } from "@/lib/motion";
import { priceUnitSuffix, formatRelativeDays } from "@/lib/format";
import { HideButton } from "./hide-button";
import { ReactivateButton } from "./reactivate-button";
import { AutoRenewCheckbox } from "./auto-renew-checkbox";
import { deleteListing } from "./actions";

const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 8px, #e4e7e1 8px, #e4e7e1 16px)",
};

const ACTIONS_WIDTH = 160;

export type DashboardListingRow = {
  id: string;
  title: string;
  price: number | null;
  priceUnit: string | null;
  plusVat: boolean;
  createdAt: string;
  autoRenew: boolean;
  isSell: boolean;
  reservation: boolean;
  active: boolean;
  expired: boolean;
  removed: boolean;
  statusLabel: string;
  categoryName: string | null;
  imageUrl: string | null;
};

export function ListingRows({
  listings,
  locale,
  labels,
}: {
  listings: DashboardListingRow[];
  locale: string;
  labels: {
    sell: string;
    buy: string;
    reservation: string;
    editListing: string;
    hideListing: string;
    reactivate: string;
    deleteCta: string;
    deletedMessage: string;
    undo: string;
  };
}) {
  const router = useRouter();
  // listings only changes identity when this whole page actually
  // navigates (a fresh server render re-mounts this component with the
  // new data), except after router.refresh() post-delete -- by then the
  // optimistic removal below has already happened, so there's nothing to
  // re-sync. Local state is the source of truth once mounted.
  const [items, setItems] = useState(listings);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ row: DashboardListingRow; index: number } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!openId) return;
    function onDocClick() {
      setOpenId(null);
    }
    document.addEventListener("pointerdown", onDocClick);
    return () => document.removeEventListener("pointerdown", onDocClick);
  }, [openId]);

  function requestDelete(row: DashboardListingRow) {
    const index = items.findIndex((l) => l.id === row.id);
    setOpenId(null);
    setItems((prev) => prev.filter((l) => l.id !== row.id));
    setPendingDelete({ row, index });
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setPendingDelete(null);
      await deleteListing(locale, row.id);
      router.refresh();
    }, 5000);
  }

  function undoDelete() {
    clearTimeout(timeoutRef.current);
    if (!pendingDelete) return;
    setItems((prev) => {
      const next = [...prev];
      next.splice(pendingDelete.index, 0, pendingDelete.row);
      return next;
    });
    setPendingDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white">
        {items.map((l) => (
          <ListingRow
            key={l.id}
            listing={l}
            locale={locale}
            labels={labels}
            isOpen={openId === l.id}
            onOpen={() => setOpenId(l.id)}
            onClose={() => setOpenId((id) => (id === l.id ? null : id))}
            onDelete={() => requestDelete(l)}
          />
        ))}
      </div>

      {pendingDelete && (
        <div className="fixed bottom-24 left-1/2 z-[3100] -translate-x-1/2 sm:bottom-8">
          <div className="flex items-center gap-4 whitespace-nowrap rounded-xl bg-[rgba(29,35,41,0.86)] px-[18px] py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(29,35,41,0.25)] backdrop-blur-[16px] backdrop-saturate-[1.8]">
            {labels.deletedMessage}
            <button type="button" onClick={undoDelete} className="font-semibold text-[#8fd19e] hover:text-white">
              {labels.undo}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ListingRow({
  listing: l,
  locale,
  labels,
  isOpen,
  onOpen,
  onClose,
  onDelete,
}: {
  listing: DashboardListingRow;
  locale: string;
  labels: {
    sell: string;
    buy: string;
    reservation: string;
    editListing: string;
    hideListing: string;
    reactivate: string;
    deleteCta: string;
    deletedMessage: string;
    undo: string;
  };
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const isWide = useMediaQuery("(min-width: 640px)");
  const x = useMotionValue(0);
  const panStartX = useRef(0);

  useEffect(() => {
    if (!isOpen) animate(x, 0, reducedMotion ? fadeTransition : springDefault);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handlePanStart() {
    panStartX.current = x.get();
  }

  function handlePan(_: unknown, info: PanInfo) {
    const next = panStartX.current + info.offset.x;
    x.set(Math.max(-ACTIONS_WIDTH, Math.min(0, next)));
  }

  function handlePanEnd(_: unknown, info: PanInfo) {
    const shouldOpen = x.get() < -ACTIONS_WIDTH / 2 || info.velocity.x < -400;
    animate(x, shouldOpen ? -ACTIONS_WIDTH : 0, {
      ...(reducedMotion ? fadeTransition : springDefault),
      velocity: info.velocity.x,
    });
    if (shouldOpen) onOpen();
    else onClose();
  }

  const thumb = (
    <div
      style={!l.imageUrl ? STRIPE_BG : undefined}
      className="relative h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-[10px]"
    >
      {l.imageUrl && <Image src={l.imageUrl} alt="" fill sizes="88px" className="object-cover" />}
    </div>
  );

  const details = (
    <div className="flex min-w-[180px] flex-1 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={l.isSell ? { background: "#e6efe6", color: "#2f5538" } : { background: "#f5ecd9", color: "#7a5516" }}
        >
          {l.isSell ? labels.sell : labels.buy}
        </span>
        {l.reservation && (
          <span className="rounded-full bg-[#3b5166] px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {labels.reservation}
          </span>
        )}
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={l.active ? { background: "#eef3ee", color: "#2f5538" } : { background: "#eceeeb", color: "#5d6670" }}
        >
          {l.statusLabel}
        </span>
      </div>
      <div className="text-base font-medium leading-[1.3] text-[#1d2329]">{l.title}</div>
      <div className="text-sm text-[#5d6670]">
        {l.price != null && (
          <span className="font-semibold text-[#1d2329]">
            €{l.price}
            {priceUnitSuffix(l.priceUnit, locale)}
            {l.plusVat ? " +PVN" : ""}
          </span>
        )}
        {[l.categoryName, formatRelativeDays(l.createdAt, locale)].filter(Boolean).length > 0 && (l.price != null ? " · " : "")}
        {[l.categoryName, formatRelativeDays(l.createdAt, locale)].filter(Boolean).join(" · ")}
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden border-b border-[#eef0f1] last:border-b-0">
      {!isWide && (
        <div className="absolute inset-y-0 right-0 flex" style={{ width: ACTIONS_WIDTH }}>
          {l.active && (
            <div className="flex flex-1 [&>form]:h-full [&>form>button]:h-full [&>form>button]:w-full [&>form>button]:rounded-none [&>form>button]:border-0 [&>form>button]:bg-[#8a929a] [&>form>button]:text-white">
              <HideButton locale={locale} listingId={l.id} />
            </div>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="flex flex-1 items-center justify-center bg-[#b3261e] text-sm font-semibold text-white"
          >
            {labels.deleteCta}
          </button>
        </div>
      )}

      <motion.div
        onPanStart={!isWide ? handlePanStart : undefined}
        onPan={!isWide ? handlePan : undefined}
        onPanEnd={!isWide ? handlePanEnd : undefined}
        style={!isWide ? { x, touchAction: "pan-y" } : undefined}
        className="relative flex flex-col gap-3 bg-white p-3.5"
      >
        <div className="flex flex-wrap items-center gap-3.5">
          {isWide ? (
            <>
              {thumb}
              {details}
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href={`/dashboard/listings/${l.id}`}
                  className="rounded-[9px] border border-[#d9dee2] bg-white px-3.5 py-2 text-sm font-medium text-[#1d2329] transition hover:border-[#3f6e4a]"
                >
                  {labels.editListing}
                </Link>
                {l.active && <HideButton locale={locale} listingId={l.id} />}
                {l.expired && <ReactivateButton locale={locale} listingId={l.id} />}
                {!l.removed && <AutoRenewCheckbox locale={locale} listingId={l.id} initialChecked={l.autoRenew} />}
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-[9px] border border-[#f0d4d1] bg-white px-3.5 py-2 text-sm font-medium text-[#b3261e] transition hover:bg-[#fdf3f2]"
                >
                  {labels.deleteCta}
                </button>
              </div>
            </>
          ) : (
            <Link href={`/dashboard/listings/${l.id}`} className="flex min-w-0 flex-1 gap-3.5">
              {thumb}
              {details}
            </Link>
          )}
        </div>
        {!isWide && (
          <div className="flex flex-wrap items-center gap-2 pl-[103px]">
            {l.expired && <ReactivateButton locale={locale} listingId={l.id} />}
            {!l.removed && <AutoRenewCheckbox locale={locale} listingId={l.id} initialChecked={l.autoRenew} />}
          </div>
        )}
      </motion.div>
    </div>
  );
}
