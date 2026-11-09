import type { Article, Category, QuickUpdate } from "@prisma/client";

export type { Article, Category, QuickUpdate };

export type ArticleWithCategory = Article & {
  category: Category;
};

/** Article without its (large) body — what every list, card and rail needs. */
export type ArticleListItem = Omit<Article, "content"> & {
  category: Category;
};
