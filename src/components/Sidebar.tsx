'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', badge: null },
    { name: 'Analysis Results', href: '/analysis', icon: 'biotech', badge: 'Live' },
    { name: 'Model Analytics', href: '/analytics', icon: 'query_stats', badge: 'v2.4' },
    { name: 'About PinkPulse', href: '/about', icon: 'medical_services', badge: null },
  ];

  return (
    <aside className="bg-surface border-r border-outline-variant w-sidebar_width flex flex-col h-screen py-6 shrink-0 z-20 select-none">
      {/* Brand Header with Custom Logo */}
      <div className="px-5 mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white p-1 border border-outline-variant/60 shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="PinkPulse AI Logo"
              width={44}
              height={44}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <h1 className="font-headline font-bold text-base text-primary tracking-tight flex items-center gap-1.5">
              PinkPulse <span className="bg-primary-fixed text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">AI</span>
            </h1>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-outline">
          Core Platform
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm shadow-primary/10'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${isActive ? 'filled text-white' : 'text-outline'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-outline">
          Clinical Tools
        </div>
        <Link
          href="/export"
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
            pathname === '/export'
              ? 'bg-primary-container text-on-primary font-semibold shadow-sm shadow-primary/10'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-outline">description</span>
            <span>Export Reports</span>
          </div>
          <span className="bg-primary-fixed text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
            PDF
          </span>
        </Link>
      </nav>

      {/* Footer / Account Link */}
      <div className="px-4 pt-4 mt-auto border-t border-outline-variant/60">
        <Link
          href="/"
          className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-surface-container-high"
          title="Sign out / Switch user"
        >
          <div className="w-9 h-9 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-sm">
            DR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">Dr. Sarah Jenkins</p>
            <p className="text-xs text-on-surface-variant truncate">Sign Out</p>
          </div>
          <span className="material-symbols-outlined text-outline text-lg">logout</span>
        </Link>
      </div>
    </aside>
  );
}
