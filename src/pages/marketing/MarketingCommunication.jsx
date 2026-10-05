import { Plus, MessageSquare } from 'lucide-react';

const TEMPLATES = [
  { name: 'Welcome Message',     channel: 'WhatsApp', status: 'Active' },
  { name: 'Campaign Invitation', channel: 'Email',    status: 'Active' },
  { name: 'Promotional Offer',   channel: 'SMS',      status: 'Draft' },
  { name: 'Event Invitation',    channel: 'Email',    status: 'Active' },
  { name: 'Follow-up Message',   channel: 'WhatsApp', status: 'Active' },
];

export default function MarketingCommunication() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
            <MessageSquare size={18} />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Communication</h1>
            <p className="text-sm text-brand-ink/60">Templates & channel activity</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card">
          <Plus size={14} /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { label: 'WhatsApp Sent', value: 1240, color: 'emerald' },
          { label: 'SMS Sent',      value: 850,  color: 'violet' },
          { label: 'Email Sent',    value: 2100, color: 'rose' },
        ].map((c) => (
          <div key={c.label} className="card !p-4">
            <p className="text-[11px] uppercase tracking-wider text-brand-ink/50">{c.label}</p>
            <p className={`mt-1 font-display text-2xl font-bold ${
              c.color === 'rose' ? 'text-brand-magenta'
              : c.color === 'emerald' ? 'text-emerald-600'
              : 'text-brand-purple'
            }`}>{c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[11px] font-bold uppercase tracking-wider text-brand-ink/60">
            <tr>
              <th className="px-5 py-3">Template</th>
              <th className="px-5 py-3">Channel</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-lilac/40">
            {TEMPLATES.map((t) => (
              <tr key={t.name} className="hover:bg-brand-mist/30">
                <td className="px-5 py-3 font-semibold text-brand-ink">{t.name}</td>
                <td className="px-5 py-3 text-brand-ink/70">{t.channel}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    t.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>{t.status}</span>
                </td>
                <td className="px-5 py-3 text-xs font-semibold text-brand-magenta hover:underline">Edit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}