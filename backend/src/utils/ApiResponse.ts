import { Response } from "express";

/**
 * Every successful response in the API — from every controller — goes
 * through this so the frontend always parses the same shape:
 *   { success: true, data: ..., message: "..." }
 * Pair with errorHandler.middleware.ts, which does the same for failures.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}
