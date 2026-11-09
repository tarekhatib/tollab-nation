import Image from "next/image";
import Link from "next/link";
import { Mark } from "@/components/brand/Logo";
import { timeAgo } from "@/lib/utils";
import type { ArticleListItem } from "@/types";

type Story = ArticleListItem;

const hrefOf = (a: Story) => `/${a.category.slug}/${a.slug}`;
const headlineOf = (a: Story) => a.titleAr || a.title;
const isArabic = (a: Story) => Boolean(a.titleAr);

/* ── Building blocks ──────────────────────────────────────── */

export function StoryMedia({
  article,
  sizes,
  priority = false,
  className = "aspect-[16/10]",
  reveal = true,
}: {
  article: Story;
  sizes: string;
  priority?: boolean;
  className?: string;
  reveal?: boolean;
}) {
  return (
    <div
      className={`img-zoom relative overflow-hidden bg-surface ${className}`}
      data-reveal={reveal && !priority ? "img" : undefined}
    >
      {article.coverImage ? (
        <Image
          src={article.coverImage}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          className={`object-cover ${priority ? "animate-settle" : ""}`}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-ink/15">
          <Mark className="h-1/3 w-auto" />
        </div>
      )}
    </div>
  );
}

export function StoryMeta({ article, className = "" }: { article: Story; className?: string }) {
  return (
    <p className={`kicker flex items-center gap-2 ${className}`} dir="ltr">
      <span className="text-accent-ink">{article.category.name}</span>
      <span className="size-[3px] rounded-full bg-ink-muted/60" aria-hidden="true" />
      <time dateTime={new Date(article.publishedAt).toISOString()} className="text-ink-muted">
        {timeAgo(article.publishedAt)}
      </time>
    </p>
  );
}

/* ── Variants ─────────────────────────────────────────────── */

/** The day's lead: big image, big Arabic headline, English deck. */
export function LeadStory({ article }: { article: Story }) {
  const ar = isArabic(article);
  return (
    <article className="group">
      <Link href={hrefOf(article)} className="block">
        <StoryMedia article={article} priority sizes="(max-width: 1024px) 100vw, 50vw" className="aspect-[16/10]" />
        <div className="pt-5" dir={ar ? "rtl" : "ltr"}>
          <StoryMeta article={article} className={`animate-rise ${ar ? "justify-end" : ""}`} />
          <h2
            className="animate-rise mt-3 text-[1.75rem] font-bold leading-[1.25] tracking-tight text-balance sm:text-4xl lg:text-[2.6rem]"
            style={{ "--d": 1 } as React.CSSProperties}
            lang={ar ? "ar" : "en"}
          >
            <span className="link-wipe">{headlineOf(article)}</span>
          </h2>
          {ar && article.title && (
            <p
              dir="ltr"
              className="animate-rise mt-3 text-right text-base leading-snug text-ink-soft sm:text-lg"
              style={{ "--d": 2 } as React.CSSProperties}
            >
              {article.title}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

/** Image-top card used in grids. */
export function StoryCard({
  article,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  showDeck = false,
  size = "md",
}: {
  article: Story;
  sizes?: string;
  showDeck?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const ar = isArabic(article);
  const titleSize = {
    sm: "text-base leading-snug",
    md: "text-lg leading-snug sm:text-xl sm:leading-[1.35]",
    lg: "text-2xl leading-tight sm:text-[1.75rem] sm:leading-[1.3]",
  }[size];

  return (
    <article className="group" data-reveal>
      <Link href={hrefOf(article)} className="block">
        <StoryMedia article={article} sizes={sizes} reveal={false} />
        <div className="pt-4" dir={ar ? "rtl" : "ltr"}>
          <StoryMeta article={article} className={ar ? "justify-end" : ""} />
          <h3 className={`mt-2.5 font-semibold text-pretty ${titleSize}`} lang={ar ? "ar" : "en"}>
            <span className="link-wipe">{headlineOf(article)}</span>
          </h3>
          {showDeck && ar && article.title && (
            <p dir="ltr" className="mt-2 line-clamp-2 text-right text-sm text-ink-muted">
              {article.title}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

/** Thumbnail + headline row, for rivers and side columns. */
export function StoryRow({ article, thumb = true }: { article: Story; thumb?: boolean }) {
  const ar = isArabic(article);
  return (
    <article className="group" data-reveal>
      <Link href={hrefOf(article)} className="flex gap-4 py-4" dir={ar ? "rtl" : "ltr"}>
        {thumb && (
          <StoryMedia article={article} sizes="128px" reveal={false} className="aspect-[4/3] w-24 shrink-0 sm:w-32" />
        )}
        <div className="min-w-0 flex-1">
          <StoryMeta article={article} className={ar ? "justify-end" : ""} />
          <h3 className="mt-2 text-base font-semibold leading-snug text-pretty sm:text-[1.0625rem]" lang={ar ? "ar" : "en"}>
            <span className="link-wipe">{headlineOf(article)}</span>
          </h3>
        </div>
      </Link>
    </article>
  );
}

/** Numbered, text-only — for "Most read". */
export function RankedStory({ article, rank }: { article: Story; rank: number }) {
  const ar = isArabic(article);
  return (
    <li className="group border-b border-line last:border-0">
      <Link href={hrefOf(article)} className="flex items-start gap-4 py-4">
        <span className="display text-5xl leading-none text-red tabular-nums transition-transform duration-500 ease-(--ease-spring) group-hover:-translate-y-0.5">
          {rank}
        </span>
        <div className="min-w-0 flex-1" dir={ar ? "rtl" : "ltr"}>
          <h3 className="text-[0.975rem] font-semibold leading-snug text-pretty" lang={ar ? "ar" : "en"}>
            <span className="link-wipe">{headlineOf(article)}</span>
          </h3>
          <p className="kicker mt-2 text-ink-muted" dir="ltr">{article.category.name}</p>
        </div>
      </Link>
    </li>
  );
}
