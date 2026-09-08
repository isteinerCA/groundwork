import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants/brand";
import type { PredefinedList } from "@/lib/constants/predefined-lists";
import { absoluteUrl } from "@/lib/constants/site-url";
import { predefinedListPageTitle } from "@/lib/data/predefined-list-programs";

export function buildPredefinedListMetadata(list: PredefinedList): Metadata {
  const pageTitle = predefinedListPageTitle(list);
  const url = absoluteUrl(`/resources/lists/${list.slug}`);
  const documentTitle = `${list.titleLabel} for ${list.audienceLabel} · Pre-defined lists · ${SITE_NAME}`;

  return {
    title: documentTitle,
    description: list.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: pageTitle,
      description: list.description,
      url,
      type: "website",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description: list.description,
    },
  };
}
