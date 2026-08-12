"""
Run the full pipeline on a single image from the command line.

Usage:
    python -m inference.predict --image path/to/image.png --out outputs/predictions/result.json
"""

import argparse
import json
import os

import cv2

from src.inference import get_pipeline
from src.config import PREDICTIONS_OUT
from src.utils import get_logger

logger = get_logger("predict")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True, help="Path to ultrasound image")
    parser.add_argument("--out", default=None, help="Path to save JSON result")
    parser.add_argument("--mc-passes", type=int, default=50)
    args = parser.parse_args()

    image = cv2.imread(args.image, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise FileNotFoundError(f"Could not read image: {args.image}")

    pipeline = get_pipeline()
    result = pipeline.predict(image, mc_passes=args.mc_passes)

    # base64 image blobs are large; keep them out of the console printout
    printable = {k: v for k, v in result.items() if k not in
                 ("segmentation", "gradcam", "original_image_base64")}
    printable["segmentation"] = {k: v for k, v in result["segmentation"].items()
                                  if not k.endswith("base64")}
    print(json.dumps(printable, indent=2))

    out_path = args.out or os.path.join(
        PREDICTIONS_OUT, os.path.splitext(os.path.basename(args.image))[0] + ".json"
    )
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(result, f)
    logger.info(f"Full result (with images) saved to {out_path}")


if __name__ == "__main__":
    main()
