import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import * as categoryService from "../services/category.service";
import * as subcategoryService from "../services/subcategory.service";
import { persistSubcategoryImage, removeAssetFileIfExists } from "../utils/fileStorage";
import { HttpError } from "../utils/httpError";
import { parsePositiveInt, parseOptionalPositiveInt } from "../utils/parseId";
import { parseDescription, requireNonEmptyString } from "../utils/catalogValidation";

async function unlinkSafe(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
}

export async function list(req: Request, res: Response) {
  const categoryId = parseOptionalPositiveInt(req.query.category_id, "category_id");
  const data = await subcategoryService.listSubcategories(categoryId);
  res.status(200).json({ success: true, data, count: data.length });
}

export async function getById(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await subcategoryService.getSubcategoryById(id);
  if (!row) {
    throw new HttpError(404, `Subcategory with id ${id} not found`);
  }
  res.status(200).json({ success: true, data: row });
}

export async function create(req: Request, res: Response) {
  const name = requireNonEmptyString(req.body?.subcategory_name, "subcategory_name");
  const categoryId = parsePositiveInt(req.body?.category_id, "category_id");
  const category = await categoryService.assertCategoryExists(categoryId);
  let imageUrl = parseDescription(req.body?.image_url);

  if (req.file) {
    const ext = path.extname(req.file.originalname || req.file.filename || "").toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      await unlinkSafe(req.file.path);
      throw new HttpError(400, "Only jpg, jpeg, and png images are allowed");
    }
    try {
      imageUrl = await persistSubcategoryImage({
        tempFilePath: req.file.path,
        categoryName: category.category_name,
        subcategoryName: name,
        originalExt: ext
      });
    } catch (e) {
      await unlinkSafe(req.file.path);
      throw e;
    }
  }

  const data = await subcategoryService.createSubcategory({
    subcategoryName: name,
    categoryId,
    imageUrl
  });
  res.status(201).json({ success: true, data });
}

export async function update(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const name = requireNonEmptyString(req.body?.subcategory_name, "subcategory_name");
  const categoryId = parsePositiveInt(req.body?.category_id, "category_id");
  const category = await categoryService.assertCategoryExists(categoryId);
  const existing = await subcategoryService.assertSubcategoryExists(id);
  let imageUrl = existing.image_url;

  if (req.file) {
    const ext = path.extname(req.file.originalname || req.file.filename || "").toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      await unlinkSafe(req.file.path);
      throw new HttpError(400, "Only jpg, jpeg, and png images are allowed");
    }
    try {
      imageUrl = await persistSubcategoryImage({
        tempFilePath: req.file.path,
        categoryName: category.category_name,
        subcategoryName: name,
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

  const data = await subcategoryService.updateSubcategory(id, {
    subcategoryName: name,
    categoryId,
    imageUrl
  });
  if (!data) {
    throw new HttpError(404, `Subcategory with id ${id} not found`);
  }
  res.status(200).json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await subcategoryService.deleteSubcategory(id);
  if (!row) {
    throw new HttpError(404, `Subcategory with id ${id} not found`);
  }
  res.status(200).json({
    success: true,
    message: "Subcategory deleted (products and images removed per cascade)",
    data: { id: String(id) }
  });
}
