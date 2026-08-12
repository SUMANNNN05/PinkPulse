import React from "react";

const CLASS_INFO = [
  {
    key: "benign",
    pill: "Benign",
    name: "Benign Lesion",
    range: "~53% of BUSI cases",
    code: "BEN",
  },
  {
    key: "malignant",
    pill: "Malignant",
    name: "Malignant Tumor",
    range: "~37% of BUSI cases",
    code: "MAL",
  },
  {
    key: "normal",
    pill: "Non-Tumor",
    name: "Normal Tissue",
    range: "~10% of BUSI cases",
    code: "NOR",
  },
];

export default function ClassTypeCards({ selected, onSelect }) {
  return (
    <div className="type-grid">
      {CLASS_INFO.map((c, i) => (
        <div
          key={c.key}
          className={`type-card ${selected === c.key ? "selected" : ""}`}
          onClick={() => onSelect(c.key)}
        >
          <div className="type-card-top">
            <span className="pill">{c.pill}</span>
            <span className={`check-circle ${selected === c.key ? "checked" : ""}`}>
              {selected === c.key ? "✓" : ""}
            </span>
          </div>
          <div className="type-card-name">{c.name}</div>
          <div className="type-card-range">{c.range}</div>
          <div className="type-card-footer">
            <span>{c.code} #{1000 + i * 137}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
