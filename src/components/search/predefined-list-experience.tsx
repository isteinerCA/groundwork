import { SearchExperience } from "@/components/search/search-experience";
import type { PredefinedList } from "@/lib/constants/predefined-lists";
import { predefinedListPageTitle } from "@/lib/data/predefined-list-programs";
import { buildSearchUrlFromList } from "@/lib/search/search-url";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumb-json-ld";
import type { Program } from "@/lib/types/program";

export function PredefinedListExperience({
  programs,
  list,
  breadcrumbs,
}: {
  programs: Program[];
  list: PredefinedList;
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <SearchExperience
      programs={programs}
      lockedFilters={list.lockedFilters}
      pageTitle={predefinedListPageTitle(list)}
      pageDescription={list.description}
      customizeSearchHref={buildSearchUrlFromList(list)}
      breadcrumbs={breadcrumbs}
    />
  );
}
