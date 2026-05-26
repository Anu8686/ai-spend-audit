'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AuditResult } from '@/types/audit';

interface Props { result: AuditResult; }

const COLORS = ['#10B981', '#F59E0B', '#FB7185', '#4285F4', '#7C3AED', '#CC785C', '#10A37F', '#24292E'];

export default function SavingsChart({ result }: Props) {
  const data = result.input.tools
    .filter((t) => t.monthlySpend > 0)
    .map((t, i) => ({
      name: t.tool.replace('GitHub Copilot', 'Copilot').replace('Anthropic API', 'Anthropic'),
      value: t.monthlySpend,
      color: COLORS[i % COLORS.length],
    }));

  if (data.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="text-sm font-bold text-charcoal mb-1">Spend by Tool</div>
      <div className="text-xs text-muted mb-4">Current monthly distribution</div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}
            formatter={(value: number) => [`$${value}/mo`, '']}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => <span className="text-charcoal">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
