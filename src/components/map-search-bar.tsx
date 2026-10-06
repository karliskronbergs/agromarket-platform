"use client";

import { useState } from "react";
import { IconSearch, IconClose } from "@/components/icons";

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
      className="relative w-full sm:max-w-sm"
    >
      <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7566]" />
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-[#e7e2d8] bg-white py-3 pl-11 pr-10 text-sm text-[#2b2a24] shadow-sm outline-none transition focus:border-[#3f6b3f] focus:ring-2 focus:ring-[#3f6b3f]/15"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onSearch("");
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a7566] transition hover:text-[#2b2a24]"
          aria-label="Clear"
        >
          <IconClose className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
