"use client";

import { useState, useTransition, useRef } from "react";
import { uploadImage } from "@/lib/upload-image";
import { useRouter } from "next/navigation";
import { createAd, updateAd } from "@/server/actions/ads";

interface Article {
  id: number;
  title: string;
}

interface Props {
  articles: Article[];
  ad?: {
    id: number;
    imageUrl: string;
    linkUrl: string;
    text: string | null;
    position: number;
    expiresAt: Date | null;
    showOnAll: boolean;
    isActive: boolean;
    articles: { articleId: number }[];
  };
}

const POSITIONS = [
  {
    value: 1,
    label: "Position 1 — Above Title",
    description: "Banner above the article headline. Best for wide landscape images.",
  },
  {
    value: 2,
    label: "Position 2 — Before Content",
    description: "Between the cover image and the article text. Seen by every reader before they start.",
  },
  {
    value: 3,
    label: "Position 3 — Mid Content",
    description: "Injected in the middle of the article. Catches readers who are actively engaged.",
  },
  {
    value: 4,
    label: "Position 4 — End of Article",
    description: "Shown directly after the article text, before the sharing and follow-up actions.",
  },
];

export default function AdForm({ articles, ad }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(ad?.imageUrl ?? "");
  const [linkUrl, setLinkUrl] = useState(ad?.linkUrl ?? "");
  const [text, setText] = useState(ad?.text ?? "");
  const [position, setPosition] = useState(ad?.position ?? 2);
  const [durationDays, setDurationDays] = useState<string>("");
  const [showOnAll, setShowOnAll] = useState(ad?.showOnAll ?? true);
  const [isActive, setIsActive] = useState(ad?.isActive ?? true);

  const existingExpiry = ad?.expiresAt ? new Date(ad.expiresAt) : null;
  const remainingDays = existingExpiry
    ? Math.ceil((existingExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<number>>(
    new Set(ad?.articles.map((a) => a.articleId) ?? [])
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setError("");
      const url = await uploadImage(file, "ads");
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function toggleArticle(id: number) {
    setSelectedArticleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedArticleIds(new Set(articles.map((a) => a.id)));
  }

  function deselectAll() {
    setSelectedArticleIds(new Set());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!imageUrl) { setError("Image is required."); return; }
    if (!linkUrl) { setError("Link URL is required."); return; }

    const parsedDays = parseInt(durationDays);
    const payload = {
      imageUrl,
      linkUrl,
      text: text.trim() || null,
      position,
      durationDays: durationDays.trim() && parsedDays > 0 ? parsedDays : null,
      showOnAll,
      isActive,
      articleIds: showOnAll ? [] : Array.from(selectedArticleIds),
    };

    startTransition(async () => {
      const result = ad ? await updateAd(ad.id, payload) : await createAd(payload);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.push("/admin/ads");
      }
    });
  }

  const allSelected = selectedArticleIds.size === articles.length;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

      {/* Image */}
      <div className="bg-canvas border border-line p-5 space-y-3">
        <label className="block text-sm font-semibold text-ink">Ad Image</label>
        {imageUrl && (
          <div className=" overflow-hidden border border-line bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Ad preview" className="w-full h-auto block" />
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://… or upload →"
            className="flex-1 min-w-0 px-4 py-2.5 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 rounded-full border border-line bg-surface text-sm text-ink-soft hover:text-ink hover:bg-surface transition-colors shrink-0 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {/* Link URL */}
      <div className="bg-canvas border border-line p-5 space-y-2">
        <label className="block text-sm font-semibold text-ink">Destination Link</label>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://example.com/…"
          required
          className="w-full px-4 py-2.5 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Optional caption */}
      <div className="bg-canvas border border-line p-5 space-y-2">
        <label className="block text-sm font-semibold text-ink">
          Caption <span className="text-ink-muted font-normal">(optional)</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Short text shown below the ad image…"
          rows={2}
          className="w-full px-4 py-2.5 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>

      {/* Position */}
      <div className="bg-canvas border border-line p-5 space-y-3">
        <p className="text-sm font-semibold text-ink">Ad Position</p>
        <p className="text-xs text-ink-muted -mt-1">Each article supports one ad per position.</p>
        <div className="space-y-2">
          {POSITIONS.map((p) => (
            <label
              key={p.value}
              className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                position === p.value
                  ? "border-accent bg-accent/5"
                  : "border-line hover:bg-surface"
              }`}
            >
              <input
                type="radio"
                name="position"
                checked={position === p.value}
                onChange={() => setPosition(p.value)}
                className="accent-accent mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-ink">{p.label}</p>
                <p className="text-xs text-ink-soft mt-0.5">{p.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="bg-canvas border border-line p-5 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Duration <span className="text-ink-muted font-normal">(optional)</span>
          </label>
          <p className="text-xs text-ink-muted mb-3">
            Ad will be automatically set to inactive after this many days. Leave empty to run indefinitely.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="e.g. 30"
              className="w-32 px-4 py-2.5 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="text-sm text-ink-soft">days from now</span>
          </div>
        </div>
        {existingExpiry && (
          <div className={`text-xs px-3 py-2 ${
            remainingDays !== null && remainingDays <= 0
              ? "bg-red-50 border border-red-200 text-red-700"
              : remainingDays !== null && remainingDays <= 7
              ? "bg-amber-50 border border-amber-200 text-amber-700"
              : "bg-surface border border-line text-ink-soft"
          }`}>
            {remainingDays !== null && remainingDays <= 0
              ? `Expired on ${existingExpiry.toLocaleDateString()}`
              : `Currently expires ${existingExpiry.toLocaleDateString()} · ${remainingDays} day${remainingDays !== 1 ? "s" : ""} remaining`}
            {" — "}
            <span className="font-medium">entering a new duration above will reset it from today</span>
          </div>
        )}
      </div>

      {/* Active toggle */}
      <div className="bg-canvas border border-line p-5">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-ink">Active</span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isActive ? "bg-accent" : "bg-line"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
        <p className="text-xs text-ink-muted mt-1">Inactive ads are not shown to readers.</p>
      </div>

      {/* Article targeting */}
      <div className="bg-canvas border border-line p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-ink mb-1">Show On</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={showOnAll}
                onChange={() => setShowOnAll(true)}
                className="accent-accent"
              />
              <span className="text-sm text-ink">All articles</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!showOnAll}
                onChange={() => setShowOnAll(false)}
                className="accent-accent"
              />
              <span className="text-sm text-ink">Selected articles only</span>
            </label>
          </div>
        </div>

        {!showOnAll && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-ink-soft">
                {selectedArticleIds.size} of {articles.length} selected
              </span>
              <button
                type="button"
                onClick={allSelected ? deselectAll : selectAll}
                className="text-xs font-medium text-accent hover:underline"
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-line border border-line">
              {articles.map((article) => (
                <label
                  key={article.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedArticleIds.has(article.id)}
                    onChange={() => toggleArticle(article.id)}
                    className="accent-accent"
                  />
                  <span className="text-sm text-ink line-clamp-1">{article.title}</span>
                </label>
              ))}
              {articles.length === 0 && (
                <p className="px-4 py-3 text-sm text-ink-muted">No articles published yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit — pinned within thumb reach on phones; errors show right here */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-line bg-page/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        {error && <p role="alert" className="mb-2 text-sm font-medium text-accent-ink">{error}</p>}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="submit"
            disabled={isPending || uploading}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50 sm:flex-none"
          >
            {isPending ? "Saving…" : uploading ? "Uploading…" : ad ? "Save changes" : "Create ad"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/ads")}
            className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
