'use client';

import { Recommendation } from '@/types/audit';

interface Props {
  rec: Recommendation;
}

const TYPE_ICONS: Record<Recommendation['type'], string> = {
  downgrade: '🔄',
  upgrade: '⬆️',
  consolidate: '🔗',
  cancel: '❌',
  ok: '✅',
};

const PRIORITY_STYLES: Record<Recommendation['priority'], { dot: string; badge: string; badgeText: string; border: string }> = {
  high: {
    dot: 'bg-coral',
    badge: 'bg-red-50 text-red-600 border-red-100',
    badgeText: 'HIGH',
    border: 'border-l-coral',
  },
  medium: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
    badgeText: 'MEDIUM',
    border: 'border-l-amber-400',
  },
  low: {
    dot: 'bg-gray-300',
    badge: 'bg-gray-50 text-gray-500 border-gray-200',
    badgeText: 'LOW',
    border: 'border-l-gray-300',
  },
};

export default function RecommendationCard({ rec }: Props) {
  const styles = PRIORITY_STYLES[rec.priority];

  return (
    <div className={`flex gap-4 p-4 bg-gray-50 rounded-xl border-l-4 ${styles.border}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-white border border-gray-100">
        {TYPE_ICONS[rec.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-bold text-sm text-charcoal">{rec.toolName}</span>
          <span className="text-xs text-muted">
            {rec.currentPlan} → {rec.recommendedPlan}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}>
            {styles.badgeText}
          </span>
        </div>
        <p className="text-xs text-muted leading-relaxed mb-2">{rec.reason}</p>
        {rec.monthlySavings > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
              → Save ${rec.monthlySavings}/mo
            </span>
            <span className="text-xs text-amber-600 font-semibold">
              ${rec.annualSavings.toLocaleString()}/year
            </span>
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        <div className="text-xs text-muted mb-0.5">Current</div>
        <div className="font-bold text-coral text-sm">${rec.currentSpend}/mo</div>
        <div className="text-xs text-muted mt-1.5 mb-0.5">Optimal</div>
        <div className="font-bold text-amber-600 text-sm">${rec.recommendedSpend}/mo</div>
      </div>
    </div>
  );
}
