import { getCategories } from "@/server/queries/categories";
import { getAuthorOptions } from "@/server/queries/authors";
import ArticleEditor from "@/components/admin/ArticleEditorWrapper";

export const metadata = { title: "New Article — Admin" };

export default async function NewArticlePage() {
  const [categories, authors] = await Promise.all([getCategories(), getAuthorOptions()]);

  return (
    <div>
      <h1 className="display mb-8 border-b-[3px] border-line-strong pb-5 text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">New article</h1>
      <ArticleEditor categories={categories} authors={authors} />
    </div>
  );
}
