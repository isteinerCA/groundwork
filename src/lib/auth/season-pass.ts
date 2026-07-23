/** Season pass expires June 30 of the current academic cycle (Aug–Jun). */
export function computeSeasonPassExpiry(from = new Date()): string {
  const month = from.getMonth(); // 0-indexed; July = 6
  const year = month >= 6 ? from.getFullYear() + 1 : from.getFullYear();
  return `${year}-06-30`;
}

export function isSeasonPassValid(expires: string | null | undefined): boolean {
  if (!expires) return false;
  const end = new Date(expires);
  end.setHours(23, 59, 59, 999);
  return end.getTime() >= Date.now();
}
