import { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.aispendaudit.com';

  let savings = 0;
  let annual = 0;
  try {
    const res = await fetch(`${apiUrl}/api/report/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      savings = data.total_monthly_savings ?? 0;
      annual = data.total_annual_savings ?? 0;
    }
  } catch {}

  const title = savings > 0
    ? `AI Spend Audit — $${savings}/mo savings found ($${annual.toLocaleString()}/yr)`
    : 'AI Spend Audit — Free AI Cost Analysis';
  const description = 'Discover hidden savings across ChatGPT, Claude, Cursor, Copilot, Gemini and more. Run your free audit in 2 minutes.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://aispendaudit.com/report/${id}`,
      images: [{ url: `https://aispendaudit.com/og/report?id=${id}&savings=${savings}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ReportPage({ params }: Props) {
  const id = params.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.aispendaudit.com';

  let report: any = null;
  try {
    const res = await fetch(`${apiUrl}/api/report/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) report = await res.json();
  } catch {}

  if (!report) {
    return (
      <main className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-charcoal mb-2">Report not found</h1>
          <p className="text-muted text-sm mb-6">This report may have expired or the link is incorrect.</p>
          <a href="/audit" className="bg-emerald text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors">
            Run a New Audit →
          </a>
        </div>
      </main>
    );
  }

  const {
    total_monthly_savings: monthly = 0,
    total_annual_savings: annual = 0,
    savings_score: score = 0,
    savings_rate: rate = 0,
    recommendations = [],
    tools = [],
  } = report;

  return (
    <main className="min-h-screen bg-ivory">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Shared AI Spend Audit
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-charcoal mb-2">
            ${monthly.toLocaleString()}/mo in savings found
          </h1>
          <p className="text-muted">
            ${annual.toLocaleString()} annual savings · {rate?.toFixed(0)}% reduction in AI spend
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Monthly Savings', value: `$${monthly}/mo`, color: 'text-emerald' },
            { label: 'Annual Savings', value: `$${annual.toLocaleString()}`, color: 'text-amber-600' },
            { label: 'Savings Score', value: `${score}/100`, color: 'text-charcoal' },
          ].map((k) => (
            <div key={k.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-xs text-muted uppercase tracking-wide font-semibold mb-1">{k.label}</div>
              <div className={`text-2xl font-extrabold tracking-tight ${k.color}`}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Tools */}
        {tools.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
            <div className="text-sm font-bold text-charcoal mb-4">Tools audited</div>
            <div className="space-y-2">
              {tools.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="font-semibold text-sm text-charcoal">{t.tool_name}</span>
                    <span className="text-muted text-xs ml-2">{t.plan}</span>
                  </div>
                  <span className="font-bold text-sm text-coral">${t.monthly_spend}/mo</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recs */}
        {recommendations.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
            <div className="text-sm font-bold text-charcoal mb-4">Top recommendations</div>
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((r: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                    {r.priority === 'high' ? '🔴' : '🟡'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-charcoal">{r.tool_name}</div>
                    <div className="text-xs text-muted mt-0.5">{r.reason}</div>
                    {r.monthly_savings > 0 && (
                      <div className="mt-1.5 text-xs font-bold text-emerald">
                        → Save ${r.monthly_savings}/mo · ${(r.monthly_savings * 12).toLocaleString()}/yr
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-charcoal rounded-2xl p-6 text-center">
          <div className="text-white font-bold text-lg mb-2">Audit your own AI stack</div>
          <p className="text-gray-400 text-sm mb-4">Free, takes 2 minutes, no signup required.</p>
          <a
            href="/audit"
            className="inline-block bg-emerald text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
          >
            ◎ Run Free Audit →
          </a>
        </div>
      </div>
    </main>
  );
}
