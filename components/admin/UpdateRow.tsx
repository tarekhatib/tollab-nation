"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteQuickUpdate, updateQuickUpdate } from "@/server/actions/updates";

type Update = {
  id: number;
  textAr: string;
  textEn: string;
  isBreaking: boolean;
  createdAt: Date;
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

const fieldClass =
  "w-full px-3 py-2 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-y";
const pillClass =
  "shrink-0 inline-flex h-10 items-center rounded-full px-4 text-sm font-medium border transition-colors disabled:opacity-50";

/** One live update in the admin list: toggle breaking, edit both texts, or delete. */
export default function UpdateRow({ update }: { update: Update }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isBreaking, setIsBreaking] = useState(update.isBreaking);
  const [editing, setEditing] = useState(false);
  const [textAr, setTextAr] = useState(update.textAr);
  const [textEn, setTextEn] = useState(update.textEn);
  const [error, setError] = useState("");

  function run(action: () => Promise<unknown>, onError?: () => void) {
    setError("");
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (err) {
        onError?.();
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function toggleBreaking() {
    const next = !isBreaking;
    setIsBreaking(next); // instant feedback; reverted if the save fails
    run(() => updateQuickUpdate(update.id, { isBreaking: next }), () => setIsBreaking(!next));
  }

  function save() {
    run(async () => {
      await updateQuickUpdate(update.id, { textAr, textEn });
      setEditing(false);
    });
  }

  function cancel() {
    setTextAr(update.textAr);
    setTextEn(update.textEn);
    setEditing(false);
    setError("");
  }

  function remove() {
    if (!confirm("Delete this update?")) return;
    run(() => deleteQuickUpdate(update.id));
  }

  return (
    <li className="px-5 py-4">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={isBreaking}
            aria-label="Breaking"
            onClick={toggleBreaking}
            disabled={isPending}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
              isBreaking ? "bg-accent" : "bg-ink/20"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                isBreaking ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-xs font-semibold uppercase tracking-widest ${isBreaking ? "text-accent" : "text-ink-muted"}`}>
            Breaking
          </span>
        </label>
        <time className="text-xs text-ink-muted">{formatTime(update.createdAt)}</time>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label htmlFor={`ar-${update.id}`} className="block text-xs font-medium text-ink-soft mb-1">Arabic</label>
            <textarea id={`ar-${update.id}`} dir="rtl" lang="ar" rows={2} value={textAr}
              onChange={(e) => setTextAr(e.target.value)} className={`${fieldClass} text-right`} />
          </div>
          <div>
            <label htmlFor={`en-${update.id}`} className="block text-xs font-medium text-ink-soft mb-1">English</label>
            <textarea id={`en-${update.id}`} rows={2} value={textEn}
              onChange={(e) => setTextEn(e.target.value)} className={fieldClass} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={cancel} disabled={isPending}
              className={`${pillClass} text-ink-soft border-line hover:text-ink`}>
              Cancel
            </button>
            <button type="button" onClick={save} disabled={isPending || !textAr.trim() || !textEn.trim()}
              className={`${pillClass} bg-accent text-white border-accent font-semibold hover:bg-accent-hover`}>
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink leading-relaxed text-right" dir="rtl" lang="ar">{update.textAr}</p>
            <p className="text-sm text-ink-soft leading-relaxed mt-1">{update.textEn}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => setEditing(true)} disabled={isPending}
              className={`${pillClass} text-ink-soft border-line hover:border-ink hover:text-ink`}>
              Edit
            </button>
            <button type="button" onClick={remove} disabled={isPending}
              className={`${pillClass} text-ink-soft border-line hover:border-red-400 hover:text-red-500`}>
              Delete
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-accent">{error}</p>}
    </li>
  );
}
