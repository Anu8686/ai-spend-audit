import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — AI Spend Audit',
  robots: { index: false, follow: false },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function fetchStats() {
  try {
    const [auditsRes, leadsRes] = await Promise.all([
      fetch(`${API_URL}/api/admin/stats`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/admin/leads`, { cache: 'no-store' }),
    ]);
    const stats = auditsRes.ok ? await auditsRes.json() : null;
    const leads = leadsRes.ok ? await leadsRes.json() : [];
    return { stats, leads };
  } catch {
    return { stats: null, leads: [] };
  }
}

export default async function AdminPage() {
  const { stats, leads } = await fetchStats();

  // Mock data for display when backend not connected
  const display = stats ?? {
    total_audits: 142,
    total_leads: 38,
    total_savings_generated: 48600,
    avg_monthly_savings: 342,
    top_tools: ['ChatGPT', 'Cursor', 'GitHub Copilot'],
  };

  return (
    <main className="min-h-screen bg-ivory">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-charcoal rounded-lg flex items-center justify-center text-white text-sm font-bold">A</div>
          <h1 className="text-2xl font-extrabold tracking-tight text-charcoal">Admin Dashboard</h1>
          <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">Private</span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Audits', value: display.total_audits, color: 'text-charcoal' },
            { label: 'Leads Captured', value: display.total_leads, color: 'text-emerald' },
            { label: 'Savings Generated', value: `$${Number(display.total_savings_generated).toLocaleString()}`, color: 'text-amber-600' },
            { label: 'Avg Monthly Savings', value: `$${display.avg_monthly_savings}/mo`, color: 'text-coral' },
          ].map((k) => (
            <div key={k.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-muted uppercase tracking-wide font-semibold mb-1">{k.label}</div>
              <div className={`text-2xl font-extrabold tracking-tight ${k.color}`}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Leads table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-charcoal">Recent Leads</h2>
            <span className="text-xs text-muted">{leads.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Email', 'Company', 'Role', 'Monthly Savings', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  // Placeholder rows
                  [
                    { email: 'jordan@buildstack.io', company: 'Buildstack', role: 'CTO', savings: 180, date: '2 hours ago' },
                    { email: 'sara@draftly.com', company: 'Draftly', role: 'Founder', savings: 80, date: '5 hours ago' },
                    { email: 'marcus@flowmatic.dev', company: 'Flowmatic', role: 'Solo Founder', savings: 400, date: '1 day ago' },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium">{r.email}</td>
                      <td className="px-5 py-3 text-muted">{r.company}</td>
                      <td className="px-5 py-3 text-muted">{r.role}</td>
                      <td className="px-5 py-3 font-bold text-emerald">${r.savings}/mo</td>
                      <td className="px-5 py-3 text-muted">{r.date}</td>
                    </tr>
                  ))
                ) : (
                  leads.map((lead: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium">{lead.email}</td>
                      <td className="px-5 py-3 text-muted">{lead.company ?? '—'}</td>
                      <td className="px-5 py-3 text-muted">{lead.role ?? '—'}</td>
                      <td className="px-5 py-3 font-bold text-emerald">
                        {lead.monthly_savings ? `$${lead.monthly_savings}/mo` : '—'}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted text-center mt-6">
          Showing live data from Supabase when backend is connected.
        </p>
      </div>
    </main>
  );
}
