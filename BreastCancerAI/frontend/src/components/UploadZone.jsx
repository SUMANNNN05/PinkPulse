import React, { useRef, useState } from "react";

export default function UploadZone({ file, onFileSelected }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    if (files && files[0]) onFileSelected(files[0]);
  };

  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {file ? (
        <div>
          <strong style={{ color: "var(--color-text)" }}>{file.name}</strong>
          <div style={{ fontSize: 13, marginTop: 4 }}>Click or drop to replace</div>
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: 6 }}>
            Upload an ultrasound image
          </div>
          <div style={{ fontSize: 13 }}>PNG or JPG &middot; drag & drop or click to browse</div>
        </div>
      )}
    </div>
  );
}
