export interface SubcategoryRow {
  id: string;
  subcategory_name: string;
  category_id: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export function mapSubcategoryRow(row: Record<string, unknown>): SubcategoryRow {
  return {
    id: String(row.id),
    subcategory_name: String(row.subcategory_name),
    category_id: String(row.category_id),
    image_url: row.image_url === null || row.image_url === undefined ? null : String(row.image_url),
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date
  };
}
