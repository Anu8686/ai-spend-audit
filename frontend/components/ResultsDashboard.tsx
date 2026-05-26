'use client';

import { useState } from 'react';
import { AuditResult, TOOL_COLORS } from '@/types/audit';
import { generateFallbackSummary } from '@/lib/audit-engine';
import SavingsCounter from './SavingsCounter';
import RecommendationCard from './RecommendationCard';
import SpendChart from './SpendChart';
import SavingsChart from './SavingsChart';
import LeadCapture from './LeadCapture';

interface Props {
  result: AuditResult;
}

export default function ResultsDashboard({ result }: Props) {
  const {
    totalCurrentSpend,
    totalOptimalSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsScore,
    savingsRate,
    recommendations,
    input,
  } = result;

  const [copied, setCopied] = useState(false);
  const shareId = result.id.slice(0, 8).toUpperCase();

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/report/${shareId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const summary = result.aiSummary || generateFallbackSummary(result);

  const scoreColor =
    savingsScore >= 80 ? 'text-emerald' :
    savingsScore >= 60 ? 'text-amber-500' :
    'text-coral';

  const scoreLabel =
    savingsScore >= 80 ? 'Optimized' :
    savingsScore >= 60 ? 'Needs Review' :
    'Overpaying';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header banner */}
      <div className="bg-charcoal rounded-3xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-40 h-40 bg-amber-500/10 rounded-full translate-y-1/2 pointer-events-none" />
        <div className="relative">
          <div className="text-emerald text-xs font-bold uppercase tracking-widest mb-2">◎ Audit Complete</div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight mb-1">
            You could save{' '}
            <SavingsCounter value={totalMonthlySavings} prefix="$" suffix="/mo" className="text-emerald-400" />
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            That's{' '}
            <SavingsCounter value={totalAnnualSavings} prefix="$" className="text-amber-300 font-semibold" />
            {' '}annually — {savingsRate.toFixed(0)}% of your AI spend
          </p>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Current spend', value: `$${totalCurrentSpend}/mo`, color: 'text-red-400' },
              { label: 'Optimized spend', value: `$${totalOptimalSpend}/mo`, color: 'text-amber-300' },
              { label: 'Monthly savings', value: `$${totalMonthlySavings}/mo`, color: 'text-emerald-400' },
              { label: 'Annual savings', value: `$${totalAnnualSavings.toLocaleString()}`, color: 'text-amber-300' },
            ].map((k) => (
              <div key={k.label} className="bg-white/8 border border-white/10 rounded-xl p-3">
                <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide font-semibold">{k.label}</div>
                <div className={`text-lg font-extrabold tracking-tight ${k.color}`}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <SpendChart result={result} />
        <SavingsChart result={result} />
      </div>

      {/* Score + tool breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Score */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Savings Score</div>
          <div className={`text-7xl font-black tracking-tighter ${scoreColor}`}>{savingsScore}</div>
          <div className="text-sm text-muted mt-1">out of 100</div>
          <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${
            savingsScore >= 80 ? 'bg-emerald-50 text-emerald-700' :
            savingsScore >= 60 ? 'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-600'
          }`}>{scoreLabel}</div>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            {savingsScore >= 80
              ? 'Your stack is well-optimized. No major changes needed.'
              : savingsScore >= 60
              ? 'Some improvements available. Review recommendations below.'
              : `You're overpaying by ~${savingsRate.toFixed(0)}%. Act on the high-priority items.`}
          </p>
        </div>

        {/* Tool breakdown */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="text-sm font-bold text-charcoal mb-4">Tool-by-tool breakdown</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left pb-2 font-semibold">Tool</th>
                  <th className="text-right pb-2 font-semibold">Current</th>
                  <th className="text-right pb-2 font-semibold">Optimal</th>
                  <th className="text-right pb-2 font-semibold text-emerald">Saves</th>
                  <th className="text-right pb-2 font-semibold text-amber-600">Annual</th>
                </tr>
              </thead>
              <tbody>
                {input.tools.map((t) => {
                  const toolRec = recommendations.find((r) => r.toolId === t.id);
                  const saves = toolRec?.monthlySavings ?? 0;
                  const optimal = t.monthlySpend - saves;
                  return (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: TOOL_COLORS[t.tool] }}
                          >
                            {t.tool[0]}
                          </span>
                          <div>
                            <div className="font-semibold text-xs text-charcoal">{t.tool}</div>
                            <div className="text-xs text-muted">{t.plan}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-2.5 font-semibold text-coral text-xs">${t.monthlySpend}/mo</td>
                      <td className="text-right py-2.5 font-semibold text-amber-600 text-xs">${optimal}/mo</td>
                      <td className="text-right py-2.5 font-bold text-emerald text-xs">{saves > 0 ? `$${saves}/mo` : '—'}</td>
                      <td className="text-right py-2.5 font-bold text-amber-600 text-xs">{saves > 0 ? `$${(saves * 12).toLocaleString()}` : '—'}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-2.5 pl-2 text-xs text-charcoal">Total</td>
                  <td className="text-right py-2.5 text-coral text-xs">${totalCurrentSpend}/mo</td>
                  <td className="text-right py-2.5 text-amber-600 text-xs">${totalOptimalSpend}/mo</td>
                  <td className="text-right py-2.5 text-emerald text-xs">${totalMonthlySavings}/mo</td>
                  <td className="text-right py-2.5 text-amber-600 text-xs">${totalAnnualSavings.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-charcoal">Recommendations</div>
            <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {recommendations.length} action{recommendations.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.toolId + rec.type} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="bg-charcoal rounded-2xl p-6 mb-5">
        <div className="inline-flex items-center gap-1.5 bg-emerald/15 text-emerald-300 border border-emerald/25 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          ✦ AI Analysis
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Monthly savings', value: `$${totalMonthlySavings}/mo`, color: 'text-emerald-400' },
            { label: 'Savings rate', value: `${savingsRate.toFixed(0)}%`, color: 'text-amber-300' },
            { label: 'Annual impact', value: `$${totalAnnualSavings.toLocaleString()}`, color: 'text-emerald-400' },
          ].map((h) => (
            <div key={h.label} className="bg-white/6 border border-white/10 rounded-xl p-3 text-center">
              <div className={`text-xl font-extrabold tracking-tight ${h.color}`}>{h.value}</div>
              <div className="text-gray-400 text-xs mt-1">{h.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Share */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold text-charcoal">📤 Share this report</div>
            <div className="text-xs text-muted mt-0.5">Email and company name are hidden from the public link</div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            Public link ready
          </span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-3">
          <span className="text-xs font-mono text-muted flex-1 truncate">
            {typeof window !== 'undefined' ? window.location.origin : 'https://aispendaudit.com'}/report/{shareId}
          </span>
          <button
            onClick={copyLink}
            className="bg-charcoal text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-charcoal/90 transition-colors whitespace-nowrap"
          >
            {copied ? '✓ Copied!' : 'Copy link'}
          </button>
        </div>
        <div className="flex gap-2">
          <a
            href={`/audit`}
            className="flex-1 text-center border border-gray-200 text-charcoal text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← New Audit
          </a>
          <button
            onClick={() => window.print()}
            className="flex-1 border border-gray-200 text-charcoal text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            🖨 Print Report
          </button>
        </div>
      </div>

      {/* Lead capture */}
      <LeadCapture auditId={result.id} monthlySavings={totalMonthlySavings} />
    </div>
  );
}
