'use client';

import AuditWizard from '@/components/AuditWizard';

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Free AI Spend Audit
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-charcoal mb-3">
            Audit Your AI Stack
          </h1>
          <p className="text-muted text-lg max-w-lg mx-auto">
            Enter your tools and we'll find every dollar you're wasting.
          </p>
        </div>
        <AuditWizard />
      </div>
    </main>
  );
}
