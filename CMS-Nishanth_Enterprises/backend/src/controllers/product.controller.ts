import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import * as productImageService from "../services/productImage.service";
import * as productService from "../services/product.service";
import * as subcategoryService from "../services/subcategory.service";
import { persistProductImage, removeAssetFileIfExists } from "../utils/fileStorage";
import { HttpError } from "../utils/httpError";
import { parsePositiveInt, parseOptionalPositiveInt } from "../utils/parseId";
import {
  parseClassification,
  parseDescription,
  parseOptionalBool,
  parsePatchBool,
  parsePatchClassification,
  parsePatchDescription,
  parsePatchPrice,
  parsePrice,
  parseQueryBool,
  parseQueryClassification,
  requireNonEmptyString
} from "../utils/catalogValidation";

async function unlinkSafe(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
}

function parseIncludeImages(q: unknown): boolean {
  if (q === undefined || q === null || q === "") return false;
  const s = typeof q === "string" ? q.trim().toLowerCase() : String(q);
  return s === "true" || s === "1" || s === "yes";
}

export async function list(req: Request, res: Response) {
  const categoryId = parseOptionalPositiveInt(req.query.category_id, "category_id");
  const subcategoryId = parseOptionalPositiveInt(req.query.subcategory_id, "subcategory_id");
  const isNew = parseQueryBool(req.query.is_new_product);
  const isPopular = parseQueryBool(req.query.is_popular_product);
  const clsRaw = parseQueryClassification(req.query.classification);

  const filters: productService.ProductListFilters = {};
  if (subcategoryId !== undefined) {
    filters.subcategoryId = subcategoryId;
  } else if (categoryId !== undefined) {
    filters.categoryId = categoryId;
  }
  if (isNew !== undefined) filters.isNewProduct = isNew;
  if (isPopular !== undefined) filters.isPopularProduct = isPopular;
  if (clsRaw === "null") {
    filters.classificationIsNull = true;
  } else if (clsRaw !== undefined) {
    filters.classification = clsRaw;
  }

  const includeImages = parseIncludeImages(req.query.include_images);
  const data = await productService.listProducts(filters, includeImages);
  res.status(200).json({ success: true, data, count: data.length });
}

export async function create(req: Request, res: Response) {
  const body = req.body ?? {};
  const productName = requireNonEmptyString(body.product_name, "product_name");
  const subcategoryId = parsePositiveInt(body.subcategory_id, "subcategory_id");
  await subcategoryService.assertSubcategoryExists(subcategoryId);

  const data = await productService.createProduct({
    productName,
    subcategoryId,
    description: parseDescription(body.description),
    originalPrice: parsePrice(body.original_price, "original_price"),
    offerPrice: parsePrice(body.offer_price, "offer_price"),
    classification: parseClassification(body.classification, "classification"),
    isNewProduct: parseOptionalBool(body.is_new_product, false),
    isPopularProduct: parseOptionalBool(body.is_popular_product, false)
  });

  res.status(201).json({ success: true, data });
}

export async function getById(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await productService.getProductById(id);
  if (!row) {
    throw new HttpError(404, `Product with id ${id} not found`);
  }
  res.status(200).json({ success: true, data: row });
}

export async function update(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const body = req.body as Record<string, unknown>;

  const patch: Parameters<typeof productService.updateProduct>[1] = {};

  if (body.product_name !== undefined) {
    patch.productName = requireNonEmptyString(body.product_name, "product_name");
  }
  if (body.subcategory_id !== undefined) {
    const sid = parsePositiveInt(body.subcategory_id, "subcategory_id");
    await subcategoryService.assertSubcategoryExists(sid);
    patch.subcategoryId = sid;
  }
  const desc = parsePatchDescription(body);
  if (desc !== undefined) patch.description = desc;

  const op = parsePatchPrice(body, "original_price", "original_price");
  if (op !== undefined) patch.originalPrice = op;
  const fp = parsePatchPrice(body, "offer_price", "offer_price");
  if (fp !== undefined) patch.offerPrice = fp;

  const cl = parsePatchClassification(body);
  if (cl !== undefined) patch.classification = cl;

  const np = parsePatchBool(body, "is_new_product", "is_new_product");
  if (np !== undefined) patch.isNewProduct = np;
  const pp = parsePatchBool(body, "is_popular_product", "is_popular_product");
  if (pp !== undefined) patch.isPopularProduct = pp;

  const data = await productService.updateProduct(id, patch);
  if (!data) {
    throw new HttpError(404, `Product with id ${id} not found`);
  }
  res.status(200).json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  const id = parsePositiveInt(req.params.id, "id");
  const row = await productService.deleteProduct(id);
  if (!row) {
    throw new HttpError(404, `Product with id ${id} not found`);
  }
  res.status(200).json({ success: true, message: "Product deleted", data: { id: String(id) } });
}

export async function listImages(req: Request, res: Response) {
  const pid = parsePositiveInt(req.params.id, "id");
  await productImageService.assertProductExistsForImage(pid);
  const data = await productImageService.listImagesByProductId(pid);
  res.status(200).json({ success: true, data, count: data.length });
}

export async function uploadImages(req: Request, res: Response) {
  const productId = parsePositiveInt(req.params.id, "id");
  const meta = await productService.getProductStorageContext(productId);
  if (!meta) {
    throw new HttpError(404, `Product with id ${productId} not found`);
  }

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) {
    throw new HttpError(400, "One or more image files are required (field name: images)");
  }

  let nextOrder = await productImageService.getNextDisplayOrder(productId);
  const created = [];

  try {
    for (const file of files) {
      const ext = path.extname(file.originalname || file.filename || "").toLowerCase();
      if (![".jpg", ".jpeg", ".png"].includes(ext)) {
        await unlinkSafe(file.path);
        throw new HttpError(400, "Only jpg, jpeg, and png images are allowed");
      }

      const relativePath = await persistProductImage({
        tempFilePath: file.path,
        categoryName: meta.category_name,
        subcategoryName: meta.subcategory_name,
        productName: meta.product_name,
        originalExt: ext
      });

      const row = await productImageService.createProductImage({
        productId,
        imageUrl: relativePath,
        displayOrder: nextOrder++
      });
      created.push(row);
    }
  } catch (e) {
    for (let i = created.length - 1; i >= 0; i--) {
      const del = await productImageService.deleteProductImageIfOwned(
        productId,
        Number.parseInt(created[i].id, 10)
      );
      if (del) {
        await removeAssetFileIfExists(del.image_url);
      }
    }
    for (const file of files) {
      await unlinkSafe(file.path);
    }
    throw e;
  }

  res.status(201).json({ success: true, data: created, count: created.length });
}

export async function deleteProductImage(req: Request, res: Response) {
  const productId = parsePositiveInt(req.params.id, "id");
  const imageId = parsePositiveInt(req.params.imageId, "imageId");

  const row = await productImageService.deleteProductImageIfOwned(productId, imageId);
  if (!row) {
    throw new HttpError(404, `Product image with id ${imageId} not found for this product`);
  }
  await removeAssetFileIfExists(row.image_url);
  res.status(200).json({
    success: true,
    message: "Product image deleted",
    data: { id: row.id, product_id: String(productId) }
  });
}
