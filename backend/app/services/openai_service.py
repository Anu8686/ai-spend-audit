from openai import AsyncOpenAI
from app.core.config import settings
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None


async def generate_ai_summary(request, result: dict) -> str:
    if not client:
        return _fallback(result)

    tools_summary = ", ".join(
        f"{t.tool} {t.plan} (${t.monthly_spend}/mo, {t.seats} seat{'s' if t.seats > 1 else ''})"
        for t in request.tools
    )
    recs_summary = "\n".join(
        f"- {r['tool_name']}: {r['reason']} (save ${r['monthly_savings']:.0f}/mo)"
        for r in result["recommendations"][:5]
    )

    prompt = f"""You are a startup CFO and AI tools expert. Analyze this AI spending audit and write a concise, personalized 3-4 sentence summary.

Team: {request.team_size} people, primary use case: {request.use_case}
Current AI stack: {tools_summary}
Total current spend: ${result['total_current_spend']:.0f}/mo
Total savings found: ${result['total_monthly_savings']:.0f}/mo (${result['total_annual_savings']:.0f}/year)
Savings rate: {result['savings_rate']:.0f}%

Top recommendations:
{recs_summary if recs_summary else 'None — stack appears optimized'}

Write a confident, direct analysis. Mention the biggest waste, the smartest action to take, and the annual financial impact. Speak to a startup founder or CTO. No fluff."""

    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return _fallback(result)


def _fallback(result: dict) -> str:
    savings = result["total_monthly_savings"]
    annual = result["total_annual_savings"]
    recs = result["recommendations"]
    if savings == 0:
        return "Your AI stack appears well-optimized for your team size. No significant savings opportunities were identified. Revisit this audit when your team grows or when vendors release new pricing."
    top = recs[0] if recs else None
    top_line = f" The highest-impact action: {top['tool_name']} ({top['current_plan']} → {top['recommended_plan']}), saving ${top['monthly_savings']:.0f}/month." if top else ""
    return (
        f"Your AI stack is leaking ${savings:.0f}/month — ${annual:,.0f} annually. "
        f"That's {result['savings_rate']:.0f}% of your current AI budget going to waste.{top_line} "
        f"With {len(recs)} optimization{'s' if len(recs) > 1 else ''} applied, you could redirect that budget toward growth, hiring, or infrastructure."
    )
