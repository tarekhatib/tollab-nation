"use client";

import Image from "next/image";
import Link from "next/link";
import { BookmarkIcon } from "@/components/article/SaveButton";
import { removeSaved, useSavedStories } from "@/lib/saved";
import { timeAgo } from "@/lib/utils";

export default function SavedList() {
  const stories = useSavedStories();

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-surface text-ink-muted">
          <BookmarkIcon size={26} />
        </span>
        <p className="mt-5 text-lg font-semibold">Nothing saved yet</p>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">
          Tap <span className="font-semibold text-ink">Save</span> on any story to keep it here for later. Saved stories stay on this device.
        </p>
        <Link href="/" className="press mt-6 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-page">
          Browse top stories
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="kicker mb-2 text-ink-muted">
        {stories.length} {stories.length === 1 ? "story" : "stories"}
      </p>
      <ul className="divide-y divide-line">
        {stories.map((s) => {
          const ar = /[؀-ۿ]/.test(s.title);
          return (
            <li key={s.href} className="group relative flex items-start gap-3 py-4">
              <Link href={s.href} className="flex min-w-0 flex-1 gap-4" dir={ar ? "rtl" : "ltr"}>
                <div className="img-zoom relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-surface sm:w-32">
                  {s.image && <Image src={s.image} alt="" fill sizes="128px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`kicker flex items-center gap-2 ${ar ? "justify-end" : ""}`} dir="ltr">
                    <span className="text-accent-ink">{s.category}</span>
                    <span className="size-[3px] rounded-full bg-ink-muted/60" aria-hidden="true" />
                    <span className="text-ink-muted">{timeAgo(new Date(s.publishedAt))}</span>
                  </p>
                  <h2 className="mt-2 text-base font-semibold leading-snug text-pretty sm:text-[1.0625rem]" lang={ar ? "ar" : "en"}>
                    <span className="link-wipe">{s.title}</span>
                  </h2>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => removeSaved(s.href)}
                aria-label="Remove from saved"
                className="press grid size-10 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
