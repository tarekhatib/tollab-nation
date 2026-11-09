"use client";

import { useTransition } from "react";
import { deleteArticle, updateArticle } from "@/server/actions/articles";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
  isFeatured: boolean;
}

export default function ArticleActions({ id, isFeatured }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteArticle(id);
      router.refresh();
    });
  }

  function handleToggleFeatured() {
    startTransition(async () => {
      await updateArticle(id, { isFeatured: !isFeatured });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleFeatured}
        disabled={isPending}
        className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors disabled:opacity-50 ${
          isFeatured
            ? "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20"
            : "bg-surface text-ink-soft border border-line hover:text-ink"
        }`}
      >
        {isFeatured ? "Featured" : "Set featured"}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-8 items-center rounded-full px-3 text-xs font-medium text-ink-soft border border-line hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
