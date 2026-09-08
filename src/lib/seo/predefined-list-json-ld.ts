import type { PredefinedList } from "@/lib/constants/predefined-lists";
import {
  predefinedListPageTitle,
  programListItemUrl,
  programListLabel,
} from "@/lib/data/predefined-list-programs";
import { absoluteUrl } from "@/lib/constants/site-url";
import type { Program } from "@/lib/types/program";

export function buildPredefinedListJsonLd(list: PredefinedList, listPrograms: Program[]) {
  const url = absoluteUrl(`/resources/lists/${list.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: predefinedListPageTitle(list),
    description: list.description,
    url,
    numberOfItems: listPrograms.length,
    itemListElement: listPrograms.map((program, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        name: programListLabel(program),
        url: programListItemUrl(list, program),
      },
    })),
  };
}
