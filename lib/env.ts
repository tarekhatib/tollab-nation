// Fail fast at boot if the essentials are missing.
const missing: string[] = [];
if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
// Auth.js v5 reads AUTH_SECRET; NEXTAUTH_SECRET is the older name and still accepted.
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) missing.push("AUTH_SECRET");

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}\nCopy .env.example to .env and fill it in.`
  );
}
