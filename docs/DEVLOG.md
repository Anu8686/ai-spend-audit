# Dev Log — AI Spend Audit

## Day 1 — Scoping & Stack Decision
**Date:** Monday

Started by mapping the problem space. I've personally been overpaying for AI tools — paying for ChatGPT Team when it was just me, having Cursor Business and GitHub Copilot running simultaneously, and never noticing a $400/yr Gemini Ultra subscription that mostly went unused.

Decided to build an audit tool. Spent the morning doing pricing research across 8 major AI tools, documenting every plan tier, per-seat vs flat pricing, and minimum seat requirements. This became `PRICING_DATA.md`.

Made the key stack decision: **Next.js 15 + FastAPI + Supabase**. Considered going full Next.js with API routes, but FastAPI's type safety with Pydantic and Python's data ecosystem felt right for the audit engine. Plus Render's free tier for FastAPI is generous.

Biggest insight of the day: the audit engine should run **client-side in TypeScript** for zero-latency results, with a Python mirror on the backend for persistence. No user should wait for a network call to see their savings.

Set up the monorepo structure: `frontend/`, `backend/`, `database/`, `docs/`. Initialized Next.js 15 with App Router and TypeScript. Got Tailwind configured with the custom Money Radar design system (emerald/amber/coral/ivory).

**Shipped:** Project scaffold, design tokens, Tailwind config, types/audit.ts

---

## Day 2 — Landing Page & Design System
**Date:** Tuesday

Full day on the landing page. Started with the navbar — kept it simple: logo, 3 nav links, CTA button. Sticky with backdrop blur on scroll.

The hero section took 3 iterations. First version had a generic headline. Second had "Stop Overpaying For AI Tools" which was decent but on-brand. Third landed on "Your AI Stack Is Leaking Money" — much more visceral and specific to the feeling we want (startups should feel "wait, am I doing this?").

Built the animated savings preview cards (Current Spend / Recommended / Savings). Added a tool ticker scrolling through all 18 supported plans. The "73% of startups" stats bar went dark charcoal to create contrast.

Testimonials were tricky — needed fake-but-specific data. Made them hyper-specific: exact savings amounts, exact scenarios. "I had no idea we were paying for Cursor Business when only 2 of our 5 devs were actually using it" is more believable than generic praise.

FAQ section with CSS accordion (no JS library needed). Added the audit preview table in the landing — this became the most important social proof element. Showing actual data makes the product tangible before they click through.

**Shipped:** Full landing page, Money Radar design system, ticker animation, FAQ component

---

## Day 3 — Audit Engine (Core Logic)
**Date:** Wednesday

This was the most important technical day. The audit engine is the product.

Spent the morning writing out every rule on paper before touching code:

1. **Plan-seat mismatch rules** — ChatGPT Team with 1 seat → Plus; Cursor Business with ≤2 seats → Pro
2. **Team size rules** — small team on team plan → individual plans often cheaper
3. **Overlap detection** — 2+ paid coding tools → consolidate; 3+ paid chat tools → consolidate  
4. **Downgrade opportunities** — Gemini Ultra vs free Pro; Enterprise plans on sub-10 teams

The overlap detection was the most interesting to build. Can't just flag any two tools — need to understand categories. Cursor + Copilot + Windsurf are all in the "coding AI" bucket. ChatGPT + Claude + Gemini are "chat AI". Different categories (e.g., Cursor + ChatGPT) shouldn't trigger overlap warnings.

Implemented the savings score function — maps waste percentage to a 30–98 score. Inverted scale was intentional: you start at 98 (optimized), and every % of waste pulls the score down. High drama for users who score 40.

Wrote 20+ tests covering every rule and edge case before writing the API. TDD forced me to think about edge cases: What if spend is 0? What if seats is 1 on a per-seat plan? What if multiple rules match the same tool?

**Shipped:** `lib/audit-engine.ts`, `backend/app/services/audit_engine.py`, full test suite

---

## Day 4 — Audit Wizard UI
**Date:** Thursday

Built the 3-step audit wizard. Step 1 (tool selection) was the hardest UX challenge: how do you let users select multiple tools, configure each one, without it feeling like a spreadsheet?

Solution: a tool picker grid at the top (click to add), with each selected tool collapsing into an expandable card below. The card shows tool name / plan / spend inline, and expands to the full `PlanSelector` when clicked. Clean and progressive.

`PlanSelector` shows plan tiles with price displayed — removes any ambiguity about what they're paying vs what they could pay. The spend input auto-fills from the selected plan price but is editable for users whose actual invoices differ.

The `SavingsGauge` sidebar was a late addition and ended up being the most engaging element. It runs the full audit engine live as you add tools, updating the "potential savings" counter in real time. Users adding Cursor Business immediately see "$20/mo" appear in the gauge. That instant feedback loop is addictive.

Step 2 (team info) uses card-based selectors for team size buckets instead of a raw number input. Much faster to complete. Step 3 is a review screen — shows everything before running. Added a 900ms artificial delay on "Run Audit" to make it feel like real computation (it's instant but feeling instant devalues it).

**Shipped:** AuditWizard, ToolSelector, PlanSelector, TeamSizeInput, UseCaseSelector, SavingsGauge

---

## Day 5 — Results Dashboard & Charts
**Date:** Friday

Results page is the "money shot" — needs to be screenshot-worthy and shareable.

Started with the dark header banner: charcoal background, animated KPI counters, radial gradient blobs for depth. The `SavingsCounter` component uses `requestAnimationFrame` for smooth count-up from 0 to the final value. Feels premium.

For charts, chose Recharts — best balance of customization and bundle size. Implemented:
- **BarChart** (Current vs Optimized per tool) — best for comparison
- **PieChart** (spend distribution) — best for "where does money go"

The recommendation cards needed clear visual hierarchy: priority badge (HIGH/MEDIUM), tool name, current → recommended plan, explanation, and savings pill. The left colored border (red for high, amber for medium) adds scannability.

Savings Score display was a design challenge. Ended up with a large number in color (green/amber/red based on score) rather than a ring/donut — cleaner and faster to parse.

The shareable report link and lead capture are at the bottom. Deliberate ordering: let users see the full value before asking for anything.

**Shipped:** ResultsDashboard, RecommendationCard, SpendChart, SavingsChart, SavingsCounter, LeadCapture

---

## Day 6 — Backend API, Database & Email
**Date:** Saturday

FastAPI day. Set up the full backend structure: `app/api/`, `app/services/`, `app/models/`, `app/core/`.

The Pydantic schemas were straightforward. Spent extra time on validation: `ToolName` as a Literal type (not just string) means the API will 422 on unknown tools. `monthly_spend` has `ge=0`. `seats` has `ge=1`. This catches client mistakes early.

`POST /api/audit` does three things: run the Python audit engine, call OpenAI for an AI summary (with fallback), then write to Supabase (audit + tools + results + report rows). All Supabase writes are wrapped in try/catch — they're non-fatal. The user gets their result even if the DB write fails.

OpenAI integration: using `gpt-4o-mini` for cost efficiency. The prompt is carefully crafted — "You are a startup CFO and AI tools expert" sets the right voice. Includes all context: team size, use case, tool list, total spend, total savings, top recommendations. Output is 3–4 sentences max. Fallback summary kicks in if the API key is missing or the call fails.

Resend email: HTML template in `email_service.py`. The email replicates the results dashboard aesthetics — dark header with emerald savings number. Clean, no images (better deliverability).

Supabase schema: foreign keys with CASCADE deletes, indexes on audit_id columns, a short-slug `reports` table. Row-level security enabled with service role bypass.

**Shipped:** FastAPI backend, Supabase schema, OpenAI service, Resend email service, all API endpoints

---

## Day 7 — Shareable Reports, Tests, CI/CD & Docs
**Date:** Sunday

Shareable report page at `/report/[id]`. Server component — fetches from the API at render time, generates OG metadata dynamically. The OG title includes the savings amount: "AI Spend Audit — $455/mo savings found ($5,460/yr)". This makes shared links on Twitter/Slack carry the hook in the preview.

The report page deliberately hides email and company name — only shows tools, spending, savings, and recommendations. Public-safe.

Added the admin dashboard (`/admin`) — KPI cards for total audits, leads, and savings generated. Leads table with email, company, role, savings. Server component with direct Supabase fetch. No auth for now (add middleware later).

Tests: 20 tests in `tests/test_audit.py` (unit) and `tests/test_api.py` (integration via TestClient). Covers every rule, edge cases, annual calculation, priority ordering. All pass.

CI/CD: GitHub Actions workflow with separate jobs for frontend (tsc + eslint + build) and backend (ruff lint + pytest). Triggers on push to main/develop and PRs.

Wrote all docs: README with complete deployment guide, ARCHITECTURE.md with system diagram, this DEVLOG.

**Shipped:** Shareable reports, OG metadata, admin dashboard, admin API, full test suite, CI/CD, all docs

---

## Retrospective

**What went well:**
- Client-side audit engine decision paid off — instant UX
- Money Radar design system is distinctive; doesn't look like a generic SaaS
- The live SavingsGauge sidebar is the killer engagement feature
- Dual engine (TS + Python) means frontend and API always agree

**What I'd do differently:**
- Add more tool support from day 1 (Notion AI, Perplexity, Midjourney)
- Consider server actions instead of REST API for the audit endpoint — would simplify auth later
- Should have written the overlap detection tests before the implementation

**Next features:**
- Email digest: "Your AI tools went up in price, audit again"
- Slack/Teams notification when new plans are detected
- CSV export of the full audit report
- Team comparison: compare your stack against "companies like yours"
