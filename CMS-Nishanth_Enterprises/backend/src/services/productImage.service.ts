import { getPool } from "../config/db";
import { mapProductImageRow, type ProductImageRow } from "../models/productImage.model";
import { HttpError } from "../utils/httpError";

export async function listImagesByProductId(productId: number): Promise<ProductImageRow[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, product_id, image_url, display_order, created_at, updated_at
     FROM product_images
     WHERE product_id = $1
     ORDER BY display_order ASC, id ASC`,
    [productId]
  );
  return rows.map((r) => mapProductImageRow(r as Record<string, unknown>));
}

export async function listImageUrlsByProductId(productId: number): Promise<string[]> {
  const pool = getPool();
  const { rows } = await pool.query("SELECT image_url FROM product_images WHERE product_id = $1", [productId]);
  return rows.map((r) => String((r as { image_url: string }).image_url));
}

export async function getNextDisplayOrder(productId: number): Promise<number> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT COALESCE(MAX(display_order), -1) + 1 AS n FROM product_images WHERE product_id = $1",
    [productId]
  );
  const n = (rows[0] as { n: string | number }).n;
  return typeof n === "number" ? n : Number.parseInt(String(n), 10) || 0;
}

export async function createProductImage(params: {
  productId: number;
  imageUrl: string;
  displayOrder?: number;
}): Promise<ProductImageRow> {
  const pool = getPool();
  const order =
    params.displayOrder !== undefined ? params.displayOrder : await getNextDisplayOrder(params.productId);
  const { rows } = await pool.query(
    `INSERT INTO product_images (product_id, image_url, display_order)
     VALUES ($1, $2, $3)
     RETURNING id, product_id, image_url, display_order, created_at, updated_at`,
    [params.productId, params.imageUrl, order]
  );
  return mapProductImageRow(rows[0] as Record<string, unknown>);
}

/** Delete image row if it belongs to product; return row for file cleanup */
export async function deleteProductImageIfOwned(
  productId: number,
  imageId: number
): Promise<ProductImageRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `DELETE FROM product_images
     WHERE id = $1 AND product_id = $2
     RETURNING id, product_id, image_url, display_order, created_at, updated_at`,
    [imageId, productId]
  );
  if (!rows.length) return null;
  return mapProductImageRow(rows[0] as Record<string, unknown>);
}

export async function assertProductExistsForImage(productId: number): Promise<void> {
  const pool = getPool();
  const { rows } = await pool.query("SELECT 1 FROM products WHERE id = $1 LIMIT 1", [productId]);
  if (!rows.length) {
    throw new HttpError(404, `Product with id ${productId} not found`);
  }
}
