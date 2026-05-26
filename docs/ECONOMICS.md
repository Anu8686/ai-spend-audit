# Economics — AI Spend Audit

## Unit Economics

### Infrastructure Cost Per Audit

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (frontend) | ~$0.000 | Free tier covers ~100K page views |
| Render (backend) | ~$0.001 | Free tier handles ~10K requests/day |
| Supabase (database) | ~$0.000 | Free tier: 500MB, 2GB bandwidth |
| OpenAI GPT-4o-mini | ~$0.0003 | ~200 tokens prompt + 300 output |
| Resend (email) | ~$0.0008 | $0.80/1,000 emails |
| **Total per audit** | **~$0.002** | |

At 1,000 audits/month: **$2/month infrastructure cost**.  
At 10,000 audits/month on paid tiers: **~$150/month** (Vercel Pro + Render Starter + Supabase Pro).

### Revenue Potential

#### Model 1: Affiliate/Referral Links

Include tracked affiliate links in recommendations:
- "Switch to Cursor Pro → [link]" with Cursor affiliate program
- "Downgrade to ChatGPT Plus → [link]"

Estimated conversion: 5% of users who follow a recommendation  
Average affiliate value: $5–15 per conversion  
At 1,000 audits/mo, 500 recommendations followed, 5% conversion: **$125–375/mo**

#### Model 2: Pro Tier ($19/mo)

Features: scheduled re-audits, email alerts for price changes, PDF export, team dashboard  

Conversion rate from free: 2–5%  
At 1,000 monthly active audits, 3% conversion: **30 Pro subscribers = $570/mo**  
At 5,000 monthly audits: **150 subscribers = $2,850/mo**

#### Model 3: B2B / Team Plans ($99–299/mo)

For companies with 10+ employees wanting:
- Centralized AI spend tracking
- Monthly digest reports
- Slack notifications
- CSV/API export
- Custom tool support

At 10 B2B customers: **$990–2,990/mo**  
At 50 B2B customers: **$4,950–14,950/mo**

#### 12-Month Revenue Projection (Conservative)

| Month | MAU | Pro Users | B2B | Affiliate | Total MRR |
|-------|-----|-----------|-----|-----------|-----------|
| 1 | 500 | 0 | 0 | $75 | $75 |
| 2 | 1,200 | 5 | 0 | $180 | $275 |
| 3 | 2,000 | 15 | 1 | $300 | $880 |
| 6 | 5,000 | 50 | 5 | $750 | $3,245 |
| 9 | 10,000 | 120 | 12 | $1,500 | $7,068 |
| 12 | 20,000 | 280 | 25 | $3,000 | $15,320 |

---

## Value Created vs. Value Captured

| | Amount |
|-|--------|
| Average savings per audit | $180/mo |
| Average annual savings per user | $2,160 |
| **Value created per user** | **$2,160/year** |
| Max Pro subscription cost | $228/year |
| **Value captured (Pro)** | **$228/year = 10.5% of value created** |

This is a healthy ratio. Users keep 89.5% of the value. SaaS products at 10–20% value capture are sustainable and feel fair to customers.

---

## Comparable Products

| Product | Price | Value Delivered | Capture Rate |
|---------|-------|-----------------|--------------|
| Ramp | Free (makes money on cards) | Expense optimization | ~5% |
| TurboTax | $50–120 | Tax savings | Varies |
| Honey | Free (affiliate) | Shopping savings | ~2% |
| **AI Spend Audit** | Free→$19/mo | $2,160/yr savings | ~10% |

---

## Cost Sensitivity Analysis

**Break-even (paid tier):**  
Render Starter ($25/mo) + Supabase Pro ($25/mo) + domain ($15/yr) ≈ **$52/mo fixed cost**  
Need: 3 Pro subscribers to break even on infrastructure.

**Scale costs:**  
At 50,000 audits/month:
- OpenAI: ~$15/mo
- Supabase Pro: $25/mo
- Render Starter/Standard: $25–50/mo
- Vercel Pro: $20/mo
- Total: ~$85–110/mo

The business is fundamentally low-cost. The main scaling cost is OpenAI for AI summaries, but at $0.0003 per audit it barely registers.

---

## LTV / CAC Analysis

**Acquisition:**  
- Organic/viral: $0 CAC
- Twitter ads (if used): ~$3–8 CAC for free users, ~$80–150 for Pro conversions
- Product Hunt: ~$0.10/visitor, $5–15/email captured

**LTV (Pro user):**  
- Monthly churn rate estimate: 5–8%
- Average lifetime: 12–20 months
- LTV at $19/mo, 15-month avg lifetime: **$285**
- LTV/CAC at $100 CAC: **2.85× — viable**
- LTV/CAC at $0 organic: **∞ — ideal**

**Conclusion:** Organic acquisition via shareability is the core growth driver. Keep CAC at or near zero by making the shareable report the primary distribution mechanism. Every audit creates a potential organic acquisition channel.
