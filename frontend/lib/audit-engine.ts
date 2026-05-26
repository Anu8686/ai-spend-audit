import { AuditInput, AuditResult, AuditTool, Recommendation, ToolName, TOOL_PLANS } from '@/types/audit';
import { v4 as uuidv4 } from 'uuid';

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeToolSpend(tool: AuditTool): number {
  if (tool.monthlySpend > 0) return tool.monthlySpend;
  const plans = TOOL_PLANS[tool.tool];
  const plan = plans.find((p) => p.name === tool.plan);
  if (!plan) return 0;
  return plan.priceUnit === 'per_seat' ? plan.price * tool.seats : plan.price;
}

function planPrice(tool: ToolName, planName: string, seats = 1): number {
  const plans = TOOL_PLANS[tool];
  const plan = plans.find((p) => p.name === planName);
  if (!plan) return 0;
  return plan.priceUnit === 'per_seat' ? plan.price * seats : plan.price;
}

function rec(
  tool: AuditTool,
  recommendedPlan: string,
  reason: string,
  priority: Recommendation['priority'],
  type: Recommendation['type'],
  overrideOptimalSpend?: number
): Recommendation {
  const currentSpend = computeToolSpend(tool);
  const optimalSpend = overrideOptimalSpend ?? planPrice(tool.tool, recommendedPlan, tool.seats);
  const monthly = Math.max(0, currentSpend - optimalSpend);
  return {
    toolId: tool.id,
    toolName: tool.tool,
    currentPlan: tool.plan,
    recommendedPlan,
    currentSpend,
    recommendedSpend: optimalSpend,
    monthlySavings: monthly,
    annualSavings: monthly * 12,
    reason,
    priority,
    type,
  };
}

// ─── Per-tool rules ──────────────────────────────────────────────────────────

function auditChatGPT(tool: AuditTool, teamSize: number): Recommendation | null {
  const spend = computeToolSpend(tool);

  if (tool.plan === 'Team' && tool.seats <= 1) {
    return rec(tool, 'Plus', 'ChatGPT Team requires 2+ seats. With 1 seat, Plus saves $10/mo.', 'high', 'downgrade');
  }
  if (tool.plan === 'Team' && teamSize <= 3 && tool.seats <= 3) {
    const plusCost = 20 * tool.seats;
    const teamCost = 30 * tool.seats;
    if (teamCost > plusCost) {
      return rec(tool, 'Plus', `For a team of ${teamSize}, ${tool.seats}× Plus plans ($${plusCost}/mo) beats Team ($${teamCost}/mo) with identical features.`, 'high', 'downgrade', plusCost);
    }
  }
  if (tool.plan === 'Enterprise' && teamSize < 10) {
    return rec(tool, 'Team', `Enterprise is overkill for ${teamSize} users. Team plan has the same core features at lower cost.`, 'medium', 'downgrade');
  }
  return null;
}

function auditClaude(tool: AuditTool, teamSize: number): Recommendation | null {
  if (tool.plan === 'Team' && tool.seats <= 2) {
    return rec(tool, 'Pro', `Claude Team (min 5 seats) with ${tool.seats} seats is inefficient. Individual Pro plans save money.`, 'high', 'downgrade', 20 * tool.seats);
  }
  if (tool.plan === 'Max (20x)' && teamSize === 1) {
    return rec(tool, 'Max (5x)', 'Max 20x is for power users consuming enormous context. Evaluate if you hit the 5x cap first.', 'medium', 'downgrade');
  }
  if (tool.plan === 'Enterprise' && teamSize < 10) {
    return rec(tool, 'Team', `Enterprise overhead for ${teamSize} users — Team plan is sufficient.`, 'medium', 'downgrade');
  }
  return null;
}

function auditCursor(tool: AuditTool, teamSize: number): Recommendation | null {
  if (tool.plan === 'Business' && tool.seats <= 2) {
    const proCost = 20 * tool.seats;
    return rec(tool, 'Pro', `Cursor Business at $40/seat for ${tool.seats} seat(s) — Pro at $20/seat is identical without SSO.`, 'high', 'downgrade', proCost);
  }
  if (tool.plan === 'Enterprise' && teamSize < 15) {
    return rec(tool, 'Business', 'Cursor Enterprise audit logs add little value under 15 users.', 'medium', 'downgrade');
  }
  if (tool.plan === 'Hobby' && teamSize >= 1) {
    return rec(tool, 'Hobby', 'Free tier — no savings needed. Consider Pro for full productivity.', 'low', 'ok', 0);
  }
  return null;
}

function auditGitHubCopilot(tool: AuditTool, teamSize: number): Recommendation | null {
  if (tool.plan === 'Business' && tool.seats === 1) {
    return rec(tool, 'Individual', 'GitHub Copilot Business with 1 seat — Individual saves $9/mo with the same completion quality.', 'high', 'downgrade');
  }
  if (tool.plan === 'Enterprise' && teamSize < 20) {
    return rec(tool, 'Business', 'Copilot Enterprise fine-tuning is valuable at 20+ devs. Business suffices for your scale.', 'medium', 'downgrade');
  }
  return null;
}

function auditGemini(tool: AuditTool): Recommendation | null {
  if (tool.plan === 'Ultra') {
    return rec(tool, 'Pro (Free)', 'Gemini Pro is free. Evaluate whether Ultra\'s additions ($22/mo) are actually used in your workflow.', 'medium', 'downgrade', 0);
  }
  return null;
}

function auditWindsurf(tool: AuditTool, teamSize: number): Recommendation | null {
  if (tool.plan === 'Teams' && tool.seats <= 2) {
    const proCost = 15 * tool.seats;
    return rec(tool, 'Pro', `Windsurf Teams at $35/seat for ${tool.seats} seat(s) — Pro at $15/seat saves $${(35 - 15) * tool.seats}/mo.`, 'high', 'downgrade', proCost);
  }
  return null;
}

// ─── Overlap / consolidation rules ──────────────────────────────────────────

function detectOverlaps(tools: AuditTool[]): Recommendation[] {
  const recs: Recommendation[] = [];

  const codingTools: ToolName[] = ['Cursor', 'GitHub Copilot', 'Windsurf'];
  const paidCodingTools = tools.filter(
    (t) => codingTools.includes(t.tool) && computeToolSpend(t) > 0
  );
  if (paidCodingTools.length >= 2) {
    const cheapest = [...paidCodingTools].sort((a, b) => computeToolSpend(a) - computeToolSpend(b))[0];
    const toCancel = paidCodingTools.filter((t) => t.id !== cheapest.id);
    for (const t of toCancel) {
      const spend = computeToolSpend(t);
      recs.push({
        toolId: t.id,
        toolName: t.tool,
        currentPlan: t.plan,
        recommendedPlan: 'Cancel',
        currentSpend: spend,
        recommendedSpend: 0,
        monthlySavings: spend,
        annualSavings: spend * 12,
        reason: `You're paying for ${paidCodingTools.length} coding AI tools. Engineers typically use one 80%+ of the time. Consolidate to ${cheapest.tool} and eliminate ${t.tool}.`,
        priority: 'high',
        type: 'consolidate',
      });
    }
  }

  const chatTools: ToolName[] = ['ChatGPT', 'Claude', 'Gemini'];
  const paidChatTools = tools.filter(
    (t) => chatTools.includes(t.tool) && computeToolSpend(t) > 0
  );
  if (paidChatTools.length >= 3) {
    const mostExpensive = [...paidChatTools].sort((a, b) => computeToolSpend(b) - computeToolSpend(a))[0];
    const spend = computeToolSpend(mostExpensive);
    recs.push({
      toolId: mostExpensive.id,
      toolName: mostExpensive.tool,
      currentPlan: mostExpensive.plan,
      recommendedPlan: 'Cancel',
      currentSpend: spend,
      recommendedSpend: 0,
      monthlySavings: spend,
      annualSavings: spend * 12,
      reason: `Paying for 3+ chat AI tools (${paidChatTools.map((t) => t.tool).join(', ')}). Pick 1 primary, cancel the others. You likely use one tool 70%+ of the time.`,
      priority: 'high',
      type: 'consolidate',
    });
  }

  return recs;
}

// ─── Savings score ───────────────────────────────────────────────────────────

function computeScore(savingsRate: number): number {
  // 0% waste = 100 score, 50%+ waste = 30 score
  if (savingsRate <= 0) return 98;
  if (savingsRate >= 50) return 30;
  return Math.round(98 - savingsRate * 1.36);
}

// ─── Main engine ─────────────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const recommendations: Recommendation[] = [];

  for (const tool of input.tools) {
    let r: Recommendation | null = null;
    switch (tool.tool) {
      case 'ChatGPT': r = auditChatGPT(tool, input.teamSize); break;
      case 'Claude': r = auditClaude(tool, input.teamSize); break;
      case 'Cursor': r = auditCursor(tool, input.teamSize); break;
      case 'GitHub Copilot': r = auditGitHubCopilot(tool, input.teamSize); break;
      case 'Gemini': r = auditGemini(tool); break;
      case 'Windsurf': r = auditWindsurf(tool, input.teamSize); break;
    }
    if (r && r.monthlySavings > 0) recommendations.push(r);
  }

  const overlapRecs = detectOverlaps(input.tools);
  // Avoid double-counting: skip overlap rec if tool already has individual rec
  const existingIds = new Set(recommendations.map((r) => r.toolId));
  for (const r of overlapRecs) {
    if (!existingIds.has(r.toolId)) recommendations.push(r);
  }

  // Sort: high priority first, then by savings desc
  recommendations.sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
    return b.monthlySavings - a.monthlySavings;
  });

  const totalCurrentSpend = input.tools.reduce((s, t) => s + computeToolSpend(t), 0);
  const totalMonthlySavings = recommendations.reduce((s, r) => s + r.monthlySavings, 0);
  const totalOptimalSpend = Math.max(0, totalCurrentSpend - totalMonthlySavings);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const savingsRate = totalCurrentSpend > 0 ? (totalMonthlySavings / totalCurrentSpend) * 100 : 0;
  const savingsScore = computeScore(savingsRate);

  return {
    id: uuidv4(),
    input,
    totalCurrentSpend,
    totalOptimalSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsScore,
    savingsRate,
    recommendations,
    createdAt: new Date().toISOString(),
  };
}

export function generateFallbackSummary(result: AuditResult): string {
  const { totalMonthlySavings, totalAnnualSavings, savingsRate, recommendations, input } = result;
  if (totalMonthlySavings === 0) {
    return `Your AI stack of ${input.tools.length} tool(s) appears well-optimized for your team size of ${input.teamSize}. No major savings opportunities were found. Revisit when your team grows or when vendors update pricing.`;
  }
  const topRec = recommendations[0];
  return `Your AI stack is leaking an estimated $${totalMonthlySavings}/month — $${totalAnnualSavings.toLocaleString()} annually. That's ${savingsRate.toFixed(0)}% of your current AI spend going to waste. The biggest opportunity: ${topRec.toolName} (${topRec.currentPlan} → ${topRec.recommendedPlan}), saving $${topRec.monthlySavings}/month. With ${recommendations.length} optimization${recommendations.length > 1 ? 's' : ''} applied, your team could redirect that budget toward growth, hiring, or infrastructure.`;
}
