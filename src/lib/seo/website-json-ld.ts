import { SITE_NAME } from "@/lib/constants/brand";
import { absoluteUrl } from "@/lib/constants/site-url";

const ORGANIZATION_ID = `${absoluteUrl("/")}#organization`;

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/images/explore-summer-logo.png"),
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: absoluteUrl("/"),
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}
