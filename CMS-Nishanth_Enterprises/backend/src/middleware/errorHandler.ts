import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { HttpError } from "../utils/httpError";

// Centralized error formatter (keeps responses consistent).
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File too large (max 1 MB)" });
      return;
    }
    res.status(400).json({ error: err.message || "Upload failed" });
    return;
  }

  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message =
    err instanceof HttpError
      ? err.message
      : statusCode === 500
        ? "Internal server error"
        : "Request failed";

  // Avoid leaking stack traces to the client in production.
  const responseBody: Record<string, unknown> = {
    error: message
  };

  if (process.env.NODE_ENV !== "production" && err instanceof Error) {
    responseBody.details = err.message;
  }

  res.status(statusCode).json(responseBody);
}

