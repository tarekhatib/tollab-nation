/**
 * Turns a post copied from the WhatsApp channel into the two texts a quick
 * update stores. Typical input:
 *
 *   *ترمب: لسنا بحاجة إلى اتفاق مع إيران*
 *   🇺🇸🗣🇮🇷‼️
 *   *Trump: We do not need a deal with Iran*
 *
 * Shared by the admin form (live preview) and the server action (final clean),
 * so whatever the preview shows is exactly what gets saved.
 */

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
const LATIN = /[A-Za-z]/g;

// Emoji and the invisible pieces they are built from: flags (regional
// indicators), skin tones, variation selectors, zero-width joiners, keycaps.
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}︎️‍⃣]/gu;

/** Strip WhatsApp formatting (*bold*, _italic_, ~strike~, ```mono```) and emoji. */
export function cleanUpdateText(s: string): string {
  return s
    .replace(EMOJI, "")
    .replace(/```/g, "")
    .replace(/[*~]/g, "")
    // Underscores only when they wrap text, so snake_case or URLs survive.
    .replace(/(^|\s)_+/g, "$1")
    .replace(/_+(?=\s|$)/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

/** Split a pasted WhatsApp post into Arabic and English by each line's script. */
export function parseWhatsAppUpdate(raw: string): { textAr: string; textEn: string } {
  const ar: string[] = [];
  const en: string[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const text = cleanUpdateText(line);
    if (!text) continue;
    const arabic = text.match(ARABIC)?.length ?? 0;
    const latin = text.match(LATIN)?.length ?? 0;
    if (!arabic && !latin) continue; // only numbers or punctuation left over
    // Majority wins, so "ترمب (Trump)" stays Arabic and "Hezbollah (حزب الله)" stays English.
    (arabic >= latin ? ar : en).push(text);
  }

  return { textAr: ar.join(" "), textEn: en.join(" ") };
}
