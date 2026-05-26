'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { AuditResult, TOOL_COLORS } from '@/types/audit';

interface Props { result: AuditResult; }

export default function SpendChart({ result }: Props) {
  const data = result.input.tools.map((t) => {
    const rec = result.recommendations.find((r) => r.toolId === t.id);
    const saves = rec?.monthlySavings ?? 0;
    return {
      name: t.tool.replace('GitHub Copilot', 'Copilot').replace('Anthropic API', 'Anthropic'),
      Current: t.monthlySpend,
      Optimal: Math.max(0, t.monthlySpend - saves),
    };
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="text-sm font-bold text-charcoal mb-4">Current vs Optimized Spend</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%" barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}
            formatter={(value: number) => [`$${value}/mo`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Current" fill="#FB7185" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Optimal" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
