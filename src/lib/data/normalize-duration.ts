import type { DurationBucketId } from "@/lib/constants/filters";

export function normalizeDuration(raw: string): {
  durationBucket: DurationBucketId;
  lengthDisplay: string;
} {
  const lengthDisplay = raw.trim();
  const lower = lengthDisplay.toLowerCase();

  const weekMatch = lower.match(/(\d+(?:\.\d+)?)\s*weeks?/);
  const dayMatch = lower.match(/(\d+)\s*days?/);

  let days = 0;
  if (weekMatch) days = Math.round(Number(weekMatch[1]) * 7);
  else if (dayMatch) days = Number(dayMatch[1]);

  if (days === 0) {
    if (lower.includes("self-paced") || lower.includes("varies")) {
      return { durationBucket: "two_to_four_weeks", lengthDisplay };
    }
    return { durationBucket: "two_to_four_weeks", lengthDisplay };
  }

  if (days < 14) return { durationBucket: "under_2_weeks", lengthDisplay };
  if (days <= 28) return { durationBucket: "two_to_four_weeks", lengthDisplay };
  return { durationBucket: "four_plus_weeks", lengthDisplay };
}
