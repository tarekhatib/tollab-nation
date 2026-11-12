"use client";

/**
 * The one place the app imports glisse (iOS-style liquid glass), so it can be
 * swapped or removed in a single file. Mobile only: callers hide it from md/lg up.
 *
 * Note: glisse's stylesheet is unlayered, so it beats Tailwind utilities. Size or
 * round its parts with inline `style` or its `--lg-*` variables, not classes.
 */
import { useEffect, useRef } from "react";
// glisse also injects this from JS after load; importing it here puts it in the
// server-rendered CSS too, so the bars are styled on first paint.
import "glisse/styles.css";
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

/** Relative luminance (0–1) of an sRGB colour given as 0–255 channels. */
function luminance(r: number, g: number, b: number): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}
// Above this, the glass goes light with dark labels (about sRGB 67% grey).
const LIGHT = 0.4;

/* ── Photos: a tiny brightness map per image, so the glass matches the part of
   the photo actually under it, as iOS does. The visible <img> can't be read
   (no CORS mode), so a 48px copy is fetched with CORS (wsrv.nl and Cloudinary
   allow it) and kept. Unreadable images fall back to dark glass. */
const GRID = 12;
const photoMaps = new Map<string, Float32Array | null | "pending">();
const onPhotoMap = new Set<() => void>();

function tinyCopy(src: string): string {
  try {
    const url = new URL(src, location.href);
    if (url.hostname === "wsrv.nl") {
      url.searchParams.set("w", "48");
      return url.toString();
    }
  } catch {
    return src;
  }
  return src.replace(/\/upload\/([^/]*?)w_\d+/, "/upload/$1w_48");
}

function photoMap(img: HTMLImageElement): Float32Array | null | undefined {
  const key = img.currentSrc || img.src;
  const known = photoMaps.get(key);
  if (known === "pending") return undefined;
  if (known !== undefined) return known;
  photoMaps.set(key, "pending");
  const probe = new Image();
  probe.crossOrigin = "anonymous";
  probe.decoding = "async";
  const done = (map: Float32Array | null) => {
    photoMaps.set(key, map);
    onPhotoMap.forEach((fn) => fn());
  };
  probe.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = GRID;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(probe, 0, 0, GRID, GRID);
      const px = ctx.getImageData(0, 0, GRID, GRID).data;
      const map = new Float32Array(GRID * GRID);
      for (let i = 0; i < map.length; i++) map[i] = luminance(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]);
      done(map);
    } catch {
      done(null); // tainted: the host doesn't allow reading it
    }
  };
  probe.onerror = () => done(null);
  probe.src = tinyCopy(key);
  return undefined;
}

/** Tone of the photo at a viewport point, allowing for object-fit: cover cropping. */
function photoTone(img: HTMLImageElement, x: number, y: number): Tone | null {
  // Not loaded yet: what shows is the placeholder behind it.
  if (!img.complete || !img.naturalWidth) return null;
  const map = photoMap(img);
  if (map === null) return "dark";
  if (map === undefined) return "dark"; // first sight; rechecked when the map is ready
  const box = img.getBoundingClientRect();
  const cover = getComputedStyle(img).objectFit === "cover";
  const scale = cover
    ? Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight)
    : Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const u = (x - box.left - (box.width - w) / 2) / w;
  const v = (y - box.top - (box.height - h) / 2) / h;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  // Average the cell and its neighbours, so one bright speck doesn't flip the glass.
  const cx = Math.min(GRID - 1, Math.floor(u * GRID));
  const cy = Math.min(GRID - 1, Math.floor(v * GRID));
  let sum = 0;
  let n = 0;
  for (let j = Math.max(0, cy - 1); j <= Math.min(GRID - 1, cy + 1); j++) {
    for (let i = Math.max(0, cx - 1); i <= Math.min(GRID - 1, cx + 1); i++) {
      sum += map[j * GRID + i];
      n++;
    }
  }
  return sum / n > LIGHT ? "light" : "dark";
}

/** Light or dark for what one element paints at (x, y), or null if it's see-through there. */
function toneOf(el: Element, x: number, y: number): Tone | null {
  if (el instanceof HTMLImageElement) return photoTone(el, x, y);
  if (el instanceof HTMLVideoElement || el instanceof HTMLCanvasElement) return "dark";
  const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?/);
  if (!m) return null;
  if (m[4] !== undefined && Number(m[4]) < 0.5) return null;
  return luminance(Number(m[1]), Number(m[2]), Number(m[3])) > LIGHT ? "light" : "dark";
}

/** What sits behind the dock: sampled at three points along its middle, majority wins. */
function toneBehind(dock: HTMLElement): Tone {
  const box = dock.getBoundingClientRect();
  const y = box.top + box.height / 2;
  let light = 0;
  let dark = 0;
  for (const f of [0.15, 0.5, 0.85]) {
    const x = box.left + box.width * f;
    for (const el of document.elementsFromPoint(x, y)) {
      if (dock.contains(el)) continue;
      const tone = toneOf(el, x, y);
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
    // Images and late content shift what's behind after the first paint;
    // a photo's brightness map arrives a moment after it's first seen.
    const late = setTimeout(check, 600);
    onPhotoMap.add(check);
    const onLoad = (e: Event) => e.target instanceof HTMLImageElement && check();
    document.addEventListener("load", onLoad, true);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(late);
      onPhotoMap.delete(check);
      document.removeEventListener("load", onLoad, true);
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
