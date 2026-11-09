"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { SITE } from "@/lib/site";

type Category = { id: number; name: string; slug: string };

/** Full-screen sections sheet. Opened from the Menu tab in the bottom bar. */
export default function MobileNav({
  categories,
  open,
  onClose,
}: {
  categories: Category[];
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  const setOpen = (v: boolean) => !v && onClose();
  const links = [
    { href: "/updates", label: "Live updates" },
    ...categories.map((c) => ({ href: `/${c.slug}`, label: c.name })),
  ];
  const secondary = [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/contact?topic=partner", label: "Advertise with us" },
  ];

  return (
    <>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            id="mobile-menu"
            className="sheet-in fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-page pb-[calc(4.25rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] text-ink md:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <Link href="/" className="text-ink" onClick={() => setOpen(false)}>
                <Logo size="sm" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full hover:bg-ink/5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-4 py-6" aria-label="Sections">
              <ul>
                {links.map((l, i) => (
                  <li key={l.href} className="menu-item border-b border-line" style={{ "--i": i } as React.CSSProperties}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-3 display text-4xl uppercase"
                    >
                      {l.label}
                      {i === 0 && <span className="live-dot relative size-2 rounded-full bg-red" aria-hidden="true" />}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {secondary.map((l, i) => (
                  <li key={l.href} className="menu-item" style={{ "--i": links.length + i } as React.CSSProperties}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-ink-soft">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="menu-item grid shrink-0 grid-cols-[1fr_auto] gap-2 p-4" style={{ "--i": links.length + 4 } as React.CSSProperties}>
              <a
                href={SITE.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent font-semibold text-white"
              >
                <WhatsAppIcon size={18} /> Follow on WhatsApp
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid size-12 place-items-center rounded-full border border-line"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
