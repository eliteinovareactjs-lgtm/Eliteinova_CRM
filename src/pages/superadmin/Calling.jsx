// src/pages/superadmin/Calling.jsx
import { useMemo, useState } from 'react';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock,
  Headphones, Play, Filter, Search, X, Building2, User as UserIcon,
  ChevronDown, Calendar, DollarSign, TrendingUp, TrendingDown, Percent,
  Activity, Settings, Wifi, WifiOff, Copy, Check, AlertCircle, Eye,
  MoreVertical, Download, PhoneCall, Timer, Volume2, VolumeX, Mic,
  MicOff, PauseCircle, PlayCircle, PhoneOff, Award, BarChart3,
  ListFilter, Layers, Waves, Server, Route, CircleDot, Repeat,
  Voicemail, FileText, Briefcase, Radio, Signal, Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CALLS, PROJECTS, AGENTS } from '../../data/mockData';

const TABS = [
  { key: 'all', label: 'All Calls', icon: Phone },
  { key: 'inbound', label: 'Inbound', icon: PhoneIncoming },
  { key: 'outbound', label: 'Outbound', icon: PhoneOutgoing },
  { key: 'missed', label: 'Missed', icon: PhoneMissed },
  { key: 'connected', label: 'Connected', icon: Headphones },
];

const DISPOSITIONS = ['Connected', 'Busy', 'No Answer', 'Voicemail', 'Failed', 'Wrong Number'];
const PROVIDERS = ['Twilio', 'Exotel', 'Plivo', 'Knowlarity'];
const COST_PER_MIN = 0.85; // ₹ per minute (mock)

export default function Calling() {
  const { role, activeWebsiteId, activeWebsite } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  /* ========== UI STATE ========== */
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All'); // All | Today | Week | Month
  const [projectOpen, setProjectOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list | grid

  /* ========== MODALS / DRAWERS ========== */
  const [selected, setSelected] = useState(null);
  const [showTelephony, setShowTelephony] = useState(false);
  const [playingRecording, setPlayingRecording] = useState(null);

  /* ========== HELPERS ========== */
  const projectName = (id) => PROJECTS.find((p) => p.id === id)?.name || id;
  const agentName = (id) => AGENTS.find((a) => a.id === id)?.name || id;
  const parseDuration = (d) => {
    if (!d) return 0;
    const [m, s] = String(d).split(':').map(Number);
    return (m || 0) * 60 + (s || 0);
  };
  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  /* ========== SCOPED CALLS ========== */
  const scopedCalls = useMemo(() => {
    let rows = isSuperAdmin
      ? projectFilter === 'All'
        ? CALLS
        : CALLS.filter((c) => c.projectId === projectFilter)
      : CALLS.filter((c) => c.projectId === activeWebsiteId);

    if (tab === 'inbound') rows = rows.filter((c) => c.type === 'inbound');
    if (tab === 'outbound') rows = rows.filter((c) => c.type === 'outbound');
    if (tab === 'missed') rows = rows.filter((c) => c.status === 'missed');
    if (tab === 'connected') rows = rows.filter((c) => c.status === 'connected');

    if (agentFilter !== 'All')
      rows = rows.filter((c) => c.agent === agentFilter);

    if (dateFilter !== 'All') {
      // Mock date filtering — since the data doesn't have real dates,
      // approximate by splitting into thirds
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const cutoff =
        dateFilter === 'Today'
          ? now - day
          : dateFilter === 'Week'
          ? now - 7 * day
          : now - 30 * day;
      rows = rows.filter((c, i) => {
        const fakeTime = now - (i % 30) * day; // mock
        return fakeTime >= cutoff;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((c) => {
        const hay = `${c.customer} ${c.mobile} ${c.agent} ${c.projectId}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return rows;
  }, [
    isSuperAdmin,
    activeWebsiteId,
    projectFilter,
    tab,
    agentFilter,
    dateFilter,
    searchQuery,
  ]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = scopedCalls.length;
    const inbound = scopedCalls.filter((c) => c.type === 'inbound').length;
    const outbound = scopedCalls.filter((c) => c.type === 'outbound').length;
    const missed = scopedCalls.filter((c) => c.status === 'missed').length;
    const connected = scopedCalls.filter((c) => c.status === 'connected').length;
    const failed = scopedCalls.filter((c) => c.status === 'failed').length;

    const totalSec = scopedCalls.reduce(
      (s, c) => s + parseDuration(c.duration),
      0
    );
    const avgDuration = total > 0 ? Math.round(totalSec / total) : 0;
    const connectionRate = total > 0 ? Math.round((connected / total) * 100) : 0;
    const totalCost = (totalSec / 60) * COST_PER_MIN;

    return {
      total,
      inbound,
      outbound,
      missed,
      connected,
      failed,
      avgDuration,
      connectionRate,
      totalCost,
      totalSec,
    };
  }, [scopedCalls]);

  /* ========== DISPOSITION BREAKDOWN ========== */
  const dispositionBreakdown = useMemo(() => {
    const map = {};
    scopedCalls.forEach((c) => {
      const key = c.disposition || c.status || 'Unknown';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [scopedCalls]);

  const hasFilters =
    searchQuery ||
    projectFilter !== 'All' ||
    agentFilter !== 'All' ||
    dateFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setProjectFilter('All');
    setAgentFilter('All');
    setDateFilter('All');
  };

  const handleExport = () => {
    if (scopedCalls.length === 0) return;
    const rows = [
      ['ID', 'Customer', 'Mobile', 'Type', 'Status', 'Disposition', 'Duration', 'Agent', 'Project'],
      ...scopedCalls.map((c) => [
        c.id,
        c.customer,
        c.mobile,
        c.type,
        c.status,
        c.disposition || c.status,
        c.duration,
        c.agent,
        projectName(c.projectId),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calls-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Calling
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            {isSuperAdmin ? (
              <>
                <Headphones size={13} className="text-brand-purple" />
                Central calling across every project.
              </>
            ) : (
              'All calls for this project.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTelephony(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <Settings size={14} /> Telephony
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total Calls"
          value={summary.total}
          sub={`${summary.inbound} in · ${summary.outbound} out`}
          icon={PhoneCall}
          color="purple"
          trend="+8%"
          trendUp
        />
        <AnimatedStatCard
          label="Connected"
          value={summary.connected}
          sub={`${summary.connectionRate}% connection rate`}
          icon={Headphones}
          color="emerald"
          trend="+5%"
          trendUp
        />
        <AnimatedStatCard
          label="Missed"
          value={summary.missed}
          sub="Require follow-up"
          icon={PhoneMissed}
          color="rose"
          trend="-3"
          trendUp={false}
        />
        <AnimatedStatCard
          label="Avg Duration"
          value={formatDuration(summary.avgDuration)}
          sub={`${summary.failed} failed calls`}
          icon={Timer}
          color="amber"
          trend="+12s"
          trendUp
        />
      </div>

      {/* ================= SECONDARY STATS ================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniStatCard
          label="Total Talk Time"
          value={formatDuration(summary.totalSec)}
          icon={Clock}
          color="purple"
        />
        <MiniStatCard
          label="Total Call Cost"
          value={`₹${summary.totalCost.toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
        />
        <MiniStatCard
          label="Cost / Minute"
          value={`₹${COST_PER_MIN.toFixed(2)}`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* ================= TABS ================= */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                active
                  ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple shadow-sm'
                  : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg border p-1.5 ${
              viewMode === 'list'
                ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
            }`}
            title="List view"
          >
            <Layers size={14} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg border p-1.5 ${
              viewMode === 'grid'
                ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
            }`}
            title="Grid view"
          >
            <BarChart3 size={14} />
          </button>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, mobile, agent..."
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

        {isSuperAdmin && (
          <DropdownFilter
            label="Project"
            icon={Building2}
            value={projectFilter === 'All' ? 'All' : projectName(projectFilter)}
            options={['All', ...PROJECTS.map((p) => p.id)]}
            displayOptions={['All Projects', ...PROJECTS.map((p) => p.name)]}
            open={projectOpen}
            onToggle={() => {
              setProjectOpen((s) => !s);
              setAgentOpen(false);
              setDateOpen(false);
            }}
            onChange={(v) => {
              setProjectFilter(v);
              setProjectOpen(false);
            }}
          />
        )}

        <DropdownFilter
          label="Agent"
          icon={UserIcon}
          value={agentFilter}
          options={['All', ...AGENTS.map((a) => a.name)]}
          open={agentOpen}
          onToggle={() => {
            setAgentOpen((s) => !s);
            setProjectOpen(false);
            setDateOpen(false);
          }}
          onChange={(v) => {
            setAgentFilter(v);
            setAgentOpen(false);
          }}
        />

        <DropdownFilter
          label="Date"
          icon={Calendar}
          value={dateFilter}
          options={['All', 'Today', 'Week', 'Month']}
          open={dateOpen}
          onToggle={() => {
            setDateOpen((s) => !s);
            setProjectOpen(false);
            setAgentOpen(false);
          }}
          onChange={(v) => {
            setDateFilter(v);
            setDateOpen(false);
          }}
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ================= DISPOSITION BREAKDOWN ================= */}
      {dispositionBreakdown.length > 0 && (
        <div className="card !p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <ListFilter size={14} className="text-brand-purple" />
            Call Disposition Breakdown
          </h3>
          <div className="flex flex-wrap gap-2">
            {dispositionBreakdown.map(([label, count]) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3 py-2"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold ${
                    label === 'Connected'
                      ? 'bg-emerald-100 text-emerald-600'
                      : label === 'Missed'
                      ? 'bg-rose-100 text-rose-600'
                      : label === 'Failed'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {count}
                </span>
                <span className="text-xs font-semibold text-brand-ink/70">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= CALLS LIST ================= */}
      {scopedCalls.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scopedCalls.map((call) => (
            <CallCard
              key={call.id}
              call={call}
              projectName={projectName}
              agentName={agentName}
              onView={() => setSelected(call)}
              onPlay={() =>
                setPlayingRecording({
                  call,
                  name: `Recording-${call.id}.mp3`,
                })
              }
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {scopedCalls.map((call) => (
            <CallRow
              key={call.id}
              call={call}
              projectName={projectName}
              agentName={agentName}
              isSuperAdmin={isSuperAdmin}
              onView={() => setSelected(call)}
              onPlay={() =>
                setPlayingRecording({
                  call,
                  name: `Recording-${call.id}.mp3`,
                })
              }
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
            />
          ))}
        </div>
      )}

      {/* ================= DRAWERS / MODALS ================= */}
      {selected && (
        <CallDetailsDrawer
          call={selected}
          projectName={projectName}
          agentName={agentName}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setSelected(null)}
          onPlay={() =>
            setPlayingRecording({
              call: selected,
              name: `Recording-${selected.id}.mp3`,
            })
          }
        />
      )}

      {showTelephony && (
        <TelephonyDrawer onClose={() => setShowTelephony(false)} />
      )}

      {playingRecording && (
        <RecordingModal
          call={playingRecording.call}
          name={playingRecording.name}
          onClose={() => setPlayingRecording(null)}
        />
      )}
    </div>
  );
}

/* ================= ANIMATED STAT CARD ================= */
function AnimatedStatCard({ label, value, sub, icon: Icon, color, trend, trendUp }) {
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
  const t = themes[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 ${t.border} ${t.shadow}`}
    >
      <span
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`}
      />
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
          >
            <Icon size={18} />
          </span>
          {trend && (
            <span
              className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                trendUp
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-rose-200 bg-rose-50 text-rose-500'
              }`}
            >
              {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trend}
            </span>
          )}
        </div>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight ${t.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
      </div>
    </div>
  );
}

/* ================= MINI STAT CARD ================= */
function MiniStatCard({ label, value, icon: Icon, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/60">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
          {label}
        </p>
        <p className="font-display text-xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}

/* ================= DROPDOWN FILTER ================= */
function DropdownFilter({
  label,
  icon: Icon,
  value,
  options,
  displayOptions,
  open,
  onToggle,
  onChange,
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-purple" />}
        {label}: <span className="text-brand-purple">{value}</span>
        <ChevronDown size={14} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o, i) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === o
                    ? 'bg-brand-lilac font-semibold text-brand-purple'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
              >
                {displayOptions ? displayOptions[i] : o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= CALL ROW (LIST VIEW) ================= */
function CallRow({
  call,
  projectName,
  agentName,
  isSuperAdmin,
  onView,
  onPlay,
  menuOpenId,
  setMenuOpenId,
}) {
  const isMissed = call.status === 'missed';
  const isConnected = call.status === 'connected';

  return (
    <div
      className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
        isMissed
          ? 'border-rose-200 hover:border-rose-300'
          : 'border-brand-lilac/70 hover:border-brand-purple/40'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isMissed
            ? 'bg-rose-50 text-rose-500'
            : call.type === 'inbound'
            ? 'bg-emerald-50 text-emerald-500'
            : 'bg-violet-50 text-brand-purple'
        }`}
      >
        {isMissed ? (
          <PhoneMissed size={16} />
        ) : call.type === 'inbound' ? (
          <PhoneIncoming size={16} />
        ) : (
          <PhoneOutgoing size={16} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">
          {call.customer}
        </p>
        <p className="truncate text-xs text-brand-ink/50">
          {call.mobile}
        </p>
      </div>

      {isSuperAdmin && (
        <div className="hidden shrink-0 text-xs md:block">
          <p className="flex items-center gap-1 text-brand-ink/40">
            <Building2 size={10} /> Project
          </p>
          <p className="font-semibold text-brand-ink/70">
            {projectName(call.projectId)}
          </p>
        </div>
      )}

      <div className="hidden shrink-0 text-xs md:block">
        <p className="flex items-center gap-1 text-brand-ink/40">
          <UserIcon size={10} /> Agent
        </p>
        <p className="font-semibold text-brand-ink/70">
          {agentName(call.agentId) !== call.agentId
            ? agentName(call.agentId)
            : call.agent}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
          isConnected
            ? 'bg-emerald-100 text-emerald-600'
            : isMissed
            ? 'bg-rose-100 text-rose-600'
            : 'bg-amber-100 text-amber-600'
        }`}
      >
        {call.disposition || call.status}
      </span>

      <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 text-[10px] font-semibold text-brand-ink/60">
        <Clock size={10} /> {call.duration}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple sm:flex"
          title="View details"
        >
          <Eye size={13} />
        </button>

        {isConnected && (
          <button
            onClick={onPlay}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card"
            title="Play recording"
          >
            <Play size={12} fill="currentColor" />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() =>
              setMenuOpenId(menuOpenId === call.id ? null : call.id)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 transition-colors hover:bg-brand-lilac"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === call.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpenId(null)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem
                  icon={Eye}
                  label="View Details"
                  onClick={() => {
                    onView();
                    setMenuOpenId(null);
                  }}
                />
                {isConnected && (
                  <MenuItem
                    icon={Play}
                    label="Play Recording"
                    onClick={() => {
                      onPlay();
                      setMenuOpenId(null);
                    }}
                  />
                )}
                <MenuItem
                  icon={Phone}
                  label="Call Back"
                  onClick={() => {
                    window.location.href = `tel:${call.mobile}`;
                    setMenuOpenId(null);
                  }}
                />
                <MenuItem
                  icon={Copy}
                  label="Copy Number"
                  onClick={() => {
                    navigator.clipboard?.writeText(call.mobile);
                    setMenuOpenId(null);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= CALL CARD (GRID VIEW) ================= */
function CallCard({ call, projectName, agentName, onView, onPlay }) {
  const isMissed = call.status === 'missed';
  const isConnected = call.status === 'connected';

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)] ${
        isMissed
          ? 'border-rose-200 hover:border-rose-300'
          : 'border-brand-lilac/80 hover:border-brand-purple/50'
      }`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${
          isMissed
            ? 'from-rose-500 to-rose-400'
            : 'from-brand-purple to-brand-magenta'
        } transition-transform duration-500 group-hover:scale-x-100`}
      />

      <div className="flex flex-col p-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md ${
              isMissed
                ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white'
                : call.type === 'inbound'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                : 'bg-gradient-to-br from-brand-purple to-brand-magenta text-white'
            }`}
          >
            {isMissed ? (
              <PhoneMissed size={18} />
            ) : call.type === 'inbound' ? (
              <PhoneIncoming size={18} />
            ) : (
              <PhoneOutgoing size={18} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand-ink">
              {call.customer}
            </p>
            <p className="truncate text-xs text-brand-ink/50">{call.mobile}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isConnected
                ? 'bg-emerald-100 text-emerald-600'
                : isMissed
                ? 'bg-rose-100 text-rose-600'
                : 'bg-amber-100 text-amber-600'
            }`}
          >
            {call.disposition || call.status}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-2.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-brand-ink/50">
              <Building2 size={10} /> Project
            </span>
            <span className="truncate font-semibold text-brand-ink">
              {projectName(call.projectId)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-brand-ink/50">
              <UserIcon size={10} /> Agent
            </span>
            <span className="truncate font-semibold text-brand-ink">
              {agentName(call.agentId) !== call.agentId
                ? agentName(call.agentId)
                : call.agent}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-brand-ink/50">
              <Clock size={10} /> Duration
            </span>
            <span className="truncate font-medium text-brand-ink">
              {call.duration}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
          >
            <Eye size={12} /> View
          </button>
          <button
            onClick={onPlay}
            disabled={!isConnected}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
              isConnected
                ? 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card hover:brightness-110'
                : 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
            }`}
          >
            <Play size={12} /> Recording
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MENU ITEM ================= */
function MenuItem({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-ink/70 hover:bg-brand-lilac/40"
    >
      <Icon size={14} /> {label}
    </button>
  );
}

/* ================= EMPTY STATE ================= */
function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <Phone size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No calls match your filters' : 'No calls yet'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-xs font-semibold text-brand-purple hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

/* ================= CALL DETAILS DRAWER ================= */
function CallDetailsDrawer({
  call,
  projectName,
  agentName,
  isSuperAdmin,
  onClose,
  onPlay,
}) {
  const isConnected = call.status === 'connected';
  const isMissed = call.status === 'missed';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                isMissed
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                  : call.type === 'inbound'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
              }`}
            >
              {isMissed ? (
                <PhoneMissed size={20} />
              ) : call.type === 'inbound' ? (
                <PhoneIncoming size={20} />
              ) : (
                <PhoneOutgoing size={20} />
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {call.customer}
              </h3>
              <p className="text-xs text-brand-ink/50">{call.mobile}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox
              label="Type"
              value={call.type.charAt(0).toUpperCase() + call.type.slice(1)}
              color={call.type === 'inbound' ? 'emerald' : 'purple'}
            />
            <InfoBox
              label="Status"
              value={call.status}
              color={
                isConnected ? 'emerald' : isMissed ? 'rose' : 'amber'
              }
            />
            <InfoBox
              label="Duration"
              value={call.duration}
              color="purple"
            />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Call Information
            </h4>
            <Row label="Disposition" value={call.disposition || call.status} />
            <Row label="Direction" value={call.type} />
            {isSuperAdmin && (
              <Row label="Project" value={projectName(call.projectId)} />
            )}
            <Row
              label="Agent"
              value={
                agentName(call.agentId) !== call.agentId
                  ? agentName(call.agentId)
                  : call.agent
              }
            />
            <Row label="Mobile" value={call.mobile} />
          </div>

          {/* Recording */}
          {isConnected && (
            <div className="card !p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
                  <Mic size={14} className="text-brand-purple" />
                  Call Recording
                </h4>
                <span className="text-xs text-brand-ink/50">
                  {call.duration}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
                <button
                  onClick={onPlay}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card"
                >
                  <Play size={14} fill="currentColor" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta" />
                  </div>
                  <p className="mt-1.5 text-[10px] text-brand-ink/50">
                    Recording-{call.id}.mp3
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${call.mobile}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Phone size={16} /> Call Back
            </a>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(call.mobile);
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50"
            >
              <Copy size={16} /> Copy Number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= TELEPHONY DRAWER ================= */
function TelephonyDrawer({ onClose }) {
  const [copiedId, setCopiedId] = useState(null);

  const phoneNumbers = [
    { id: 'PN-001', number: '+91 44 4567 8900', type: 'Inbound', project: 'Matrimony', provider: 'Twilio', status: 'Active' },
    { id: 'PN-002', number: '+91 44 4567 8901', type: 'Outbound', project: 'Property', provider: 'Exotel', status: 'Active' },
    { id: 'PN-003', number: '+91 44 4567 8902', type: 'Both', project: 'Insurance', provider: 'Twilio', status: 'Active' },
    { id: 'PN-004', number: '+91 44 4567 8903', type: 'Inbound', project: 'Matrimony', provider: 'Plivo', status: 'Inactive' },
  ];

  const routingRules = [
    { id: 1, name: 'Business Hours Routing', condition: '9 AM – 6 PM', action: 'Route to available agent' },
    { id: 2, name: 'After-Hours Routing', condition: '6 PM – 9 AM', action: 'Play voicemail message' },
    { id: 3, name: 'Holiday Routing', condition: 'Public holidays', action: 'Forward to manager line' },
    { id: 4, name: 'Overflow Routing', condition: 'No agent available > 30s', action: 'Queue and callback' },
  ];

  const queues = [
    { id: 'Q-01', name: 'Matrimony Sales', waiting: 3, agents: 8, avgWait: '45s' },
    { id: 'Q-02', name: 'Property Support', waiting: 1, agents: 5, avgWait: '22s' },
    { id: 'Q-03', name: 'Insurance General', waiting: 0, agents: 4, avgWait: '0s' },
  ];

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Settings size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Telephony Configuration
              </h3>
              <p className="text-xs text-brand-ink/50">
                Manage phone numbers, routing, queues and providers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Phone Numbers */}
          <div className="card !p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
                <Phone size={14} className="text-brand-purple" />
                Phone Numbers
              </h4>
              <span className="text-xs text-brand-ink/50">
                {phoneNumbers.length} numbers
              </span>
            </div>
            <div className="space-y-2">
              {phoneNumbers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      p.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.type === 'Inbound' ? (
                      <PhoneIncoming size={14} />
                    ) : p.type === 'Outbound' ? (
                      <PhoneOutgoing size={14} />
                    ) : (
                      <Phone size={14} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-semibold text-brand-ink">
                      {p.number}
                    </p>
                    <p className="truncate text-[10px] text-brand-ink/50">
                      {p.project} · {p.provider} · {p.type}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.status}
                  </span>
                  <button
                    onClick={() => handleCopy(p.id, p.number)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/40"
                  >
                    {copiedId === p.id ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Call Routing */}
          <div className="card !p-4 space-y-3">
            <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
              <Route size={14} className="text-brand-purple" />
              Call Routing Rules
            </h4>
            <div className="space-y-2">
              {routingRules.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-brand-purple">
                    <Route size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">
                      {r.name}
                    </p>
                    <p className="truncate text-[10px] text-brand-ink/50">
                      When: {r.condition} → {r.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call Queues */}
          <div className="card !p-4 space-y-3">
            <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
              <Repeat size={14} className="text-brand-purple" />
              Call Queues
            </h4>
            <div className="space-y-2">
              {queues.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Waves size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">
                      {q.name}
                    </p>
                    <p className="truncate text-[10px] text-brand-ink/50">
                      {q.agents} agents · avg wait {q.avgWait}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      q.waiting > 0
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {q.waiting} waiting
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Telephony Providers */}
          <div className="card !p-4 space-y-3">
            <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
              <Server size={14} className="text-brand-purple" />
              Telephony Providers
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-600">
                      <Signal size={12} />
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {p}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <CircleDot size={8} className="fill-emerald-500" />
                    Online
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recording Settings */}
          <div className="card !p-4 space-y-3">
            <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
              <Mic size={14} className="text-brand-purple" />
              Recording Settings
            </h4>
            <div className="space-y-2">
              <ToggleRow label="Auto-record all calls" enabled />
              <ToggleRow label="Record inbound only" enabled={false} />
              <ToggleRow label="Announce recording to caller" enabled />
              <ToggleRow label="Store recordings for 90 days" enabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= TOGGLE ROW ================= */
function ToggleRow({ label, enabled }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-brand-lilac bg-white px-3 py-2.5">
      <span className="text-xs font-semibold text-brand-ink/70">{label}</span>
      <span
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
          enabled ? 'bg-emerald-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
    </div>
  );
}

/* ================= RECORDING MODAL ================= */
function RecordingModal({ call, name, onClose }) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(30);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        <div className="relative bg-gradient-to-br from-brand-purple to-brand-magenta px-6 pb-8 pt-8 text-center text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20"
          >
            <X size={18} />
          </button>

          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <span className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
            <Headphones size={32} />
          </div>

          <p className="text-lg font-semibold">{call.customer}</p>
          <p className="text-xs text-white/70">{name}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            {playing ? 'Now Playing' : 'Paused'}
          </p>
        </div>

        <div className="p-6">
          {/* Progress bar */}
          <div className="mb-2">
            <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-brand-ink/50">
              <span>{formatTime((progress / 100) * 240)}</span>
              <span>{call.duration || '4:00'}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-5 flex items-center justify-center gap-3">
            <button
              onClick={() => setMuted((m) => !m)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                muted
                  ? 'border-brand-purple bg-brand-lilac/50 text-brand-purple'
                  : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
              }`}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card hover:brightness-110"
            >
              {playing ? (
                <PauseCircle size={24} fill="currentColor" />
              ) : (
                <PlayCircle size={24} fill="currentColor" />
              )}
            </button>
            <button
              onClick={() => setProgress(0)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30"
            >
              <PhoneOff size={16} />
            </button>
          </div>

          {/* Meta */}
          <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3 text-xs">
            <Row label="Mobile" value={call.mobile} />
            <Row label="Agent" value={call.agent} />
            <Row label="Duration" value={call.duration} />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ================= INFO HELPERS ================= */
function InfoBox({ label, value, color = 'purple' }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/60 pb-2 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-brand-ink/50">{label}</span>
      <span className="truncate font-medium text-brand-ink">{value}</span>
    </div>
  );
}