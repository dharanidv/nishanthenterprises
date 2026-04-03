export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export function mapProductImageRow(row: Record<string, unknown>): ProductImageRow {
  const ord = row.display_order;
  const display_order =
    typeof ord === "number" && Number.isFinite(ord) ? ord : Number.parseInt(String(ord ?? 0), 10) || 0;
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    image_url: String(row.image_url),
    display_order,
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date
  };
}
