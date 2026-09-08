import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants/brand";
import { absoluteUrl } from "@/lib/constants/site-url";
import { OPEN_GRAPH_IMAGE, TWITTER_CARD_METADATA } from "@/lib/seo/og-image";

const RESOURCES_DESCRIPTION =
  "Practical advice on planning, choosing, and making the most of summer programs, drawn from our own experience navigating the process.";

const LISTS_INDEX_TITLE = "Popular ways to explore";
const LISTS_INDEX_DESCRIPTION =
  "Start with one of these ready-made searches, then adjust the filters to fit your student.";

function pageMetadata({
  documentTitle,
  pageTitle,
  description,
  path,
}: {
  documentTitle: string;
  pageTitle: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title: documentTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: pageTitle,
      description,
      url,
      type: "website",
      siteName: SITE_NAME,
      images: [OPEN_GRAPH_IMAGE],
    },
    twitter: {
      ...TWITTER_CARD_METADATA,
      title: pageTitle,
      description,
    },
  };
}

export const resourcesPageMetadata: Metadata = pageMetadata({
  documentTitle: `Resources · ${SITE_NAME}`,
  pageTitle: "Resources",
  description: RESOURCES_DESCRIPTION,
  path: "/resources",
});

export const resourcesListsIndexMetadata: Metadata = pageMetadata({
  documentTitle: `${LISTS_INDEX_TITLE} · Resources · ${SITE_NAME}`,
  pageTitle: LISTS_INDEX_TITLE,
  description: LISTS_INDEX_DESCRIPTION,
  path: "/resources/lists",
});
