# Reflection — AI Spend Audit

## What I Built

AI Spend Audit is a web application that helps startup teams analyze their AI tool spending and identify savings opportunities. Users enter their AI tools, plans, monthly costs, and team size. The audit engine applies business rules to detect overpaying, seat waste, plan mismatches, and duplicate tools. The output is a personalized results dashboard with monthly/annual savings, a savings score, prioritized recommendations, and a shareable report URL.

The product is free, requires no login, and runs the core audit engine client-side for instant results.

---

## Technical Decisions & Rationale

### Client-Side Audit Engine

The most important decision was running the audit engine in the browser (`lib/audit-engine.ts`) rather than on the server. This means results appear instantly with no network round-trip — the user clicks "Run Audit" and sees their results in under 1 second. The 900ms artificial delay on the button is actually a UX choice to make the computation feel substantive.

The trade-off: the business rules are visible in the client-side bundle. This is acceptable because the rules are based on publicly available pricing and aren't a competitive secret. The Python backend engine mirrors all rules for API access and data persistence.

### No Authentication

Removing auth from the MVP eliminates the single biggest conversion friction point. The value is front-loaded: you see your savings before you give us anything. The lead capture (email) is optional and appears after the result. This is the Ramp / Linear school of product design: earn trust before asking for commitment.

### Supabase Over Raw PostgreSQL

Supabase gives us a hosted PostgreSQL database, auto-generated REST API, row-level security, and a generous free tier. For a launch-stage product, this eliminates the operational overhead of managing a database while keeping full SQL control. The schema uses standard PostgreSQL — if we ever need to migrate off Supabase, it's a standard dump/restore.

### Recharts Over D3

Recharts provides a React-native chart API built on D3 under the hood. For the audit dashboard's needs (bar charts, pie charts), Recharts is significantly faster to implement correctly than raw D3 without sacrificing the visual quality needed for a "screenshot-worthy" results page.

---

## What Worked Well

**The SavingsGauge sidebar** became the most engaging element unexpectedly. When users add tools and immediately see "You could save $X/mo" update in real time, it creates a compelling pull to keep adding more tools. It gamifies the input process. This was a late addition and probably doubled engagement with the audit form.

**Hyper-specific testimonials** work better than generic ones. "I had no idea we were paying for Cursor Business when only 2 of our 5 devs were actually using it" feels real because it describes a specific, recognizable scenario. Generic testimonials ("This saved us money!") are filtered out by skeptical readers.

**The tool pricing research** grounded everything. Before writing a single line of code, documenting every plan name, price, and per-seat vs. flat pricing for all 8 tools made the audit engine rules precise. Vague rules ("maybe they're overpaying") produce useless recommendations. Precise rules ("ChatGPT Team with ≤1 seat → Plus saves $10/mo") produce actionable ones.

**Dark results header** creates a sense of authority and finality. The charcoal banner with animated KPI counters makes the results feel like a financial report, not a SaaS dashboard. This was a conscious brand choice: financial intelligence, premium consulting aesthetic.

---

## What I'd Improve

**More tool coverage.** The current 8 tools cover the most common AI spend, but many teams also pay for Notion AI ($10/mo), Perplexity Pro ($20/mo), Midjourney ($10–120/mo), GitHub Models, Groq, and various specialized tools. Each additional tool requires pricing research, plan data, and new audit rules.

**Usage context.** The current audit only knows what you're paying and how many seats — not how much you're actually using each tool. A tool at 10% utilization is wasteful even if it's on the right plan. Future version: ask "How often do you use this tool?" (daily/weekly/monthly/rarely) and factor utilization into recommendations.

**Comparison benchmarks.** "Here's what companies at your stage typically spend on AI tools" would add powerful context to individual results. Showing "you spend $400/mo on AI tools, median for a 5-person dev team is $160/mo" is more motivating than abstract recommendations.

**Export options.** The shareable report link is good for sharing with a co-founder. But a CFO or board member wants a PDF. Adding PDF export (probably via Puppeteer on the backend or a simple browser print stylesheet) would improve the product's usefulness in professional contexts.

**Email sequence.** Currently we send one email on lead capture. A smart sequence could be: (1) immediate confirmation with report link, (2) 7-day follow-up with AI pricing news, (3) 30-day "prices have changed, time to re-audit." This would dramatically increase the product's lifetime value to users.

---

## Business Model Considerations

The free audit creates natural upgrade moments:

1. **Affiliate/referral revenue** — linking to downgrade paths ("Switch to Claude Pro → save $X") with tracked affiliate links to each vendor
2. **Pro tier** — scheduled re-audits, team dashboards, CSV exports, Slack notifications for price changes
3. **API access** — companies building internal spend management tools could pay for programmatic audit access
4. **B2B version** — MSPs and IT consultancies auditing AI spend across client portfolios

The lead capture is the foundation for all of these. Every email collected is a user who has self-identified as an AI tool buyer with quantified savings potential. That's a highly qualified list.

---

## What I Learned

**Audit products are about psychology as much as data.** The savings number needs to feel surprising but credible. Too small and users think "not worth the effort." Too large and they don't believe it. The $400–$2,400 range we use in marketing is specific because it's based on real overspend scenarios we've observed.

**The recommendation quality is everything.** A recommendation that says "consider downgrading" is worthless. A recommendation that says "ChatGPT Team requires a minimum of 2 seats — with 1 seat you're paying $30/mo for a plan designed for teams. Individual Plus at $20/mo is identical for a solo user. You'd save $10/mo, $120/year." — that's actionable. Specificity is the product.

**Instant results beat perfect results.** The client-side engine produces results in milliseconds. We could have built a more sophisticated ML-based model on the backend, but users would have waited 3–5 seconds for it. Instant gratification with 90% accuracy beats 95% accuracy with friction.
