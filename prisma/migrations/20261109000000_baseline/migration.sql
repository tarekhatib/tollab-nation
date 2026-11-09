-- Baseline: the full schema in one step (replaces the earlier, incomplete history).


-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "coverImage" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "titleAr" TEXT NOT NULL DEFAULT '',
    "authorId" INTEGER,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "Ad" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "text" TEXT,
    "showOnAll" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 2,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdOnArticle" (
    "adId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,

    CONSTRAINT "AdOnArticle_pkey" PRIMARY KEY ("adId","articleId")
);

-- CreateTable
CREATE TABLE "QuickUpdate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "textEn" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuickUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- CreateIndex
CREATE INDEX "Ad_position_idx" ON "Ad"("position");

-- CreateIndex
CREATE INDEX "QuickUpdate_createdAt_idx" ON "QuickUpdate"("createdAt");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdOnArticle" ADD CONSTRAINT "AdOnArticle_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdOnArticle" ADD CONSTRAINT "AdOnArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ── Default data ─────────────────────────────────────────────
-- Sections
INSERT INTO "Category" ("name", "slug", "updatedAt") VALUES
    ('General',   'general',   CURRENT_TIMESTAMP),
    ('Politics',  'politics',  CURRENT_TIMESTAMP),
    ('Exclusive', 'exclusive', CURRENT_TIMESTAMP),
    ('Economy',   'economy',   CURRENT_TIMESTAMP),
    ('Security',  'security',  CURRENT_TIMESTAMP),
    ('World',     'world',     CURRENT_TIMESTAMP),
    ('Sport',     'sport',     CURRENT_TIMESTAMP),
    ('Weather',   'weather',   CURRENT_TIMESTAMP),
    ('History',   'history',   CURRENT_TIMESTAMP);

-- Verified authors
INSERT INTO "Author" ("name", "slug", "isVerified", "updatedAt") VALUES
    ('Mohannad G.', 'mohannad-g', true, CURRENT_TIMESTAMP),
    ('Tariq K.',    'tariq-k',    true, CURRENT_TIMESTAMP),
    ('Hani A.',     'hani-a',     true, CURRENT_TIMESTAMP),
    ('Serge G.',    'serge-g',    true, CURRENT_TIMESTAMP),
    ('Wasim A.',    'wasim-a',    true, CURRENT_TIMESTAMP),
    ('Mariam H.',   'mariam-h',   true, CURRENT_TIMESTAMP);
