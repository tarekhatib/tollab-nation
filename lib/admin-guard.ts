import { auth } from "@/auth";

/**
 * Every admin server action must call this first. Server actions are public
 * POST endpoints reachable from any URL (their IDs ship in client JS), so the
 * /admin route guard in proxy.ts does NOT protect them.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized.");
  return session;
}
