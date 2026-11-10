"use client";

import { useEffect } from "react";

const THEME_STORAGE_KEY = "tollab-theme";

export default function ClientScripts() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const theme =
        stored === "light" || stored === "dark"
          ? stored
          : matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      document.documentElement.dataset.theme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
    }

    const adsScript = document.createElement("script");
    adsScript.async = true;
    adsScript.crossOrigin = "anonymous";
    adsScript.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6562202667955501";
    document.head.appendChild(adsScript);

    return () => {
      adsScript.remove();
    };
  }, []);

  return null;
}
