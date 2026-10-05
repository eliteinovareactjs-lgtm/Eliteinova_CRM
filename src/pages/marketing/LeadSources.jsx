import { Plus, Search } from 'lucide-react';

const SOURCES = [
  { id: 1, source: 'Google Ads', campaign: 'Search-CRM',  leads: 450, qualified: 120, converted: 35, cpl: 15.50, status: 'Active' },
  { id: 2, source: 'Meta Ads',   campaign: 'Summer Sale', leads: 320, qualified: 85,  converted: 22, cpl: 8.20,  status: 'Active' },
  { id: 3, source: 'Website',    campaign: 'Organic',     leads: 210, qualified: 65,  converted: 18, cpl: 0,     status: 'Active' },
  { id: 4, source: 'WhatsApp',   campaign: 'Broadcast',   leads: 150, qualified: 40,  converted: 12, cpl: 2.10,  status: 'Active' },
  { id: 5, source: 'Referral',   campaign: 'Partner',     leads: 85,  qualified: 30,  converted: 10, cpl: 5.00,  status: 'Active' },
  { id: 6, source: 'LinkedIn',   campaign: 'B2B',         leads: 60,  qualified: 25,  converted: 8,  cpl: 22.00, status: 'Paused' },
];

export default function LeadSources() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Lead Sources</h1>
          <p className="text-sm text-brand-ink/60">{SOURCES.length} channels tracked</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card">
          <Plus size={14} /> Add Source
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total Sources', value: SOURCES.length, color: 'violet' },
          { label: 'Total Leads',   value: 1275,           color: 'rose' },
          { label: 'Avg. CPL',      value: '$8.80',        color: 'emerald' },
          { label: 'Top Channel',   value: 'Google Ads',   color: 'amber' },
        ].map((s) => (
          <div key={s.label} className="card !p-4">
            <p className="text-[11px] uppercase tracking-wider text-brand-ink/50">{s.label}</p>
            <p className={`mt-1 font-display text-xl font-bold ${
              s.color === 'rose' ? 'text-brand-magenta'
              : s.color === 'emerald' ? 'text-emerald-600'
              : s.color === 'amber' ? 'text-amber-600'
              : 'text-brand-purple'
            }`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[11px] font-bold uppercase tracking-wider text-brand-ink/60">
            <tr>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Campaign</th>
              <th className="px-5 py-3">Leads</th>
              <th className="px-5 py-3">Qualified</th>
              <th className="px-5 py-3">Converted</th>
              <th className="px-5 py-3">CPL</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-lilac/40">
            {SOURCES.map((s) => (
              <tr key={s.id} className="hover:bg-brand-mist/30">
                <td className="px-5 py-3 font-semibold text-brand-ink">{s.source}</td>
                <td className="px-5 py-3 text-brand-ink/70">{s.campaign}</td>
                <td className="px-5 py-3">{s.leads}</td>
                <td className="px-5 py-3 text-brand-purple">{s.qualified}</td>
                <td className="px-5 py-3 text-emerald-600">{s.converted}</td>
                <td className="px-5 py-3">{s.cpl ? `$${s.cpl.toFixed(2)}` : '—'}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    s.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}