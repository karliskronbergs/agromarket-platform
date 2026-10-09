"use client";

import { useState } from "react";
import Image from "next/image";

const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, #eceee9 0px, #eceee9 14px, #e4e7e1 14px, #e4e7e1 28px)",
};

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

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
        <Image
          src={images[active]}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-cover"
          priority
        />

        {images.length > 1 && (
          <>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === active ? "22px" : "8px",
                    background: i === active ? "#fff" : "rgba(255,255,255,0.6)",
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
              className="absolute inset-y-0 left-0 w-1/2 sm:hidden"
            />
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setActive((i) => (i + 1) % images.length)}
              className="absolute inset-y-0 right-0 w-1/2 sm:hidden"
            />
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-2.5 hidden grid-cols-4 gap-2.5 sm:grid">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
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
