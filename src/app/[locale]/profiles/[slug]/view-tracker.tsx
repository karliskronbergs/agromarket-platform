"use client";

import { useEffect, useRef } from "react";
import { logProfileView } from "./actions";

export function ViewTracker({ profileId }: { profileId: string }) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    logProfileView(profileId);
  }, [profileId]);

  return null;
}
