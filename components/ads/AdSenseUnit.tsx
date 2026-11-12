"use client";

import { useEffect, useRef } from "react";
import { ADSENSE } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * One responsive Google display ad. Used only where no direct sponsor fills the slot.
 * Takes no space until Google fills it (see .ad-slot in globals.css).
 */
export default function AdSenseUnit({ slot = ADSENSE.articleSlot }: { slot?: string }) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    const ins = ref.current;
    // Each <ins> may be pushed once; dev double-effects would otherwise throw.
    if (!ins || ins.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or a not-yet-approved site: leave the slot empty.
    }
  }, []);

  return (
    <div className="ad-slot">
      <p className="ad-label kicker text-ink-muted mb-2">Advertisement</p>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE.client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
