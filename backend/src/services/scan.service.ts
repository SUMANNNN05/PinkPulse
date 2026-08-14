import { prisma } from "../config/db";
import { cloudinary } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { predict } from "./mlClient.service";

const CLASSIFICATION_MAP: Record<string, "BENIGN" | "MALIGNANT" | "NORMAL"> = {
  benign: "BENIGN",
  malignant: "MALIGNANT",
  normal: "NORMAL",
};

function uploadBufferToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function uploadBase64ToCloudinary(base64: string, folder: string): Promise<string> {
  const dataUri = base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
}

export async function createScan(userId: string, file: Express.Multer.File) {
  const imageUrl = await uploadBufferToCloudinary(
    file.buffer,
    "pinkpulse/scans/original"
  );

  let scan = await prisma.scan.create({
    data: { userId, imageUrl, status: "PROCESSING" },
  });

  try {
    const result = await predict(file.buffer, file.originalname, file.mimetype);

    const [maskUrl, heatmapUrl] = await Promise.all([
      uploadBase64ToCloudinary(result.maskBase64, "pinkpulse/scans/masks"),
      uploadBase64ToCloudinary(result.heatmapBase64, "pinkpulse/scans/heatmaps"),
    ]);

    scan = await prisma.scan.update({
      where: { id: scan.id },
      data: {
        maskUrl,
        heatmapUrl,
        classification: CLASSIFICATION_MAP[result.classification],
        confidence: result.confidence,
        uncertainty: result.uncertainty,
        status: "COMPLETED",
      },
    });
  } catch (err) {
    logger.error({ err, scanId: scan.id }, "Scan processing failed");
    scan = await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      },
    });
  }

  return scan;
}

export async function listScans(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [scans, total] = await Promise.all([
    prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.scan.count({ where: { userId } }),
  ]);
  return { scans, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findOwnedScan(userId: string, scanId: string) {
  const scan = await prisma.scan.findUnique({ where: { id: scanId } });
  if (!scan) throw ApiError.notFound("Scan not found");
  if (scan.userId !== userId)
    throw ApiError.forbidden("You do not have access to this scan");
  return scan;
}

export async function getScanById(userId: string, scanId: string) {
  return findOwnedScan(userId, scanId);
}

export async function deleteScan(userId: string, scanId: string) {
  await findOwnedScan(userId, scanId);
  await prisma.scan.delete({ where: { id: scanId } });
}
