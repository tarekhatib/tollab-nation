import { notFound } from "next/navigation";
import AuthorForm from "@/components/admin/AuthorForm";
import { getAuthorById } from "@/server/queries/authors";

export const metadata = { title: "Edit Author — Admin" };

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await getAuthorById(Number(id));
  if (!author) notFound();

  return (
    <div>
      <h1 className="display mb-2 text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">Edit author</h1>
      <p className="text-sm text-ink-soft mb-8">
        {author._count.articles} {author._count.articles === 1 ? "article" : "articles"} credited (including drafts)
      </p>
      <AuthorForm
        author={{
          id: author.id,
          name: author.name,
          slug: author.slug,
          bio: author.bio,
          isVerified: author.isVerified,
          articleCount: author._count.articles,
        }}
      />
    </div>
  );
}
