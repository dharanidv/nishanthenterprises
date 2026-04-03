import { HttpError } from "./httpError";

export function parsePositiveInt(value: unknown, fieldName: string): number {
  if (value === undefined || value === null || value === "") {
    throw new HttpError(400, `Missing or invalid ${fieldName}`);
  }
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n) || n < 1 || !Number.isInteger(n)) {
    throw new HttpError(400, `Invalid ${fieldName}: must be a positive integer`);
  }
  return n;
}

export function parseOptionalPositiveInt(value: unknown, fieldName: string): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return parsePositiveInt(value, fieldName);
}
