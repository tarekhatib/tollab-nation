"use client";

import { useSyncExternalStore } from "react";

/** A story saved for later. Kept on the device (localStorage) — no account needed. */
export type SavedStory = {
  href: string;
  title: string;
  titleEn?: string | null;
  image?: string | null;
  category: string;
  publishedAt: string;
  savedAt: number;
};

const KEY = "tollab-saved";
const EVENT = "tollab-saved-change";
const EMPTY: SavedStory[] = [];

let cacheRaw: string | null = null;
let cacheList: SavedStory[] = EMPTY;

function read(): SavedStory[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cacheRaw) return cacheList;
  cacheRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cacheList = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cacheList = EMPTY;
  }
  return cacheList;
}

function write(list: SavedStory[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full or blocked: nothing to persist to */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useSavedStories() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function toggleSaved(story: Omit<SavedStory, "savedAt">) {
  const list = read();
  const exists = list.some((s) => s.href === story.href);
  write(exists ? list.filter((s) => s.href !== story.href) : [{ ...story, savedAt: Date.now() }, ...list].slice(0, 200));
  return !exists;
}

export function removeSaved(href: string) {
  write(read().filter((s) => s.href !== href));
}
