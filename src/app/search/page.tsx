import { SearchExperience } from "@/components/search/search-experience";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPrograms } from "@/lib/programs";
import {
  parseSearchFiltersFromSearchParams,
  shouldSkipLastSearchRestore,
} from "@/lib/search/search-url";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const programs = getPrograms();
  const params = await searchParams;
  const initialFilters = parseSearchFiltersFromSearchParams(params);

  return (
    <>
      <SiteHeader />
      <SearchExperience
        programs={programs}
        initialFilters={initialFilters}
        skipLastSearch={shouldSkipLastSearchRestore(params)}
      />
      <SiteFooter />
    </>
  );
}
