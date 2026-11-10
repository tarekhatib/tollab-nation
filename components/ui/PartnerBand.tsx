import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";

/** Commercial entry point for brands, universities and organisations. */
export default function PartnerBand() {
  return (
    <section className="mt-16 grid gap-8 border-y border-line py-10 sm:mt-20 lg:grid-cols-[1fr_auto] lg:items-center" data-reveal>
      <div>
        <p className="kicker text-accent-ink">For brands, universities &amp; organisations</p>
        <h2 className="mt-3 max-w-2xl display text-4xl uppercase leading-[0.95] sm:text-5xl">
          Reach Lebanon&rsquo;s students where they already read the news.
        </h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Sponsored stories, placements on the site and campaigns across our channels. Tell us what
          you want to achieve and we&rsquo;ll put a plan together.
        </p>
      </div>
      <Link
        href="/contact?topic=partner"
        className="group inline-flex h-12 items-center gap-2 justify-self-start rounded-full bg-ink px-6 font-semibold text-page transition-colors hover:bg-accent hover:text-white"
      >
        Partner with us
        <ArrowIcon size={16} className="arrow-nudge" />
      </Link>
    </section>
  );
}
