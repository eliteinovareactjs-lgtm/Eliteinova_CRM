// src/pages/agent/Calls.jsx
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneCall,
  Clock, User, Mic, MicOff, Play, Pause, X, Headphones, Search,
  ChevronDown, Volume2, VolumeX, PauseCircle, PlayCircle,
  ArrowRightLeft, PhoneOff, FileAudio, Download, Calendar,
  StickyNote, CheckCircle2, AlertCircle, ListFilter, Inbox, History,
  Tag, TrendingUp, PhoneForwarded, Delete, Sparkles, Zap,
  AlertTriangle, Timer, SkipForward, Hash, Flame,
  MessageCircle, Volume, Gauge, PlaySquare, Building2, Briefcase,
  MapPin, IndianRupee, Layers, ArrowRight, UserCheck, UserX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CALLS } from '../../data/mockData';

/* ================================================================
   CONSTANTS
   ================================================================ */
const CALL_TABS = [
  { key: 'inbound',    label: 'Inbound Calls',   icon: PhoneIncoming },
  { key: 'outbound',   label: 'Outbound Calls',  icon: PhoneOutgoing },
  { key: 'missed',     label: 'Missed Calls',    icon: PhoneMissed, live: true },
  { key: 'history',    label: 'Call History',    icon: History },
  { key: 'recordings', label: 'Call Recordings', icon: FileAudio },
];

const DISPOSITIONS = [
  'Connected', 'No Answer', 'Busy', 'Call Back', 'Interested',
  'Not Interested', 'Wrong Number', 'Converted', 'Follow-Up Required',
  'Customer Requested Information', 'Other',
];

const NOT_INTERESTED_REASONS = [
  'Price too high', 'Location not suitable', 'Already purchased',
  'Not interested in category', 'Bought from competitor', 'Other',
];

const INTEREST_TYPES = ['Hot', 'Warm', 'Cold', 'Just enquiring'];

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
];

const STATUS_STYLES = {
  connected: 'bg-emerald-100 text-emerald-600',
  ringing:   'bg-amber-100 text-amber-600',
  missed:    'bg-rose-100 text-rose-500',
  failed:    'bg-slate-100 text-slate-500',
};

const PRIORITY_STYLES = {
  High:   'border-rose-200 bg-rose-50 text-rose-600',
  Medium: 'border-amber-200 bg-amber-50 text-amber-600',
  Low:    'border-emerald-200 bg-emerald-50 text-emerald-600',
};

/* ================================================================
   HELPERS
   ================================================================ */
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayYMD = () => ymd(new Date());

/* Human "x min ago" for missed calls */
const timeAgo = (iso) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ${min % 60}m ago`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h ago`;
};

/* Filter calls within date range */
const inDateRange = (call, range) => {
  if (!call?.date || range === 'all') return true;
  const callDay = ymd(new Date(call.date));
  const today = todayYMD();
  const yesterday = ymd(new Date(Date.now() - 86400000));

  if (range === 'today') return callDay === today;
  if (range === 'yesterday') return callDay === yesterday;

  if (range === 'week') {
    const weekAgo = ymd(new Date(Date.now() - 7 * 86400000));
    return callDay >= weekAgo;
  }
  if (range === 'month') {
    const monthStart = ymd(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    return callDay >= monthStart;
  }
  return true;
};

/* ================================================================
   DEMO CALLBACKS (for the queue hero card)
   Callbacks come from two sources:
   1. Missed calls that need a follow-up
   2. Explicit "Call Back" dispositions
   We keep a small synthetic seed here so the page has meaningful
   content even with empty mockData.
   ================================================================ */
const buildDemoCallbacks = (agentName, websiteId) => {
  const now = Date.now();
  return [
    {
      id: 'cb-1',
      agentName, projectId: websiteId,
      customer: 'Rahul Kumar',
      mobile: '9876543210',
      reason: 'Interested · requested pricing',
      priority: 'High',
      dueAt: new Date(now + 20 * 60000).toISOString(),
      leadStage: 'Hot',
      source: 'Facebook Campaign',
    },
    {
      id: 'cb-2',
      agentName, projectId: websiteId,
      customer: 'Priya Sharma',
      mobile: '9876543211',
      reason: 'No answer · retry',
      priority: 'Medium',
      dueAt: new Date(now + 45 * 60000).toISOString(),
      leadStage: 'Warm',
      source: 'Google Ads',
    },
    {
      id: 'cb-3',
      agentName, projectId: websiteId,
      customer: 'Arun Mehta',
      mobile: '9876543212',
      reason: 'Wants brochure',
      priority: 'High',
      dueAt: new Date(now - 5 * 60000).toISOString(),   // overdue
      leadStage: 'Hot',
      source: 'Referral',
    },
  ];
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function Calls() {
  const { user, activeWebsiteId } = useAuth();

  const [activeTab, setActiveTab] = useState('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [dispositionFilter, setDispositionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedCall, setSelectedCall] = useState(null);
  const [inCall, setInCall] = useState(null);
  const [showWrapUp, setShowWrapUp] = useState(null);
  const [showFollowUp, setShowFollowUp] = useState(null);
  const [showQuickDialer, setShowQuickDialer] = useState(false);
  const [toast, setToast] = useState(null);
  const [callHistory, setCallHistory] = useState([]);

  const [callbacks, setCallbacks] = useState(() =>
    buildDemoCallbacks(user?.name || 'Agent', activeWebsiteId)
  );

  // Queue state for Save & Next
  const [callQueue, setCallQueue] = useState(null);
  const [queueIndex, setQueueIndex] = useState(0);

  useEffect(() => {
    setCallbacks(buildDemoCallbacks(user?.name || 'Agent', activeWebsiteId));
  }, [user?.name, activeWebsiteId]);

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
    if (dispositionFilter !== 'all') {
      list = list.filter((c) => c.outcome === dispositionFilter);
    }
    if (dateRange !== 'all') {
      list = list.filter((c) => inDateRange(c, dateRange));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => {
        const hay = `${c.customer || c.leadName || ''} ${c.mobile || c.phone || ''} ${c.outcome || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return list;
  }, [agentCalls, activeTab, directionFilter, dispositionFilter, dateRange, searchQuery]);

  /* ---------- SUMMARY ---------- */
  const summary = useMemo(() => {
    const scoped = agentCalls.filter((c) => inDateRange(c, dateRange));
    const total = scoped.length;
    const connected = scoped.filter((c) => c.status === 'connected').length;
    const missed = scoped.filter((c) => c.status === 'missed').length;
    const recordings = scoped.filter((c) => c.recording || c.recordingUrl).length;
    const followUpsDue = scoped.filter((c) => c.followUpDate).length;
    return { total, connected, missed, recordings, followUpsDue };
  }, [agentCalls, dateRange]);

  /* ---------- CALLBACKS ---------- */
  const visibleCallbacks = useMemo(() => {
    return [...callbacks].sort((a, b) => {
      const pa = { High: 0, Medium: 1, Low: 2 }[a.priority];
      const pb = { High: 0, Medium: 1, Low: 2 }[b.priority];
      if (pa !== pb) return pa - pb;
      return new Date(a.dueAt) - new Date(b.dueAt);
    });
  }, [callbacks]);

  /* ---------- HANDLERS ---------- */
  const handleStartCall = (target) => {
    setInCall({
      name: target.name || target.customer || 'Unknown',
      mobile: target.mobile || target.phone,
      leadId: target.id || target.leadId,
      direction: target.direction || 'outgoing',
      context: {
        source: target.source || '—',
        stage: target.leadStage || '—',
        interest: target.interest || '—',
        budget: target.budget || '—',
        location: target.location || '—',
        lastContact: target.lastContact || '—',
        campaign: target.campaign || '—',
      },
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
      status:
        payload.disposition === 'No Answer' || payload.disposition === 'Missed'
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
    setShowWrapUp(entry);
  };

  /* Post-call wrap-up save. Handles follow-up scheduling too. */
  const handleSaveWrapUp = (call, payload) => {
    const {
      disposition, notes, tags,
      leadStage, interestType, notInterestedReason,
      followUp,
    } = payload;

    setCallHistory((prev) =>
      prev.map((c) =>
        c.id === call.id
          ? {
              ...c,
              outcome: disposition,
              notes,
              tags,
              leadStage,
              interestType,
              notInterestedReason,
              followUpDate: followUp
                ? `${followUp.date}${followUp.time ? ` · ${followUp.time}` : ''}`
                : undefined,
              followUpNotes: followUp?.notes,
            }
          : c
      )
    );

    // If follow-up scheduled → push into callbacks
    if (followUp?.date) {
      const dueAt = new Date(`${followUp.date}T${followUp.time || '10:00'}:00`).toISOString();
      setCallbacks((prev) => [
        ...prev,
        {
          id: `cb-${Date.now()}`,
          agentName: user?.name || 'Agent',
          projectId: activeWebsiteId,
          customer: call.customer,
          mobile: call.mobile,
          reason: disposition || 'Callback',
          priority: leadStage === 'Hot' ? 'High' : 'Medium',
          dueAt,
          leadStage: leadStage || '—',
          source: call.source || '—',
        },
      ]);
    }

    setShowWrapUp(null);

    // Advance the queue if we came from one
    if (callQueue) {
      const nextIndex = queueIndex + 1;
      if (nextIndex < callQueue.length) {
        setQueueIndex(nextIndex);
        const next = callQueue[nextIndex];
        showToast(`Next · ${next.customer}`);
        setTimeout(() => handleStartCall({ ...next, direction: 'outgoing' }), 300);
      } else {
        setCallQueue(null);
        setQueueIndex(0);
        showToast('Callback queue complete 🎉');
      }
    } else {
      showToast('Call saved');
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

  /* ---------- CALLBACK QUEUE ---------- */
  const handleStartQueue = () => {
    if (visibleCallbacks.length === 0) {
      showToast('No callbacks to queue', 'error');
      return;
    }
    setCallQueue(visibleCallbacks);
    setQueueIndex(0);
    handleStartCall({ ...visibleCallbacks[0], direction: 'outgoing' });
  };

  const handleCallbackComplete = (cb) => {
    setCallbacks((prev) => prev.filter((c) => c.id !== cb.id));
    showToast(`${cb.customer} callback cleared`);
  };

  const handleCallbackSnooze = (cb, minutes) => {
    setCallbacks((prev) =>
      prev.map((c) =>
        c.id === cb.id
          ? { ...c, dueAt: new Date(Date.now() + minutes * 60000).toISOString() }
          : c
      )
    );
    showToast(`Snoozed ${cb.customer} by ${minutes} min`);
  };

  /* ---------- QUICK DIALER ---------- */
  const handleQuickDial = (number) => {
    setShowQuickDialer(false);
    handleStartCall({
      name: 'Unknown',
      mobile: number,
      direction: 'outgoing',
    });
  };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-24">
        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Calls</h1>
            <p className="text-sm text-brand-ink/50">
              Your calling workspace — callbacks, calls, and conversations.
            </p>
          </div>

          <button
            onClick={() => setShowQuickDialer(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Hash size={14} /> Quick Dial
          </button>
        </div>

        {/* ================= CALLBACK QUEUE (hero) ================= */}
        <CallbackQueueCard
          callbacks={visibleCallbacks}
          onStartQueue={handleStartQueue}
          onCall={(cb) => handleStartCall({ ...cb, direction: 'outgoing' })}
          onComplete={handleCallbackComplete}
          onSnooze={handleCallbackSnooze}
        />

        {/* ================= KPI STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard label="Total Calls"      value={summary.total}      sub="In range"       icon={PhoneCall}     color="purple"  delay={0} />
          <AnimatedStatCard label="Connected"        value={summary.connected}  sub="Successful"     icon={CheckCircle2}  color="emerald" delay={40} />
          <AnimatedStatCard label="Missed"           value={summary.missed}     sub="Need callback"  icon={PhoneMissed}   color="rose"    delay={80} />
          <AnimatedStatCard label="Recordings"       value={summary.recordings} sub="Available"      icon={FileAudio}     color="amber"   delay={120} />
          <AnimatedStatCard label="Follow-ups Due"   value={summary.followUpsDue} sub="Scheduled"    icon={Calendar}      color="purple"  delay={160} />
        </div>

        {/* ================= TABS ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {CALL_TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count =
                t.key === 'missed'
                  ? agentCalls.filter((c) => c.status === 'missed').length
                  : null;
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
                  {t.live && !active && count > 0 && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                    </span>
                  )}
                  {count !== null && (
                    <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= SEARCH + FILTERS ================= */}
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

          <DropdownFilter
            label="Date"
            icon={Calendar}
            value={dateRange}
            options={DATE_RANGE_OPTIONS}
            onChange={setDateRange}
          />

          {(activeTab === 'history' || activeTab === 'recordings') && (
            <DropdownFilter
              label="Direction"
              icon={ArrowRightLeft}
              value={directionFilter}
              options={[
                { value: 'all', label: 'All directions' },
                { value: 'inbound', label: 'Inbound' },
                { value: 'outbound', label: 'Outbound' },
              ]}
              onChange={setDirectionFilter}
            />
          )}

          {(activeTab === 'history' || activeTab === 'inbound' || activeTab === 'outbound' || activeTab === 'missed') && (
            <DropdownFilter
              label="Disposition"
              icon={Tag}
              value={dispositionFilter}
              options={[
                { value: 'all', label: 'All dispositions' },
                ...DISPOSITIONS.map((d) => ({ value: d, label: d })),
              ]}
              onChange={setDispositionFilter}
            />
          )}

          <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
            <ListFilter size={14} className="text-brand-magenta" />
            Showing: <span className="text-brand-magenta">{filteredCalls.length}</span>
          </span>
        </div>

        {/* ================= CALLS LIST ================= */}
        {filteredCalls.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="space-y-2">
            {filteredCalls.map((call) => (
              <CallRow
                key={call.id}
                call={call}
                missedMode={activeTab === 'missed'}
                onView={() => setSelectedCall(call)}
                onCall={() => handleStartCall({ ...call, direction: 'outgoing' })}
                onSchedule={() => {
                  setShowFollowUp(call);
                }}
              />
            ))}
          </div>
        )}

        {/* ================= DRAWERS / MODALS ================= */}
        {inCall && (
          <CallModal
            target={inCall}
            inQueue={!!callQueue}
            queueIndex={queueIndex}
            queueSize={callQueue?.length || 0}
            nextTarget={callQueue?.[queueIndex + 1]}
            onSkip={() => {
              if (!callQueue) return;
              const nextIndex = queueIndex + 1;
              if (nextIndex < callQueue.length) {
                setQueueIndex(nextIndex);
                handleStartCall({ ...callQueue[nextIndex], direction: 'outgoing' });
              } else {
                setCallQueue(null);
                setQueueIndex(0);
                setInCall(null);
              }
            }}
            onClose={() => { setInCall(null); setCallQueue(null); setQueueIndex(0); }}
            onEnd={handleCallEnd}
          />
        )}

        {selectedCall && (
          <CallDetailDrawer
            call={selectedCall}
            onClose={() => setSelectedCall(null)}
            onCall={() => {
              handleStartCall({
                name: selectedCall.customer || 'Unknown',
                mobile: selectedCall.mobile,
                leadId: selectedCall.leadId,
                direction: 'outgoing',
              });
              setSelectedCall(null);
            }}
            onSchedule={() => { setShowFollowUp(selectedCall); setSelectedCall(null); }}
          />
        )}

        {showWrapUp && (
          <CallWrapUpModal
            call={showWrapUp}
            inQueue={!!callQueue}
            onClose={() => setShowWrapUp(null)}
            onSave={handleSaveWrapUp}
          />
        )}

        {showFollowUp && (
          <FollowUpModal
            call={showFollowUp}
            onClose={() => setShowFollowUp(null)}
            onSave={handleSaveFollowUp}
          />
        )}

        {showQuickDialer && (
          <QuickDialerModal
            onClose={() => setShowQuickDialer(false)}
            onDial={handleQuickDial}
            recentNumbers={[
              { name: 'Rahul Kumar', mobile: '9876543210' },
              { name: 'Priya Sharma', mobile: '9876543211' },
              { name: 'Arun Mehta', mobile: '9876543212' },
            ]}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ================================================================
   CALLBACK QUEUE CARD
   ================================================================ */
function CallbackQueueCard({ callbacks, onStartQueue, onCall, onComplete, onSnooze }) {
  const now = Date.now();
  const overdueCount = callbacks.filter((c) => new Date(c.dueAt).getTime() < now).length;
  const highCount = callbacks.filter((c) => c.priority === 'High').length;
  const hasWork = callbacks.length > 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-r from-white via-white to-brand-lilac/20 shadow-[0_8px_24px_-12px_rgba(227,28,121,0.2)]">
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-magenta/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-brand-purple/10 blur-3xl" />

      <div className="relative p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
                <Zap size={14} />
                <span className="absolute inset-0 -z-10 animate-ping rounded-lg bg-brand-magenta/30" />
              </span>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
                Callback Queue
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <FocusStat value={callbacks.length} label="Callbacks"  tone="purple" icon={PhoneCall} />
              <span className="hidden h-8 w-px bg-brand-lilac sm:block" />
              <FocusStat value={overdueCount}    label="Overdue"    tone="rose"   icon={AlertTriangle} />
              <span className="hidden h-8 w-px bg-brand-lilac sm:block" />
              <FocusStat value={highCount}       label="High Priority" tone="amber" icon={Flame} />
            </div>
          </div>

          <button
            onClick={onStartQueue}
            disabled={!hasWork}
            className="group/btn relative inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-14px_rgba(227,28,121,0.7)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Play size={15} className="transition-transform group-hover/btn:scale-110" />
            Start Queue
            {hasWork && (
              <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
                {callbacks.length}
              </span>
            )}
          </button>
        </div>

        {hasWork ? (
          <div className="mt-4 space-y-2">
            {callbacks.slice(0, 3).map((cb) => (
              <CallbackRow
                key={cb.id}
                callback={cb}
                onCall={() => onCall(cb)}
                onComplete={() => onComplete(cb)}
                onSnooze={(min) => onSnooze(cb, min)}
              />
            ))}
            {callbacks.length > 3 && (
              <p className="pt-1 text-center text-[11px] font-semibold text-brand-magenta">
                +{callbacks.length - 3} more in queue
              </p>
            )}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-brand-lilac bg-white/60 p-4 text-center text-xs text-brand-ink/50">
            No callbacks right now — nice! 🎉
          </p>
        )}
      </div>
    </div>
  );
}

function CallbackRow({ callback, onCall, onComplete, onSnooze }) {
  const due = new Date(callback.dueAt);
  const isOverdue = due.getTime() < Date.now();
  const mins = Math.round(Math.abs(due.getTime() - Date.now()) / 60000);
  const dueLabel = isOverdue
    ? `Overdue ${mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`}`
    : `Due in ${mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`}`;

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl border-2 bg-white px-3 py-2.5 transition-all hover:shadow-sm ${
      isOverdue ? 'border-rose-200' : 'border-brand-lilac/70'
    }`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white shadow-sm">
        {callback.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-brand-ink">{callback.customer}</p>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[callback.priority]}`}>
            {callback.priority}
          </span>
          {callback.leadStage && callback.leadStage !== '—' && (
            <span className="shrink-0 rounded-full bg-brand-mist px-2 py-0.5 text-[9px] font-semibold text-brand-ink/60">
              {callback.leadStage}
            </span>
          )}
        </div>
        <p className="truncate text-[11px] text-brand-ink/50">
          {callback.mobile} · {callback.reason}
        </p>
      </div>

      <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
        isOverdue ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      }`}>
        {isOverdue ? <AlertTriangle size={9} /> : <Clock size={9} />}
        {dueLabel}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onCall}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 px-2.5 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
        >
          <Phone size={11} /> Call
        </button>
        <button
          onClick={() => onSnooze(30)}
          className="hidden h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta sm:flex"
          title="Snooze 30 min"
        >
          <Timer size={11} />
        </button>
        <button
          onClick={onComplete}
          className="hidden h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta sm:flex"
          title="Mark done"
        >
          <CheckCircle2 size={11} />
        </button>
      </div>
    </div>
  );
}

function FocusStat({ value, label, tone = 'purple', icon: Icon }) {
  const tones = {
    purple: 'text-brand-purple',
    rose:   'text-brand-magenta',
    amber:  'text-amber-600',
    emerald:'text-emerald-600',
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-mist ${tones[tone]}`}>
        <Icon size={14} />
      </span>
      <div className="leading-tight">
        <p className={`font-display text-xl font-bold tabular-nums ${tones[tone]}`}>{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
      </div>
    </div>
  );
}

/* ================================================================
   CALL ROW
   ================================================================ */
function CallRow({ call, missedMode, onView, onCall, onSchedule }) {
  const type = call.type === 'inbound' || call.type === 'incoming' ? 'inbound' : 'outbound';
  const status = call.status || (call.outcome === 'No Answer' ? 'missed' : 'connected');
  const customer = call.customer || call.leadName || 'Unknown';
  const mobile = call.mobile || call.phone || '—';
  const missedAgo = status === 'missed' ? timeAgo(call.date) : null;

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
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-brand-ink">{customer}</p>
          {missedAgo && (
            <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-500 ring-1 ring-rose-200">
              Missed {missedAgo}
            </span>
          )}
        </div>
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
        {missedMode && (
          <button
            onClick={onSchedule}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
            title="Schedule callback"
          >
            <Calendar size={12} />
          </button>
        )}
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
          title="View details"
        >
          <User size={13} />
        </button>
        <button
          onClick={onCall}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 px-2.5 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
          title="Call now"
        >
          <PhoneCall size={12} /> Call
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   IN-CALL MODAL — now with Lead Context panel
   ================================================================ */
function CallModal({ target, inQueue, queueIndex, queueSize, nextTarget, onSkip, onClose, onEnd }) {
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
  const ctx = target.context || {};

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
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-panel">
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* ============ LEFT: Call ============ */}
          <div className="md:col-span-3">
            <div className={`relative px-6 pb-6 pt-6 text-center text-white ${
              callState === 'connected'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
                <span className="truncate text-white/80">Outgoing call</span>
                {inQueue && (
                  <span className="rounded-full bg-white/25 px-2 py-0.5">
                    {String(queueIndex + 1).padStart(2, '0')} / {String(queueSize).padStart(2, '0')}
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20"
              >
                <X size={18} />
              </button>

              {recording && callState === 'connected' && (
                <div className="absolute left-4 top-14 flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2.5 py-1 text-[10px] font-bold">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  REC
                </div>
              )}

              <div className="relative mx-auto mb-3 mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30 text-xl font-bold">
                  {name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
              </div>

              <p className="text-lg font-semibold">{name}</p>
              <p className="text-xs text-white/70">{phone}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                {callState === 'ringing' ? 'Ringing…' : `Connected · ${formatTime(seconds)}`}
              </p>
            </div>

            <div className="p-5">
              {callState === 'connected' && (
                <div className="mb-4 grid grid-cols-5 gap-2">
                  <CallControl icon={muted ? MicOff : Mic} label={muted ? 'Unmute' : 'Mute'} active={muted} onClick={() => setMuted((m) => !m)} />
                  <CallControl icon={speaker ? Volume2 : VolumeX} label="Speaker" active={speaker} onClick={() => setSpeaker((s) => !s)} />
                  <CallControl icon={onHold ? PlayCircle : PauseCircle} label={onHold ? 'Resume' : 'Hold'} active={onHold} onClick={() => setOnHold((h) => !h)} />
                  <CallControl icon={ArrowRightLeft} label="Transfer" active={transferOpen} onClick={() => setTransferOpen((t) => !t)} />
                  <CallControl icon={recording ? Pause : Play} label={recording ? 'Pause Rec' : 'Record'} active={recording} onClick={() => setRecording((r) => !r)} />
                </div>
              )}

              {transferOpen && callState === 'connected' && (
                <div className="mb-4 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
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

              {callState === 'connected' && (
                <div className="space-y-3">
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
                </div>
              )}

              {callState === 'ringing' ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
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
                    <PhoneMissed size={16} /> End
                  </button>
                </div>
              ) : (
                <button
                  onClick={endCall}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
                >
                  <PhoneOff size={16} /> End Call · {formatTime(seconds)}
                </button>
              )}

              {inQueue && nextTarget && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-brand-ink/40">Next:</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[9px] font-bold text-white">
                    {nextTarget.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <span className="truncate font-semibold text-brand-ink">{nextTarget.customer}</span>
                  <ChevronRight size={14} className="ml-auto text-brand-ink/30" />
                </div>
              )}
            </div>
          </div>

          {/* ============ RIGHT: Lead Context ============ */}
          <aside className="border-l border-brand-lilac/60 bg-brand-mist/30 p-5 md:col-span-2">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-magenta">
              <Sparkles size={11} /> Lead Context
            </p>

            <div className="space-y-2.5">
              <ContextRow icon={Flame}        label="Status"       value={ctx.stage || '—'} />
              <ContextRow icon={MegaphoneIcon} label="Source"      value={ctx.source || '—'} />
              <ContextRow icon={Building2}    label="Interest"     value={ctx.interest || '—'} />
              <ContextRow icon={IndianRupee}  label="Budget"       value={ctx.budget || '—'} />
              <ContextRow icon={MapPin}       label="Location"     value={ctx.location || '—'} />
              <ContextRow icon={Calendar}     label="Last Contact" value={ctx.lastContact || '—'} />
              <ContextRow icon={Layers}       label="Campaign"     value={ctx.campaign || '—'} />
            </div>

            <div className="mt-5 rounded-xl border border-brand-lilac bg-white p-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                Quick Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['🔥 Hot Lead', '💰 Price Concern', '🏠 Interest', '📅 Callback', '📄 Brochure'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNotes((n) => (n ? `${n}\n` : '') + t)}
                    className="rounded-full border border-brand-lilac bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* inline helper icons so we don't import more lucide names */
const MegaphoneIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

function ContextRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/40 pb-1.5 text-xs last:border-b-0">
      <span className="flex shrink-0 items-center gap-1.5 text-brand-ink/50">
        <Icon size={11} /> {label}
      </span>
      <span className="truncate font-semibold text-brand-ink">{value}</span>
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
      className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 transition-all ${
        active
          ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
          : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
      }`}
    >
      <Icon size={16} />
      <span className="text-[9px] font-semibold">{label}</span>
    </button>
  );
}

/* ================================================================
   CALL DETAIL DRAWER — with timeline
   ================================================================ */
function CallDetailDrawer({ call, onClose, onCall, onSchedule }) {
  const type = call.type === 'inbound' || call.type === 'incoming' ? 'inbound' : 'outbound';
  const status = call.status || 'connected';
  const customer = call.customer || call.leadName || 'Unknown';
  const mobile = call.mobile || call.phone || '—';

  // Timeline merged from previous calls + this one
  const timeline = [
    {
      id: 'now',
      type,
      when: call.date ? new Date(call.date).toLocaleString() : 'Just now',
      duration: call.duration || '—',
      outcome: call.outcome || '—',
      tone: status === 'missed' ? 'rose' : 'emerald',
      current: true,
    },
    { id: 't1', type: 'outbound', when: 'Yesterday · 3:45 PM', duration: '0:52', outcome: 'Follow-up callback', tone: 'violet' },
    { id: 't2', type: 'inbound',  when: 'Sep 28 · 11:20 AM',  duration: '2:14', outcome: 'Requested brochure',  tone: 'emerald' },
    { id: 't3', type: 'outbound', when: 'Sep 26 · 5:10 PM',   duration: '1:08', outcome: 'No Answer',           tone: 'slate' },
  ];

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-ink">Call Details</h3>
            <p className="text-xs text-brand-ink/50">Full call record</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
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

          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Duration" value={call.duration || '—'} />
            <InfoBox label="Type"     value={type} />
            <InfoBox label="Outcome"  value={call.outcome || '—'} />
            <InfoBox label="Agent"    value={call.agentName || call.agent || 'You'} />
          </div>

          {call.notes && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                Notes
              </p>
              <p className="text-sm text-brand-ink/80">{call.notes}</p>
            </div>
          )}

          {/* Recording mini player */}
          {(call.recording || call.recordingUrl) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <FileAudio size={14} />
                </span>
                <p className="text-sm font-semibold text-brand-ink">Call Recording</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                </button>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-100">
                  <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple" />
                </div>
                <span className="shrink-0 font-mono text-[10px] text-amber-700">02:14 / 04:32</span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        speed === s ? 'bg-brand-magenta text-white' : 'bg-white text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
                  <Download size={11} /> Download
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onCall}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <PhoneCall size={16} /> Call Back
            </button>
            <button
              onClick={onSchedule}
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <Calendar size={16} /> Follow-up
            </button>
          </div>

          {/* Call Timeline */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <History size={12} /> Call Timeline
              </p>
            </div>
            <div className="relative space-y-3">
              <span className="pointer-events-none absolute left-[15px] top-4 bottom-4 w-px bg-brand-lilac" />
              {timeline.map((t) => (
                <div key={t.id} className="relative flex items-start gap-3">
                  <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                    t.tone === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                    t.tone === 'rose'    ? 'bg-rose-100 text-rose-500' :
                    t.tone === 'violet'  ? 'bg-violet-100 text-brand-purple' :
                                           'bg-slate-100 text-slate-500'
                  }`}>
                    {t.type === 'inbound' ? <PhoneIncoming size={12} /> : <PhoneOutgoing size={12} />}
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl border border-brand-lilac/60 bg-white p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold capitalize text-brand-ink">
                        {t.type} {t.current && <span className="ml-1 rounded-full bg-brand-magenta/10 px-1.5 py-0.5 text-[9px] font-bold text-brand-magenta">Current</span>}
                      </p>
                      <span className="font-mono text-[10px] text-brand-ink/50">{t.duration}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-brand-ink/60">{t.outcome}</p>
                    <p className="mt-0.5 text-[10px] text-brand-ink/40">{t.when}</p>
                  </div>
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
   CALL WRAP-UP MODAL
   ================================================================ */
function CallWrapUpModal({ call, inQueue, onClose, onSave }) {
  const [disposition, setDisposition] = useState(call.outcome || 'Connected');
  const [notes, setNotes] = useState(call.notes || '');
  const [tags, setTags] = useState([]);
  const [leadStage, setLeadStage] = useState(call.leadStage || 'Warm');
  const [interestType, setInterestType] = useState('Warm');
  const [notInterestedReason, setNotInterestedReason] = useState('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return ymd(d);
  });
  const [followUpTime, setFollowUpTime] = useState('10:00');
  const [followUpNotes, setFollowUpNotes] = useState('');

  const isInterested = disposition === 'Interested' || disposition === 'Converted';
  const isNotInterested = disposition === 'Not Interested';
  const isNoAnswer = disposition === 'No Answer' || disposition === 'Busy';

  const QUICK_TAGS = [
    { key: 'hot',     label: '🔥 Hot Lead' },
    { key: 'price',   label: '💰 Price Concern' },
    { key: 'brochure',label: '📄 Requested Brochure' },
    { key: 'callback',label: '📅 Callback' },
    { key: 'notint',  label: '❌ Not Interested' },
  ];

  const toggleTag = (k) =>
    setTags((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const handleSave = () => {
    onSave(call, {
      disposition,
      notes,
      tags,
      leadStage: isInterested ? interestType : leadStage,
      interestType,
      notInterestedReason,
      followUp: scheduleFollowUp
        ? { date: followUpDate, time: followUpTime, notes: followUpNotes }
        : null,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Call Wrap-Up</h3>
              <p className="text-xs text-brand-ink/50">
                {call.customer} · {call.duration}
              </p>
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

          {isInterested && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase text-emerald-700">
                Interest details
              </p>
              <div className="grid grid-cols-3 gap-2">
                {INTEREST_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setInterestType(t)}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-all ${
                      interestType === t
                        ? 'border-emerald-500 bg-white text-emerald-700'
                        : 'border-emerald-200 bg-white text-emerald-700/70 hover:bg-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isNotInterested && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase text-amber-700">
                Reason for not interested
              </p>
              <div className="grid grid-cols-2 gap-2">
                {NOT_INTERESTED_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setNotInterestedReason(r)}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-all ${
                      notInterestedReason === r
                        ? 'border-amber-500 bg-white text-amber-700'
                        : 'border-amber-200 bg-white text-amber-700/70 hover:bg-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isNoAnswer && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase text-brand-ink/60">
                Quick retry
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setScheduleFollowUp(true);
                    setFollowUpTime(new Date(Date.now() + 15 * 60000).toTimeString().slice(0, 5));
                    setFollowUpDate(ymd(new Date()));
                  }}
                  className="rounded-lg border border-brand-lilac bg-white px-2 py-1.5 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
                >
                  Retry 15m
                </button>
                <button
                  onClick={() => {
                    setScheduleFollowUp(true);
                    setFollowUpTime(new Date(Date.now() + 60 * 60000).toTimeString().slice(0, 5));
                    setFollowUpDate(ymd(new Date()));
                  }}
                  className="rounded-lg border border-brand-lilac bg-white px-2 py-1.5 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
                >
                  Retry 1h
                </button>
                <button
                  onClick={() => {
                    setScheduleFollowUp(true);
                    const tm = new Date();
                    tm.setDate(tm.getDate() + 1);
                    setFollowUpDate(ymd(tm));
                    setFollowUpTime('10:00');
                  }}
                  className="rounded-lg border border-brand-lilac bg-white px-2 py-1.5 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
                >
                  Tomorrow
                </button>
              </div>
            </div>
          )}

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

          <div>
            <p className="mb-1.5 text-xs font-semibold text-brand-ink/70">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => toggleTag(t.key)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    tags.includes(t.key)
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
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

          {scheduleFollowUp && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-lg border border-brand-lilac bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
                />
                <input
                  type="time"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="w-full rounded-lg border border-brand-lilac bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
                />
              </div>
              <input
                type="text"
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                placeholder="Follow-up notes (optional)"
                className="w-full rounded-lg border border-brand-lilac bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              {inQueue ? 'Save & Next' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   FOLLOW-UP MODAL (light, from row/missed)
   ================================================================ */
function FollowUpModal({ call, onClose, onSave }) {
  const today = ymd(new Date());
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
              <p className="text-xs text-brand-ink/50">{call.customer || call.leadName || 'Customer'}</p>
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
   QUICK DIALER MODAL
   ================================================================ */
function QuickDialerModal({ onClose, onDial, recentNumbers = [] }) {
  const [number, setNumber] = useState('');

  const pressKey = (k) => setNumber((n) => (n + k).slice(0, 15));
  const backspace = () => setNumber((n) => n.slice(0, -1));
  const clear = () => setNumber('');

  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Hash size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Quick Dialer</h3>
              <p className="text-xs text-brand-ink/50">Enter a number to call</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^\d*#+]/g, ''))}
            placeholder="+91 98765 43210"
            className="w-full bg-transparent text-center font-display text-lg font-bold tracking-wider text-brand-ink outline-none placeholder:font-normal placeholder:text-brand-ink/30"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {keypad.flat().map((k) => (
            <button
              key={k}
              onClick={() => pressKey(k)}
              className="flex h-12 items-center justify-center rounded-xl border border-brand-lilac bg-white text-base font-bold text-brand-ink hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={backspace}
            className="flex h-10 items-center justify-center rounded-xl border border-brand-lilac bg-white text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <Delete size={14} />
          </button>
          <button
            onClick={() => onDial(number)}
            disabled={number.replace(/\D/g, '').length < 6}
            className="col-span-1 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-card hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Phone size={13} /> Call
          </button>
          <button
            onClick={clear}
            className="flex h-10 items-center justify-center rounded-xl border border-brand-lilac bg-white text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Clear
          </button>
        </div>

        {recentNumbers.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
              Recent
            </p>
            <div className="space-y-1">
              {recentNumbers.slice(0, 3).map((r, i) => (
                <button
                  key={i}
                  onClick={() => setNumber(r.mobile)}
                  className="flex w-full items-center justify-between rounded-lg border border-brand-lilac/60 bg-white px-3 py-2 text-left text-xs hover:border-brand-magenta/40 hover:bg-brand-lilac/30"
                >
                  <span className="truncate font-semibold text-brand-ink">{r.name}</span>
                  <span className="shrink-0 font-mono text-brand-ink/50">{r.mobile}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
        Records will appear here as calls are made or received.
      </p>
    </div>
  );
}

/* ================================================================
   DROPDOWN FILTER
   ================================================================ */
function DropdownFilter({ label, icon: Icon, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const normalized = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );
  const current = normalized.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        <span className="text-brand-ink/60">{label}:</span>
        <span className="font-semibold capitalize text-brand-magenta">{current?.label ?? value}</span>
        <ChevronDown size={14} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {normalized.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === o.value
                    ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
              >
                {o.label}
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