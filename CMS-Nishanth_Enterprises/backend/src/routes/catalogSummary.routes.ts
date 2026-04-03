import { Router } from "express";
import * as catalogSummaryController from "../controllers/catalogSummary.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);
router.get("/summary", catalogSummaryController.getDashboardSummary);

export default router;
