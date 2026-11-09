import { Mark } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { SITE } from "@/lib/site";

/** Red band pushing the WhatsApp channel — the main place readers follow the news. */
export default function ChannelCta() {
  return (
    <section className="relative isolate overflow-hidden bg-accent text-white" data-reveal>
      <Mark notched className="pointer-events-none absolute -right-10 -top-6 -z-10 h-[140%] w-auto text-black/15 [--red:rgb(0_0_0/0.12)] sm:right-6" />
      <div className="grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="kicker text-white/80">WhatsApp channel</p>
          <h2 className="mt-4 max-w-xl display text-5xl uppercase leading-[0.9] sm:text-7xl">
            Breaking news, straight to your phone.
          </h2>
          <p lang="ar" dir="rtl" className="mt-4 max-w-xl text-right text-lg font-medium text-white/90 sm:text-xl lg:text-left">
            الخبر العاجل يصلك أولاً على واتساب
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <a
            href={SITE.whatsappChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-base font-semibold text-[#0A0A0A] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] transition-transform duration-300 ease-(--ease-spring) hover:-translate-y-0.5 active:translate-y-0"
          >
            <WhatsAppIcon size={20} className="text-[#25D366] transition-transform duration-500 ease-(--ease-spring) group-hover:rotate-[-14deg] group-hover:scale-110" />
            Follow the channel
          </a>
          <p className="text-sm text-white/75">Free. No spam. Just the news.</p>
        </div>
      </div>
    </section>
  );
}
