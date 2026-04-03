import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import * as categoryService from "../services/category.service";
import { persistCategoryImage, removeAssetFileIfExists } from "../utils/fileStorage";
import { HttpError } from "../utils/httpError";
import { parsePositiveInt } from "../utils/parseId";
import { parseDescription, requireNonEmptyString } from "../utils/catalogValidation";

async function unlinkSafe(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
}

export async function list(_req: Request, res: Response) {
  const data = await categoryService.listCategories();
  res.status(200).json({ success: true, data, count: data.length });
}

export async function getById(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await categoryService.getCategoryById(id);
  if (!row) {
    throw new HttpError(404, `Category with id ${id} not found`);
  }
  res.status(200).json({ success: true, data: row });
}

export async function create(req: Request, res: Response) {
  const name = requireNonEmptyString(req.body?.category_name, "category_name");
  let imageUrl = parseDescription(req.body?.image_url);

  if (req.file) {
    const ext = path.extname(req.file.originalname || req.file.filename || "").toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      await unlinkSafe(req.file.path);
      throw new HttpError(400, "Only jpg, jpeg, and png images are allowed");
    }
    try {
      imageUrl = await persistCategoryImage({
        tempFilePath: req.file.path,
        categoryName: name,
        originalExt: ext
      });
    } catch (e) {
      await unlinkSafe(req.file.path);
      throw e;
    }
  }

  const data = await categoryService.createCategory(name, imageUrl);
  res.status(201).json({ success: true, data });
}

export async function update(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const name = requireNonEmptyString(req.body?.category_name, "category_name");
  const existing = await categoryService.assertCategoryExists(id);
  let imageUrl = existing.image_url;

  if (req.file) {
    const ext = path.extname(req.file.originalname || req.file.filename || "").toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      await unlinkSafe(req.file.path);
      throw new HttpError(400, "Only jpg, jpeg, and png images are allowed");
    }
    try {
      imageUrl = await persistCategoryImage({
        tempFilePath: req.file.path,
        categoryName: name,
        originalExt: ext
      });
      if (existing.image_url) {
        await removeAssetFileIfExists(existing.image_url);
      }
    } catch (e) {
      await unlinkSafe(req.file.path);
      throw e;
    }
  }
  if (!req.file && Object.prototype.hasOwnProperty.call(req.body ?? {}, "image_url")) {
    imageUrl = parseDescription(req.body?.image_url);
  }

  const data = await categoryService.updateCategory(id, name, imageUrl);
  if (!data) {
    throw new HttpError(404, `Category with id ${id} not found`);
  }
  res.status(200).json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await categoryService.deleteCategory(id);
  if (!row) {
    throw new HttpError(404, `Category with id ${id} not found`);
  }
  res.status(200).json({
    success: true,
    message: "Category deleted (products and product images removed per cascade)",
    data: { id: String(id) }
  });
}
