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
    <div className="flex max-w-[600px] flex-col gap-2 rounded-2xl border border-[#d9dee2] bg-white p-2 shadow-[0_8px_24px_rgba(29,35,41,0.06)]">
      <div className="flex gap-1 p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setMode(tab.value)}
            className={`rounded-[10px] px-3.5 py-2 text-sm font-medium transition ${
              mode === tab.value ? "bg-[#eef3ee] text-[#2f5538]" : "text-[#5d6670] hover:bg-[#f6f7f5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={mode === "profiles" ? labels.placeholderProfiles : labels.placeholderListings}
          className="min-w-60 flex-1 rounded-[10px] border border-[#e3e6e8] bg-[#f6f7f5] px-4 py-3.5 text-base text-[#1d2329] outline-none transition focus:border-[#3f6e4a]"
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
