"""
API endpoint tests using FastAPI TestClient
Run: pytest tests/test_api.py -v
"""
import pytest
from fastapi.testclient import TestClient
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_audit_endpoint_basic():
    payload = {
        "tools": [
            {"tool": "ChatGPT", "plan": "Team", "monthly_spend": 90, "seats": 3}
        ],
        "team_size": 3,
        "use_case": "Mixed"
    }
    resp = client.post("/api/audit", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_monthly_savings" in data
    assert data["total_monthly_savings"] >= 0
    assert "recommendations" in data
    assert "savings_score" in data


def test_audit_endpoint_no_tools_fails():
    resp = client.post("/api/audit", json={"tools": [], "team_size": 1, "use_case": "Mixed"})
    assert resp.status_code == 422


def test_audit_endpoint_invalid_tool_fails():
    resp = client.post("/api/audit", json={
        "tools": [{"tool": "FakeTool", "plan": "Pro", "monthly_spend": 20}],
        "team_size": 1,
        "use_case": "Mixed"
    })
    assert resp.status_code == 422


def test_audit_cursor_business_savings():
    payload = {
        "tools": [{"tool": "Cursor", "plan": "Business", "monthly_spend": 40, "seats": 1}],
        "team_size": 1,
        "use_case": "Coding"
    }
    resp = client.post("/api/audit", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_monthly_savings"] == 20.0


def test_audit_copilot_downgrade():
    payload = {
        "tools": [{"tool": "GitHub Copilot", "plan": "Business", "monthly_spend": 19, "seats": 1}],
        "team_size": 1, "use_case": "Coding"
    }
    resp = client.post("/api/audit", json=payload)
    assert resp.status_code == 200
    assert resp.json()["total_monthly_savings"] == 9.0


def test_audit_returns_id():
    payload = {
        "tools": [{"tool": "Claude", "plan": "Pro", "monthly_spend": 20, "seats": 1}],
        "team_size": 1, "use_case": "Writing"
    }
    resp = client.post("/api/audit", json=payload)
    assert resp.status_code == 200
    assert "id" in resp.json()


def test_audit_annual_is_12x_monthly():
    payload = {
        "tools": [{"tool": "Cursor", "plan": "Business", "monthly_spend": 40, "seats": 1}],
        "team_size": 1, "use_case": "Coding"
    }
    resp = client.post("/api/audit", json=payload)
    data = resp.json()
    assert data["total_annual_savings"] == data["total_monthly_savings"] * 12


def test_lead_endpoint():
    resp = client.post("/api/leads", json={
        "email": "test@example.com",
        "company": "Acme Corp",
        "role": "Founder / CEO",
        "monthly_savings": 200
    })
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_report_not_found():
    resp = client.get("/api/report/NONEXISTENT")
    assert resp.status_code in (404, 503)  # 503 if no DB configured
