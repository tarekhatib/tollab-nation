import Image from "next/image";

interface Props {
  imageUrl: string;
  linkUrl: string;
  text?: string | null;
}

export default function ArticleAd({ imageUrl, linkUrl, text }: Props) {
  return (
    <div className="my-6">
      <p className="kicker text-ink-muted mb-2">Sponsored</p>
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group block overflow-hidden border border-line"
      >
        {/* Keeps the ad's own aspect ratio (no crop) in every placement */}
        <div className="img-zoom overflow-hidden">
          <Image
            src={imageUrl}
            alt="Advertisement"
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, 768px"
            className="block h-auto w-full"
          />
        </div>
        {text && (
          <div className="px-4 py-3 bg-surface border-t border-line">
            <p className="text-sm text-ink">{text}</p>
          </div>
        )}
      </a>
    </div>
  );
}