# AI Spend Audit

**Stop Overpaying For AI Tools**

Discover hidden savings across ChatGPT, Claude, Cursor, Copilot, Gemini and more.  
Most startups overpay by $400–$2,400/year.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| Database | Supabase PostgreSQL |
| AI | OpenAI GPT-4o-mini |
| Email | Resend |
| Frontend deploy | Vercel |
| Backend deploy | Render |

---

## Project Structure

```
ai-spend-audit/
├── frontend/               # Next.js 15 app
│   ├── app/
│   │   ├── audit/          # Audit wizard page
│   │   ├── results/        # Results dashboard
│   │   └── report/[id]/    # Shareable report
│   ├── components/         # All UI components
│   ├── lib/
│   │   └── audit-engine.ts # Client-side rule engine
│   └── types/
│       └── audit.ts        # Shared types
│
├── backend/                # FastAPI service
│   ├── main.py
│   └── app/
│       ├── api/            # Route handlers
│       ├── services/       # Business logic
│       ├── models/         # Pydantic schemas
│       └── core/           # Config
│
├── database/
│   └── schema.sql          # Supabase schema
│
└── .github/workflows/
    └── ci.yml              # CI/CD
```

---

## Local Development

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# → http://localhost:3000
```

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env         # fill in keys
uvicorn main:app --reload --port 8000
# → http://localhost:8000/api/health
```

### Database

1. Create a free project at [supabase.com](https://supabase.com)
2. Open SQL Editor and run `database/schema.sql`
3. Copy Project URL and `service_role` key → paste into `backend/.env`

---

## Deployment

### Frontend → Vercel

```bash
# 1. Push to GitHub
# 2. Import repo at vercel.com/new
# 3. Set root directory: frontend
# 4. Add env var: NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
# 5. Deploy
```

### Backend → Render

```bash
# 1. Create a new Web Service at render.com
# 2. Connect your GitHub repo
# 3. Set root directory: backend
# 4. Build command: pip install -r requirements.txt
# 5. Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
# 6. Add env vars from .env.example
# 7. Deploy
```

Or use the `backend/render.yaml` blueprint.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/audit` | Run audit, get recommendations |
| POST | `/api/leads` | Capture lead + send email |
| GET | `/api/report/{id}` | Fetch shareable report |

### POST /api/audit

```json
{
  "tools": [
    {
      "tool": "ChatGPT",
      "plan": "Team",
      "monthly_spend": 90,
      "seats": 3
    }
  ],
  "team_size": 3,
  "use_case": "Coding"
}
```

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

Expected: 20+ tests covering audit engine rules, savings calculations, and API endpoints.

---

## Supported Tools

- ChatGPT (Plus / Team / Enterprise)
- Claude (Pro / Max / Team / Enterprise)
- Cursor (Hobby / Pro / Business / Enterprise)
- GitHub Copilot (Individual / Business / Enterprise)
- Gemini (Pro Free / Ultra)
- OpenAI API
- Anthropic API
- Windsurf (Free / Pro / Teams)

---

## Business Rules (Audit Engine)

| Condition | Recommendation |
|-----------|---------------|
| ChatGPT Team + 1 seat | Downgrade to Plus |
| ChatGPT Team + team ≤ 3 | Switch to N× Plus |
| Cursor Business + ≤ 2 seats | Downgrade to Pro |
| GitHub Copilot Business + 1 seat | Downgrade to Individual |
| Gemini Ultra (any) | Evaluate free Pro tier |
| 2+ coding tools paid | Consolidate to one |
| 3+ chat tools paid | Consolidate to one |

---

## License

MIT
deployment-trigger
vercel-redeploy
redeploy
