"use client";

import Link from "next/link";
import { BookmarkIcon } from "@/components/article/SaveButton";
import { useSavedStories } from "@/lib/saved";

/** Desktop header shortcut to Saved (phones use the tab bar). */
export default function SavedLink() {
  const count = useSavedStories().length;
  return (
    <Link
      href="/saved"
      aria-label={count ? `Saved stories (${count})` : "Saved stories"}
      className="relative hidden size-10 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 md:grid"
    >
      <BookmarkIcon size={18} />
      {count > 0 && (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red px-1 text-[0.625rem] font-bold leading-none text-white tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
