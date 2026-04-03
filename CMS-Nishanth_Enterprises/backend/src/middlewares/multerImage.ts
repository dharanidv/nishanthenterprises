import fs from "fs/promises";
import type { Request } from "express";
import multer from "multer";
import path from "path";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

const MAX_BYTES = 1024 * 1024; // 1 MB
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png"]);
const ALLOWED_MIME = new Set(["image/jpeg", "image/png"]);

const tmpDir = path.join(env.assetsRoot, ".tmp");

async function ensureTmp() {
  await fs.mkdir(tmpDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await ensureTmp();
      cb(null, tmpDir);
    } catch (e) {
      cb(e as Error, tmpDir);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : ".bin";
    const base = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    cb(null, `${base}${safeExt}`);
  }
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    cb(new HttpError(400, "Only jpg, jpeg, and png images are allowed"));
    return;
  }
  const mime = (file.mimetype || "").toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    cb(new HttpError(400, "Invalid image MIME type"));
    return;
  }
  cb(null, true);
}

export const uploadImageMiddleware = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter
});
