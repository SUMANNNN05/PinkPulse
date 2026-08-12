"""
Run the full pipeline over every image in a folder and write one
summary CSV plus per-image JSON results.

Usage:
    python -m inference.batch_predict --input-dir data/raw/Dataset_BUSI_with_GT/benign --out-dir outputs/predictions
"""

import argparse
import glob
import json
import os

import cv2
import pandas as pd

from src.inference import get_pipeline
from src.utils import get_logger

logger = get_logger("batch_predict")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--out-dir", default="outputs/predictions")
    parser.add_argument("--mc-passes", type=int, default=50)
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    image_paths = sorted(
        p for p in glob.glob(os.path.join(args.input_dir, "*.png"))
        if "_mask" not in os.path.basename(p)
    )

    pipeline = get_pipeline()
    rows = []

    for i, path in enumerate(image_paths, start=1):
        image = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            logger.warning(f"Skipping unreadable image: {path}")
            continue

        result = pipeline.predict(image, mc_passes=args.mc_passes)

        json_path = os.path.join(args.out_dir, os.path.splitext(os.path.basename(path))[0] + ".json")
        with open(json_path, "w") as f:
            json.dump(result, f)

        rows.append({
            "image_path": path,
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "uncertainty_label": result["uncertainty"]["label"],
            "predictive_entropy": result["uncertainty"]["predictive_entropy"],
            "tumor_area_pct": result["segmentation"]["tumor_area_pct"],
        })

        logger.info(f"[{i}/{len(image_paths)}] {os.path.basename(path)} -> {result['prediction']} "
                    f"({result['confidence']*100:.1f}%)")

    summary_df = pd.DataFrame(rows)
    summary_path = os.path.join(args.out_dir, "batch_summary.csv")
    summary_df.to_csv(summary_path, index=False)
    logger.info(f"Batch complete. Summary saved to {summary_path}")


if __name__ == "__main__":
    main()
