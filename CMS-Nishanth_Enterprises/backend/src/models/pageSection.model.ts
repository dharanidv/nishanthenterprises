export interface PageSectionRow {
  id: string;
  section_name: string;
  page_id: string;
  section_content: string | null;
  created_time: Date;
  updated_time: Date;
}

export function mapPageSectionRow(row: Record<string, unknown>): PageSectionRow {
  return {
    id: String(row.id),
    section_name: String(row.section_name),
    page_id: String(row.page_id),
    section_content: row.section_content === null || row.section_content === undefined ? null : String(row.section_content),
    created_time: row.created_time as Date,
    updated_time: row.updated_time as Date
  };
}
