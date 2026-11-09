"use client";

import { useEffect } from "react";
import { Mark } from "@/components/brand/Logo";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <Mark className="h-20 w-auto text-ink" />
      <p className="kicker mt-10 text-accent-ink">Something went wrong</p>
      <h1 className="mt-3 display text-5xl uppercase sm:text-6xl">We couldn&rsquo;t load this page.</h1>
      <p className="mt-4 max-w-md text-ink-soft">Try again in a moment.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-page transition-colors hover:bg-accent hover:text-white"
      >
        Try again
      </button>
    </main>
  );
}
