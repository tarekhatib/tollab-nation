import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { Mark } from "@/components/brand/Logo";

/**
 * Link to the partner enquiry form. `from` names the placement, so every
 * lead email says which spot on the site produced it.
 */
export const partnerHref = (from: string) => `/contact?topic=partner&from=${from}`;

type Props = {
  /** Placement id, e.g. "home", "section", "about". */
  from: string;
  /** Spacing from the block above; pass "" inside a `space-y-*` stack. */
  className?: string;
};

const OFFERS = [
  "Sponsored stories",
  "Placements on tollabn.com",
  "WhatsApp & Instagram campaigns",
  "Student events & activations",
];

/**
 * Commercial entry point for brands, universities and organisations.
 * A solid black panel so it breaks the scroll rhythm of the news sections
 * (and never reads as one more section heading), distinct from the red WhatsApp band.
 */
export default function PartnerBand({ from, className = "mt-16 sm:mt-20" }: Props) {
  return (
    <section
      // Dark mode: the page is already near-black, so lift the panel onto the raised surface.
      className={`theme-ink relative isolate overflow-hidden bg-page dark:border dark:border-line dark:bg-surface ${className}`}
      data-reveal
    >
      <Mark
        notched
        className="pointer-events-none absolute -bottom-10 -right-8 -z-10 h-[120%] w-auto text-white/4 [--red:rgb(255_255_255/0.03)]"
      />
      <div className="grid gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
        <div>
          <p className="kicker text-accent-ink">For brands, universities &amp; organisations</p>
          <h2 className="mt-4 max-w-2xl display text-5xl uppercase leading-[0.9] sm:text-6xl">
            Reach Lebanon&rsquo;s students where they already read the news.
          </h2>
          <p lang="ar" dir="rtl" className="mt-4 text-right text-lg font-medium text-ink-soft lg:text-left">
            أعلن معنا
          </p>
        </div>

        <div>
          <ul className="divide-y divide-line border-y border-line">
            {OFFERS.map((o) => (
              <li key={o} className="flex items-center gap-3 py-3 text-[0.95rem] text-ink">
                <span className="size-1.5 shrink-0 rotate-45 bg-red" aria-hidden="true" />
                {o}
              </li>
            ))}
          </ul>
          <Link
            href={partnerHref(from)}
            className="group mt-6 inline-flex h-14 items-center gap-3 rounded-full bg-accent px-7 text-base font-semibold text-white transition-transform duration-300 ease-(--ease-spring) hover:-translate-y-0.5 active:translate-y-0"
          >
            Partner with us
            <ArrowIcon size={16} className="arrow-nudge" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** One-line version for the end of an article: present, but never louder than the story. */
export function PartnerStrip({ from }: { from: string }) {
  return (
    <Link
      href={partnerHref(from)}
      className="group flex flex-col gap-1 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <span>
        <span className="kicker block text-accent-ink">For brands &amp; universities</span>
        <span className="mt-1 block font-semibold">Reach Lebanon&rsquo;s students on Tollab Nation.</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-soft transition-colors group-hover:text-ink">
        Advertise with us
        <ArrowIcon size={14} className="arrow-nudge" />
      </span>
    </Link>
  );
}
