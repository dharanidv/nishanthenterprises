import type { Request, Response } from "express";
import * as pageService from "../services/page.service";
import { HttpError } from "../utils/httpError";
import { parsePositiveInt } from "../utils/parseId";

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

export async function list(_req: Request, res: Response) {
  const data = await pageService.listPages();
  res.status(200).json({ success: true, data, count: data.length });
}

/** Lookup by exact page_name (e.g. home, about_us). Path segment is URL-encoded. */
export async function getByName(req: Request, res: Response) {
  const p = req.params.pageName;
  const raw = Array.isArray(p) ? p[0] : p ?? "";
  const pageName = decodeURIComponent(raw).trim();
  if (!pageName) {
    throw new HttpError(400, "pageName is required");
  }
  const row = await pageService.getPageByName(pageName);
  if (!row) {
    throw new HttpError(404, `Page "${pageName}" not found`);
  }
  res.status(200).json({ success: true, data: row });
}

export async function getById(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await pageService.getPageById(id);
  if (!row) {
    throw new HttpError(404, `Page with id ${id} not found`);
  }
  res.status(200).json({ success: true, data: row });
}

export async function create(req: Request, res: Response) {
  const pageName = requireNonEmptyString(req.body?.page_name, "page_name");
  const data = await pageService.createPage(pageName);
  res.status(201).json({ success: true, data });
}

export async function update(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const pageName = requireNonEmptyString(req.body?.page_name, "page_name");
  const data = await pageService.updatePage(id, pageName);
  if (!data) {
    throw new HttpError(404, `Page with id ${id} not found`);
  }
  res.status(200).json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const deleted = await pageService.deletePage(id);
  if (!deleted) {
    throw new HttpError(404, `Page with id ${id} not found`);
  }
  res.status(200).json({ success: true, message: "Page deleted", data: { id } });
}
