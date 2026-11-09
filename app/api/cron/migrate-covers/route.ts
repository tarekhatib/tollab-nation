import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isCronAuthorized } from "@/lib/cron-auth";
import { uploadImage, isManagedImage, type StorageFolder } from "@/lib/storage";

// Copies many images in one run; give it room.
export const maxDuration = 300;

const needsCopy = (url: unknown): url is string =>
  typeof url === "string" && url.startsWith("http") && !isManagedImage(url);

/** Image type from the file's first bytes, for servers that send "application/octet-stream". */
function sniffImageType(ab: ArrayBuffer): string | null {
  const b = new Uint8Array(ab.slice(0, 12));
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 3) === "GIF") return "image/gif";
  if (ascii(4, 12) === "ftypavif") return "image/avif";
  return null;
}

async function fetchAndStore(url: string, folder: StorageFolder) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    const header = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (header && !header.startsWith("image/") && header !== "application/octet-stream") return null; // e.g. an HTML page
    const ab = await res.arrayBuffer();
    if (ab.byteLength > 15 * 1024 * 1024) return null;
    const type = header.startsWith("image/") ? header : sniffImageType(ab);
    if (!type) return null;
    const name = new URL(url).pathname.split("/").pop() || `image-${Date.now()}`;
    return await uploadImage(ab, folder, name, type);
  } catch {
    return null;
  }
}

type Node = { type?: string; attrs?: { src?: unknown }; content?: Node[] };

/** Copies every image node in a TipTap document; returns the new doc, or null if nothing changed. */
async function copyContentImages(doc: Node): Promise<{ doc: Node; copied: number; failed: string[] } | null> {
  const nodes: Node[] = [];
  const walk = (n: Node) => {
    if (n.type === "image" && needsCopy(n.attrs?.src)) nodes.push(n);
    n.content?.forEach(walk);
  };
  walk(doc);
  if (nodes.length === 0) return null;

  let copied = 0;
  const failed: string[] = [];
  for (const n of nodes) {
    const from = n.attrs!.src as string;
    const to = await fetchAndStore(from, "content");
    if (to) {
      n.attrs!.src = to;
      copied++;
    } else failed.push(from);
  }
  return { doc, copied, failed };
}

/**
 * Copies article images that live outside this project's Blob store (other
 * sites, or an old Blob store) into it, for covers and images inside articles.
 * Safe to run again: images already in the store are skipped.
 */
export async function POST(req: NextRequest) {
  if (!isCronAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await prisma.article.findMany({
    select: { id: true, coverImage: true, content: true },
  });

  const results: { id: number; cover?: string | null; contentCopied?: number; failed: string[] }[] = [];

  async function migrate(a: (typeof articles)[number]) {
    const data: Prisma.ArticleUpdateInput = {};
    const row: (typeof results)[number] = { id: a.id, failed: [] };

    if (needsCopy(a.coverImage)) {
      const stored = await fetchAndStore(a.coverImage, "covers");
      row.cover = stored;
      if (stored) data.coverImage = stored;
      else row.failed.push(a.coverImage);
    }

    const content = await copyContentImages(a.content as Node);
    if (content) {
      row.contentCopied = content.copied;
      row.failed.push(...content.failed);
      if (content.copied) data.content = content.doc as Prisma.InputJsonValue;
    }

    if (Object.keys(data).length) await prisma.article.update({ where: { id: a.id }, data });
    if (row.cover !== undefined || row.contentCopied !== undefined) results.push(row);
  }

  // A few at a time: fast, without hammering the source sites.
  for (let i = 0; i < articles.length; i += 6) {
    await Promise.all(articles.slice(i, i + 6).map(migrate));
  }

  const failed = results.flatMap((r) => r.failed);
  if (failed.length) console.warn(`[migrate-images] ${failed.length} image(s) could not be copied`);
  return NextResponse.json({ articles: results.length, failed: failed.length, details: results });
}
