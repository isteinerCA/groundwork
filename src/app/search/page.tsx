import { SearchExperience } from "@/components/search/search-experience";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDataVerifiedAt, getPrograms } from "@/lib/programs";
import type { ProgramCategoryId } from "@/lib/constants/categories";
import type { ProgramFormatId } from "@/lib/constants/filters";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    fullyFunded?: string;
    format?: string;
  }>;
}) {
  const programs = getPrograms();
  const dataVerifiedAt = getDataVerifiedAt();
  const params = await searchParams;
  const initialCategory = params.category as ProgramCategoryId | undefined;
  const initialFullyFunded = params.fullyFunded === "1";
  const initialFormat = params.format as ProgramFormatId | undefined;

  return (
    <>
      <SiteHeader />
      <SearchExperience
        programs={programs}
        dataVerifiedAt={dataVerifiedAt}
        initialCategory={initialCategory}
        initialFullyFunded={initialFullyFunded}
        initialFormat={initialFormat}
      />
      <SiteFooter />
    </>
  );
}
