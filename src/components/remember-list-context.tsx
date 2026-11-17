"use client";

import { useEffect } from "react";

/**
 * design_handoff_v2/FLUID.md "Back navigation": remembers this page as
 * where a listing/profile's back bar should return to. The map page does
 * the equivalent inline (it's already a client component); this is only
 * needed on server-rendered list pages like Home.
 */
export function RememberListContext() {
  useEffect(() => {
    try {
      sessionStorage.setItem("lastListHref", `${window.location.pathname}${window.location.search}`);
    } catch {}
  }, []);
  return null;
}
