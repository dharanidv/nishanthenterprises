import type { Request, Response } from "express";
import * as pageSectionService from "../services/pageSection.service";
import { HttpError } from "../utils/httpError";
import { parsePositiveInt } from "../utils/parseId";

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

export async function list(req: Request, res: Response) {
  const q = req.query.page_id;
  let pageId: number | undefined;
  if (q !== undefined && q !== "") {
    pageId = parsePositiveInt(typeof q === "string" ? q : String(q), "page_id");
  }
  const data = await pageSectionService.listPageSections(pageId);
  res.status(200).json({ success: true, data, count: data.length });
}

export async function getById(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await pageSectionService.getPageSectionById(id);
  if (!row) {
    throw new HttpError(404, `Page section with id ${id} not found`);
  }
  res.status(200).json({ success: true, data: row });
}

export async function create(req: Request, res: Response) {
  const pageId = parsePositiveInt(req.body?.page_id, "page_id");
  const sectionName = requireNonEmptyString(req.body?.section_name, "section_name");
  let sectionContent: string | null = null;
  if (req.body?.section_content !== undefined && req.body?.section_content !== null) {
    if (typeof req.body.section_content !== "string") {
      throw new HttpError(400, "section_content must be a string");
    }
    sectionContent = req.body.section_content;
  }

  const data = await pageSectionService.createPageSection({
    pageId,
    sectionName,
    sectionContent
  });
  res.status(201).json({ success: true, data });
}

export async function update(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const sectionName = requireNonEmptyString(req.body?.section_name, "section_name");
  let sectionContent: string | null = null;
  if (req.body?.section_content !== undefined && req.body?.section_content !== null) {
    if (typeof req.body.section_content !== "string") {
      throw new HttpError(400, "section_content must be a string");
    }
    sectionContent = req.body.section_content;
  }

  const data = await pageSectionService.updatePageSection(id, { sectionName, sectionContent });
  if (!data) {
    throw new HttpError(404, `Page section with id ${id} not found`);
  }
  res.status(200).json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const deleted = await pageSectionService.deletePageSection(id);
  if (!deleted) {
    throw new HttpError(404, `Page section with id ${id} not found`);
  }
  res.status(200).json({ success: true, message: "Page section deleted", data: { id } });
}
