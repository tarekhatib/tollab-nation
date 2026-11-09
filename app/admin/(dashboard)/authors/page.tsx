import Link from "next/link";
import VerifiedBadge from "@/components/author/VerifiedBadge";
import { getAuthorsWithCounts } from "@/server/queries/authors";

export const metadata = { title: "Authors — Admin" };

export default async function AuthorsPage() {
  const authors = await getAuthorsWithCounts();
  const total = authors.reduce((n, a) => n + a._count.articles, 0);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-line-strong pb-5">
        <div>
          <h1 className="display text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">Authors</h1>
          <p className="mt-3 text-sm text-ink-muted">
            {authors.length} authors · {total} articles credited · tap one to edit
          </p>
        </div>
        <Link
          href="/admin/authors/new"
          className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          + New author
        </Link>
      </div>

      <div className="bg-canvas border border-line overflow-hidden">
        {authors.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-ink-soft text-sm">No authors yet.</p>
            <Link href="/admin/authors/new" className="text-accent text-sm hover:underline mt-2 inline-block">
              Add the first author
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {authors.map((a) => (
              <li key={a.id} className="flex items-center">
                <Link
                  href={`/admin/authors/${a.id}/edit`}
                  className="group flex min-w-0 flex-1 items-center gap-4 px-4 py-4 transition-colors active:bg-ink/5 sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-ink">
                      <span className="truncate group-hover:underline">{a.name}</span>
                      {a.isVerified && <VerifiedBadge size={15} />}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">/author/{a.slug}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="display text-2xl leading-none text-ink tabular-nums">{a._count.articles}</p>
                    <p className="mt-1 text-[11px] text-ink-muted">{a._count.articles === 1 ? "article" : "articles"}</p>
                  </div>
                  <svg className="shrink-0 text-ink-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
