'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuditResult } from '@/types/audit';
import ResultsDashboard from '@/components/ResultsDashboard';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('auditResult');
    if (!raw) { router.push('/audit'); return; }
    try { setResult(JSON.parse(raw)); }
    catch { router.push('/audit'); }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-ivory">
      <ResultsDashboard result={result} />
    </main>
  );
}
