import Link from "next/link";
import type { QuickUpdate } from "@/types";

type Props = { updates: QuickUpdate[] };

/** Breaking bar, styled after the social "BREAKING عاجل" template. Pure CSS marquee. */
export default function BreakingTicker({ updates }: Props) {
  if (!updates.length) return null;

  // Duplicate once so translateX(-50%) loops seamlessly.
  const items = [...updates, ...updates];
  const duration = Math.max(30, updates.length * 18);

  return (
    <div className="relative flex items-stretch overflow-hidden bg-[#0A0A0A] text-[#F4F2EE]">
      <Link
        href="/updates"
        className="relative z-10 flex shrink-0 items-center gap-2 bg-accent px-3 text-white sm:px-4"
      >
        <span className="live-dot relative size-1.5 rounded-full bg-white" aria-hidden="true" />
        <span className="display text-base uppercase tracking-[0.06em]">Breaking</span>
        <span lang="ar" dir="rtl" className="hidden text-sm font-bold sm:inline">عاجل</span>
      </Link>

      <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_2rem,#000_calc(100%-3rem),transparent)]">
        <div
          className="ticker-track flex w-max items-center py-2.5"
          style={{ "--ticker-duration": `${duration}s` } as React.CSSProperties}
        >
          {items.map((u, i) => (
            <Link
              key={`${u.id}-${i}`}
              href="/updates"
              aria-hidden={i >= updates.length ? true : undefined}
              tabIndex={i >= updates.length ? -1 : undefined}
              className="inline-flex items-center gap-3 whitespace-nowrap px-6 text-[0.8125rem] transition-colors hover:text-white"
            >
              <span lang="ar" dir="rtl" className="font-medium">{u.textAr}</span>
              <span className="text-white/30" aria-hidden="true">/</span>
              <span className="font-mono text-[0.75rem] text-white/70">{u.textEn}</span>
              <span className="ml-6 inline-block size-1 rotate-45 bg-red" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
