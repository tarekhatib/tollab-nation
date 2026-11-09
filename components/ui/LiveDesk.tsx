import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { formatTime, timeAgo } from "@/lib/utils";
import type { QuickUpdate } from "@/types";

/** Ink panel with the latest quick updates as a timeline. */
export default function LiveDesk({ updates }: { updates: QuickUpdate[] }) {
  return (
    <section
      aria-labelledby="live-desk-title"
      className="flex h-full flex-col bg-[#0A0A0A] text-[#F4F2EE] [--border:#262624]"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h2 id="live-desk-title" className="flex items-center gap-2.5 display text-xl uppercase tracking-[0.04em]">
          <span className="live-dot relative size-2 rounded-full bg-red" aria-hidden="true" />
          Live desk
        </h2>
        <span lang="ar" dir="rtl" className="text-sm font-semibold text-white/60">مباشر</span>
      </div>

      {updates.length === 0 ? (
        <p className="flex-1 px-5 py-8 text-sm text-white/60">
          Quiet right now. Breaking updates land here first.
        </p>
      ) : (
        <ol className="flex-1 px-5">
          {updates.map((u, i) => (
            <li key={u.id} className="relative border-b border-white/10 py-4 pl-5 last:border-0 animate-rise" style={{ "--d": i + 2 } as React.CSSProperties}>
              <span
                className={`absolute left-0 top-[1.4rem] size-1.5 rounded-full ${u.isBreaking ? "bg-red" : "bg-white/40"}`}
                aria-hidden="true"
              />
              <p className="kicker flex items-center gap-2 text-white/55">
                <time dateTime={new Date(u.createdAt).toISOString()}>{formatTime(u.createdAt)}</time>
                <span aria-hidden="true">·</span>
                <span>{timeAgo(u.createdAt)}</span>
                {u.isBreaking && <span className="bg-accent px-1.5 py-1 text-[0.6rem] text-white">Breaking</span>}
              </p>
              <p lang="ar" dir="rtl" className="mt-2 text-[0.95rem] font-medium leading-relaxed">
                {u.textAr}
              </p>
              <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-snug text-white/60">{u.textEn}</p>
            </li>
          ))}
        </ol>
      )}

      <Link
        href="/updates"
        className="group flex items-center justify-between border-t border-white/10 px-5 py-4 text-sm font-semibold transition-colors hover:bg-white/5"
      >
        All live updates
        <ArrowIcon size={15} className="arrow-nudge" />
      </Link>
    </section>
  );
}
