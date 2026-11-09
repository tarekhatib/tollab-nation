import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";

type Props = {
  title: string;
  titleAr?: string;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2";
};

/** Newspaper section head: heavy rule that draws in, wide title, optional link. */
export default function SectionHeading({ title, titleAr, href, linkLabel = "See all", as: Tag = "h2" }: Props) {
  return (
    <div className="mb-6" data-reveal>
      <div className="rule-grow h-[3px] bg-line-strong" />
      <div className="flex items-baseline justify-between gap-4 pt-3">
        <Tag className="display text-3xl uppercase leading-none sm:text-4xl">
          {title}
          {titleAr && (
            <span lang="ar" dir="rtl" className="ml-3 text-base font-semibold normal-case tracking-normal text-ink-muted sm:text-lg">
              {titleAr}
            </span>
          )}
        </Tag>
        {href && (
          <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-accent-ink">
            {linkLabel}
            <ArrowIcon size={14} className="arrow-nudge" />
          </Link>
        )}
      </div>
    </div>
  );
}
