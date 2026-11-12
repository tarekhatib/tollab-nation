"use client";

/**
 * The one place the app imports glisse (iOS-style liquid glass), so it can be
 * swapped or removed in a single file. Mobile only: callers hide it from md/lg up.
 *
 * Note: glisse's stylesheet is unlayered, so it beats Tailwind utilities. Size or
 * round its parts with inline `style` or its `--lg-*` variables, not classes.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export { Button as GlassButton, TabBar as GlassTabBar, type TabBarItem as GlassTabItem } from "glisse";

/** Shared tab-bar styling: brand-red selection, tabs sized to fit `extra` px of neighbours. */
export function tabBarStyle(tabs: number, extra: number): React.CSSProperties {
  return {
    // 16px gutters each side, the bar's 4px insets, and whatever sits beside it.
    "--lg-tab-width": `min(72px, calc((100vw - 32px - 8px - ${extra}px) / ${tabs}))`,
    "--lg-tab-selected": "var(--accent-ink)",
  } as React.CSSProperties;
}

/** The round glass button that sits beside a tab bar (60px, the bar's height). */
export const SIDE_BUTTON: React.CSSProperties = { width: 60, height: 60, borderRadius: 30 };

type Tone = "light" | "dark";

/** Light or dark for one element's own background, or null if it's see-through. */
function toneOf(el: Element): Tone | null {
  // Photos: dark glass with white labels reads best over images, as on iOS.
  if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement || el instanceof HTMLCanvasElement) return "dark";
  const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?/);
  if (!m) return null;
  if (m[4] !== undefined && Number(m[4]) < 0.5) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => {
    const c = Number(v) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "light" : "dark";
}

/** What sits behind the dock: sampled at three points along its middle, majority wins. */
function toneBehind(dock: HTMLElement): Tone {
  const box = dock.getBoundingClientRect();
  const y = box.top + box.height / 2;
  let light = 0;
  let dark = 0;
  for (const f of [0.15, 0.5, 0.85]) {
    for (const el of document.elementsFromPoint(box.left + box.width * f, y)) {
      if (dock.contains(el)) continue;
      const tone = toneOf(el);
      if (!tone) continue;
      if (tone === "light") light++;
      else dark++;
      break;
    }
  }
  return light > dark ? "light" : "dark";
}

/**
 * Fixed container for the phone tab bars. Clear (unfrosted) glass, and like
 * iOS it flips between dark and light glass to suit whatever is behind it,
 * so a light bar never sits on the black footer or a dark one on a white page.
 */
export function GlassDock({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dock = ref.current;
    if (!dock) return;
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const tone = toneBehind(dock);
        if (dock.dataset.theme !== tone) dock.dataset.theme = tone;
      });
    };
    check();
    // Images and late content shift what's behind after the first paint.
    const late = setTimeout(check, 600);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(late);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);

  return (
    <div ref={ref} data-theme="dark" className={`glass-dock ${className}`}>
      {children}
    </div>
  );
}
