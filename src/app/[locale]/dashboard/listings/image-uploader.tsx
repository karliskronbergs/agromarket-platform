"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconClose } from "@/components/icons";
import { compressImage } from "@/lib/compress-image";

const MAX_IMAGES = 8;

type ExistingImage = { id: string; url: string };
type NewImage = { file: File; previewUrl: string };

export function ImageUploader({ existingImages }: { existingImages: ExistingImage[] }) {
  const t = useTranslations("Listing");
  const [existing, setExisting] = useState(existingImages);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_IMAGES - existing.length - newImages.length;

  useEffect(() => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    newImages.forEach((img) => dt.items.add(img.file));
    fileInputRef.current.files = dt.files;
  }, [newImages]);

  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const room = MAX_IMAGES - existing.length - newImages.length;
    if (room <= 0 || incoming.length === 0) return;
    const selected = incoming.slice(0, room);
    const compressed = await Promise.all(selected.map((file) => compressImage(file)));
    const toAdd = compressed.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...toAdd]);
  }

  function removeExisting(id: string) {
    setExisting((prev) => prev.filter((img) => img.id !== id));
    setRemovedIds((prev) => [...prev, id]);
  }

  function removeNew(index: number) {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        name="images"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
        }}
      />
      {removedIds.map((id) => (
        <input key={id} type="hidden" name="removeImageIds" value={id} />
      ))}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
        {existing.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square overflow-hidden rounded-lg border border-[#e7e2d8]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeExisting(img.id)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <IconClose className="h-3 w-3" />
            </button>
          </div>
        ))}

        {newImages.map((img, i) => (
          <div
            key={img.previewUrl}
            className="relative aspect-square overflow-hidden rounded-lg border border-[#e7e2d8]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeNew(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <IconClose className="h-3 w-3" />
            </button>
          </div>
        ))}

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs font-medium text-[#7a7566] transition ${
              dragOver ? "border-[#3f6b3f] bg-[#e7efe1]" : "border-[#e7e2d8] bg-[#faf8f3]"
            }`}
          >
            <span className="text-xl leading-none text-[#3f6b3f]">+</span>
            {t("addPhotos")}
          </button>
        )}
      </div>

      <p className="text-xs text-[#7a7566]">
        {existing.length + newImages.length}/{MAX_IMAGES}
      </p>
    </div>
  );
}
