"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { isManagedImage, uploadImage } from "@/lib/storage";
import { MAX_FEATURED, type FeaturedSlot } from "@/lib/featured";

type ArticlePayload = {
  title: string;
  titleAr?: string;
  slug?: string;
  content: object;
  categoryId: number;
  coverImage?: string;
  isFeatured?: boolean;
  isDraft?: boolean;
  publishedAt?: Date;
  /** null clears the byline (shows "Tollab Nation"). */
  authorId?: number | null;
};

async function fetchAndStoreRemote(url: string, folder: "covers" | "content") {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (!type.startsWith("image/")) return null; // not an image (e.g. an HTML page)
    const ab = await res.arrayBuffer();
    if (ab.byteLength > 15 * 1024 * 1024) return null;
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").pop() || `image-${Date.now()}`;
    return await uploadImage(ab, folder, name, type);
  } catch {
    return null;
  }
}

/** Every featured story except `excludeId`, newest first. Drafts count: they hold a slot. */
async function featuredExcept(excludeId?: number): Promise<FeaturedSlot[]> {
  const rows = await prisma.article.findMany({
    where: { isFeatured: true, ...(excludeId !== undefined && { id: { not: excludeId } }) },
    select: { id: true, title: true, titleAr: true, isDraft: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map((r) => ({ id: r.id, title: r.titleAr || r.title, isDraft: r.isDraft }));
}

/** Throws when featuring one more story would pass the carousel limit. */
async function assertFeaturedRoom(excludeId?: number) {
  if ((await featuredExcept(excludeId)).length >= MAX_FEATURED) {
    throw new Error(`Only ${MAX_FEATURED} articles can be featured at once. Unfeature one first.`);
  }
}

/** For the editor's Featured switch: the other featured stories, to check for room. */
export async function getFeaturedSlots(excludeId?: number): Promise<FeaturedSlot[]> {
  await requireAdmin();
  return featuredExcept(excludeId);
}

/**
 * Star / unstar from the admin list. Returns the current featured stories instead
 * of throwing when the carousel is full (thrown messages are hidden in production).
 */
export async function setArticleFeatured(
  id: number,
  value: boolean
): Promise<{ ok: true } | { ok: false; featured: FeaturedSlot[] }> {
  await requireAdmin();
  if (value) {
    const others = await featuredExcept(id);
    if (others.length >= MAX_FEATURED) return { ok: false, featured: others };
  }
  const article = await prisma.article.update({
    where: { id },
    data: { isFeatured: value },
    include: { category: true },
  });
  revalidatePath("/");
  revalidatePath(`/${article.category.slug}/${article.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  return { ok: true };
}

export async function createArticle(payload: ArticlePayload) {
  await requireAdmin();
  const slug = payload.slug?.trim() || slugify(payload.title);

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(`Slug "${slug}" is already in use. Choose a different one.`);
  }
  if (payload.isFeatured) await assertFeaturedRoom();

  // Store remote cover images in managed cloud storage when configured.
  let coverToStore = payload.coverImage ?? null;
  if (typeof payload.coverImage === "string" && payload.coverImage.startsWith("http") && !isManagedImage(payload.coverImage)) {
    const stored = await fetchAndStoreRemote(payload.coverImage, "covers");
    if (stored) coverToStore = stored;
  }

  const article = await prisma.article.create({
    data: {
      title: payload.title,
      titleAr: payload.titleAr ?? "",
      slug,
      content: payload.content,
      categoryId: payload.categoryId,
      coverImage: coverToStore ?? null,
      isFeatured: payload.isFeatured ?? false,
      isDraft: payload.isDraft ?? false,
      publishedAt: payload.publishedAt ?? new Date(),
      authorId: payload.authorId ?? null,
    },
    include: { category: true, author: true },
  });

  revalidatePath("/");
  revalidatePath(`/${article.category.slug}/${article.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/authors");
  if (article.author) revalidatePath(`/author/${article.author.slug}`);

  return article;
}

export async function updateArticle(
  id: number,
  payload: Partial<ArticlePayload>
) {
  await requireAdmin();
  const current = await prisma.article.findUnique({ where: { id } });
  if (!current) throw new Error("Article not found.");
  if (payload.isFeatured && !current.isFeatured) await assertFeaturedRoom(id);

  const data: Record<string, unknown> = {};

  if (payload.title !== undefined) data.title = payload.title;
  if (payload.titleAr !== undefined) data.titleAr = payload.titleAr;
  if (payload.content !== undefined) data.content = payload.content;
  if (payload.categoryId !== undefined) data.categoryId = payload.categoryId;
  if (payload.isFeatured !== undefined) data.isFeatured = payload.isFeatured;
  if (payload.isDraft !== undefined) data.isDraft = payload.isDraft;
  if (payload.publishedAt !== undefined) data.publishedAt = payload.publishedAt;
  if (payload.authorId !== undefined) data.authorId = payload.authorId;

  if (payload.coverImage !== undefined) {
    // Store remote cover images in managed cloud storage when configured.
    let coverToStore = payload.coverImage || null;
    if (typeof payload.coverImage === "string" && payload.coverImage.startsWith("http") && !isManagedImage(payload.coverImage)) {
      const stored = await fetchAndStoreRemote(payload.coverImage, "covers");
      if (stored) coverToStore = stored;
    }

    data.coverImage = coverToStore;
  }

  if (payload.slug !== undefined) {
    const newSlug = payload.slug.trim();
    const existing = await prisma.article.findUnique({ where: { slug: newSlug } });
    if (existing && existing.id !== id) {
      throw new Error(`Slug "${newSlug}" is already in use. Choose a different one.`);
    }
    data.slug = newSlug;
  }

  const article = await prisma.article.update({
    where: { id },
    data,
    include: { category: true, author: true },
  });

  revalidatePath("/");
  revalidatePath(`/${article.category.slug}/${article.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/authors");
  if (article.author) revalidatePath(`/author/${article.author.slug}`);

  return article;
}

export async function deleteArticle(id: number) {
  await requireAdmin();
  await prisma.article.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
}
