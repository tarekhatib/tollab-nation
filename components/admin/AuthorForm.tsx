"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAuthor, deleteAuthor, updateAuthor } from "@/server/actions/authors";
import { slugify } from "@/lib/utils";


type Props = {
  author?: {
    id: number;
    name: string;
    slug: string;
    bio: string;
    isVerified: boolean;
    articleCount: number;
  };
};

const input =
  "w-full px-4 py-2.5 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent";

export default function AuthorForm({ author }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(author?.name ?? "");
  const [slug, setSlug] = useState(author?.slug ?? "");
  const slugEdited = useRef(!!author);
  const [bio, setBio] = useState(author?.bio ?? "");
  const [isVerified, setIsVerified] = useState(author?.isVerified ?? true);
  const [error, setError] = useState("");

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = { name, slug, bio, isVerified };
    startTransition(async () => {
      try {
        if (author) await updateAuthor(author.id, payload);
        else await createAuthor(payload);
        router.push("/admin/authors");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function remove() {
    if (!author) return;
    const note = author.articleCount
      ? `\n\nTheir ${author.articleCount} article(s) stay published and will be credited to "Tollab Nation".`
      : "";
    if (!confirm(`Delete ${author.name}?${note}`)) return;
    startTransition(async () => {
      try {
        await deleteAuthor(author.id);
        router.push("/admin/authors");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      <div>
        <label htmlFor="author-name" className="block text-sm font-medium text-ink mb-1">Full name</label>
        <input
          id="author-name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited.current) setSlug(slugify(e.target.value));
          }}
          placeholder="e.g. Mohannad Ghandour"
          className={input}
        />
      </div>

      <div>
        <label htmlFor="author-slug" className="block text-sm font-medium text-ink mb-1">
          Profile URL <span className="ml-1 text-xs font-normal text-ink-muted">/author/{slug || "…"}</span>
        </label>
        <input
          id="author-slug"
          value={slug}
          onChange={(e) => {
            slugEdited.current = true;
            setSlug(slugify(e.target.value));
          }}
          className={`${input} font-mono`}
        />
      </div>

      <div>
        <label htmlFor="author-bio" className="block text-sm font-medium text-ink mb-1">
          Short bio <span className="ml-1 text-xs font-normal text-ink-muted">optional, shown on their profile</span>
        </label>
        <textarea
          id="author-bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          dir="auto"
          className={`${input} resize-y`}
        />
      </div>

      <label className="flex items-center justify-between gap-4 border border-line bg-surface px-4 py-3">
        <span>
          <span className="block text-sm font-medium text-ink">Verified author</span>
          <span className="block text-xs text-ink-muted">Shows the red check next to their name on the site.</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isVerified}
          onClick={() => setIsVerified((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${isVerified ? "bg-accent" : "bg-ink/20"}`}
        >
          <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${isVerified ? "translate-x-5.5" : "translate-x-0.5"}`} />
        </button>
      </label>

      {error && <p role="alert" className="text-sm font-medium text-accent">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-full hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : author ? "Save changes" : "Create author"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
        >
          Cancel
        </button>
        {author && (
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="ml-auto px-3 py-2 text-sm font-medium text-ink-soft hover:text-red-500 transition-colors disabled:opacity-50"
          >
            Delete author
          </button>
        )}
      </div>
    </form>
  );
}
