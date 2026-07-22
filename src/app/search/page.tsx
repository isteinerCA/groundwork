import { SearchExperience } from "@/components/search/search-experience";
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
    <SearchExperience
      programs={programs}
      dataVerifiedAt={dataVerifiedAt}
      initialCategory={initialCategory}
    />
  );
}
