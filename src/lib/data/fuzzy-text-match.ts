/** Strip non-alphanumeric chars for compact matching (stonybrook ↔ stony brook). */
export function normalizeAlphanumeric(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

function maxEditDistance(termLength: number): number {
  if (termLength >= 8) return 1;
  if (termLength >= 5) return 1;
  return 0;
}

function isSimilarEnough(a: string, b: string, maxDistance: number): boolean {
  const distance = levenshtein(a, b);
  if (distance > maxDistance) return false;
  if (distance === 0) return true;
  return 1 - distance / Math.max(a.length, b.length) >= 0.8;
}

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);
}

/**
 * Match a single search term against searchable text with typo/ spacing tolerance.
 * Handles stonybrook→Stony Brook, cosmo→COSMOS, and minor misspellings.
 */
export function termMatchesInText(term: string, text: string): boolean {
  const trimmed = term.trim().toLowerCase();
  if (!trimmed) return true;

  const haystack = text.toLowerCase();
  if (haystack.includes(trimmed)) return true;

  const termCompact = normalizeAlphanumeric(trimmed);
  const textCompact = normalizeAlphanumeric(haystack);
  if (termCompact.length >= 4 && textCompact.includes(termCompact)) return true;

  const editBudget = maxEditDistance(trimmed.length);
  if (editBudget === 0) return false;

  for (const word of significantWords(haystack)) {
    if (trimmed.length >= 4 && word.startsWith(trimmed)) return true;
    if (isSimilarEnough(trimmed, word, editBudget)) return true;

    const wordCompact = normalizeAlphanumeric(word);
    if (
      termCompact.length >= 4 &&
      wordCompact.length >= 4 &&
      isSimilarEnough(termCompact, wordCompact, editBudget)
    ) {
      return true;
    }
  }

  return false;
}
