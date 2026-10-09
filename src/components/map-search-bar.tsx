"use client";

import { useState } from "react";
import { IconClose } from "@/components/icons";

export function MapSearchBar({
  value,
  placeholder,
  onSearch,
}: {
  value?: string;
  placeholder: string;
  onSearch: (query: string) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(draft.trim());
      }}
      className="relative w-full flex-1 sm:max-w-[520px]"
    >
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#d9dee2] bg-white px-4 py-[11px] text-[15px] text-[#1d2329] outline-none transition focus:border-[#3f6e4a]"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onSearch("");
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a929a] transition hover:text-[#1d2329]"
          aria-label="Clear"
        >
          <IconClose className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
