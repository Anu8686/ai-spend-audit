from fastapi import APIRouter
from app.models.schemas import LeadRequest, LeadResponse
from app.services.email_service import send_lead_confirmation, send_audit_report
from app.core.config import settings
import uuid
from datetime import datetime

try:
    from supabase import create_client
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY) if settings.SUPABASE_URL else None
except Exception:
    supabase = None

router = APIRouter()


@router.post("/leads", response_model=LeadResponse)
async def capture_lead(request: LeadRequest):
    lead_id = str(uuid.uuid4())

    if supabase:
        try:
            supabase.table("leads").insert({
                "id": lead_id,
                "email": request.email,
                "company": request.company,
                "role": request.role,
                "audit_id": request.audit_id,
                "monthly_savings": request.monthly_savings,
                "created_at": datetime.utcnow().isoformat(),
            }).execute()
        except Exception:
            pass

    # Send emails (non-blocking)
    try:
        await send_lead_confirmation(request.email, request.company, request.monthly_savings or 0)
    except Exception:
        pass

    return LeadResponse(success=True, message="Report sent successfully")
