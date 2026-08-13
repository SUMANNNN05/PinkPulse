import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/**
 * Registered LAST in app.ts, after every route. Express recognizes this as
 * an error handler because it takes 4 arguments (err, req, res, next) —
 * that signature is what triggers Express's error-handling pipeline.
 *
 * Anything thrown as ApiError -> we trust its statusCode/message.
 * Anything else (a genuine bug, a library throwing) -> log it fully but
 * return a generic 500 to the client, never leaking a stack trace or an
 * internal error message in production.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error({ err, path: req.path }, "Unexpected internal error");
    }
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Something we didn't throw on purpose — a real bug or a third-party
  // library error. Always log the full thing server-side.
  logger.error({ err, path: req.path }, "Unhandled error");

  return res.status(500).json({
    success: false,
    message: env.isProduction ? "Something went wrong" : String(err),
  });
}
