'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AboutPage() {
  const pipelineSteps = [
    { step: 1, title: 'Upload & Standardization', icon: 'upload_file', desc: 'DICOM ingestion, header stripping & resolution normalization' },
    { step: 2, title: 'ROI Segmentation', icon: 'crop', desc: 'Deep U-Net isolating lesion boundaries' },
    { step: 3, title: 'Classification Engine', icon: 'category', desc: 'Multi-scale convolutional feature extraction' },
    { step: 4, title: 'Explainability Synthesis', icon: 'highlight', desc: 'Grad-CAM heatmaps & BI-RADS rationales' },
    { step: 5, title: 'Clinical Report Generation', icon: 'fact_check', desc: 'Automated DICOM Structured Report output' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <Header title="About PinkPulse AI" subtitle="Clinical transparency, model architecture, and ethical AI standards" />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8 pb-16">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/60 pb-6">
            <div>
              <span className="text-xs font-bold text-primary bg-primary-fixed px-3 py-1 rounded-full">
                Oncology AI Platform
              </span>
              <h2 className="font-headline font-bold text-3xl text-primary mt-2 tracking-tight">About PinkPulse AI</h2>
              <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                Clinical transparency and technical excellence in AI-assisted breast cancer diagnostics.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs py-2.5 px-5 rounded-xl border border-outline-variant transition-colors"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              Return to Home
            </Link>
          </div>

          {/* Bento Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Dataset Used Card (5 cols) */}
            <div className="md:col-span-5 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-xl">database</span>
                  </div>
                  <h3 className="font-headline font-bold text-xl text-on-surface">Dataset Used</h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                  Our models are trained on an extensively curated, diverse clinical dataset comprising over 1.2 million anonymized diagnostic images and corresponding pathology reports. We prioritize geographic, demographic, and technological diversity in our data collection to ensure robust generalization across different clinical settings.
                </p>
                <ul className="space-y-3 text-xs text-on-surface">
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                    <span>Multi-center sourcing (50+ global clinical institutions)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                    <span>Rigorous expert annotation (triple-reviewed by board radiologists)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                    <span>HIPAA and GDPR compliant 100% de-identification</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/50 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Dataset Version:</span>
                <span className="font-mono font-bold text-primary">v2026.4-CLINICAL</span>
              </div>
            </div>

            {/* Why Explainability Matters Card (7 cols) */}
            <div className="md:col-span-7 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/60 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-fixed/20 rounded-full blur-2xl pointer-events-none"></div>

              <div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </div>
                  <h3 className="font-headline font-bold text-xl text-on-surface">Why Explainability Matters</h3>
                </div>
                <div className="text-xs text-on-surface-variant space-y-3 leading-relaxed relative z-10">
                  <p>
                    In clinical diagnostics, a &quot;black box&quot; AI is insufficient. Healthcare professionals must understand <em>why</em> an algorithm reached a specific conclusion to trust its recommendation and integrate it safely into patient care.
                  </p>
                  <p>
                    PinkPulse AI is built on the principle of intrinsic interpretability. We utilize advanced saliency mapping, feature attribution, and logical rule extraction to provide clinicians with visual and textual evidence for every diagnostic suggestion.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 relative z-10">
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40">
                    <h4 className="text-xs font-bold text-primary mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">handshake</span>
                      Fosters Clinical Trust
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">Builds confidence between physician and AI diagnostic assistant.</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40">
                    <h4 className="text-xs font-bold text-primary mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">lightbulb</span>
                      Aids Early Discovery
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">Highlights subtle micro-patterns that inform early intervention.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/50 text-xs text-on-surface-variant flex items-center justify-between">
                <span>Compliance Standard:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  IEEE XAI Standards Certified
                </span>
              </div>
            </div>

            {/* Model Pipeline Card (Full Width) */}
            <div className="md:col-span-12 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/60 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">route</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface">End-to-End Diagnostic Pipeline</h3>
                  <p className="text-xs text-on-surface-variant">Standardized workflow from DICOM ingestion to radiologist report</p>
                </div>
              </div>

              {/* Horizontal Pipeline Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                {pipelineSteps.map((p) => (
                  <div key={p.step} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/40 flex flex-col items-center text-center group hover:border-primary transition-all">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high group-hover:bg-primary-fixed group-hover:text-primary text-on-surface-variant flex items-center justify-center mb-3 transition-colors">
                      <span className="material-symbols-outlined text-2xl">{p.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Step {p.step}</span>
                    <h4 className="text-xs font-bold text-on-surface mb-1">{p.title}</h4>
                    <p className="text-[11px] text-on-surface-variant leading-snug">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Institutions */}
            <div className="md:col-span-12 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Clinical & Academic Collaborators</h4>
                <p className="text-xs text-on-surface-variant">Validated in clinical trials across leading oncology research centers</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-primary">
                <span className="bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/50">Johns Hopkins Medicine</span>
                <span className="bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/50">Mayo Clinic Oncology</span>
                <span className="bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/50">MSK Cancer Center</span>
              </div>
            </div>

          </div>

          {/* Footer Routing */}
          <footer className="pt-6 border-t border-outline-variant/60 flex justify-between items-center">
            <Link
              href="/dashboard"
              className="bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold py-3 px-6 rounded-xl border border-outline-variant transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              Return to Dashboard
            </Link>

            <Link
              href="/analysis"
              className="bg-primary text-white text-xs font-semibold py-3 px-6 rounded-xl hover:bg-primary-container transition-colors shadow-md shadow-primary/20 flex items-center gap-2"
            >
              View Active Case Analysis
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </footer>

        </div>
      </main>
    </div>
  );
}
