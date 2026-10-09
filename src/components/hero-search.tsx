"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

type HeroMode = "profiles" | "sell" | "buy";

export function HeroSearch({
  labels,
}: {
  labels: {
    tabProfiles: string;
    tabSell: string;
    tabBuy: string;
    placeholderProfiles: string;
    placeholderListings: string;
    searchCta: string;
  };
}) {
  const router = useRouter();
  const [mode, setMode] = useState<HeroMode>("profiles");
  const [query, setQuery] = useState("");

  const tabs: { value: HeroMode; label: string }[] = [
    { value: "profiles", label: labels.tabProfiles },
    { value: "sell", label: labels.tabSell },
    { value: "buy", label: labels.tabBuy },
  ];

  function submit() {
    const q = query.trim();
    const search: Record<string, string> = { mode };
    if (q) search.q = q;
    router.push({ pathname: "/map", query: search });
  }

  return (
    <div className="flex max-w-[600px] flex-col gap-1.5 rounded-2xl border border-[#d9dee2] bg-white p-1.5 shadow-[0_6px_18px_rgba(29,35,41,0.06)] sm:gap-2 sm:p-2 sm:shadow-[0_8px_24px_rgba(29,35,41,0.06)]">
      <div className="grid grid-cols-3 gap-1 sm:flex sm:gap-1 sm:p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setMode(tab.value)}
            className={`rounded-[10px] px-1 py-2.5 text-center text-sm font-medium transition sm:px-3.5 sm:py-2 sm:text-left ${
              mode === tab.value ? "bg-[#eef3ee] text-[#2f5538]" : "text-[#5d6670] hover:bg-[#f6f7f5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={mode === "profiles" ? labels.placeholderProfiles : labels.placeholderListings}
          className="min-w-0 rounded-[10px] border border-[#e3e6e8] bg-[#f6f7f5] px-4 py-3.5 text-base text-[#1d2329] outline-none transition focus:border-[#3f6e4a] sm:min-w-60 sm:flex-1"
        />
        <button
          type="button"
          onClick={submit}
          className="flex-shrink-0 rounded-[10px] bg-[#3f6e4a] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#355d3e]"
        >
          {labels.searchCta}
        </button>
      </div>
    </div>
  );
}
