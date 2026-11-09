"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * iPhone/iPad Safari, not opened from the home screen. Safari can clear a site's
 * storage after about a week without a visit; installed web apps are exempt.
 */
function isIosBrowserTab() {
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const installed =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  return ios && !installed;
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-label="Share" role="img" className="inline -mt-0.5">
      <path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

/** Explains where saved stories live, plus an iPhone tip so they aren't wiped. */
export default function SavedNote() {
  const showIosTip = useSyncExternalStore(noop, isIosBrowserTab, () => false);

  return (
    <aside className="mt-8 border-l-2 border-red bg-surface px-4 py-4 text-sm leading-relaxed text-ink-muted">
      <p>
        <span className="font-semibold text-ink">Saved on this device only.</span>{" "}No account needed, but your list
        won&rsquo;t follow you to another phone or browser, and clearing your browsing data removes it.
      </p>
      {showIosTip && (
        <p className="mt-3">
          <span className="font-semibold text-ink">On iPhone:</span> tap <ShareIcon /> Share, then{" "}
          <span className="font-semibold text-ink">Add to Home Screen</span>. Safari can clear saved stories after a
          week without a visit; the home-screen app keeps them. Saves don&rsquo;t carry over from Safari, so save
          stories again inside the app.
        </p>
      )}
    </aside>
  );
}
