# Metrics — AI Spend Audit

## North Star Metric

**Total savings generated** (sum of `total_monthly_savings` across all audits × 12)

This metric:
- Grows with both new users AND better audit accuracy
- Directly represents user value
- Is shareable ("AI Spend Audit has helped startups find $X in annual savings")
- Correlates with retention (users who found real savings come back when they add new tools)

---

## Primary Metrics

### Acquisition

| Metric | Target (Month 1) | Target (Month 3) | Target (Month 6) |
|--------|-----------------|-----------------|-----------------|
| Unique visitors | 2,000 | 8,000 | 25,000 |
| Audits started | 600 | 2,400 | 7,500 |
| Audits completed | 400 | 1,600 | 5,000 |
| Audit completion rate | 67% | 67% | 67% |
| Leads captured (email) | 60 | 320 | 1,250 |
| Lead capture rate | 15% | 20% | 25% |

### Engagement

| Metric | Definition | Target |
|--------|-----------|--------|
| Avg tools per audit | Mean tools entered | ≥ 3.0 |
| Avg savings per audit | Mean monthly savings | ≥ $150 |
| Report share rate | % who copy share link | ≥ 20% |
| Return audit rate | % who run 2nd audit | ≥ 15% |
| Time to complete audit | P50 time from start → results | ≤ 4 min |

### Retention

| Metric | Definition | Target |
|--------|-----------|--------|
| 30-day re-audit rate | Users who audit again in 30 days | ≥ 12% |
| Email open rate | For report confirmation email | ≥ 45% |
| Email click rate | CTR on "View Full Report" | ≥ 25% |
| Shareable link views | Views per shared report | ≥ 2.5 |

---

## Funnel Analysis

```
Visitors (100%)
    ↓  70% start form
Audit started (70%)
    ↓  95% complete step 1 (tools)
    ↓  85% complete step 2 (team)
    ↓  95% run the audit
Audit completed (57%)
    ↓  25% capture email
Lead captured (14% of visitors)
    ↓  10% of leads upgrade (future)
Pro subscriber (~1.4% of visitors)
```

**Key drop-off points to monitor:**
1. Landing → start: hero CTA click rate
2. Step 1 → Step 2: tool selection completion
3. Results → Lead: email capture conversion
4. Lead → Share: report share rate

---

## Product Analytics Events

Implement with Plausible, Posthog, or Mixpanel:

### Track

```javascript
// Audit events
track('audit_started')
track('tool_added', { tool_name, plan })
track('tool_removed', { tool_name })
track('step_completed', { step: 1 | 2 | 3 })
track('audit_run', { tool_count, total_spend })

// Results events
track('results_viewed', { monthly_savings, savings_score })
track('recommendation_viewed', { tool_name, priority, savings })
track('share_link_copied', { monthly_savings })
track('report_shared') // when /report/{id} is visited

// Lead events
track('lead_form_opened')
track('lead_submitted', { role, has_company })
track('email_confirmed') // via email pixel
```

### Key Ratios to Monitor

```
Audit completion rate = audits_completed / audits_started
Lead capture rate = leads / audits_completed
Share rate = share_link_copied / audits_completed
Viral coefficient = report_views_from_shared_links / total_audits
```

---

## Weekly Dashboard (Manual)

Track weekly in a spreadsheet:

| Week | Visitors | Audits | Leads | Avg Savings | Savings Generated | Top Traffic Source |
|------|----------|--------|-------|-------------|-------------------|--------------------|
| W1 | | | | | | |
| W2 | | | | | | |
| W3 | | | | | | |

---

## Database Queries for Metrics

```sql
-- Total audits and savings
SELECT 
  COUNT(*) as total_audits,
  SUM(total_monthly_savings) as total_monthly_savings,
  SUM(total_annual_savings) as total_annual_savings,
  AVG(total_monthly_savings) as avg_monthly_savings,
  AVG(savings_score) as avg_savings_score
FROM audits;

-- Audits per day (last 30 days)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as audits,
  SUM(total_monthly_savings) as savings
FROM audits
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Most common tools
SELECT 
  tool_name,
  COUNT(*) as frequency,
  AVG(monthly_spend) as avg_spend
FROM audit_tools
GROUP BY tool_name
ORDER BY frequency DESC;

-- Leads this week
SELECT COUNT(*) as leads_this_week
FROM leads
WHERE created_at >= DATE_TRUNC('week', NOW());

-- Avg savings by team size bucket
SELECT
  CASE 
    WHEN team_size = 1 THEN 'Solo'
    WHEN team_size BETWEEN 2 AND 5 THEN '2-5'
    WHEN team_size BETWEEN 6 AND 15 THEN '6-15'
    ELSE '16+'
  END as team_bucket,
  COUNT(*) as audits,
  AVG(total_monthly_savings) as avg_savings
FROM audits
GROUP BY team_bucket;

-- Top savings opportunities
SELECT
  tool_name,
  recommended_plan,
  COUNT(*) as frequency,
  AVG(monthly_savings) as avg_monthly_savings
FROM audit_results
WHERE monthly_savings > 0
GROUP BY tool_name, recommended_plan
ORDER BY frequency DESC
LIMIT 20;
```

---

## Alert Thresholds

Set up monitoring alerts if:

| Condition | Alert |
|-----------|-------|
| Audit completion rate drops below 50% | 🔴 Form may be broken |
| Zero audits in 6 hours | 🔴 Site may be down |
| API error rate > 5% | 🟡 Backend issues |
| OpenAI API errors > 10% | 🟡 Check key/quota |
| Lead capture rate drops below 5% | 🟡 Review CTA placement |
| Avg savings drops below $50 | 🟡 Review audit rules |
