import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import * as subcategoryController from "../controllers/subcategory.controller";
import * as productController from "../controllers/product.controller";

const router = Router();

// Public, read-only catalog APIs for website consumption.
router.get("/categories", categoryController.list);
router.get("/categories/:id", categoryController.getById);

router.get("/subcategories", subcategoryController.list);
router.get("/subcategories/:id", subcategoryController.getById);

router.get("/products", productController.list);
router.get("/products/:id", productController.getById);

export default router;
