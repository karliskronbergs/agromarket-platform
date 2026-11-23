"use client";

import { useState } from "react";
import { IconClose, IconSearch } from "@/components/icons";

export function MapSearchBar({
  value,
  placeholder,
  onSearch,
  onFocus,
}: {
  value?: string;
  placeholder: string;
  onSearch: (query: string) => void;
  onFocus?: () => void;
}) {
  const [draft, setDraft] = useState(value ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(draft.trim());
      }}
      className="flex w-full flex-1 items-center gap-2 rounded-[14px] bg-black/[0.06] py-0 pl-[14px] pr-1.5"
    >
      <IconSearch className="h-[18px] w-[18px] flex-shrink-0 text-[#5d6670]" />
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent px-1 py-3 text-base text-[#1d2329] outline-none"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onSearch("");
          }}
          className="flex-shrink-0 px-1.5 text-[#8a929a] transition hover:text-[#1d2329]"
          aria-label="Clear"
        >
          <IconClose className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
