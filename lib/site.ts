/**
 * Public base URL for canonical links, sitemaps and share images.
 * NEXT_PUBLIC_SITE_URL wins; on Vercel it falls back to the project's production domain.
 */
function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "https://tollabn.com";
}

export const SITE = {
  name: "Tollab Nation",
  nameAr: "طلاب نيشن",
  tagline: "News for the youngsters",
  url: siteUrl(),
  instagram: "https://www.instagram.com/tollabn",
  instagramHandle: "@tollabn",
  whatsappChannel: "https://whatsapp.com/channel/0029VaDyADbHgZWhuhqMcf3S",
  email: "tollabcontact@gmail.com",
  whatsappDirect: "https://wa.me/96176334381",
  phone: "+961 76 334 381",
} as const;

/** Google AdSense. The publisher ID also appears in public/ads.txt; keep them in sync. */
export const ADSENSE = {
  client: "ca-pub-2732587372734594",
  /** "Article" responsive display unit: fills article ad slots that have no direct sponsor. */
  articleSlot: "1665213027",
} as const;
