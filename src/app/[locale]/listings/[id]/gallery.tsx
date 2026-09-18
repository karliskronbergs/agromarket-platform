"use client";

import { useState } from "react";
import Image from "next/image";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#52596b] to-[#7b8496] text-sm font-medium text-white/80">
        {title}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
        <Image
          src={images[active]}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-2.5 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? "border-[#d9713a]" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
