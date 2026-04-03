import { Router } from "express";
import * as pageController from "../controllers/page.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", pageController.list);
router.get("/by-name/:pageName", pageController.getByName);
router.get("/:id", pageController.getById);
router.post("/", pageController.create);
router.put("/:id", pageController.update);
router.delete("/:id", pageController.remove);

export default router;
