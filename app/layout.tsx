import type { Metadata } from "next";
import Script from "next/script";
import "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://beirutscope.com"),
  title: {
    default: "Beirut Scope",
    template: "%s | Beirut Scope",
  },
  description: "Breaking news and in-depth coverage from Lebanon and the world.",
  openGraph: {
    siteName: "Beirut Scope",
    type: "website",
    locale: "en_US",
    url: "https://beirutscope.com",
    title: "Beirut Scope",
    description: "Breaking news and in-depth coverage from Lebanon and the world.",
    images: [
      {
        url: "https://beirutscope.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beirut Scope",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://beirutscope.com/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body dir="auto" className="min-h-full flex flex-col bg-page text-ink antialiased">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6562202667955501"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
