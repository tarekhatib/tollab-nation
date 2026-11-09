"use client";

import { toggleSaved, useSavedStories, type SavedStory } from "@/lib/saved";

export function BookmarkIcon({ filled = false, size = 18 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3.5h12a.5.5 0 0 1 .5.5v16.6a.4.4 0 0 1-.64.32L12 16.5l-5.86 4.42a.4.4 0 0 1-.64-.32V4a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

/** Save-for-later toggle. Saved stories live on the device and show under the Saved tab. */
export default function SaveButton({ story, className = "" }: { story: Omit<SavedStory, "savedAt">; className?: string }) {
  const saved = useSavedStories().some((s) => s.href === story.href);

  return (
    <button
      type="button"
      onClick={() => toggleSaved(story)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save for later"}
      className={`press inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
        saved ? "border-ink bg-ink text-page" : "border-line text-ink-soft hover:border-ink hover:text-ink"
      } ${className}`}
    >
      <span className={saved ? "animate-pop" : ""}>
        <BookmarkIcon filled={saved} size={16} />
      </span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
