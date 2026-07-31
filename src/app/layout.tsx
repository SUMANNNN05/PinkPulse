'use client';

import React from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  return (
    <html lang="en">
      <head>
        <title>PinkPulse AI - Oncology Diagnostics & Explainability</title>
        <meta name="description" content="AI-assisted clinical breast cancer diagnostics, mammogram segmentation, Grad-CAM heatmaps, and deep learning explainability." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="flex h-screen overflow-hidden antialiased bg-background text-on-surface">
        {!isLoginPage && <Sidebar />}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
