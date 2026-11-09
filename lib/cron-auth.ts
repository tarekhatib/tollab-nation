/**
 * Cron endpoints are called by Vercel Cron (or any scheduler) with
 * `Authorization: Bearer <CRON_SECRET>`. Refuse everything when the secret is unset,
 * otherwise "Bearer undefined" would be accepted.
 */
export function isCronAuthorized(authorization: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && authorization === `Bearer ${secret}`;
}
