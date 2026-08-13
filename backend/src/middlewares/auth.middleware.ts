import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.util";
import { ApiError } from "../utils/ApiError";

/**
 * Protects a route: no valid access token = no entry. Attaches the decoded
 * payload to req.user so every downstream controller/service can trust
 * "req.user.id" without re-verifying anything.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing or malformed Authorization header"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired access token"));
  }
}
