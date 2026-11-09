"use client";

import { useState } from "react";
import { submitContactForm } from "@/server/actions/contact";

type Props = { partner?: boolean };

const field =
  "w-full border-0 border-b-2 border-line bg-transparent px-0 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-red";

export default function ContactForm({ partner = false }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    partner ? "Hi Tollab Nation, we'd like to talk about advertising / a partnership.\n\nOrganisation:\nWhat we want to achieve:\nTimeline and budget:\n" : ""
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const result = await submitContactForm(name, email, message);

    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
    } else {
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    }
  }

  if (status === "success") {
    return (
      <div className="animate-rise border-t-[3px] border-line-strong py-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="display text-3xl uppercase text-ink">Message sent</p>
        <p className="text-sm text-ink-muted">We&rsquo;ll get back to you soon.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-semibold text-accent-ink hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="kicker block text-ink-muted">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="kicker block text-ink-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="kicker block text-ink-muted">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={partner ? 7 : 5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${field} resize-y`}
          placeholder="How can we help?"
        />
      </div>

      {status === "error" && <p role="alert" className="text-sm font-medium text-accent-ink">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-12 items-center rounded-full bg-ink px-7 font-semibold text-page transition-colors hover:bg-accent hover:text-white disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
