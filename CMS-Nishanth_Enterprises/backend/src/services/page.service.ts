import { getPool } from "../config/db";
import { mapPageRow, type PageRow } from "../models/page.model";
import { HttpError } from "../utils/httpError";

export async function listPages(): Promise<PageRow[]> {
  const pool = getPool();
  const { rows } = await pool.query("SELECT id, page_name, created_at, updated_at FROM pages ORDER BY id ASC");
  return rows.map((r) => mapPageRow(r as Record<string, unknown>));
}

export async function getPageById(id: number): Promise<PageRow | null> {
  const pool = getPool();
  const { rows } = await pool.query("SELECT id, page_name, created_at, updated_at FROM pages WHERE id = $1", [id]);
  if (!rows.length) return null;
  return mapPageRow(rows[0] as Record<string, unknown>);
}

/** Exact match on page_name (e.g. home, about_us). */
export async function getPageByName(pageName: string): Promise<PageRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT id, page_name, created_at, updated_at FROM pages WHERE page_name = $1 LIMIT 1",
    [pageName.trim()]
  );
  if (!rows.length) return null;
  return mapPageRow(rows[0] as Record<string, unknown>);
}

export async function assertPageExists(id: number): Promise<PageRow> {
  const page = await getPageById(id);
  if (!page) {
    throw new HttpError(404, `Page with id ${id} not found`);
  }
  return page;
}

export async function createPage(pageName: string): Promise<PageRow> {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO pages (page_name) VALUES ($1) RETURNING id, page_name, created_at, updated_at`,
    [pageName.trim()]
  );
  return mapPageRow(rows[0] as Record<string, unknown>);
}

export async function updatePage(id: number, pageName: string): Promise<PageRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE pages SET page_name = $1 WHERE id = $2 RETURNING id, page_name, created_at, updated_at`,
    [pageName.trim(), id]
  );
  if (!rows.length) return null;
  return mapPageRow(rows[0] as Record<string, unknown>);
}

export async function deletePage(id: number): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query("DELETE FROM pages WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
