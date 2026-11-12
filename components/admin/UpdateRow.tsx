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

// Fixed time zone so the server render and the browser agree (no hydration flicker).
const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Beirut",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const iconBtn =
  "press grid size-11 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-40";
const pill =
  "press inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-50";
const field =
  "block w-full resize-none border border-line bg-surface px-3 py-2.5 text-base leading-relaxed text-ink [field-sizing:content] focus:border-ink focus:outline-none sm:text-sm";

/** One live update in the admin list: toggle breaking, edit both texts, or delete. */
export default function UpdateRow({ update }: { update: Update }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isBreaking, setIsBreaking] = useState(update.isBreaking);
  // What the row shows; updated on save so there is no flash of the old text.
  const [saved, setSaved] = useState({ textAr: update.textAr, textEn: update.textEn });
  const [draft, setDraft] = useState(saved);
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const [error, setError] = useState("");

  function run(action: () => Promise<unknown>, onDone?: () => void, onError?: () => void) {
    setError("");
    startTransition(async () => {
      try {
        await action();
        onDone?.();
        router.refresh();
      } catch (err) {
        onError?.();
        setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      }
    });
  }

  function toggleBreaking() {
    const next = !isBreaking;
    setIsBreaking(next); // instant; reverted if the save fails
    run(() => updateQuickUpdate(update.id, { isBreaking: next }), undefined, () => setIsBreaking(!next));
  }

  function startEdit() {
    setDraft(saved);
    setError("");
    setMode("edit");
  }

  const canSave = Boolean(draft.textAr.trim() && draft.textEn.trim());
  function save() {
    if (!canSave || isPending) return;
    run(() => updateQuickUpdate(update.id, draft), () => {
      setSaved(draft);
      setMode("view");
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setMode("view");
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
  }

  return (
    <li
      className={`border-l-[3px] px-4 py-3 transition-colors sm:px-5 ${
        isBreaking ? "border-accent bg-accent/[0.04]" : "border-transparent"
      }`}
    >
      {/* Top line: when + breaking on the left, actions on the right. */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleBreaking}
          disabled={isPending || mode === "confirm-delete"}
          aria-pressed={isBreaking}
          title={isBreaking ? "Remove from breaking" : "Mark as breaking"}
          className={`press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-60 ${
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
        <time dateTime={new Date(update.createdAt).toISOString()} className="min-w-0 truncate text-xs text-ink-muted tabular-nums">
          {timeFmt.format(new Date(update.createdAt))}
        </time>

        <div className="ml-auto flex shrink-0 items-center">
          {mode === "confirm-delete" ? (
            <>
              <span className="mr-2 hidden text-sm text-ink-soft sm:inline">Delete this update?</span>
              <button type="button" onClick={() => setMode("view")} disabled={isPending}
                className="press h-9 rounded-full px-3 text-sm font-medium text-ink-soft hover:text-ink">
                Cancel
              </button>
              <button type="button" disabled={isPending}
                onClick={() => run(() => deleteQuickUpdate(update.id))}
                className="press h-9 rounded-full bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </>
          ) : mode === "view" ? (
            <>
              <button type="button" onClick={startEdit} disabled={isPending} aria-label="Edit update" title="Edit" className={iconBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </svg>
              </button>
              <button type="button" onClick={() => setMode("confirm-delete")} disabled={isPending} aria-label="Delete update" title="Delete"
                className={`${iconBtn} hover:bg-red-500/10 hover:text-red-500`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {mode === "edit" ? (
        <div className="mt-2 space-y-3" onKeyDown={onKeyDown}>
          <div>
            <label htmlFor={`ar-${update.id}`} className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Arabic</label>
            <textarea id={`ar-${update.id}`} dir="rtl" lang="ar" rows={2} autoFocus value={draft.textAr}
              onChange={(e) => setDraft((d) => ({ ...d, textAr: e.target.value }))} className={`${field} text-right`} />
          </div>
          <div>
            <label htmlFor={`en-${update.id}`} className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-muted">English</label>
            <textarea id={`en-${update.id}`} rows={2} value={draft.textEn}
              onChange={(e) => setDraft((d) => ({ ...d, textEn: e.target.value }))} className={field} />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
            <span className="mr-auto hidden text-xs text-ink-muted sm:inline">⌘/Ctrl + Enter to save · Esc to cancel</span>
            <button type="button" onClick={() => setMode("view")} disabled={isPending}
              className={`${pill} border border-line text-ink-soft hover:text-ink`}>
              Cancel
            </button>
            <button type="button" onClick={save} disabled={isPending || !canSave}
              className={`${pill} bg-accent text-white hover:bg-accent-hover`}>
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-1.5 space-y-1">
          <p dir="rtl" lang="ar" className="text-right text-[0.95rem] leading-relaxed text-ink">{saved.textAr}</p>
          <p className="text-sm leading-relaxed text-ink-soft">{saved.textEn}</p>
        </div>
      )}

      {error && <p role="alert" className="mt-2 text-xs font-medium text-accent">{error}</p>}
    </li>
  );
}
