import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCronAuthorized } from "@/lib/cron-auth";
import { uploadImage, isManagedImage } from "@/lib/storage";

async function fetchAndStore(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (!type.startsWith("image/")) return null; // not an image (e.g. an HTML page)
    const ab = await res.arrayBuffer();
    if (ab.byteLength > 15 * 1024 * 1024) return null;
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").pop() || `image-${Date.now()}`;
    return await uploadImage(ab, "covers", name, type);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!isCronAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[migrate-covers] Starting migration...");

  // Find articles with external cover images
  const articles = await prisma.article.findMany({
    where: { coverImage: { not: null } },
  });
  const toMigrate = articles.filter(
    (a) =>
      a.coverImage &&
      a.coverImage.startsWith("http") &&
      !isManagedImage(a.coverImage),
  );

  console.log(`[migrate-covers] Found ${toMigrate.length} articles to migrate`);

  const results: { id: number; from: string; to: string | null }[] = [];

  for (const art of toMigrate) {
    const from = art.coverImage as string;
    console.log(`[migrate-covers] Migrating article ${art.id}: ${from}`);
    const stored = await fetchAndStore(from);
    if (stored) {
      await prisma.article.update({
        where: { id: art.id },
        data: { coverImage: stored },
      });
      results.push({ id: art.id, from, to: stored });
      console.log(`[migrate-covers] ✓ Article ${art.id} migrated`);
    } else {
      results.push({ id: art.id, from, to: null });
      console.log(`[migrate-covers] ✗ Failed to migrate article ${art.id}`);
    }
  }

  console.log("[migrate-covers] Migration complete");
  return NextResponse.json({ migrated: results.length, details: results });
}
