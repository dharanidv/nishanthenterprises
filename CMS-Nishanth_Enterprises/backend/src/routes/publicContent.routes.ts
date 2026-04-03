import { Router } from "express";
import * as publicContentController from "../controllers/publicContent.controller";

const router = Router();

/** Public API for frontend site rendering (no JWT). */
router.get("/home_contents", publicContentController.getHomeContents);

export default router;

