import { useMemo, useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';

const MOCK = [
  { id: 1, name: 'Summer Sale 2024', type: 'Promotion', status: 'Active', budget: 5000, leads: 450, cpl: 11.11 },
  { id: 2, name: 'Google Search - CRM', type: 'Lead Generation', status: 'Active', budget: 3000, leads: 120, cpl: 25.00 },
  { id: 3, name: 'Facebook Awareness', type: 'Brand Awareness', status: 'Scheduled', budget: 1500, leads: 0, cpl: 0 },
];

export default function Campaigns() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => MOCK.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Marketing Campaigns</h1>
          <p className="text-sm text-brand-ink/60">{MOCK.length} campaigns</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110">
          <Plus size={14} /> New Campaign
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-1">
          {['All', 'Active', 'Scheduled', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white'
                  : 'text-brand-ink/60 hover:bg-brand-lilac/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[11px] font-bold uppercase tracking-wider text-brand-ink/60">
            <tr>
              <th className="px-5 py-3">Campaign</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Budget</th>
              <th className="px-5 py-3">Leads</th>
              <th className="px-5 py-3">CPL</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-lilac/40">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-brand-mist/30">
                <td className="px-5 py-3 font-semibold text-brand-ink">{c.name}</td>
                <td className="px-5 py-3 text-brand-ink/60">{c.type}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    c.status === 'Active' ? 'bg-emerald-100 text-emerald-600'
                    : c.status === 'Scheduled' ? 'bg-violet-100 text-brand-purple'
                    : 'bg-slate-100 text-slate-600'
                  }`}>{c.status}</span>
                </td>
                <td className="px-5 py-3">${c.budget.toLocaleString()}</td>
                <td className="px-5 py-3">{c.leads}</td>
                <td className="px-5 py-3">{c.cpl ? `$${c.cpl.toFixed(2)}` : '—'}</td>
                <td className="px-5 py-3 text-right">
                  <button className="rounded-lg p-1.5 text-brand-ink/50 hover:bg-brand-lilac"><MoreVertical size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}