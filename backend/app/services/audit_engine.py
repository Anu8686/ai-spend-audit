from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime


TOOL_PLANS = {
    "ChatGPT": [
        {"name": "Plus", "price": 20, "unit": "flat"},
        {"name": "Team", "price": 30, "unit": "per_seat", "min_seats": 2},
        {"name": "Enterprise", "price": 60, "unit": "per_seat"},
    ],
    "Claude": [
        {"name": "Pro", "price": 20, "unit": "flat"},
        {"name": "Max (5x)", "price": 100, "unit": "flat"},
        {"name": "Max (20x)", "price": 200, "unit": "flat"},
        {"name": "Team", "price": 30, "unit": "per_seat", "min_seats": 5},
        {"name": "Enterprise", "price": 60, "unit": "per_seat"},
    ],
    "Cursor": [
        {"name": "Hobby", "price": 0, "unit": "flat"},
        {"name": "Pro", "price": 20, "unit": "flat"},
        {"name": "Business", "price": 40, "unit": "per_seat"},
        {"name": "Enterprise", "price": 60, "unit": "per_seat"},
    ],
    "Gemini": [
        {"name": "Pro (Free)", "price": 0, "unit": "flat"},
        {"name": "Ultra", "price": 22, "unit": "flat"},
    ],
    "GitHub Copilot": [
        {"name": "Individual", "price": 10, "unit": "flat"},
        {"name": "Business", "price": 19, "unit": "per_seat"},
        {"name": "Enterprise", "price": 39, "unit": "per_seat"},
    ],
    "OpenAI API": [{"name": "Pay-as-you-go", "price": 0, "unit": "flat"}],
    "Anthropic API": [{"name": "Pay-as-you-go", "price": 0, "unit": "flat"}],
    "Windsurf": [
        {"name": "Free", "price": 0, "unit": "flat"},
        {"name": "Pro", "price": 15, "unit": "flat"},
        {"name": "Teams", "price": 35, "unit": "per_seat"},
    ],
}


def _plan_price(tool: str, plan_name: str, seats: int = 1) -> float:
    plans = TOOL_PLANS.get(tool, [])
    for p in plans:
        if p["name"] == plan_name:
            return p["price"] * seats if p["unit"] == "per_seat" else p["price"]
    return 0.0


def _compute_spend(tool_input) -> float:
    if tool_input.monthly_spend > 0:
        return tool_input.monthly_spend
    return _plan_price(tool_input.tool, tool_input.plan, tool_input.seats)


def _make_rec(tool, recommended_plan: str, reason: str, priority: str, rec_type: str,
              override_optimal: Optional[float] = None) -> Dict:
    current = _compute_spend(tool)
    optimal = override_optimal if override_optimal is not None else _plan_price(tool.tool, recommended_plan, tool.seats)
    monthly_savings = max(0.0, current - optimal)
    return {
        "tool_id": tool.id,
        "tool_name": tool.tool,
        "current_plan": tool.plan,
        "recommended_plan": recommended_plan,
        "current_spend": current,
        "recommended_spend": optimal,
        "monthly_savings": monthly_savings,
        "annual_savings": monthly_savings * 12,
        "reason": reason,
        "priority": priority,
        "type": rec_type,
    }


def _audit_chatgpt(tool, team_size: int) -> Optional[Dict]:
    spend = _compute_spend(tool)
    if tool.plan == "Team" and tool.seats <= 1:
        return _make_rec(tool, "Plus", "ChatGPT Team requires 2+ seats. With 1 seat, Plus saves $10/mo.", "high", "downgrade")
    if tool.plan == "Team" and team_size <= 3 and tool.seats <= 3:
        plus_cost = 20 * tool.seats
        team_cost = 30 * tool.seats
        if team_cost > plus_cost:
            return _make_rec(tool, "Plus",
                f"For a team of {team_size}, {tool.seats}× Plus plans (${plus_cost}/mo) beats Team (${team_cost}/mo).",
                "high", "downgrade", plus_cost)
    if tool.plan == "Enterprise" and team_size < 10:
        return _make_rec(tool, "Team", f"Enterprise is overkill for {team_size} users. Team plan covers the same needs.", "medium", "downgrade")
    return None


def _audit_claude(tool, team_size: int) -> Optional[Dict]:
    if tool.plan == "Team" and tool.seats <= 2:
        return _make_rec(tool, "Pro",
            f"Claude Team with only {tool.seats} seat(s) — minimum value is at 5+ seats. Individual Pro is cheaper.",
            "high", "downgrade", 20 * tool.seats)
    if tool.plan == "Max (20x)" and team_size == 1:
        return _make_rec(tool, "Max (5x)", "Max 20x is extreme usage. Evaluate if you're actually hitting 5x limits first.", "medium", "downgrade")
    if tool.plan == "Enterprise" and team_size < 10:
        return _make_rec(tool, "Team", f"Enterprise overhead for {team_size} users — Team plan is sufficient.", "medium", "downgrade")
    return None


def _audit_cursor(tool, team_size: int) -> Optional[Dict]:
    if tool.plan == "Business" and tool.seats <= 2:
        pro_cost = 20 * tool.seats
        return _make_rec(tool, "Pro",
            f"Cursor Business at $40/seat for {tool.seats} seat(s) — Pro at $20/seat is identical without SSO.",
            "high", "downgrade", pro_cost)
    if tool.plan == "Enterprise" and team_size < 15:
        return _make_rec(tool, "Business", "Cursor Enterprise audit logs rarely justify cost under 15 users.", "medium", "downgrade")
    return None


def _audit_github_copilot(tool, team_size: int) -> Optional[Dict]:
    if tool.plan == "Business" and tool.seats == 1:
        return _make_rec(tool, "Individual", "Copilot Business with 1 seat — Individual saves $9/mo with same completions.", "high", "downgrade")
    if tool.plan == "Enterprise" and team_size < 20:
        return _make_rec(tool, "Business", "Copilot Enterprise fine-tuning value starts at 20+ devs. Business is sufficient.", "medium", "downgrade")
    return None


def _audit_gemini(tool) -> Optional[Dict]:
    if tool.plan == "Ultra":
        return _make_rec(tool, "Pro (Free)", "Gemini Pro is free. Evaluate whether Ultra's extras ($22/mo) justify the cost.", "medium", "downgrade", 0)
    return None


def _audit_windsurf(tool, team_size: int) -> Optional[Dict]:
    if tool.plan == "Teams" and tool.seats <= 2:
        pro_cost = 15 * tool.seats
        return _make_rec(tool, "Pro",
            f"Windsurf Teams at $35/seat for {tool.seats} seat(s) — Pro at $15/seat saves ${(35-15)*tool.seats}/mo.",
            "high", "downgrade", pro_cost)
    return None


def _detect_overlaps(tools) -> List[Dict]:
    recs = []
    coding_tools = ["Cursor", "GitHub Copilot", "Windsurf"]
    paid_coding = [t for t in tools if t.tool in coding_tools and _compute_spend(t) > 0]
    if len(paid_coding) >= 2:
        cheapest = sorted(paid_coding, key=lambda t: _compute_spend(t))[0]
        for t in paid_coding:
            if t.id != cheapest.id:
                spend = _compute_spend(t)
                recs.append({
                    "tool_id": t.id, "tool_name": t.tool, "current_plan": t.plan,
                    "recommended_plan": "Cancel", "current_spend": spend, "recommended_spend": 0,
                    "monthly_savings": spend, "annual_savings": spend * 12,
                    "reason": f"You're paying for {len(paid_coding)} coding AI tools. Engineers use one 80%+ of the time. Consolidate to {cheapest.tool}.",
                    "priority": "high", "type": "consolidate",
                })

    chat_tools = ["ChatGPT", "Claude", "Gemini"]
    paid_chat = [t for t in tools if t.tool in chat_tools and _compute_spend(t) > 0]
    if len(paid_chat) >= 3:
        most_exp = sorted(paid_chat, key=lambda t: _compute_spend(t), reverse=True)[0]
        spend = _compute_spend(most_exp)
        names = ", ".join(t.tool for t in paid_chat)
        recs.append({
            "tool_id": most_exp.id, "tool_name": most_exp.tool, "current_plan": most_exp.plan,
            "recommended_plan": "Cancel", "current_spend": spend, "recommended_spend": 0,
            "monthly_savings": spend, "annual_savings": spend * 12,
            "reason": f"Paying for 3+ chat AI tools ({names}). Pick 1 primary, cancel the rest.",
            "priority": "high", "type": "consolidate",
        })

    return recs


def _savings_score(savings_rate: float) -> int:
    if savings_rate <= 0:
        return 98
    if savings_rate >= 50:
        return 30
    return round(98 - savings_rate * 1.36)


def run_audit(request) -> Dict[str, Any]:
    recommendations = []
    existing_ids = set()

    for tool in request.tools:
        rec = None
        if tool.tool == "ChatGPT":
            rec = _audit_chatgpt(tool, request.team_size)
        elif tool.tool == "Claude":
            rec = _audit_claude(tool, request.team_size)
        elif tool.tool == "Cursor":
            rec = _audit_cursor(tool, request.team_size)
        elif tool.tool == "GitHub Copilot":
            rec = _audit_github_copilot(tool, request.team_size)
        elif tool.tool == "Gemini":
            rec = _audit_gemini(tool)
        elif tool.tool == "Windsurf":
            rec = _audit_windsurf(tool, request.team_size)

        if rec and rec["monthly_savings"] > 0:
            recommendations.append(rec)
            existing_ids.add(tool.id)

    for r in _detect_overlaps(request.tools):
        if r["tool_id"] not in existing_ids:
            recommendations.append(r)

    recommendations.sort(key=lambda r: ({"high": 0, "medium": 1, "low": 2}[r["priority"]], -r["monthly_savings"]))

    total_current = sum(_compute_spend(t) for t in request.tools)
    total_savings = sum(r["monthly_savings"] for r in recommendations)
    total_optimal = max(0.0, total_current - total_savings)
    savings_rate = (total_savings / total_current * 100) if total_current > 0 else 0

    return {
        "id": str(uuid.uuid4()),
        "total_current_spend": total_current,
        "total_optimal_spend": total_optimal,
        "total_monthly_savings": total_savings,
        "total_annual_savings": total_savings * 12,
        "savings_score": _savings_score(savings_rate),
        "savings_rate": savings_rate,
        "recommendations": recommendations,
        "ai_summary": None,
        "created_at": datetime.utcnow(),
    }
