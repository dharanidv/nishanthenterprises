import { getPool } from "../config/db";
import { mapPageImageRow, type PageImageRow } from "../models/pageImage.model";
import { HttpError } from "../utils/httpError";
import { assertPageSectionExists } from "./pageSection.service";

export async function listPageImages(sectionId?: number): Promise<PageImageRow[]> {
  const pool = getPool();
  if (sectionId !== undefined && Number.isFinite(sectionId)) {
    const { rows } = await pool.query(
      "SELECT id, image_url, section_id, status, created_time, updated_time FROM page_images WHERE section_id = $1 ORDER BY id ASC",
      [sectionId]
    );
    return rows.map((r) => mapPageImageRow(r as Record<string, unknown>));
  }
  const { rows } = await pool.query(
    "SELECT id, image_url, section_id, status, created_time, updated_time FROM page_images ORDER BY id ASC"
  );
  return rows.map((r) => mapPageImageRow(r as Record<string, unknown>));
}

export async function getPageImageById(id: number): Promise<PageImageRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT id, image_url, section_id, status, created_time, updated_time FROM page_images WHERE id = $1",
    [id]
  );
  if (!rows.length) return null;
  return mapPageImageRow(rows[0] as Record<string, unknown>);
}

export async function assertPageImageExists(id: number): Promise<PageImageRow> {
  const row = await getPageImageById(id);
  if (!row) {
    throw new HttpError(404, `Page image with id ${id} not found`);
  }
  return row;
}

export async function createPageImage(params: {
  sectionId: number;
  imageUrl: string;
  status?: boolean;
}): Promise<PageImageRow> {
  await assertPageSectionExists(params.sectionId);
  const pool = getPool();
  const active = params.status !== undefined ? params.status : true;
  const { rows } = await pool.query(
    `INSERT INTO page_images (image_url, section_id, status) VALUES ($1, $2, $3)
     RETURNING id, image_url, section_id, status, created_time, updated_time`,
    [params.imageUrl.trim(), params.sectionId, active]
  );
  return mapPageImageRow(rows[0] as Record<string, unknown>);
}

/** Update image_url and/or status; omitted fields stay unchanged. */
export async function updatePageImageFields(
  id: number,
  fields: { imageUrl?: string; status?: boolean }
): Promise<PageImageRow | null> {
  const pool = getPool();
  const url = fields.imageUrl !== undefined ? fields.imageUrl.trim() : null;
  const st = fields.status !== undefined ? fields.status : null;
  const { rows } = await pool.query(
    `UPDATE page_images SET
      image_url = COALESCE($1, image_url),
      status = COALESCE($2, status)
     WHERE id = $3
     RETURNING id, image_url, section_id, status, created_time, updated_time`,
    [url, st, id]
  );
  if (!rows.length) return null;
  return mapPageImageRow(rows[0] as Record<string, unknown>);
}

export async function deletePageImage(id: number): Promise<PageImageRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    "DELETE FROM page_images WHERE id = $1 RETURNING id, image_url, section_id, status, created_time, updated_time",
    [id]
  );
  if (!rows.length) return null;
  return mapPageImageRow(rows[0] as Record<string, unknown>);
}
