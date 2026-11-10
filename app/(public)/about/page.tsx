import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/brand/Logo";
import ChannelCta from "@/components/ui/ChannelCta";
import PartnerBand from "@/components/ui/PartnerBand";
import { ArrowIcon } from "@/components/ui/Icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Tollab Nation is an independent digital news platform covering Lebanon and the region, in Arabic and English.",
};

const VALUES = [
  { title: "Independence", desc: "We are not funded or controlled by any external entity." },
  { title: "Transparency", desc: "We are open about how we operate." },
  { title: "Accuracy", desc: "We strive to report verified and factual information." },
  { title: "Clarity", desc: "We keep our content simple and direct." },
];

const COVERAGE = [
  "Local news in Lebanon",
  "Social and political developments",
  "Breaking news and current events",
  "Public interest stories",
];

export default function AboutPage() {
  return (
    <main id="main" className="pb-20 pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Manifesto */}
        <header className="grid gap-10 border-b-[3px] border-line-strong pb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="kicker animate-rise text-accent-ink">About Tollab Nation</p>
            <h1
              className="animate-rise mt-5 display text-6xl uppercase leading-[0.88] sm:text-8xl lg:text-9xl"
              style={{ "--d": 1 } as React.CSSProperties}
            >
              To inform, <span className="text-red">not to influence.</span>
            </h1>
            <p
              lang="ar"
              dir="rtl"
              className="animate-rise mt-8 text-2xl font-semibold leading-relaxed text-ink-soft sm:text-3xl"
              style={{ "--d": 2 } as React.CSSProperties}
            >
              نكتب الأمر الواقع بقلم حر، إعلام غير مأجور وغير ممول، لضمان الشفافية
            </p>
          </div>
          <div className="hidden justify-end lg:col-span-4 lg:flex">
            <Mark animated className="h-56 w-auto text-ink" />
          </div>
        </header>

        {/* Story */}
        <section className="grid gap-10 py-16 lg:grid-cols-12">
          <h2 className="kicker text-ink-muted lg:col-span-3">Who we are</h2>
          <div className="space-y-6 text-lg leading-relaxed text-ink-soft lg:col-span-7" data-reveal>
            <p className="text-2xl font-medium leading-snug text-ink">
              At Tollab Nation, we believe in sharing stories as they are — clear, honest, and without influence.
            </p>
            <p>
              We are an independent digital news platform focused on covering local and regional stories with
              integrity. Our goal is to provide accurate information, thoughtful perspectives, and straightforward
              reporting in a time where trust in media matters more than ever.
            </p>
            <p>
              We aim to present facts without bias, giving readers the ability to form their own opinions based on
              reliable information. In a world full of noise, Tollab Nation focuses on what matters.
            </p>
          </div>
        </section>

        {/* Coverage */}
        <section className="grid gap-10 border-t border-line py-16 lg:grid-cols-12">
          <h2 className="kicker text-ink-muted lg:col-span-3">What we cover</h2>
          <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:col-span-9">
            {COVERAGE.map((item, i) => (
              <li key={item} className="flex items-baseline gap-4 bg-page p-6" data-reveal>
                <span className="font-mono text-sm text-accent-ink">0{i + 1}</span>
                <span className="display text-3xl uppercase">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Values */}
        <section className="grid gap-10 border-t border-line py-16 lg:grid-cols-12">
          <h2 className="kicker text-ink-muted lg:col-span-3">Our values</h2>
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-9">
            {VALUES.map(({ title, desc }) => (
              <div key={title} data-reveal>
                <div className="h-[3px] w-10 bg-red" />
                <h3 className="mt-4 display text-4xl uppercase">{title}</h3>
                <p className="mt-2 text-ink-soft">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="grid gap-10 border-t border-line py-16 lg:grid-cols-12">
          <h2 className="kicker text-ink-muted lg:col-span-3">Get in touch</h2>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:col-span-9">
            <div className="space-y-2 text-lg">
              <a href={`mailto:${SITE.email}`} className="link-wipe block font-semibold">{SITE.email}</a>
              <a href={SITE.whatsappDirect} target="_blank" rel="noopener noreferrer" className="link-wipe block font-semibold">
                {SITE.phone}
              </a>
            </div>
            <Link
              href="/contact"
              className="group inline-flex h-12 items-center gap-2 self-start rounded-full bg-ink px-6 font-semibold text-page transition-colors hover:bg-accent hover:text-white"
            >
              Contact us <ArrowIcon size={16} className="arrow-nudge" />
            </Link>
          </div>
        </section>

        <PartnerBand />
        <ChannelCta />
      </div>
    </main>
  );
}
