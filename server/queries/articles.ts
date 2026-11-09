import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { ArticleWithCategory, ArticleListItem } from "@/types";

const articleInclude = { category: true } as const;
/** Lists never need the article body; skipping it keeps queries and pages light. */
const listOmit = { content: true } as const;

export async function getArticles(options?: {
  categorySlug?: string;
  limit?: number;
  featured?: boolean;
}): Promise<ArticleListItem[]> {
  return prisma.article.findMany({
    where: {
      isDraft: false,
      ...(options?.categorySlug && { category: { slug: options.categorySlug } }),
      ...(options?.featured !== undefined && { isFeatured: options.featured }),
    },
    include: articleInclude,
    omit: listOmit,
    orderBy: { publishedAt: "desc" },
    take: options?.limit,
  });
}

export async function getLatestArticles(limit = 10): Promise<ArticleListItem[]> {
  return prisma.article.findMany({
    where: { isDraft: false },
    include: articleInclude,
    omit: listOmit,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getArticlesByCategory(categorySlug: string, limit = 6): Promise<ArticleListItem[]> {
  return prisma.article.findMany({
    where: { isDraft: false, category: { slug: categorySlug } },
    include: articleInclude,
    omit: listOmit,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/** Cached per request: metadata and the page share one query. */
export const getArticleBySlug = cache(async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug, isDraft: false },
    include: { ...articleInclude, author: true },
  });
});

export async function getFeaturedArticles(limit = 10): Promise<ArticleListItem[]> {
  return prisma.article.findMany({
    where: { isDraft: false, isFeatured: true },
    include: articleInclude,
    omit: listOmit,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getArticlesGroupedByCategory(
  categorySlugs: string[],
  perCategory = 3
): Promise<Record<string, ArticleListItem[]>> {
  if (categorySlugs.length === 0) return {};

  const articles = await prisma.article.findMany({
    where: {
      isDraft: false,
      category: { slug: { in: categorySlugs } },
    },
    include: articleInclude,
    omit: listOmit,
    orderBy: { publishedAt: "desc" },
    take: categorySlugs.length * perCategory * 4,
  });

  const grouped: Record<string, ArticleListItem[]> = {};
  for (const article of articles) {
    const slug = article.category.slug;
    if (!grouped[slug]) grouped[slug] = [];
    if (grouped[slug].length < perCategory) grouped[slug].push(article);
  }
  return grouped;
}

export async function getRelatedArticles(categorySlug: string, excludeSlug: string, limit = 3): Promise<ArticleListItem[]> {
  return prisma.article.findMany({
    where: { isDraft: false, category: { slug: categorySlug }, NOT: { slug: excludeSlug } },
    include: articleInclude,
    omit: listOmit,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function searchArticles(query: string, limit = 20): Promise<ArticleWithCategory[]> {
  const pattern = `%${query}%`;
  const rows = await prisma.$queryRaw<Array<{
    id: number; title: string; titleAr: string; slug: string; content: Prisma.JsonValue;
    coverImage: string | null; isFeatured: boolean; isDraft: boolean;
    clicks: number; views: number; publishedAt: Date; updatedAt: Date; categoryId: number; authorId: number | null;
    cat_id: number; cat_name: string; cat_slug: string; cat_createdAt: Date; cat_updatedAt: Date;
  }>>`
    SELECT a.*,
           c.id          AS cat_id,
           c.name        AS cat_name,
           c.slug        AS cat_slug,
           c."createdAt" AS "cat_createdAt",
           c."updatedAt" AS "cat_updatedAt"
    FROM   "Article" a
    JOIN   "Category" c ON a."categoryId" = c.id
    WHERE  a."isDraft" = false
      AND (
            a.title         ILIKE ${pattern}
         OR c.name          ILIKE ${pattern}
         OR a.content::text ILIKE ${pattern}
          )
    ORDER BY a."publishedAt" DESC
    LIMIT  ${limit}
  `;

  return rows.map((r) => ({
    id: r.id, title: r.title, titleAr: r.titleAr, slug: r.slug, content: r.content,
    coverImage: r.coverImage, isFeatured: r.isFeatured, isDraft: r.isDraft,
    clicks: r.clicks, views: r.views, publishedAt: r.publishedAt,
    updatedAt: r.updatedAt, categoryId: r.categoryId, authorId: r.authorId,
    category: { id: r.cat_id, name: r.cat_name, slug: r.cat_slug, createdAt: r.cat_createdAt, updatedAt: r.cat_updatedAt },
  }));
}

/**
 * Most read among recent stories. Ranks the latest `pool` articles by views so
 * the list stays fresh instead of being dominated by old all-time hits.
 */
export async function getMostRead(limit = 5, pool = 40): Promise<ArticleListItem[]> {
  const recent = await prisma.article.findMany({
    where: { isDraft: false },
    include: articleInclude,
    omit: listOmit,
    orderBy: { publishedAt: "desc" },
    take: pool,
  });
  return recent.sort((a, b) => b.views - a.views).slice(0, limit);
}

export async function incrementArticleViews(id: number): Promise<void> {
  await prisma.article.update({ where: { id }, data: { views: { increment: 1 } } });
}
