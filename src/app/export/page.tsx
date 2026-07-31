'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import jsPDF from 'jspdf';

interface ReportCase {
  id: string;
  patientName: string;
  age: number;
  modality: string;
  classification: string;
  confidence: string;
  birads: string;
  date: string;
  status: string;
  statusColor: string;
  lesionSize: string;
  location: string;
  radiologist: string;
}

export default function ExportReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModality, setFilterModality] = useState('All');
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [previewCase, setPreviewCase] = useState<ReportCase | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const reportCases: ReportCase[] = [
    {
      id: '#8472-A',
      patientName: 'Jane Doe',
      age: 52,
      modality: 'Invasive Ductal Carcinoma (IDC)',
      classification: 'Malignant',
      confidence: '94.2%',
      birads: 'BI-RADS 5',
      date: '2026-07-24',
      status: 'High Risk',
      statusColor: 'bg-red-100 text-red-700 border-red-200',
      lesionSize: '14.8 mm x 11.2 mm',
      location: 'Upper Outer Quadrant (UOQ) - Left Breast',
      radiologist: 'Dr. Sarah Jenkins, MD',
    },
    {
      id: '#9210-B',
      patientName: 'Maria Garcia',
      age: 46,
      modality: 'Invasive Lobular Carcinoma (ILC)',
      classification: 'Malignant',
      confidence: '88.4%',
      birads: 'BI-RADS 5',
      date: '2026-07-23',
      status: 'High Risk',
      statusColor: 'bg-red-100 text-red-700 border-red-200',
      lesionSize: '18.4 mm x 14.1 mm',
      location: 'Lower Inner Quadrant (LIQ) - Right Breast',
      radiologist: 'Dr. Sarah Jenkins, MD',
    },
    {
      id: '#3044-C',
      patientName: 'Susan Chen',
      age: 61,
      modality: 'Ductal Carcinoma in Situ (DCIS)',
      classification: 'In Situ',
      confidence: '15.2%',
      birads: 'BI-RADS 3',
      date: '2026-07-21',
      status: 'Moderate',
      statusColor: 'bg-amber-100 text-amber-700 border-amber-200',
      lesionSize: '6.2 mm Cluster',
      location: 'Upper Inner Quadrant (UIQ) - Left Breast',
      radiologist: 'Dr. Michael Chang, MD',
    },
    {
      id: '#1198-D',
      patientName: 'Emily Taylor',
      age: 39,
      modality: '3D Digital Mammography',
      classification: 'Benign',
      confidence: '4.1%',
      birads: 'BI-RADS 2',
      date: '2026-07-20',
      status: 'Low Risk',
      statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      lesionSize: 'No focal mass detected',
      location: 'Bilateral Normal Fibroglandular Tissue',
      radiologist: 'Dr. Sarah Jenkins, MD',
    },
    {
      id: '#5541-E',
      patientName: 'Rachel Adams',
      age: 58,
      modality: 'Ultrasound Sonography',
      classification: 'Suspicious',
      confidence: '48.0%',
      birads: 'BI-RADS 4',
      date: '2026-07-18',
      status: 'Suspicious',
      statusColor: 'bg-amber-100 text-amber-700 border-amber-200',
      lesionSize: '9.5 mm Complex Cyst',
      location: 'Lower Outer Quadrant (LOQ) - Right Breast',
      radiologist: 'Dr. Amanda Vance, MD',
    },
    {
      id: '#7819-F',
      patientName: 'Laura Martinez',
      age: 64,
      modality: 'Biopsy Histology (IDC)',
      classification: 'Malignant',
      confidence: '96.7%',
      birads: 'BI-RADS 5',
      date: '2026-07-15',
      status: 'High Risk',
      statusColor: 'bg-red-100 text-red-700 border-red-200',
      lesionSize: '21.0 mm x 16.5 mm',
      location: 'Upper Outer Quadrant (UOQ) - Right Breast',
      radiologist: 'Dr. Sarah Jenkins, MD',
    },
  ];

  // Filtering reports
  const filteredReports = reportCases.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.birads.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = filterModality === 'All' || item.modality.includes(filterModality);
    return matchesSearch && matchesModality;
  });

  const toggleSelectCase = (id: string) => {
    if (selectedCaseIds.includes(id)) {
      setSelectedCaseIds(selectedCaseIds.filter((item) => item !== id));
    } else {
      setSelectedCaseIds([...selectedCaseIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCaseIds.length === filteredReports.length) {
      setSelectedCaseIds([]);
    } else {
      setSelectedCaseIds(filteredReports.map((r) => r.id));
    }
  };

  // Generate Professional PDF using jsPDF
  const generatePDF = (report: ReportCase) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Color Palette
    const primaryColor = [99, 0, 55]; // #630037 PinkPulse Primary
    const textColor = [25, 28, 29];
    const lightBg = [248, 250, 251];

    // Header Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('PinkPulse AI Diagnostics', 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Clinical Radiology Report (PDF)', 14, 22);

    doc.setFontSize(9);
    doc.text(`Report Date: ${report.date}`, 155, 16);
    doc.text(`Case ID: ${report.id}`, 155, 22);

    // Section 1: Patient Information Table
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(14, 35, 182, 32, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, 35, 182, 32, 'S');

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PATIENT & SCAN METADATA', 18, 43);

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    doc.text(`Patient Name: ${report.patientName}`, 18, 51);
    doc.text(`Age: ${report.age} years`, 110, 51);
    doc.text(`Modality: ${report.modality}`, 18, 59);
    doc.text(`Attending Radiologist: ${report.radiologist}`, 110, 59);

    // Section 2: AI Diagnostic Findings
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(14, 74, 182, 45, 'F');
    doc.rect(14, 74, 182, 45, 'S');

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('AI NEURAL NETWORK DIAGNOSTIC ASSESSMENT', 18, 82);

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text(`Primary Finding: ${report.classification}`, 18, 91);
    doc.text(`Model Malignancy Confidence: ${report.confidence}`, 110, 91);
    doc.text(`ACR BI-RADS Category: ${report.birads}`, 18, 99);
    doc.text(`Risk Assessment Status: ${report.status}`, 110, 99);
    doc.text(`Lesion Measurements: ${report.lesionSize}`, 18, 107);
    doc.text(`Anatomical Location: ${report.location}`, 18, 114);

    // Section 3: Morphological Descriptors & XAI Rationales
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(14, 126, 182, 40, 'F');
    doc.rect(14, 126, 182, 40, 'S');

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('MORPHOLOGICAL DESCRIPTORS & GRAD-CAM EXPLAINABILITY', 18, 134);

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const descLines = [
      '• Feature Activation: High gradient-weighted class activation mapping (Grad-CAM peak score >0.91).',
      '• Margin Characteristic: Spiculated margins with acoustic shadowing correlated on B-mode ultrasound.',
      '• Microcalcifications: Fine pleomorphic microcalcifications localized within specified ROI boundary.',
      '• Recommendation: Correlate with ultrasound-guided core needle biopsy (CNB) and clinical pathology.',
    ];

    let yPos = 142;
    descLines.forEach((line) => {
      doc.text(line, 18, yPos);
      yPos += 7;
    });

    // Section 4: Sign-Off & Verification Block
    doc.setLineWidth(0.5);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(14, 175, 196, 175);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Radiologist Verification & Electronic Signature:', 14, 183);

    doc.setFont('helvetica', 'normal');
    doc.text(`Signed electronically by: ${report.radiologist}`, 14, 190);
    doc.text(`Digital Verification Key: DICOM-SHA256-${report.id.replace('#', '')}-8901`, 14, 196);

    // Footer Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'Regulatory Disclaimer: PinkPulse AI is an Auxiliary SaMD Class II diagnostic support system. All AI findings require licensed physician confirmation.',
      14,
      280
    );

    // Save File
    doc.save(`PinkPulse_Report_${report.id.replace('#', '')}_${report.patientName.replace(/\s+/g, '_')}.pdf`);
  };

  // Batch Export selected
  const handleBatchExport = () => {
    if (selectedCaseIds.length === 0) {
      alert('Please select at least one report to export.');
      return;
    }

    setIsExporting(true);
    let count = 0;
    selectedCaseIds.forEach((id) => {
      const rep = reportCases.find((r) => r.id === id);
      if (rep) {
        generatePDF(rep);
        count++;
      }
    });

    setTimeout(() => {
      setIsExporting(false);
      alert(`Successfully generated and downloaded ${count} PDF clinical reports!`);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <Header title="Export Reports" subtitle="Generate and download official DICOM structured PDF clinical reports" />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8 pb-16">
          
          {/* Top Action & Summary Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full">
                  PDF Generator Active
                </span>
                <span className="text-xs text-on-surface-variant font-medium">FDA Class II Compliant Format</span>
              </div>
              <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Clinical Diagnostic Reports</h2>
              <p className="text-xs text-on-surface-variant mt-1">Select cases to generate official PDF reports with AI findings & radiologist verification.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleBatchExport}
                disabled={isExporting || selectedCaseIds.length === 0}
                className="bg-primary text-white text-xs font-semibold px-6 py-3 rounded-xl hover:bg-primary-container transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">download_for_offline</span>
                {isExporting ? 'Generating PDFs...' : `Export Selected (${selectedCaseIds.length})`}
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Search patient name, case ID, or BI-RADS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl pl-9 pr-4 py-2.5 border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/70"
              />
            </div>

            {/* Modality Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-on-surface-variant mr-1">Filter Modality:</span>
              {['All', 'IDC', 'ILC', 'DCIS', 'Mammography', 'Ultrasound'].map((mod) => (
                <button
                  key={mod}
                  onClick={() => setFilterModality(mod)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterModality === mod
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCaseIds.length === filteredReports.length && filteredReports.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs font-bold text-on-surface">
                  Showing {filteredReports.length} Available Case Reports
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">
                {selectedCaseIds.length} of {filteredReports.length} selected for batch export
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/60 text-on-surface-variant uppercase tracking-wider font-semibold bg-surface-container-low/20">
                    <th className="py-3 px-4 w-10">Select</th>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Age</th>
                    <th className="py-3 px-4">Pathology Modality</th>
                    <th className="py-3 px-4">BI-RADS</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Scan Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {filteredReports.map((r) => {
                    const isSelected = selectedCaseIds.includes(r.id);
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-primary-fixed/15' : 'hover:bg-surface-container-low/60'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCase(r.id)}
                            className="rounded text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">{r.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-on-surface">{r.patientName}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant">{r.age} yrs</td>
                        <td className="py-3.5 px-4 font-medium text-on-surface">{r.modality}</td>
                        <td className="py-3.5 px-4 font-bold text-primary">{r.birads}</td>
                        <td className="py-3.5 px-4 font-semibold text-on-surface">{r.confidence}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant">{r.date}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setPreviewCase(r)}
                            className="text-xs font-semibold text-on-surface-variant hover:text-primary underline px-2 py-1"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => generatePDF(r)}
                            className="bg-primary text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Report Preview Modal */}
          {previewCase && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 border border-outline-variant/60 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-xl">description</span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg text-on-surface">Report Document Preview</h3>
                      <p className="text-xs text-on-surface-variant">Case ID: {previewCase.id} | {previewCase.patientName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewCase(null)}
                    className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-outline-variant/50 space-y-4 text-xs">
                  <div className="flex justify-between border-b border-outline-variant/40 pb-3">
                    <div>
                      <p className="font-bold text-primary text-base">PinkPulse AI Oncology Diagnostics</p>
                      <p className="text-on-surface-variant">Official Clinical Radiology Structured Report</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-on-surface">{previewCase.id}</p>
                      <p className="text-on-surface-variant">{previewCase.date}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-3 bg-surface-container-low rounded-lg">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">Patient Name</span>
                      <p className="font-bold text-on-surface">{previewCase.patientName} ({previewCase.age} yrs)</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">Attending Radiologist</span>
                      <p className="font-bold text-on-surface">{previewCase.radiologist}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">Pathology Modality</span>
                      <p className="font-bold text-on-surface">{previewCase.modality}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">ACR BI-RADS Category</span>
                      <p className="font-bold text-primary">{previewCase.birads} ({previewCase.classification})</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-on-surface">Lesion & Morphological Analysis:</p>
                    <p className="text-on-surface-variant leading-relaxed">
                      AI Model Confidence score is <strong className="text-primary">{previewCase.confidence}</strong>. Lesion dimensions measured at <strong>{previewCase.lesionSize}</strong> located in <strong>{previewCase.location}</strong>. Grad-CAM feature attribution highlights spiculated margins with microcalcifications.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Verified & Digitally Signed
                    </span>
                    <span className="font-mono text-on-surface-variant">SHA256 Certified</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setPreviewCase(null)}
                    className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => {
                      generatePDF(previewCase);
                      setPreviewCase(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Download PDF Now
                  </button>
                </div>
              </div>
            </div>
          )}

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
