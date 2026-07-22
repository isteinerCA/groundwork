import { SearchExperience } from "@/components/search/search-experience";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDataVerifiedAt, getPrograms } from "@/lib/programs";
import type { ProgramCategoryId } from "@/lib/constants/categories";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const programs = getPrograms();
  const dataVerifiedAt = getDataVerifiedAt();
  const params = await searchParams;
  const initialCategory = params.category as ProgramCategoryId | undefined;

  return (
    <>
      <SiteHeader />
      <SearchExperience
        programs={programs}
        dataVerifiedAt={dataVerifiedAt}
        initialCategory={initialCategory}
      />
      <SiteFooter />
    </>
  );
}
