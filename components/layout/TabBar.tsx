"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "@/components/layout/MobileNav";
import { BookmarkIcon } from "@/components/article/SaveButton";
import { useSavedStories } from "@/lib/saved";

type Category = { id: number; name: string; slug: string };

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M3.5 10.5 12 3.5l8.5 7V20a.5.5 0 0 1-.5.5h-5v-6h-6v6H4a.5.5 0 0 1-.5-.5z" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}
function LiveIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <path d="M7.76 16.24a6 6 0 0 1 0-8.48M16.24 7.76a6 6 0 0 1 0 8.48M4.93 19.07a10 10 0 0 1 0-14.14M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
function SearchTabIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth={active ? 2.4 : 1.8} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
    </svg>
  );
}

/**
 * App-style bottom tab bar for phones and small tablets (hidden from md up).
 * Thumb-reachable primary navigation; the Menu tab opens the sections sheet.
 */
export default function TabBar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  // The sheet remembers the page it was opened on; navigating anywhere closes it.
  const [menuOn, setMenuOn] = useState<string | null>(null);
  const menuOpen = menuOn === pathname;
  const savedCount = useSavedStories().length;

  const tabs = [
    { href: "/", label: "Home", icon: (a: boolean) => <HomeIcon active={a} />, match: (p: string) => p === "/" },
    { href: "/updates", label: "Live", icon: () => <LiveIcon />, match: (p: string) => p === "/updates", live: true },
    {
      href: "/saved",
      label: "Saved",
      icon: (a: boolean) => <BookmarkIcon filled={a} size={22} />,
      match: (p: string) => p === "/saved",
      badge: savedCount,
    },
    { href: "/search", label: "Search", icon: (a: boolean) => <SearchTabIcon active={a} />, match: (p: string) => p === "/search" },
  ];

  const item =
    "press relative flex h-full flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold tracking-wide transition-colors";

  return (
    <>
      <MobileNav categories={categories} open={menuOpen} onClose={() => setMenuOn(null)} />

      <nav
        aria-label="Primary"
        className="theme-ink tab-bar fixed inset-x-0 bottom-0 z-[80] border-t border-line bg-header/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto flex h-16 max-w-lg items-stretch px-2">
          {tabs.map((t) => {
            const active = !menuOpen && t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOn(null)}
                className={`${item} ${active ? "text-ink" : "text-ink-muted"}`}
              >
                <span aria-hidden="true" className={`absolute inset-x-5 top-0 h-0.5 origin-center bg-red transition-transform duration-500 ease-(--ease-out-expo) ${active ? "scale-x-100" : "scale-x-0"}`} />
                <span className="relative">
                  {t.icon(active)}
                  {t.live && <span className="live-dot absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red ring-2 ring-[#0A0A0A]" />}
                  {!!t.badge && (
                    <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red px-1 text-[0.625rem] font-bold leading-none text-white tabular-nums">
                      {t.badge > 99 ? "99+" : t.badge}
                    </span>
                  )}
                </span>
                {t.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOn(menuOpen ? null : pathname)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={`${item} ${menuOpen ? "text-ink" : "text-ink-muted"}`}
          >
            <span aria-hidden="true" className={`absolute inset-x-5 top-0 h-0.5 bg-red transition-transform duration-500 ease-(--ease-out-expo) ${menuOpen ? "scale-x-100" : "scale-x-0"}`} />
            <MenuIcon open={menuOpen} />
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>
    </>
  );
}
