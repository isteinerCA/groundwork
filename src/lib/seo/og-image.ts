import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants/brand";

export const OG_IMAGE_PATH = "/images/og-default.jpg";
export const OG_IMAGE_WIDTH = 1024;
export const OG_IMAGE_HEIGHT = 537;
export const OG_IMAGE_ALT = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const OPEN_GRAPH_IMAGE = {
  url: OG_IMAGE_PATH,
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
  alt: OG_IMAGE_ALT,
} as const;

export const TWITTER_CARD_METADATA = {
  card: "summary_large_image" as const,
  images: [OG_IMAGE_PATH],
};
