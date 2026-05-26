'use client';

import { useMemo } from 'react';
import { AuditTool } from '@/types/audit';
import { runAudit } from '@/lib/audit-engine';

interface Props {
  tools: AuditTool[];
  teamSize: number;
}

export default function SavingsGauge({ tools, teamSize }: Props) {
  const result = useMemo(() => {
    if (tools.length === 0) return null;
    return runAudit({ tools, teamSize, useCase: 'Mixed' });
  }, [tools, teamSize]);

  const totalSpend = tools.reduce((s, t) => s + t.monthlySpend, 0);
  const savings = result?.totalMonthlySavings ?? 0;
  const pct = totalSpend > 0 ? Math.min(100, Math.round((savings / totalSpend) * 100)) : 0;

  const gaugeColor = pct >= 30 ? '#FB7185' : pct >= 15 ? '#F59E0B' : '#10B981';

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-200 rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">◎ Savings Radar</div>

      <div className="text-center mb-4">
        <div className="text-5xl font-black tracking-tighter text-emerald leading-none">
          ${savings.toLocaleString()}
        </div>
        <div className="text-xs text-muted mt-1">estimated monthly savings</div>
        {savings > 0 && (
          <div className="text-base font-bold text-amber-600 mt-2">
            ${(savings * 12).toLocaleString()}/year
          </div>
        )}
      </div>

      {/* Gauge bar */}
      <div className="mb-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: gaugeColor }}
          />
        </div>
        <div className="text-xs text-muted mt-1 text-center">
          {totalSpend > 0 ? `${pct}% of $${totalSpend}/mo can be saved` : 'Add tools to see savings'}
        </div>
      </div>

      {/* Tool count */}
      {tools.length > 0 && (
        <div className="space-y-1.5 mt-4 pt-4 border-t border-emerald-200">
          {tools.slice(0, 4).map((t) => (
            <div key={t.id} className="flex justify-between text-xs">
              <span className="text-muted font-medium truncate">{t.tool}</span>
              <span className="font-semibold text-charcoal ml-2">${t.monthlySpend}/mo</span>
            </div>
          ))}
          {tools.length > 4 && (
            <div className="text-xs text-muted text-center">+{tools.length - 4} more</div>
          )}
          <div className="flex justify-between text-xs pt-1 border-t border-emerald-200 mt-1">
            <span className="font-bold text-charcoal">Total</span>
            <span className="font-bold text-coral">${totalSpend}/mo</span>
          </div>
        </div>
      )}

      {tools.length === 0 && (
        <p className="text-xs text-muted text-center mt-2">
          Select tools on the left to see your potential savings
        </p>
      )}
    </div>
  );
}
