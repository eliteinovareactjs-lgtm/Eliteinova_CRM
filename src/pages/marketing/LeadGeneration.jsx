import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

const LEADS = [
  { id: 'L-1023', name: 'John Doe',     source: 'Google Ads', campaign: 'Search-CRM', status: 'New',       date: '2024-06-15' },
  { id: 'L-1024', name: 'Sarah Smith',  source: 'Meta Ads',   campaign: 'Summer Sale', status: 'Qualified', date: '2024-06-15' },
  { id: 'L-1025', name: 'Raj Patel',    source: 'Website',    campaign: 'Organic',    status: 'Converted', date: '2024-06-14' },
  { id: 'L-1026', name: 'Emily Chen',   source: 'WhatsApp',   campaign: 'Broadcast',  status: 'Lost',      date: '2024-06-14' },
];

const STATUS_STYLES = {
  New:       'bg-blue-100 text-blue-600',
  Qualified: 'bg-violet-100 text-brand-purple',
  Converted: 'bg-emerald-100 text-emerald-600',
  Lost:      'bg-rose-100 text-brand-magenta',
};

export default function LeadGeneration() {
  const [search, setSearch] = useState('');

  const filtered = LEADS.filter((l) =>
    !search || `${l.name} ${l.id}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Marketing Leads</h1>
          <p className="text-sm text-brand-ink/60">{LEADS.length} total marketing leads</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card">
          <Plus size={14} /> Add Lead
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or lead ID..."
          className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[11px] font-bold uppercase tracking-wider text-brand-ink/60">
            <tr>
              <th className="px-5 py-3">Lead</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Campaign</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-lilac/40">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-brand-mist/30">
                <td className="px-5 py-3">
                  <p className="font-semibold text-brand-ink">{l.name}</p>
                  <p className="font-mono text-[10px] text-brand-ink/50">{l.id}</p>
                </td>
                <td className="px-5 py-3 text-brand-ink/70">{l.source}</td>
                <td className="px-5 py-3 text-brand-ink/70">{l.campaign}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLES[l.status]}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-brand-ink/60">{l.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}