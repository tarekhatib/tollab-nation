"use client";

import { useEffect } from "react";
import { ADSENSE } from "@/lib/site";

/** Loads the AdSense library once, on public pages only (never in /admin). */
export default function AdSenseScript() {
  useEffect(() => {
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE.client}`;
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = src;
    document.head.appendChild(script);
  }, []);

  return null;
}
