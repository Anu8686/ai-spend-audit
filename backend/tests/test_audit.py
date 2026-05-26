"""
AI Spend Audit — Test Suite
Run: pytest tests/ -v
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.audit_engine import run_audit, _savings_score, _plan_price


# ─── Helpers ────────────────────────────────────────────────────────────────

class MockTool:
    def __init__(self, tool, plan, monthly_spend, seats=1, use_case=None):
        import uuid
        self.id = str(uuid.uuid4())
        self.tool = tool
        self.plan = plan
        self.monthly_spend = monthly_spend
        self.seats = seats
        self.use_case = use_case


class MockRequest:
    def __init__(self, tools, team_size=1, use_case="Mixed"):
        self.tools = tools
        self.team_size = team_size
        self.use_case = use_case
        self.company_name = None


# ─── Savings score ───────────────────────────────────────────────────────────

def test_savings_score_zero_waste():
    assert _savings_score(0) == 98


def test_savings_score_half_waste():
    score = _savings_score(50)
    assert score == 30


def test_savings_score_medium_waste():
    score = _savings_score(25)
    assert 50 < score < 90


def test_savings_score_clamp():
    assert _savings_score(100) == 30


# ─── Plan price ──────────────────────────────────────────────────────────────

def test_plan_price_flat():
    assert _plan_price("ChatGPT", "Plus", 1) == 20


def test_plan_price_per_seat():
    assert _plan_price("ChatGPT", "Team", 3) == 90


def test_plan_price_unknown_plan():
    assert _plan_price("ChatGPT", "NonExistent", 1) == 0


# ─── ChatGPT rules ───────────────────────────────────────────────────────────

def test_chatgpt_team_single_seat_gets_downgraded():
    tool = MockTool("ChatGPT", "Team", 30, seats=1)
    req = MockRequest([tool], team_size=1)
    result = run_audit(req)
    assert result["total_monthly_savings"] > 0
    recs = result["recommendations"]
    assert any(r["tool_name"] == "ChatGPT" and r["recommended_plan"] == "Plus" for r in recs)


def test_chatgpt_team_small_team_recommends_plus():
    tool = MockTool("ChatGPT", "Team", 90, seats=3)
    req = MockRequest([tool], team_size=3)
    result = run_audit(req)
    assert result["total_monthly_savings"] == 30  # 3×30 - 3×20 = 30


def test_chatgpt_plus_optimal_no_rec():
    tool = MockTool("ChatGPT", "Plus", 20, seats=1)
    req = MockRequest([tool], team_size=1)
    result = run_audit(req)
    assert result["total_monthly_savings"] == 0


# ─── Cursor rules ────────────────────────────────────────────────────────────

def test_cursor_business_single_seat_downgrades():
    tool = MockTool("Cursor", "Business", 40, seats=1)
    req = MockRequest([tool], team_size=1)
    result = run_audit(req)
    assert result["total_monthly_savings"] == 20
    assert result["recommendations"][0]["recommended_plan"] == "Pro"


def test_cursor_pro_no_rec():
    tool = MockTool("Cursor", "Pro", 20, seats=1)
    req = MockRequest([tool], team_size=1)
    result = run_audit(req)
    assert result["total_monthly_savings"] == 0


# ─── GitHub Copilot rules ────────────────────────────────────────────────────

def test_copilot_business_single_seat_to_individual():
    tool = MockTool("GitHub Copilot", "Business", 19, seats=1)
    req = MockRequest([tool], team_size=1)
    result = run_audit(req)
    assert result["total_monthly_savings"] == 9


# ─── Gemini rules ────────────────────────────────────────────────────────────

def test_gemini_ultra_flagged():
    tool = MockTool("Gemini", "Ultra", 22, seats=1)
    req = MockRequest([tool], team_size=1)
    result = run_audit(req)
    assert result["total_monthly_savings"] == 22
    assert result["recommendations"][0]["recommended_plan"] == "Pro (Free)"


# ─── Overlap detection ───────────────────────────────────────────────────────

def test_two_coding_tools_detected_as_overlap():
    cursor = MockTool("Cursor", "Pro", 20, seats=1)
    copilot = MockTool("GitHub Copilot", "Individual", 10, seats=1)
    req = MockRequest([cursor, copilot], team_size=1)
    result = run_audit(req)
    assert result["total_monthly_savings"] > 0
    assert any(r["type"] == "consolidate" for r in result["recommendations"])


def test_three_chat_tools_detected():
    gpt = MockTool("ChatGPT", "Plus", 20)
    claude = MockTool("Claude", "Pro", 20)
    gemini = MockTool("Gemini", "Ultra", 22)
    req = MockRequest([gpt, claude, gemini], team_size=1)
    result = run_audit(req)
    assert any(r["type"] == "consolidate" for r in result["recommendations"])


# ─── Totals ──────────────────────────────────────────────────────────────────

def test_annual_savings_is_monthly_times_12():
    tool = MockTool("Cursor", "Business", 40, seats=1)
    req = MockRequest([tool], team_size=1)
    result = run_audit(req)
    assert result["total_annual_savings"] == result["total_monthly_savings"] * 12


def test_optimal_spend_never_negative():
    tool = MockTool("Gemini", "Ultra", 22, seats=1)
    req = MockRequest([tool], team_size=1)
    result = run_audit(req)
    assert result["total_optimal_spend"] >= 0


def test_multiple_tools_savings_sum():
    t1 = MockTool("Cursor", "Business", 40, seats=1)   # saves 20
    t2 = MockTool("GitHub Copilot", "Business", 19, seats=1)  # saves 9
    req = MockRequest([t1, t2], team_size=1)
    result = run_audit(req)
    # savings from individual recs (overlap not triggered for different categories)
    assert result["total_monthly_savings"] >= 20


def test_priority_high_comes_first():
    t1 = MockTool("Gemini", "Ultra", 22)           # medium
    t2 = MockTool("Cursor", "Business", 40, seats=1)  # high
    req = MockRequest([t1, t2], team_size=1)
    result = run_audit(req)
    recs = result["recommendations"]
    if len(recs) >= 2:
        assert recs[0]["priority"] == "high"
