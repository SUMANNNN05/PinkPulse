import React from "react";

export default function Header({ apiOnline }) {
  return (
    <div className="header">
      <div className="brand">
        <div className="brand-mark">B</div>
        <div>
          <div className="brand-title">BreastCancerAI</div>
          <div className="brand-subtitle">Clinical Decision Support &middot; BUSI Ultrasound Pipeline</div>
        </div>
      </div>
      <div className="status-chip">
        <span
          className="status-dot"
          style={{ background: apiOnline ? "#2f7d5c" : "#b23b3b" }}
        />
        {apiOnline ? "Models online" : "API unreachable"}
      </div>
    </div>
  );
}
