import { Router } from "express";
import { publicHealth } from "../controllers/health.controller";

const router = Router();

router.get("/health", publicHealth);

export default router;
