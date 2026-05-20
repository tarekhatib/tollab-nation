import Link from "next/link";
import BreakingTicker from "@/components/ui/BreakingTicker";
import QuickUpdatesSidebar from "@/components/ui/QuickUpdatesSidebar";
import FeaturedSlideshow from "@/components/ui/FeaturedSlideshow";
import ArticleCard from "@/components/ui/ArticleCard";
import { getBreakingUpdates, getQuickUpdates } from "@/server/queries/updates";
import { getFeaturedArticles, getLatestArticles, getArticlesGroupedByCategory } from "@/server/queries/articles";
import { getCategories } from "@/server/queries/categories";

export const revalidate = 60;

export default async function HomePage() {
  const [breakingUpdates, sidebarUpdates, featuredArticles, latest, categories] = await Promise.all([
    getBreakingUpdates(10),
    getQuickUpdates(2),
    getFeaturedArticles(10),
    getLatestArticles(6),
    getCategories(),
  ]);

  const groupedArticles = await getArticlesGroupedByCategory(
    categories.map((c) => c.slug),
    3
  );

  const categorySections = categories
    .map((cat) => ({ category: cat, articles: groupedArticles[cat.slug] ?? [] }))
    .filter((s) => s.articles.length > 0);

  return (
    <>
      <BreakingTicker updates={breakingUpdates} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">

        {(featuredArticles.length > 0 || sidebarUpdates.length > 0) && (
          <section className="flex flex-col lg:flex-row gap-5 lg:h-110">
            {sidebarUpdates.length > 0 && (
              <div className="order-2 lg:order-1 lg:w-72 xl:w-80 shrink-0">
                <QuickUpdatesSidebar updates={sidebarUpdates} />
              </div>
            )}

            {featuredArticles.length > 0 && (
              <div className="order-1 lg:order-2 flex-1 min-w-0">
                <FeaturedSlideshow articles={featuredArticles} />
              </div>
            )}
          </section>
        )}

        {latest.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-accent rounded-full" />
              <h2 className="text-xl font-bold text-ink">Latest News</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latest.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {categorySections.map(({ category, articles }) => (
            <section key={category.id}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-accent rounded-full" />
                  <h2 className="text-xl font-bold text-ink">{category.name}</h2>
                </div>
                <Link href={`/${category.slug}`} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors">
                  See all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          ))}

        {featuredArticles.length === 0 && latest.length === 0 && (
          <div className="text-center py-24 text-ink-muted">
            <p className="text-lg">No articles published yet.</p>
          </div>
        )}

      </main>
    </>
  );
}
