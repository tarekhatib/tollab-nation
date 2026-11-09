import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Authors with their published-article count, busiest first (admin + public). */
export async function getAuthorsWithCounts() {
  const authors = await prisma.author.findMany({
    include: { _count: { select: { articles: { where: { isDraft: false } } } } },
    orderBy: { name: "asc" },
  });
  return authors.sort((a, b) => b._count.articles - a._count.articles);
}

/** Minimal list for pickers. */
export async function getAuthorOptions() {
  return prisma.author.findMany({
    select: { id: true, name: true, isVerified: true },
    orderBy: { name: "asc" },
  });
}

export async function getAuthorById(id: number) {
  return prisma.author.findUnique({
    where: { id },
    include: { _count: { select: { articles: true } } },
  });
}

export const getAuthorBySlug = cache(async function getAuthorBySlug(slug: string) {
  return prisma.author.findUnique({
    where: { slug },
    include: { _count: { select: { articles: { where: { isDraft: false } } } } },
  });
});

export async function getArticlesByAuthor(authorId: number, limit = 24) {
  return prisma.article.findMany({
    where: { isDraft: false, authorId },
    include: { category: true },
    omit: { content: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}
