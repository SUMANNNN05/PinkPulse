'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [modelArch, setModelArch] = useState<'resnet' | 'transformer' | 'ensemble'>('resnet');

  const confidences = [
    { label: 'Malignant (BI-RADS 5)', score: 92.4, color: 'bg-primary' },
    { label: 'Suspicious (BI-RADS 4)', score: 5.1, color: 'bg-secondary-container text-on-secondary-container' },
    { label: 'Benign (BI-RADS 2/3)', score: 2.5, color: 'bg-tertiary-fixed-dim text-tertiary' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <Header title="Model Explainability & Analytics" subtitle="Technical transparency, feature attribution, and neural network saliency" />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8 pb-16">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/60 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full">
                  XAI Module v2.4
                </span>
                <span className="text-xs text-on-surface-variant font-medium">Grad-CAM + Layer-wise Relevance Propagation</span>
              </div>
              <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Model Explainability & Saliency</h2>
              <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                Transparency in artificial intelligence is paramount for clinical trust. This dashboard details how the PinkPulse deep learning architecture isolates malignant features, assigns diagnostic confidence, and correlates findings with established histological patterns.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/50 text-xs">
              <button
                onClick={() => setModelArch('resnet')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  modelArch === 'resnet' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                ResNet50 + U-Net
              </button>
              <button
                onClick={() => setModelArch('transformer')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  modelArch === 'transformer' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Vision Transformer (ViT)
              </button>
              <button
                onClick={() => setModelArch('ensemble')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  modelArch === 'ensemble' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Oncology Ensemble
              </button>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Card 1: Feature Attribution (Full Width 12 cols) */}
            <section className="lg:col-span-12 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/60 shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                <div className="lg:w-1/3">
                  <div className="flex items-center gap-3 mb-3 text-primary">
                    <span className="material-symbols-outlined bg-secondary-container p-2 rounded-xl text-xl font-bold">
                      center_focus_strong
                    </span>
                    <h3 className="font-headline font-bold text-xl text-on-surface">Feature Attribution</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                    Gradient-weighted Class Activation Mapping (Grad-CAM) highlights the specific pixel regions within the sonogram or mammogram that most significantly influenced the model&apos;s diagnostic prediction. Warm colors indicate high activation gradients corresponding to structural anomalies.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-secondary-container text-on-secondary-container font-semibold text-xs px-3 py-1 rounded-full border border-secondary/20">
                      Spiculated Margins (+0.84)
                    </span>
                    <span className="bg-primary-fixed text-primary font-semibold text-xs px-3 py-1 rounded-full border border-primary/20">
                      Microcalcifications (+0.91)
                    </span>
                    <span className="bg-surface-container text-on-surface-variant font-semibold text-xs px-3 py-1 rounded-full">
                      Density Distortion (+0.76)
                    </span>
                  </div>
                </div>

                <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Original B-Mode */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Original Ultrasound B-Mode
                    </span>
                    <div className="rounded-xl overflow-hidden border border-outline-variant/60 bg-black aspect-[4/3] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
                        alt="Original Ultrasound B-Mode"
                        className="w-full h-full object-cover grayscale opacity-90"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-mono">
                        Probe: 12 MHz Linear
                      </div>
                    </div>
                  </div>

                  {/* Activation Heatmap */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Activation Heatmap Overlay
                    </span>
                    <div className="rounded-xl overflow-hidden border border-outline-variant/60 bg-black aspect-[4/3] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"
                        alt="Activation Heatmap Overlay"
                        className="w-full h-full object-cover mix-blend-color-dodge opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-red-500/50 to-amber-400/60 mix-blend-overlay pointer-events-none"></div>
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-pink-300 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
                        Max Activation Region
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Card 2: Confidence Metrics (5 cols) */}
            <section className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <span className="material-symbols-outlined bg-secondary-container p-2 rounded-xl text-xl font-bold">
                    monitoring
                  </span>
                  <h3 className="font-headline font-bold text-lg text-on-surface">Confidence Distribution</h3>
                </div>
                <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                  Distribution of model certainty across diagnostic categories. High confidence scores (&gt;85%) in a single category suggest unambiguous morphological features.
                </p>

                <div className="space-y-5">
                  {confidences.map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-on-surface">{c.label}</span>
                        <span className="text-primary font-bold">{c.score}%</span>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden p-0.5 border border-outline-variant/30">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${c.color}`}
                          style={{ width: `${c.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/50 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Entropy Score: <strong className="text-on-surface">0.14 nats</strong></span>
                <span>Uncertainty: <strong className="text-emerald-700">Low (0.02)</strong></span>
              </div>
            </section>

            {/* Card 3: Diagnostic Logic Mapping (7 cols) */}
            <section className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <span className="material-symbols-outlined bg-secondary-container p-2 rounded-xl text-xl font-bold">
                    account_tree
                  </span>
                  <h3 className="font-headline font-bold text-lg text-on-surface">Diagnostic Logic Mapping</h3>
                </div>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                  The neural network correlates macroscopic acoustic shadowing with microscopic histological patterns, such as desmoplastic reaction or architectural distortion.
                </p>

                <div className="relative rounded-xl overflow-hidden border border-outline-variant/60 bg-tertiary min-h-[220px] flex items-center justify-center p-6 text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80"
                    alt="Histological Pattern Correlation"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
                  />
                  <div className="relative z-10 w-full grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                      <span className="text-[10px] font-bold text-pink-300 uppercase">Input Feature</span>
                      <p className="text-xs font-bold text-white mt-1">Acoustic Shadowing</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                      <span className="text-[10px] font-bold text-pink-300 uppercase">Neural Path</span>
                      <p className="text-xs font-bold text-white mt-1">Desmoplasia Match</p>
                    </div>
                    <div className="bg-primary/90 p-3 rounded-xl border border-pink-300/40 shadow-lg">
                      <span className="text-[10px] font-bold text-pink-200 uppercase">Classification</span>
                      <p className="text-xs font-bold text-white mt-1">BI-RADS 5 Malignant</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant">
                <span className="flex items-center gap-1.5 text-primary font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Pattern Match: Desmoplastic Reaction Confirmed
                </span>
                <span className="text-[11px] font-mono">p-value &lt; 0.001</span>
              </div>
            </section>

            {/* Performance Benchmark Matrix (Full Width) */}
            <section className="lg:col-span-12 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/60 shadow-sm">
              <h3 className="font-headline font-bold text-base text-on-surface mb-4">Model Validation & ROC Benchmark Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase">AUC-ROC</p>
                  <p className="text-2xl font-bold text-primary font-headline mt-1">0.991</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">99.1% Discrimination</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase">Sensitivity (Recall)</p>
                  <p className="text-2xl font-bold text-primary font-headline mt-1">98.2%</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Minimizes False Negatives</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase">Specificity</p>
                  <p className="text-2xl font-bold text-primary font-headline mt-1">96.4%</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">High True Negative Rate</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase">F1-Score</p>
                  <p className="text-2xl font-bold text-primary font-headline mt-1">0.973</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Balanced Precision</p>
                </div>
              </div>
            </section>

          </div>

          {/* Footer Navigation */}
          <footer className="pt-6 border-t border-outline-variant/60 flex justify-between items-center">
            <Link
              href="/dashboard"
              className="bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold py-3 px-6 rounded-xl border border-outline-variant transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Return to Dashboard
            </Link>

            <Link
              href="/about"
              className="bg-primary text-white text-xs font-semibold py-3 px-6 rounded-xl hover:bg-primary-container transition-colors shadow-md shadow-primary/20 flex items-center gap-2"
            >
              Learn About PinkPulse Technology & Datasets
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </footer>

        </div>
      </main>
    </div>
  );
}
