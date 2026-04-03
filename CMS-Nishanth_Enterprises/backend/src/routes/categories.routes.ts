import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { requireAuth } from "../middleware/authMiddleware";
import { uploadImageMiddleware } from "../middlewares/multerImage";

const router = Router();

router.use(requireAuth);

router.get("/", categoryController.list);
router.post("/", uploadImageMiddleware.single("image"), categoryController.create);
router.get("/:id", categoryController.getById);
router.put("/:id", uploadImageMiddleware.single("image"), categoryController.update);
router.delete("/:id", categoryController.remove);

export default router;
