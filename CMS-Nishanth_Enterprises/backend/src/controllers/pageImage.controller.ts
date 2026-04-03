import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import * as pageImageService from "../services/pageImage.service";
import * as pageSectionService from "../services/pageSection.service";
import { persistUploadedImage, removeAssetFileIfExists } from "../utils/fileStorage";
import { HttpError } from "../utils/httpError";
import { parsePositiveInt } from "../utils/parseId";

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

function parseOptionalBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }
  throw new HttpError(400, "status must be a boolean");
}

export async function list(req: Request, res: Response) {
  const q = req.query.section_id;
  let sectionId: number | undefined;
  if (q !== undefined && q !== "") {
    sectionId = parsePositiveInt(typeof q === "string" ? q : String(q), "section_id");
  }
  const data = await pageImageService.listPageImages(sectionId);
  res.status(200).json({ success: true, data, count: data.length });
}

export async function getById(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await pageImageService.getPageImageById(id);
  if (!row) {
    throw new HttpError(404, `Page image with id ${id} not found`);
  }
  res.status(200).json({ success: true, data: row });
}

/** JSON body: { section_id, image_url } — no file upload */
export async function createFromUrl(req: Request, res: Response) {
  const sectionId = parsePositiveInt(req.body?.section_id, "section_id");
  const imageUrl = requireNonEmptyString(req.body?.image_url, "image_url");
  const status = parseOptionalBool(req.body?.status);
  const data = await pageImageService.createPageImage({ sectionId, imageUrl, status });
  res.status(201).json({ success: true, data });
}

/** Multipart: section_id + field image — stores relative path under assets root */
export async function createFromUpload(req: Request, res: Response) {
  const sectionIdRaw = req.body?.section_id;
  const sectionId = parsePositiveInt(sectionIdRaw, "section_id");
  const file = req.file;
  if (!file) {
    throw new HttpError(400, "Image file is required (field name: image)");
  }

  const meta = await pageSectionService.getSectionWithPageNames(sectionId);
  if (!meta) {
    await removeUploadedTemp(file.path);
    throw new HttpError(404, `Page section with id ${sectionId} not found`);
  }

  const ext = path.extname(file.originalname || file.filename || "").toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) {
    await removeUploadedTemp(file.path);
    throw new HttpError(400, "Only jpg, jpeg, and png images are allowed");
  }

  try {
    const relativePath = await persistUploadedImage({
      tempFilePath: file.path,
      pageName: meta.pageName,
      sectionName: meta.section.section_name,
      originalExt: ext
    });

    const status = parseOptionalBool(req.body?.status);
    const data = await pageImageService.createPageImage({
      sectionId,
      imageUrl: relativePath,
      status
    });
    res.status(201).json({ success: true, data });
  } catch (e) {
    await removeUploadedTemp(file.path);
    throw e;
  }
}

async function removeUploadedTemp(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
}

export async function update(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const existing = await pageImageService.assertPageImageExists(id);

  if (req.file) {
    const ext = path.extname(req.file.originalname || req.file.filename || "").toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      await removeUploadedTemp(req.file.path);
      throw new HttpError(400, "Only jpg, jpeg, and png images are allowed");
    }

    const sectionId = Number.parseInt(existing.section_id, 10);
    const meta = await pageSectionService.getSectionWithPageNames(sectionId);
    if (!meta) {
      await removeUploadedTemp(req.file.path);
      throw new HttpError(404, "Linked section not found");
    }

    try {
      const relativePath = await persistUploadedImage({
        tempFilePath: req.file.path,
        pageName: meta.pageName,
        sectionName: meta.section.section_name,
        originalExt: ext
      });
      await removeAssetFileIfExists(existing.image_url);
      const status = parseOptionalBool(req.body?.status);
      const data = await pageImageService.updatePageImageFields(id, {
        imageUrl: relativePath,
        status
      });
      res.status(200).json({ success: true, data });
    } catch (e) {
      await removeUploadedTemp(req.file.path);
      throw e;
    }
    return;
  }

  let imageUrl: string | undefined;
  if (req.body?.image_url !== undefined && req.body?.image_url !== null && String(req.body.image_url).trim() !== "") {
    imageUrl = requireNonEmptyString(req.body.image_url, "image_url");
  }
  const status = parseOptionalBool(req.body?.status);
  if (imageUrl === undefined && status === undefined) {
    throw new HttpError(400, "Provide image_url and/or status");
  }
  const data = await pageImageService.updatePageImageFields(id, { imageUrl, status });
  if (!data) {
    throw new HttpError(404, `Page image with id ${id} not found`);
  }
  res.status(200).json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await pageImageService.deletePageImage(id);
  if (!row) {
    throw new HttpError(404, `Page image with id ${id} not found`);
  }
  await removeAssetFileIfExists(row.image_url);
  res.status(200).json({ success: true, message: "Page image deleted", data: { id } });
}
