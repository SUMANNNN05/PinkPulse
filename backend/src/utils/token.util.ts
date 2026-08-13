import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface AccessTokenPayload {
  id: string;
  email: string;
  role: "CLINICIAN" | "ADMIN";
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

// The refresh token itself is a JWT too (just a signed random-ish string,
// really), but what we store in the database is a SHA-256 hash of it —
// never the raw token. That way, if the database were ever leaked, the
// stolen hashes are useless for logging in as anyone.
export function signRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { id: string };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Converts "7d" / "15m" style strings into a real expiry Date, so we can
// store RefreshToken.expiresAt in the database.
export function getExpiryDate(durationStr: string): Date {
  const match = durationStr.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration format: ${durationStr}`);

  const value = Number(match[1]);
  const unit = match[2];
  const msPerUnit: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * msPerUnit[unit]);
}
