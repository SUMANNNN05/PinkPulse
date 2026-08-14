import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
  }
  cb(null, true);
}

const uploadSingle = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
}).single("image");

export function uploadScanImage(req: Request, res: Response, next: NextFunction) {
  uploadSingle(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(ApiError.badRequest("Image must be smaller than 10MB"));
    }
    if (err instanceof Error) {
      return next(ApiError.badRequest(err.message));
    }
    if (!req.file) {
      return next(
        ApiError.badRequest("No image file provided (field name must be 'image')")
      );
    }
    next();
  });
}
