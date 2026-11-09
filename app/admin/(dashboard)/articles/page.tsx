import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleList from "@/components/admin/ArticleList";

export const metadata = { title: "Articles — Admin" };

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      titleAr: true,
      publishedAt: true,
      isDraft: true,
      isFeatured: true,
      views: true,
      clicks: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });

  const rows = articles.map((a) => ({
    id: a.id,
    title: a.title,
    titleAr: a.titleAr,
    category: a.category.name,
    author: a.author?.name ?? null,
    publishedAt: a.publishedAt.toISOString(),
    isDraft: a.isDraft,
    isFeatured: a.isFeatured,
    views: a.views,
    clicks: a.clicks,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-line-strong pb-5">
        <div>
          <h1 className="display text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">Articles</h1>
          <p className="mt-3 text-sm text-ink-muted">
            Tap a story to edit it. The star puts it on the front page.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="hidden h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover lg:inline-flex"
        >
          + New article
        </Link>
      </div>
      <ArticleList articles={rows} />
    </div>
  );
}
