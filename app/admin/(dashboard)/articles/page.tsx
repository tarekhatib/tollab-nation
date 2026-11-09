import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import ArticleActions from "@/components/admin/ArticleActions";

async function getAllArticles() {
  return prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    include: { category: true, author: { select: { name: true } } },
  });
}

export const metadata = { title: "Articles — Admin" };

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-line-strong pb-5">
        <div>
          <h1 className="display text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">Articles</h1>
          <p className="mt-3 text-sm text-ink-muted">{articles.length} total</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-full hover:bg-accent-hover transition-colors"
        >
          + New article
        </Link>
      </div>

      <div className="bg-canvas border border-line overflow-hidden">
        {articles.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-ink-soft text-sm">No articles yet.</p>
            <Link href="/admin/articles/new" className="text-accent text-sm hover:underline mt-2 inline-block">
              Create your first article
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {articles.map((article) => (
              <li key={article.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-ink truncate">{article.title}</p>
                    {article.isDraft && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-ink/10 text-ink-soft rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {article.category.name} · {article.author?.name ?? "No author"} · {formatDate(article.publishedAt)} · {article.clicks} clicks · {article.views} views
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ArticleActions id={article.id} isFeatured={article.isFeatured} />
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
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
