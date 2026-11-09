-- Family-name initials end with a dot ("Hani A.").
UPDATE "Author" SET "name" = "name" || '.', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN ('mohannad-g', 'tariq-k', 'hani-a', 'serge-g', 'wasim-a', 'mariam-h')
  AND "name" ~ ' [A-Z]$';
