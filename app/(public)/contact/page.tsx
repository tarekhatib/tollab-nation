import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { MailIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Tollab Nation. Send us a story tip, a correction, or an advertising inquiry.",
};

type Props = { searchParams: Promise<{ topic?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { topic } = await searchParams;
  const partner = topic === "partner";

  const channels = [
    { href: `mailto:${SITE.email}`, label: "Email", value: SITE.email, icon: <MailIcon /> },
    { href: SITE.whatsappDirect, label: "WhatsApp", value: SITE.phone, icon: <WhatsAppIcon /> },
  ];

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mb-12 border-b-[3px] border-line-strong pb-8">
        <p className="kicker animate-rise text-accent-ink">{partner ? "Advertise & partner" : "Contact"}</p>
        <h1
          className="animate-rise mt-4 max-w-4xl display text-5xl uppercase leading-[0.92] sm:text-7xl"
          style={{ "--d": 1 } as React.CSSProperties}
        >
          {partner ? "Put your brand in front of Lebanon’s students." : "Got a tip, a correction or a question?"}
        </h1>
        <p lang="ar" dir="rtl" className="animate-rise mt-4 text-xl text-ink-muted" style={{ "--d": 2 } as React.CSSProperties}>
          {partner ? "أعلن معنا" : "تواصل معنا"}
        </p>
      </header>

      <div className="grid gap-14 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-5">
          {partner ? (
            <div className="space-y-4 text-ink-soft">
              <p>We work with brands, universities and organisations on:</p>
              <ul className="space-y-3">
                {[
                  "Sponsored stories and campaigns",
                  "Placements on tollabn.com",
                  "Posts across our WhatsApp channel and Instagram",
                  "Student events and activations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-red" aria-hidden="true" />
                    <span className="text-ink">{item}</span>
                  </li>
                ))}
              </ul>
              <p>Tell us your goal, timeline and budget, and we&rsquo;ll reply with options.</p>
            </div>
          ) : (
            <p className="max-w-md text-lg text-ink-soft">
              Story tips, corrections, press inquiries or general feedback. We read everything and reply as
              soon as we can.
            </p>
          )}

          <ul className="divide-y divide-line border-y border-line">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 py-5"
                >
                  <span className="grid size-12 place-items-center rounded-full border border-line text-ink-soft transition-all duration-300 group-hover:border-red group-hover:bg-red group-hover:text-white">
                    {c.icon}
                  </span>
                  <span>
                    <span className="kicker block text-ink-muted">{c.label}</span>
                    <span className="link-wipe mt-1 inline-block text-lg font-semibold">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className="kicker mb-6 text-ink-muted">Send a message</h2>
          <ContactForm key={partner ? "partner" : "general"} partner={partner} />
        </div>
      </div>
    </main>
  );
}
