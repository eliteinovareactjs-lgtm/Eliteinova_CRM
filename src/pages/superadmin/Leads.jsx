import { useMemo, useState } from 'react';
import { Phone, MessageCircle, Users, PhoneMissed, ClipboardList, X, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS, AGENTS } from '../../data/mockData';

const STATUS_STYLES = {
  Fresh: 'bg-violet-100 text-brand-purple',
  'Follow Up': 'bg-amber-100 text-amber-600',
  Missed: 'bg-rose-100 text-brand-magenta',
  Won: 'bg-emerald-100 text-emerald-600',
};

export default function Leads() {
  const { role, activeWebsiteId } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const agents = AGENTS.filter((a) => a.websiteId === activeWebsiteId);

  const baseLeads = useMemo(() => {
    let leads = LEADS.filter((l) => l.websiteId === activeWebsiteId);
    if (statusFilter !== 'All') leads = leads.filter((l) => l.status === statusFilter);
    return leads;
  }, [activeWebsiteId, statusFilter]);

  const followUps = baseLeads.filter((l) => l.status === 'Follow Up').length;
  const missed = baseLeads.filter((l) => l.status === 'Missed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Leads & Logs</h1>
          <p className="text-sm text-brand-ink/50">All leads captured across sources for this website.</p>
        </div>
        <button className="btn-pill">
          <Phone size={14} /> Live Calls <span className="rounded-full bg-white/25 px-1.5">0</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <div className="card flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-brand-magenta"><Users size={18} /></span>
          <div>
            <p className="text-xs text-brand-ink/50">Total Leads</p>
            <p className="font-display text-lg font-semibold text-brand-ink">{baseLeads.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-brand-purple"><ClipboardList size={18} /></span>
          <div>
            <p className="text-xs text-brand-ink/50">Follow-ups</p>
            <p className="font-display text-lg font-semibold text-brand-ink">{followUps}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><PhoneMissed size={18} /></span>
          <div>
            <p className="text-xs text-brand-ink/50">Missed Follow-ups</p>
            <p className="font-display text-lg font-semibold text-brand-ink">{missed}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500"><Users size={18} /></span>
          <div>
            <p className="text-xs text-brand-ink/50">Active Agents</p>
            <p className="font-display text-lg font-semibold text-brand-ink">
              {agents.filter((a) => a.status === 'Active').length}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {['All', 'Fresh', 'Follow Up', 'Missed', 'Won'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                statusFilter === s
                  ? 'border-transparent bg-brand-button text-white shadow-card'
                  : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <th className="px-3 py-3">S.No</th>
                <th className="px-3 py-3">Lead Source</th>
                <th className="px-3 py-3">Name / Mobile</th>
                <th className="px-3 py-3">Account</th>
                <th className="px-3 py-3">Agent</th>
                <th className="px-3 py-3">Follow-up</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {baseLeads.map((lead, idx) => (
                <tr key={lead.id} className="border-t border-brand-lilac/60 hover:bg-brand-mist/60">
                  <td className="px-3 py-3 text-brand-ink/60">{idx + 1}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-brand-lilac px-2.5 py-1 text-xs font-semibold text-brand-purple">
                      {lead.leadSource}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => setSelected(lead)} className="text-left font-semibold text-brand-ink hover:text-brand-purple">
                      {lead.name}
                    </button>
                    <p className="text-xs text-brand-ink/50">{lead.mobile}</p>
                  </td>
                  <td className="px-3 py-3 text-brand-ink/60">{lead.account}</td>
                  <td className="px-3 py-3 text-brand-ink/70">{lead.assignedAgent}</td>
                  <td className="px-3 py-3 text-brand-ink/60">{lead.followUpDate}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-500'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-emerald-50 p-2 text-emerald-500 hover:bg-emerald-100" title="Call"><Phone size={14} /></button>
                      <button className="rounded-lg bg-emerald-50 p-2 text-emerald-500 hover:bg-emerald-100" title="WhatsApp"><MessageCircle size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {baseLeads.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-10 text-center text-sm text-brand-ink/40">No leads match this filter yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <LeadDrawer lead={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function LeadDrawer({ lead, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-panel">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-brand-ink">Customer Details</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"><X size={18} /></button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-button text-sm font-bold text-white">
            {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </span>
          <div>
            <p className="font-semibold text-brand-ink">{lead.name}</p>
            <p className="text-sm text-brand-ink/50">{lead.mobile}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <Row label="Lead Source" value={lead.leadSource} />
          <Row label="Category" value={lead.category} />
          <Row label="Account" value={lead.account} />
          <Row label="Assigned Agent" value={lead.assignedAgent} />
          <Row label="Status" value={lead.status} />
          <Row label="Follow-up" value={lead.followUpDate} />
        </div>

        <div className="mt-6 flex gap-2">
          <button className="btn-primary flex-1"><Phone size={16} /> Call Now</button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50">
            <Calendar size={16} /> Set Follow-up
          </button>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/40">Call Log</p>
          <p className="mt-3 rounded-xl bg-brand-mist p-4 text-sm text-brand-ink/50">
            No calls logged yet. Once connected to your telephony provider, call recordings and notes will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-brand-lilac/60 pb-2">
      <span className="text-brand-ink/50">{label}</span>
      <span className="font-medium text-brand-ink">{value}</span>
    </div>
  );
}