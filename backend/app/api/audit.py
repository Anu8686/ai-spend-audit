from fastapi import APIRouter, HTTPException
from app.models.schemas import AuditRequest, AuditResponse
from app.services.audit_engine import run_audit
from app.services.openai_service import generate_ai_summary
from app.core.config import settings
import uuid
from datetime import datetime

try:
    from supabase import create_client
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY) if settings.SUPABASE_URL else None
except Exception:
    supabase = None

router = APIRouter()


@router.post("/audit", response_model=AuditResponse)
async def create_audit(request: AuditRequest):
    result = run_audit(request)

    # Generate AI summary
    try:
        result["ai_summary"] = await generate_ai_summary(request, result)
    except Exception:
        result["ai_summary"] = _fallback_summary(result)

    # Persist to Supabase
    if supabase:
        try:
            audit_row = {
                "id": result["id"],
                "team_size": request.team_size,
                "use_case": request.use_case,
                "company_name": request.company_name,
                "total_current_spend": result["total_current_spend"],
                "total_optimal_spend": result["total_optimal_spend"],
                "total_monthly_savings": result["total_monthly_savings"],
                "total_annual_savings": result["total_annual_savings"],
                "savings_score": result["savings_score"],
                "savings_rate": result["savings_rate"],
                "ai_summary": result.get("ai_summary"),
            }
            supabase.table("audits").insert(audit_row).execute()

            for tool in request.tools:
                supabase.table("audit_tools").insert({
                    "id": tool.id,
                    "audit_id": result["id"],
                    "tool_name": tool.tool,
                    "plan": tool.plan,
                    "monthly_spend": tool.monthly_spend,
                    "seats": tool.seats,
                }).execute()

            for rec in result["recommendations"]:
                supabase.table("audit_results").insert({
                    "audit_id": result["id"],
                    "tool_id": rec["tool_id"],
                    "tool_name": rec["tool_name"],
                    "current_plan": rec["current_plan"],
                    "recommended_plan": rec["recommended_plan"],
                    "current_spend": rec["current_spend"],
                    "recommended_spend": rec["recommended_spend"],
                    "monthly_savings": rec["monthly_savings"],
                    "annual_savings": rec["annual_savings"],
                    "reason": rec["reason"],
                    "priority": rec["priority"],
                    "type": rec["type"],
                }).execute()

            # Create shareable report
            supabase.table("reports").insert({
                "id": result["id"][:8].upper(),
                "audit_id": result["id"],
            }).execute()
        except Exception as e:
            pass  # Non-fatal

    return result


def _fallback_summary(result: dict) -> str:
    savings = result["total_monthly_savings"]
    if savings == 0:
        return "Your AI stack appears well-optimized. No major changes needed right now."
    return (
        f"Your AI stack is leaking ${savings}/month (${result['total_annual_savings']:,.0f}/year). "
        f"Review the {len(result['recommendations'])} recommendation(s) above to optimize your spend."
    )
