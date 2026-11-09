-- Authors: writers credited on articles.
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT NOT NULL DEFAULT '',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- Articles optionally credit one author; deleting an author keeps the article.
ALTER TABLE "Article" ADD COLUMN "authorId" INTEGER;
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Founding authors, verified, on the default avatar until photos are uploaded.
INSERT INTO "Author" ("name", "slug", "isVerified", "updatedAt") VALUES
    ('Mohannad Ghandour', 'mohannad-ghandour', true, CURRENT_TIMESTAMP),
    ('Tarek Al Khatib',   'tarek-al-khatib',   true, CURRENT_TIMESTAMP),
    ('Hani Ajami',        'hani-ajami',        true, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
