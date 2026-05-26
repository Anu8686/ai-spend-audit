# Architecture — AI Spend Audit

## Overview

AI Spend Audit is a full-stack SaaS application with a Next.js frontend, Python FastAPI backend, Supabase PostgreSQL database, and OpenAI for AI-powered summaries.

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│              Next.js 15 (Vercel)                             │
│                                                              │
│  app/                                                        │
│  ├── /          → Landing page (Server Component)            │
│  ├── /audit     → AuditWizard (Client Component)             │
│  ├── /results   → ResultsDashboard (Client Component)        │
│  ├── /report/[id] → Shareable Report (Server Component)      │
│  └── /admin     → Admin Dashboard (Server Component)         │
│                                                              │
│  lib/audit-engine.ts  ← Client-side rule engine             │
│  (runs in browser, no server round-trip needed)              │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (fetch)
┌────────────────────────▼────────────────────────────────────┐
│              FastAPI (Render)                                │
│                                                              │
│  POST /api/audit    ← Runs audit engine + AI summary        │
│  POST /api/leads    ← Captures lead + sends email           │
│  GET  /api/report/{id} ← Fetches shareable report           │
│  GET  /api/health   ← Health check                          │
│  GET  /api/admin/*  ← Admin stats (internal)                │
└────────────┬───────────────────────┬───────────────────────┘
             │                       │
┌────────────▼──────────┐  ┌────────▼───────────────────────┐
│   Supabase PostgreSQL  │  │   External Services             │
│                        │  │                                 │
│   audits               │  │   OpenAI GPT-4o-mini           │
│   audit_tools          │  │   → AI spend summaries          │
│   audit_results        │  │                                 │
│   leads                │  │   Resend                        │
│   reports              │  │   → Confirmation emails         │
└───────────────────────┘  └────────────────────────────────┘
```

---

## Data Flow

### Audit Flow (primary)

```
1. User fills AuditWizard (browser)
   ↓
2. Client-side audit-engine.ts runs instantly
   → Generates recommendations, savings, score
   → Stores result in localStorage
   ↓
3. Router pushes to /results
   ↓
4. ResultsDashboard reads from localStorage
   → Displays charts, recs, AI summary (fallback)
   ↓
5. (Optional) User submits email via LeadCapture
   → POST /api/leads
   → Supabase insert + Resend email
```

### Why client-side audit engine?

The audit rules are deterministic, fast, and don't require secrets. Running them in the browser means:
- **Zero latency** for results (no network round-trip)
- **Works offline** after initial page load
- **No server cost** for the core feature
- Backend engine exists as a mirror for API consumers and data persistence

---

## Key Design Decisions

### 1. Dual audit engine (TS + Python)

`lib/audit-engine.ts` and `backend/app/services/audit_engine.py` implement identical business rules. The TS version runs in-browser for instant UX. The Python version runs server-side for API access and ensures results are stored consistently in Supabase.

### 2. localStorage for result passing

Rather than passing audit results as URL params or re-fetching, the audit result JSON is stored in `localStorage` and read on the results page. This keeps URLs clean and allows refreshing the results page.

### 3. Short share IDs

Report share IDs are the first 8 chars of the UUID (e.g. `A7K3X2`), giving a human-readable URL like `/report/A7K3X2` while maintaining uniqueness for the expected scale.

### 4. No authentication

The product is intentionally auth-free. Lead capture (email) is optional and only used for sending the report. This removes all friction from the core value loop: land → audit → results → share.

---

## Component Tree

```
AuditWizard
├── ToolSelector
│   └── PlanSelector
├── TeamSizeInput
├── UseCaseSelector
└── SavingsGauge (live preview)

ResultsDashboard
├── SavingsCounter (animated)
├── SpendChart (Recharts BarChart)
├── SavingsChart (Recharts PieChart)
├── RecommendationCard (×N)
├── AuditSummary
└── LeadCapture
```

---

## Database Schema

```
audits (1)
  └── audit_tools (N)      one audit has many tools
  └── audit_results (N)    one audit has many recommendations
  └── reports (1)          one audit has one shareable report

leads (independent)
  └── audit_id (FK, nullable)  lead may reference an audit
```

---

## Environment Variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Frontend | FastAPI base URL |
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_KEY` | Backend | Supabase service role key |
| `OPENAI_API_KEY` | Backend | GPT-4o-mini for summaries |
| `RESEND_API_KEY` | Backend | Email delivery |
| `FROM_EMAIL` | Backend | Sender address |
| `FRONTEND_URL` | Backend | For email links |
| `ALLOWED_ORIGINS` | Backend | CORS whitelist |

---

## Scalability Notes

- **Supabase** handles connection pooling via PgBouncer automatically
- **Vercel** scales the Next.js frontend to zero with no config
- **Render** auto-scales the FastAPI service; for high traffic, switch to `gunicorn -w 4`
- The audit engine is stateless and CPU-light — horizontal scaling is trivial
- Add Redis caching for `/api/report/{id}` if report views become high-traffic
