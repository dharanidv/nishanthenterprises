import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";
import { sanitizePathSegment } from "./sanitizePathSegment";

/** Relative path inside assets root, e.g. "about-us/hero/uuid.jpg" */
export async function persistUploadedImage(params: {
  tempFilePath: string;
  pageName: string;
  sectionName: string;
  originalExt: string;
}): Promise<string> {
  const pageSeg = sanitizePathSegment(params.pageName);
  const sectionSeg = sanitizePathSegment(params.sectionName);
  const base = path.resolve(env.assetsRoot);
  const destDir = path.join(base, pageSeg, sectionSeg);
  await fs.mkdir(destDir, { recursive: true });

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const fileName = `${unique}${params.originalExt}`;
  const destAbs = path.join(destDir, fileName);

  await fs.rename(params.tempFilePath, destAbs);

  const rel = path.posix.join(pageSeg, sectionSeg, fileName);
  return rel.replace(/\\/g, "/");
}

/** Product images: assets/{category-slug}/{subcategory-slug}/{product-slug}/{unique}.ext */
export async function persistProductImage(params: {
  tempFilePath: string;
  categoryName: string;
  subcategoryName: string;
  productName: string;
  originalExt: string;
}): Promise<string> {
  const catSeg = sanitizePathSegment(params.categoryName);
  const subSeg = sanitizePathSegment(params.subcategoryName);
  const prodSeg = sanitizePathSegment(params.productName);
  const base = path.resolve(env.assetsRoot);
  const destDir = path.join(base, catSeg, subSeg, prodSeg);
  await fs.mkdir(destDir, { recursive: true });

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const fileName = `${unique}${params.originalExt}`;
  const destAbs = path.join(destDir, fileName);

  await fs.rename(params.tempFilePath, destAbs);

  const rel = path.posix.join(catSeg, subSeg, prodSeg, fileName);
  return rel.replace(/\\/g, "/");
}

/** Category image: assets/categories/{category-slug}/{unique}.ext */
export async function persistCategoryImage(params: {
  tempFilePath: string;
  categoryName: string;
  originalExt: string;
}): Promise<string> {
  const catSeg = sanitizePathSegment(params.categoryName);
  const base = path.resolve(env.assetsRoot);
  const destDir = path.join(base, "categories", catSeg);
  await fs.mkdir(destDir, { recursive: true });

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const fileName = `${unique}${params.originalExt}`;
  const destAbs = path.join(destDir, fileName);

  await fs.rename(params.tempFilePath, destAbs);

  const rel = path.posix.join("categories", catSeg, fileName);
  return rel.replace(/\\/g, "/");
}

/** Subcategory image: assets/subcategories/{category-slug}/{subcategory-slug}/{unique}.ext */
export async function persistSubcategoryImage(params: {
  tempFilePath: string;
  categoryName: string;
  subcategoryName: string;
  originalExt: string;
}): Promise<string> {
  const catSeg = sanitizePathSegment(params.categoryName);
  const subSeg = sanitizePathSegment(params.subcategoryName);
  const base = path.resolve(env.assetsRoot);
  const destDir = path.join(base, "subcategories", catSeg, subSeg);
  await fs.mkdir(destDir, { recursive: true });

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const fileName = `${unique}${params.originalExt}`;
  const destAbs = path.join(destDir, fileName);

  await fs.rename(params.tempFilePath, destAbs);

  const rel = path.posix.join("subcategories", catSeg, subSeg, fileName);
  return rel.replace(/\\/g, "/");
}

export async function removeAssetFileIfExists(relativePath: string): Promise<void> {
  if (!relativePath || relativePath.includes("..")) {
    return;
  }
  const abs = path.join(path.resolve(env.assetsRoot), relativePath);
  const root = path.resolve(env.assetsRoot);
  if (!abs.startsWith(root)) {
    return;
  }
  try {
    await fs.unlink(abs);
  } catch {
    // ignore missing file
  }
}
