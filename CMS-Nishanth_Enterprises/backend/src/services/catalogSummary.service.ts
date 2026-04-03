import { getPool } from "../config/db";
import * as productService from "./product.service";

export type ProductCountByCategory = {
  category_name: string;
  product_count: number;
};

export type ProductFlagBreakdown = {
  new_only: number;
  popular_only: number;
  both: number;
  standard: number;
};

export type CatalogDashboardData = {
  category_count: number;
  subcategory_count: number;
  product_count: number;
  products_by_category: ProductCountByCategory[];
  product_flags: ProductFlagBreakdown;
  new_products_preview: Awaited<ReturnType<typeof productService.listProductsForDashboard>>;
  popular_products_preview: Awaited<ReturnType<typeof productService.listProductsForDashboard>>;
};

function intCount(row: { n: unknown } | undefined): number {
  if (!row) return 0;
  const v = row.n;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return Number.parseInt(String(v ?? 0), 10) || 0;
}

export async function getCatalogDashboardSummary(): Promise<CatalogDashboardData> {
  const pool = getPool();
  const byCategorySql = `
    SELECT c.category_name AS category_name, COUNT(p.id)::int AS product_count
    FROM categories c
    LEFT JOIN subcategories s ON s.category_id = c.id
    LEFT JOIN products p ON p.subcategory_id = s.id
    GROUP BY c.id, c.category_name
    ORDER BY product_count DESC, c.category_name ASC
  `;
  const flagsSql = `
    SELECT
      COUNT(*) FILTER (WHERE is_new_product AND NOT is_popular_product)::int AS new_only,
      COUNT(*) FILTER (WHERE is_popular_product AND NOT is_new_product)::int AS popular_only,
      COUNT(*) FILTER (WHERE is_new_product AND is_popular_product)::int AS both,
      COUNT(*) FILTER (WHERE NOT is_new_product AND NOT is_popular_product)::int AS standard
    FROM products
  `;

  const [catRow, subRow, prodRow, byCatRows, flagRow, newPreview, popularPreview] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS n FROM categories"),
    pool.query("SELECT COUNT(*)::int AS n FROM subcategories"),
    pool.query("SELECT COUNT(*)::int AS n FROM products"),
    pool.query<{ category_name: string; product_count: number }>(byCategorySql),
    pool.query<{
      new_only: number;
      popular_only: number;
      both: number;
      standard: number;
    }>(flagsSql),
    productService.listProductsForDashboard({ isNewProduct: true, limit: 5 }),
    productService.listProductsForDashboard({ isPopularProduct: true, limit: 5 })
  ]);

  const fr = flagRow.rows[0];
  const product_flags: ProductFlagBreakdown = fr
    ? {
        new_only: intCount({ n: fr.new_only }),
        popular_only: intCount({ n: fr.popular_only }),
        both: intCount({ n: fr.both }),
        standard: intCount({ n: fr.standard })
      }
    : { new_only: 0, popular_only: 0, both: 0, standard: 0 };

  return {
    category_count: intCount(catRow.rows[0] as { n: unknown }),
    subcategory_count: intCount(subRow.rows[0] as { n: unknown }),
    product_count: intCount(prodRow.rows[0] as { n: unknown }),
    products_by_category: byCatRows.rows.map((r) => ({
      category_name: r.category_name,
      product_count: intCount({ n: r.product_count })
    })),
    product_flags,
    new_products_preview: newPreview,
    popular_products_preview: popularPreview
  };
}
