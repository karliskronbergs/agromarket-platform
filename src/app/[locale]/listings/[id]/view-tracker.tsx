"use client";

import { useEffect, useRef } from "react";
import { logListingView } from "./actions";

export function ViewTracker({ listingId }: { listingId: string }) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    logListingView(listingId);
  }, [listingId]);

  return null;
}
