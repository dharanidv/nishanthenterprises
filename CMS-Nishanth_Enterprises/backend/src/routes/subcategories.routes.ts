import { Router } from "express";
import * as subcategoryController from "../controllers/subcategory.controller";
import { requireAuth } from "../middleware/authMiddleware";
import { uploadImageMiddleware } from "../middlewares/multerImage";

const router = Router();

router.use(requireAuth);

router.get("/", subcategoryController.list);
router.post("/", uploadImageMiddleware.single("image"), subcategoryController.create);
router.get("/:id", subcategoryController.getById);
router.put("/:id", uploadImageMiddleware.single("image"), subcategoryController.update);
router.delete("/:id", subcategoryController.remove);

export default router;
