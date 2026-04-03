/**
 * Safe single path segment for directory names (page / section folders).
 */
export function sanitizePathSegment(name: string, maxLen = 80): string {
  const trimmed = name.trim().toLowerCase();
  const slug = trimmed
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
  if (!slug) {
    return "unnamed";
  }
  return slug;
}
