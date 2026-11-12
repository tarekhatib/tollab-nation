"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GlassButton } from "@/components/ui/LiquidGlass";

const ICON = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/**
 * The homepage lead slot when several stories are featured.
 *
 * One scroll-snap track on every screen size: on phones the slide follows the
 * finger and snaps like an Instagram post; on desktop the image halves act as
 * prev/next (with matching arrow cursors) and edge arrows appear on hover.
 *
 * The 5-second timer is a CSS animation (`.fc-fill`): when it ends we advance,
 * and pausing it (hover, touch, focus, hidden tab, off-screen, pause button)
 * pauses the carousel. With reduced motion it never runs, so nothing auto-advances.
 */
export default function FeaturedCarousel({ slides, labels }: { slides: ReactNode[]; labels: string[] }) {
  const n = slides.length;
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [touching, setTouching] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false); // tab in background or carousel scrolled away
  const [stopped, setStopped] = useState(false); // the reader pressed pause
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const paused = hovered || touching || focused || hidden || stopped;

  /** Scroll to slide i (wrapping); `active` follows from the scroll position. */
  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: (((i % n) + n) % n) * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }

  // Active slide = whichever one the track is snapped to (swipes, arrows, timer alike).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let offscreen = false;
    const sync = () => setHidden(document.hidden || offscreen);
    const io = new IntersectionObserver(([e]) => {
      offscreen = !e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const counter = `${active + 1}/${n}`;

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured stories"
      // contain:inline-size: the track holds every slide side by side, so without it
      // the carousel asks for 5 slides' worth of width and blows out the phone column.
      className={`group/fc relative min-w-0 [contain:inline-size] ${paused ? "fc-paused" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={() => setTouching(false)}
      onTouchCancel={() => setTouching(false)}
      // Pause for keyboard focus only: a mouse click on an arrow also focuses it,
      // and that must not stop autoplay until the reader clicks elsewhere.
      onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(active + 1);
        if (e.key === "ArrowLeft") go(active - 1);
      }}
    >
      {/* The timer. Invisible; restarts whenever the active slide changes. */}
      <span key={active} className="fc-fill pointer-events-none absolute size-px opacity-0" onAnimationEnd={() => go(active + 1)} aria-hidden="true" />

      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="w-full shrink-0 snap-start snap-always"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}`}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Everything below sits over the image: the same 16:10 box as LeadStory's. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[16/10]">
        {/* Desktop: each half of the image is a big prev/next target with an arrow cursor. */}
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => go(active - 1)} className="fc-prev pointer-events-auto absolute inset-y-0 left-0 hidden w-1/2 md:block" />
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => go(active + 1)} className="fc-next pointer-events-auto absolute inset-y-0 right-0 hidden w-1/2 md:block" />

        {/* Desktop: edge arrows, shown on hover */}
        <button
          type="button"
          onClick={() => go(active - 1)}
          aria-label="Previous featured story"
          className="pointer-events-auto absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#0A0A0A] opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white focus-visible:opacity-100 group-hover/fc:opacity-100 md:grid"
        >
          <svg {...ICON}><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button
          type="button"
          onClick={() => go(active + 1)}
          aria-label="Next featured story"
          className="pointer-events-auto absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#0A0A0A] opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white focus-visible:opacity-100 group-hover/fc:opacity-100 md:grid"
        >
          <svg {...ICON}><path d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* Phones: Instagram-style counter pill in liquid glass, tap to pause / play. */}
        {/* Placement and hiding live on a wrapper: glisse's CSS outranks Tailwind's. */}
        <div className="pointer-events-auto absolute right-3 top-3 md:hidden">
        <GlassButton
          onClick={() => setStopped((v) => !v)}
          aria-label={stopped ? "Play featured stories" : "Pause featured stories"}
          className="tabular-nums"
          style={{ height: 28, padding: "0 10px", gap: 6, fontSize: 12, fontWeight: 600, color: "white" }}
          icon={
            stopped ? (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
            ) : undefined
          }
        >
          {counter}
        </GlassButton>
        </div>

        {/* Phones: dots */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
          {labels.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full bg-white shadow-[0_0_4px_rgb(0_0_0/0.4)] transition-all duration-300 ${
                i === active ? "w-4" : "w-1.5 opacity-55"
              }`}
            />
          ))}
        </div>

        {/* Desktop: story-style progress bars, counter, pause */}
        <div className="absolute inset-x-0 bottom-0 hidden items-center gap-3 bg-linear-to-t from-black/60 to-transparent px-5 pb-4 pt-10 md:flex">
          <div className="pointer-events-auto flex flex-1 gap-1.5" role="tablist" aria-label="Choose a featured story">
            {labels.map((label, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Story ${i + 1}: ${label}`}
                onClick={() => go(i)}
                className="group/bar flex h-5 flex-1 items-center"
              >
                <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/35 transition-[height] group-hover/bar:h-[5px]">
                  {i < active && <span className="absolute inset-0 bg-white" />}
                  {i === active && <span key={active} className="fc-fill absolute inset-0 origin-left bg-white" />}
                </span>
              </button>
            ))}
          </div>
          {/* No pause button on desktop: hovering the carousel pauses it. */}
          <span className="kicker tabular-nums text-white/85" aria-hidden="true">
            {String(active + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
