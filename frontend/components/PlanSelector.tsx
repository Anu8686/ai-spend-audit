'use client';

import { ToolName, TOOL_PLANS } from '@/types/audit';

interface Props {
  toolName: ToolName;
  selectedPlan: string;
  monthlySpend: number;
  seats: number;
  onPlanChange: (plan: string) => void;
  onSpendChange: (spend: number) => void;
  onSeatsChange: (seats: number) => void;
}

export default function PlanSelector({
  toolName,
  selectedPlan,
  monthlySpend,
  seats,
  onPlanChange,
  onSpendChange,
  onSeatsChange,
}: Props) {
  const plans = TOOL_PLANS[toolName];

  return (
    <div className="space-y-4">
      {/* Plan grid */}
      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">Plan</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {plans.map((plan) => (
            <button
              key={plan.name}
              onClick={() => onPlanChange(plan.name)}
              className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all
                ${selectedPlan === plan.name
                  ? 'border-emerald bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 bg-white text-charcoal hover:border-gray-300'}`}
            >
              <div className="font-semibold text-xs">{plan.name}</div>
              <div className={`text-xs mt-0.5 ${selectedPlan === plan.name ? 'text-emerald-600' : 'text-muted'}`}>
                ${plan.price}{plan.priceUnit === 'per_seat' ? '/seat' : '/mo'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seats + spend row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
            Seats / Licenses
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={seats}
            onChange={(e) => onSeatsChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-charcoal focus:outline-none focus:border-emerald transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
            Monthly Spend ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-semibold">$</span>
            <input
              type="number"
              min={0}
              value={monthlySpend}
              onChange={(e) => onSpendChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2 text-sm font-semibold text-charcoal focus:outline-none focus:border-emerald transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Plan description */}
      {(() => {
        const plan = plans.find((p) => p.name === selectedPlan);
        return plan?.description ? (
          <p className="text-xs text-muted bg-white border border-gray-100 rounded-lg px-3 py-2">
            ℹ️ {plan.description}
          </p>
        ) : null;
      })()}
    </div>
  );
}
