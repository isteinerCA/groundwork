import type { PredefinedList } from "@/lib/constants/predefined-lists";
import { absoluteUrl } from "@/lib/constants/site-url";
import { predefinedListPageTitle, programListLabel } from "@/lib/data/predefined-list-programs";
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
      name: programListLabel(program),
      ...(program.websiteUrl ? { url: program.websiteUrl } : {}),
    })),
  };
}
