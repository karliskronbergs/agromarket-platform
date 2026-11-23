"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

type SegmentItem<T extends string> = {
  value: T;
  label: string;
  href?: Parameters<typeof Link>[0]["href"];
};

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  name,
  className = "",
  fill = true,
}: {
  items: SegmentItem<T>[];
  value: T;
  onChange?: (value: T) => void;
  name?: string;
  className?: string;
  fill?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);
  const activeIndex = items.findIndex((item) => item.value === value);

  useLayoutEffect(() => {
    function measure() {
      const track = trackRef.current;
      const el = itemRefs.current[activeIndex];
      if (!track || !el) return;
      const trackRect = track.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setThumb({ left: elRect.left - trackRect.left, width: elRect.width });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex, items.length]);

  return (
    <div
      ref={trackRef}
      className={`relative flex gap-0.5 rounded-xl bg-black/[0.06] p-[3px] ${fill ? "" : "w-fit"} ${className}`}
    >
      {thumb && (
        <div
          className="absolute inset-y-[3px] rounded-[9px] bg-white shadow-[0_1px_2px_rgba(20,26,32,0.1),0_3px_8px_rgba(20,26,32,0.06)] motion-safe:transition-[transform,width] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(.32,.72,0,1)]"
          style={{ transform: `translateX(${thumb.left}px)`, width: thumb.width }}
        />
      )}
      {items.map((item, i) => {
        const active = item.value === value;
        const itemClass = `relative z-10 block w-full rounded-[9px] px-3.5 py-[7px] text-center text-sm transition-colors ${
          active ? "font-semibold text-[#1d2329]" : "font-medium text-[#5d6670]"
        }`;
        return (
          <div
            key={item.value}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={fill ? "relative flex-1" : "relative"}
          >
            {item.href ? (
              <Link href={item.href} className={itemClass}>
                {item.label}
              </Link>
            ) : (
              <button type="button" onPointerDown={() => onChange?.(item.value)} className={itemClass}>
                {item.label}
              </button>
            )}
          </div>
        );
      })}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
