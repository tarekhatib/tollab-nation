"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteQuickUpdate } from "@/server/actions/updates";

export default function UpdateActions({ id }: { id: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this update?")) return;
    startTransition(async () => {
      await deleteQuickUpdate(id);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="shrink-0 inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-ink-soft border border-line hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      Delete
    </button>
  );
}
