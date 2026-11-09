import type { MetadataRoute } from "next";

/** Installable web app: "Add to Home Screen" opens Tollab Nation full-screen, like a native app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Tollab Nation",
    short_name: "Tollab",
    description: "News for the youngsters. Lebanon and the region, in Arabic and English.",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0A0A0A",
    theme_color: "#0A0A0A",
    lang: "en",
    dir: "auto",
    categories: ["news", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Live desk", short_name: "Live", url: "/updates", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Saved stories", short_name: "Saved", url: "/saved", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Search", url: "/search", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
