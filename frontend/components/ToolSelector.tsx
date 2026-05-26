'use client';

import { useState } from 'react';
import { AuditTool, ToolName, TOOL_PLANS, TOOL_COLORS } from '@/types/audit';
import PlanSelector from './PlanSelector';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  tools: AuditTool[];
  onChange: (tools: AuditTool[]) => void;
}

const TOOL_NAMES = Object.keys(TOOL_PLANS) as ToolName[];

const TOOL_ICONS: Record<ToolName, string> = {
  ChatGPT: 'G',
  Claude: 'A',
  Cursor: '⌘',
  Gemini: '✦',
  'GitHub Copilot': '⎔',
  'OpenAI API': '⚡',
  'Anthropic API': '⚡',
  Windsurf: '◈',
};

function defaultTool(name: ToolName): AuditTool {
  const plans = TOOL_PLANS[name];
  const plan = plans[0];
  return {
    id: uuidv4(),
    tool: name,
    plan: plan.name,
    monthlySpend: plan.price,
    seats: 1,
  };
}

export default function ToolSelector({ tools, onChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  function addTool(name: ToolName) {
    const already = tools.find((t) => t.tool === name);
    if (already) { setExpanded(already.id); return; }
    const t = defaultTool(name);
    onChange([...tools, t]);
    setExpanded(t.id);
  }

  function removeTool(id: string) {
    onChange(tools.filter((t) => t.id !== id));
    if (expanded === id) setExpanded(null);
  }

  function updateTool(id: string, patch: Partial<AuditTool>) {
    onChange(tools.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  const addedNames = new Set(tools.map((t) => t.tool));

  return (
    <div>
      {/* Tool picker grid */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">Select tools you pay for</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TOOL_NAMES.map((name) => {
            const added = addedNames.has(name);
            const color = TOOL_COLORS[name];
            return (
              <button
                key={name}
                onClick={() => added ? setExpanded(tools.find((t) => t.tool === name)?.id ?? null) : addTool(name)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all text-sm font-medium
                  ${added
                    ? 'border-emerald bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 bg-white text-charcoal hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: color }}
                >
                  {TOOL_ICONS[name]}
                </span>
                <span className="truncate">{name}</span>
                {added && <span className="ml-auto text-emerald text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Added tools */}
      {tools.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted uppercase tracking-wide">Your tools</p>
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Tool header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === tool.id ? null : tool.id)}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: TOOL_COLORS[tool.tool] }}
                >
                  {TOOL_ICONS[tool.tool]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-charcoal">{tool.tool}</div>
                  <div className="text-xs text-muted">{tool.plan} · ${tool.monthlySpend}/mo · {tool.seats} seat{tool.seats > 1 ? 's' : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-coral">${tool.monthlySpend}/mo</span>
                  <span className="text-muted-light text-xs">{expanded === tool.id ? '▲' : '▼'}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeTool(tool.id); }}
                  className="w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center text-xs font-bold transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Expanded editor */}
              {expanded === tool.id && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/50">
                  <PlanSelector
                    toolName={tool.tool}
                    selectedPlan={tool.plan}
                    monthlySpend={tool.monthlySpend}
                    seats={tool.seats}
                    onPlanChange={(plan) => {
                      const plans = TOOL_PLANS[tool.tool];
                      const p = plans.find((pp) => pp.name === plan);
                      const spend = p ? (p.priceUnit === 'per_seat' ? p.price * tool.seats : p.price) : tool.monthlySpend;
                      updateTool(tool.id, { plan, monthlySpend: spend });
                    }}
                    onSpendChange={(monthlySpend) => updateTool(tool.id, { monthlySpend })}
                    onSeatsChange={(seats) => {
                      const plans = TOOL_PLANS[tool.tool];
                      const p = plans.find((pp) => pp.name === tool.plan);
                      const spend = p ? (p.priceUnit === 'per_seat' ? p.price * seats : p.price) : tool.monthlySpend;
                      updateTool(tool.id, { seats, monthlySpend: spend });
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tools.length === 0 && (
        <div className="text-center py-10 text-muted text-sm bg-white border border-dashed border-gray-200 rounded-2xl">
          Click a tool above to add it to your audit
        </div>
      )}
    </div>
  );
}
