import type { Request, Response } from "express";
import { checkDatabaseHealth } from "../services/db.service";

export async function dbHealthCheck(_req: Request, res: Response) {
  try {
    await checkDatabaseHealth();
    return res.status(200).json({ status: "ok", database: "connected" });
  } catch (_err) {
    // Keep payload shape stable for frontend gating logic.
    return res.status(503).json({ status: "error", database: "disconnected" });
  }
}

