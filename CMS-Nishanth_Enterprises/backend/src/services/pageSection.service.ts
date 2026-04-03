import { getPool } from "../config/db";
import { mapPageSectionRow, type PageSectionRow } from "../models/pageSection.model";
import { HttpError } from "../utils/httpError";
import { assertPageExists } from "./page.service";

export async function listPageSections(pageId?: number): Promise<PageSectionRow[]> {
  const pool = getPool();
  if (pageId !== undefined && Number.isFinite(pageId)) {
    const { rows } = await pool.query(
      "SELECT id, section_name, page_id, section_content, created_time, updated_time FROM page_section WHERE page_id = $1 ORDER BY id ASC",
      [pageId]
    );
    return rows.map((r) => mapPageSectionRow(r as Record<string, unknown>));
  }
  const { rows } = await pool.query(
    "SELECT id, section_name, page_id, section_content, created_time, updated_time FROM page_section ORDER BY id ASC"
  );
  return rows.map((r) => mapPageSectionRow(r as Record<string, unknown>));
}

export async function getPageSectionById(id: number): Promise<PageSectionRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT id, section_name, page_id, section_content, created_time, updated_time FROM page_section WHERE id = $1",
    [id]
  );
  if (!rows.length) return null;
  return mapPageSectionRow(rows[0] as Record<string, unknown>);
}

export async function assertPageSectionExists(id: number): Promise<PageSectionRow> {
  const row = await getPageSectionById(id);
  if (!row) {
    throw new HttpError(404, `Page section with id ${id} not found`);
  }
  return row;
}

export async function createPageSection(params: {
  pageId: number;
  sectionName: string;
  sectionContent: string | null;
}): Promise<PageSectionRow> {
  await assertPageExists(params.pageId);
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO page_section (section_name, page_id, section_content)
     VALUES ($1, $2, $3)
     RETURNING id, section_name, page_id, section_content, created_time, updated_time`,
    [params.sectionName.trim(), params.pageId, params.sectionContent]
  );
  return mapPageSectionRow(rows[0] as Record<string, unknown>);
}

export async function updatePageSection(
  id: number,
  params: { sectionName: string; sectionContent: string | null }
): Promise<PageSectionRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE page_section
     SET section_name = $1, section_content = $2
     WHERE id = $3
     RETURNING id, section_name, page_id, section_content, created_time, updated_time`,
    [params.sectionName.trim(), params.sectionContent, id]
  );
  if (!rows.length) return null;
  return mapPageSectionRow(rows[0] as Record<string, unknown>);
}

export async function deletePageSection(id: number): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query("DELETE FROM page_section WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}

/** Section joined with page names — used for upload folder layout */
export async function getSectionWithPageNames(sectionId: number): Promise<{
  section: PageSectionRow;
  pageName: string;
} | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT ps.id, ps.section_name, ps.page_id, ps.section_content, ps.created_time, ps.updated_time, p.page_name AS page_name
     FROM page_section ps
     INNER JOIN pages p ON p.id = ps.page_id
     WHERE ps.id = $1`,
    [sectionId]
  );
  if (!rows.length) return null;
  const r = rows[0] as Record<string, unknown>;
  const pageName = String(r.page_name);
  const { page_name: _omit, ...sectionRow } = r;
  void _omit;
  return {
    section: mapPageSectionRow(sectionRow as Record<string, unknown>),
    pageName
  };
}
