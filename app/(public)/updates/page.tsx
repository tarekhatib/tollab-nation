import type { Metadata } from "next";
import { getQuickUpdates } from "@/server/queries/updates";
import { formatTime, timeAgo } from "@/lib/utils";
import ChannelCta from "@/components/ui/ChannelCta";
import type { QuickUpdate } from "@/types";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Live Updates",
  description: "Breaking news and quick updates from Tollab Nation, in Arabic and English.",
};

function dayLabel(date: Date) {
  const tz = "Asia/Beirut";
  const key = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: tz });
  const now = new Date();
  if (key(date) === key(now)) return "Today";
  if (key(date) === key(new Date(now.getTime() - 86400000))) return "Yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: tz });
}

export default async function UpdatesPage() {
  const updates = await getQuickUpdates(100);

  // Group by day for a readable timeline.
  const days: { label: string; items: QuickUpdate[] }[] = [];
  for (const u of updates) {
    const label = dayLabel(new Date(u.createdAt));
    const last = days[days.length - 1];
    if (last?.label === label) last.items.push(u);
    else days.push({ label, items: [u] });
  }

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mb-12 grid gap-6 border-b-[3px] border-line-strong pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="kicker animate-rise flex items-center gap-2 text-accent-ink">
            <span className="live-dot relative size-2 rounded-full bg-red" aria-hidden="true" />
            Live · updated every 30 seconds
          </p>
          <h1 className="animate-rise mt-4 display text-7xl uppercase leading-[0.85] sm:text-9xl" style={{ "--d": 1 } as React.CSSProperties}>
            Live desk
          </h1>
        </div>
        <p lang="ar" dir="rtl" className="animate-rise text-3xl font-bold text-ink-muted sm:text-4xl" style={{ "--d": 2 } as React.CSSProperties}>
          آخر التطورات
        </p>
      </header>

      {updates.length === 0 ? (
        <p className="py-20 text-center text-ink-muted">No updates in the last 48 hours.</p>
      ) : (
        <div className="mx-auto max-w-3xl space-y-14">
          {days.map((day) => (
            <section key={day.label}>
              <h2 className="kicker sticky top-28 z-10 -mx-2 mb-2 inline-block bg-page px-2 py-2 text-ink-muted">{day.label}</h2>
              <ol className="relative border-l border-line">
                {day.items.map((u) => (
                  <li key={u.id} className="relative pb-10 pl-8 last:pb-0" data-reveal>
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[5px] top-1.5 size-2.5 rounded-full ring-4 ring-page ${u.isBreaking ? "live-dot bg-red" : "bg-ink-muted"}`}
                    />
                    <p className="kicker flex flex-wrap items-center gap-2 text-ink-muted">
                      <time dateTime={new Date(u.createdAt).toISOString()} className="text-ink">{formatTime(u.createdAt)}</time>
                      <span aria-hidden="true">·</span>
                      <span>{timeAgo(u.createdAt)}</span>
                      {u.isBreaking && <span className="bg-accent px-1.5 py-1 text-white">Breaking · عاجل</span>}
                    </p>
                    <p lang="ar" dir="rtl" className="mt-3 text-xl font-semibold leading-relaxed sm:text-[1.375rem]">
                      {u.textAr}
                    </p>
                    <p className="mt-2 leading-relaxed text-ink-soft">{u.textEn}</p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      <div className="mt-20">
        <ChannelCta />
      </div>
    </main>
  );
}
