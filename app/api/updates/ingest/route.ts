import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseWhatsAppUpdate } from "@/lib/parse-update";
import { saveQuickUpdate } from "@/lib/quick-updates";

/**
 * Receives WhatsApp channel posts from the listener (whatsapp-listener/) and
 * publishes them as live updates, exactly as if pasted into the admin form.
 *
 * Auth: `Authorization: Bearer <INGEST_SECRET>`. This key can only create live
 * updates, so it is far safer to hand out than admin credentials.
 *
 * Body: { text: string, hasVideo?: boolean }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.INGEST_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { text?: unknown; hasVideo?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.hasVideo === true) {
    return NextResponse.json({ skipped: "video" });
  }
  if (typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ skipped: "no text" });
  }

  const { textAr, textEn } = parseWhatsAppUpdate(body.text);
  // Promos, sponsor posts and one-language posts are not news updates.
  if (!textAr || !textEn) {
    return NextResponse.json({ skipped: "needs both Arabic and English" });
  }

  // The listener can resend after a reconnect; never publish the same post twice.
  const duplicate = await prisma.quickUpdate.findFirst({
    where: {
      textAr,
      textEn,
      createdAt: { gt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json({ skipped: "duplicate", id: duplicate.id });
  }

  const update = await saveQuickUpdate({ textAr, textEn });
  return NextResponse.json({ published: update.id }, { status: 201 });
}
