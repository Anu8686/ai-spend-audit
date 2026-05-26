-- ============================================================
-- AI Spend Audit — Supabase PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── audits ───────────────────────────────────────────────────
CREATE TABLE audits (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_size            INTEGER NOT NULL DEFAULT 1,
    use_case             TEXT NOT NULL DEFAULT 'Mixed',
    company_name         TEXT,
    total_current_spend  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_optimal_spend  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_monthly_savings NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_annual_savings  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    savings_score        INTEGER NOT NULL DEFAULT 0,
    savings_rate         NUMERIC(5, 2) NOT NULL DEFAULT 0,
    ai_summary           TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audits_created_at ON audits (created_at DESC);
CREATE INDEX idx_audits_savings ON audits (total_monthly_savings DESC);

-- ── audit_tools ──────────────────────────────────────────────
CREATE TABLE audit_tools (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id      UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    tool_name     TEXT NOT NULL,
    plan          TEXT NOT NULL,
    monthly_spend NUMERIC(10, 2) NOT NULL DEFAULT 0,
    seats         INTEGER NOT NULL DEFAULT 1,
    use_case      TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tools_audit_id ON audit_tools (audit_id);
CREATE INDEX idx_audit_tools_tool_name ON audit_tools (tool_name);

-- ── audit_results ────────────────────────────────────────────
CREATE TABLE audit_results (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id          UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    tool_id           UUID,
    tool_name         TEXT NOT NULL,
    current_plan      TEXT NOT NULL,
    recommended_plan  TEXT NOT NULL,
    current_spend     NUMERIC(10, 2) NOT NULL DEFAULT 0,
    recommended_spend NUMERIC(10, 2) NOT NULL DEFAULT 0,
    monthly_savings   NUMERIC(10, 2) NOT NULL DEFAULT 0,
    annual_savings    NUMERIC(10, 2) NOT NULL DEFAULT 0,
    reason            TEXT NOT NULL,
    priority          TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    type              TEXT NOT NULL CHECK (type IN ('downgrade', 'upgrade', 'consolidate', 'cancel', 'ok')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_results_audit_id ON audit_results (audit_id);
CREATE INDEX idx_audit_results_priority ON audit_results (priority);

-- ── leads ────────────────────────────────────────────────────
CREATE TABLE leads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT NOT NULL,
    company         TEXT,
    role            TEXT,
    audit_id        UUID REFERENCES audits(id) ON DELETE SET NULL,
    monthly_savings NUMERIC(10, 2),
    email_sent      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_leads_email ON leads (email);
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX idx_leads_audit_id ON leads (audit_id);

-- ── reports ──────────────────────────────────────────────────
CREATE TABLE reports (
    id         TEXT PRIMARY KEY,            -- Short slug e.g. "A7K3X2"
    audit_id   UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_audit_id ON reports (audit_id);

-- ── updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audits_updated_at
  BEFORE UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row-level security (Supabase) ────────────────────────────
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Public read for reports (shareable links)
CREATE POLICY "reports_public_read" ON reports FOR SELECT USING (true);
CREATE POLICY "audit_tools_public_read" ON audit_tools FOR SELECT USING (true);
CREATE POLICY "audit_results_public_read" ON audit_results FOR SELECT USING (true);
CREATE POLICY "audits_public_read" ON audits FOR SELECT USING (true);

-- Service role can do everything (backend uses service key)
CREATE POLICY "service_all_audits" ON audits FOR ALL USING (true);
CREATE POLICY "service_all_tools" ON audit_tools FOR ALL USING (true);
CREATE POLICY "service_all_results" ON audit_results FOR ALL USING (true);
CREATE POLICY "service_all_leads" ON leads FOR ALL USING (true);
CREATE POLICY "service_all_reports" ON reports FOR ALL USING (true);
