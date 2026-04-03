import dotenv from "dotenv";
import path from "path";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),

  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",

  // Server security / CORS
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  // JWT
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",

  // Mock auth (env-based)
  // Prefer providing AUTH_ADMIN_PASSWORD_HASH for production safety.
  authAdminEmail: process.env.AUTH_ADMIN_EMAIL ?? "",
  /** Optional display name; defaults to email local-part in profile API */
  authAdminUsername: process.env.AUTH_ADMIN_USERNAME ?? "",
  authAdminPasswordHash: process.env.AUTH_ADMIN_PASSWORD_HASH ?? "",
  authAdminPasswordPlain: process.env.AUTH_ADMIN_PASSWORD ?? "",

  /** Absolute path to file storage root (uploads live under page/section subfolders) */
  assetsRoot: path.resolve(process.cwd(), process.env.ASSETS_ROOT ?? "assets")
};

// Validate essentials that are needed to run (but allow auth to be "mock" if not set).
if (!env.databaseUrl) {
  // Health check will fail gracefully if DB URL is invalid/unset.
  // We avoid crashing on startup to keep the frontend gating logic useful.
}

if (!env.jwtSecret) {
  // JWT auth won't work without a secret, but keep the server up so /api/db-health-check still works.
}

if (!env.authAdminEmail) {
  // Same principle: keep server up; login will return 500 with clear message.
}

export function getRequiredEnv(name: keyof typeof env): string {
  const value = env[name];
  if (!value || !String(value).trim()) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Missing required configuration: ${String(name)}`);
  }
  return String(value);
}

