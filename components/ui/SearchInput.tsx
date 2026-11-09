"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { SearchIcon } from "@/components/ui/Icons";

export default function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="group relative">
      <SearchIcon size={26} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-ink" />
      <input
        ref={inputRef}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search stories… ابحث"
        aria-label="Search stories"
        autoFocus
        dir="auto"
        className="w-full border-0 border-b-[3px] border-line bg-transparent py-4 pl-10 pr-28 font-wide text-2xl font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-muted/70 focus:border-red sm:text-4xl"
      />
      <button
        type="submit"
        className="absolute right-0 top-1/2 h-11 -translate-y-1/2 rounded-full bg-ink px-5 text-sm font-semibold text-page transition-colors hover:bg-accent hover:text-white"
      >
        Search
      </button>
    </form>
  );
}
