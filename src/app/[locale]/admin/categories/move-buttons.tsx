"use client";

import { moveCategory } from "./actions";

export function MoveCategoryButtons({ locale, categoryId }: { locale: string; categoryId: string }) {
  const moveUp = moveCategory.bind(null, locale, categoryId, "up");
  const moveDown = moveCategory.bind(null, locale, categoryId, "down");

  return (
    <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
      <form action={moveUp}>
        <button
          type="submit"
          aria-label="Move up"
          className="flex h-4 w-5 items-center justify-center text-[#7a7566] hover:text-[#3f6b3f]"
        >
          ▲
        </button>
      </form>
      <form action={moveDown}>
        <button
          type="submit"
          aria-label="Move down"
          className="flex h-4 w-5 items-center justify-center text-[#7a7566] hover:text-[#3f6b3f]"
        >
          ▼
        </button>
      </form>
    </div>
  );
}
