export type ToolName =
  | 'ChatGPT'
  | 'Claude'
  | 'Cursor'
  | 'Gemini'
  | 'GitHub Copilot'
  | 'OpenAI API'
  | 'Anthropic API'
  | 'Windsurf';

export type UseCase = 'Coding' | 'Writing' | 'Research' | 'Data Analysis' | 'Mixed';

export interface ToolPlan {
  name: string;
  price: number;
  priceUnit: 'flat' | 'per_seat';
  minSeats?: number;
  description?: string;
}

export interface AuditTool {
  id: string;
  tool: ToolName;
  plan: string;
  monthlySpend: number;
  seats: number;
  useCase?: UseCase;
}

export interface AuditInput {
  tools: AuditTool[];
  teamSize: number;
  useCase: UseCase;
  companyName?: string;
}

export interface Recommendation {
  toolId: string;
  toolName: ToolName;
  currentPlan: string;
  recommendedPlan: string;
  currentSpend: number;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  type: 'downgrade' | 'upgrade' | 'consolidate' | 'cancel' | 'ok';
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  totalCurrentSpend: number;
  totalOptimalSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsScore: number;
  savingsRate: number;
  recommendations: Recommendation[];
  aiSummary?: string;
  createdAt: string;
}

export const TOOL_PLANS: Record<ToolName, ToolPlan[]> = {
  ChatGPT: [
    { name: 'Plus', price: 20, priceUnit: 'flat', description: '1 user, GPT-4o' },
    { name: 'Team', price: 30, priceUnit: 'per_seat', minSeats: 2, description: '2+ seats, shared workspace' },
    { name: 'Enterprise', price: 60, priceUnit: 'per_seat', description: 'Custom, SSO, admin' },
  ],
  Claude: [
    { name: 'Pro', price: 20, priceUnit: 'flat', description: '1 user, 5x usage' },
    { name: 'Max (5x)', price: 100, priceUnit: 'flat', description: '1 user, 5x Pro usage' },
    { name: 'Max (20x)', price: 200, priceUnit: 'flat', description: '1 user, 20x Pro usage' },
    { name: 'Team', price: 30, priceUnit: 'per_seat', minSeats: 5, description: 'Pooled usage, admin' },
    { name: 'Enterprise', price: 60, priceUnit: 'per_seat', description: 'Custom, SSO' },
  ],
  Cursor: [
    { name: 'Hobby', price: 0, priceUnit: 'flat', description: 'Free tier, limited' },
    { name: 'Pro', price: 20, priceUnit: 'flat', description: '1 user, unlimited' },
    { name: 'Business', price: 40, priceUnit: 'per_seat', description: 'SSO, admin, privacy' },
    { name: 'Enterprise', price: 60, priceUnit: 'per_seat', description: 'Custom, audit logs' },
  ],
  Gemini: [
    { name: 'Pro (Free)', price: 0, priceUnit: 'flat', description: 'Free Gemini 1.5 Pro' },
    { name: 'Ultra', price: 22, priceUnit: 'flat', description: 'Gemini Ultra + extras' },
  ],
  'GitHub Copilot': [
    { name: 'Individual', price: 10, priceUnit: 'flat', description: '1 user, all IDEs' },
    { name: 'Business', price: 19, priceUnit: 'per_seat', description: 'Admin controls, policy' },
    { name: 'Enterprise', price: 39, priceUnit: 'per_seat', description: 'Fine-tuned, audit' },
  ],
  'OpenAI API': [
    { name: 'Pay-as-you-go', price: 0, priceUnit: 'flat', description: 'Usage-based billing' },
    { name: 'Prepaid Credits', price: 0, priceUnit: 'flat', description: 'Pre-purchased credits' },
  ],
  'Anthropic API': [
    { name: 'Pay-as-you-go', price: 0, priceUnit: 'flat', description: 'Usage-based billing' },
    { name: 'Prepaid Credits', price: 0, priceUnit: 'flat', description: 'Pre-purchased credits' },
  ],
  Windsurf: [
    { name: 'Free', price: 0, priceUnit: 'flat', description: 'Limited completions' },
    { name: 'Pro', price: 15, priceUnit: 'flat', description: '1 user, unlimited' },
    { name: 'Teams', price: 35, priceUnit: 'per_seat', description: 'Admin, shared context' },
  ],
};

export const TOOL_COLORS: Record<ToolName, string> = {
  ChatGPT: '#10A37F',
  Claude: '#CC785C',
  Cursor: '#1F2937',
  Gemini: '#4285F4',
  'GitHub Copilot': '#24292E',
  'OpenAI API': '#10A37F',
  'Anthropic API': '#CC785C',
  Windsurf: '#7C3AED',
};
