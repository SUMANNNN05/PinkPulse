import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * Usage: router.delete("/admin/users/:id", requireAuth, requireRole("ADMIN"), ...)
 * Always runs AFTER requireAuth — it reads req.user.
 */
export function requireRole(...allowedRoles: Array<"CLINICIAN" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to do this"));
    }
    next();
  };
}
