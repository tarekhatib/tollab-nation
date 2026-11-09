import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ui/ArticleCard";
import { StoryRow } from "@/components/ui/Story";
import VerifiedBadge from "@/components/author/VerifiedBadge";
import { getArticlesByAuthor, getAuthorBySlug } from "@/server/queries/authors";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const authors = await prisma.author.findMany({ select: { slug: true } });
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return {};
  const description = author.bio || `Stories by ${author.name} on Tollab Nation.`;
  return {
    title: author.name,
    description,
    openGraph: { title: `${author.name} | Tollab Nation`, description, type: "profile" },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const articles = await getArticlesByAuthor(author.id);
  const count = author._count.articles;

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <header className="mb-8 flex flex-col gap-6 sm:mb-12 border-b-[3px] border-line-strong pb-10 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="kicker animate-rise flex items-center gap-2 text-accent-ink">
            Author
            {author.isVerified && (
              <span className="inline-flex items-center gap-1 text-ink-muted">
                · <VerifiedBadge size={13} /> Verified
              </span>
            )}
          </p>
          <h1
            className="animate-rise mt-3 display text-6xl uppercase leading-[0.88] sm:text-8xl"
            style={{ "--d": 1 } as React.CSSProperties}
          >
            {author.name}
          </h1>
          {author.bio && (
            <p dir="auto" className="animate-rise mt-4 max-w-2xl text-lg text-ink-soft" style={{ "--d": 2 } as React.CSSProperties}>
              {author.bio}
            </p>
          )}
          <p className="kicker animate-rise mt-4 text-ink-muted" style={{ "--d": 3 } as React.CSSProperties}>
            {count} {count === 1 ? "story" : "stories"} published
            {count > articles.length && <> · latest {articles.length} below</>}
          </p>
        </div>
      </header>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">No published stories yet.</p>
      ) : (
        <>
          {/* Phones: compact rows, like a news app feed */}
          <div className="divide-y divide-line sm:hidden">
            {articles.map((a) => (
              <StoryRow key={a.id} article={a} />
            ))}
          </div>
          <div className="hidden gap-x-8 gap-y-12 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
