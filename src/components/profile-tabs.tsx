"use client";

import { useState } from "react";

export function ProfileTabs({
  listingsLabel,
  aboutLabel,
  listingsContent,
  aboutContent,
}: {
  listingsLabel: string;
  aboutLabel: string;
  listingsContent: React.ReactNode;
  aboutContent: React.ReactNode;
}) {
  const [tab, setTab] = useState<"listings" | "about">("listings");

  return (
    <div className="flex flex-col gap-4 sm:gap-4">
      <div className="grid grid-cols-2 border-b border-[#e3e6e8] sm:flex sm:gap-1">
        <button
          type="button"
          onClick={() => setTab("listings")}
          className="-mb-px border-b-2 py-3 text-center text-[15px] font-medium sm:px-4 sm:py-3 sm:text-left"
          style={{
            borderColor: tab === "listings" ? "#3f6e4a" : "transparent",
            color: tab === "listings" ? "#1d2329" : "#5d6670",
          }}
        >
          {listingsLabel}
        </button>
        <button
          type="button"
          onClick={() => setTab("about")}
          className="-mb-px border-b-2 py-3 text-center text-[15px] font-medium sm:px-4 sm:py-3 sm:text-left"
          style={{
            borderColor: tab === "about" ? "#3f6e4a" : "transparent",
            color: tab === "about" ? "#1d2329" : "#5d6670",
          }}
        >
          {aboutLabel}
        </button>
      </div>

      {tab === "listings" ? listingsContent : aboutContent}
    </div>
  );
}
