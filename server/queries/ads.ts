import { prisma } from "@/lib/prisma";

export async function getAds() {
  return prisma.ad.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      articles: {
        include: { article: { select: { id: true, title: true } } },
      },
    },
  });
}

export async function getAdById(id: number) {
  return prisma.ad.findUnique({
    where: { id },
    include: {
      articles: { select: { articleId: true } },
    },
  });
}

/**
 * Returns at most one active ad per position (1, 2, 3, 4) for the given article.
 * Specific-article assignments take priority over showOnAll.
 */
export async function getAdsForArticle(articleId: number) {
  const now = new Date();
  const ads = await prisma.ad.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      AND: [
        {
          OR: [
            { showOnAll: true },
            { articles: { some: { articleId } } },
          ],
        },
      ],
    },
    include: {
      articles: { select: { articleId: true } },
    },
  });

  // Deduplicate: 1 ad per position. Specific assignment beats showOnAll.
  const byPosition = new Map<number, typeof ads[0]>();
  for (const ad of ads) {
    if (ad.showOnAll) {
      if (!byPosition.has(ad.position)) byPosition.set(ad.position, ad);
    }
  }
  for (const ad of ads) {
    if (!ad.showOnAll) {
      byPosition.set(ad.position, ad); // overrides showOnAll
    }
  }

  return byPosition; // Map<position, Ad>
}
