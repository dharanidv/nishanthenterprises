import { getPool } from "../config/db";
import { mapSubcategoryRow, type SubcategoryRow } from "../models/subcategory.model";
import { removeAssetFileIfExists } from "../utils/fileStorage";
import { HttpError } from "../utils/httpError";

export async function listSubcategories(categoryId?: number): Promise<SubcategoryRow[]> {
  const pool = getPool();
  if (categoryId !== undefined) {
    const { rows } = await pool.query(
      `SELECT id, subcategory_name, category_id, image_url, created_at, updated_at
       FROM subcategories
       WHERE category_id = $1
       ORDER BY subcategory_name ASC`,
      [categoryId]
    );
    return rows.map((r) => mapSubcategoryRow(r as Record<string, unknown>));
  }
  const { rows } = await pool.query(
    `SELECT id, subcategory_name, category_id, image_url, created_at, updated_at
     FROM subcategories
     ORDER BY category_id ASC, subcategory_name ASC`
  );
  return rows.map((r) => mapSubcategoryRow(r as Record<string, unknown>));
}

export async function getSubcategoryById(id: number): Promise<SubcategoryRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, subcategory_name, category_id, image_url, created_at, updated_at
     FROM subcategories WHERE id = $1`,
    [id]
  );
  if (!rows.length) return null;
  return mapSubcategoryRow(rows[0] as Record<string, unknown>);
}

export async function assertSubcategoryExists(id: number): Promise<SubcategoryRow> {
  const row = await getSubcategoryById(id);
  if (!row) {
    throw new HttpError(404, `Subcategory with id ${id} not found`);
  }
  return row;
}

export async function createSubcategory(params: {
  subcategoryName: string;
  categoryId: number;
  imageUrl: string | null;
}): Promise<SubcategoryRow> {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO subcategories (subcategory_name, category_id, image_url)
     VALUES ($1, $2, $3)
     RETURNING id, subcategory_name, category_id, image_url, created_at, updated_at`,
    [params.subcategoryName.trim(), params.categoryId, params.imageUrl]
  );
  return mapSubcategoryRow(rows[0] as Record<string, unknown>);
}

export async function updateSubcategory(
  id: number,
  params: { subcategoryName: string; categoryId: number; imageUrl: string | null }
): Promise<SubcategoryRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE subcategories
     SET subcategory_name = $1, category_id = $2, image_url = $3
     WHERE id = $4
     RETURNING id, subcategory_name, category_id, image_url, created_at, updated_at`,
    [params.subcategoryName.trim(), params.categoryId, params.imageUrl, id]
  );
  if (!rows.length) return null;
  return mapSubcategoryRow(rows[0] as Record<string, unknown>);
}

export async function deleteSubcategory(id: number): Promise<SubcategoryRow | null> {
  const pool = getPool();
  const { rows: pathRows } = await pool.query(
    `SELECT pi.image_url
     FROM product_images pi
     INNER JOIN products p ON p.id = pi.product_id
     WHERE p.subcategory_id = $1`,
    [id]
  );
  const paths = pathRows.map((r) => String((r as { image_url: string }).image_url));

  const { rows } = await pool.query(
    `DELETE FROM subcategories WHERE id = $1
     RETURNING id, subcategory_name, category_id, image_url, created_at, updated_at`,
    [id]
  );
  if (!rows.length) return null;

  for (const rel of paths) {
    await removeAssetFileIfExists(rel);
  }

  return mapSubcategoryRow(rows[0] as Record<string, unknown>);
}
