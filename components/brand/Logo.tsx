import { NATION_PATH, TOLLAB_PATH } from "./wordmark-paths";

type MarkProps = {
  className?: string;
  /** Animate the cap/stem/legs in on first paint. */
  animated?: boolean;
  title?: string;
  /** Use when the mark is drawn translucent (e.g. as a watermark): cap and stem don't overlap. */
  notched?: boolean;
};

/** The mark's shapes, shared by <Mark /> and the full <Logo /> lockup. */
function MarkShapes({ notched = false }: { notched?: boolean }) {
  return (
    <>
      <g className="tn-leg" fill="var(--red, #ED1C24)">
        <polygon points="10,34 34,34 38,38 38,62 26,50 26,90 10,90" />
        <polygon points="62,62 74,74 74,34 90,34 90,90 66,90 62,86" />
      </g>
      {notched ? (
        // Stem starts exactly at the cap's lower edge, so the shapes never overlap:
        // for translucent use, where an overlap would show as a darker double layer.
        <polygon className="tn-stem" points="42,27.52 50,30 58,27.52 58,90 42,90" fill="currentColor" />
      ) : (
        // Solid use: tuck the stem under the cap so there is no anti-aliased seam.
        <rect className="tn-stem" x="42" y="24" width="16" height="66" fill="currentColor" />
      )}
      <g className="tn-cap-tilt">
        <polygon className="tn-cap" points="50,4 92,17 50,30 8,17" fill="currentColor" />
      </g>
    </>
  );
}

/**
 * Cap mark: a flat mortarboard on the T, red N legs either side.
 * The T and cap use currentColor so the mark follows the theme; the N is always brand red.
 */
export function Mark({ className = "", animated = false, title, notched = false }: MarkProps) {
  return (
    <svg
      viewBox="4 0 92 94"
      className={`${animated ? "tn-mark" : ""} ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <MarkShapes notched={notched} />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  animated?: boolean;
  /** Show only the mark below 380px wide. */
  compactOnMobile?: boolean;
  size?: "sm" | "md" | "lg";
};

const HEIGHTS = { sm: "h-8", md: "h-10 sm:h-11", lg: "h-16" } as const;

/**
 * Full Cap lockup, drawn from the logo artwork: mark + stacked
 * TOLLAB (ink, follows the theme) / NATION (red) in Big Shoulders Display Black.
 */
export function Logo({ className = "", animated = false, compactOnMobile = false, size = "md" }: LogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <svg
        viewBox="4 0 264 94"
        className={`${HEIGHTS[size]} w-auto ${animated ? "tn-mark" : ""} ${compactOnMobile ? "hidden min-[380px]:block" : "block"}`}
        aria-hidden="true"
        focusable="false"
      >
        <MarkShapes />
        <path d={TOLLAB_PATH} fill="currentColor" />
        <path d={NATION_PATH} fill="var(--red, #ED1C24)" />
      </svg>
      {compactOnMobile && <Mark animated={animated} className={`${HEIGHTS[size]} w-auto min-[380px]:hidden`} />}
      <span className="sr-only">Tollab Nation</span>
    </span>
  );
}
