import { PRODUCT_CLASSIFICATION_SET } from "../constants/catalog";
import { HttpError } from "./httpError";

const MAX_PRICE = 99_999_999.99;

export function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

export function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (value === null) return undefined;
  if (typeof value !== "string") {
    throw new HttpError(400, "Expected string");
  }
  return value;
}

/** For create / explicit null: empty string -> null */
export function parseDescription(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new HttpError(400, "description must be a string");
  }
  const t = value.trim();
  return t.length ? t : null;
}

/** Update: key present with null clears; undefined skips */
export function parsePatchDescription(body: Record<string, unknown>): string | null | undefined {
  if (!("description" in body)) return undefined;
  const v = body.description;
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") {
    throw new HttpError(400, "description must be a string or null");
  }
  const t = v.trim();
  return t.length ? t : null;
}

export function parsePrice(value: unknown, field: string): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const n = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new HttpError(400, `${field} must be a non-negative number`);
  }
  if (n > MAX_PRICE) {
    throw new HttpError(400, `${field} is too large`);
  }
  return Math.round(n * 100) / 100;
}

export function parsePatchPrice(body: Record<string, unknown>, key: string, label: string): number | null | undefined {
  if (!(key in body)) return undefined;
  return parsePrice(body[key], label);
}

/**
 * null / empty / omitted on create -> NULL in DB.
 * For query: "__null__" or "null" (case-insensitive) filters classification IS NULL.
 */
export function parseClassification(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new HttpError(400, `${field} must be a string or null`);
  }
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (!PRODUCT_CLASSIFICATION_SET.has(v)) {
    throw new HttpError(
      400,
      `${field} must be one of: inhouse, branded, hot, cold, or null`
    );
  }
  return v;
}

export function parsePatchClassification(body: Record<string, unknown>): string | null | undefined {
  if (!("classification" in body)) return undefined;
  const v = body.classification;
  if (v === undefined || v === null || v === "") {
    return null;
  }
  return parseClassification(v, "classification");
}

export function parseQueryClassification(raw: unknown): "null" | string | undefined {
  if (raw === undefined || raw === null || raw === "") {
    return undefined;
  }
  const s = typeof raw === "string" ? raw.trim().toLowerCase() : String(raw).trim().toLowerCase();
  if (s === "null" || s === "__null__") {
    return "null";
  }
  if (!PRODUCT_CLASSIFICATION_SET.has(s)) {
    throw new HttpError(400, "Invalid classification filter");
  }
  return s;
}

export function parseBool(value: unknown, field: string): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  throw new HttpError(400, `${field} must be a boolean`);
}

export function parseOptionalBool(value: unknown, defaultVal: boolean): boolean {
  if (value === undefined || value === null || value === "") {
    return defaultVal;
  }
  return parseBool(value, "flag");
}

export function parsePatchBool(body: Record<string, unknown>, key: string, label: string): boolean | undefined {
  if (!(key in body)) return undefined;
  return parseBool(body[key], label);
}

export function parseQueryBool(raw: unknown): boolean | undefined {
  if (raw === undefined || raw === null || raw === "") {
    return undefined;
  }
  const s = typeof raw === "string" ? raw.trim().toLowerCase() : String(raw);
  if (s === "true" || s === "1") return true;
  if (s === "false" || s === "0") return false;
  throw new HttpError(400, "Invalid boolean query (use true or false)");
}
