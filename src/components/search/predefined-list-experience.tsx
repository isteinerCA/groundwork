"use client";

import { SearchExperience } from "@/components/search/search-experience";
import type { PredefinedList } from "@/lib/constants/predefined-lists";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumb-json-ld";
import type { Program } from "@/lib/types/program";

export function PredefinedListExperience({
  programs,
  dataVerifiedAt,
  list,
  breadcrumbs,
}: {
  programs: Program[];
  dataVerifiedAt: string | null;
  list: PredefinedList;
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <SearchExperience
      programs={programs}
      dataVerifiedAt={dataVerifiedAt}
      lockedFilters={list.lockedFilters}
      pageTitle={`Start exploring ${list.titleLabel} for ${list.audienceLabel}`}
      pageDescription={list.description}
      breadcrumbs={breadcrumbs}
    />
  );
}
