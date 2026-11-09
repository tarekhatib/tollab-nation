"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export type AuthorPayload = {
  name: string;
  slug?: string;
  bio?: string;
  isVerified?: boolean;
};


function clean(payload: AuthorPayload) {
  const name = payload.name.trim();
  if (!name) throw new Error("Full name is required.");
  const slug = (payload.slug?.trim() || slugify(name)).replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("Slug is required.");
  return {
    name,
    slug,
    bio: payload.bio?.trim() ?? "",
    isVerified: payload.isVerified ?? false,
  };
}

function revalidateAuthors(slug?: string) {
  revalidatePath("/admin/authors");
  revalidatePath("/admin/articles");
  // Bylines appear on article pages; refresh everything that can show one.
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/author/${slug}`);
}

export async function createAuthor(payload: AuthorPayload) {
  await requireAdmin();
  const data = clean(payload);
  const taken = await prisma.author.findUnique({ where: { slug: data.slug } });
  if (taken) throw new Error(`Slug "${data.slug}" is already used by ${taken.name}.`);
  const author = await prisma.author.create({ data });
  revalidateAuthors(author.slug);
  return author;
}

export async function updateAuthor(id: number, payload: AuthorPayload) {
  await requireAdmin();
  const data = clean(payload);
  const taken = await prisma.author.findUnique({ where: { slug: data.slug } });
  if (taken && taken.id !== id) throw new Error(`Slug "${data.slug}" is already used by ${taken.name}.`);
  const before = await prisma.author.findUnique({ where: { id }, select: { slug: true } });
  const author = await prisma.author.update({ where: { id }, data });
  revalidateAuthors(author.slug);
  if (before && before.slug !== author.slug) revalidatePath(`/author/${before.slug}`);
  return author;
}

/** Articles keep existing; their byline falls back to Tollab Nation. */
export async function deleteAuthor(id: number) {
  await requireAdmin();
  const author = await prisma.author.delete({ where: { id } });
  revalidateAuthors(author.slug);
}
