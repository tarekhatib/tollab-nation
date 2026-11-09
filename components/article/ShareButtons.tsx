"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/ui/Icons";

type Props = { title: string };

const btn =
  "grid size-10 place-items-center rounded-full border border-line text-ink-soft transition-all duration-300 hover:-translate-y-0.5 hover:text-white";

export default function ShareButtons({ title }: Props) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof window !== "undefined" ? window.location.href : "");
  const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer,width=600,height=600");

  const copyLink = () => {
    navigator.clipboard.writeText(url()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const nativeShare = () => {
    if (navigator.share) navigator.share({ title, url: url() }).catch(() => {});
    else copyLink();
  };

  return (
    <div className="flex items-center gap-2" dir="ltr">
      <span className="kicker mr-1 text-ink-muted">Share</span>

      <button type="button" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url()}`)}`)} aria-label="Share on WhatsApp" className={`${btn} hover:border-[#25D366] hover:bg-[#25D366]`}>
        <WhatsAppIcon size={17} />
      </button>
      <button type="button" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`)} aria-label="Share on Facebook" className={`${btn} hover:border-[#1877F2] hover:bg-[#1877F2]`}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" /></svg>
      </button>
      <button type="button" onClick={() => open(`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url())}`)} aria-label="Share on X" className={`${btn} hover:border-ink hover:bg-ink hover:!text-page`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      </button>
      <button type="button" onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`)} aria-label="Share on LinkedIn" className={`${btn} hover:border-[#0A66C2] hover:bg-[#0A66C2]`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
      </button>
      <button type="button" onClick={nativeShare} aria-label="More sharing options" className={`${btn} hover:border-accent hover:bg-accent`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" /></svg>
      </button>
      <button type="button" onClick={copyLink} aria-label="Copy link" className={`${btn} hover:border-ink hover:bg-ink hover:!text-page`}>
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
        )}
      </button>
      <span role="status" className={`kicker text-accent-ink transition-opacity ${copied ? "opacity-100" : "opacity-0"}`}>Copied</span>
    </div>
  );
}
