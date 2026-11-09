import Link from "next/link";
import { Mark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <Mark animated className="h-24 w-auto text-ink" />
      <p className="kicker mt-10 text-accent-ink">Error 404</p>
      <h1 className="mt-3 display text-5xl uppercase sm:text-7xl">This story isn&rsquo;t here.</h1>
      <p lang="ar" dir="rtl" className="mt-3 text-lg text-ink-muted">الصفحة غير موجودة</p>
      <p className="mt-4 max-w-md text-ink-soft">It may have moved, or the link is wrong.</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-page transition-colors hover:bg-accent hover:text-white">
        Back to the front page
      </Link>
    </main>
  );
}
