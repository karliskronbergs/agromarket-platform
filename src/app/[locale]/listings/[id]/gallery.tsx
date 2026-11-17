"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconChevronLeft } from "@/components/icons";

const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 14px, #e4e7e1 14px, #e4e7e1 28px)",
};

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollingToRef = useRef(false);

  function scrollTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    scrollingToRef.current = true;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActive(i);
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    function onScroll() {
      if (scrollingToRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const node = trackRef.current;
        if (!node || node.clientWidth === 0) return;
        setActive(Math.round(node.scrollLeft / node.clientWidth));
      });
    }
    function onScrollEnd() {
      scrollingToRef.current = false;
    }
    el.addEventListener("scroll", onScroll);
    el.addEventListener("scrollend", onScrollEnd);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEnd);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (images.length === 0) {
    return (
      <div
        style={STRIPE_BG}
        className="flex aspect-[4/3] w-full items-center justify-center rounded-[18px] text-sm font-medium text-[#7a8279] sm:max-h-[540px]"
      >
        {title}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] sm:max-h-[540px]">
        <div
          ref={trackRef}
          className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative h-full w-full flex-shrink-0 snap-start">
              <Image
                src={src}
                alt={i === 0 ? title : ""}
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
              <div className="flex gap-1.5 rounded-full bg-black/[0.28] px-2 py-1.5 backdrop-blur-[10px]">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollTo(i)}
                    aria-label={`Image ${i + 1}`}
                    className="pointer-events-auto h-[7px] rounded-full transition-all"
                    style={{
                      width: i === active ? "22px" : "7px",
                      background: i === active ? "#fff" : "rgba(255,255,255,0.6)",
                    }}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => scrollTo((active - 1 + images.length) % images.length)}
              className="absolute left-3.5 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-[#1d2329] backdrop-blur-[12px] sm:flex"
            >
              <IconChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => scrollTo((active + 1) % images.length)}
              className="absolute right-3.5 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-[#1d2329] backdrop-blur-[12px] sm:flex"
            >
              <IconChevronLeft className="h-5 w-5 rotate-180" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-2.5 hidden grid-cols-4 gap-2.5 sm:grid">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => scrollTo(i)}
              className="relative aspect-[4/3] overflow-hidden rounded-[10px] border-2"
              style={{ borderColor: i === active ? "#3f6e4a" : "transparent" }}
            >
              <Image src={src} alt="" fill sizes="160px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
