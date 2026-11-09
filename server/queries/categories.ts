import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/types";

export const getCategories = cache(async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
});

export const getCategoryBySlug = cache(async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return prisma.category.findUnique({ where: { slug } });
});

/** Navigation order: busiest sections first. */
export const getNavCategories = cache(async function getNavCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    orderBy: [{ articles: { _count: "desc" } }, { name: "asc" }],
  });
});
