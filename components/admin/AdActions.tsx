"use client";

import { useTransition } from "react";
import { deleteAd, toggleAdActive } from "@/server/actions/ads";

interface Props {
  id: number;
  isActive: boolean;
}

export default function AdActions({ id, isActive }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => toggleAdActive(id, !isActive));
  }

  function handleDelete() {
    if (!confirm("Delete this ad? This cannot be undone.")) return;
    startTransition(() => deleteAd(id));
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors disabled:opacity-50 ${
          isActive
            ? "bg-ink text-page"
            : "border border-line text-ink-muted"
        }`}
      >
        {isActive ? "● Live" : "Paused"}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-ink-muted transition-colors hover:text-accent-ink disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
