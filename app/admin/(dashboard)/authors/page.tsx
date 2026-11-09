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
            {authors.length} authors · {total} published articles credited
          </p>
        </div>
        <Link
          href="/admin/authors/new"
          className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-full hover:bg-accent-hover transition-colors"
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
              <li key={a.id} className="flex items-center gap-4 px-4 sm:px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <span className="truncate">{a.name}</span>
                    {a.isVerified && <VerifiedBadge size={15} />}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    /author/{a.slug}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-ink tabular-nums leading-none">{a._count.articles}</p>
                  <p className="text-[11px] text-ink-muted mt-1">{a._count.articles === 1 ? "article" : "articles"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/author/${a.slug}`}
                    target="_blank"
                    className="hidden h-8 sm:inline-flex items-center rounded-full px-3 text-xs font-medium text-ink-soft border border-line hover:text-ink transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/authors/${a.id}/edit`}
                    className="inline-flex h-8 items-center rounded-full px-3 text-xs font-medium text-ink-soft border border-line hover:text-accent hover:border-accent transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
