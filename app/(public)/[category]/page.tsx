import { SITE } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ui/ArticleCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { LeadStory, StoryCard, StoryRow } from "@/components/ui/Story";
import PartnerBand from "@/components/ui/PartnerBand";
import { getCategoryBySlug, getCategories } from "@/server/queries/categories";
import { getArticlesByCategory } from "@/server/queries/articles";

export const revalidate = 60;

/** Pre-render every section at build; new ones render on first visit, then cache (ISR). */
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const defaultImage = `${SITE.url}/og-image.png`;

  const pageUrl = `${SITE.url}/${category.slug}`;

  return {
    title: category.name,
    description: `Latest ${category.name} stories from Tollab Nation.`,
    openGraph: {
      title: `${category.name} | Tollab Nation`,
      description: `Latest ${category.name} stories from Tollab Nation.`,
      type: "website",
      url: pageUrl,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: `${category.name} | Tollab Nation`,
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

  const [lead, ...rest] = articles;
  const top = rest.slice(0, 2);
  const grid = rest.slice(2);

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mb-10 border-b-[3px] border-line-strong pb-6">
        <p className="kicker animate-rise text-accent-ink">Section</p>
        <h1
          className="animate-rise mt-3 display text-7xl uppercase leading-[0.85] sm:text-9xl"
          style={{ "--d": 1 } as React.CSSProperties}
        >
          {category.name}
        </h1>
        <p className="animate-rise mt-4 text-ink-muted" style={{ "--d": 2 } as React.CSSProperties}>
          The latest {articles.length} {articles.length === 1 ? "story" : "stories"} from Tollab Nation.
        </p>
      </header>

      {!lead ? (
        <p className="py-20 text-center text-ink-muted">No stories in this section yet.</p>
      ) : (
        <>
          <section className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <LeadStory article={lead} />
            </div>
            {top.length > 0 && (
              <div className="grid gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:col-span-4 lg:grid-cols-1 lg:border-l lg:border-line lg:pl-8">
                {top.map((a) => (
                  <StoryCard key={a.id} article={a} size="sm" sizes="(max-width: 1024px) 50vw, 30vw" />
                ))}
              </div>
            )}
          </section>

          {grid.length > 0 && (
            <section className="mt-16">
              <SectionHeading title="More stories" />
              {/* Phones: compact rows, like a news app feed */}
              <div className="divide-y divide-line sm:hidden">
                {grid.map((a) => (
                  <StoryRow key={a.id} article={a} />
                ))}
              </div>
              <div className="hidden gap-x-8 gap-y-12 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
      <PartnerBand />
    </main>
  );
}
