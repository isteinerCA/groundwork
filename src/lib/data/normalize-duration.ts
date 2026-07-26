import type { DurationBucketId } from "@/lib/constants/filters";

function durationBucketFromDays(days: number): DurationBucketId {
  if (days < 14) return "under_2_weeks";
  if (days <= 28) return "two_to_four_weeks";
  return "four_plus_weeks";
}

/** Extract day ranges from CSV Length strings like "3 weeks", "3 or 6 weeks", "1-2 weeks". */
export function parseLengthDays(raw: string): {
  lengthMinDays: number | null;
  lengthMaxDays: number | null;
} {
  const lower = raw.trim().toLowerCase();
  if (!lower || lower.includes("self-paced") || lower.includes("varies")) {
    return { lengthMinDays: null, lengthMaxDays: null };
  }

  const dayValues: number[] = [];

  const weekRange = lower.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*weeks?/);
  if (weekRange) {
    dayValues.push(Math.round(Number(weekRange[1]) * 7), Math.round(Number(weekRange[2]) * 7));
  }

  for (const match of lower.matchAll(/(\d+(?:\.\d+)?)\s*weeks?/g)) {
    dayValues.push(Math.round(Number(match[1]) * 7));
  }

  const dayRange = lower.match(/(\d+)\s*[-–]\s*(\d+)\s*days?/);
  if (dayRange) {
    dayValues.push(Number(dayRange[1]), Number(dayRange[2]));
  }

  for (const match of lower.matchAll(/(\d+)\s*days?/g)) {
    dayValues.push(Number(match[1]));
  }

  if (dayValues.length === 0) {
    return { lengthMinDays: null, lengthMaxDays: null };
  }

  return {
    lengthMinDays: Math.min(...dayValues),
    lengthMaxDays: Math.max(...dayValues),
  };
}

export function normalizeDuration(raw: string): {
  durationBucket: DurationBucketId;
  lengthDisplay: string;
  lengthMinDays: number | null;
  lengthMaxDays: number | null;
} {
  const lengthDisplay = raw.trim();
  const { lengthMinDays, lengthMaxDays } = parseLengthDays(lengthDisplay);

  const bucketDays = lengthMinDays ?? lengthMaxDays ?? 0;
  const durationBucket =
    bucketDays > 0 ? durationBucketFromDays(bucketDays) : "two_to_four_weeks";

  return {
    durationBucket,
    lengthDisplay,
    lengthMinDays,
    lengthMaxDays,
  };
}
