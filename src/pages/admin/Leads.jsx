// src/pages/admin/Leads.jsx
import { useMemo, useState } from 'react';
import {
  Phone, MessageCircle, Users, PhoneMissed, ClipboardList, X, Calendar,
  Search, Filter, Download, ChevronDown, CheckCircle2, Clock, Headphones,
  Play, PhoneIncoming, PhoneOutgoing, UserCheck, MoreVertical, Trash2, Mic,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS, AGENTS } from '../../data/mockData';

const STATUS_STYLES = {
  Fresh: 'bg-violet-100 text-brand-purple',
  'Follow Up': 'bg-amber-100 text-amber-600',
  Missed: 'bg-rose-100 text-brand-magenta',
  Won: 'bg-emerald-100 text-emerald-600',
};

const STATUSES = ['All', 'Fresh', 'Follow Up', 'Missed', 'Won'];

export default function Leads() {
  const { activeWebsiteId, activeWebsite } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentOpen, setAgentOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* ========== FILTERED LEADS ========== */
  const baseLeads = useMemo(() => {
    let leads = LEADS.filter((l) => l.websiteId === activeWebsiteId);
    if (statusFilter !== 'All')
      leads = leads.filter((l) => l.status === statusFilter);
    if (agentFilter !== 'All')
      leads = leads.filter((l) => l.assignedAgent === agentFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      leads = leads.filter((l) => {
        const hay = `${l.name} ${l.mobile} ${l.account} ${l.leadSource}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return leads;
  }, [activeWebsiteId, statusFilter, agentFilter, searchQuery]);

  const followUps = baseLeads.filter((l) => l.status === 'Follow Up').length;
  const missed = baseLeads.filter((l) => l.status === 'Missed').length;
  const won = baseLeads.filter((l) => l.status === 'Won').length;

  /* ========== BULK SELECT ========== */
  const toggleCheck = (id) =>
    setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const toggleAll = () =>
    setChecked((c) =>
      c.length === baseLeads.length ? [] : baseLeads.map((l) => l.id)
    );

  /* ========== EXPORT ========== */
  const handleExport = () => {
    const rows = [
      ['S.No', 'Name', 'Mobile', 'Source', 'Category', 'Account', 'Agent', 'Follow-up', 'Status'],
      ...baseLeads.map((l, i) => [
        i + 1,
        l.name,
        l.mobile,
        l.leadSource,
        l.category,
        l.account,
        l.assignedAgent,
        l.followUpDate,
        l.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${activeWebsite?.name || 'website'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters =
    statusFilter !== 'All' || agentFilter !== 'All' || searchQuery;

  const clearFilters = () => {
    setStatusFilter('All');
    setAgentFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Leads & Logs
          </h1>
          <p className="text-sm text-brand-ink/50">
            All leads for{' '}
            <span className="font-semibold text-brand-purple">
              {activeWebsite?.name}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-pill">
            <Phone size={14} /> Live Calls{' '}
            <span className="rounded-full bg-white/25 px-1.5">0</span>
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <MiniCard
          icon={Users}
          label="Total Leads"
          value={baseLeads.length}
          tint="rose"
        />
        <MiniCard
          icon={ClipboardList}
          label="Follow-ups"
          value={followUps}
          tint="purple"
        />
        <MiniCard
          icon={PhoneMissed}
          label="Missed"
          value={missed}
          tint="amber"
        />
        <MiniCard
          icon={CheckCircle2}
          label="Won"
          value={won}
          tint="emerald"
        />
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, account..."
            className="w-full rounded-xl border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac"
            >
              <X size={14} className="text-brand-ink/50" />
            </button>
          )}
        </div>

        {/* Agent filter */}
        <div className="relative">
          <button
            onClick={() => setAgentOpen((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
          >
            <Filter size={14} className="text-brand-purple" />
            Agent:{' '}
            <span className="text-brand-purple">{agentFilter}</span>
            <ChevronDown size={14} className="text-brand-ink/40" />
          </button>
          {agentOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setAgentOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <button
                  onClick={() => {
                    setAgentFilter('All');
                    setAgentOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    agentFilter === 'All'
                      ? 'bg-brand-lilac font-semibold text-brand-purple'
                      : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                  }`}
                >
                  All Agents
                </button>
                {agents.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setAgentFilter(a.name);
                      setAgentOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      agentFilter === a.name
                        ? 'bg-brand-lilac font-semibold text-brand-purple'
                        : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ================= LEADS TABLE ================= */}
      <div className="card !p-0">
        {/* Status chips */}
        <div className="border-b border-brand-lilac/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  statusFilter === s
                    ? 'border-transparent bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card'
                    : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {checked.length > 0 && (
          <div className="flex items-center justify-between border-b border-brand-lilac bg-brand-mist/60 px-5 py-3">
            <p className="text-sm font-semibold text-brand-ink">
              {checked.length} selected
            </p>
            <div className="relative">
              <button
                onClick={() => setBulkOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-button px-3 py-1.5 text-xs font-semibold text-white"
              >
                Bulk Action <ChevronDown size={12} />
              </button>
              {bulkOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setBulkOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                    {[
                      { label: 'Assign Agent', icon: Users },
                      { label: 'Mark as Won', icon: CheckCircle2 },
                      { label: 'Set Follow-up', icon: Clock },
                      { label: 'Delete', icon: Trash2 },
                    ].map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => setBulkOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-ink/70 hover:bg-brand-lilac/40"
                      >
                        <Icon size={14} /> {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      checked.length === baseLeads.length && baseLeads.length > 0
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-3 py-3">S.No</th>
                <th className="px-3 py-3">Lead Source</th>
                <th className="px-3 py-3">Name / Mobile</th>
                <th className="px-3 py-3">Account</th>
                <th className="px-3 py-3">Agent</th>
                <th className="px-3 py-3">Follow-up</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Recordings</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {baseLeads.map((lead, idx) => (
                <tr
                  key={lead.id}
                  className={`border-t border-brand-lilac/60 hover:bg-brand-mist/60 ${
                    checked.includes(lead.id) ? 'bg-brand-mist/40' : ''
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={checked.includes(lead.id)}
                      onChange={() => toggleCheck(lead.id)}
                    />
                  </td>
                  <td className="px-3 py-3 text-brand-ink/60">{idx + 1}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-brand-lilac px-2.5 py-1 text-xs font-semibold text-brand-purple">
                      {lead.leadSource}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setSelected(lead)}
                      className="text-left font-semibold text-brand-ink hover:text-brand-purple"
                    >
                      {lead.name}
                    </button>
                    <p className="text-xs text-brand-ink/50">{lead.mobile}</p>
                  </td>
                  <td className="px-3 py-3 text-brand-ink/60">
                    {lead.account}
                  </td>
                  <td className="px-3 py-3 text-brand-ink/70">
                    {lead.assignedAgent}
                  </td>
                  <td className="px-3 py-3 text-brand-ink/60">
                    {lead.followUpDate}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        STATUS_STYLES[lead.status] ||
                        'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setSelected(lead)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-brand-purple hover:bg-violet-100"
                    >
                      <Headphones size={12} />
                      {2 + (lead.id % 3)}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg bg-emerald-50 p-2 text-emerald-500 hover:bg-emerald-100"
                        title="Call"
                      >
                        <Phone size={14} />
                      </button>
                      <button
                        className="rounded-lg bg-emerald-50 p-2 text-emerald-500 hover:bg-emerald-100"
                        title="WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </button>
                      <button
                        onClick={() => setSelected(lead)}
                        className="rounded-lg border border-brand-lilac p-2 text-brand-ink/50 hover:bg-brand-lilac/40"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {baseLeads.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-10 text-center text-sm text-brand-ink/40"
                  >
                    No leads match this filter yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <LeadDrawer lead={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ================= MINI CARD ================= */
function MiniCard({ icon: Icon, label, value, tint = 'rose' }) {
  const tints = {
    rose: 'bg-rose-50 text-brand-magenta',
    purple: 'bg-violet-50 text-brand-purple',
    amber: 'bg-amber-50 text-amber-500',
    emerald: 'bg-emerald-50 text-emerald-500',
  };
  return (
    <div className="card flex items-center gap-3">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tints[tint]}`}
      >
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs text-brand-ink/50">{label}</p>
        <p className="font-display text-lg font-semibold text-brand-ink">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ================= LEAD DRAWER (with recordings) ================= */
function LeadDrawer({ lead, onClose }) {
  const recordings = useMemo(
    () => [
      {
        id: 1,
        type: 'inbound',
        duration: '3:42',
        date: 'Today · 10:24 AM',
        agent: lead.assignedAgent,
        summary: 'Discussing pricing options.',
      },
      {
        id: 2,
        type: 'outbound',
        duration: '1:18',
        date: 'Yesterday · 4:12 PM',
        agent: lead.assignedAgent,
        summary: 'Follow-up on brochure.',
      },
      {
        id: 3,
        type: 'inbound',
        duration: '0:47',
        date: '3 days ago · 11:05 AM',
        agent: 'Missed',
        summary: 'Missed call — no answer.',
      },
    ],
    [lead]
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-brand-ink">
            Customer Details
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer */}
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
              {lead.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{lead.name}</p>
              <p className="text-sm text-brand-ink/50">{lead.mobile}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-500'
              }`}
            >
              {lead.status}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <Row label="Lead Source" value={lead.leadSource} />
            <Row label="Category" value={lead.category} />
            <Row label="Account" value={lead.account} />
            <Row label="Assigned Agent" value={lead.assignedAgent} />
            <Row label="Follow-up" value={lead.followUpDate} />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="btn-primary flex-1">
              <Phone size={16} /> Call Now
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50">
              <Calendar size={16} /> Set Follow-up
            </button>
          </div>

          {/* ================= RECORDINGS ================= */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <Mic size={12} />
                Call Recordings
              </p>
              <span className="text-xs text-brand-ink/50">
                {recordings.length} recordings
              </span>
            </div>

            <div className="space-y-2.5">
              {recordings.map((rec) => (
                <RecordingRow key={rec.id} rec={rec} />
              ))}
            </div>
          </div>

          {/* Transcript sample */}
          <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              Latest transcript snippet
            </p>
            <p className="text-sm italic leading-relaxed text-brand-ink/70">
              "Agent: Good afternoon, this is {lead.assignedAgent} from Eliteinova Global. Am I speaking with{' '}
              {lead.name.split(' ')[0]}?
              <br />
              Customer: Yes, speaking.
              <br />
              Agent: I'm calling regarding your enquiry about property options —
              do you have a moment?"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= RECORDING ROW ================= */
function RecordingRow({ rec }) {
  const isMissed = rec.agent === 'Missed';
  return (
    <div className="rounded-xl border border-brand-lilac bg-white p-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isMissed
              ? 'bg-rose-50 text-rose-500'
              : rec.type === 'inbound'
              ? 'bg-emerald-50 text-emerald-500'
              : 'bg-violet-50 text-brand-purple'
          }`}
        >
          {isMissed ? (
            <PhoneMissed size={16} />
          ) : rec.type === 'inbound' ? (
            <PhoneIncoming size={16} />
          ) : (
            <PhoneOutgoing size={16} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-ink">
            {isMissed
              ? 'Missed call'
              : rec.type === 'inbound'
              ? 'Inbound call'
              : 'Outbound call'}
          </p>
          <p className="text-xs text-brand-ink/50">
            {rec.date} • Agent: {rec.agent}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-semibold text-brand-ink/60">
            <Clock size={10} />
            {rec.duration}
          </span>
          {!isMissed && (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card"
              title="Play recording"
            >
              <Play size={12} fill="currentColor" />
            </button>
          )}
        </div>
      </div>
      {rec.summary && (
        <p className="mt-2 border-t border-brand-lilac/60 pt-2 text-xs text-brand-ink/60">
          {rec.summary}
        </p>
      )}
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