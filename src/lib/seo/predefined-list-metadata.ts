import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants/brand";
import type { PredefinedList } from "@/lib/constants/predefined-lists";
import { absoluteUrl } from "@/lib/constants/site-url";
import { predefinedListPageTitle } from "@/lib/data/predefined-list-programs";
import { OPEN_GRAPH_IMAGE, TWITTER_CARD_METADATA } from "@/lib/seo/og-image";

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
      images: [OPEN_GRAPH_IMAGE],
    },
    twitter: {
      ...TWITTER_CARD_METADATA,
      title: pageTitle,
      description: list.description,
    },
  };
}
