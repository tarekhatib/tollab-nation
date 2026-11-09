"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuickUpdate } from "@/server/actions/updates";

export default function UpdateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [textEn, setTextEn] = useState("");
  const [textAr, setTextAr] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await createQuickUpdate({ textEn, textAr, isBreaking });
        setTextEn("");
        setTextAr("");
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
        <label className="block text-xs font-medium text-ink-soft mb-1">Arabic</label>
        <textarea
          required
          value={textAr}
          onChange={(e) => setTextAr(e.target.value)}
          rows={2}
          dir="rtl"
          placeholder="النص بالعربية…"
          className="w-full px-3 py-2 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none text-right"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">English</label>
        <textarea
          required
          value={textEn}
          onChange={(e) => setTextEn(e.target.value)}
          rows={2}
          placeholder="Update text in English…"
          className="w-full px-3 py-2 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>

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
          disabled={isPending}
          className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-full hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? "Posting…" : "Post update"}
        </button>
      </div>

      {error && <p className="text-xs text-accent">{error}</p>}
    </form>
  );
}
