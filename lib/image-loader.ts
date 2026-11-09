/**
 * Image loader for next/image.
 *
 * Covers come from Vercel Blob, Cloudinary and third-party news sites, and were
 * previously served at full size (`unoptimized`). This loader resizes and
 * re-encodes them at the edge for free:
 *   - Cloudinary URLs  → Cloudinary's own transforms (f_auto, q_auto, width)
 *   - Other remote URLs → wsrv.nl, a free open-source image CDN (WebP/AVIF,
 *     resized, cached on Cloudflare). If wsrv cannot fetch an image it
 *     redirects to the original, so nothing breaks.
 *   - Local files (/assets, SVG) → served as-is.
 *
 * Set NEXT_PUBLIC_IMAGE_PROXY=off to bypass the proxy.
 */
type LoaderArgs = { src: string; width: number; quality?: number };

const PROXY_OFF = process.env.NEXT_PUBLIC_IMAGE_PROXY === "off";

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (!src) return src;

  if (src.startsWith("/") || src.startsWith("data:") || src.endsWith(".svg")) {
    return src.startsWith("/") ? `${src}${src.includes("?") ? "&" : "?"}w=${width}` : src;
  }

  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/f_auto,q_${quality ?? "auto"},c_limit,w_${width}/`);
  }

  if (PROXY_OFF || !/^https?:\/\//.test(src)) return src;

  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 72),
    output: "webp",
    we: "",
    default: src,
  });
  return `https://wsrv.nl/?${params.toString()}`;
}

/** Use the same pipeline for raw <img> tags (article body images). */
export function optimizedSrc(src: string, width: number) {
  return imageLoader({ src, width });
}

export function optimizedSrcSet(src: string, widths = [480, 768, 1080, 1440]) {
  return widths.map((w) => `${imageLoader({ src, width: w })} ${w}w`).join(", ");
}
