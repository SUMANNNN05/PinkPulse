"""
Compare predictions for two images side by side (used by the frontend's
"Compare Case" button, and useful for manual QA between model versions
or between two patient cases).

Usage:
    python -m inference.compare_predictions --image-a caseA.png --image-b caseB.png --out compare.json
"""

import argparse
import json

import cv2

from src.inference import get_pipeline
from src.utils import get_logger

logger = get_logger("compare_predictions")


def compare(image_path_a: str, image_path_b: str, mc_passes: int = 50) -> dict:
    pipeline = get_pipeline()

    img_a = cv2.imread(image_path_a, cv2.IMREAD_GRAYSCALE)
    img_b = cv2.imread(image_path_b, cv2.IMREAD_GRAYSCALE)
    if img_a is None or img_b is None:
        raise FileNotFoundError("One or both images could not be read")

    result_a = pipeline.predict(img_a, mc_passes=mc_passes)
    result_b = pipeline.predict(img_b, mc_passes=mc_passes)

    agreement = result_a["prediction"] == result_b["prediction"]
    confidence_delta = round(abs(result_a["confidence"] - result_b["confidence"]), 4)

    return {
        "case_a": {"image_path": image_path_a, **result_a},
        "case_b": {"image_path": image_path_b, **result_b},
        "agreement": agreement,
        "confidence_delta": confidence_delta,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image-a", required=True)
    parser.add_argument("--image-b", required=True)
    parser.add_argument("--out", default="outputs/predictions/compare.json")
    parser.add_argument("--mc-passes", type=int, default=50)
    args = parser.parse_args()

    result = compare(args.image_a, args.image_b, mc_passes=args.mc_passes)

    with open(args.out, "w") as f:
        json.dump(result, f)

    logger.info(
        f"Case A: {result['case_a']['prediction']} ({result['case_a']['confidence']*100:.1f}%) | "
        f"Case B: {result['case_b']['prediction']} ({result['case_b']['confidence']*100:.1f}%) | "
        f"Agreement: {result['agreement']}"
    )


if __name__ == "__main__":
    main()
