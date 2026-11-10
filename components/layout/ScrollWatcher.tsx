"use client";

import { useEffect } from "react";

/**
 * Sets attributes on <html> that CSS uses for motion:
 *  - data-scroll="down|up" → header hides while reading, returns on scroll up
 *  - data-scrolled          → header gets its hairline once the page moves
 *  - data-navigated         → enables the page-enter animation after the first
 *                             in-app link click (never delays the first paint)
 * One passive listener, throttled to animation frames. Renders nothing.
 */
export default function ScrollWatcher() {
  useEffect(() => {
    const root = document.documentElement;
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (y < 120) {
        delete root.dataset.scroll;
      } else if (Math.abs(delta) > 3) {
        root.dataset.scroll = delta > 0 ? "down" : "up";
      }
      if (y > 4) root.dataset.scrolled = "";
      else delete root.dataset.scrolled;
      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (href && href.startsWith("/") && !href.startsWith("//")) {
        root.dataset.navigated = "";
        delete root.dataset.scroll;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return null;
}
