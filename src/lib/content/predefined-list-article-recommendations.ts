import type { ProgramCategoryId } from "@/lib/constants/categories";

export const DEFAULT_LIST_ARTICLE_RECOMMENDATIONS = [
  "how-to-tell-if-a-summer-program-is-a-good-fit",
  "how-much-do-summer-programs-cost",
  "when-should-you-start-applying",
] as const;

export const PREDEFINED_LIST_ARTICLE_RECOMMENDATIONS: Partial<
  Record<ProgramCategoryId, readonly string[]>
> = {
  "artificial-intelligence": [
    "how-to-tell-if-a-summer-program-is-a-good-fit",
    "what-makes-a-great-summer-program",
    "research-vs-pre-college-vs-enrichment",
  ],
  "college-credit-pre-college": [
    "what-does-college-experience-really-look-like",
    "are-expensive-pre-college-programs-worth-it",
    "how-to-tell-if-a-summer-program-is-a-good-fit",
  ],
  "leadership-gifted": [
    "what-does-selective-mean",
    "how-much-do-summer-programs-cost",
    "how-to-tell-if-a-summer-program-is-a-good-fit",
  ],
  "marine-science": [
    "how-to-tell-if-a-summer-program-is-a-good-fit",
    "how-much-do-summer-programs-cost",
    "summer-programs-by-the-numbers",
  ],
  "outdoor-wilderness": [
    "how-to-tell-if-a-summer-program-is-a-good-fit",
    "what-makes-a-great-summer-program",
    "summer-programs-by-the-numbers",
  ],
  "stem-engineering": [
    "how-to-tell-if-a-summer-program-is-a-good-fit",
    "what-does-selective-mean",
    "summer-programs-by-the-numbers",
  ],
  "traditional-camp": [
    "what-should-a-9th-grader-do",
    "how-to-tell-if-a-summer-program-is-a-good-fit",
    "research-vs-pre-college-vs-enrichment",
  ],
};

export function getListArticleRecommendations(listSlug: string): readonly string[] {
  const categoryKey = listSlug
    .replace(/-middle-school-programs$/, "")
    .replace(/-programs$/, "") as ProgramCategoryId;

  return (
    PREDEFINED_LIST_ARTICLE_RECOMMENDATIONS[categoryKey] ??
    DEFAULT_LIST_ARTICLE_RECOMMENDATIONS
  );
}
