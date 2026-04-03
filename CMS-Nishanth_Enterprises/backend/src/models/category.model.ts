export interface CategoryRow {
  id: string;
  category_name: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export function mapCategoryRow(row: Record<string, unknown>): CategoryRow {
  return {
    id: String(row.id),
    category_name: String(row.category_name),
    image_url: row.image_url === null || row.image_url === undefined ? null : String(row.image_url),
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date
  };
}
