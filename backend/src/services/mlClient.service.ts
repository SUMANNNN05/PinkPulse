import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export interface MlPredictionResult {
  classification: "benign" | "malignant" | "normal";
  confidence: number;
  uncertainty: number;
  maskBase64: string;
  heatmapBase64: string;
}

const VALID_CLASSIFICATIONS = ["benign", "malignant", "normal"];

export async function predict(
  imageBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<MlPredictionResult> {
  const formData = new FormData();
  formData.append(
    "image",
    new Blob([Uint8Array.from(imageBuffer)], { type: mimeType }),
    filename
  );

  let response: Response;
  try {
    response = await fetch(`${env.mlServiceUrl}/predict`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    logger.error({ err }, "ML service unreachable");
    throw ApiError.internal(
      "The AI inference service is unavailable. Please try again shortly."
    );
  }

  if (!response.ok) {
    logger.error({ status: response.status }, "ML service returned an error status");
    throw ApiError.internal("The AI service failed to process this image.");
  }

  const data = (await response.json()) as Record<string, unknown>;

  if (
    typeof data.classification !== "string" ||
    !VALID_CLASSIFICATIONS.includes(data.classification) ||
    typeof data.confidence !== "number" ||
    typeof data.uncertainty !== "number" ||
    typeof data.mask !== "string" ||
    typeof data.heatmap !== "string"
  ) {
    logger.error({ data }, "ML service returned an unexpected response shape");
    throw ApiError.internal("The AI service returned an unexpected response.");
  }

  return {
    classification: data.classification as "benign" | "malignant" | "normal",
    confidence: data.confidence,
    uncertainty: data.uncertainty,
    maskBase64: data.mask,
    heatmapBase64: data.heatmap,
  };
}
