'use client';

import { AuditResult } from '@/types/audit';
import SavingsCounter from './SavingsCounter';

interface Props {
  result: AuditResult;
}

export default function AuditSummary({ result }: Props) {
  const {
    totalCurrentSpend,
    totalOptimalSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsScore,
    savingsRate,
    recommendations,
  } = result;

  const scoreColor =
    savingsScore >= 80 ? 'text-emerald' :
    savingsScore >= 60 ? 'text-amber-500' :
    'text-coral';

  const highPriority = recommendations.filter((r) => r.priority === 'high');
  const mediumPriority = recommendations.filter((r) => r.priority === 'medium');

  return (
    <div className="space-y-4">
      {/* Score card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted mb-1">
              Savings Score
            </div>
            <div className={`text-5xl font-black tracking-tighter ${scoreColor}`}>
              {savingsScore}
            </div>
            <div className="text-xs text-muted mt-0.5">out of 100</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted uppercase tracking-wide font-semibold mb-1">
              Monthly savings
            </div>
            <SavingsCounter
              value={totalMonthlySavings}
              prefix="$"
              suffix="/mo"
              className="text-2xl font-extrabold text-emerald tracking-tight"
            />
            <div className="text-xs text-amber-600 font-semibold mt-1">
              ${(totalAnnualSavings).toLocaleString()}/year
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Waste: {savingsRate.toFixed(0)}%</span>
            <span>${totalCurrentSpend}/mo → ${totalOptimalSpend}/mo</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald to-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.max(4, 100 - savingsRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Priority counts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-extrabold text-coral">{highPriority.length}</div>
          <div className="text-xs font-semibold text-red-600 mt-0.5">High priority</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-extrabold text-amber-600">{mediumPriority.length}</div>
          <div className="text-xs font-semibold text-amber-700 mt-0.5">Medium priority</div>
        </div>
      </div>

      {/* Top recommendation preview */}
      {recommendations[0] && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1.5">
            Top opportunity
          </div>
          <div className="font-bold text-sm text-charcoal mb-1">
            {recommendations[0].toolName} · {recommendations[0].currentPlan} → {recommendations[0].recommendedPlan}
          </div>
          <div className="text-xs text-muted line-clamp-2">{recommendations[0].reason}</div>
          <div className="mt-2 font-bold text-emerald text-sm">
            Save ${recommendations[0].monthlySavings}/mo
          </div>
        </div>
      )}
    </div>
  );
}
