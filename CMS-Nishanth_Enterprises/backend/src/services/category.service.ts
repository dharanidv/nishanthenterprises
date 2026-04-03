import { getPool } from "../config/db";
import { mapCategoryRow, type CategoryRow } from "../models/category.model";
import { removeAssetFileIfExists } from "../utils/fileStorage";
import { HttpError } from "../utils/httpError";

export async function listCategories(): Promise<CategoryRow[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT id, category_name, image_url, created_at, updated_at FROM categories ORDER BY category_name ASC"
  );
  return rows.map((r) => mapCategoryRow(r as Record<string, unknown>));
}

export async function getCategoryById(id: number): Promise<CategoryRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT id, category_name, image_url, created_at, updated_at FROM categories WHERE id = $1",
    [id]
  );
  if (!rows.length) return null;
  return mapCategoryRow(rows[0] as Record<string, unknown>);
}

export async function assertCategoryExists(id: number): Promise<CategoryRow> {
  const row = await getCategoryById(id);
  if (!row) {
    throw new HttpError(404, `Category with id ${id} not found`);
  }
  return row;
}

export async function createCategory(categoryName: string, imageUrl: string | null): Promise<CategoryRow> {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO categories (category_name, image_url) VALUES ($1, $2)
     RETURNING id, category_name, image_url, created_at, updated_at`,
    [categoryName.trim(), imageUrl]
  );
  return mapCategoryRow(rows[0] as Record<string, unknown>);
}

export async function updateCategory(
  id: number,
  categoryName: string,
  imageUrl: string | null
): Promise<CategoryRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE categories SET category_name = $1, image_url = $2 WHERE id = $3
     RETURNING id, category_name, image_url, created_at, updated_at`,
    [categoryName.trim(), imageUrl, id]
  );
  if (!rows.length) return null;
  return mapCategoryRow(rows[0] as Record<string, unknown>);
}

export async function deleteCategory(id: number): Promise<CategoryRow | null> {
  const pool = getPool();
  const { rows: pathRows } = await pool.query(
    `SELECT pi.image_url
     FROM product_images pi
     INNER JOIN products p ON p.id = pi.product_id
     INNER JOIN subcategories s ON s.id = p.subcategory_id
     WHERE s.category_id = $1`,
    [id]
  );
  const paths = pathRows.map((r) => String((r as { image_url: string }).image_url));

  const { rows } = await pool.query(
    "DELETE FROM categories WHERE id = $1 RETURNING id, category_name, image_url, created_at, updated_at",
    [id]
  );
  if (!rows.length) return null;

  for (const rel of paths) {
    await removeAssetFileIfExists(rel);
  }

  return mapCategoryRow(rows[0] as Record<string, unknown>);
}
