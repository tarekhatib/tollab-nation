-- Default sections, so a fresh database is usable right after `prisma migrate deploy`.
INSERT INTO "Category" ("name", "slug", "updatedAt") VALUES
  ('General', 'general', CURRENT_TIMESTAMP),
  ('Politics', 'politics', CURRENT_TIMESTAMP),
  ('Exclusive', 'exclusive', CURRENT_TIMESTAMP),
  ('Economy', 'economy', CURRENT_TIMESTAMP),
  ('Security', 'security', CURRENT_TIMESTAMP),
  ('World', 'world', CURRENT_TIMESTAMP),
  ('Sport', 'sport', CURRENT_TIMESTAMP),
  ('Weather', 'weather', CURRENT_TIMESTAMP),
  ('History', 'history', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
