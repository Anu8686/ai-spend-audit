from fastapi import APIRouter, HTTPException
from app.models.schemas import ReportResponse
from app.core.config import settings

try:
    from supabase import create_client
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY) if settings.SUPABASE_URL else None
except Exception:
    supabase = None

router = APIRouter()


@router.get("/report/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Resolve report → audit
    report_res = supabase.table("reports").select("*").eq("id", report_id.upper()).execute()
    if not report_res.data:
        raise HTTPException(status_code=404, detail="Report not found")

    audit_id = report_res.data[0]["audit_id"]

    audit_res = supabase.table("audits").select("*").eq("id", audit_id).execute()
    if not audit_res.data:
        raise HTTPException(status_code=404, detail="Audit not found")
    audit = audit_res.data[0]

    tools_res = supabase.table("audit_tools").select("*").eq("audit_id", audit_id).execute()
    recs_res = supabase.table("audit_results").select("*").eq("audit_id", audit_id).execute()

    tools_out = [
        {
            "tool_name": t["tool_name"],
            "plan": t["plan"],
            "monthly_spend": t["monthly_spend"],
            "seats": t["seats"],
        }
        for t in tools_res.data
    ]

    recs_out = [
        {
            "tool_id": r["tool_id"],
            "tool_name": r["tool_name"],
            "current_plan": r["current_plan"],
            "recommended_plan": r["recommended_plan"],
            "current_spend": r["current_spend"],
            "recommended_spend": r["recommended_spend"],
            "monthly_savings": r["monthly_savings"],
            "annual_savings": r["annual_savings"],
            "reason": r["reason"],
            "priority": r["priority"],
            "type": r["type"],
        }
        for r in recs_res.data
    ]

    return {
        "id": report_id,
        "total_monthly_savings": audit["total_monthly_savings"],
        "total_annual_savings": audit["total_annual_savings"],
        "savings_score": audit["savings_score"],
        "savings_rate": audit["savings_rate"],
        "recommendations": recs_out,
        "tools": tools_out,
        "created_at": audit["created_at"],
    }
