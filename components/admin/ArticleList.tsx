"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setArticleFeatured } from "@/server/actions/articles";
import FeaturedLimitDialog from "@/components/admin/FeaturedLimitDialog";
import type { FeaturedSlot } from "@/lib/featured";

export type AdminArticleRow = {
  id: number;
  title: string;
  titleAr: string | null;
  category: string;
  author: string | null;
  publishedAt: string;
  isDraft: boolean;
  isFeatured: boolean;
  views: number;
  clicks: number;
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "featured", label: "Featured" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

const PAGE = 30;
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

function FeaturedStar({ id, on }: { id: number; on: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // Optimistic: flip instantly, server catches up.
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  // Set when the carousel is full: the stories currently holding the slots.
  const [full, setFull] = useState<FeaturedSlot[] | null>(null);
  const value = optimistic ?? on;

  async function feature(next: boolean) {
    const res = await setArticleFeatured(id, next);
    if (!res.ok) {
      setOptimistic(null);
      setFull(res.featured);
      return;
    }
    router.refresh();
  }

  return (
    <>
    <FeaturedLimitDialog
      featured={full}
      onClose={() => setFull(null)}
      onSwap={async (oldId) => {
        await setArticleFeatured(oldId, false);
        setFull(null);
        setOptimistic(true);
        await feature(true);
      }}
    />
    <button
      type="button"
      disabled={pending}
      aria-pressed={value}
      aria-label={value ? "Remove from featured" : "Mark as featured"}
      onClick={() => {
        setOptimistic(!value);
        start(async () => {
          try {
            await feature(!value);
          } catch {
            setOptimistic(null);
          }
        });
      }}
      className={`press grid size-11 shrink-0 place-items-center rounded-full transition-colors ${
        value ? "text-red" : "text-ink-muted hover:text-ink"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={value ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true">
        <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
      </svg>
    </button>
    </>
  );
}

export default function ArticleList({ articles }: { articles: AdminArticleRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);

  const counts = useMemo(
    () => ({
      all: articles.length,
      published: articles.filter((a) => !a.isDraft).length,
      draft: articles.filter((a) => a.isDraft).length,
      featured: articles.filter((a) => a.isFeatured).length,
    }),
    [articles]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (filter === "published" && a.isDraft) return false;
      if (filter === "draft" && !a.isDraft) return false;
      if (filter === "featured" && !a.isFeatured) return false;
      if (!q) return true;
      return [a.title, a.titleAr ?? "", a.category, a.author ?? ""].some((t) => t.toLowerCase().includes(q));
    });
  }, [articles, query, filter]);

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="relative">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
            placeholder="Search titles, sections, authors…"
            aria-label="Search articles"
            enterKeyHint="search"
            className="h-12 w-full rounded-full border border-line bg-canvas pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter articles">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => { setFilter(f.key); setLimit(PAGE); }}
              className={`press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
                filter === f.key ? "border-ink bg-ink text-page" : "border-line text-ink-soft hover:text-ink"
              }`}
            >
              {f.label}
              <span className={`tabular-nums ${filter === f.key ? "opacity-70" : "text-ink-muted"}`}>{counts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border border-line bg-canvas">
        {visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-ink-soft">
              {articles.length === 0 ? "No articles yet." : "Nothing matches that search."}
            </p>
            {articles.length === 0 && (
              <Link href="/admin/articles/new" className="mt-3 inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white">
                Write the first article
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {visible.slice(0, limit).map((a) => (
              <li key={a.id} className="flex items-center gap-1 pr-2">
                <Link
                  href={`/admin/articles/${a.id}/edit`}
                  className="group min-w-0 flex-1 px-4 py-3.5 transition-colors active:bg-ink/5 sm:px-5"
                >
                  <p className="flex items-center gap-2">
                    {a.isDraft && (
                      <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft">Draft</span>
                    )}
                    <span className="truncate text-[0.95rem] font-semibold text-ink group-hover:underline">{a.title}</span>
                  </p>
                  {a.titleAr && (
                    <p dir="rtl" className="mt-0.5 truncate text-sm text-ink-soft">{a.titleAr}</p>
                  )}
                  <p className="mt-1 truncate text-xs text-ink-muted">
                    {a.category} · {a.author ?? "Tollab Nation"} · {dateFmt.format(new Date(a.publishedAt))}
                    <span className="hidden sm:inline"> · {a.views} views · {a.clicks} clicks</span>
                  </p>
                </Link>
                <FeaturedStar id={a.id} on={a.isFeatured} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {visible.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + PAGE)}
          className="press mt-4 flex h-11 w-full items-center justify-center rounded-full border border-line text-sm font-semibold text-ink-soft hover:text-ink"
        >
          Show more ({visible.length - limit} left)
        </button>
      )}
    </div>
  );
}
