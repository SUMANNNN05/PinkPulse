'use client';

import React, { useState } from 'react';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 px-8 border-b border-outline-variant/60 bg-surface/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="font-headline font-bold text-xl text-on-surface tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-on-surface-variant font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search patient ID, DICOM, or scan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-xs rounded-full pl-9 pr-4 py-2 border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/70"
          />
        </div>

        {/* Quick Actions */}
        <button
          onClick={() => alert("3 new high-priority mammogram scans queued for AI review.")}
          className="relative w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-lg">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white"></span>
        </button>

        <button
          onClick={() => alert("PinkPulse AI Model v2.4 Status: Operational (99.8% Uptime)")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>AI Engine Active</span>
        </button>
      </div>
    </header>
  );
}
