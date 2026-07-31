'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('doctor@hospital.org');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-surface flex items-center justify-center p-6 md:p-10 font-sans text-on-surface">
      <main className="w-full max-w-md">
        
        {/* Brand Header with Wordmark Image */}
        <div className="text-center mb-8">
          <div className="relative w-28 h-28 mx-auto mb-4 bg-white rounded-3xl p-3 shadow-xl shadow-primary/10 border border-outline-variant/60 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="PinkPulse AI Emblem Logo"
              width={100}
              height={100}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          {/* Wordmark Logo Image instead of text */}
          <div className="h-12 flex items-center justify-center">
            <Image
              src="/wordmark.png"
              alt="PinkPulse AI"
              width={260}
              height={60}
              className="h-10 object-contain mx-auto"
              priority
            />
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-primary/5 p-8 border border-outline-variant/60">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-outline-variant/60 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 pb-3 text-center text-xs font-bold transition-all border-b-2 ${
                tab === 'login'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 pb-3 text-center text-xs font-bold transition-all border-b-2 ${
                tab === 'signup'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                    person
                  </span>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent border border-pink-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-on-surface mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent border border-pink-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-on-surface" htmlFor="password">
                  Password
                </label>
                {tab === 'login' && (
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Password reset link sent."); }}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Forgot?
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border border-pink-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {tab === 'signup' && (
              <div className="text-[11px] text-on-surface-variant flex items-start gap-2">
                <input type="checkbox" required id="terms" className="mt-0.5 rounded text-primary focus:ring-primary" />
                <label htmlFor="terms">
                  I agree to the Terms of Service and Privacy Policy.
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold text-xs py-3.5 rounded-xl hover:bg-primary-container transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>{tab === 'login' ? 'Sign in' : 'Sign up'}</span>
              )}
            </button>
          </form>

        </div>

      </main>
    </div>
  );
}
