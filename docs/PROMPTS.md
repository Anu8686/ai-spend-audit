# Prompts — AI Spend Audit

All prompts used in the product and their design rationale.

---

## 1. AI Audit Summary (Production)

**File:** `backend/app/services/openai_service.py`  
**Model:** `gpt-4o-mini`  
**Tokens:** ~300 max output  
**Temperature:** 0.7

```
You are a startup CFO and AI tools expert. Analyze this AI spending audit and write a concise, personalized 3-4 sentence summary.

Team: {team_size} people, primary use case: {use_case}
Current AI stack: {tools_summary}
Total current spend: ${total_current_spend}/mo
Total savings found: ${total_monthly_savings}/mo (${total_annual_savings}/year)
Savings rate: {savings_rate}%

Top recommendations:
{recs_summary}

Write a confident, direct analysis. Mention the biggest waste, the smartest action to take, and the annual financial impact. Speak to a startup founder or CTO. No fluff.
```

**Design decisions:**
- "startup CFO and AI tools expert" persona produces authoritative, specific language
- "No fluff" instruction cuts hedging and filler phrases
- "Speak to a startup founder or CTO" sets the right register (direct, business-focused)
- Limiting to 3–4 sentences keeps the summary scannable; users won't read a wall of text
- Temperature 0.7 balances consistency with natural variation across users
- All key numbers injected: model can't hallucinate the savings figures

**Fallback (no API key):**
```
Your AI stack is leaking ${savings}/month — ${annual}/year. That's {rate}% of your current AI budget 
going to waste. The highest-impact action: {top_tool} ({current_plan} → {recommended_plan}), 
saving ${top_savings}/month. With {N} optimizations applied, you could redirect that budget 
toward growth, hiring, or infrastructure.
```

---

## 2. Tool Overlap Detection Prompt (Internal reasoning)

Not an API call — this is the internal reasoning framework used when writing the overlap detection rules:

```
For each pair of AI tools in the user's stack, ask:
1. Do they solve the same primary use case? (coding assistance, chat/writing, image gen)
2. Is there a realistic scenario where someone uses both productively?
3. What's the most expensive one to cancel that doesn't hurt the user?

Coding tools (Cursor, Copilot, Windsurf):
- All provide inline completions + chat in IDE
- Most engineers use one tool 80%+ of the time
- The cheapest that matches the team's capability should be kept
- Cursor Business + Copilot Business = ~$59/seat/mo → likely $19-40/seat redundancy

Chat/writing tools (ChatGPT, Claude, Gemini):
- All provide conversational AI with similar capability
- Some power users legitimately switch between models for different tasks
- 3+ paid chat tools almost always indicates waste
- Flag the most expensive; keep the one with deepest workflow integration
```

---

## 3. Email Subject Lines (Tested variants)

**Winner (current):**
```
Your AI Spend Audit: ${savings}/mo in savings found
```

**Tested variants:**
```
You're leaving ${savings}/month on the table
AI tools audit complete — here's what we found
${company_name}, your AI stack analysis is ready
We found ${annual}/year in hidden AI spend
```

**Why winner works:** The number is in the subject line. The reader knows the value before opening. Specific over generic.

---

## 4. Landing Page Hero Copy (Tested variants)

**Winner:**
```
Your AI Stack Is Leaking Money
```

**Sub-headline:**
```
Discover hidden savings across ChatGPT, Claude, Cursor, Copilot, Gemini and more. 
Most startups overpay by $400–$2,400/year.
```

**Tested variants:**
```
Stop Overpaying For AI Tools               ← (now tagline, less visceral as hero)
You're Wasting Money on AI                 ← Too aggressive, accusatory
Are You Overpaying for AI?                 ← Question format, weaker than statement
AI Spend Intelligence for Startups        ← Too corporate, no emotion
Cut Your AI Bill in Half                   ← Hyperbolic, credibility hit
```

**Why winner works:** "Leaking" implies passive, unnoticed loss — which is exactly the user's situation. They're not making a bad decision; money is slipping through the cracks. Less accusatory than "you're wasting money," more visceral than "stop overpaying."

---

## 5. Recommendation Reason Templates

Used in `audit_engine.ts` and `audit_engine.py`. Structure: **observation → impact → action**.

```
ChatGPT Team, 1 seat:
"ChatGPT Team requires a minimum of 2 seats. With 1 seat, you're paying $30/mo for 
a plan designed for teams. Individual Plus at $20/mo is identical for a solo user."

Cursor Business, 2 seats:
"Cursor Business at $40/seat for {N} seat(s) includes SSO and admin controls — 
features you likely don't need at this team size. Pro at $20/seat delivers identical 
AI completions without the enterprise overhead."

Coding tool overlap:
"You're paying for {N} coding AI tools ({tool_list}). Engineers typically settle into 
one tool as their primary and use it 80%+ of the time. Consolidate to {cheapest_tool} 
and eliminate {tool_to_cancel}."

Gemini Ultra:
"Gemini Pro is free and provides access to Gemini 1.5 Pro with 1M context. 
Evaluate whether Ultra's additional capabilities ($22/mo) are actually used in 
your daily workflow before continuing."
```

---

## 6. OG Metadata Title Template

```
AI Spend Audit — ${monthly_savings}/mo savings found ($${annual_savings}/yr)
```

**When no savings:**
```
AI Spend Audit — Free AI Cost Analysis for Startups
```

**Why it works:** The share preview does the selling. When someone shares their report on Twitter/Slack, the card says "$455/mo savings found" — a hook that makes others want to check their own stack.

---

## 7. Savings Score Messaging

```python
score >= 80:  "Optimized"     → "Your stack is well-optimized. No major changes needed."
score >= 60:  "Needs Review"  → "Some improvements available. Review recommendations."
score < 60:   "Overpaying"    → "You're overpaying by ~{rate}%. Act on the high-priority items."
```

**Design:** Three tiers, not five. Five tiers requires more cognitive load to map to actions. Three tiers = clear green/amber/red traffic light.
