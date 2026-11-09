import { StoryCard } from "@/components/ui/Story";
import type { ArticleListItem } from "@/types";

type Props = {
  article: ArticleListItem;
  size?: "sm" | "md" | "lg";
  showDeck?: boolean;
};

/** Grid card used by category, search and related lists. */
export default function ArticleCard({ article, size = "md", showDeck }: Props) {
  return <StoryCard article={article} size={size} showDeck={showDeck} />;
}
