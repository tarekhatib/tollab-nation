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
    <form onSubmit={handleSubmit} className="bg-canvas border border-line p-5 space-y-4">
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
          rows={5}
          dir="auto"
          placeholder={"*الخبر بالعربية*\n🇱🇧‼️\n*The update in English*"}
          className="w-full px-3 py-2 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-y"
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

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={isBreaking}
            onClick={() => setIsBreaking((v) => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              isBreaking ? "bg-accent" : "bg-ink/20"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                isBreaking ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-sm text-ink">Breaking</span>
        </label>

        <button
          type="submit"
          disabled={isPending || !ready}
          className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-full hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? "Posting…" : "Post update"}
        </button>
      </div>

      {error && <p className="text-xs text-accent">{error}</p>}
    </form>
  );
}
