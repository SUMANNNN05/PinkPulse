import React from "react";

function toDataUrl(base64) {
  return `data:image/png;base64,${base64}`;
}

export default function ResultsPanel({ result }) {
  if (!result) return null;

  const { prediction, confidence, class_probabilities, uncertainty, segmentation, gradcam, original_image_base64 } = result;

  return (
    <div style={{ marginTop: 28 }}>
      <div className={`prediction-banner ${prediction}`}>
        <div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 4 }}>
            Predicted classification
          </div>
          <div style={{ fontSize: 24, fontFamily: "var(--font-display)", fontWeight: 700, textTransform: "capitalize" }}>
            {prediction}
          </div>
        </div>
        <div style={{ textAlign: "right", minWidth: 180 }}>
          <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Confidence</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{(confidence * 100).toFixed(1)}%</div>
          <div className="confidence-bar-track">
            <div className="confidence-bar-fill" style={{ width: `${confidence * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="metric-row">
        {Object.entries(class_probabilities).map(([cls, prob]) => (
          <div className="metric-tile" key={cls}>
            <div className="label" style={{ textTransform: "capitalize" }}>{cls}</div>
            <div className="value">{(prob * 100).toFixed(1)}%</div>
          </div>
        ))}
        <div className="metric-tile">
          <div className="label">Uncertainty</div>
          <div className="value" style={{ fontSize: 15 }}>
            <span className={`uncertainty-tag ${uncertainty.label}`}>{uncertainty.label}</span>
          </div>
        </div>
        <div className="metric-tile">
          <div className="label">Tumor area</div>
          <div className="value">{segmentation.tumor_area_pct}%</div>
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 26 }}>Visual Explainability</div>
      <div className="results-grid">
        <div className="result-image-card">
          <img src={toDataUrl(original_image_base64)} alt="Original ultrasound" />
          <div className="result-image-label">Original Image</div>
        </div>
        <div className="result-image-card">
          <img src={toDataUrl(segmentation.overlay_base64)} alt="Segmentation overlay" />
          <div className="result-image-label">U-Net Segmentation ({segmentation.tumor_area_pct}% tumor area)</div>
        </div>
        <div className="result-image-card">
          <img src={toDataUrl(gradcam.overlay_base64)} alt="Grad-CAM heatmap" />
          <div className="result-image-label">Grad-CAM Heatmap</div>
        </div>
      </div>

      <div className="metric-row" style={{ marginTop: 18 }}>
        <div className="metric-tile">
          <div className="label">Predictive entropy</div>
          <div className="value">{uncertainty.predictive_entropy}</div>
        </div>
        <div className="metric-tile">
          <div className="label">Mutual information</div>
          <div className="value">{uncertainty.mutual_information}</div>
        </div>
        <div className="metric-tile">
          <div className="label">MC Dropout passes</div>
          <div className="value">{uncertainty.n_passes}</div>
        </div>
      </div>
    </div>
  );
}
