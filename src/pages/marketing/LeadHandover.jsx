import { Users, CheckCircle2, Clock } from 'lucide-react';

const LEADS = [
  { id: 'L-1023', name: 'John Doe',    source: 'Google Ads', status: 'Ready',     date: '2024-06-15' },
  { id: 'L-1024', name: 'Sarah Smith', source: 'Meta Ads',   status: 'Submitted', date: '2024-06-15' },
  { id: 'L-1025', name: 'Raj Patel',   source: 'Website',    status: 'Accepted',  date: '2024-06-14' },
];

const STATUS_STYLES = {
  Ready:     'bg-amber-100 text-amber-600',
  Submitted: 'bg-blue-100 text-blue-600',
  Accepted:  'bg-emerald-100 text-emerald-600',
  Rejected:  'bg-rose-100 text-brand-magenta',
};

export default function LeadHandover() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-ink">Lead Handover</h1>
        <p className="text-sm text-brand-ink/60">Move validated leads into the CRM sales pipeline</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card !p-4">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-amber-600" />
            <p className="text-xs font-semibold text-brand-ink/70">Ready for Handover</p>
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600">12</p>
        </div>
        <div className="card !p-4">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-blue-600" />
            <p className="text-xs font-semibold text-brand-ink/70">Pending Acceptance</p>
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-blue-600">5</p>
        </div>
        <div className="card !p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <p className="text-xs font-semibold text-brand-ink/70">Accepted Today</p>
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600">28</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[11px] font-bold uppercase tracking-wider text-brand-ink/60">
            <tr>
              <th className="px-5 py-3">Lead</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-lilac/40">
            {LEADS.map((l) => (
              <tr key={l.id} className="hover:bg-brand-mist/30">
                <td className="px-5 py-3">
                  <p className="font-semibold text-brand-ink">{l.name}</p>
                  <p className="font-mono text-[10px] text-brand-ink/50">{l.id}</p>
                </td>
                <td className="px-5 py-3 text-brand-ink/70">{l.source}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLES[l.status]}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-brand-ink/60">{l.date}</td>
                <td className="px-5 py-3">
                  <button className="text-xs font-semibold text-brand-magenta hover:underline">
                    {l.status === 'Ready' ? 'Submit to Manager' : 'View History'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}