'use client';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

const PRESETS = [
  { label: 'Just me', sub: 'Solo founder', size: 1, icon: '👤' },
  { label: '2–5 people', sub: 'Early team', size: 3, icon: '👥' },
  { label: '6–15 people', sub: 'Growing startup', size: 10, icon: '🏢' },
  { label: '16–50 people', sub: 'Scale-up', size: 25, icon: '🚀' },
];

export default function TeamSizeInput({ value, onChange }: Props) {
  const activePreset = PRESETS.find((p) => p.size === value);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-charcoal mb-4">Team size</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(p.size)}
            className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all
              ${value === p.size
                ? 'border-emerald bg-emerald-50 text-emerald-800'
                : 'border-gray-200 bg-white text-charcoal hover:border-gray-300'}`}
          >
            <span className="text-xl mb-1">{p.icon}</span>
            <span className="font-semibold text-xs">{p.label}</span>
            <span className="text-xs text-muted mt-0.5">{p.sub}</span>
          </button>
        ))}
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
          Exact headcount
        </label>
        <input
          type="number"
          min={1}
          max={10000}
          value={value}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-charcoal focus:outline-none focus:border-emerald transition-colors"
          placeholder="Enter exact number"
        />
      </div>
    </div>
  );
}
