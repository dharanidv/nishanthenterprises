import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

export type AuthenticatedRequest = Request & { user?: { email: string } };

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing or invalid Authorization header");
    }

    const token = authHeader.slice("Bearer ".length);
    if (!env.jwtSecret) {
      throw new HttpError(500, "JWT secret not configured");
    }

    const payload = jwt.verify(token, env.jwtSecret) as { sub?: string; email?: string };
    const email = payload.email ?? payload.sub;
    if (!email) {
      throw new HttpError(401, "Invalid token payload");
    }

    req.user = { email };
    next();
  } catch (err) {
    next(err instanceof Error ? new HttpError(401, err.message) : new HttpError(401, "Unauthorized"));
  }
}

