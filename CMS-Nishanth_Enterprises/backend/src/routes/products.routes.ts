import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { requireAuth } from "../middleware/authMiddleware";
import { uploadImageMiddleware } from "../middlewares/multerImage";

const router = Router();

router.use(requireAuth);

router.get("/", productController.list);
router.post("/", productController.create);

router.get("/:id/images", productController.listImages);
router.post(
  "/:id/images",
  uploadImageMiddleware.array("images", 20),
  productController.uploadImages
);
router.delete("/:id/images/:imageId", productController.deleteProductImage);

router.get("/:id", productController.getById);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);

export default router;
