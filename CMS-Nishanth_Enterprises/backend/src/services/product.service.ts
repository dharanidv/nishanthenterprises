import { getPool } from "../config/db";
import { mapProductRow, type ProductImageRowLite, type ProductRow } from "../models/product.model";
import { mapProductImageRow, type ProductImageRow } from "../models/productImage.model";
import { removeAssetFileIfExists } from "../utils/fileStorage";
import { HttpError } from "../utils/httpError";
import * as productImageService from "./productImage.service";

export type ProductListFilters = {
  categoryId?: number;
  subcategoryId?: number;
  isNewProduct?: boolean;
  isPopularProduct?: boolean;
  classificationIsNull?: boolean;
  classification?: string;
};

function rowToLite(img: ProductImageRow): ProductImageRowLite {
  return {
    id: img.id,
    image_url: img.image_url,
    display_order: img.display_order,
    created_at: img.created_at,
    updated_at: img.updated_at
  };
}

const PRODUCT_SELECT = `p.id, p.product_name, p.subcategory_id,
  s.subcategory_name, s.category_id, c.category_name,
  p.description, p.original_price, p.offer_price, p.classification,
  p.is_new_product, p.is_popular_product, p.created_at, p.updated_at,
  (SELECT COUNT(*)::int FROM product_images pi WHERE pi.product_id = p.id) AS image_count`;

const PRODUCT_FROM = `products p
  INNER JOIN subcategories s ON s.id = p.subcategory_id
  INNER JOIN categories c ON c.id = s.category_id`;

export async function listProducts(
  filters: ProductListFilters,
  includeImages: boolean
): Promise<ProductRow[]> {
  const pool = getPool();
  const conds: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (filters.subcategoryId !== undefined) {
    conds.push(`p.subcategory_id = $${i++}`);
    params.push(filters.subcategoryId);
  } else if (filters.categoryId !== undefined) {
    conds.push(`s.category_id = $${i++}`);
    params.push(filters.categoryId);
  }
  if (filters.isNewProduct !== undefined) {
    conds.push(`p.is_new_product = $${i++}`);
    params.push(filters.isNewProduct);
  }
  if (filters.isPopularProduct !== undefined) {
    conds.push(`p.is_popular_product = $${i++}`);
    params.push(filters.isPopularProduct);
  }
  if (filters.classificationIsNull) {
    conds.push("p.classification IS NULL");
  } else if (filters.classification !== undefined) {
    conds.push(`p.classification = $${i++}`);
    params.push(filters.classification);
  }

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT ${PRODUCT_SELECT}
     FROM ${PRODUCT_FROM}
     ${where}
     ORDER BY p.id ASC`,
    params
  );

  const products = rows.map((r) => mapProductRow(r as Record<string, unknown>, true));

  if (includeImages && products.length) {
    const ids = products.map((p) => Number.parseInt(p.id, 10));
    const pool2 = getPool();
    const { rows: imgRows } = await pool2.query(
      `SELECT id, product_id, image_url, display_order, created_at, updated_at
       FROM product_images
       WHERE product_id = ANY($1::bigint[])
       ORDER BY product_id ASC, display_order ASC, id ASC`,
      [ids]
    );
    const byProduct = new Map<number, ProductImageRowLite[]>();
    for (const r of imgRows) {
      const img = mapProductImageRow(r as Record<string, unknown>);
      const pid = Number.parseInt(img.product_id, 10);
      const list = byProduct.get(pid) ?? [];
      list.push(rowToLite(img));
      byProduct.set(pid, list);
    }
    for (const p of products) {
      const pid = Number.parseInt(p.id, 10);
      p.images = byProduct.get(pid) ?? [];
    }
  }

  return products;
}

/** Filter by new and/or popular flag(s); optional LIMIT. Used by dashboard summary and modals. */
export async function listProductsForDashboard(params: {
  isNewProduct?: boolean;
  isPopularProduct?: boolean;
  limit?: number;
}): Promise<ProductRow[]> {
  if (params.isNewProduct !== true && params.isPopularProduct !== true) {
    throw new HttpError(400, "Specify isNewProduct and/or isPopularProduct");
  }
  const conds: string[] = [];
  const vals: unknown[] = [];
  let n = 1;
  if (params.isNewProduct === true) {
    conds.push(`p.is_new_product = $${n++}`);
    vals.push(true);
  }
  if (params.isPopularProduct === true) {
    conds.push(`p.is_popular_product = $${n++}`);
    vals.push(true);
  }
  const where = `WHERE ${conds.join(" AND ")}`;
  let sql = `SELECT ${PRODUCT_SELECT} FROM ${PRODUCT_FROM} ${where} ORDER BY p.updated_at DESC, p.id DESC`;
  if (params.limit !== undefined && params.limit > 0) {
    sql += ` LIMIT $${n}`;
    vals.push(params.limit);
  }
  const pool = getPool();
  const { rows } = await pool.query(sql, vals);
  return rows.map((r) => mapProductRow(r as Record<string, unknown>, true));
}

export async function getProductById(id: number): Promise<ProductRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT ${PRODUCT_SELECT}
     FROM ${PRODUCT_FROM}
     WHERE p.id = $1`,
    [id]
  );
  if (!rows.length) return null;
  const product = mapProductRow(rows[0] as Record<string, unknown>, true);
  const images = await productImageService.listImagesByProductId(id);
  product.images = images.map(rowToLite);
  product.image_count = images.length;
  return product;
}

/** Folder layout: assets/{category}/{subcategory}/{product}/ */
export async function getProductStorageContext(id: number): Promise<{
  product_name: string;
  category_name: string;
  subcategory_name: string;
} | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT p.product_name, c.category_name, s.subcategory_name
     FROM products p
     INNER JOIN subcategories s ON s.id = p.subcategory_id
     INNER JOIN categories c ON c.id = s.category_id
     WHERE p.id = $1`,
    [id]
  );
  if (!rows.length) return null;
  const r = rows[0] as Record<string, unknown>;
  return {
    product_name: String(r.product_name),
    category_name: String(r.category_name),
    subcategory_name: String(r.subcategory_name)
  };
}

export async function assertProductExists(id: number): Promise<ProductRow> {
  const p = await getProductById(id);
  if (!p) {
    throw new HttpError(404, `Product with id ${id} not found`);
  }
  return p;
}

export async function createProduct(params: {
  productName: string;
  subcategoryId: number;
  description: string | null;
  originalPrice: number | null;
  offerPrice: number | null;
  classification: string | null;
  isNewProduct: boolean;
  isPopularProduct: boolean;
}): Promise<ProductRow> {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO products (
       product_name, subcategory_id, description, original_price, offer_price,
       classification, is_new_product, is_popular_product
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      params.productName.trim(),
      params.subcategoryId,
      params.description,
      params.originalPrice,
      params.offerPrice,
      params.classification,
      params.isNewProduct,
      params.isPopularProduct
    ]
  );
  const newId = Number.parseInt(String((rows[0] as { id: unknown }).id), 10);
  const full = await getProductById(newId);
  if (!full) {
    throw new HttpError(500, "Failed to load product after create");
  }
  return full;
}

export async function updateProduct(
  id: number,
  patch: {
    productName?: string;
    subcategoryId?: number;
    description?: string | null;
    originalPrice?: number | null;
    offerPrice?: number | null;
    classification?: string | null;
    isNewProduct?: boolean;
    isPopularProduct?: boolean;
  }
): Promise<ProductRow | null> {
  const keys = Object.keys(patch);
  if (!keys.length) {
    return getProductById(id);
  }

  const sets: string[] = [];
  const vals: unknown[] = [];
  let n = 1;

  if (patch.productName !== undefined) {
    sets.push(`product_name = $${n++}`);
    vals.push(patch.productName.trim());
  }
  if (patch.subcategoryId !== undefined) {
    sets.push(`subcategory_id = $${n++}`);
    vals.push(patch.subcategoryId);
  }
  if ("description" in patch) {
    sets.push(`description = $${n++}`);
    vals.push(patch.description);
  }
  if ("originalPrice" in patch) {
    sets.push(`original_price = $${n++}`);
    vals.push(patch.originalPrice);
  }
  if ("offerPrice" in patch) {
    sets.push(`offer_price = $${n++}`);
    vals.push(patch.offerPrice);
  }
  if ("classification" in patch) {
    sets.push(`classification = $${n++}`);
    vals.push(patch.classification);
  }
  if (patch.isNewProduct !== undefined) {
    sets.push(`is_new_product = $${n++}`);
    vals.push(patch.isNewProduct);
  }
  if (patch.isPopularProduct !== undefined) {
    sets.push(`is_popular_product = $${n++}`);
    vals.push(patch.isPopularProduct);
  }

  vals.push(id);
  const pool = getPool();
  const { rowCount } = await pool.query(
    `UPDATE products SET ${sets.join(", ")} WHERE id = $${n}`,
    vals
  );
  if (!rowCount) return null;
  return getProductById(id);
}

export async function deleteProduct(id: number): Promise<{ id: string } | null> {
  const paths = await productImageService.listImageUrlsByProductId(id);
  const pool = getPool();
  const { rows } = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
  if (!rows.length) return null;

  for (const rel of paths) {
    await removeAssetFileIfExists(rel);
  }

  return { id: String((rows[0] as { id: unknown }).id) };
}
