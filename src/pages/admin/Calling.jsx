// src/pages/admin/Calling.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Headphones,
  Play, Pause, Search, X, ChevronDown, Download, Eye, Filter, AlertCircle,
  CheckCircle2, Mic, Users, PhoneCall, Calendar, MoreVertical, Copy,
  ArrowRight, Percent, Timer, TrendingUp, TrendingDown, StickyNote,
  Hash, Save, Pencil, Trash2, Plus, Voicemail, UserCheck, UserX,
  SkipForward, Radio, ListChecks, Megaphone, CalendarClock, Repeat,
  PhoneOff, Target, BarChart3, XCircle, CircleDot, FileText, Volume2,
  VolumeX, RotateCcw, Clock3, MessageSquare, ClipboardList, PhoneForwarded,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CALLS as INITIAL_CALLS, AGENTS, LEADS } from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'all',        label: 'All Calls',    icon: Phone },
  { key: 'inbound',    label: 'Inbound',      icon: PhoneIncoming },
  { key: 'outbound',   label: 'Outbound',     icon: PhoneOutgoing },
  { key: 'missed',     label: 'Missed',       icon: PhoneMissed },
  { key: 'abandoned',  label: 'Abandoned',    icon: XCircle },
  { key: 'queue',      label: 'Queue',        icon: ListChecks },
  { key: 'campaigns',  label: 'Campaigns',    icon: Megaphone },
  { key: 'scheduled',  label: 'Scheduled',    icon: CalendarClock },
  { key: 'callbacks',  label: 'Callbacks',    icon: Repeat },
  { key: 'recordings', label: 'Recordings',   icon: Mic },
  { key: 'disposition',label: 'Disposition',  icon: TrendingUp },
  { key: 'agents',     label: 'Agent-wise',   icon: Users },
];

const DISPOSITION_COLORS = {
  Interested:        'bg-emerald-100 text-emerald-600',
  Converted:         'bg-emerald-100 text-emerald-600',
  'Follow Up':       'bg-amber-100 text-amber-600',
  'No Answer':       'bg-rose-100 text-rose-500',
  'Not Interested':  'bg-gray-100 text-gray-600',
  'Wrong Number':    'bg-rose-100 text-rose-500',
  Busy:              'bg-amber-100 text-amber-600',
  Callback:          'bg-blue-100 text-blue-600',
  Voicemail:         'bg-violet-100 text-brand-purple',
};

const STORAGE_PREFIX = 'calling:';

/* ✅ FIX: extracted so both the modal and helpers share the same list */
const DISPOSITION_OPTIONS = [
  'Interested', 'Converted', 'Follow Up', 'No Answer',
  'Not Interested', 'Wrong Number', 'Busy', 'Callback', 'Voicemail',
];

/* ✅ FIX: which tabs render the CallsListTab */
const CALLS_LIST_TABS = ['all', 'inbound', 'outbound', 'missed', 'abandoned'];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) || typeof parsed === 'object') return parsed;
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
};

/* ✅ FIX: handles H:MM:SS durations too */
const parseDuration = (d) => {
  if (!d) return 0;
  const parts = String(d).split(':').map(Number);
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
};

/* ✅ FIX: handles hours in display */
const formatDuration = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}h ${m}m ${ss.toString().padStart(2, '0')}s`;
  return `${m}m ${ss.toString().padStart(2, '0')}s`;
};

const formatRelative = (iso) => {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};

const initials = (name) =>
  (name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

/* ✅ FIX: robust callback detection */
const isCallback = (s) => s.kind === 'callback' || /callback/i.test(s.reason || '');

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Calling() {
  const { activeWebsiteId, activeWebsite } = useAuth();

  const [tab, setTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [viewingCall, setViewingCall] = useState(null);
  const [playingRecording, setPlayingRecording] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [editingDisposition, setEditingDisposition] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [allCalls, setAllCalls] = useState(() =>
    loadState(`list:${activeWebsiteId}`, INITIAL_CALLS.filter((c) => c.projectId === activeWebsiteId))
  );
  const [queue, setQueue] = useState(() => loadState(`queue:${activeWebsiteId}`, []));
  const [campaigns, setCampaigns] = useState(() => loadState(`campaigns:${activeWebsiteId}`, []));
  const [scheduled, setScheduled] = useState(() => loadState(`scheduled:${activeWebsiteId}`, []));

  useEffect(() => {
    setAllCalls(loadState(`list:${activeWebsiteId}`, INITIAL_CALLS.filter((c) => c.projectId === activeWebsiteId)));
    setQueue(loadState(`queue:${activeWebsiteId}`, []));
    setCampaigns(loadState(`campaigns:${activeWebsiteId}`, []));
    setScheduled(loadState(`scheduled:${activeWebsiteId}`, []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebsiteId]);

  useEffect(() => { saveState(`list:${activeWebsiteId}`, allCalls); }, [allCalls, activeWebsiteId]);
  useEffect(() => { saveState(`queue:${activeWebsiteId}`, queue); }, [queue, activeWebsiteId]);
  useEffect(() => { saveState(`campaigns:${activeWebsiteId}`, campaigns); }, [campaigns, activeWebsiteId]);
  useEffect(() => { saveState(`scheduled:${activeWebsiteId}`, scheduled); }, [scheduled, activeWebsiteId]);

  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  const scopedCalls = useMemo(
    () => allCalls.filter((c) => c.projectId === activeWebsiteId),
    [allCalls, activeWebsiteId]
  );

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const logCallUpdate = (callId, updates) => {
    setAllCalls((p) => p.map((c) => (c.id === callId ? { ...c, ...updates } : c)));
  };

  const handleUpdateNote = (callId, notes) => {
    logCallUpdate(callId, { notes });
    showToast('Note saved');
    setEditingNotes(null);
  };

  const handleUpdateDisposition = (callId, disposition) => {
    logCallUpdate(callId, { disposition });
    showToast('Disposition updated');
    setEditingDisposition(null);
  };

  const handleDeleteCall = (id, name) => {
    setConfirmDelete({
      kind: 'call',
      id,
      name,
      message: `This will permanently remove the call record for "${name}".`,
    });
  };

  /* ✅ FIX: handles all delete kinds */
  const performDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.kind === 'call') {
      setAllCalls((p) => p.filter((c) => c.id !== confirmDelete.id));
      showToast(`Call record removed`, 'error');
    } else if (confirmDelete.kind === 'campaign') {
      setCampaigns((p) => p.filter((c) => c.id !== confirmDelete.id));
      showToast(`Campaign removed`, 'error');
    } else if (confirmDelete.kind === 'scheduled') {
      setScheduled((p) => p.filter((s) => s.id !== confirmDelete.id));
      showToast('Scheduled call removed', 'error');
    } else if (confirmDelete.kind === 'queue') {
      setQueue((p) => p.filter((q) => q.id !== confirmDelete.id));
      showToast('Removed from queue', 'error');
    }
    setConfirmDelete(null);
  };

  /* ✅ FIX: prevents duplicate callbacks + tags with `kind` */
  const handleConvertToCallback = (call) => {
    if (scheduled.some((s) => s.originalCallId === call.id)) {
      showToast('Callback already scheduled for this call', 'error');
      return;
    }
    const newScheduled = {
      id: uid('sch'),
      projectId: activeWebsiteId,
      customer: call.customer,
      mobile: call.mobile,
      agent: call.agent || 'Unassigned',
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      reason: 'Callback from missed call',
      kind: 'callback',
      originalCallId: call.id,
      status: 'Scheduled',
    };
    setScheduled((p) => [newScheduled, ...p]);
    logCallUpdate(call.id, { disposition: 'Callback', callbackScheduled: true });
    showToast(`Callback scheduled for ${call.customer}`);
  };

  const handleScheduleCall = (data) => {
    const newScheduled = {
      id: uid('sch'),
      projectId: activeWebsiteId,
      kind: data.kind || 'scheduled',
      ...data,
      status: 'Scheduled',
    };
    setScheduled((p) => [newScheduled, ...p]);
    showToast(`Call scheduled for ${data.customer}`);
  };

  const handleAddToQueue = (call) => {
    if (queue.some((q) => q.mobile === call.mobile)) {
      showToast('Already in queue', 'error');
      return;
    }
    setQueue((p) => [
      ...p,
      {
        id: uid('q'),
        projectId: activeWebsiteId,
        customer: call.customer,
        mobile: call.mobile,
        addedAt: new Date().toISOString(),
      },
    ]);
    showToast(`${call.customer} added to queue`);
  };

  /* ✅ FIX: asks for confirmation before removing from queue */
  const handleRemoveFromQueue = (id) => {
    setConfirmDelete({
      kind: 'queue',
      id,
      name: queue.find((q) => q.id === id)?.customer || 'Queue item',
      message: 'Remove this number from the queue?',
    });
  };

  const handleAddCampaign = (data) => {
    const newCampaign = {
      id: uid('cmp'),
      projectId: activeWebsiteId,
      ...data,
      createdAt: Date.now(),
      status: 'Active',
      progress: 0,
      totalCalls: 0,
      connected: 0,
      converted: 0,
    };
    setCampaigns((p) => [newCampaign, ...p]);
    showToast(`Campaign "${data.name}" created`);
  };

  const handleUpdateCampaignStatus = (id, status) => {
    setCampaigns((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
    showToast(`Campaign ${status.toLowerCase()}`);
  };

  const filtered = useMemo(() => {
    let rows = [...scopedCalls];

    if (tab === 'inbound')   rows = rows.filter((c) => c.type === 'inbound' && c.status !== 'missed');
    if (tab === 'outbound')  rows = rows.filter((c) => c.type === 'outbound');
    if (tab === 'missed')    rows = rows.filter((c) => c.status === 'missed');
    if (tab === 'abandoned') rows = rows.filter((c) => c.status === 'abandoned');
    if (tab === 'recordings') rows = rows.filter((c) => c.status === 'connected');

    if (statusFilter !== 'All') {
      rows = rows.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (agentFilter !== 'All') {
      rows = rows.filter((c) => c.agent === agentFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((c) =>
        `${c.customer} ${c.mobile} ${c.agent} ${c.id}`.toLowerCase().includes(q)
      );
    }
    return rows.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  }, [scopedCalls, tab, statusFilter, agentFilter, searchQuery]);

  const summary = useMemo(() => {
    const total = scopedCalls.length;
    const inbound = scopedCalls.filter((c) => c.type === 'inbound').length;
    const outbound = scopedCalls.filter((c) => c.type === 'outbound').length;
    const connected = scopedCalls.filter((c) => c.status === 'connected').length;
    const missed = scopedCalls.filter((c) => c.status === 'missed').length;
    const abandoned = scopedCalls.filter((c) => c.status === 'abandoned').length;
    const totalSec = scopedCalls.reduce((s, c) => s + parseDuration(c.duration), 0);
    const avgDuration = total > 0 ? Math.round(totalSec / total) : 0;
    const connectionRate = total > 0 ? Math.round((connected / total) * 100) : 0;

    return { total, inbound, outbound, connected, missed, abandoned, avgDuration, connectionRate, totalSec };
  }, [scopedCalls]);

  const dispositionBreakdown = useMemo(() => {
    const map = {};
    scopedCalls.forEach((c) => {
      const key = c.disposition || 'Unknown';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [scopedCalls]);

  const agentBreakdown = useMemo(() => {
    return agents.map((agent) => {
      const calls = scopedCalls.filter((c) => c.agent === agent.name);
      const connected = calls.filter((c) => c.status === 'connected').length;
      const totalSec = calls.reduce((s, c) => s + parseDuration(c.duration), 0);
      return {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        calls: calls.length,
        connected,
        missed: calls.filter((c) => c.status === 'missed').length,
        totalSec,
        avgSec: calls.length ? Math.round(totalSec / calls.length) : 0,
        connectionRate: calls.length ? Math.round((connected / calls.length) * 100) : 0,
      };
    }).sort((a, b) => b.calls - a.calls);
  }, [agents, scopedCalls]);

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast('No calls to export', 'error');
      return;
    }
    const rows = [
      ['ID', 'Customer', 'Mobile', 'Type', 'Status', 'Disposition', 'Duration', 'Agent', 'Date'],
      ...filtered.map((c) => [
        c.id, c.customer, c.mobile, c.type, c.status,
        c.disposition || '', c.duration, c.agent, c.date,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calls-${activeWebsite?.name || 'website'}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} calls`);
  };

  const hasFilters =
    statusFilter !== 'All' || agentFilter !== 'All' || searchQuery.trim();

  const clearFilters = () => {
    setStatusFilter('All');
    setAgentFilter('All');
    setSearchQuery('');
  };

  /* ✅ FIX: uses `isCallback` helper */
  const counts = {
    all: summary.total,
    inbound: summary.inbound,
    outbound: summary.outbound,
    missed: summary.missed,
    abandoned: summary.abandoned,
    queue: queue.length,
    campaigns: campaigns.length,
    scheduled: scheduled.length,
    callbacks: scheduled.filter(isCallback).length,
    recordings: scopedCalls.filter((c) => c.status === 'connected').length,
    disposition: dispositionBreakdown.length,
    agents: agents.length,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Calling</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Phone size={13} className="text-brand-magenta" />
              All calls for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>
          <button
            onClick={handleExport}
            className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md"
          >
            <Download size={14} className="transition-transform group-hover:translate-y-0.5" /> Export
          </button>
        </div>

        {/* ═══ KPI STRIP ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Call Analytics</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
          </div>

          {/* ✅ FIX: 4 per row on large (5 cards → 4 + 1) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <KpiCard icon={PhoneCall}  label="Total Calls"   value={summary.total}          sub={`${summary.inbound} in · ${summary.outbound} out`} color="purple"  active={tab === 'all'}        onClick={() => setTab('all')}        delay={0} />
            <KpiCard icon={Headphones} label="Connected"     value={summary.connected}      sub={`${summary.connectionRate}% rate`}                 color="emerald" active={tab === 'inbound'}    onClick={() => setTab('inbound')}    delay={40} />
            <KpiCard icon={PhoneMissed} label="Missed"       value={summary.missed}         sub="Needs follow-up"                                   color="rose"    active={tab === 'missed'}     onClick={() => setTab('missed')}     delay={80} />
            <KpiCard icon={XCircle}    label="Abandoned"     value={summary.abandoned}      sub="Hung up early"                                     color="amber"   active={tab === 'abandoned'}  onClick={() => setTab('abandoned')}  delay={120} />
            <KpiCard icon={Timer}      label="Avg Duration"  value={formatDuration(summary.avgDuration)} sub={`${formatDuration(summary.totalSec)} total`} color="purple" active={false} onClick={() => {}} delay={160} />
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'}`}>
                    {counts[key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ TAB CONTENT ═══ */}
        {CALLS_LIST_TABS.includes(tab) && (
          <CallsListTab
            calls={filtered}
            agents={agents}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            agentFilter={agentFilter}
            setAgentFilter={setAgentFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusOpen={statusOpen}
            setStatusOpen={setStatusOpen}
            agentOpen={agentOpen}
            setAgentOpen={setAgentOpen}
            hasFilters={hasFilters}
            onClearFilters={clearFilters}
            onView={(c) => setViewingCall(c)}
            onPlay={(c) => setPlayingRecording({ call: c, name: `Recording-${c.id}.mp3` })}
            onNote={(c) => setEditingNotes(c)}
            onDisposition={(c) => setEditingDisposition(c)}
            onCallback={handleConvertToCallback}
            onAddToQueue={handleAddToQueue}
            onDelete={(c) => handleDeleteCall(c.id, c.customer)}
            showToast={showToast}
          />
        )}

        {tab === 'queue' && (
          <QueueTab
            queue={queue}
            onRemove={handleRemoveFromQueue}
            onCall={(q) => { window.location.href = `tel:${q.mobile}`; }}
          />
        )}

        {tab === 'campaigns' && (
          <CampaignsTab
            campaigns={campaigns}
            onAdd={handleAddCampaign}
            onUpdateStatus={handleUpdateCampaignStatus}
            onDelete={(c) => setConfirmDelete({
              kind: 'campaign', id: c.id, name: c.name,
              message: `This will remove the campaign "${c.name}".`,
            })}
          />
        )}

        {tab === 'scheduled' && (
          <ScheduledTab
            scheduled={scheduled}
            agents={agents}
            onSchedule={(data) => handleScheduleCall({ ...data, kind: 'scheduled' })}
            onCall={(s) => { window.location.href = `tel:${s.mobile}`; }}
            onCancel={(id) => {
              setConfirmDelete({
                kind: 'scheduled',
                id,
                name: scheduled.find((s) => s.id === id)?.customer || 'Scheduled call',
                message: 'Cancel this scheduled call?',
              });
            }}
          />
        )}

        {tab === 'callbacks' && (
          <ScheduledTab
            scheduled={scheduled.filter(isCallback)}
            agents={agents}
            onSchedule={(data) => handleScheduleCall({ ...data, kind: 'callback' })}
            onCall={(s) => { window.location.href = `tel:${s.mobile}`; }}
            onCancel={(id) => {
              setConfirmDelete({
                kind: 'scheduled',
                id,
                name: scheduled.find((s) => s.id === id)?.customer || 'Callback',
                message: 'Cancel this callback?',
              });
            }}
            emptyMessage="No callbacks pending"
          />
        )}

        {tab === 'recordings' && (
          <RecordingsTab
            calls={scopedCalls.filter((c) => c.status === 'connected')}
            onPlay={(c) => setPlayingRecording({ call: c, name: `Recording-${c.id}.mp3` })}
          />
        )}

        {tab === 'disposition' && (
          <DispositionTab
            breakdown={dispositionBreakdown}
            total={summary.total}
          />
        )}

        {tab === 'agents' && (
          <AgentWiseTab
            breakdown={agentBreakdown}
            onViewCalls={(agentName) => {
              setAgentFilter(agentName);
              setTab('all');
            }}
          />
        )}

        {/* ═══ DRAWERS / MODALS ═══ */}
        {viewingCall && (
          <CallDetailsDrawer
            call={viewingCall}
            onClose={() => setViewingCall(null)}
            onPlay={() => setPlayingRecording({ call: viewingCall, name: `Recording-${viewingCall.id}.mp3` })}
            onCopy={(t) => { navigator.clipboard?.writeText(t); showToast('Copied'); }}
            onNote={() => { setEditingNotes(viewingCall); setViewingCall(null); }}
            onDisposition={() => { setEditingDisposition(viewingCall); setViewingCall(null); }}
            onCallback={() => { handleConvertToCallback(viewingCall); setViewingCall(null); }}
            onAddToQueue={() => { handleAddToQueue(viewingCall); setViewingCall(null); }}
            onDelete={() => { handleDeleteCall(viewingCall.id, viewingCall.customer); setViewingCall(null); }}
          />
        )}

        {playingRecording && (
          <RecordingModal
            call={playingRecording.call}
            name={playingRecording.name}
            onClose={() => setPlayingRecording(null)}
          />
        )}

        {editingNotes && (
          <NotesModal
            call={editingNotes}
            onClose={() => setEditingNotes(null)}
            onSave={(notes) => handleUpdateNote(editingNotes.id, notes)}
          />
        )}

        {editingDisposition && (
          <DispositionModal
            call={editingDisposition}
            onClose={() => setEditingDisposition(null)}
            onSave={(d) => handleUpdateDisposition(editingDisposition.id, d)}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title={`Remove ${confirmDelete.kind}?`}
            message={confirmDelete.message}
            confirmLabel={`Remove`}
            onCancel={() => setConfirmDelete(null)}
            onConfirm={performDelete}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KPI CARD
   ═══════════════════════════════════════════════════════════════ */
function KpiCard({ icon: Icon, label, value, sub, color = 'purple', active, onClick, delay = 0 }) {
  const numericValue = typeof value === 'number' ? value : 0;
  const displayValue = useAnimatedCount(numericValue);
  const isNumeric = typeof value === 'number';

  const themes = {
    purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'from-violet-50 via-violet-50/30 to-white', iconBg: 'bg-violet-100 text-brand-purple border-violet-200', bar: 'from-brand-purple to-brand-magenta', glow: 'bg-brand-purple/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]', valueColor: 'text-brand-purple', ring: 'ring-violet-300' },
    emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'from-emerald-50 via-emerald-50/30 to-white', iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'from-emerald-500 to-emerald-400', glow: 'bg-emerald-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]', valueColor: 'text-emerald-600', ring: 'ring-emerald-300' },
    amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'from-amber-50 via-amber-50/30 to-white', iconBg: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'from-amber-500 to-orange-400', glow: 'bg-amber-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]', valueColor: 'text-amber-600', ring: 'ring-amber-300' },
    rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'from-rose-50 via-rose-50/30 to-white', iconBg: 'bg-rose-100 text-brand-magenta border-rose-200', bar: 'from-brand-magenta to-brand-purple', glow: 'bg-brand-magenta/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]', valueColor: 'text-brand-magenta', ring: 'ring-rose-300' },
  };
  const t = themes[color] || themes.purple;

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/30 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 hover:-translate-y-1.5 animate-fade-slide-in ${t.border} ${active ? `ring-2 ${t.ring} ${t.shadow}` : t.shadow}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100 ${active ? 'scale-x-100' : ''}`} />
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${active ? 'opacity-100' : ''}`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${active ? 'opacity-100' : ''}`} />
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${t.iconBg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} />
        </span>
        {active && (
          <span className="flex items-center gap-1 rounded-full bg-brand-magenta/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-magenta ring-1 ring-brand-magenta/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-magenta opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-magenta" />
            </span>
            Active
          </span>
        )}
      </div>

      <div className="relative z-10 w-full">
        <p className={`font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {isNumeric ? displayValue : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </button>
  );
}

function useAnimatedCount(target, duration = 600) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    const to = Number(target) || 0;
    const tick = (now) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display.toLocaleString();
}

/* ═══════════════════════════════════════════════════════════════
   CALLS LIST TAB
   ═══════════════════════════════════════════════════════════════ */
function CallsListTab({
  calls, agents,
  statusFilter, setStatusFilter,
  agentFilter, setAgentFilter,
  searchQuery, setSearchQuery,
  statusOpen, setStatusOpen,
  agentOpen, setAgentOpen,
  hasFilters, onClearFilters,
  onView, onPlay, onNote, onDisposition, onCallback, onAddToQueue, onDelete,
  showToast,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, mobile, agent…"
            className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac">
              <X size={14} className="text-brand-ink/50" />
            </button>
          )}
        </div>

        <DropdownFilter label="Status" icon={Filter} value={statusFilter} options={['All', 'Connected', 'Missed', 'Failed', 'Abandoned']}
          open={statusOpen}
          onToggle={() => { setStatusOpen((s) => !s); setAgentOpen(false); }}
          onChange={(v) => { setStatusFilter(v); setStatusOpen(false); }}
        />

        <DropdownFilter label="Agent" icon={Users} value={agentFilter} options={['All', ...agents.map((a) => a.name)]}
          open={agentOpen}
          onToggle={() => { setAgentOpen((s) => !s); setStatusOpen(false); }}
          onChange={(v) => { setAgentFilter(v); setAgentOpen(false); }}
        />

        {hasFilters && (
          <button onClick={onClearFilters} className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {calls.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={onClearFilters} />
      ) : (
        <div className="space-y-2">
          {calls.map((call) => (
            <CallRow
              key={call.id}
              call={call}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              onView={() => onView(call)}
              onPlay={() => onPlay(call)}
              onNote={() => onNote(call)}
              onDisposition={() => onDisposition(call)}
              onCallback={() => onCallback(call)}
              onAddToQueue={() => onAddToQueue(call)}
              onDelete={() => onDelete(call)}
              onCopy={() => { navigator.clipboard?.writeText(call.mobile); showToast?.('Number copied'); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CallRow({ call, menuOpenId, setMenuOpenId, onView, onPlay, onNote, onDisposition, onCallback, onAddToQueue, onDelete, onCopy }) {
  const isMissed = call.status === 'missed';
  const isConnected = call.status === 'connected';
  const isAbandoned = call.status === 'abandoned';

  return (
    <div className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
      isMissed || isAbandoned ? 'border-rose-200 hover:border-rose-300' : 'border-brand-lilac/70 hover:border-brand-magenta/40'
    }`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        isAbandoned ? 'bg-amber-50 text-amber-600'
        : isMissed ? 'bg-rose-50 text-rose-500'
        : call.type === 'inbound' ? 'bg-emerald-50 text-emerald-500'
        : 'bg-violet-50 text-brand-purple'
      }`}>
        {isAbandoned ? <PhoneOff size={16} />
         : isMissed ? <PhoneMissed size={16} />
         : call.type === 'inbound' ? <PhoneIncoming size={16} />
         : <PhoneOutgoing size={16} />}
      </span>

      <button onClick={onView} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-brand-ink group-hover:text-brand-magenta">
          {call.customer}
        </p>
        <p className="truncate text-xs text-brand-ink/50">{call.mobile}</p>
      </button>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Agent</p>
        <p className="font-semibold text-brand-ink/70">{call.agent}</p>
      </div>

      {call.disposition && (
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${DISPOSITION_COLORS[call.disposition] || 'bg-gray-100 text-gray-600'}`}>
          {call.disposition}
        </span>
      )}

      <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 font-mono text-[10px] font-semibold text-brand-ink/60">
        <Clock size={10} /> {call.duration}
      </span>

      <span className="hidden shrink-0 font-mono text-[10px] text-brand-ink/40 lg:block">{call.date}</span>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="View"
        >
          <Eye size={13} />
        </button>
        {isConnected && (
          <button
            onClick={onPlay}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card hover:brightness-110"
            title="Play recording"
          >
            <Play size={12} fill="currentColor" />
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setMenuOpenId(menuOpenId === call.id ? null : call.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 hover:bg-brand-lilac"
            title="More actions"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === call.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={Eye}           label="View Details"      onClick={() => { onView(); setMenuOpenId(null); }} />
                <MenuItem icon={StickyNote}    label="Add / Edit Note"   onClick={() => { onNote(); setMenuOpenId(null); }} />
                <MenuItem icon={TrendingUp}    label="Set Disposition"   onClick={() => { onDisposition(); setMenuOpenId(null); }} />
                <MenuItem icon={Copy}          label="Copy Number"       onClick={() => { onCopy(); setMenuOpenId(null); }} />
                {(isMissed || isAbandoned) && (
                  <MenuItem icon={Repeat}      label="Schedule Callback" onClick={() => { onCallback(); setMenuOpenId(null); }} />
                )}
                <MenuItem icon={ListChecks}    label="Add to Queue"      onClick={() => { onAddToQueue(); setMenuOpenId(null); }} />
                <div className="my-1 h-px bg-brand-lilac/60" />
                <MenuItem icon={Trash2}        label="Delete Record"     danger onClick={() => { onDelete(); setMenuOpenId(null); }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 — QUEUE
   ═══════════════════════════════════════════════════════════════ */
function QueueTab({ queue, onRemove, onCall }) {
  return (
    <div className="space-y-4">
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <ListChecks size={16} />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-brand-ink">Call Queue</h3>
              <p className="text-[11px] text-brand-ink/50">Customers waiting to be called</p>
            </div>
          </div>
          <span className="rounded-full bg-brand-lilac/60 px-3 py-1 text-[10px] font-bold text-brand-purple">
            {queue.length} in queue
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
              <ListChecks size={22} />
            </span>
            <p className="font-display text-base font-semibold text-brand-ink">Queue is empty</p>
            <p className="max-w-sm text-sm text-brand-ink/50">
              Add calls to the queue from any call row's menu to organize pending callbacks.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-brand-lilac/40">
            {queue.map((q, i) => (
              <li key={q.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-xs font-bold text-cyan-600 tabular-nums">
                  {i + 1}
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                  {initials(q.customer)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">{q.customer}</p>
                  <p className="truncate text-[11px] text-brand-ink/50">{q.mobile}</p>
                </div>
                <span className="hidden shrink-0 font-mono text-[10px] text-brand-ink/40 sm:block">
                  Added {formatRelative(q.addedAt)}
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => onCall(q)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
                  >
                    <Phone size={11} /> Call
                  </button>
                  <button
                    onClick={() => onRemove(q.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
                    title="Remove from queue"
                  >
                    <X size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3 — CAMPAIGNS
   ═══════════════════════════════════════════════════════════════ */
function CampaignsTab({ campaigns, onAdd, onUpdateStatus, onDelete }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-brand-purple">
            <Megaphone size={16} />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-brand-ink">Call Campaigns</h3>
            <p className="text-[11px] text-brand-ink/50">Structured outbound calling drives</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={14} /> Create Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
            <Megaphone size={22} />
          </span>
          <p className="font-display text-base font-semibold text-brand-ink">No campaigns yet</p>
          <p className="max-w-sm text-sm text-brand-ink/50">
            Create a calling campaign to run structured outbound drives across a set of leads.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card"
          >
            <Plus size={16} /> Create First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => {
            const statusStyle = c.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : c.status === 'Paused' ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-600 border-slate-200';
            return (
              <div key={c.id} className="group relative overflow-hidden rounded-2xl border border-brand-lilac bg-white p-4 transition-all hover:-translate-y-1 hover:border-brand-magenta/40 hover:shadow-md">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
                      <Megaphone size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-brand-ink">{c.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
                        {c.status}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusStyle}`}>
                    {c.status}
                  </span>
                </div>

                {c.description && <p className="mt-3 line-clamp-2 text-xs text-brand-ink/60">{c.description}</p>}

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <MiniBox label="Leads" value={c.leadCount || 0} tone="purple" />
                  <MiniBox label="Calls" value={c.totalCalls || 0} tone="purple" />
                  <MiniBox label="Connected" value={c.connected || 0} tone="emerald" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => onUpdateStatus(c.id, c.status === 'Active' ? 'Paused' : 'Active')}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      c.status === 'Active'
                        ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {c.status === 'Active' ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Activate</>}
                  </button>
                  <button
                    onClick={() => onDelete(c)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CampaignModal
          onClose={() => setShowCreate(false)}
          onSubmit={(data) => { onAdd(data); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4/5 — SCHEDULED / CALLBACKS
   ═══════════════════════════════════════════════════════════════ */
function ScheduledTab({ scheduled, agents, onSchedule, onCall, onCancel, emptyMessage }) {
  const [showSchedule, setShowSchedule] = useState(false);

  /* ✅ FIX: memoized sort */
  const sorted = useMemo(
    () => [...scheduled].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)),
    [scheduled]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CalendarClock size={16} />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-brand-ink">Scheduled Calls</h3>
            <p className="text-[11px] text-brand-ink/50">Future callbacks and follow-up calls</p>
          </div>
        </div>
        <button
          onClick={() => setShowSchedule(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={14} /> Schedule Call
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
            <CalendarClock size={22} />
          </span>
          <p className="font-display text-base font-semibold text-brand-ink">{emptyMessage || 'No scheduled calls'}</p>
          <p className="max-w-sm text-sm text-brand-ink/50">
            Schedule future calls or convert missed calls into callbacks.
          </p>
          <button
            onClick={() => setShowSchedule(true)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card"
          >
            <Plus size={16} /> Schedule First Call
          </button>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <ul className="divide-y divide-brand-lilac/40">
            {sorted.map((s) => {
              const scheduledTime = new Date(s.scheduledAt);
              const isPast = scheduledTime.getTime() < Date.now();
              const isToday = scheduledTime.toDateString() === new Date().toDateString();
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isPast ? 'bg-rose-50 text-rose-500' : isToday ? 'bg-amber-50 text-amber-600' : 'bg-violet-50 text-brand-purple'}`}>
                    {isPast ? <AlertCircle size={14} /> : <CalendarClock size={14} />}
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                    {initials(s.customer)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{s.customer}</p>
                    <p className="truncate text-[11px] text-brand-ink/50">{s.mobile} · {s.agent}</p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">
                      {isPast ? 'Overdue' : isToday ? 'Today' : 'Scheduled'}
                    </p>
                    <p className={`text-xs font-semibold ${isPast ? 'text-rose-500' : 'text-brand-ink'}`}>
                      {scheduledTime.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {s.reason && (
                    <span className="hidden shrink-0 rounded-full bg-brand-lilac/60 px-2.5 py-0.5 text-[10px] font-bold text-brand-purple md:block">
                      {s.reason}
                    </span>
                  )}

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => onCall(s)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
                    >
                      <Phone size={11} /> Call Now
                    </button>
                    <button
                      onClick={() => onCancel(s.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
                      title="Cancel"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showSchedule && (
        <ScheduleCallModal
          agents={agents}
          onClose={() => setShowSchedule(false)}
          onSubmit={(data) => { onSchedule(data); setShowSchedule(false); }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 6 — RECORDINGS
   ═══════════════════════════════════════════════════════════════ */
function RecordingsTab({ calls, onPlay }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return calls;
    const q = search.toLowerCase();
    return calls.filter((c) => `${c.customer} ${c.mobile} ${c.agent}`.toLowerCase().includes(q));
  }, [calls, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recordings by customer, mobile, or agent…"
          className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
            <Mic size={22} />
          </span>
          <p className="font-display text-base font-semibold text-brand-ink">No recordings yet</p>
          <p className="max-w-sm text-sm text-brand-ink/50">
            Recordings will appear here for every connected call where recording is enabled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((call) => (
            <div key={call.id} className="card">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-xs font-bold text-white">
                  {initials(call.customer)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">{call.customer}</p>
                  <p className="truncate text-xs text-brand-ink/50">{call.mobile}</p>
                </div>
                <button
                  onClick={() => onPlay(call)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card transition-transform hover:scale-110"
                >
                  <Play size={14} fill="currentColor" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded-lg bg-brand-mist p-2">
                  <p className="font-mono uppercase tracking-wider text-brand-ink/50">Duration</p>
                  <p className="font-semibold text-brand-ink">{call.duration}</p>
                </div>
                <div className="rounded-lg bg-brand-mist p-2">
                  <p className="font-mono uppercase tracking-wider text-brand-ink/50">Agent</p>
                  <p className="truncate font-semibold text-brand-ink">{call.agent}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-brand-lilac/60 pt-3 text-[10px] text-brand-ink/50">
                <span className="flex items-center gap-1"><Calendar size={10} /> {call.date}</span>
                <span className="capitalize">{call.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 7 — DISPOSITION
   ═══════════════════════════════════════════════════════════════ */
function DispositionTab({ breakdown, total }) {
  const max = Math.max(...breakdown.map(([, v]) => v), 1);
  return (
    <div className="card !p-5 space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <TrendingUp size={16} />
        </span>
        <div>
          <h3 className="font-display text-sm font-bold text-brand-ink">Disposition Breakdown</h3>
          <p className="text-[11px] text-brand-ink/50">{total} calls categorized</p>
        </div>
      </div>

      {breakdown.length === 0 ? (
        <EmptyState message="No call dispositions recorded yet" />
      ) : (
        <div className="space-y-3">
          {breakdown.map(([label, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const barPct = (count / max) * 100;
            const color = DISPOSITION_COLORS[label] || 'bg-gray-100 text-gray-600';
            return (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${color}`}>
                    {label}
                  </span>
                  <span className="font-mono text-brand-ink/60">{count} · {pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 8 — AGENT-WISE
   ═══════════════════════════════════════════════════════════════ */
function AgentWiseTab({ breakdown, onViewCalls }) {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-brand-purple">
            <Users size={16} />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-brand-ink">Agent-wise Call History</h3>
            <p className="text-[11px] text-brand-ink/50">Performance per team member</p>
          </div>
        </div>
        <span className="rounded-full bg-brand-lilac/60 px-3 py-1 text-[10px] font-bold text-brand-purple">
          {breakdown.length} agent{breakdown.length !== 1 ? 's' : ''}
        </span>
      </div>

      {breakdown.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-brand-ink/40">No agents yet</div>
      ) : (
        <ul className="divide-y divide-brand-lilac/40">
          {breakdown.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-xs font-bold text-white">
                {initials(a.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-ink">{a.name}</p>
                <p className="truncate text-[11px] text-brand-ink/50">
                  {a.connected}/{a.calls} connected · {formatDuration(a.avgSec)} avg
                </p>
              </div>

              <div className="hidden md:block md:w-32">
                <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                    style={{ width: `${a.connectionRate}%` }}
                  />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-center">
                <div>
                  <p className="font-mono text-[10px] uppercase text-brand-ink/40">Calls</p>
                  <p className="font-display text-sm font-bold text-brand-ink tabular-nums">{a.calls}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase text-brand-ink/40">Missed</p>
                  <p className="font-display text-sm font-bold text-rose-500 tabular-nums">{a.missed}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase text-brand-ink/40">Rate</p>
                  <p className="font-display text-sm font-bold text-brand-magenta tabular-nums">{a.connectionRate}%</p>
                </div>
              </div>

              <button
                onClick={() => onViewCalls(a.name)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
              >
                <Eye size={12} /> View Calls
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CALL DETAILS DRAWER
   ═══════════════════════════════════════════════════════════════ */
function CallDetailsDrawer({ call, onClose, onPlay, onCopy, onNote, onDisposition, onCallback, onAddToQueue, onDelete }) {
  const isConnected = call.status === 'connected';
  const isMissed = call.status === 'missed';
  const isAbandoned = call.status === 'abandoned';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
              isAbandoned ? 'bg-gradient-to-br from-amber-500 to-amber-600'
              : isMissed ? 'bg-gradient-to-br from-rose-500 to-rose-600'
              : call.type === 'inbound' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
            }`}>
              {isAbandoned ? <PhoneOff size={20} />
               : isMissed ? <PhoneMissed size={20} />
               : call.type === 'inbound' ? <PhoneIncoming size={20} />
               : <PhoneOutgoing size={20} />}
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Call Record</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{call.customer}</h3>
              <p className="text-[11px] text-brand-ink/50">{call.mobile}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Type" value={call.type} color={call.type === 'inbound' ? 'emerald' : 'purple'} />
            <InfoBox label="Status" value={call.status} color={isConnected ? 'emerald' : isMissed || isAbandoned ? 'rose' : 'amber'} />
            <InfoBox label="Duration" value={call.duration} color="purple" />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Call Information</h4>
            <Row label="Call ID" value={call.id} />
            <Row label="Disposition" value={call.disposition || '—'} />
            <Row label="Agent" value={call.agent} />
            <Row label="Date" value={call.date} />
          </div>

          <div className="card !p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
                <StickyNote size={14} className="text-brand-magenta" />
                Notes
              </h4>
              <button
                onClick={onNote}
                className="rounded-lg border border-brand-lilac bg-white px-3 py-1 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                {call.notes ? 'Edit' : 'Add'}
              </button>
            </div>
            {call.notes ? (
              <p className="rounded-lg bg-brand-mist/40 p-3 text-xs text-brand-ink/80">{call.notes}</p>
            ) : (
              <p className="text-xs italic text-brand-ink/40">No notes yet</p>
            )}
          </div>

          {isConnected && (
            <div className="card !p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
                  <Mic size={14} className="text-brand-magenta" />
                  Recording
                </h4>
                <span className="font-mono text-xs text-brand-ink/50">{call.duration}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
                <button
                  onClick={onPlay}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card hover:brightness-110"
                >
                  <Play size={14} fill="currentColor" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple" />
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] text-brand-ink/50">Recording-{call.id}.mp3</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${call.mobile}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Phone size={16} /> Call Back
            </a>
            <button
              onClick={() => onCopy(call.mobile)}
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50"
            >
              <Copy size={16} /> Copy Number
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onDisposition}
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50"
            >
              <TrendingUp size={16} /> Set Disposition
            </button>
            <button
              onClick={onAddToQueue}
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50"
            >
              <ListChecks size={16} /> Add to Queue
            </button>
          </div>

          {(isMissed || isAbandoned) && (
            <button
              onClick={onCallback}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Repeat size={16} /> Convert to Callback
            </button>
          )}

          <div className="border-t border-brand-lilac/60 pt-4">
            <button
              onClick={onDelete}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-100"
            >
              <Trash2 size={16} /> Delete Call Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RECORDING MODAL — with animated progress
   ═══════════════════════════════════════════════════════════════ */
function RecordingModal({ call, name, onClose }) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalSec = parseDuration(call.duration);

  /* ✅ FIX: progress actually advances */
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setPlaying(false); return 100; }
        return Math.min(100, p + (1 / Math.max(totalSec, 1)) * 100);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, totalSec]);

  const elapsed = Math.floor((progress / 100) * totalSec);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        <div className="relative bg-gradient-to-br from-brand-magenta to-brand-purple px-6 pb-8 pt-8 text-center text-white">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20">
            <X size={18} />
          </button>

          <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/30">
              <Headphones size={32} />
            </span>
          </div>

          <p className="text-lg font-semibold">{call.customer}</p>
          <p className="font-mono text-[11px] text-white/70">{name}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            {playing ? 'Now Playing' : progress >= 100 ? 'Finished' : 'Paused'}
          </p>
        </div>

        <div className="p-6">
          <div className="mb-2">
            <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-brand-ink/50">
              <span>{formatDuration(elapsed)}</span>
              <span>{call.duration}</span>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-center gap-3">
            <button
              onClick={() => setMuted((m) => !m)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                muted
                  ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                  : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
              }`}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card hover:brightness-110"
            >
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button
              onClick={() => { setProgress(0); setPlaying(true); }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="space-y-1 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
            <Row label="Mobile" value={call.mobile} />
            <Row label="Agent" value={call.agent} />
            <Row label="Disposition" value={call.disposition || '—'} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOTES MODAL
   ═══════════════════════════════════════════════════════════════ */
function NotesModal({ call, onClose, onSave }) {
  const [text, setText] = useState(call.notes || '');
  return (
    <ModalShell title="Call Notes" subtitle={`For ${call.customer} · ${call.mobile}`} onClose={onClose}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Write notes about this call…"
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-3 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      />
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
          Cancel
        </button>
        <button
          onClick={() => onSave(text.trim())}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Save size={14} /> Save Notes
        </button>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DISPOSITION MODAL
   ═══════════════════════════════════════════════════════════════ */
function DispositionModal({ call, onClose, onSave }) {
  const [selected, setSelected] = useState(call.disposition || '');
  return (
    <ModalShell title="Set Disposition" subtitle={`For ${call.customer}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        {DISPOSITION_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelected(opt)}
            className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
              selected === opt
                ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                : 'border-brand-lilac bg-white text-brand-ink/70 hover:bg-brand-lilac/30'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
          Cancel
        </button>
        <button
          onClick={() => selected && onSave(selected)}
          disabled={!selected}
          className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
        >
          Save Disposition
        </button>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCHEDULE CALL MODAL
   ═══════════════════════════════════════════════════════════════ */
function ScheduleCallModal({ agents, onClose, onSubmit }) {
  /* ✅ FIX: build local time string safely */
  const defaultLocal = new Date(Date.now() + 60 * 60 * 1000)
    .toLocaleString('sv-SE', { hour12: false })
    .replace(' ', 'T')
    .slice(0, 16);

  const [form, setForm] = useState({
    customer: '',
    mobile: '',
    agent: agents[0]?.name || '',
    scheduledAt: defaultLocal,
    reason: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.customer.trim()) { setError('Customer name is required'); return; }
    if (!/^\d{10}$/.test(form.mobile)) { setError('Mobile must be 10 digits'); return; }
    const when = new Date(form.scheduledAt);
    if (isNaN(when.getTime())) { setError('Please pick a valid date and time'); return; }
    onSubmit({
      customer: form.customer.trim(),
      mobile: form.mobile,
      agent: form.agent,
      scheduledAt: when.toISOString(),
      reason: form.reason.trim() || 'Scheduled call',
    });
  };

  return (
    <ModalShell title="Schedule Call" subtitle="Set up a future callback" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Customer Name" value={form.customer} onChange={(v) => { setForm({ ...form, customer: v }); setError(''); }} placeholder="e.g. Priya Sharma" />
        <Field label="Mobile" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Agent</label>
          <select
            value={form.agent}
            onChange={(e) => setForm({ ...form, agent: e.target.value })}
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          >
            {agents.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </div>
        <Field label="Date & Time" type="datetime-local" value={form.scheduledAt} onChange={(v) => setForm({ ...form, scheduledAt: v })} />
        <Field label="Reason (optional)" value={form.reason} onChange={(v) => setForm({ ...form, reason: v })} placeholder="e.g. Follow-up on pricing" />
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />{error}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            Schedule Call
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN MODAL
   ═══════════════════════════════════════════════════════════════ */
function CampaignModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', description: '', leadCount: 0 });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Campaign name is required'); return; }
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      leadCount: Number(form.leadCount) || 0,
    });
  };

  return (
    <ModalShell title="Create Call Campaign" subtitle="Set up an outbound calling drive" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Campaign Name" value={form.name} onChange={(v) => { setForm({ ...form, name: v }); setError(''); }} placeholder="e.g. Diwali Follow-up Drive" />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="What is this campaign about?"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>
        <Field label="Number of Leads" type="number" value={form.leadCount} onChange={(v) => setForm({ ...form, leadCount: v })} />
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />{error}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function DropdownFilter({ label, icon: Icon, value, options, open, onToggle, onChange }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        {label}: <span className="font-semibold text-brand-magenta">{value}</span>
        <ChevronDown size={14} className={`text-brand-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === o
                    ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ModalShell({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div>
            <h3 className="font-display text-base font-bold text-brand-ink">{title}</h3>
            {subtitle && <p className="text-[11px] text-brand-ink/50">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, color = 'purple' }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color] || colors.purple}`}>
      <p className="font-mono text-[9px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 truncate text-sm font-bold capitalize">
        {typeof value === 'number' ? value.toLocaleString() : String(value ?? '')}
      </p>
    </div>
  );
}

function MiniBox({ label, value, tone = 'purple' }) {
  const tones = {
    purple: 'text-brand-purple',
    emerald: 'text-emerald-600',
    rose: 'text-brand-magenta',
  };
  return (
    <div className="rounded-xl bg-brand-mist p-2.5">
      <p className={`font-display text-base font-bold tabular-nums ${tones[tone] || tones.purple}`}>{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/50">{label}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/60 pb-2 last:border-0 last:pb-0">
      <span className="shrink-0 text-brand-ink/50">{label}</span>
      <span className="truncate font-medium capitalize text-brand-ink">{value}</span>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      />
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
        danger ? 'text-rose-500 hover:bg-rose-50' : 'text-brand-ink/70 hover:bg-brand-lilac/40'
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function EmptyState({ hasFilters, onClear, message }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Phone size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No calls match your filters' : message || 'No calls yet'}
      </p>
      {hasFilters && onClear && (
        <button onClick={onClear} className="text-xs font-semibold text-brand-magenta hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
            <AlertCircle size={18} />
          </div>
          <h3 className="font-display text-base font-semibold text-brand-ink">{title}</h3>
        </div>
        <p className="mb-5 text-sm text-brand-ink/60">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
        type === 'error'
          ? 'border-rose-200 bg-rose-50 text-rose-600'
          : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}