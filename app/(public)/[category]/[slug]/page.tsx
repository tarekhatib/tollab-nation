import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ArticleContent from "@/components/article/ArticleContent";
import ArticleAd from "@/components/article/ArticleAd";
import ShareButtons from "@/components/article/ShareButtons";
import SaveButton from "@/components/article/SaveButton";
import ViewTracker from "@/components/article/ViewTracker";
import SectionHeading from "@/components/ui/SectionHeading";
import VerifiedBadge from "@/components/author/VerifiedBadge";
import { ArrowIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { SITE } from "@/lib/site";
import ArticleCard from "@/components/ui/ArticleCard";
import { getArticleBySlug, getRelatedArticles } from "@/server/queries/articles";
import { getAdsForArticle } from "@/server/queries/ads";
import { formatDate, readingTime } from "@/lib/utils";

export const revalidate = 60;

/**
 * Empty list = no article is rendered at build time (keeps builds fast and light on the
 * database). Each article renders on its first visit, then is served from cache (ISR).
 */
export async function generateStaticParams() {
  return [];
}

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const resolveImageUrl = (url: string) =>
    url.startsWith("http") ? url : new URL(url, "https://tollabnation.com").toString();

  const isUsableOgImage = (url: string) =>
    !url.includes("encrypted-tbn0.gstatic.com");

  const rawCover = article.coverImage && isUsableOgImage(article.coverImage)
    ? article.coverImage
    : null;

  const images = rawCover
    ? [{ url: resolveImageUrl(rawCover), width: 1200, height: 630, alt: article.title }]
    : [{ url: "https://tollabnation.com/og-image.png", width: 1200, height: 630, alt: article.title }];

  const displayTitle = article.titleAr || article.title;
  const pageUrl = `https://tollabnation.com/${article.category.slug}/${article.slug}`;

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
    headline: article.titleAr || article.title,
    alternativeHeadline: article.titleAr ? article.title : undefined,
    inLanguage: article.titleAr ? "ar" : "en",
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    image: article.coverImage ? [article.coverImage] : undefined,
    articleSection: article.category.name,
    author: article.author
      ? { "@type": "Person", name: article.author.name, url: `https://tollabnation.com/author/${article.author.slug}` }
      : { "@type": "Organization", name: "Tollab Nation", url: "https://tollabnation.com" },
    publisher: {
      "@type": "Organization",
      name: "Tollab Nation",
      url: "https://tollabnation.com",
    },
  };

  const ar = Boolean(article.titleAr);
  const minutes = readingTime(article.content);
  const wasUpdated = article.updatedAt.getTime() - article.publishedAt.getTime() > 60 * 60 * 1000;

  return (
    <>
      {/* Reading progress — CSS scroll-driven, no JS */}
      <div aria-hidden="true" className="read-progress fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-red" />

      <main id="main" className="pb-16 pt-8 sm:pt-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <header className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="kicker animate-rise flex items-center gap-2 text-ink-muted">
            <Link href="/" className="transition-colors hover:text-ink">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${article.category.slug}`} className="text-accent-ink transition-colors hover:text-ink">
              {article.category.name}
            </Link>
          </nav>

          {/* Position 1 — above title */}
          {ad1 && <ArticleAd imageUrl={ad1.imageUrl} linkUrl={ad1.linkUrl} text={ad1.text} />}

          <h1
            dir={ar ? "rtl" : "ltr"}
            lang={ar ? "ar" : "en"}
            className="animate-rise mt-6 text-[2rem] font-bold leading-[1.3] tracking-tight text-balance sm:text-5xl sm:leading-[1.25]"
            style={{ "--d": 1 } as React.CSSProperties}
          >
            {article.titleAr || article.title}
          </h1>
          {ar && (
            <p
              className="animate-rise mt-4 text-lg leading-snug text-ink-soft sm:text-xl"
              style={{ "--d": 2 } as React.CSSProperties}
            >
              {article.title}
            </p>
          )}

          <div
            className="animate-rise mt-8 flex flex-col gap-5 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ "--d": 3 } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[0.95rem] font-semibold leading-tight">
                  <span className="font-normal text-ink-muted">By</span>
                  {article.author ? (
                    <>
                      <Link href={`/author/${article.author.slug}`} className="link-wipe">{article.author.name}</Link>
                      {article.author.isVerified && <VerifiedBadge size={15} />}
                    </>
                  ) : (
                    "Tollab Nation"
                  )}
                </p>
                <p className="kicker mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
                  <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">{minutes} min read</span>
                </p>
              </div>
            </div>
              <SaveButton
                className="shrink-0"
                story={{
                  href: `/${article.category.slug}/${article.slug}`,
                  title: article.titleAr || article.title,
                  titleEn: article.titleAr ? article.title : null,
                  image: article.coverImage,
                  category: article.category.name,
                  publishedAt: article.publishedAt.toISOString(),
                }}
              />
            </div>
            <ShareButtons title={article.titleAr || article.title} />
          </div>
        </header>

        {article.coverImage && (
          <figure className="mx-auto mt-8 max-w-5xl sm:px-6">
            <div className="relative aspect-[16/9] overflow-hidden bg-surface">
              <Image
                src={article.coverImage}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="animate-settle object-cover"
                priority
                fetchPriority="high"
              />
            </div>
          </figure>
        )}

        <div className="mx-auto mt-10 max-w-[44rem] px-4 sm:px-6">
          {/* Position 2 — before content */}
          {ad2 && <ArticleAd imageUrl={ad2.imageUrl} linkUrl={ad2.linkUrl} text={ad2.text} />}

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

          <div className="mt-12 flex flex-col gap-6 border-t-[3px] border-line-strong pt-6 sm:flex-row sm:items-center sm:justify-between">
            <ShareButtons title={article.titleAr || article.title} />
            {wasUpdated && (
              <p className="kicker text-ink-muted">Updated {formatDate(article.updatedAt)}</p>
            )}
          </div>

          <a
            href={SITE.whatsappChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 flex items-center gap-4 bg-ink p-5 text-page transition-colors hover:bg-accent hover:text-white sm:p-6"
            data-reveal
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#25D366] text-white transition-transform duration-500 ease-(--ease-spring) group-hover:rotate-[-12deg]">
              <WhatsAppIcon size={22} />
            </span>
            <span className="flex-1">
              <span className="block font-wide font-semibold">Get stories like this on WhatsApp</span>
              <span className="block text-sm opacity-70">Follow the Tollab Nation channel. Free.</span>
            </span>
            <ArrowIcon className="arrow-nudge shrink-0" />
          </a>
        </div>
      </main>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <SectionHeading title={`More in ${article.category.name}`} href={`/${article.category.slug}`} />
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
