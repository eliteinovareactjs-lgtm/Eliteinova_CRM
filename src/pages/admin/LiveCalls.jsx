// src/pages/admin/LiveCalls.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Users, PhoneCall,
  Clock, User, Mic, Play, X, Globe, ChevronDown, Filter,
  RefreshCw, Activity, Headphones, Phone, CircleDot, Pause,
  Volume2, VolumeX, RotateCcw, AlertCircle, CheckCircle2, Hash,
  Radio, PhoneForwarded, Voicemail, Timer, TrendingUp, Target,
  Building2, UserCheck, PauseCircle, Zap, BarChart3, PhoneOff,
  Search, Eye, MoveRight, UserCircle2, Circle, Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AGENTS, LEADS } from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   SAMPLE LIVE CALLS
   ═══════════════════════════════════════════════════════════════ */
const SAMPLE_LIVE_CALLS = [
  { id: 'L-001', websiteId: 'eliteinova', customer: 'Ramesh Kannan',  mobile: '9876543210', agent: 'Agent1', type: 'incoming', status: 'ringing',   startedAt: Date.now() - 12 * 1000 },
  { id: 'L-002', websiteId: 'eliteinova', customer: 'Kavitha Muthu',  mobile: '9876543212', agent: 'Agent2', type: 'incoming', status: 'on-hold',   startedAt: Date.now() - 65 * 1000 },
  { id: 'L-003', websiteId: 'eliteinova', customer: 'Venu Gopal',     mobile: '9876543213', agent: 'Agent1', type: 'outgoing', status: 'connected', startedAt: Date.now() - 272 * 1000 },
  { id: 'L-004', websiteId: 'eliteinova', customer: 'Anita Sharma',   mobile: '9876543214', agent: 'Agent3', type: 'incoming', status: 'ringing',   startedAt: Date.now() - 5 * 1000 },
  { id: 'L-005', websiteId: 'eliteinova', customer: 'Suresh Iyer',    mobile: '9876543215', agent: 'Agent2', type: 'outgoing', status: 'connected', startedAt: Date.now() - 138 * 1000 },
  { id: 'L-006', websiteId: 'eliteinova', customer: 'Priya Nair',     mobile: '9876543216', agent: 'Agent3', type: 'incoming', status: 'connected', startedAt: Date.now() - 340 * 1000 },
  { id: 'L-007', websiteId: 'eliteinova', customer: 'Karthik Raja',   mobile: '9876543217', agent: 'Agent1', type: 'outgoing', status: 'missed',    startedAt: Date.now() - 480 * 1000 },
];

/* Channel theme: mapping tailwind color names to `from-*` classes for gradients */
const STATUS_THEME = {
  connected: { chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', from: 'from-emerald-500', label: 'Connected' },
  ringing:   { chip: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   from: 'from-amber-500',   label: 'Ringing' },
  'on-hold': { chip: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500',    from: 'from-blue-500',    label: 'On Hold' },
  missed:    { chip: 'bg-rose-100 text-brand-magenta border-rose-200',     dot: 'bg-brand-magenta', from: 'from-brand-magenta', label: 'Missed' },
  ended:     { chip: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400',   from: 'from-slate-400',   label: 'Ended' },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const initials = (name) =>
  (name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

/* ✅ FIXED: handles hours for calls > 60 min */
const formatDuration = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  return `${m}:${ss.toString().padStart(2, '0')}`;
};

/* Past recordings — generated deterministically per customer name so it feels real */
const seedRecordings = (customer) => {
  /* Simple hash from name to vary durations */
  const hash = (customer || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = hash % 100;
  return [
    { id: 1, type: 'inbound',  durationSec: 120 + (base % 60), date: 'Today · 9:30 AM',       outcome: 'Discussed pricing' },
    { id: 2, type: 'outbound', durationSec: 45 + (base % 30),  date: 'Yesterday · 3:45 PM',   outcome: 'Follow-up callback' },
    { id: 3, type: 'inbound',  durationSec: 80 + (base % 40),  date: '3 days ago · 11:22 AM', outcome: 'Enquiry details' },
  ];
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function LiveCalls() {
  const { activeWebsiteId, activeWebsite } = useAuth();

  const [tab, setTab] = useState('incoming');
  const [agentFilter, setAgentFilter] = useState('All');
  const [agentOpen, setAgentOpen] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [mounted, setMounted] = useState(false);
  /* ✅ FIXED: tick is used via `lastUpdate` derived value to force re-render */
  const [, setTick] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  /* Live duration ticker — updates `now` so `getLiveDuration` recomputes */
  useEffect(() => {
    const interval = setInterval(() => {
      /* Pause when tab hidden to save battery */
      if (typeof document !== 'undefined' && document.hidden) return;
      setNow(Date.now());
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* Agents scoped to website */
  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* Website-scoped live calls */
  const scopedLiveCalls = useMemo(
    () => SAMPLE_LIVE_CALLS.filter((c) => c.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* Filtered by tab + agent */
  const liveCalls = useMemo(() => {
    let calls = scopedLiveCalls.filter((c) => c.type === tab);
    if (agentFilter !== 'All') {
      calls = calls.filter((c) => c.agent === agentFilter);
    }
    return calls;
  }, [scopedLiveCalls, tab, agentFilter]);

  /* Stats — derived from SCOPED calls (respects agent filter) */
  const stats = useMemo(() => {
    const calls = agentFilter === 'All'
      ? scopedLiveCalls
      : scopedLiveCalls.filter((c) => c.agent === agentFilter);

    const incoming = calls.filter((c) => c.type === 'incoming').length;
    const outgoing = calls.filter((c) => c.type === 'outgoing').length;
    const connected = calls.filter((c) => c.status === 'connected').length;
    const ringing = calls.filter((c) => c.status === 'ringing').length;
    const onHold = calls.filter((c) => c.status === 'on-hold').length;
    const missed = calls.filter((c) => c.status === 'missed').length;
    const uniqueAgents = new Set(calls.map((c) => c.agent).filter(Boolean)).size;
    const totalSec = calls.reduce((s, c) => s + Math.floor((now - (c.startedAt || now)) / 1000), 0);
    const avgSec = calls.length ? Math.round(totalSec / calls.length) : 0;
    const connectRate = calls.length ? Math.round((connected / calls.length) * 100) : 0;

    /* ✅ NEW: which agents are busy vs idle */
    const agentsOnCall = new Set(calls.filter((c) => c.status === 'connected').map((c) => c.agent));
    const agentsIdle = agents.filter((a) => !agentsOnCall.has(a.name)).length;

    return {
      total: calls.length, incoming, outgoing, connected, ringing, onHold,
      missed, uniqueAgents, totalSec, avgSec, connectRate, agentsIdle,
      agentsBusy: uniqueAgents,
    };
  }, [scopedLiveCalls, agentFilter, agents, now]);

  /* Counts per tab (respecting agent filter) */
  const tabCounts = useMemo(() => {
    const calls = agentFilter === 'All'
      ? scopedLiveCalls
      : scopedLiveCalls.filter((c) => c.agent === agentFilter);
    return {
      incoming: calls.filter((c) => c.type === 'incoming').length,
      outgoing: calls.filter((c) => c.type === 'outgoing').length,
    };
  }, [scopedLiveCalls, agentFilter]);

  /* ✅ FIXED: uses `now` so it recomputes on tick */
  const getLiveDuration = (call) => {
    if (!call.startedAt) return '0:00';
    const elapsed = Math.floor((now - call.startedAt) / 1000);
    return formatDuration(elapsed);
  };

  /* ✅ FIXED: agent filter includes ALL agents, not just ones with calls */
  const agentOptions = useMemo(() => {
    const set = new Set();
    agents.forEach((a) => set.add(a.name));
    scopedLiveCalls.forEach((c) => { if (c.agent) set.add(c.agent); });
    return ['All', ...Array.from(set)];
  }, [agents, scopedLiveCalls]);

  const handleRefresh = () => {
    setRefreshed(true);
    setNow(Date.now());
    setTick((t) => t + 1);
    setTimeout(() => setRefreshed(false), 900);
  };

  /* ✅ FIXED: header pill switches tab on click */
  const handlePillToggle = () => {
    setTab((prev) => (prev === 'incoming' ? 'outgoing' : 'incoming'));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className={`relative space-y-5 px-1 py-1 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>

        {/* ═══════════ HEADER ═══════════ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">
                Live · {activeWebsite?.name}
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-brand-ink">Live Calls</h1>
            <p className="mt-0.5 text-sm text-brand-ink/50">
              Real-time call activity on the IVR line
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Agent filter */}
            <div className="relative">
              <button
                onClick={() => setAgentOpen((s) => !s)}
                className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:border-brand-magenta/40 hover:shadow-md"
              >
                <Filter size={13} className="text-brand-magenta" />
                Agent: <span className="font-semibold text-brand-magenta">{agentFilter}</span>
                <ChevronDown size={13} className={`text-brand-ink/40 transition-transform ${agentOpen ? 'rotate-180' : ''}`} />
              </button>
              {agentOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAgentOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                    {agentOptions.map((name) => {
                      const isAll = name === 'All';
                      const active = agentFilter === name;
                      const count = isAll
                        ? scopedLiveCalls.length
                        : scopedLiveCalls.filter((c) => c.agent === name).length;
                      return (
                        <button
                          key={name}
                          onClick={() => { setAgentFilter(name); setAgentOpen(false); }}
                          className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                            active ? 'bg-brand-magenta/10 font-semibold text-brand-magenta' : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                          }`}
                        >
                          <span className="truncate">{isAll ? 'All Agents' : name}</span>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-brand-magenta/20 text-brand-magenta' : 'bg-brand-lilac/70 text-brand-purple'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className={`rounded-full border border-brand-lilac bg-white p-2.5 transition-all duration-500 ${
                refreshed ? 'rotate-[360deg] text-brand-magenta border-brand-magenta/40 shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]' : 'text-brand-ink/60 hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta'
              }`}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>

            {/* ✅ FIXED: Click to toggle tab */}
            <button
              onClick={handlePillToggle}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
              title="Click to toggle incoming / outgoing"
            >
              {tab === 'incoming' ? <PhoneIncoming size={14} /> : <PhoneOutgoing size={14} />}
              {tab === 'incoming' ? 'Incoming' : 'Outgoing'}
              <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold">
                {liveCalls.length}
              </span>
            </button>
          </div>
        </div>

        {/* ═══════════ KPI STRIP ═══════════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Real-Time</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
          </div>

          {/* ✅ FIXED: 4 per row for better spacing */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <LiveKpiCard
              icon={tab === 'incoming' ? PhoneIncoming : PhoneOutgoing}
              label="Active Calls"
              value={liveCalls.length}
              sub={`${stats.incoming} in · ${stats.outgoing} out`}
              color="purple"
              delay={0}
            />
            <LiveKpiCard
              icon={Headphones}
              label="Connected"
              value={stats.connected}
              sub={`${stats.connectRate}% connect rate`}
              color="emerald"
              delay={40}
            />
            <LiveKpiCard
              icon={Phone}
              label="Ringing"
              value={stats.ringing}
              sub="Awaiting answer"
              color="amber"
              delay={80}
            />
            <LiveKpiCard
              icon={PauseCircle}
              label="On Hold"
              value={stats.onHold}
              sub="Customers waiting"
              color="purple"
              delay={120}
            />
            <LiveKpiCard
              icon={PhoneMissed}
              label="Missed"
              value={stats.missed}
              sub="Needs follow-up"
              color="rose"
              delay={160}
            />
            <LiveKpiCard
              icon={Users}
              label="Agents Busy"
              value={stats.agentsBusy}
              sub={`${stats.agentsIdle} idle`}
              color="emerald"
              delay={200}
            />
            <LiveKpiCard
              icon={Timer}
              label="Avg Duration"
              value={stats.avgSec}
              sub={`${formatDuration(stats.totalSec)} total`}
              color="purple"
              delay={240}
              format="duration"
            />
            <LiveKpiCard
              icon={Radio}
              label="Unique Agents"
              value={stats.uniqueAgents}
              sub="In this session"
              color="rose"
              delay={280}
            />
          </div>
        </div>

        {/* ═══════════ TABS ═══════════ */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { key: 'incoming', label: 'Incoming', icon: PhoneIncoming, count: tabCounts.incoming },
              { key: 'outgoing', label: 'Outgoing', icon: PhoneOutgoing, count: tabCounts.outgoing },
            ].map(({ key, label, icon: Icon, count }) => {
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
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════ LIVE CALLS LIST ═══════════ */}
        {liveCalls.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 py-16 text-center">
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-lilac opacity-50" />
              <PhoneCall size={22} className="relative text-brand-magenta" />
            </span>
            <p className="font-display text-base font-semibold text-brand-ink">
              {agentFilter !== 'All'
                ? `No ${tab} calls for ${agentFilter}`
                : `No ${tab} calls right now`}
            </p>
            <p className="max-w-sm text-sm text-brand-ink/50">
              {agentFilter !== 'All'
                ? 'Try clearing the agent filter or switching tabs.'
                : 'When a call connects on the active IVR number, it will appear here in real time with caller ID, agent, and duration.'}
            </p>
            {agentFilter !== 'All' && (
              <button
                onClick={() => setAgentFilter('All')}
                className="text-xs font-semibold text-brand-magenta hover:underline"
              >
                Clear agent filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {liveCalls.map((call, idx) => (
              <LiveCallRow
                key={call.id}
                call={call}
                liveDuration={getLiveDuration(call)}
                onView={() => setSelectedCall(call)}
                delay={idx * 40}
              />
            ))}
          </div>
        )}

        {/* ═══════════ CALL DETAIL DRAWER ═══════════ */}
        {selectedCall && (
          <CallDetailDrawer
            call={selectedCall}
            liveDuration={getLiveDuration(selectedCall)}
            onClose={() => setSelectedCall(null)}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIVE KPI CARD
   ═══════════════════════════════════════════════════════════════ */
function LiveKpiCard({ icon: Icon, label, value, sub, color = 'purple', delay = 0, format = 'number' }) {
  const displayValue = useAnimatedCount(value);

  const themes = {
    purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'from-violet-50 via-violet-50/30 to-white', iconBg: 'bg-violet-100 text-brand-purple border-violet-200', bar: 'from-brand-purple to-brand-magenta', glow: 'bg-brand-purple/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]', valueColor: 'text-brand-purple' },
    emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'from-emerald-50 via-emerald-50/30 to-white', iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'from-emerald-500 to-emerald-400', glow: 'bg-emerald-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]', valueColor: 'text-emerald-600' },
    amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'from-amber-50 via-amber-50/30 to-white', iconBg: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'from-amber-500 to-orange-400', glow: 'bg-amber-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]', valueColor: 'text-amber-600' },
    rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'from-rose-50 via-rose-50/30 to-white', iconBg: 'bg-rose-100 text-brand-magenta border-rose-200', bar: 'from-brand-magenta to-brand-purple', glow: 'bg-brand-magenta/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]', valueColor: 'text-brand-magenta' },
  };
  const t = themes[color] || themes.purple;

  const renderedValue = format === 'duration'
    ? formatDuration(Number(value) || 0)
    : displayValue;

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/30 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 hover:-translate-y-1.5 animate-fade-slide-in ${t.border} ${t.shadow}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${t.iconBg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} />
        </span>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-200">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      <div className="relative z-10 w-full">
        <p className={`font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>{renderedValue}</p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </div>
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
   LIVE CALL ROW
   ═══════════════════════════════════════════════════════════════ */
function LiveCallRow({ call, liveDuration, onView, delay = 0 }) {
  const style = STATUS_THEME[call.status] || STATUS_THEME.ringing;
  const isConnected = call.status === 'connected';
  const isRinging = call.status === 'ringing';
  const isOnHold = call.status === 'on-hold';
  const isMissed = call.status === 'missed';
  const isLive = !isMissed; /* ✅ Only live statuses get the pulsing dot */

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-slide-in ${
        isRinging ? 'border-amber-200 hover:border-amber-300'
        : isConnected ? 'border-emerald-200 hover:border-emerald-300'
        : isOnHold ? 'border-blue-200 hover:border-blue-300'
        : isMissed ? 'border-rose-200 hover:border-rose-300'
        : 'border-brand-lilac/70 hover:border-brand-magenta/40'
      }`}
    >
      {/* ✅ FIXED: uses explicit `from` class */}
      <span className={`absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b ${style.from} to-transparent transition-transform duration-300 group-hover:scale-y-100`} />

      {/* Type icon */}
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
        call.type === 'incoming' ? 'bg-emerald-50 text-emerald-500' : 'bg-violet-50 text-brand-purple'
      }`}>
        {call.type === 'incoming' ? <PhoneIncoming size={18} /> : <PhoneOutgoing size={18} />}
      </span>

      {/* Customer */}
      <div className="min-w-0 flex-1">
        <button
          onClick={onView}
          className="block truncate text-left text-sm font-semibold text-brand-ink transition-colors hover:text-brand-magenta"
        >
          {call.customer}
        </button>
        <p className="truncate text-[11px] text-brand-ink/50">
          {call.mobile} · <span className="text-brand-purple">{call.agent}</span>
        </p>
      </div>

      {/* Status chip with pulse (only for live statuses) */}
      <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.chip}`}>
        {isLive ? (
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${style.dot} opacity-75`} />
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`} />
          </span>
        ) : (
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        )}
        {style.label}
      </span>

      {/* Live duration */}
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 font-mono text-[10px] font-semibold text-brand-ink/70 tabular-nums">
        <Clock size={10} />
        {liveDuration}
      </span>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="View details"
          aria-label="View details"
        >
          <Eye size={13} />
        </button>
        {!isMissed && (
          <button
            onClick={() => window.open(`tel:${call.mobile}`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple px-3 py-1.5 text-[11px] font-semibold text-white shadow-card transition-all hover:brightness-110"
            title="Join call"
          >
            <PhoneCall size={12} />
            Join
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CALL DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════ */
function CallDetailDrawer({ call, liveDuration, onClose }) {
  const style = STATUS_THEME[call.status] || STATUS_THEME.ringing;
  const pastCalls = seedRecordings(call.customer);
  const isMissed = call.status === 'missed';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              call.type === 'incoming' ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-50 text-brand-purple'
            }`}>
              {call.type === 'incoming' ? <PhoneIncoming size={18} /> : <PhoneOutgoing size={18} />}
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Live Call Details</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{call.customer}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Caller profile */}
          <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/40 to-white p-4">
            <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-magenta/10 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-xl font-bold text-white shadow-md">
                {initials(call.customer)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-brand-ink">{call.customer}</p>
                <p className="text-sm text-brand-ink/60">{call.mobile}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.chip}`}>
                    {!isMissed ? (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${style.dot} opacity-75`} />
                        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      </span>
                    ) : (
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    )}
                    {style.label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-brand-ink/70 tabular-nums">
                    {liveDuration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Agent"    value={call.agent}    tone="purple" icon={UserCheck} />
            <InfoBox label="Duration" value={liveDuration}  tone="emerald" icon={Clock} />
            <InfoBox
              label="Type"
              value={call.type}
              tone={call.type === 'incoming' ? 'emerald' : 'purple'}
              icon={call.type === 'incoming' ? PhoneIncoming : PhoneOutgoing}
            />
            <InfoBox
              label="Status"
              value={style.label}
              tone={call.status === 'connected' ? 'emerald' : call.status === 'on-hold' ? 'purple' : call.status === 'ringing' ? 'amber' : 'rose'}
              icon={isMissed ? PhoneMissed : Radio}
            />
          </div>

          {/* Live actions — disabled for missed calls */}
          {!isMissed ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${call.mobile}`}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:-translate-y-0.5 hover:brightness-110"
                >
                  <PhoneCall size={15} /> Join Call
                </a>
                <button className="group inline-flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta">
                  <Headphones size={15} /> Listen Live
                </button>
              </div>

              {/* Call controls */}
              <div className="card !p-4">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Call Controls</p>
                <div className="grid grid-cols-4 gap-2">
                  <ControlBtn icon={Volume2}        label="Volume" />
                  <ControlBtn icon={Pause}          label="Hold" />
                  <ControlBtn icon={Mic}            label="Mute" />
                  <ControlBtn icon={PhoneForwarded} label="Transfer" />
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              <p className="flex items-center gap-1.5 font-semibold">
                <PhoneMissed size={12} /> This call was missed
              </p>
              <p className="mt-1">
                Create a follow-up to call {call.customer.split(' ')[0]} back.
              </p>
            </div>
          )}

          {/* Past recordings — deterministic per customer */}
          <div className="card !p-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
                  <Mic size={14} />
                </span>
                <div>
                  <h4 className="font-display text-sm font-bold text-brand-ink">Past Recordings</h4>
                  <p className="text-[10px] text-brand-ink/50">{pastCalls.length} recordings with this caller</p>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-brand-lilac/40">
              {pastCalls.map((rec) => (
                <li key={rec.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    rec.type === 'inbound' ? 'bg-emerald-50 text-emerald-500' : 'bg-violet-50 text-brand-purple'
                  }`}>
                    {rec.type === 'inbound' ? <PhoneIncoming size={14} /> : <PhoneOutgoing size={14} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold capitalize text-brand-ink">{rec.type} call</p>
                    <p className="truncate text-[11px] text-brand-ink/50">{rec.date}</p>
                    <p className="truncate text-[10px] italic text-brand-ink/40">{rec.outcome}</p>
                  </div>
                  <span className="shrink-0 flex items-center gap-1 rounded-full bg-brand-mist px-2 py-0.5 font-mono text-[10px] font-semibold text-brand-ink/60">
                    <Clock size={10} /> {formatDuration(rec.durationSec)}
                  </span>
                  <button
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card transition-transform hover:scale-110"
                    title="Play recording"
                    aria-label="Play recording"
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function InfoBox({ label, value, tone = 'purple', icon: Icon }) {
  const tones = {
    purple:  { fg: 'text-brand-purple',  bg: 'bg-violet-50',  border: 'border-violet-200' },
    emerald: { fg: 'text-emerald-600',   bg: 'bg-emerald-50', border: 'border-emerald-200' },
    amber:   { fg: 'text-amber-600',     bg: 'bg-amber-50',   border: 'border-amber-200' },
    rose:    { fg: 'text-brand-magenta', bg: 'bg-rose-50',    border: 'border-rose-200' },
  };
  const t = tones[tone] || tones.purple;
  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} p-3`}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
        {Icon && <Icon size={12} className={t.fg} />}
      </div>
      <p className={`mt-1 truncate text-sm font-bold capitalize ${t.fg}`}>
        {typeof value === 'string' ? value : String(value ?? '')}
      </p>
    </div>
  );
}

function ControlBtn({ icon: Icon, label }) {
  return (
    <button
      className="group flex flex-col items-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
      title={label}
    >
      <Icon size={16} className="transition-transform group-hover:scale-110" />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}