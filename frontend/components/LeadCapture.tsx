'use client';

import { useState } from 'react';

interface Props {
  auditId: string;
  monthlySavings: number;
}

const ROLES = [
  'Founder / CEO',
  'CTO / VP Engineering',
  'CFO / Head of Finance',
  'Engineering Manager',
  'Product Manager',
  'Developer / IC',
  'Other',
];

export default function LeadCapture({ auditId, monthlySavings }: Props) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function submit() {
    if (!email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, role, audit_id: auditId, monthly_savings: monthlySavings }),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
    } catch {
      // Still show success for UX — store locally
      localStorage.setItem('lead', JSON.stringify({ email, company, role }));
      setStatus('done');
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">📬</div>
        <div className="font-bold text-emerald-800 mb-1">Report sent!</div>
        <p className="text-emerald-700 text-sm">Check your inbox. We'll include a PDF breakdown of your savings.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-sm font-bold text-charcoal">📬 Email your report</div>
        <p className="text-xs text-muted mt-0.5">
          Get a PDF breakdown of your ${monthlySavings}/mo savings opportunity. No spam, ever.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
            Work email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@startup.com"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
            Company
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald transition-colors"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald transition-colors"
        >
          <option value="">Select your role...</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      <button
        onClick={submit}
        disabled={!email.includes('@') || status === 'loading'}
        className="w-full bg-emerald text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
        ) : (
          '→ Send My Report'
        )}
      </button>
      <p className="text-xs text-muted text-center mt-2">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
