'use client';

import { UseCase } from '@/types/audit';

interface Props {
  value: UseCase;
  onChange: (v: UseCase) => void;
}

const OPTIONS: { value: UseCase; label: string; icon: string; desc: string }[] = [
  { value: 'Coding', label: 'Software Development', icon: '💻', desc: 'AI-assisted coding, code review' },
  { value: 'Writing', label: 'Content & Writing', icon: '✍️', desc: 'Copywriting, docs, emails' },
  { value: 'Research', label: 'Research & Analysis', icon: '🔬', desc: 'Summarizing, fact-finding' },
  { value: 'Data Analysis', label: 'Data & Automation', icon: '📊', desc: 'SQL, scripts, pipelines' },
  { value: 'Mixed', label: 'Mixed / General', icon: '🔀', desc: 'Multiple use cases' },
];

export default function UseCaseSelector({ value, onChange }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-charcoal mb-4">Primary use case</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-all
              ${value === opt.value
                ? 'border-emerald bg-emerald-50 text-emerald-800'
                : 'border-gray-200 bg-white text-charcoal hover:border-gray-300'}`}
          >
            <span className="text-xl flex-shrink-0">{opt.icon}</span>
            <div>
              <div className="font-semibold text-sm">{opt.label}</div>
              <div className={`text-xs mt-0.5 ${value === opt.value ? 'text-emerald-600' : 'text-muted'}`}>{opt.desc}</div>
            </div>
            {value === opt.value && <span className="ml-auto text-emerald text-sm">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
