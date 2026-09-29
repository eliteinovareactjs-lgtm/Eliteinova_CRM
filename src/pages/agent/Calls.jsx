// src/pages/agent/Calls.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneCall,
  Clock, User, Mic, MicOff, Play, Pause, X, Headphones, Search,
  ChevronDown, Delete, Volume2, VolumeX, PauseCircle, PlayCircle,
  ArrowRightLeft, PhoneOff, FileAudio, Download, Filter, Calendar,
  StickyNote, CheckCircle2, AlertCircle, ListFilter, Inbox, History,
  Grid3x3, List, Tag, TrendingUp, Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CALLS, LEADS } from '../../data/mockData';

/* ================================================================
   CONSTANTS
   ================================================================ */
const CALL_TABS = [
  { key: 'dialpad',    label: 'Dial Pad',        icon: PhoneCall },
  { key: 'inbound',    label: 'Inbound Calls',   icon: PhoneIncoming },
  { key: 'outbound',   label: 'Outbound Calls',  icon: PhoneOutgoing },
  { key: 'missed',     label: 'Missed Calls',    icon: PhoneMissed },
  { key: 'history',    label: 'Call History',    icon: History },
  { key: 'recordings', label: 'Call Recordings', icon: FileAudio },
];

const DISPOSITIONS = [
  'Connected', 'No Answer', 'Busy', 'Call Back', 'Interested',
  'Not Interested', 'Wrong Number', 'Converted', 'Follow-Up Required',
  'Customer Requested Information', 'Other',
];

const DIAL_KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '*', '0', '#',
];

const STATUS_STYLES = {
  connected: 'bg-emerald-100 text-emerald-600',
  ringing:   'bg-amber-100 text-amber-600',
  missed:    'bg-rose-100 text-rose-500',
  failed:    'bg-slate-100 text-slate-500',
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function Calls() {
  const { user, activeWebsiteId } = useAuth();

  const [activeTab, setActiveTab] = useState('dialpad');
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState(null);
  const [inCall, setInCall] = useState(null);
  const [showDisposition, setShowDisposition] = useState(null);
  const [showFollowUp, setShowFollowUp] = useState(null);
  const [toast, setToast] = useState(null);
  const [callHistory, setCallHistory] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ---------- SCOPED CALLS ---------- */
  const agentCalls = useMemo(() => {
    const list = (CALLS || []).filter(
      (c) =>
        (c.projectId ?? c.websiteId) === activeWebsiteId &&
        (c.agent === user?.name || c.agentName === user?.name || !c.agent)
    );
    return [...callHistory, ...list];
  }, [activeWebsiteId, user?.name, callHistory]);

  /* ---------- FILTERED ---------- */
  const filteredCalls = useMemo(() => {
    let list = agentCalls;

    if (activeTab === 'inbound') {
      list = list.filter((c) => c.type === 'inbound' || c.type === 'incoming');
    } else if (activeTab === 'outbound') {
      list = list.filter((c) => c.type === 'outbound' || c.type === 'outgoing');
    } else if (activeTab === 'missed') {
      list = list.filter((c) => c.status === 'missed');
    } else if (activeTab === 'recordings') {
      list = list.filter((c) => c.recording || c.recordingUrl);
    }

    if (directionFilter !== 'all') {
      list = list.filter((c) => c.type === directionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => {
        const hay = `${c.customer || c.leadName || ''} ${c.mobile || c.phone || ''} ${c.outcome || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return list;
  }, [agentCalls, activeTab, directionFilter, searchQuery]);

  /* ---------- SUMMARY ---------- */
  const summary = useMemo(() => {
    const total = agentCalls.length;
    const connected = agentCalls.filter((c) => c.status === 'connected').length;
    const missed = agentCalls.filter((c) => c.status === 'missed').length;
    const recordings = agentCalls.filter((c) => c.recording || c.recordingUrl).length;
    return { total, connected, missed, recordings };
  }, [agentCalls]);

  /* ---------- HANDLERS ---------- */
  const handleStartCall = (target) => {
    setInCall({
      name: target.name || target.customer || 'Unknown',
      mobile: target.mobile || target.phone,
      leadId: target.id,
      startedAt: Date.now(),
    });
  };

  const handleCallEnd = (payload) => {
    const entry = {
      id: `call-${Date.now()}`,
      customer: inCall.name,
      mobile: inCall.mobile,
      leadId: inCall.leadId,
      type: payload.direction === 'incoming' ? 'inbound' : 'outbound',
      status: payload.disposition === 'No Answer' || payload.disposition === 'Missed'
        ? 'missed'
        : 'connected',
      duration: payload.duration,
      outcome: payload.disposition,
      notes: payload.notes,
      date: new Date().toISOString(),
      recording: payload.recording,
      projectId: activeWebsiteId,
      agentName: user?.name,
    };
    setCallHistory((prev) => [entry, ...prev]);
    setInCall(null);
    setShowDisposition(entry);
    showToast(`Call logged · ${payload.disposition}`);
  };

  const handleSaveDisposition = (call, disposition, notes, scheduleFollowUp) => {
    setCallHistory((prev) =>
      prev.map((c) => (c.id === call.id ? { ...c, outcome: disposition, notes } : c))
    );
    setShowDisposition(null);
    if (scheduleFollowUp) {
      setShowFollowUp(call);
    } else {
      showToast('Call disposition saved');
    }
  };

  const handleSaveFollowUp = (call, { date, time, notes }) => {
    setCallHistory((prev) =>
      prev.map((c) =>
        c.id === call.id
          ? { ...c, followUpDate: `${date}${time ? ` · ${time}` : ''}`, followUpNotes: notes }
          : c
      )
    );
    setShowFollowUp(null);
    showToast(`Follow-up scheduled for ${date}${time ? ` at ${time}` : ''}`);
  };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Calls</h1>
            <p className="text-sm text-brand-ink/50">
              Dial, receive, and log every call from one place.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('dialpad')}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <PhoneCall size={14} /> New Call
          </button>
        </div>

        {/* ================= KPI STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatedStatCard label="Total Calls"  value={summary.total}      sub="All time"       icon={PhoneCall}     color="purple" trend="+8%"  trendUp delay={0} />
          <AnimatedStatCard label="Connected"    value={summary.connected}  sub="Successful"     icon={CheckCircle2}  color="emerald" trend="+5"  trendUp delay={40} />
          <AnimatedStatCard label="Missed"       value={summary.missed}     sub="Need callback"  icon={PhoneMissed}   color="rose"   trend="-2"  trendUp={false} delay={80} />
          <AnimatedStatCard label="Recordings"   value={summary.recordings} sub="Available"      icon={FileAudio}     color="amber"  trend="+3"  trendUp delay={120} />
        </div>

        {/* ================= TABS ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {CALL_TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= TAB CONTENT ================= */}
        {activeTab === 'dialpad' ? (
          <DialPadPanel onStartCall={handleStartCall} />
        ) : (
          <>
            {/* Search + filter bar (hidden on dialpad) */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer, mobile, outcome..."
                  className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
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

              {(activeTab === 'history' || activeTab === 'recordings') && (
                <DropdownFilter
                  label="Direction"
                  icon={ArrowRightLeft}
                  value={directionFilter}
                  options={['all', 'inbound', 'outbound']}
                  onChange={setDirectionFilter}
                />
              )}

              <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
                <ListFilter size={14} className="text-brand-magenta" />
                Showing: <span className="text-brand-magenta">{filteredCalls.length}</span>
              </span>
            </div>

            {/* Calls list */}
            {filteredCalls.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="space-y-2">
                {filteredCalls.map((call) => (
                  <CallRow
                    key={call.id}
                    call={call}
                    onView={() => setSelectedCall(call)}
                    onCall={() => handleStartCall(call)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ================= DRAWERS / MODALS ================= */}
        {inCall && (
          <CallModal
            target={inCall}
            onClose={() => setInCall(null)}
            onEnd={handleCallEnd}
          />
        )}

        {selectedCall && (
          <CallDetailDrawer
            call={selectedCall}
            onClose={() => setSelectedCall(null)}
            onCall={() => { setInCall(selectedCall); setSelectedCall(null); }}
          />
        )}

        {showDisposition && (
          <DispositionModal
            call={showDisposition}
            onClose={() => setShowDisposition(null)}
            onSave={handleSaveDisposition}
          />
        )}

        {showFollowUp && (
          <FollowUpModal
            call={showFollowUp}
            onClose={() => setShowFollowUp(null)}
            onSave={handleSaveFollowUp}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ================================================================
   DIAL PAD PANEL
   ================================================================ */
function DialPadPanel({ onStartCall }) {
  const [number, setNumber] = useState('');
  const [matchedLead, setMatchedLead] = useState(null);

  /* Try to auto-match against known leads */
  useEffect(() => {
    const clean = number.replace(/\D/g, '');
    if (clean.length >= 6) {
      const match = (LEADS || []).find((l) => l.mobile === clean || l.mobile?.endsWith(clean));
      setMatchedLead(match || null);
    } else {
      setMatchedLead(null);
    }
  }, [number]);

  const press = (k) => setNumber((n) => (n + k).slice(0, 15));
  const backspace = () => setNumber((n) => n.slice(0, -1));
  const clear = () => setNumber('');

  const canCall = number.replace(/\D/g, '').length >= 6;

  const handleCall = () => {
    if (!canCall) return;
    onStartCall({
      name: matchedLead?.name || 'Unknown Number',
      mobile: number,
      id: matchedLead?.id,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Dial pad */}
      <div className="card lg:col-span-2">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
              <PhoneCall size={18} />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-brand-ink">Dial Pad</h2>
              <p className="text-xs text-brand-ink/50">Enter a number to start a call</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ready
          </div>
        </div>

        {/* Number display */}
        <div className="relative mb-5">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^\d+*#]/g, ''))}
            placeholder="Enter phone number"
            className="w-full rounded-2xl border-2 border-brand-lilac bg-white py-4 pl-5 pr-24 text-center font-display text-2xl font-bold tracking-wider text-brand-ink outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {number && (
              <button
                onClick={backspace}
                className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
                title="Backspace"
              >
                <Delete size={16} />
              </button>
            )}
            {number && (
              <button
                onClick={clear}
                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                title="Clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Matched lead */}
        {matchedLead && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
              {matchedLead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-ink">{matchedLead.name}</p>
              <p className="truncate text-xs text-brand-ink/50">
                {matchedLead.mobile} · {matchedLead.leadSource}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-brand-purple">
              Lead found
            </span>
          </div>
        )}

        {/* Keypad */}
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-3">
          {DIAL_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="group relative flex h-16 items-center justify-center rounded-2xl border border-brand-lilac bg-white font-display text-xl font-bold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta active:scale-95"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Call button */}
        <button
          onClick={handleCall}
          disabled={!canCall}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-sm font-bold text-white shadow-card transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PhoneCall size={18} /> Call {number && `· ${number}`}
        </button>

        <p className="mt-3 text-center text-[10px] text-brand-ink/40">
          Recording indicator • Add note • Call disposition • Schedule follow-up
        </p>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        <div className="card">
          <h3 className="mb-3 font-display text-sm font-semibold text-brand-ink">
            Quick Tips
          </h3>
          <ul className="space-y-2 text-xs text-brand-ink/70">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              Type or paste any number — matched leads appear instantly.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              Every call opens the call panel with mute, hold, transfer, and end.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              Pick a disposition and optionally schedule a follow-up right after.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              Recordings are saved under the customer timeline automatically.
            </li>
          </ul>
        </div>

        <div className="card bg-gradient-to-br from-brand-magenta/[0.06] to-brand-purple/[0.04]">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-magenta">
            Incoming Call
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-ink">
            When someone calls your IVR line
          </p>
          <p className="mt-1 text-xs text-brand-ink/60">
            A popup will appear with caller ID and matched lead details.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CALL ROW
   ================================================================ */
function CallRow({ call, onView, onCall }) {
  const type = call.type === 'inbound' || call.type === 'incoming' ? 'inbound' : 'outbound';
  const status = call.status || (call.outcome === 'No Answer' ? 'missed' : 'connected');
  const customer = call.customer || call.leadName || 'Unknown';
  const mobile = call.mobile || call.phone || '—';

  return (
    <div className="group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:border-brand-magenta/40 hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          status === 'missed'
            ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200'
            : type === 'inbound'
            ? 'bg-emerald-50 text-emerald-500 ring-1 ring-emerald-200'
            : 'bg-violet-50 text-brand-purple ring-1 ring-violet-200'
        }`}
      >
        {status === 'missed' ? (
          <PhoneMissed size={16} />
        ) : type === 'inbound' ? (
          <PhoneIncoming size={16} />
        ) : (
          <PhoneOutgoing size={16} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">{customer}</p>
        <p className="truncate text-xs text-brand-ink/50">{mobile}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="flex items-center gap-1 text-brand-ink/40">
          <Clock size={10} /> Duration
        </p>
        <p className="font-mono font-semibold text-brand-ink/70">{call.duration || '—'}</p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="flex items-center gap-1 text-brand-ink/40">
          <Tag size={10} /> Outcome
        </p>
        <p className="font-semibold text-brand-ink/70">{call.outcome || '—'}</p>
      </div>

      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.failed}`}>
        {status}
      </span>

      {(call.recording || call.recordingUrl) && (
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
          🎧 Rec
        </span>
      )}

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
          title="View details"
        >
          <User size={13} />
        </button>
        <button
          onClick={onCall}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card transition-transform hover:scale-110"
          title="Call back"
        >
          <PhoneCall size={13} />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   IN-CALL MODAL (mute / hold / transfer / end / timer / recording)
   ================================================================ */
function CallModal({ target, onClose, onEnd }) {
  const [callState, setCallState] = useState('ringing');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [recording, setRecording] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [disposition, setDisposition] = useState('Connected');

  const name = target.name || target.customer || 'Unknown';
  const phone = target.mobile || target.phone || '';

  useEffect(() => {
    if (callState !== 'ringing') return;
    const t = setTimeout(() => setCallState('connected'), 1800);
    return () => clearTimeout(t);
  }, [callState]);

  useEffect(() => {
    if (callState !== 'connected') return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [callState]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    onEnd({
      duration: formatTime(seconds),
      disposition,
      notes,
      recording,
      direction: target.direction || 'outgoing',
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        {/* Header */}
        <div className={`relative px-6 pb-8 pt-8 text-center text-white ${
          callState === 'connected'
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
        }`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20"
          >
            <X size={18} />
          </button>

          {/* Recording indicator */}
          {recording && (
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2.5 py-1 text-[10px] font-bold">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              REC
            </div>
          )}

          <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 text-2xl font-bold">
              {name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          </div>

          <p className="text-lg font-semibold">{name}</p>
          <p className="text-xs text-white/70">Lead · {phone}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            {callState === 'ringing' ? 'Ringing…' : `Connected · ${formatTime(seconds)}`}
          </p>
        </div>

        <div className="p-6">
          {/* Controls */}
          {callState === 'connected' && (
            <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
              <CallControl
                icon={muted ? MicOff : Mic}
                label={muted ? 'Unmute' : 'Mute'}
                active={muted}
                onClick={() => setMuted((m) => !m)}
              />
              <CallControl
                icon={speaker ? Volume2 : VolumeX}
                label="Speaker"
                active={speaker}
                onClick={() => setSpeaker((s) => !s)}
              />
              <CallControl
                icon={onHold ? PlayCircle : PauseCircle}
                label={onHold ? 'Resume' : 'Hold'}
                active={onHold}
                onClick={() => setOnHold((h) => !h)}
              />
              <CallControl
                icon={ArrowRightLeft}
                label="Transfer"
                active={transferOpen}
                onClick={() => setTransferOpen((t) => !t)}
              />
              <CallControl
                icon={recording ? Pause : Play}
                label={recording ? 'Pause Rec' : 'Record'}
                active={recording}
                onClick={() => setRecording((r) => !r)}
              />
            </div>
          )}

          {/* Transfer picker */}
          {transferOpen && callState === 'connected' && (
            <div className="mb-5 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
                Transfer to
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['Supervisor', 'Agent 2', 'Agent 3'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTransferOpen(false);
                      setDisposition('Other');
                      setNotes((n) => (n ? `${n}\n` : '') + `Transferred to ${t}`);
                    }}
                    className="rounded-lg border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes + disposition */}
          {callState === 'connected' && (
            <div className="mb-5 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                  Call Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Quick notes about this call..."
                  className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                  Disposition
                </label>
                <select
                  value={disposition}
                  onChange={(e) => setDisposition(e.target.value)}
                  className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                >
                  {DISPOSITIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* End call */}
          {callState === 'ringing' ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-brand-lilac bg-white py-3 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                Cancel
              </button>
              <button
                onClick={endCall}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                <PhoneMissed size={16} /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={endCall}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <PhoneOff size={16} /> End Call · {formatTime(seconds)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CALL CONTROL BUTTON
   ================================================================ */
function CallControl({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
        active
          ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
          : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

/* ================================================================
   CALL DETAIL DRAWER
   ================================================================ */
function CallDetailDrawer({ call, onClose, onCall }) {
  const type = call.type === 'inbound' || call.type === 'incoming' ? 'inbound' : 'outbound';
  const status = call.status || 'connected';
  const customer = call.customer || call.leadName || 'Unknown';
  const mobile = call.mobile || call.phone || '—';

  const pastCalls = [
    { id: 1, type: 'inbound',  duration: '2:14', date: 'Today · 9:30 AM',      outcome: 'Discussed pricing' },
    { id: 2, type: 'outbound', duration: '0:52', date: 'Yesterday · 3:45 PM',  outcome: 'Follow-up callback' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-ink">Call Details</h3>
            <p className="text-xs text-brand-ink/50">Full call record</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Caller */}
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-sm font-bold text-white">
              {customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{customer}</p>
              <p className="text-sm text-brand-ink/50">{mobile}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.failed}`}>
              {status}
            </span>
          </div>

          {/* Summary grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Duration" value={call.duration || '—'} />
            <InfoBox label="Type"     value={type} />
            <InfoBox label="Outcome"  value={call.outcome || '—'} />
            <InfoBox label="Agent"    value={call.agentName || call.agent || 'You'} />
          </div>

          {/* Notes */}
          {call.notes && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                Notes
              </p>
              <p className="text-sm text-brand-ink/80">{call.notes}</p>
            </div>
          )}

          {/* Recording */}
          {(call.recording || call.recordingUrl) && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <FileAudio size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-ink">Recording</p>
                <p className="text-xs text-brand-ink/60">Available for playback</p>
              </div>
              <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple px-3 py-1.5 text-xs font-semibold text-white shadow-card">
                <Play size={12} fill="currentColor" /> Play
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/40">
                <Download size={12} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onCall}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <PhoneCall size={16} /> Call Back
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <Calendar size={16} /> Follow-up
            </button>
          </div>

          {/* Past recordings */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <Headphones size={12} /> Past Calls
              </p>
              <span className="text-xs text-brand-ink/50">{pastCalls.length} recordings</span>
            </div>
            <div className="space-y-2.5">
              {pastCalls.map((rec) => (
                <div key={rec.id} className="rounded-xl border border-brand-lilac bg-white p-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      rec.type === 'inbound'
                        ? 'bg-emerald-50 text-emerald-500'
                        : 'bg-violet-50 text-brand-purple'
                    }`}>
                      {rec.type === 'inbound' ? <PhoneIncoming size={16} /> : <PhoneOutgoing size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold capitalize text-brand-ink">{rec.type} call</p>
                      <p className="text-xs text-brand-ink/50">{rec.date}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-semibold text-brand-ink/60">
                      <Clock size={10} /> {rec.duration}
                    </span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card"
                      title="Play"
                    >
                      <Play size={12} fill="currentColor" />
                    </button>
                  </div>
                  <p className="mt-2 border-t border-brand-lilac/60 pt-2 text-xs text-brand-ink/60">
                    {rec.outcome}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   DISPOSITION MODAL
   ================================================================ */
function DispositionModal({ call, onClose, onSave }) {
  const [disposition, setDisposition] = useState(call.outcome || 'Connected');
  const [notes, setNotes] = useState(call.notes || '');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <ListFilter size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Call Disposition</h3>
              <p className="text-xs text-brand-ink/50">Log the outcome of this call</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Disposition</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DISPOSITIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDisposition(d)}
                  className={`rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-all ${
                    disposition === d
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac bg-white text-brand-ink/70 hover:bg-brand-lilac/30'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <StickyNote size={12} /> Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add context for this call..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-ink/70">
            <input
              type="checkbox"
              checked={scheduleFollowUp}
              onChange={(e) => setScheduleFollowUp(e.target.checked)}
              className="h-4 w-4 rounded border-brand-lilac accent-brand-magenta"
            />
            Schedule a follow-up
          </label>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(call, disposition, notes, scheduleFollowUp)}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   FOLLOW-UP MODAL
   ================================================================ */
function FollowUpModal({ call, onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Schedule Follow-up</h3>
              <p className="text-xs text-brand-ink/50">
                {call.customer || call.leadName || 'Customer'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Date</label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Context for the follow-up..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(call, { date, time, notes })}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Save Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EMPTY STATE
   ================================================================ */
function EmptyState({ tab }) {
  const messages = {
    inbound: 'No inbound calls yet',
    outbound: 'No outbound calls yet',
    missed: 'No missed calls — nice!',
    history: 'No call history yet',
    recordings: 'No recordings available',
  };
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Inbox size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {messages[tab] || 'No calls to display'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        Start a new call from the Dial Pad to see records appear here.
      </p>
    </div>
  );
}

/* ================================================================
   DROPDOWN FILTER
   ================================================================ */
function DropdownFilter({ label, icon: Icon, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        <span className="text-brand-ink/60">{label}:</span>
        <span className="font-semibold capitalize text-brand-magenta">{value}</span>
        <ChevronDown size={14} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm capitalize ${
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

/* ================================================================
   ANIMATED STAT CARD
   ================================================================ */
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
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display.toLocaleString();
}

function AnimatedStatCard({ label, value, sub, icon: Icon, color, trend, trendUp, delay = 0 }) {
  const numeric = typeof value === 'number' ? value : 0;
  const animated = useAnimatedCount(numeric);
  const display = typeof value === 'number' ? animated : value;

  const themes = {
    purple: {
      border: 'border-violet-200 hover:border-violet-400',
      bg: 'from-violet-50 via-violet-50/30 to-white',
      iconBg: 'bg-violet-100 text-brand-purple border-violet-200',
      bar: 'from-brand-purple to-brand-magenta',
      glow: 'bg-brand-purple/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]',
      valueColor: 'text-brand-purple',
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-400',
      bg: 'from-emerald-50 via-emerald-50/30 to-white',
      iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      bar: 'from-emerald-500 to-emerald-400',
      glow: 'bg-emerald-500/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]',
      valueColor: 'text-emerald-600',
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-400',
      bg: 'from-amber-50 via-amber-50/30 to-white',
      iconBg: 'bg-amber-100 text-amber-600 border-amber-200',
      bar: 'from-amber-500 to-orange-400',
      glow: 'bg-amber-500/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]',
      valueColor: 'text-amber-600',
    },
    rose: {
      border: 'border-rose-200 hover:border-rose-400',
      bg: 'from-rose-50 via-rose-50/30 to-white',
      iconBg: 'bg-rose-100 text-brand-magenta border-rose-200',
      bar: 'from-brand-magenta to-brand-purple',
      glow: 'bg-brand-magenta/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]',
      valueColor: 'text-brand-magenta',
    },
  };
  const t = themes[color] || themes.purple;

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 animate-fade-slide-in ${t.border} ${t.shadow}`}
    >
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />

      <div className="relative">
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} />
          </span>
          {trend && (
            <span className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              trendUp ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-rose-200 bg-rose-50 text-rose-500'
            }`}>
              {trendUp ? <TrendingUp size={10} /> : null}
              {trend}
            </span>
          )}
        </div>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {display}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
      </div>
    </div>
  );
}

/* ================================================================
   INFO BOX
   ================================================================ */
function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-brand-mist p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold capitalize text-brand-ink">
        {value}
      </p>
    </div>
  );
}

/* ================================================================
   TOAST
   ================================================================ */
function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}