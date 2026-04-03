import type { Request, Response } from "express";

/** Public liveness check (no DB, no JWT) — used before login. */
export function publicHealth(_req: Request, res: Response) {
  return res.status(200).json({ status: "ok" });
}
