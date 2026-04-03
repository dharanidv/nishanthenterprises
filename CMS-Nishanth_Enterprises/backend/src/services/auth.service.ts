import bcrypt from "bcryptjs";
import { env } from "../config/env";

export async function verifyAdminCredentials(params: {
  email: string;
  password: string;
}): Promise<{ ok: boolean; email?: string }> {
  const email = params.email.trim().toLowerCase();
  const password = params.password;

  if (!env.authAdminEmail || (!env.authAdminPasswordHash && !env.authAdminPasswordPlain)) {
    return { ok: false };
  }

  if (email !== env.authAdminEmail.trim().toLowerCase()) {
    return { ok: false };
  }

  if (env.authAdminPasswordHash) {
    const ok = await bcrypt.compare(password, env.authAdminPasswordHash);
    return { ok, email: env.authAdminEmail };
  }

  // NOTE: This fallback allows mock auth for local development. Prefer AUTH_ADMIN_PASSWORD_HASH in production.
  const ok = password === env.authAdminPasswordPlain;
  return { ok, email: env.authAdminEmail };
}

/** Profile for the env-based admin (read-only; password is never returned). */
export function getAdminDisplayProfile(forEmail: string): { email: string; username: string } | null {
  if (!env.authAdminEmail) return null;
  const adminEmail = env.authAdminEmail.trim();
  if (forEmail.trim().toLowerCase() !== adminEmail.toLowerCase()) return null;

  const fromEnv = env.authAdminUsername?.trim();
  const localPart = adminEmail.includes("@") ? adminEmail.split("@")[0] : adminEmail;
  const username = fromEnv || localPart || "admin";

  return { email: adminEmail, username };
}

