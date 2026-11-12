"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GlassButton, GlassDock, GlassTabBar, SIDE_BUTTON, tabBarStyle, type GlassTabItem } from "@/components/ui/LiquidGlass";
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
 * Phone navigation in iOS 26's liquid-glass style (hidden from md up): a floating
 * glass tab bar, with Search as its own glass circle beside it, as in iOS apps.
 * The Menu tab opens the sections sheet.
 */
export default function TabBar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const router = useRouter();
  // The sheet remembers the page it was opened on; navigating anywhere closes it.
  const [menuOn, setMenuOn] = useState<string | null>(null);
  const menuOpen = menuOn === pathname;
  const savedCount = useSavedStories().length;

  const badge = savedCount > 0 && (
    <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red px-1 text-[0.625rem] font-bold leading-none text-white tabular-nums">
      {savedCount > 99 ? "99+" : savedCount}
    </span>
  );

  const items: GlassTabItem[] = [
    { value: "home", href: "/", label: "Home", icon: <span className="relative flex"><HomeIcon active={pathname === "/"} /></span> },
    {
      value: "live",
      href: "/updates",
      label: "Live",
      icon: (
        <span className="relative flex">
          <LiveIcon />
          <span className="live-dot absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red" />
        </span>
      ),
    },
    {
      value: "saved",
      href: "/saved",
      label: "Saved",
      icon: (
        <span className="relative flex">
          <BookmarkIcon filled={pathname === "/saved"} size={22} />
          {badge}
        </span>
      ),
    },
    // No href: a button that opens the sections sheet.
    { value: "menu", label: menuOpen ? "Close" : "Menu", icon: <span className="relative flex"><MenuIcon open={menuOpen} /></span> },
  ];

  const current = menuOpen
    ? "menu"
    : pathname === "/" ? "home" : pathname === "/updates" ? "live" : pathname === "/saved" ? "saved" : null;

  return (
    <>
      <MobileNav categories={categories} open={menuOpen} onClose={() => setMenuOn(null)} />

      <GlassDock className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+10px)] z-[80] flex items-end justify-center gap-2 px-4 md:hidden">
        <GlassTabBar
          aria-label="Primary"
          className="pointer-events-auto"
          style={tabBarStyle(items.length, 60 + 8)}
          items={items}
          link={Link}
          value={current}
          onValueChange={(v) => setMenuOn(v === "menu" && !menuOpen ? pathname : null)}
        />
        <GlassButton
          aria-label="Search"
          className="pointer-events-auto"
          style={SIDE_BUTTON}
          data-selected={pathname === "/search" ? "" : undefined}
          icon={<SearchTabIcon active={pathname === "/search"} />}
          onClick={() => {
            setMenuOn(null);
            router.push("/search");
          }}
        />
      </GlassDock>
    </>
  );
}
