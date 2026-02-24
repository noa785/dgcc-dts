'use client';
// src/app/auth/login/LoginForm.tsx

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@dgcc.edu.sa', password: 'Admin123!' },
  { label: 'Unit Manager', email: 'manager@dgcc.edu.sa', password: 'Manager123!' },
  { label: 'Viewer', email: 'viewer@dgcc.edu.sa', password: 'Viewer123!' },
];

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  function fillDemo(acc: (typeof DEMO_ACCOUNTS)[0]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  }

  return (
    <div className="w-full max-w-sm relative z-10">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-display font-black text-white text-lg shadow-[0_0_30px_rgba(99,102,241,0.4)]">
          DG
        </div>
        <div>
          <div className="font-display font-bold text-xl text-white">DGCC Enterprise</div>
          <div className="text-xs text-slate-500 tracking-wide">Project & Governance System</div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-[#111620] border border-[#1f2d45] rounded-2xl p-8 shadow-2xl">
        <h1 className="font-display font-bold text-xl mb-1">Sign In</h1>
        <p className="text-sm text-slate-500 mb-6">Institutional access — authorized users only</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="pes-label block mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pes-input"
              placeholder="you@dgcc.edu.sa"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="pes-label block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pes-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full pes-btn-primary justify-center py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In to PES'}
          </button>
        </form>
      </div>

      {/* Demo accounts */}
      <div className="mt-4 bg-[#111620] border border-[#1f2d45] rounded-xl p-4">
        <div className="pes-label mb-3">Demo Accounts</div>
        <div className="space-y-1.5">
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.email}
              onClick={() => fillDemo(acc)}
              className="w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-[#161d2e] transition-colors text-left"
            >
              <span className="text-sm font-semibold text-blue-400">{acc.label}</span>
              <span className="text-xs text-slate-500">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
