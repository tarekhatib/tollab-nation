"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/brand/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const icons = {
  dashboard: <path d="M4 13h6V4H4zM14 20h6v-9h-6zM14 4v4h6V4zM4 20h6v-3H4z" />,
  articles: <path d="M5 4h11l3 3v13H5zM9 9h6M9 13h6M9 17h4" />,
  authors: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.6 3.6-6 7-6s6.2 2.4 7 6" /></>,
  updates: <><circle cx="12" cy="12" r="2" /><path d="M7.76 16.24a6 6 0 0 1 0-8.48M16.24 7.76a6 6 0 0 1 0 8.48" /></>,
  ads: <path d="M4 10v4h3l6 4V6L7 10zM17 9a4 4 0 0 1 0 6" />,
};

const navItems = [
  { label: "Dashboard", href: "/admin", icon: icons.dashboard },
  { label: "Articles", href: "/admin/articles", icon: icons.articles },
  { label: "Authors", href: "/admin/authors", icon: icons.authors },
  { label: "Live updates", href: "/admin/updates", icon: icons.updates },
  { label: "Ads", href: "/admin/ads", icon: icons.ads },
];

/** Admin navigation in the site's masthead style: black in both themes, red active marker. */
export default function AdminSidebar() {
  const pathname = usePathname();
  // Drawer remembers the page it was opened on; navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      {/* Phone/tablet top bar */}
      <header className="theme-ink fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-header px-4 pt-[env(safe-area-inset-top)] lg:hidden">
        <button
          type="button"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="press grid size-10 place-items-center rounded-full text-ink hover:bg-ink/5"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" {...s} aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
          </svg>
        </button>
        <Link href="/admin" aria-label="Admin home" className="text-ink">
          <Logo size="sm" />
        </Link>
        <ThemeToggle />
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpenOn(null)} aria-hidden="true" />
      )}

      <aside
        className={`theme-ink fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-header text-ink transition-transform duration-500 ease-(--ease-out-expo) lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-line px-6 lg:h-20">
          <Link href="/admin" className="text-ink" aria-label="Admin home">
            <Logo size="sm" animated />
          </Link>
        </div>

        <p className="kicker px-6 pb-2 pt-6 text-ink-muted">Newsroom</p>
        <nav className="flex-1 overflow-y-auto px-3" aria-label="Admin">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex h-11 items-center gap-3 px-3 text-sm font-medium transition-colors ${
                      active ? "bg-ink/[0.07] text-ink" : "text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-2 left-0 w-0.5 origin-center bg-red transition-transform duration-500 ease-(--ease-out-expo) ${
                        active ? "scale-y-100" : "scale-y-0"
                      }`}
                    />
                    <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden="true" className={active ? "text-red" : ""}>
                      {item.icon}
                    </svg>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-1 border-t border-line p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-10 items-center gap-3 px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
            View site
          </a>
          <div className="flex items-center justify-between gap-2 pl-3">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex h-10 items-center gap-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden="true"><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H4" /></svg>
              Sign out
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
