-- Authors are shown by first name + family initial only (names and profile URLs).
UPDATE "Author" SET "name" = 'Mohannad G', "slug" = 'mohannad-g', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'mohannad-ghandour';
UPDATE "Author" SET "name" = 'Tariq K',    "slug" = 'tariq-k',    "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'tarek-al-khatib';
UPDATE "Author" SET "name" = 'Hani A',     "slug" = 'hani-a',     "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'hani-ajami';

-- New authors, verified, on the default avatar.
INSERT INTO "Author" ("name", "slug", "isVerified", "updatedAt") VALUES
    ('Serge G',  'serge-g',  true, CURRENT_TIMESTAMP),
    ('Wasim A',  'wasim-a',  true, CURRENT_TIMESTAMP),
    ('Mariam H', 'mariam-h', true, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
