/**
 * Splits a comma-separated flag value into a trimmed, non-empty string array,
 * or returns undefined when nothing usable was provided.
 */
export function parseList(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const items = value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}
