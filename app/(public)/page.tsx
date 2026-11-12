import { Fragment } from "react";
import BreakingTicker from "@/components/ui/BreakingTicker";
import LiveDesk from "@/components/ui/LiveDesk";
import ChannelCta from "@/components/ui/ChannelCta";
import PartnerBand from "@/components/ui/PartnerBand";
import FeaturedCarousel from "@/components/ui/FeaturedCarousel";
import { MAX_FEATURED } from "@/lib/featured";
import SectionHeading from "@/components/ui/SectionHeading";
import { LeadStory, RankedStory, StoryCard, StoryRow } from "@/components/ui/Story";
import { getBreakingUpdates, getQuickUpdates } from "@/server/queries/updates";
import {
  getArticlesGroupedByCategory,
  getFeaturedArticles,
  getLatestArticles,
  getMostRead,
} from "@/server/queries/articles";
import { getNavCategories } from "@/server/queries/categories";
import type { ArticleListItem } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  const [breaking, updates, featured, latest, mostRead, categories] = await Promise.all([
    getBreakingUpdates(10),
    getQuickUpdates(5),
    getFeaturedArticles(MAX_FEATURED),
    getLatestArticles(14),
    getMostRead(5),
    getNavCategories(),
  ]);

  // Lead + three seconds.
  const used = new Set<number>();
  const take = (list: ArticleListItem[], n: number) => {
    const out: ArticleListItem[] = [];
    for (const a of list) {
      if (out.length >= n) break;
      if (!used.has(a.id)) {
        used.add(a.id);
        out.push(a);
      }
    }
    return out;
  };

  // Lead slot rotates through the featured stories (or just shows the newest one);
  // the three seconds beside it are the newest stories not already in the lead.
  const leads = featured.length ? take(featured, MAX_FEATURED) : take(latest, 1);
  const lead = leads[0];
  const seconds = take(latest, 3);
  const river = take(latest, 6);
  // No live updates: drop the desk (an empty box reads as a broken page) and let
  // the lead and the side stories take its column.
  const hasDesk = updates.length > 0;

  const sectionCats = categories.slice(0, 6);
  const grouped = await getArticlesGroupedByCategory(
    sectionCats.map((c) => c.slug),
    4
  );
  const sections = sectionCats
    .map((c) => ({ category: c, articles: grouped[c.slug] ?? [] }))
    .filter((s) => s.articles.length >= 2);

  if (!lead) {
    return (
      <>
        <BreakingTicker updates={breaking} />
        <main id="main" className="mx-auto max-w-7xl px-4 py-24 text-center text-ink-muted">
          No stories published yet.
        </main>
      </>
    );
  }

  return (
    <>
      <BreakingTicker updates={breaking} />

      <main id="main" className="mx-auto max-w-7xl space-y-16 px-4 pb-20 pt-6 sm:px-6 sm:pt-8 lg:space-y-20 lg:px-8">
        <h1 className="sr-only">Tollab Nation — top stories</h1>

        {/* Front page: lead · seconds · live desk */}
        <section className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-12">
          <div className={`min-w-0 md:col-span-2 ${hasDesk ? "lg:col-span-6" : "lg:col-span-8"}`}>
            {leads.length > 1 ? (
              <FeaturedCarousel
                slides={leads.map((a, i) => <LeadStory key={a.id} article={a} priority={i === 0} />)}
                labels={leads.map((a) => a.titleAr || a.title)}
              />
            ) : (
              <LeadStory article={lead} />
            )}
          </div>

          {seconds.length > 0 && (
            <div className={`lg:border-l lg:border-line lg:pl-8 ${hasDesk ? "lg:col-span-3" : "md:col-span-2 lg:col-span-4"}`}>
              <StoryCard article={seconds[0]} size="sm" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              <div className="mt-5 divide-y divide-line border-t border-line">
                {seconds.slice(1).map((a) => (
                  <StoryRow key={a.id} article={a} thumb={false} />
                ))}
              </div>
            </div>
          )}

          {/* From md up the desk never sets the row height: it fills whatever the
              stories beside it take, and extra updates fade out under the fold. */}
          {hasDesk && (
            <div className="md:relative md:min-h-[30rem] lg:col-span-3">
              <LiveDesk updates={updates} />
            </div>
          )}
        </section>

        {/* Latest river + most read */}
        <section className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading title="Latest" titleAr="آخر الأخبار" />
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {river.slice(0, 2).map((a) => (
                <StoryCard key={a.id} article={a} showDeck sizes="(max-width: 640px) 100vw, 33vw" />
              ))}
            </div>
            <div className="mt-6 divide-y divide-line border-t border-line">
              {river.slice(2).map((a) => (
                <StoryRow key={a.id} article={a} />
              ))}
            </div>
          </div>

          {mostRead.length > 0 && (
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <SectionHeading title="Most read" titleAr="الأكثر قراءة" />
                <ol>
                  {mostRead.map((a, i) => (
                    <RankedStory key={a.id} article={a} rank={i + 1} />
                  ))}
                </ol>
              </div>
            </aside>
          )}
        </section>

        <ChannelCta />

        {/* Sections — alternate the big story left/right for rhythm. The partner band
            sits after the second one, where most readers still are, not at the very end. */}
        {sections.map(({ category, articles }, idx) => {
          const [big, ...rest] = articles;
          return (
            <Fragment key={category.id}>
              <section>
                <SectionHeading title={category.name} href={`/${category.slug}`} linkLabel={`More ${category.name}`} />
                <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12">
                  <div className={`lg:col-span-7 ${idx % 2 ? "lg:order-2" : ""}`}>
                    <StoryCard article={big} size="lg" showDeck sizes="(max-width: 1024px) 100vw, 58vw" />
                  </div>
                  {/* Phones/tablets: swipe sideways through the rest of the section */}
                  <div className="rail lg:hidden" aria-label={`More ${category.name} stories`} role="region">
                    {rest.map((a) => (
                      <StoryCard key={a.id} article={a} size="sm" sizes="78vw" />
                    ))}
                  </div>
                  <div className={`hidden lg:col-span-5 lg:block divide-y divide-line ${idx % 2 ? "lg:order-1" : ""}`}>
                    {rest.map((a) => (
                      <StoryRow key={a.id} article={a} />
                    ))}
                  </div>
                </div>
              </section>
              {idx === 1 && <PartnerBand from="home" className="" />}
            </Fragment>
          );
        })}

        {sections.length < 2 && <PartnerBand from="home" className="" />}
      </main>
    </>
  );
}
