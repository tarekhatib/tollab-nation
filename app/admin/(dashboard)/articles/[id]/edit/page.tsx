import { getCategories } from "@/server/queries/categories";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getAuthorOptions } from "@/server/queries/authors";
import ArticleEditor from "@/components/admin/ArticleEditorWrapper";

export const metadata = { title: "Edit Article — Admin" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories, authors] = await Promise.all([
    prisma.article.findUnique({ where: { id: Number(id) } }),
    getCategories(),
    getAuthorOptions(),
  ]);

  if (!article) notFound();

  return (
    <div>
      <h1 className="display mb-8 border-b-[3px] border-line-strong pb-5 text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">Edit article</h1>
      <ArticleEditor
        categories={categories}
        authors={authors}
        article={{
          id: article.id,
          title: article.title,
          titleAr: article.titleAr,
          slug: article.slug,
          content: article.content as object,
          categoryId: article.categoryId,
          coverImage: article.coverImage,
          isFeatured: article.isFeatured,
          isDraft: article.isDraft,
          authorId: article.authorId,
        }}
      />
    </div>
  );
}
