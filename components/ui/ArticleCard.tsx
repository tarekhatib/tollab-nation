import Image from "next/image";
import Link from "next/link";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { formatDate } from "@/lib/utils";
import type { ArticleWithCategory } from "@/types";

type Props = {
  article: ArticleWithCategory;
  size?: "default" | "compact";
};

export default function ArticleCard({ article, size = "default" }: Props) {
  const href = `/${article.category.slug}/${article.slug}`;

  if (size === "compact") {
    return (
      <article className="flex gap-3 group">
        {article.coverImage && (
          <Link href={href} className="shrink-0">
            <div className="relative w-20 h-16 rounded overflow-hidden">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                sizes="80px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <Link href={href}>
            <h3 className="text-sm font-semibold text-ink leading-snug line-clamp-2 group-hover:text-accent transition-colors" dir="rtl">
              {article.titleAr || article.title}
            </h3>
          </Link>
          <p className="text-xs text-ink-muted mt-1">{formatDate(article.publishedAt)}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-card rounded-lg overflow-hidden border border-line hover:shadow-md transition-shadow">
      {article.coverImage ? (
        <Link href={href} className="block">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>
        </Link>
      ) : (
        <div className="aspect-video bg-line flex items-center justify-center">
          <span className="text-ink-muted text-xs">No image</span>
        </div>
      )}

      <div className="p-4 space-y-2">
        <CategoryBadge name={article.category.name} slug={article.category.slug} />
        <Link href={href}>
          <h3 className="font-semibold text-ink leading-snug line-clamp-2 group-hover:text-accent transition-colors mt-1" dir="rtl">
            {article.titleAr || article.title}
          </h3>
        </Link>
        <p className="text-xs text-ink-muted">{formatDate(article.publishedAt)}</p>
      </div>
    </article>
  );
}
