import { Router } from "express";
import { dbHealthCheck } from "../controllers/db.controller";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/db-health-check", requireAuth, dbHealthCheck);

export default router;

