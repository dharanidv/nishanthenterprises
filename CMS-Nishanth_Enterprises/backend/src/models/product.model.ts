export interface ProductRow {
  id: string;
  product_name: string;
  subcategory_id: string;
  category_id: string;
  category_name?: string;
  subcategory_name?: string;
  description: string | null;
  original_price: string | null;
  offer_price: string | null;
  classification: string | null;
  is_new_product: boolean;
  is_popular_product: boolean;
  created_at: Date;
  updated_at: Date;
  /** Number of product_images rows (included in list/detail API). */
  image_count: number;
  images?: ProductImageRowLite[];
}

export interface ProductImageRowLite {
  id: string;
  image_url: string;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

function toBool(v: unknown): boolean {
  return v === true || v === "t" || v === "true" || v === 1;
}

function toIntCount(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.floor(v));
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return 0;
}

export function mapProductRow(row: Record<string, unknown>, includeNames = false): ProductRow {
  const out: ProductRow = {
    id: String(row.id),
    product_name: String(row.product_name),
    subcategory_id: String(row.subcategory_id),
    category_id: String(row.category_id),
    description: row.description === null || row.description === undefined ? null : String(row.description),
    original_price:
      row.original_price === null || row.original_price === undefined ? null : String(row.original_price),
    offer_price: row.offer_price === null || row.offer_price === undefined ? null : String(row.offer_price),
    classification:
      row.classification === null || row.classification === undefined || row.classification === ""
        ? null
        : String(row.classification),
    is_new_product: toBool(row.is_new_product),
    is_popular_product: toBool(row.is_popular_product),
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
    image_count: toIntCount(row.image_count)
  };
  if (includeNames) {
    if (row.category_name !== undefined) {
      out.category_name = String(row.category_name);
    }
    if (row.subcategory_name !== undefined) {
      out.subcategory_name = String(row.subcategory_name);
    }
  }
  return out;
}
