/**
 * Every intentional error in the app (bad input, not found, unauthorized...)
 * should be thrown as an ApiError, not a generic Error. That's how the
 * central error handler knows what HTTP status code to send back, instead
 * of defaulting everything to a scary 500.
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean; // true = expected error (bad input), false = a real bug

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }
  static conflict(message: string) {
    return new ApiError(409, message);
  }
  static internal(message = "Something went wrong") {
    return new ApiError(500, message, false);
  }
}
