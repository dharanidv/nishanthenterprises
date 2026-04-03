export interface PageRow {
  id: string;
  page_name: string;
  created_at: Date;
  updated_at: Date;
}

export function mapPageRow(row: Record<string, unknown>): PageRow {
  return {
    id: String(row.id),
    page_name: String(row.page_name),
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date
  };
}
