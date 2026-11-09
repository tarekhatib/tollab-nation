import type { Metadata } from "next";
import ArticleCard from "@/components/ui/ArticleCard";
import { StoryRow } from "@/components/ui/Story";
import SearchInput from "@/components/ui/SearchInput";
import { searchArticles } from "@/server/queries/articles";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query.length >= 2 ? await searchArticles(query) : [];

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <h1 className="kicker mb-4 text-accent-ink">Search</h1>

      <SearchInput defaultValue={query} />

      {query.length >= 2 && (
        <div className="mt-8">
          <p className="kicker mb-8 text-ink-muted">
            {results.length === 0
              ? `No results for "${query}"`
              : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
          </p>
          {results.length > 0 && (
            <>
              <div className="divide-y divide-line sm:hidden">
                {results.map((article) => (
                  <StoryRow key={article.id} article={article} />
                ))}
              </div>
              <div className="hidden gap-x-8 gap-y-12 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                {results.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {query.length === 0 && (
        <p className="mt-6 text-ink-muted">Search headlines, sections and story text, in Arabic or English.</p>
      )}

      {query.length < 2 && query.length > 0 && (
        <p className="mt-8 text-sm text-ink-muted">Type at least 2 characters to search.</p>
      )}
    </main>
  );
}
