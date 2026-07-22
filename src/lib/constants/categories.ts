/**
 * Twelve primary categories from the program CSV (final schema).
 * UI labels may differ slightly from raw CSV values for display polish.
 */
export const PROGRAM_CATEGORIES = [
  {
    id: "artificial-intelligence",
    csvValue: "Artificial Intelligence",
    label: "Tech & AI",
    description: "Computer science, AI, robotics, coding & innovation",
  },
  {
    id: "stem-engineering",
    csvValue: "STEM/Engineering",
    label: "Science & STEM",
    description: "Biology, chemistry, physics, engineering & research",
  },
  {
    id: "college-credit-pre-college",
    csvValue: "College-Credit Pre-College",
    label: "Pre-College & Credit",
    description: "Credit-bearing academic programs on college campuses",
  },
  {
    id: "marine-science",
    csvValue: "Marine Science",
    label: "Marine Science",
    description: "Oceanography, conservation, marine biology & more",
  },
  {
    id: "writing-humanities",
    csvValue: "Writing/Humanities",
    label: "Writing & Humanities",
    description: "Creative writing, journalism, history, philosophy & more",
  },
  {
    id: "traditional-camp",
    csvValue: "Traditional Camp",
    label: "Traditional Camps",
    description: "Sleepaway camps and classic summer camp experiences",
  },
  {
    id: "outdoor-wilderness",
    csvValue: "Outdoor/Wilderness",
    label: "Wilderness & Adventure",
    description: "Outdoor leadership, expeditions, survival & exploration",
  },
  {
    id: "cultural-exchange",
    csvValue: "Cultural Exchange",
    label: "Global & Language",
    description: "Languages, culture, international travel & exchange",
  },
  {
    id: "leadership-gifted",
    csvValue: "Leadership/Gifted",
    label: "Leadership & Gifted",
    description: "Talented youth, enrichment, and leadership institutes",
  },
  {
    id: "mathematics",
    csvValue: "Mathematics",
    label: "Math",
    description: "Problem solving, competitions, advanced math & modeling",
  },
  {
    id: "biomedical",
    csvValue: "Biomedical",
    label: "Pre-Med & Life Sciences",
    description: "Medicine, healthcare, biology & biomedical research",
  },
  {
    id: "arts",
    csvValue: "Arts",
    label: "Arts & Performing Arts",
    description: "Visual arts, music, theater, film & performance",
  },
] as const;

export type ProgramCategoryId = (typeof PROGRAM_CATEGORIES)[number]["id"];

export const CATEGORY_BY_CSV_VALUE = Object.fromEntries(
  PROGRAM_CATEGORIES.map((c) => [c.csvValue, c]),
) as Record<string, (typeof PROGRAM_CATEGORIES)[number]>;

export function categoryIdFromCsvValue(csvValue: string): ProgramCategoryId | null {
  return CATEGORY_BY_CSV_VALUE[csvValue.trim()]?.id ?? null;
}
