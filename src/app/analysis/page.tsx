'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<'visual' | 'descriptors' | 'notes'>('visual');
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleDownload = () => {
    setReportDownloaded(true);
    setTimeout(() => {
      alert("PinkPulse AI Diagnostic DICOM PDF Report (#8472-A) downloaded successfully!");
      setReportDownloaded(false);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <Header title="Analysis Results" subtitle="Scan ID: #8472-A | Patient: Doe, Jane (52 Yrs)" />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8 pb-16">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full">
                  Scan ID: #8472-A
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">DICOM Series: 1.2.840.113619</span>
              </div>
              <h2 className="font-headline font-bold text-2xl text-on-surface">Comprehensive Diagnostic Findings</h2>
              <p className="text-xs text-on-surface-variant">Processed by PinkPulse AI Engine v2.4 (Model Checkpoint #9810)</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={reportDownloaded}
                className="bg-surface-container-high hover:bg-surface-variant text-primary font-semibold text-xs py-2.5 px-5 rounded-xl border border-outline-variant transition-colors flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">
                  {reportDownloaded ? 'hourglass_empty' : 'download'}
                </span>
                {reportDownloaded ? 'Generating PDF...' : 'Download Clinical Report'}
              </button>
              <Link
                href="/analytics"
                className="bg-primary text-white font-semibold text-xs py-2.5 px-5 rounded-xl hover:bg-primary-container transition-colors shadow-md shadow-primary/20 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">psychology</span>
                Explainability Analytics
              </Link>
            </div>
          </div>

          {/* Primary Finding Alert & Confidence Gauge */}
          <section className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/60 shadow-sm flex flex-col lg:flex-row items-center gap-8 justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-700 shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-4xl">warning</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded-full">
                    BI-RADS Category 5
                  </span>
                  <span className="text-xs font-medium text-on-surface-variant">Highly Suggestive of Malignancy</span>
                </div>
                <h3 className="font-headline font-bold text-2xl text-red-700">Primary Finding: Malignant</h3>
                <p className="text-xs text-on-surface-variant mt-1 max-w-lg">
                  High-density spiculated lesion with microcalcification clusters identified in the Upper Outer Quadrant (UOQ) of the left breast.
                </p>
              </div>
            </div>

            {/* Model Confidence Meter */}
            <div className="w-full lg:w-96 bg-surface-container-low p-5 rounded-xl border border-outline-variant/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-on-surface-variant">AI Malignancy Confidence</span>
                <span className="font-headline font-bold text-xl text-primary">94.2%</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden p-0.5 border border-outline-variant/40">
                <div
                  className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-1000"
                  style={{ width: '94.2%' }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-on-surface-variant font-medium mt-2">
                <span>Benign (&lt;20%)</span>
                <span>Suspicious (50%)</span>
                <span className="text-primary font-bold">Malignant (&gt;85%)</span>
              </div>
            </div>
          </section>

          {/* Visual Mode Selector */}
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'visual'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                Side-by-Side Imaging Grid
              </button>
              <button
                onClick={() => setActiveTab('descriptors')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'descriptors'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                BI-RADS Descriptors & Lesion Metrics
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                Radiologist Case Notes
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
              <span>Zoom View:</span>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center"
              >
                -
              </button>
              <span className="w-10 text-center font-mono">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2, z + 0.2))}
                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Tab Content: Visual Side-by-Side Grid */}
          {activeTab === 'visual' && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Original Mammogram */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">image</span>
                    Original DICOM Scan
                  </h4>
                  <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">B-Mode</span>
                </div>
                <div className="flex-1 bg-black rounded-xl overflow-hidden relative group min-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
                    alt="Original Mammogram Scan"
                    className="w-full h-full object-cover grayscale transition-transform duration-300"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-white font-mono">
                    Window: L:40 W:400 | 2560x2048
                  </div>
                </div>
              </div>

              {/* 2. Segmented Tumor Area */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">center_focus_strong</span>
                    Segmented Lesion Boundary
                  </h4>
                  <span className="text-[10px] bg-primary-fixed text-primary font-bold px-2 py-0.5 rounded">
                    U-Net Segmentation
                  </span>
                </div>
                <div className="flex-1 bg-black rounded-xl overflow-hidden relative group min-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80"
                    alt="Segmented Lesion Boundary"
                    className="w-full h-full object-cover grayscale contrast-125 opacity-80"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  {/* Glowing Pink Boundary Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-24 border-2 border-primary-fixed-dim rounded-full transform -rotate-12 shadow-[0_0_25px_rgba(255,176,204,0.8)] flex items-center justify-center">
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        14.8 mm
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-pink-300 font-mono">
                    ROI Area: 1.64 cm² | Spiculated
                  </div>
                </div>
              </div>

              {/* 3. Grad-CAM Heatmap */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">blur_on</span>
                    Grad-CAM Activation Map
                  </h4>
                  <span className="text-[10px] bg-secondary-container text-on-secondary-container font-bold px-2 py-0.5 rounded">
                    Layer 4 Conv
                  </span>
                </div>
                <div className="flex-1 bg-black rounded-xl overflow-hidden relative group min-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                    alt="Grad-CAM Activation Map"
                    className="w-full h-full object-cover mix-blend-screen opacity-90"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/30 to-pink-500/50 pointer-events-none"></div>
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-white font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    Peak Gradient Activation: 0.984
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'descriptors' && (
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/60 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-4">ACR BI-RADS Morphological Characteristics</h3>
                <ul className="space-y-3 text-xs">
                  <li className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
                    <span className="font-semibold text-on-surface">Mass Shape:</span>
                    <span className="font-bold text-primary">Irregular (High Predictive Value)</span>
                  </li>
                  <li className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
                    <span className="font-semibold text-on-surface">Margin Type:</span>
                    <span className="font-bold text-primary">Spiculated / Ill-defined</span>
                  </li>
                  <li className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
                    <span className="font-semibold text-on-surface">Microcalcifications:</span>
                    <span className="font-bold text-primary">Pleomorphic / Fine Linear</span>
                  </li>
                  <li className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
                    <span className="font-semibold text-on-surface">Architectural Distortion:</span>
                    <span className="font-bold text-emerald-700">Present (UOQ)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Recommended Clinical Protocol</h3>
                <div className="p-4 bg-primary-fixed/20 border border-primary-fixed rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <span className="material-symbols-outlined text-lg">medical_services</span>
                    Urgent Diagnostic Biopsy Indicated
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Given the BI-RADS 5 rating (94.2% AI confidence), ultrasound-guided core needle biopsy (CNB) of the left upper outer quadrant lesion is recommended.
                  </p>
                  <div className="pt-2 border-t border-primary-fixed-dim/40 flex items-center justify-between">
                    <span className="font-semibold text-on-surface">Recommended Target:</span>
                    <span className="font-mono text-primary font-bold">14.8 mm Lesion @ 10 o&apos;clock</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/60 shadow-sm space-y-4">
              <h3 className="font-headline font-bold text-lg text-on-surface">Attending Radiologist Impressions</h3>
              <textarea
                defaultValue="Case reviewed by Dr. Sarah Jenkins. Concur with AI segmentation of spiculated lesion in the UOQ. Microcalcification cluster verified on spot compression view. Core needle biopsy scheduled."
                className="w-full h-32 p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
              ></textarea>
              <div className="flex justify-end">
                <button
                  onClick={() => alert("Radiologist signature appended to DICOM Case #8472-A")}
                  className="bg-primary text-white text-xs font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-container transition-colors shadow"
                >
                  Sign & Confirm Case Record
                </button>
              </div>
            </div>
          )}

          {/* Footer Routing Navigation */}
          <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-outline-variant/60">
            <Link
              href="/dashboard"
              className="bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold py-3 px-6 rounded-xl border border-outline-variant transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              Return to Dashboard
            </Link>

            <Link
              href="/analytics"
              className="text-primary hover:text-primary-container font-semibold text-xs flex items-center gap-2 underline underline-offset-4"
            >
              <span className="material-symbols-outlined text-sm">psychology</span>
              How did the neural network compute this diagnostic score?
            </Link>
          </footer>

        </div>
      </main>
    </div>
  );
}
