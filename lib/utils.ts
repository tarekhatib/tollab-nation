export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF\s]+/g, (match) => match.trim().replace(/\s+/g, "-"))
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "text" && typeof n.text === "string") return n.text;
  if (Array.isArray(n.content)) return (n.content as unknown[]).map(extractText).join(" ");
  return "";
}

export function readingTime(content: unknown): number {
  const words = extractText(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "Just now", "12 min ago", "3 h ago", "Yesterday", "12 Jun". */
export function timeAgo(date: Date | string, now = new Date()): string {
  const d = new Date(date);
  const mins = Math.round((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== now.getFullYear() && { year: "numeric" }),
    timeZone: "Asia/Beirut",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Beirut" });
}
