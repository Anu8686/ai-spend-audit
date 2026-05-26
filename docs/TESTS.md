# Tests — AI Spend Audit

## Running Tests

```bash
cd backend
pip install -r requirements.txt pytest httpx
pytest tests/ -v
```

Expected output: 20 tests, all passing.

---

## Test Coverage

### Unit Tests — Audit Engine (`tests/test_audit.py`)

| Test | Description | Expected |
|------|-------------|----------|
| `test_savings_score_zero_waste` | 0% waste → score 98 | score == 98 |
| `test_savings_score_half_waste` | 50% waste → score 30 | score == 30 |
| `test_savings_score_medium_waste` | 25% waste → mid range | 50 < score < 90 |
| `test_savings_score_clamp` | 100% waste → clamp at 30 | score == 30 |
| `test_plan_price_flat` | ChatGPT Plus flat price | 20 |
| `test_plan_price_per_seat` | ChatGPT Team × 3 seats | 90 |
| `test_plan_price_unknown_plan` | Unknown plan name | 0 |
| `test_chatgpt_team_single_seat_gets_downgraded` | Team with 1 seat → Plus | savings > 0 |
| `test_chatgpt_team_small_team_recommends_plus` | Team 3×$30 → Plus 3×$20 | savings == 30 |
| `test_chatgpt_plus_optimal_no_rec` | Plus is already optimal | savings == 0 |
| `test_cursor_business_single_seat_downgrades` | Business 1 seat → Pro | savings == 20 |
| `test_cursor_pro_no_rec` | Pro is already optimal | savings == 0 |
| `test_copilot_business_single_seat_to_individual` | Business 1 → Individual | savings == 9 |
| `test_gemini_ultra_flagged` | Ultra → free Pro | savings == 22 |
| `test_two_coding_tools_detected_as_overlap` | Cursor + Copilot → consolidate | consolidate rec |
| `test_three_chat_tools_detected` | GPT + Claude + Gemini → consolidate | consolidate rec |
| `test_annual_savings_is_monthly_times_12` | Annual = monthly × 12 | exact equality |
| `test_optimal_spend_never_negative` | Optimal ≥ 0 always | >= 0 |
| `test_multiple_tools_savings_sum` | Business Cursor + Copilot Business | >= 20 |
| `test_priority_high_comes_first` | High priority sorted first | recs[0].priority == 'high' |

### Integration Tests — API (`tests/test_api.py`)

| Test | Endpoint | Description |
|------|----------|-------------|
| `test_health_endpoint` | GET /api/health | Returns 200 + status ok |
| `test_audit_endpoint_basic` | POST /api/audit | Full audit response shape |
| `test_audit_endpoint_no_tools_fails` | POST /api/audit | Empty tools → 422 |
| `test_audit_endpoint_invalid_tool_fails` | POST /api/audit | Unknown tool → 422 |
| `test_audit_cursor_business_savings` | POST /api/audit | Cursor Business → $20 savings |
| `test_audit_copilot_downgrade` | POST /api/audit | Copilot Business → $9 savings |
| `test_audit_returns_id` | POST /api/audit | Response has UUID id |
| `test_audit_annual_is_12x_monthly` | POST /api/audit | annual == monthly × 12 |
| `test_lead_endpoint` | POST /api/leads | Returns success: true |
| `test_report_not_found` | GET /api/report/NONEXISTENT | 404 or 503 |

---

## Savings Calculation Verification

Manual verification of key rules:

```
ChatGPT Team, 3 seats, $90/mo
→ Recommended: Plus × 3 = $60/mo
→ Monthly savings: $90 - $60 = $30 ✓
→ Annual savings: $30 × 12 = $360 ✓

Cursor Business, 1 seat, $40/mo
→ Recommended: Pro = $20/mo
→ Monthly savings: $40 - $20 = $20 ✓
→ Annual savings: $20 × 12 = $240 ✓

GitHub Copilot Business, 1 seat, $19/mo
→ Recommended: Individual = $10/mo
→ Monthly savings: $19 - $10 = $9 ✓
→ Annual savings: $9 × 12 = $108 ✓

Gemini Ultra, $22/mo
→ Recommended: Pro (Free) = $0/mo
→ Monthly savings: $22 ✓
→ Annual savings: $22 × 12 = $264 ✓
```

---

## Adding New Tests

To add a test for a new tool rule:

```python
def test_new_tool_rule():
    tool = MockTool("ToolName", "PlanName", spend_amount, seats=N)
    req = MockRequest([tool], team_size=T)
    result = run_audit(req)
    assert result["total_monthly_savings"] == expected_savings
    assert result["recommendations"][0]["recommended_plan"] == "ExpectedPlan"
```

## Test Configuration

Tests run with all external services mocked out via `conftest.py`:
- `SUPABASE_URL=""` — No database writes
- `OPENAI_API_KEY=""` — No API calls, uses fallback summary
- `RESEND_API_KEY=""` — No emails sent

This ensures tests are fast, deterministic, and free.
