"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuickUpdate } from "@/server/actions/updates";
import { parseWhatsAppUpdate } from "@/lib/parse-update";

export default function UpdateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [raw, setRaw] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [error, setError] = useState("");

  // Live split, so the editor sees exactly what will be published before posting.
  const { textAr, textEn } = parseWhatsAppUpdate(raw);
  const ready = Boolean(textAr && textEn);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!ready) return;
    startTransition(async () => {
      try {
        await createQuickUpdate({ textEn, textAr, isBreaking });
        setRaw("");
        setIsBreaking(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to post update.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-line bg-canvas p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">New Update</h2>

      <div>
        <label htmlFor="update-raw" className="block text-xs font-medium text-ink-soft mb-1">
          Paste from WhatsApp
        </label>
        <textarea
          id="update-raw"
          required
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
          }}
          rows={5}
          dir="auto"
          placeholder={"*الخبر بالعربية*\n🇱🇧‼️\n*The update in English*"}
          className="block w-full resize-y border border-line bg-surface px-3 py-2.5 text-base leading-relaxed text-ink focus:border-ink focus:outline-none sm:text-sm"
        />
        <p className="mt-1 text-xs text-ink-muted">
          Arabic and English lines are split automatically. Asterisks and emojis are removed.
        </p>
      </div>

      {raw.trim() && (
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2" aria-live="polite">
          <div className="bg-canvas p-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">Arabic</p>
            {textAr ? (
              <p dir="rtl" lang="ar" className="mt-1.5 text-right text-sm text-ink">{textAr}</p>
            ) : (
              <p className="mt-1.5 text-sm text-accent">No Arabic line found.</p>
            )}
          </div>
          <div className="bg-canvas p-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">English</p>
            {textEn ? (
              <p className="mt-1.5 text-sm text-ink">{textEn}</p>
            ) : (
              <p className="mt-1.5 text-sm text-accent">No English line found.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setIsBreaking((v) => !v)}
          aria-pressed={isBreaking}
          className={`press inline-flex h-11 items-center justify-center gap-1.5 rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition-colors sm:h-9 sm:justify-start ${
            isBreaking
              ? "border-accent bg-accent text-white"
              : "border-line text-ink-muted hover:border-ink hover:text-ink"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={isBreaking ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round" aria-hidden="true">
            <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
          </svg>
          Breaking
        </button>

        <button
          type="submit"
          disabled={isPending || !ready}
          className="press inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {isPending ? "Posting…" : "Post update"}
        </button>
      </div>

      {error && <p className="text-xs text-accent">{error}</p>}
    </form>
  );
}
