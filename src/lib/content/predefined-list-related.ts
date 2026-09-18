import {
  DOMESTIC_INTEREST_LIST_DEFS,
  type DomesticInterestGroupId,
} from "@/lib/constants/domestic-interest-lists";
import {
  GLOBAL_ADVENTURE_LIST_DEFS,
  type GlobalAdventureGroupId,
} from "@/lib/constants/global-adventure-lists";
import type { PredefinedList } from "@/lib/constants/predefined-lists";
import { getPredefinedListBySlug } from "@/lib/constants/predefined-lists";
import { TEEN_TRAVEL_PROGRAMS_SUMMER_2027_SLUG } from "@/lib/content/teen-travel-programs-summer-2027-article";

export type RelatedListItem = {
  slug: string;
  linkLabel: string;
  href: string;
};

export type TravelListHubLink = {
  label: string;
  href: string;
};

export const TRAVEL_LIST_ARTICLE_SLUGS = [TEEN_TRAVEL_PROGRAMS_SUMMER_2027_SLUG] as const;

const GLOBAL_WHERE_RELATED: Record<string, readonly string[]> = {
  "japan-programs": ["south-korea-programs", "china-programs", "language-immersion-programs"],
  "costa-rica-programs": ["galapagos-programs", "caribbean-programs", "conservation-programs"],
  "france-programs": ["spain-programs", "italy-programs", "germany-programs"],
  "germany-programs": ["france-programs", "spain-programs", "italy-programs"],
  "china-programs": ["japan-programs", "south-korea-programs", "language-immersion-programs"],
  "galapagos-programs": ["costa-rica-programs", "marine-biology-programs", "conservation-programs"],
  "greece-programs": ["italy-programs", "spain-programs", "france-programs"],
  "africa-programs": ["safari-programs", "kilimanjaro-programs", "conservation-programs"],
  "spain-programs": ["france-programs", "italy-programs", "greece-programs"],
  "italy-programs": ["greece-programs", "spain-programs", "france-programs"],
  "south-korea-programs": ["japan-programs", "china-programs", "language-immersion-programs"],
  "iceland-programs": ["ireland-programs", "backpacking-programs", "photography-programs"],
  "ireland-programs": ["iceland-programs", "france-programs", "language-immersion-programs"],
  "caribbean-programs": ["costa-rica-programs", "scuba-programs", "sailing-programs"],
};

const GLOBAL_WHAT_RELATED: Record<string, readonly string[]> = {
  "sea-turtle-programs": ["marine-biology-programs", "conservation-programs", "scuba-programs"],
  "scuba-programs": ["marine-biology-programs", "sailing-programs", "caribbean-programs"],
  "conservation-programs": ["ecology-programs", "marine-biology-programs", "sea-turtle-programs"],
  "entrepreneurship-programs": [
    "language-immersion-programs",
    "photography-programs",
    "backpacking-programs",
  ],
  "language-immersion-programs": ["japan-programs", "spain-programs", "france-programs"],
  "backpacking-programs": ["kilimanjaro-programs", "iceland-programs", "africa-programs"],
  "kilimanjaro-programs": ["safari-programs", "africa-programs", "backpacking-programs"],
  "safari-programs": ["africa-programs", "kilimanjaro-programs", "conservation-programs"],
  "sailing-programs": ["scuba-programs", "caribbean-programs", "marine-biology-programs"],
  "fashion-programs": ["photography-programs", "architecture-programs", "italy-programs"],
  "photography-programs": ["fashion-programs", "architecture-programs", "iceland-programs"],
  "architecture-programs": ["photography-programs", "fashion-programs", "italy-programs"],
  "veterinary-studies-programs": [
    "marine-biology-programs",
    "ecology-programs",
    "conservation-programs",
  ],
  "marine-biology-programs": ["sea-turtle-programs", "scuba-programs", "conservation-programs"],
  "ecology-programs": ["conservation-programs", "marine-biology-programs", "africa-programs"],
};

const DOMESTIC_WHERE_RELATED: Record<string, readonly string[]> = {
  "hawaii-us-programs": [
    "alaska-us-programs",
    "marine-biology-us-programs",
    "ecology-us-programs",
  ],
  "alaska-us-programs": ["wyoming-us-programs", "colorado-us-programs", "yosemite-us-programs"],
  "wyoming-us-programs": ["colorado-us-programs", "yosemite-us-programs", "alaska-us-programs"],
  "yosemite-us-programs": ["colorado-us-programs", "wyoming-us-programs", "vermont-us-programs"],
  "vermont-us-programs": ["boston-us-programs", "new-york-us-programs", "yosemite-us-programs"],
  "colorado-us-programs": ["wyoming-us-programs", "yosemite-us-programs", "alaska-us-programs"],
  "new-york-us-programs": [
    "boston-us-programs",
    "los-angeles-us-programs",
    "san-francisco-bay-area-us-programs",
  ],
  "boston-us-programs": [
    "new-york-us-programs",
    "vermont-us-programs",
    "san-francisco-bay-area-us-programs",
  ],
  "san-francisco-bay-area-us-programs": [
    "los-angeles-us-programs",
    "new-york-us-programs",
    "ai-us-programs",
  ],
  "los-angeles-us-programs": [
    "san-francisco-bay-area-us-programs",
    "new-york-us-programs",
    "fashion-us-programs",
  ],
};

const DOMESTIC_WHAT_RELATED: Record<string, readonly string[]> = {
  "fashion-us-programs": [
    "photography-us-programs",
    "architecture-us-programs",
    "los-angeles-us-programs",
  ],
  "photography-us-programs": [
    "fashion-us-programs",
    "architecture-us-programs",
    "writing-us-programs",
  ],
  "architecture-us-programs": [
    "photography-us-programs",
    "fashion-us-programs",
    "engineering-us-programs",
  ],
  "veterinary-studies-us-programs": [
    "marine-biology-us-programs",
    "ecology-us-programs",
    "hawaii-us-programs",
  ],
  "marine-biology-us-programs": [
    "ecology-us-programs",
    "veterinary-studies-us-programs",
    "hawaii-us-programs",
  ],
  "ai-us-programs": [
    "robotics-us-programs",
    "engineering-us-programs",
    "san-francisco-bay-area-us-programs",
  ],
  "entrepreneurship-us-programs": [
    "business-us-programs",
    "marketing-us-programs",
    "ai-us-programs",
  ],
  "ecology-us-programs": [
    "marine-biology-us-programs",
    "veterinary-studies-us-programs",
    "vermont-us-programs",
  ],
  "business-us-programs": [
    "entrepreneurship-us-programs",
    "marketing-us-programs",
    "new-york-us-programs",
  ],
  "marketing-us-programs": [
    "business-us-programs",
    "entrepreneurship-us-programs",
    "writing-us-programs",
  ],
  "robotics-us-programs": [
    "engineering-us-programs",
    "ai-us-programs",
    "boston-us-programs",
  ],
  "engineering-us-programs": [
    "robotics-us-programs",
    "ai-us-programs",
    "boston-us-programs",
  ],
  "writing-us-programs": ["theater-us-programs", "music-us-programs", "marketing-us-programs"],
  "theater-us-programs": ["writing-us-programs", "music-us-programs", "new-york-us-programs"],
  "music-us-programs": ["theater-us-programs", "writing-us-programs", "los-angeles-us-programs"],
};

function fallbackGlobalSlugs(group: GlobalAdventureGroupId, slug: string): readonly string[] {
  return GLOBAL_ADVENTURE_LIST_DEFS.filter((def) => def.group === group && def.slug !== slug)
    .slice(0, 4)
    .map((def) => def.slug);
}

function fallbackDomesticSlugs(group: DomesticInterestGroupId, slug: string): readonly string[] {
  return DOMESTIC_INTEREST_LIST_DEFS.filter((def) => def.group === group && def.slug !== slug)
    .slice(0, 4)
    .map((def) => def.slug);
}

function curatedSlugsForList(list: PredefinedList): readonly string[] {
  if (list.kind === "global-adventure") {
    const map =
      list.globalAdventureGroup === "where" ? GLOBAL_WHERE_RELATED : GLOBAL_WHAT_RELATED;
    return map[list.slug] ?? fallbackGlobalSlugs(list.globalAdventureGroup!, list.slug);
  }

  if (list.kind === "domestic-interest") {
    const map =
      list.domesticInterestGroup === "where" ? DOMESTIC_WHERE_RELATED : DOMESTIC_WHAT_RELATED;
    return map[list.slug] ?? fallbackDomesticSlugs(list.domesticInterestGroup!, list.slug);
  }

  return [];
}

export function isTravelPredefinedList(list: PredefinedList): boolean {
  return list.kind === "global-adventure" || list.kind === "domestic-interest";
}

export function getRelatedListsHeading(list: PredefinedList): string {
  if (list.kind === "global-adventure") {
    return list.globalAdventureGroup === "where"
      ? "Explore nearby destinations"
      : "Explore related interests";
  }

  if (list.kind === "domestic-interest") {
    return list.domesticInterestGroup === "where"
      ? "Explore other US destinations"
      : "Explore related US interests";
  }

  return "Related searches";
}

export function getTravelListHubLink(list: PredefinedList): TravelListHubLink | null {
  if (list.kind === "global-adventure") {
    return {
      label: "Browse US teen programs →",
      href: "/resources#domestic-interest",
    };
  }

  if (list.kind === "domestic-interest") {
    return {
      label: "Browse international teen programs →",
      href: "/resources#global-adventure",
    };
  }

  return null;
}

export function getRelatedListsForTravelList(list: PredefinedList): RelatedListItem[] {
  if (!isTravelPredefinedList(list)) {
    return [];
  }

  return curatedSlugsForList(list).flatMap((slug) => {
    const related = getPredefinedListBySlug(slug);
    if (!related) {
      return [];
    }

    return [
      {
        slug: related.slug,
        linkLabel: related.linkLabel,
        href: `/resources/lists/${related.slug}`,
      },
    ];
  });
}
