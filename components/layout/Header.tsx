import Link from "next/link";
import { getNavCategories } from "@/server/queries/categories";
import { Logo } from "@/components/brand/Logo";
import TabBar from "@/components/layout/TabBar";
import SavedLink from "@/components/layout/SavedLink";
import NavRail from "@/components/layout/NavRail";
import ThemeToggle from "@/components/layout/ThemeToggle";
import ScrollWatcher from "@/components/layout/ScrollWatcher";
import { ArrowIcon, InstagramIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { SITE } from "@/lib/site";
import { partnerHref } from "@/components/ui/PartnerBand";

function todayLabels() {
  const now = new Date();
  const opts = { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Beirut" } as const;
  return {
    en: now.toLocaleDateString("en-GB", opts),
    ar: now.toLocaleDateString("ar-LB", opts),
  };
}

export default async function Header() {
  const categories = await getNavCategories();
  const date = todayLabels();

  const railItems = [
    { href: "/", label: "Top stories" },
    { href: "/updates", label: "Live", live: true },
    ...categories.map((c) => ({ href: `/${c.slug}`, label: c.name })),
  ];

  return (
    <>
      <ScrollWatcher />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-page"
      >
        Skip to content
      </a>

      {/* Utility strip — scrolls away with the page */}
      <div className="theme-ink hidden border-b border-line bg-page md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 lg:px-8">
          <p className="kicker text-ink-muted">
            {date.en}
            <span className="mx-2 text-line" aria-hidden="true">/</span>
            <span dir="rtl" lang="ar" className="normal-case tracking-normal">{date.ar}</span>
          </p>
          <div className="flex items-center gap-5">
            <p className="kicker text-ink-muted">{SITE.tagline}</p>
            {/* Red + arrow so it reads as a link, not more of the tagline */}
            <span className="h-3.5 w-px bg-line" aria-hidden="true" />
            <Link
              href={partnerHref("header")}
              className="group kicker inline-flex items-center gap-1.5 text-accent-ink transition-colors hover:text-white"
            >
              Advertise with us
              <ArrowIcon size={12} className="arrow-nudge" />
            </Link>
            <span className="h-3.5 w-px bg-line" aria-hidden="true" />
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ink-muted transition-colors hover:text-ink">
              <InstagramIcon size={15} />
            </a>
          </div>
        </div>
      </div>

      <header className="theme-ink site-header sticky top-0 z-50 border-b border-line bg-header pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[4.25rem] items-center justify-between gap-4 md:h-16">
            <Link href="/" aria-label="Tollab Nation home" className="text-ink">
              <Logo animated compactOnMobile />
            </Link>

            <div className="flex items-center gap-1">
              <Link href="/search" aria-label="Search" className="hidden size-10 md:grid place-items-center rounded-full text-ink transition-colors hover:bg-ink/5">
                <SearchIcon />
              </Link>
              <SavedLink />
              <ThemeToggle />
              <a
                href={SITE.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="group ml-2 hidden h-10 items-center gap-2 rounded-full bg-ink pl-3.5 pr-4 text-sm font-semibold text-page transition-colors hover:bg-[#25D366] hover:text-white sm:inline-flex"
              >
                <WhatsAppIcon size={16} />
                Follow the channel
              </a>
              {/* Hidden from sm up on a wrapper: glisse's CSS outranks Tailwind's. */}
              <span className="ml-1 sm:hidden">
                <a
                  href={SITE.whatsappChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Tollab Nation on WhatsApp"
                  // glisse's filled glass button classes on a real link (its Button renders a <button>).
                  data-icon="only"
                  data-variant="filled"
                  data-tint=""
                  style={{ "--lg-tint": "#25D366" } as React.CSSProperties}
                  className="lg-glass lg-button text-white"
                >
                  <WhatsAppIcon size={18} />
                </a>
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <NavRail items={railItems} />
          </div>
        </div>
      </header>

      <TabBar categories={categories} />
    </>
  );
}
