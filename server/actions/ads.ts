"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type AdPayload = {
  imageUrl: string;
  linkUrl: string;
  text: string | null;
  position: number;
  durationDays: number | null; // null = no expiry
  showOnAll: boolean;
  isActive: boolean;
  articleIds: number[];
};

type ActionResult = { error: string } | { success: true };

async function checkConflicts(
  position: number,
  showOnAll: boolean,
  articleIds: number[],
  excludeId?: number
): Promise<string | null> {
  const exclude = excludeId ? { not: excludeId } : undefined;

  if (showOnAll) {
    // A showOnAll ad conflicts with ANY other active ad at this position
    const conflict = await prisma.ad.findFirst({
      where: { id: exclude, isActive: true, position },
    });
    if (conflict) return `Position already occupied by another active ad. Deactivate or delete it first.`;
  } else if (articleIds.length > 0) {
    // Specific articles: check if any targeted article already has an active ad at this position
    const conflict = await prisma.ad.findFirst({
      where: {
        id: exclude,
        isActive: true,
        position,
        OR: [
          { showOnAll: true },
          { articles: { some: { articleId: { in: articleIds } } } },
        ],
      },
    });
    if (conflict) return `One or more selected articles already have an ad at Position ${position}.`;
  }

  return null;
}

function resolveExpiry(durationDays: number | null): Date | null {
  if (!durationDays || durationDays <= 0) return null;
  return new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
}

export async function createAd(payload: AdPayload): Promise<ActionResult> {
  const { articleIds, durationDays, ...data } = payload;

  const conflict = await checkConflicts(payload.position, payload.showOnAll, articleIds);
  if (conflict) return { error: conflict };

  await prisma.ad.create({
    data: {
      ...data,
      expiresAt: resolveExpiry(durationDays),
      articles: {
        create: articleIds.map((articleId) => ({ articleId })),
      },
    },
  });

  revalidatePath("/admin/ads");
  return { success: true };
}

export async function updateAd(id: number, payload: AdPayload): Promise<ActionResult> {
  const { articleIds, durationDays, ...data } = payload;

  const conflict = await checkConflicts(payload.position, payload.showOnAll, articleIds, id);
  if (conflict) return { error: conflict };

  await prisma.$transaction([
    prisma.adOnArticle.deleteMany({ where: { adId: id } }),
    prisma.ad.update({
      where: { id },
      data: {
        ...data,
        expiresAt: resolveExpiry(durationDays),
        articles: {
          create: articleIds.map((articleId) => ({ articleId })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/ads");
  return { success: true };
}

export async function deleteAd(id: number) {
  const ad = await prisma.ad.findUnique({ where: { id } });
  if (!ad) return;

  await prisma.ad.delete({ where: { id } });

  revalidatePath("/admin/ads");
}

export async function toggleAdActive(id: number, isActive: boolean) {
  await prisma.ad.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/ads");
}
