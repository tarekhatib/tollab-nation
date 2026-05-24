import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ArticleContent from "@/components/article/ArticleContent";
import ArticleAd from "@/components/article/ArticleAd";
import ShareButtons from "@/components/article/ShareButtons";
import ViewTracker from "@/components/article/ViewTracker";
import CategoryBadge from "@/components/ui/CategoryBadge";
import ArticleCard from "@/components/ui/ArticleCard";
import { getArticleBySlug, getRelatedArticles } from "@/server/queries/articles";
import { getAdsForArticle } from "@/server/queries/ads";
import { formatDate, readingTime } from "@/lib/utils";

export const revalidate = 60;

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const resolveImageUrl = (url: string) =>
    url.startsWith("http") ? url : new URL(url, "https://beirutscope.com").toString();

  const isUsableOgImage = (url: string) =>
    !url.includes("encrypted-tbn0.gstatic.com");

  const rawCover = article.coverImage && isUsableOgImage(article.coverImage)
    ? article.coverImage
    : null;

  const images = rawCover
    ? [{ url: resolveImageUrl(rawCover), width: 1200, height: 630, alt: article.title }]
    : [{ url: "https://beirutscope.com/og-image.png", width: 1200, height: 630, alt: article.title }];

  const displayTitle = article.titleAr || article.title;
  const pageUrl = `https://beirutscope.com/${article.category.slug}/${article.slug}`;

  return {
    title: displayTitle,
    description: `${displayTitle} — ${article.category.name}`,
    openGraph: {
      title: displayTitle,
      description: `${displayTitle} — ${article.category.name}`,
      type: "article",
      url: pageUrl,
      publishedTime: article.publishedAt.toISOString(),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description: `${displayTitle} — ${article.category.name}`,
      images: [images[0].url],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  const [article, related] = await Promise.all([
    getArticleBySlug(slug),
    getRelatedArticles(categorySlug, slug, 3),
  ]);

  if (!article) notFound();
  if (article.category.slug !== categorySlug) notFound();

  const adsByPosition = await getAdsForArticle(article.id);
  const ad1 = adsByPosition.get(1);
  const ad2 = adsByPosition.get(2);
  const ad3 = adsByPosition.get(3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    image: article.coverImage ? [article.coverImage] : undefined,
    articleSection: article.category.name,
    publisher: {
      "@type": "Organization",
      name: "Beirut Scope",
      url: "https://beirutscope.com",
    },
  };

  return (
    <>
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-ink-muted mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/${article.category.slug}`} className="hover:text-accent transition-colors">
          {article.category.name}
        </Link>
        <span>/</span>
        <span className="text-ink-soft truncate max-w-50">{article.title}</span>
      </nav>

      {/* Position 1 — above title */}
      {ad1 && <ArticleAd imageUrl={ad1.imageUrl} linkUrl={ad1.linkUrl} text={ad1.text} />}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <CategoryBadge name={article.category.name} slug={article.category.slug} />
        <time className="text-xs text-ink-muted">{formatDate(article.publishedAt)}</time>
        <span className="text-xs text-ink-muted">·</span>
        <span className="text-xs text-ink-muted">{readingTime(article.content)} min read</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-2" dir="rtl">
        {article.titleAr || article.title}
      </h1>
      {article.titleAr && (
        <p className="text-base text-ink-muted mb-6">{article.title}</p>
      )}

      {article.coverImage && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}

      {/* Share buttons below cover image — visual separator before content */}
      <div className="mb-8">
        <ShareButtons title={article.title} />
      </div>

      {/* Position 2 — before content */}
      {ad2 && <ArticleAd imageUrl={ad2.imageUrl} linkUrl={ad2.linkUrl} text={ad2.text} />}

      <div className="h-px bg-line mb-8" />

      <div id="article-body">
        {(() => {
          type ContentNode = Parameters<typeof ArticleContent>[0]["content"];
          const doc = article.content as { type: string; content?: unknown[] };
          const nodes = doc.content ?? [];

          if (!ad3 || nodes.length < 4) {
            return <ArticleContent content={article.content as ContentNode} />;
          }

          // Position 3 — split content at midpoint
          const mid = Math.ceil(nodes.length / 2);
          const firstHalf = { type: "doc", content: nodes.slice(0, mid) } as ContentNode;
          const secondHalf = { type: "doc", content: nodes.slice(mid) } as ContentNode;

          return (
            <>
              <ArticleContent content={firstHalf} />
              <ArticleAd imageUrl={ad3.imageUrl} linkUrl={ad3.linkUrl} text={ad3.text} />
              <ArticleContent content={secondHalf} />
            </>
          );
        })()}
      </div>
      <ViewTracker slug={article.slug} />

      <div className="mt-12 pt-6 border-t border-line flex items-center justify-between">
        <Link
          href={`/${article.category.slug}`}
          className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
        >
          ← More in {article.category.name}
        </Link>
        {article.updatedAt > article.publishedAt && (
          <span className="text-xs text-ink-muted">
            Updated {formatDate(article.updatedAt)}
          </span>
        )}
      </div>

    </main>

    {related.length > 0 && (
      <section className={`mx-auto px-4 sm:px-6 lg:px-8 pb-16 ${related.length >= 3 ? "max-w-6xl" : "max-w-3xl"}`}>
        <div className="border-t border-line pt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="text-xl font-bold text-ink">More in {article.category.name}</h2>
          </div>
          <div className={`grid gap-5 ${related.length === 1 ? "grid-cols-1" : related.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>
    )}
    </>
  );
}
