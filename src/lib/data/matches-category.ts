import {
  categoryIdFromCsvValue,
  PROGRAM_CATEGORIES,
  type ProgramCategoryId,
} from "@/lib/constants/categories";
import type { Program } from "@/lib/types/program";

/** Match primary category or any CSV secondary tag mapped to the category. */
export function programMatchesCategory(
  program: Program,
  categoryId: ProgramCategoryId,
): boolean {
  if (program.category === categoryId) return true;

  return program.secondaryTags.some((tag) => {
    const tagCategoryId = categoryIdFromCsvValue(tag);
    return tagCategoryId === categoryId;
  });
}

export function getProgramCategoryIds(program: Program): ProgramCategoryId[] {
  const ids = new Set<ProgramCategoryId>([program.category]);
  for (const tag of program.secondaryTags) {
    const tagCategoryId = categoryIdFromCsvValue(tag);
    if (tagCategoryId) ids.add(tagCategoryId);
  }
  return [...ids];
}

export function categoryLabelForId(categoryId: ProgramCategoryId): string {
  return PROGRAM_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}
