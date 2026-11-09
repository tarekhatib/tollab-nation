import { createHash, timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/** Constant-time string comparison (hash first so lengths always match). */
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/*
 * Brute-force brake: after 5 failed sign-ins for the same email or IP within
 * 15 minutes, further attempts are refused for 15 minutes. Kept in memory, so it's
 * per server instance (best effort on serverless) — pair it with a long password.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; first: number }>();

function isLocked(key: string) {
  const f = failures.get(key);
  if (!f) return false;
  if (Date.now() - f.first > WINDOW_MS) {
    failures.delete(key);
    return false;
  }
  return f.count >= MAX_FAILURES;
}
function recordFailure(key: string) {
  const f = failures.get(key);
  if (!f || Date.now() - f.first > WINDOW_MS) failures.set(key, { count: 1, first: Date.now() });
  else f.count++;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) return null; // never allow login with unset credentials

        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const keys = [`ip:${ip}`, `email:${email}`];

        if (keys.some(isLocked)) {
          await sleep(1000);
          return null;
        }

        // Evaluate both comparisons every time (no early exit that leaks which one failed).
        const emailOk = safeEqual(email, adminEmail);
        const passwordOk = safeEqual(password, adminPassword);
        if (emailOk && passwordOk) {
          keys.forEach((k) => failures.delete(k));
          return { id: "1", email: adminEmail, name: "Admin" };
        }

        keys.forEach(recordFailure);
        await sleep(700); // slows down guessing
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  // Needed off Vercel (Render, Railway, `next start`): without it Auth.js rejects the host.
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // sign in again weekly
  },
});
