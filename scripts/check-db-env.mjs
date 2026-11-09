// Fails the build early (with a readable message) when the two database URLs
// don't point at the same database. Migrations use DATABASE_URL_UNPOOLED and the
// app uses DATABASE_URL — if they differ, migrations "succeed" on one database
// while the site reads another. Prints hosts/names only, never passwords.

function parse(name) {
  const raw = process.env[name];
  if (!raw) return { name, missing: true };
  try {
    const u = new URL(raw);
    return {
      name,
      endpoint: u.hostname.replace("-pooler", ""), // Neon: pooled host = direct host + "-pooler"
      host: u.hostname,
      database: u.pathname.replace(/^\//, ""),
      user: decodeURIComponent(u.username),
    };
  } catch {
    return { name, invalid: true };
  }
}

const app = parse("DATABASE_URL");
const direct = parse("DATABASE_URL_UNPOOLED");
const problems = [];

for (const v of [app, direct]) {
  if (v.missing) problems.push(`${v.name} is not set.`);
  if (v.invalid) problems.push(`${v.name} is not a valid postgres:// URL.`);
}

if (!problems.length) {
  if (app.endpoint !== direct.endpoint)
    problems.push(`They point at different servers:\n    DATABASE_URL          → ${app.host}\n    DATABASE_URL_UNPOOLED → ${direct.host}`);
  if (app.database !== direct.database)
    problems.push(`They point at different databases: "${app.database}" vs "${direct.database}".`);
  if (app.user !== direct.user)
    problems.push(`They use different users: "${app.user}" vs "${direct.user}".`);
}

if (problems.length) {
  console.error(
    "\n✖ Database settings don't match.\n\n  " +
      problems.join("\n  ") +
      "\n\n  Both must be the SAME Neon database: DATABASE_URL is the pooled string (host has\n" +
      '  "-pooler"), DATABASE_URL_UNPOOLED is the same string without "-pooler".\n' +
      `  Vercel environment: ${process.env.VERCEL_ENV ?? "local"}\n`
  );
  process.exit(1);
}

console.log(`✓ Database settings match (${direct.endpoint} / ${direct.database}, ${process.env.VERCEL_ENV ?? "local"})`);
