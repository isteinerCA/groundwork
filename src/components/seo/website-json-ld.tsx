import { buildWebsiteJsonLd } from "@/lib/seo/website-json-ld";

export function WebsiteJsonLd() {
  const jsonLd = buildWebsiteJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
