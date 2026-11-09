import Link from "next/link";
import Image from "next/image";
import { getAds } from "@/server/queries/ads";
import AdActions from "@/components/admin/AdActions";

export default async function AdsPage() {
  const ads = await getAds();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-line-strong pb-5">
        <div>
          <h1 className="display text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">Ads</h1>
          <p className="mt-3 text-sm text-ink-muted">{ads.length} ad{ads.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/ads/new"
          className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          + New ad
        </Link>
      </div>

      <div className="bg-canvas border border-line divide-y divide-line">
        {ads.map((ad) => (
          <div key={ad.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:flex-nowrap sm:px-5">
            {/* Thumbnail */}
            <div className="relative w-24 h-14 overflow-hidden shrink-0 bg-surface border border-line">
              <Image
                src={ad.imageUrl}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-surface border border-line text-ink-soft">
                  {ad.position === 1 ? "Pos 1 · Above Title" : ad.position === 2 ? "Pos 2 · Before Content" : "Pos 3 · Mid Content"}
                </span>
              </div>
              <p className="text-sm font-medium text-ink truncate">
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  {ad.linkUrl}
                </a>
              </p>
              {ad.text && (
                <p className="text-xs text-ink-soft mt-0.5 truncate">{ad.text}</p>
              )}
              <p className="text-xs text-ink-muted mt-0.5">
                {ad.showOnAll
                  ? "All articles"
                  : `${ad.articles.length} article${ad.articles.length !== 1 ? "s" : ""}`}
                {ad.expiresAt && (() => {
                  const days = Math.ceil((new Date(ad.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return days <= 0
                    ? <span className="ml-2 text-red-500">· Expired</span>
                    : <span className={days <= 7 ? "ml-2 text-amber-600" : "ml-2"}>· {days}d left</span>;
                })()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex w-full shrink-0 items-center justify-end gap-3 sm:w-auto">
              <AdActions id={ad.id} isActive={ad.isActive} />
              <Link
                href={`/admin/ads/${ad.id}/edit`}
                className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}

        {ads.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-ink-soft">
            No ads yet.{" "}
            <Link href="/admin/ads/new" className="text-accent hover:underline">
              Create one
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
