import { Router } from "express";
import * as pageImageController from "../controllers/pageImage.controller";
import { requireAuth } from "../middleware/authMiddleware";
import { uploadImageMiddleware } from "../middlewares/multerImage";

const router = Router();

router.use(requireAuth);

router.get("/", pageImageController.list);
router.post("/upload", uploadImageMiddleware.single("image"), pageImageController.createFromUpload);
router.get("/:id", pageImageController.getById);
router.post("/", pageImageController.createFromUrl);

function multipartIfNeeded(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const ct = String(req.headers["content-type"] || "");
  if (ct.includes("multipart/form-data")) {
    return uploadImageMiddleware.single("image")(req, res, next);
  }
  next();
}

router.put("/:id", multipartIfNeeded, pageImageController.update);
router.delete("/:id", pageImageController.remove);

export default router;
