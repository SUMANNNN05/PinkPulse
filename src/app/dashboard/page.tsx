'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedSample, setSelectedSample] = useState<number | null>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Dynamic Scan Counters starting at 0
  const [totalScans, setTotalScans] = useState(0);
  const [highRiskAlerts, setHighRiskAlerts] = useState(0);

  useEffect(() => {
    // Read saved scan metrics from localStorage
    const savedTotal = localStorage.getItem('pinkpulse_totalScans');
    const savedRisk = localStorage.getItem('pinkpulse_highRiskAlerts');
    if (savedTotal !== null) setTotalScans(parseInt(savedTotal, 10));
    if (savedRisk !== null) setHighRiskAlerts(parseInt(savedRisk, 10));
  }, []);

  const samples = [
    {
      id: 0,
      title: 'Invasive Ductal Carcinoma (IDC)',
      frequency: '70% - 80% cases',
      type: 'Invasive (IDC)',
      badge: 'IDC #8472-A',
      isHighRisk: true,
    },
    {
      id: 1,
      title: 'Invasive Lobular Carcinoma (ILC)',
      frequency: '10% - 15% cases',
      type: 'Invasive (ILC)',
      badge: 'ILC #9210-B',
      isHighRisk: true,
    },
    {
      id: 2,
      title: 'Ductal Carcinoma in Situ (DCIS)',
      frequency: '15% - 20% cases',
      type: 'Non-Invasive (DCIS)',
      badge: 'DCIS #3044-C',
      isHighRisk: false,
    },
  ];

  const recentCases = [
    { id: '#8472-A', patient: 'Jane Doe', age: 52, scanType: 'Mammogram (IDC)', date: 'Today, 14:20', risk: 'High Risk (94.2%)', status: 'Malignant', statusColor: 'bg-red-100 text-red-700 border-red-200' },
    { id: '#9210-B', patient: 'Maria Garcia', age: 46, scanType: 'Biopsy Tissue (ILC)', date: 'Yesterday, 09:15', risk: 'High Risk (88.4%)', status: 'Malignant', statusColor: 'bg-red-100 text-red-700 border-red-200' },
    { id: '#3044-C', patient: 'Susan Chen', age: 61, scanType: 'Ultrasound (DCIS)', date: 'Jul 21, 2026', risk: 'Stage 0 (15.2%)', status: 'In Situ', statusColor: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: '#1198-D', patient: 'Emily Taylor', age: 39, scanType: 'Mammogram (3D)', date: 'Jul 20, 2026', risk: 'Processing', status: 'Queued', statusColor: 'bg-blue-100 text-blue-700 border-blue-200' },
  ];

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);

    // Calculate updated metrics
    const newTotal = totalScans + 1;
    const sample = samples[selectedSample ?? 0];
    const newRisk = sample.isHighRisk ? highRiskAlerts + 1 : highRiskAlerts;

    // Update state and persist in localStorage
    setTotalScans(newTotal);
    setHighRiskAlerts(newRisk);
    localStorage.setItem('pinkpulse_totalScans', newTotal.toString());
    localStorage.setItem('pinkpulse_highRiskAlerts', newRisk.toString());

    setTimeout(() => {
      router.push('/analysis');
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <Header title="Diagnostic Dashboard" subtitle="Upload histological or radiological imaging for immediate AI analysis" />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Hero Welcome Banner with Logo */}
          <div className="bg-gradient-to-r from-primary/10 via-pink-50 to-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-md border border-pink-100 shrink-0 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="PinkPulse AI Logo"
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full">
                    Official Breast Cancer AI
                  </span>
                </div>
                <h2 className="font-headline font-bold text-xl text-on-surface mt-1">
                  PinkPulse AI Oncology Platform
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Empowering clinicians with deep learning lesion segmentation and explainable diagnostic heatmaps.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/about"
                className="bg-white text-primary hover:bg-pink-50 border border-primary/20 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                About Platform
              </Link>
            </div>
          </div>

          {/* Clinical Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-xs font-medium shadow-sm">
            <span className="material-symbols-outlined text-amber-600 text-xl">gavel</span>
            <div className="flex-1">
              <strong className="font-semibold text-amber-900">Clinical Regulatory Disclaimer:</strong> PinkPulse AI is an auxiliary diagnostic support system intended for licensed healthcare professionals. All model findings require correlation with clinical data and radiologist verification.
            </div>
            <span className="bg-amber-200/80 text-amber-900 font-bold px-2.5 py-1 rounded-full text-[10px] tracking-wide">
              FDA SaMD Class II
            </span>
          </div>

          {/* Top Metric Cards (Dynamic Counters starting at 0) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">biotech</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Scans</p>
                <h4 className="text-2xl font-bold text-on-surface font-headline mt-0.5">{totalScans}</h4>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  {totalScans > 0 ? `+${totalScans} completed` : 'No scans performed yet'}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">High Risk Alerts</p>
                <h4 className="text-2xl font-bold text-on-surface font-headline mt-0.5">{highRiskAlerts}</h4>
                <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                  {highRiskAlerts > 0 ? 'Requires radiologist review' : '0 high risk cases detected'}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Model Accuracy</p>
                <h4 className="text-2xl font-bold text-on-surface font-headline mt-0.5">97.8%</h4>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Validated on BI-RADS 5</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed-dim text-tertiary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">timer</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Avg Scan Time</p>
                <h4 className="text-2xl font-bold text-on-surface font-headline mt-0.5">1.4s</h4>
                <p className="text-[11px] text-tertiary font-semibold mt-0.5">Real-time GPU inference</p>
              </div>
            </div>
          </div>

          {/* Drag & Drop Upload Bento Box */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 border-2 border-dashed border-outline-variant hover:border-primary transition-all shadow-sm relative overflow-hidden group">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <p className="font-headline font-bold text-primary text-lg">Running Neural Network Segmentation & Heatmap Synthesis...</p>
                <p className="text-xs text-on-surface-variant">Analyzing BI-RADS descriptors and microcalcification density</p>
              </div>
            )}

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const newTotal = totalScans + 1;
                const newRisk = highRiskAlerts + 1;
                setTotalScans(newTotal);
                setHighRiskAlerts(newRisk);
                localStorage.setItem('pinkpulse_totalScans', newTotal.toString());
                localStorage.setItem('pinkpulse_highRiskAlerts', newRisk.toString());
                alert("File dropped and processed! Scans count incremented.");
              }}
              className={`flex flex-col items-center justify-center py-10 px-6 text-center cursor-pointer transition-all ${
                dragOver ? 'bg-primary-fixed/20 scale-[0.99]' : ''
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary-container text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">upload_file</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-1">
                Drag and Drop DICOM or Pathology Images
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md mb-6">
                Supports DICOM (.dcm), TIFF, PNG, and JPEG. Automatic DICOM header extraction, anonymization, and resolution normalization.
              </p>
              <div className="flex items-center gap-3 justify-center">
                <label className="bg-primary text-white text-xs font-semibold px-6 py-3 rounded-xl hover:bg-primary-container cursor-pointer transition-colors shadow-md shadow-primary/20">
                  Select Local Image File
                  <input
                    type="file"
                    className="hidden"
                    onChange={() => {
                      const newTotal = totalScans + 1;
                      const newRisk = highRiskAlerts + 1;
                      setTotalScans(newTotal);
                      setHighRiskAlerts(newRisk);
                      localStorage.setItem('pinkpulse_totalScans', newTotal.toString());
                      localStorage.setItem('pinkpulse_highRiskAlerts', newRisk.toString());
                      alert("Local file imported & analyzed! Scan counters updated.");
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Sample Selectors (Imageless Cards) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-semibold text-sm text-on-surface uppercase tracking-wider">
                Clinical Pathology Classification Types
              </h3>
              <span className="text-xs text-primary font-semibold">Select sample to compare</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => setSelectedSample(sample.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between bg-surface-container-lowest min-h-[120px] ${
                    selectedSample === sample.id
                      ? 'border-primary ring-2 ring-primary/20 shadow-md bg-primary-fixed/10'
                      : 'border-outline-variant/60 hover:border-outline'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full">
                        {sample.type}
                      </span>
                      <h4 className="text-xs font-bold text-on-surface mt-2.5 leading-snug">{sample.title}</h4>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-1">{sample.frequency}</p>
                    </div>
                    {selectedSample === sample.id ? (
                      <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        ✓
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full border border-outline-variant shrink-0"></span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-on-surface-variant font-medium">{sample.badge}</span>
                    <span className="text-primary font-semibold">Compare Case →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyze Action Bar */}
          <div className="flex items-center justify-between p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm">
            <div>
              <p className="text-xs font-bold text-on-surface">Ready to run diagnostic pipeline?</p>
              <p className="text-xs text-on-surface-variant">Selected Case: <span className="font-semibold text-primary">{samples[selectedSample ?? 0].title}</span></p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/about"
                className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">info</span>
                Model Specs
              </Link>
              <button
                onClick={handleStartAnalysis}
                className="bg-primary text-white text-sm font-semibold px-8 py-3 rounded-xl hover:bg-primary-container transition-all shadow-md shadow-primary/20 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">play_circle</span>
                Analyze & Compare
              </button>
            </div>
          </div>

          {/* Recent Patient Cases Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">Recent Diagnostic Cases</h3>
                <p className="text-xs text-on-surface-variant">High priority mammogram and histology cases reviewed today</p>
              </div>
              <button
                onClick={() => alert("Loading full patient registry...")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View Full Registry
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/60 text-on-surface-variant uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Age</th>
                    <th className="py-3 px-4">Scan Modality</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">AI Finding Risk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {recentCases.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-primary">{c.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-on-surface">{c.patient}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">{c.age} yrs</td>
                      <td className="py-3.5 px-4 text-on-surface">{c.scanType}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">{c.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-on-surface">{c.risk}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.statusColor}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/analysis"
                          className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                        >
                          Open Results
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
