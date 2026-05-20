import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ui/ArticleCard";
import { getCategoryBySlug } from "@/server/queries/categories";
import { getArticlesByCategory } from "@/server/queries/articles";

export const revalidate = 60;

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const defaultImage = "https://beirutscope.com/og-image.png";

  const pageUrl = `https://beirutscope.com/${category.slug}`;

  return {
    title: category.name,
    description: `Latest ${category.name} news from Beirut Scope.`,
    openGraph: {
      title: `${category.name} | Beirut Scope`,
      description: `Latest ${category.name} news from Beirut Scope.`,
      type: "website",
      url: pageUrl,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: `${category.name} | Beirut Scope`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [defaultImage],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const [category, articles] = await Promise.all([
    getCategoryBySlug(slug),
    getArticlesByCategory(slug, 24),
  ]);

  if (!category) notFound();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Category header */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-line">
        <div className="w-1 h-10 bg-accent rounded-full" />
        <div>
          <h1 className="text-3xl font-bold text-ink">{category.name}</h1>
          <p className="text-sm text-ink-muted mt-1">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <p className="text-ink-muted text-center py-20">
          No articles in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

    </main>
  );
}
