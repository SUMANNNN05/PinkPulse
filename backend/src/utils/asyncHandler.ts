import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Express does NOT automatically catch errors thrown inside an async
 * function — an unhandled rejection there can crash the whole server.
 * Wrapping every async controller in this forwards any thrown error to
 * next(), which routes it into errorHandler.middleware.ts. This means we
 * never write try/catch by hand in a controller.
 */
export const asyncHandler =
  (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
