"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Articles", href: "/admin/articles" },
  { label: "Updates", href: "/admin/updates" },
  { label: "Ads", href: "/admin/ads" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navContent = (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "text-ink-soft hover:text-ink hover:bg-surface"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-line">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink-soft hover:text-ink hover:bg-surface transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-header border-b border-line">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-ink-soft hover:bg-surface transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/" target="_blank">
          <Image src="/logo.svg" alt="Beirut Scope" width={100} height={26} className="dark:invert" />
        </Link>
        <div className="w-9" />
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar / Mobile drawer */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 lg:w-60 shrink-0 flex flex-col
          border-r border-line bg-card min-h-screen
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-6 py-5 border-b border-line">
          <Link href="/" target="_blank">
            <Image src="/logo.svg" alt="Beirut Scope" width={120} height={30} className="dark:invert" />
          </Link>
        </div>
        {navContent}
      </aside>
    </>
  );
}
