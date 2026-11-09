import type { Metadata } from "next";
import SavedList from "@/components/article/SavedList";

export const metadata: Metadata = {
  title: "Saved",
  description: "Stories you saved to read later.",
  robots: { index: false },
};

export default function SavedPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <header className="mb-6 border-b-[3px] border-line-strong pb-6">
        <p className="kicker animate-rise text-accent-ink">On this device</p>
        <h1 className="animate-rise mt-3 display text-6xl uppercase leading-[0.85] sm:text-8xl" style={{ "--d": 1 } as React.CSSProperties}>
          Saved
        </h1>
        <p dir="rtl" lang="ar" className="animate-rise mt-2 text-xl font-semibold text-ink-muted" style={{ "--d": 2 } as React.CSSProperties}>
          المحفوظات
        </p>
      </header>
      <SavedList />
    </main>
  );
}
