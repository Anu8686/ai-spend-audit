from fastapi import APIRouter
from app.core.config import settings

try:
    from supabase import create_client
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY) if settings.SUPABASE_URL else None
except Exception:
    supabase = None

router = APIRouter()


@router.get("/admin/stats")
async def admin_stats():
    if not supabase:
        return {
            "total_audits": 0,
            "total_leads": 0,
            "total_savings_generated": 0,
            "avg_monthly_savings": 0,
            "top_tools": [],
        }

    audits = supabase.table("audits").select("total_monthly_savings").execute()
    leads = supabase.table("leads").select("id").execute()
    tools = supabase.table("audit_tools").select("tool_name").execute()

    savings_list = [row["total_monthly_savings"] for row in audits.data]
    total_savings = sum(savings_list)
    avg_savings = total_savings / len(savings_list) if savings_list else 0

    tool_counts: dict = {}
    for row in tools.data:
        name = row["tool_name"]
        tool_counts[name] = tool_counts.get(name, 0) + 1
    top_tools = sorted(tool_counts, key=lambda k: -tool_counts[k])[:5]

    return {
        "total_audits": len(audits.data),
        "total_leads": len(leads.data),
        "total_savings_generated": round(total_savings, 2),
        "avg_monthly_savings": round(avg_savings, 2),
        "top_tools": top_tools,
    }


@router.get("/admin/leads")
async def admin_leads():
    if not supabase:
        return []
    result = supabase.table("leads").select("*").order("created_at", desc=True).limit(50).execute()
    return result.data


@router.get("/admin/reports")
async def admin_reports():
    if not supabase:
        return []
    result = (
        supabase.table("reports")
        .select("*, audits(total_monthly_savings, total_annual_savings, company_name)")
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return result.data
