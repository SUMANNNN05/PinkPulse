import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import UploadZone from "./components/UploadZone.jsx";
import ClassTypeCards from "./components/ClassTypeCards.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import { checkHealth, runPrediction } from "./api.js";

export default function App() {
  const [apiOnline, setApiOnline] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedClass, setSelectedClass] = useState("benign");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    checkHealth()
      .then((data) => setApiOnline(data.status === "ok"))
      .catch(() => setApiOnline(false));
  }, []);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Upload an ultrasound image before running the pipeline.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await runPrediction(file);
      setResult(data);
    } catch (e) {
      setError(
        e.response?.data?.detail || "Prediction failed. Check that the API is running and models are trained."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Header apiOnline={apiOnline} />

      <div className="card">
        <div className="section-label">Upload Case</div>
        <UploadZone file={file} onFileSelected={setFile} />
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="section-label">Clinical Reference &middot; BUSI Classification Types</div>
        <ClassTypeCards selected={selectedClass} onSelect={setSelectedClass} />
      </div>

      <div className="action-bar">
        <div className="action-bar-left">
          <div className="label">Ready to run diagnostic pipeline?</div>
          <div className="value">
            {file ? file.name : "No image selected"}
          </div>
        </div>
        <button className="btn-primary" onClick={handleAnalyze} disabled={loading || !apiOnline}>
          {loading ? "Analyzing…" : "▶ Analyze & Compare"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, color: "var(--color-red)", fontSize: 14 }}>{error}</div>
      )}

      <ResultsPanel result={result} />
    </div>
  );
}
