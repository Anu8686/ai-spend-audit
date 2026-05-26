# Pricing Data — AI Spend Audit

*Last verified: 2025. Prices subject to change. Always verify at vendor's official pricing page.*

---

## ChatGPT (OpenAI)

| Plan | Price | Billing | Min Seats | Key Features |
|------|-------|---------|-----------|--------------|
| Free | $0 | — | 1 | GPT-4o limited |
| Plus | $20/mo | Per user, flat | 1 | GPT-4o, plugins, DALL-E |
| Team | $30/seat/mo | Per seat | 2 | Shared workspace, admin console, higher limits |
| Enterprise | Custom (~$60+/seat) | Annual contract | 10+ | SSO, compliance, custom GPTs, unlimited |

**Audit signals:**
- Team with 1 seat → Plus
- Team with ≤3 total members → N× Plus often cheaper
- Enterprise with <10 users → Team

**Source:** openai.com/pricing

---

## Claude (Anthropic)

| Plan | Price | Billing | Min Seats | Key Features |
|------|-------|---------|-----------|--------------|
| Free | $0 | — | 1 | Claude 3.5 Haiku, limited |
| Pro | $20/mo | Per user, flat | 1 | Claude 3.5 Sonnet, 5× usage |
| Max (5×) | $100/mo | Per user, flat | 1 | 5× Pro usage |
| Max (20×) | $200/mo | Per user, flat | 1 | 20× Pro usage |
| Team | $30/seat/mo | Per seat | 5 | Pooled usage, admin, Projects |
| Enterprise | Custom (~$60+/seat) | Annual | 10+ | SSO, audit logs, custom |

**Audit signals:**
- Team with <5 seats → individual Pro
- Max (20×) solo → evaluate if hitting 5× cap first
- Enterprise <10 users → Team

**Source:** anthropic.com/pricing

---

## Cursor

| Plan | Price | Billing | Key Features |
|------|-------|---------|--------------|
| Hobby | $0 | Free | 2,000 completions/mo, limited Sonnet |
| Pro | $20/mo | Per user, flat | Unlimited completions, Claude Sonnet, GPT-4o |
| Business | $40/seat/mo | Per seat | SSO, admin, privacy mode, centralized billing |
| Enterprise | Custom (~$60+/seat) | Annual | Audit logs, custom models, SLA |

**Audit signals:**
- Business with ≤2 seats → Pro (no SSO needed)
- Enterprise <15 users → Business

**Source:** cursor.com/pricing

---

## GitHub Copilot (Microsoft)

| Plan | Price | Billing | Key Features |
|------|-------|---------|--------------|
| Free | $0 | — | 2,000 completions/mo (new accounts) |
| Individual | $10/mo | Per user, flat | All IDEs, chat, CLI |
| Business | $19/seat/mo | Per seat | Policy management, audit logs, IP protection |
| Enterprise | $39/seat/mo | Per seat | Fine-tuned models, knowledge bases |

**Audit signals:**
- Business with 1 seat → Individual ($9/mo savings)
- Enterprise <20 devs → Business (fine-tuning ROI needs scale)

**Source:** github.com/features/copilot

---

## Gemini (Google)

| Plan | Price | Billing | Key Features |
|------|-------|---------|--------------|
| Pro (Free) | $0 | — | Gemini 1.5 Pro, 1M context |
| Ultra | $22/mo | Per user, flat | Gemini Ultra, Google One 2TB, extras |

**Audit signals:**
- Ultra → always evaluate if you actually use Ultra-specific features
- Free Pro is genuinely capable; Ultra is premium for power users

**Source:** one.google.com/about/gemini

---

## OpenAI API

| Tier | Price | Model | Notes |
|------|-------|-------|-------|
| GPT-4o | $2.50/1M input, $10/1M output | Latest flagship | |
| GPT-4o-mini | $0.15/1M input, $0.60/1M output | Fast, cheap | Most API use cases |
| o1 | $15/1M input, $60/1M output | Reasoning model | |
| o3-mini | $1.10/1M input, $4.40/1M output | Fast reasoning | |
| Embeddings (text-3-small) | $0.02/1M tokens | | |
| DALL-E 3 | $0.04–0.12/image | | |

**Audit signals:**
- High monthly API spend → review model selection (gpt-4o-mini vs gpt-4o)
- Batch API offers 50% discount for non-realtime workloads
- Consider caching repeated prompts

**Source:** openai.com/pricing

---

## Anthropic API

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| Claude 3.5 Sonnet | $3/1M | $15/1M | Best quality |
| Claude 3.5 Haiku | $0.80/1M | $4/1M | Fast, cheap |
| Claude 3 Opus | $15/1M | $75/1M | Highest capability |

**Audit signals:**
- Heavy Claude Opus use → evaluate if Sonnet handles 90% of tasks
- Batch API available for async workloads at 50% discount

**Source:** anthropic.com/pricing

---

## Windsurf (Codeium)

| Plan | Price | Billing | Key Features |
|------|-------|---------|--------------|
| Free | $0 | — | Basic completions, limited flows |
| Pro | $15/mo | Per user, flat | Unlimited Flows, fast completions |
| Teams | $35/seat/mo | Per seat | Admin, shared context, SSO |

**Audit signals:**
- Teams with ≤2 seats → Pro (no admin needed)
- Often used alongside Cursor → overlap opportunity

**Source:** codeium.com/pricing

---

## Summary: Common Overspend Scenarios

| Scenario | Monthly Overspend | Annual |
|----------|------------------|--------|
| Solo on ChatGPT Team | $10/mo | $120 |
| 3-person team on ChatGPT Team (vs 3× Plus) | $30/mo | $360 |
| Cursor Business, 1 seat (vs Pro) | $20/mo | $240 |
| Copilot Business, 1 seat (vs Individual) | $9/mo | $108 |
| Gemini Ultra (vs free Pro) | $22/mo | $264 |
| Cursor + Copilot both paid (overlap) | $10–40/mo | $120–480 |
| 3 chat AI tools paid simultaneously | $20–60/mo | $240–720 |
| Claude Team with 2 seats (vs 2× Pro) | $20/mo | $240 |

**Typical combined overspend for a 3–5 person startup: $80–200/mo ($960–2,400/yr)**
