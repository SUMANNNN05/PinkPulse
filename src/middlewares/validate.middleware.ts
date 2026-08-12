import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Usage in a route file:
 *   router.post("/register", validate(registerSchema), authController.register)
 *
 * The controller never has to check "is this field present / the right
 * type" — by the time it runs, req.body is already guaranteed valid.
 */
export const validate =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return next(ApiError.badRequest(message));
      }
      next(err);
    }
  };
