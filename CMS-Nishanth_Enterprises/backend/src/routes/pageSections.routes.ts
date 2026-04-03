import { Router } from "express";
import * as pageSectionController from "../controllers/pageSection.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", pageSectionController.list);
router.get("/:id", pageSectionController.getById);
router.post("/", pageSectionController.create);
router.put("/:id", pageSectionController.update);
router.delete("/:id", pageSectionController.remove);

export default router;
