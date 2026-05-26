import httpx
from app.core.config import settings


async def send_lead_confirmation(email: str, company: str | None, monthly_savings: float):
    if not settings.RESEND_API_KEY:
        return

    company_str = f" for {company}" if company else ""
    savings_str = f"${monthly_savings:.0f}/month (${monthly_savings * 12:,.0f}/year)" if monthly_savings > 0 else "significant amounts"

    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FAF8F3;margin:0;padding:40px 20px;">
  <div style="max-width:540px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #E8E5DE;">
    <div style="background:#1F2937;padding:32px;text-align:center;">
      <div style="display:inline-flex;align-items:center;gap:8px;color:white;font-size:18px;font-weight:800;">
        <span style="background:#10B981;width:28px;height:28px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;">◎</span>
        AI Spend Audit
      </div>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1F2937;font-size:22px;font-weight:800;margin:0 0 8px;">Your audit report{company_str} is ready</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
        We found you could be saving <strong style="color:#10B981;">{savings_str}</strong> on AI tools.
      </p>
      <div style="background:#ECFDF5;border:1px solid #D1FAE5;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <div style="font-size:12px;color:#059669;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Monthly savings opportunity</div>
        <div style="font-size:36px;font-weight:900;color:#10B981;letter-spacing:-1px;">${monthly_savings:.0f}/mo</div>
        <div style="font-size:14px;color:#6B7280;margin-top:4px;">${monthly_savings * 12:,.0f} annually</div>
      </div>
      <p style="color:#6B7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Log in to view your full report with tool-by-tool recommendations, a shareable link, and your AI-powered savings analysis.
      </p>
      <a href="{settings.FRONTEND_URL}/results" style="display:block;background:#10B981;color:white;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        View Full Report →
      </a>
    </div>
    <div style="border-top:1px solid #E8E5DE;padding:20px 32px;text-align:center;color:#9CA3AF;font-size:12px;">
      AI Spend Audit · Stop Overpaying For AI Tools · <a href="{settings.FRONTEND_URL}" style="color:#9CA3AF;">aispendaudit.com</a>
    </div>
  </div>
</body>
</html>
"""

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}", "Content-Type": "application/json"},
            json={
                "from": settings.FROM_EMAIL,
                "to": [email],
                "subject": f"Your AI Spend Audit: ${monthly_savings:.0f}/mo in savings found",
                "html": html,
            },
        )


async def send_audit_report(email: str, report_id: str, monthly_savings: float):
    if not settings.RESEND_API_KEY:
        return
    report_url = f"{settings.FRONTEND_URL}/report/{report_id}"
    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}", "Content-Type": "application/json"},
            json={
                "from": settings.FROM_EMAIL,
                "to": [email],
                "subject": "Your shareable AI Spend Audit report",
                "html": f'<p>View your report: <a href="{report_url}">{report_url}</a></p>',
            },
        )
