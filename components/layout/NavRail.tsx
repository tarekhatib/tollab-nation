"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; live?: boolean };

/** Horizontal section rail. Scrolls sideways on mobile; underline slides to the active section. */
export default function NavRail({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  // Keep the active section visible in the rail (it may sit off-screen on phones).
  useEffect(() => {
    const rail = ref.current;
    const active = rail?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!rail || !active) return;
    const left = active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
  }, [pathname]);

  return (
    <nav ref={ref} aria-label="Sections" className="no-scrollbar relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max items-center gap-1">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex h-11 items-center gap-2 px-3 text-[0.8125rem] font-medium transition-colors ${
                  active ? "text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {item.live && (
                  <span className="live-dot relative size-1.5 rounded-full bg-red" aria-hidden="true" />
                )}
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 bottom-0 h-0.5 origin-left bg-red transition-transform duration-500 ease-(--ease-out-expo) ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
