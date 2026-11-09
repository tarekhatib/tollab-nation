import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

/**
 * Uptime check (UptimeRobot etc.).
 *
 *   GET /api/health        → 200 when the app is serving. Doesn't touch the
 *                            database, so frequent pings don't keep Neon's free
 *                            compute awake (it sleeps after 5 idle minutes).
 *   GET /api/health?db=1   → also runs `SELECT 1`; 503 if the database is down.
 *                            Use a long interval (e.g. hourly) for this one.
 */
export async function GET(req: NextRequest) {
  const checkDb = req.nextUrl.searchParams.get("db") === "1";
  const started = Date.now();

  if (!checkDb) {
    return NextResponse.json({ status: "ok", time: new Date().toISOString() }, { headers });
  }

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
    ]);
    return NextResponse.json(
      { status: "ok", database: "ok", latencyMs: Date.now() - started, time: new Date().toISOString() },
      { headers }
    );
  } catch (err) {
    console.error("[health] database check failed", err);
    return NextResponse.json(
      { status: "error", database: "unreachable", time: new Date().toISOString() },
      { status: 503, headers }
    );
  }
}

/** UptimeRobot's HTTP monitors send HEAD by default. */
export async function HEAD(req: NextRequest) {
  const res = await GET(req);
  return new NextResponse(null, { status: res.status, headers: res.headers });
}
