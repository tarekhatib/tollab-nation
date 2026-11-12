"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_FEATURED, type FeaturedSlot } from "@/lib/featured";

/**
 * Shown when someone tries to feature a 6th story. Instead of a dead-end "no",
 * it lists the current featured stories so one can be swapped out in a click.
 */
export default function FeaturedLimitDialog({
  featured,
  onSwap,
  onClose,
}: {
  /** null = closed. */
  featured: FeaturedSlot[] | null;
  /** Unfeature `id` and feature the story the admin was trying to star. */
  onSwap: (id: number) => Promise<void>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (featured && !d.open) d.showModal();
    if (!featured && d.open) d.close();
  }, [featured]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Click on the backdrop closes it.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="featured-limit-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] border border-line bg-canvas p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-accent">Featured is full</p>
        <h2 id="featured-limit-title" className="mt-2 text-lg font-semibold">
          {MAX_FEATURED} of {MAX_FEATURED} featured slots are taken
        </h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          The homepage carousel shows up to {MAX_FEATURED} stories. Swap one out to feature this article.
        </p>

        <ul className="mt-5 divide-y divide-line border-y border-line">
          {featured?.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-3">
              <p className="min-w-0 flex-1 truncate text-sm" dir="auto">
                {f.title}
                {f.isDraft && <span className="ml-2 text-xs text-ink-muted">(draft)</span>}
              </p>
              <button
                type="button"
                disabled={busy !== null}
                onClick={async () => {
                  setBusy(f.id);
                  try {
                    await onSwap(f.id);
                  } finally {
                    setBusy(null);
                  }
                }}
                className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {busy === f.id ? "Swapping…" : "Swap out"}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-page"
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}
