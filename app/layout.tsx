import { ADSENSE, SITE } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import ClientScripts from "@/components/layout/ClientScripts";
import "@/lib/env";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** The Cap wordmark's typeface (Big Shoulders Display Black) — used for display headings. */
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-big-shoulders",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

const SITE_DESCRIPTION =
  "News for the youngsters. Lebanon and the region, in Arabic and English, from Tollab Nation.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Tollab Nation — News for the youngsters",
    template: "%s | Tollab Nation",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: "Tollab Nation",
    type: "website",
    locale: "en_US",
    url: `${SITE.url}`,
    title: "Tollab Nation",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Tollab Nation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${SITE.url}/og-image.png`],
  },
  applicationName: "Tollab Nation",
  appleWebApp: {
    capable: true,
    title: "Tollab Nation",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  // AdSense site ownership verification.
  other: { "google-adsense-account": ADSENSE.client },
};

export const viewport: Viewport = {
  // The masthead is black in both themes, so the browser/status bar is too.
  themeColor: "#0A0A0A",
  // Draw under the notch/home indicator; the header and tab bar pad with safe-area insets.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full ${archivo.variable} ${bigShoulders.variable} ${plexArabic.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://wsrv.nl" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col bg-page text-ink antialiased">
        {children}
        <ClientScripts />
      </body>
    </html>
  );
}
