import type { PredefinedList } from "@/lib/constants/predefined-lists";
import { buildPredefinedListJsonLd } from "@/lib/seo/predefined-list-json-ld";
import type { Program } from "@/lib/types/program";

export function PredefinedListJsonLd({
  list,
  listPrograms,
}: {
  list: PredefinedList;
  listPrograms: Program[];
}) {
  const jsonLd = buildPredefinedListJsonLd(list, listPrograms);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
