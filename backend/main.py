from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import audit, lead, report, admin
from app.core.config import settings

app = FastAPI(
    title="AI Spend Audit API",
    description="Backend for AI Spend Audit SaaS",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit.router, prefix="/api")
app.include_router(lead.router, prefix="/api")
app.include_router(report.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "ai-spend-audit-api", "version": "1.0.0"}
