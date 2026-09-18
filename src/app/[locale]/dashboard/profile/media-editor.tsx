"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/compress-image";

export function ProfileMediaEditor({
  businessName,
  namePlaceholder,
  initialAvatarUrl,
  initialCoverUrl,
  changeCoverLabel,
  changeAvatarLabel,
}: {
  businessName: string;
  namePlaceholder: string;
  initialAvatarUrl?: string;
  initialCoverUrl?: string;
  changeCoverLabel: string;
  changeAvatarLabel: string;
}) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl ?? null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialCoverUrl ?? null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function onPick(
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (url: string) => void,
  ) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    const dt = new DataTransfer();
    dt.items.add(compressed);
    input.files = dt.files;
    setPreview(URL.createObjectURL(compressed));
  }

  return (
    <div className="relative mb-2">
      <button
        type="button"
        onClick={() => coverInputRef.current?.click()}
        className="group relative block h-36 w-full overflow-hidden rounded-2xl sm:h-44"
        style={{
          background: coverPreview
            ? undefined
            : "linear-gradient(120deg,#3f6b3f,#5c8a2e,#7a9c4a)",
        }}
      >
        {coverPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreview} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
          <span className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
            {changeCoverLabel}
          </span>
        </div>
      </button>
      <input
        ref={coverInputRef}
        type="file"
        name="cover"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e, setCoverPreview)}
      />

      <div className="flex items-end gap-4 px-2 sm:px-4">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="group relative -mt-10 h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-4 border-[#faf8f3] sm:-mt-12 sm:h-24 sm:w-24"
        >
          <div className={`h-full w-full ${avatarPreview ? "bg-white" : "bg-[#3f6b3f]"}`}>
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-sans text-2xl font-bold text-white">
                {(businessName || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
            <span className="px-1 text-center text-[10px] font-semibold leading-tight text-white opacity-0 transition group-hover:opacity-100">
              {changeAvatarLabel}
            </span>
          </div>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          name="avatar"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e, setAvatarPreview)}
        />
        <div className="pb-1">
          <div className="font-sans text-xl font-bold text-[#2b2a24] sm:text-2xl">
            {businessName || namePlaceholder}
          </div>
        </div>
      </div>
    </div>
  );
}
