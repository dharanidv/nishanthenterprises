import type { Request, Response } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { getAdminDisplayProfile, verifyAdminCredentials } from "../services/auth.service";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpError } from "../utils/httpError";

export async function login(req: Request, res: Response) {
  const body = req.body as { email?: unknown; password?: unknown } | undefined;
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email.trim() || !password) {
    throw new HttpError(400, "Email and password are required");
  }

  const result = await verifyAdminCredentials({ email, password });
  if (!result.ok || !result.email) {
    throw new HttpError(401, "Invalid credentials");
  }

  if (!env.jwtSecret) {
    throw new HttpError(500, "JWT secret not configured");
  }

  const jwtOptions: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
  };

  const token = jwt.sign({ email: result.email }, env.jwtSecret as Secret, jwtOptions);

  const profile = getAdminDisplayProfile(result.email);

  return res.status(200).json({
    token,
    tokenType: "Bearer",
    user: {
      email: result.email,
      username: profile?.username ?? result.email.split("@")[0] ?? "user"
    }
  });
}

/** Current user profile (JWT). Password is never exposed; only a masked placeholder. */
export function me(req: AuthenticatedRequest, res: Response) {
  const email = req.user?.email;
  if (!email) {
    throw new HttpError(401, "Unauthorized");
  }

  const profile = getAdminDisplayProfile(email);
  if (!profile) {
    throw new HttpError(404, "Profile not found");
  }

  return res.status(200).json({
    email: profile.email,
    username: profile.username,
    passwordMasked: "••••••••",
    passwordNote: "Password cannot be shown for security. It is stored securely and cannot be viewed here."
  });
}

