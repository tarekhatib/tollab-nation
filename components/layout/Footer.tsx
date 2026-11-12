import Link from "next/link";
import { getNavCategories } from "@/server/queries/categories";
import { Logo } from "@/components/brand/Logo";
import { InstagramIcon, MailIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { SITE } from "@/lib/site";

export default async function Footer() {
  const categories = await getNavCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate mt-auto overflow-hidden bg-footer text-ink-footer">
      {/* Diagonal band, borrowed from the social post templates */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-1/4 top-0 -z-10 h-[160%] w-[70%] origin-top-right -rotate-[35deg] bg-white/[0.025]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[28rem] rounded-full bg-red/20 blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block text-[#F4F2EE]" aria-label="Tollab Nation home">
              <Logo size="lg" />
            </Link>
            <p className="mt-6 max-w-sm display text-4xl uppercase leading-[0.95] text-[#F4F2EE]">
              {SITE.tagline}.
            </p>
            <p lang="ar" dir="rtl" className="mt-2 max-w-sm text-right text-base text-white/60 lg:text-left">
              نكتب الأمر الواقع بقلم حر
            </p>
            <div className="mt-8 flex items-center gap-2">
              {[
                { href: SITE.whatsappChannel, label: "WhatsApp channel", icon: <WhatsAppIcon size={18} /> },
                { href: SITE.instagram, label: "Instagram", icon: <InstagramIcon size={18} /> },
                { href: `mailto:${SITE.email}`, label: "Email", icon: <MailIcon size={18} /> },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-red hover:bg-red hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Sections" className="lg:col-span-4">
            <h2 className="kicker text-white/45">Sections</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/${c.slug}`} className="text-[0.95rem] text-white/80 transition-colors hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Tollab Nation" className="lg:col-span-3">
            <h2 className="kicker text-white/45">Tollab Nation</h2>
            <ul className="mt-5 space-y-3">
              {[
                { href: "/updates", label: "Live updates" },
                { href: "/about", label: "About us" },
                { href: "/contact?topic=partner&from=footer", label: "Advertise with us" },
                { href: "/contact", label: "Contact & tips" },
                { href: "/privacy-policy", label: "Privacy policy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[0.95rem] text-white/80 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Oversized wordmark */}
        <p
          aria-hidden="true"
          className="mt-16 select-none whitespace-nowrap display text-[15vw] uppercase leading-[0.8] xl:text-[12.5rem] text-white/[0.06] xl:text-[7.25rem]"
          data-reveal
        >
          TOLLAB <span className="text-red/40">NATION</span>
        </p>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Tollab Nation. All rights reserved.</p>
          <a href="https://tarekhatib.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
            Built by @tarekhatib
          </a>
        </div>
      </div>
    </footer>
  );
}
