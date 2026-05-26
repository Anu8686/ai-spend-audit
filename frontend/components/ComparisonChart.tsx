'use client';

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';
import { AuditResult } from '@/types/audit';

interface Props { result: AuditResult; }

export default function ComparisonChart({ result }: Props) {
  const { totalCurrentSpend, totalOptimalSpend, totalMonthlySavings, savingsScore, recommendations } = result;

  const data = [
    { metric: 'Spend Efficiency', score: savingsScore },
    { metric: 'Plan Fit', score: Math.max(20, 100 - recommendations.filter(r => r.type === 'downgrade').length * 20) },
    { metric: 'Seat Optimization', score: Math.max(20, 100 - recommendations.filter(r => r.reason.includes('seat')).length * 25) },
    { metric: 'Tool Overlap', score: Math.max(20, 100 - recommendations.filter(r => r.type === 'consolidate').length * 30) },
    { metric: 'Cost/Value', score: Math.min(100, Math.round((totalOptimalSpend / Math.max(1, totalCurrentSpend)) * 100)) },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="text-sm font-bold text-charcoal mb-4">Efficiency Radar</div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="#F3F4F6" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <Radar name="Score" dataKey="score" fill="#10B981" fillOpacity={0.2} stroke="#10B981" strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
