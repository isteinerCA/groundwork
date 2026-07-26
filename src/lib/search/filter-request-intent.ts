/** True when the user wants to add filters without replacing existing ones. */
export function isAdditiveFilterRequest(message: string): boolean {
  return /\b(add|also|include|plus|in addition|as well as|expand|broaden)\b/i.test(
    message.trim(),
  );
}

/** True when the user wants to replace category filters with a narrower set. */
export function isReplaceOnlyCategoryRequest(message: string): boolean {
  const trimmed = message.trim();
  return /\bonly\b/i.test(trimmed) && !/\bor\b/i.test(trimmed);
}
