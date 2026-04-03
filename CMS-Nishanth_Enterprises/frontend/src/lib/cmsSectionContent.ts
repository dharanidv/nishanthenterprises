/** One row in the CMS section content editor (stored as JSON object in `section_content`). */

export type SectionContentPair = {
  id: string;
  key: string;
  value: string;
};

export function newSectionContentPair(): SectionContentPair {
  return { id: crypto.randomUUID(), key: "", value: "" };
}

/**
 * Parse DB `section_content` into editable rows.
 * - Valid JSON object → one row per key (values stringified if non-string).
 * - Anything else → legacy plain text as a single row with key `content`.
 */
export function parseSectionContentToPairs(raw: string | null | undefined): SectionContentPair[] {
  if (raw === null || raw === undefined || !String(raw).trim()) {
    return [newSectionContentPair()];
  }
  const s = String(raw);
  try {
    const parsed = JSON.parse(s) as unknown;
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      const entries = Object.entries(parsed as Record<string, unknown>);
      if (entries.length === 0) return [newSectionContentPair()];
      return entries.map(([key, val]) => ({
        id: crypto.randomUUID(),
        key,
        value:
          typeof val === "string"
            ? val
            : val === null || val === undefined
              ? ""
              : JSON.stringify(val)
      }));
    }
  } catch {
    /* legacy non-JSON body */
  }
  return [{ id: crypto.randomUUID(), key: "content", value: s }];
}

/** Build JSON object string; skips rows with empty keys. Empty result → "{}" */
export function serializeSectionContentPairs(pairs: SectionContentPair[]): string {
  const o: Record<string, string> = {};
  for (const p of pairs) {
    const k = p.key.trim();
    if (!k) continue;
    o[k] = p.value;
  }
  return JSON.stringify(o);
}

export function serializedSectionContentOrNull(pairs: SectionContentPair[]): string | null {
  const json = serializeSectionContentPairs(pairs);
  return json === "{}" ? null : json;
}

/** Normalized form for comparing saved DB text with the editor (handles legacy plain text). */
export function canonicalSectionContentSerialized(raw: string | null | undefined): string {
  return serializeSectionContentPairs(parseSectionContentToPairs(raw));
}

export function isSectionContentDraftDirty(
  section: { section_content: string | null },
  draftPairs: SectionContentPair[] | undefined
): boolean {
  const draft = draftPairs ?? parseSectionContentToPairs(section.section_content);
  return serializeSectionContentPairs(draft) !== canonicalSectionContentSerialized(section.section_content);
}

export function listUnsavedSectionTitles(
  sections: { id: string; section_name: string; section_content: string | null }[],
  contentDrafts: Record<string, SectionContentPair[]>
): string[] {
  return sections
    .filter((s) => isSectionContentDraftDirty(s, contentDrafts[s.id]))
    .map((s) => s.section_name);
}

export function isAddSectionFormDirty(sectionName: string, pairs: SectionContentPair[]): boolean {
  if (sectionName.trim() !== "") return true;
  return serializeSectionContentPairs(pairs) !== "{}";
}
