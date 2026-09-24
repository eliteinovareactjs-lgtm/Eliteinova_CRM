// src/pages/superadmin/FollowUps.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, Phone, X, Search, Filter,
  Building2, User as UserIcon, ChevronDown, MoreVertical, Eye, Pencil,
  Trash2, PhoneCall, PhoneMissed, PhoneOutgoing, Play, Headphones,
  BarChart3, TrendingUp, TrendingDown, Percent, Target, Award,
  ClipboardList, Timer, Info, Save, Check, AlertCircle, Download,
  RefreshCw, CalendarClock, MessageSquare, Layers, Zap, Star,
  Mic, MicOff, Volume2, VolumeX, PauseCircle, PlayCircle, PhoneOff,
  Repeat, ListFilter, FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  FOLLOW_UPS as INITIAL_FOLLOW_UPS,
  PROJECTS,
  AGENTS,
  LEADS,
} from '../../data/mockData';

const TABS = [
  { key: 'all', label: 'All Follow-Ups', icon: ClipboardList },
  { key: 'Today', label: 'Today', icon: Clock },
  { key: 'Upcoming', label: 'Upcoming', icon: Calendar },
  { key: 'Overdue', label: 'Overdue', icon: AlertTriangle },
  { key: 'Completed', label: 'Completed', icon: CheckCircle2 },
];

const RESCHEDULE_PRESETS = [
  { label: 'In 1 hour', hours: 1 },
  { label: 'In 3 hours', hours: 3 },
  { label: 'Tomorrow', hours: 24 },
  { label: 'In 3 days', hours: 72 },
  { label: 'Next week', hours: 168 },
];

export default function FollowUps() {
  const { role, activeWebsiteId } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  /* ========== LOCAL DATA ========== */
  const [allFollowUps, setAllFollowUps] = useState(
    INITIAL_FOLLOW_UPS.map((f) => ({
      ...f,
      notes: f.notes || '',
      completedAt: f.completedAt || null,
      originalDate: f.date,
    }))
  );

  /* ========== FILTERS ========== */
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [projectOpen, setProjectOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  /* ========== UI STATE ========== */
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list | grid

  /* ========== MODALS ========== */
  const [callingFollowUp, setCallingFollowUp] = useState(null);
  const [rescheduleFor, setRescheduleFor] = useState(null);
  const [viewingReport, setViewingReport] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  /* ========== HELPERS ========== */
  const projectName = (id) =>
    PROJECTS.find((p) => p.id === id)?.name || id;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ========== FILTERED ========== */
  const filtered = useMemo(() => {
    let rows = isSuperAdmin
      ? projectFilter === 'All'
        ? allFollowUps
        : allFollowUps.filter((f) => f.projectId === projectFilter)
      : allFollowUps.filter((f) => f.projectId === activeWebsiteId);

    if (agentFilter !== 'All')
      rows = rows.filter((f) => f.agent === agentFilter);

    if (tab !== 'all') {
      rows = rows.filter((f) => f.status === tab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((f) => {
        const hay = `${f.leadName} ${f.mobile} ${f.agent}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // Sort by status priority then date
    const statusPriority = { Overdue: 0, Today: 1, Upcoming: 2, Completed: 3 };
    return [...rows].sort((a, b) => {
      const p = (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9);
      if (p !== 0) return p;
      return String(a.date).localeCompare(String(b.date));
    });
  }, [
    allFollowUps,
    isSuperAdmin,
    activeWebsiteId,
    projectFilter,
    agentFilter,
    tab,
    searchQuery,
  ]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = allFollowUps.length;
    const today = allFollowUps.filter((f) => f.status === 'Today').length;
    const upcoming = allFollowUps.filter((f) => f.status === 'Upcoming').length;
    const overdue = allFollowUps.filter((f) => f.status === 'Overdue').length;
    const completed = allFollowUps.filter((f) => f.status === 'Completed').length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, today, upcoming, overdue, completed, completionRate };
  }, [allFollowUps]);

  /* ========== ACTIONS ========== */
  const handleCall = (followUp) => {
    setMenuOpenId(null);
    setCallingFollowUp(followUp);
  };

  const handleCallEnd = (followUp, duration, disposition) => {
    setCallingFollowUp(null);
    showToast(
      disposition === 'Connected'
        ? `Call connected · ${duration}`
        : `Call ${disposition.toLowerCase()} · ${duration}`,
      disposition === 'Connected' ? 'success' : 'error'
    );
  };

  const handleComplete = (id) => {
    setAllFollowUps((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: 'Completed',
              completedAt: new Date().toISOString(),
            }
          : f
      )
    );
    setMenuOpenId(null);
    showToast('Follow-up marked as complete');
  };

  const handleReschedule = (followUp) => {
    setMenuOpenId(null);
    setRescheduleFor(followUp);
  };

  const handleSaveReschedule = (followUp, { date, time, hoursFromNow, notes }) => {
    let newDate = date;
    let newTime = time;

    if (hoursFromNow) {
      const target = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
      newDate = target.toISOString().slice(0, 10);
      newTime = target.toTimeString().slice(0, 5);
    }

    setAllFollowUps((prev) =>
      prev.map((f) =>
        f.id === followUp.id
          ? {
              ...f,
              date: newDate,
              time: newTime,
              status: 'Upcoming',
              notes: notes || f.notes,
            }
          : f
      )
    );
    setRescheduleFor(null);
    showToast(`Follow-up rescheduled to ${newDate} at ${newTime}`);
  };

  const handleDelete = (id) => {
    setAllFollowUps((prev) => prev.filter((f) => f.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
    showToast('Follow-up deleted', 'error');
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast('No follow-ups to export', 'error');
      return;
    }
    const rows = [
      ['ID', 'Lead', 'Mobile', 'Project', 'Agent', 'Date', 'Time', 'Status', 'Notes'],
      ...filtered.map((f) => [
        f.id,
        f.leadName,
        f.mobile,
        projectName(f.projectId),
        f.agent,
        f.date,
        f.time,
        f.status,
        f.notes || '',
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `follow-ups-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} follow-ups`);
  };

  const hasFilters =
    searchQuery || projectFilter !== 'All' || agentFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setProjectFilter('All');
    setAgentFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Follow-Ups
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Calendar size={13} className="text-brand-purple" />
            Track and manage customer follow-ups across projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewingReport(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <BarChart3 size={14} /> Report
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
          label="Today"
          value={summary.today}
          sub="Due today"
          icon={Clock}
          color="purple"
          trend="+2"
          trendUp
        />
        <AnimatedStatCard
          label="Upcoming"
          value={summary.upcoming}
          sub="Scheduled ahead"
          icon={Calendar}
          color="emerald"
          trend="+5"
          trendUp
        />
        <AnimatedStatCard
          label="Overdue"
          value={summary.overdue}
          sub="Require attention"
          icon={AlertTriangle}
          color="rose"
          trend="-1"
          trendUp={false}
        />
        <AnimatedStatCard
          label="Completed"
          value={summary.completed}
          sub={`${summary.completionRate}% completion rate`}
          icon={CheckCircle2}
          color="amber"
          trend="+8%"
          trendUp
        />
      </div>

      {/* ================= SECONDARY STATS ================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MiniStatCard
          label="Total Follow-Ups"
          value={summary.total}
          icon={ClipboardList}
          color="purple"
        />
        <MiniStatCard
          label="Completion Rate"
          value={`${summary.completionRate}%`}
          icon={Percent}
          color="emerald"
        />
        <MiniStatCard
          label="Agents Involved"
          value={
            new Set(filtered.map((f) => f.agent).filter(Boolean)).size
          }
          icon={UserIcon}
          color="amber"
        />
        <MiniStatCard
          label="Projects"
          value={
            new Set(filtered.map((f) => f.projectId).filter(Boolean)).size
          }
          icon={Building2}
          color="rose"
        />
      </div>

      {/* ================= TABS ================= */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          const count =
            key === 'all'
              ? allFollowUps.length
              : allFollowUps.filter((f) => f.status === key).length;
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
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  active
                    ? 'bg-brand-purple text-white'
                    : 'bg-brand-lilac text-brand-purple'
                }`}
              >
                {count}
              </span>
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
            <ListFilter size={14} />
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
            <Layers size={14} />
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
            placeholder="Search by lead, mobile, or agent..."
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
          }}
          onChange={(v) => {
            setAgentFilter(v);
            setAgentOpen(false);
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

      {/* ================= FOLLOW-UPS ================= */}
      {filtered.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters || tab !== 'all'}
          onClear={() => {
            clearFilters();
            setTab('all');
          }}
          tab={tab}
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filtered.map((f) => (
            <FollowUpRow
              key={f.id}
              followUp={f}
              projectName={projectName}
              isSuperAdmin={isSuperAdmin}
              onCall={() => handleCall(f)}
              onComplete={() => handleComplete(f.id)}
              onReschedule={() => handleReschedule(f)}
              onDelete={() => {
                setConfirmDelete(f);
                setMenuOpenId(null);
              }}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((f) => (
            <FollowUpCard
              key={f.id}
              followUp={f}
              projectName={projectName}
              isSuperAdmin={isSuperAdmin}
              onCall={() => handleCall(f)}
              onComplete={() => handleComplete(f.id)}
              onReschedule={() => handleReschedule(f)}
              onDelete={() => {
                setConfirmDelete(f);
                setMenuOpenId(null);
              }}
            />
          ))}
        </div>
      )}

      {/* ================= MODALS / DRAWERS ================= */}
      {callingFollowUp && (
        <CallModal
          target={{
            name: callingFollowUp.leadName,
            mobile: callingFollowUp.mobile,
          }}
          onClose={() => setCallingFollowUp(null)}
          onEnd={(duration, disposition) =>
            handleCallEnd(callingFollowUp, duration, disposition)
          }
        />
      )}

      {rescheduleFor && (
        <RescheduleModal
          followUp={rescheduleFor}
          onClose={() => setRescheduleFor(null)}
          onSave={(data) => handleSaveReschedule(rescheduleFor, data)}
        />
      )}

      {viewingReport && (
        <ReportDrawer
          followUps={filtered}
          summary={summary}
          projectName={projectName}
          onClose={() => setViewingReport(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete follow-up?"
          message={`This will permanently delete the follow-up for "${confirmDelete.leadName}". This action cannot be undone.`}
          confirmLabel="Delete Follow-Up"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
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
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} />
          </span>
          {trend && (
            <span className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${trendUp ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-rose-200 bg-rose-50 text-rose-500'}`}>
              {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trend}
            </span>
          )}
        </div>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
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
    <div className={`flex items-center gap-3 rounded-xl border-2 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/60">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
          {label}
        </p>
        <p className="font-display text-xl font-bold tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}

/* ================= DROPDOWN FILTER ================= */
function DropdownFilter({ label, icon: Icon, value, options, displayOptions, open, onToggle, onChange }) {
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
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${value === o ? 'bg-brand-lilac font-semibold text-brand-purple' : 'text-brand-ink/70 hover:bg-brand-lilac/40'}`}
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

/* ================= STATUS BADGE ================= */
function StatusBadge({ status }) {
  const styles = {
    Today: 'bg-violet-100 text-brand-purple',
    Upcoming: 'bg-amber-100 text-amber-600',
    Overdue: 'bg-rose-100 text-rose-600',
    Completed: 'bg-emerald-100 text-emerald-600',
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {status.toUpperCase()}
    </span>
  );
}

/* ================= FOLLOW-UP ROW (LIST VIEW) ================= */
function FollowUpRow({
  followUp: f,
  projectName,
  isSuperAdmin,
  onCall,
  onComplete,
  onReschedule,
  onDelete,
  menuOpenId,
  setMenuOpenId,
}) {
  return (
    <div
      className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
        f.status === 'Overdue'
          ? 'border-rose-200 hover:border-rose-300'
          : f.status === 'Today'
          ? 'border-violet-200 hover:border-violet-300'
          : 'border-brand-lilac/70 hover:border-brand-purple/40'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          f.status === 'Overdue'
            ? 'bg-rose-50 text-rose-500'
            : f.status === 'Completed'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-violet-50 text-brand-purple'
        }`}
      >
        {f.status === 'Overdue' ? (
          <AlertTriangle size={16} />
        ) : f.status === 'Completed' ? (
          <CheckCircle2 size={16} />
        ) : (
          <Calendar size={16} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">
          {f.leadName}
        </p>
        <p className="truncate text-xs text-brand-ink/50">{f.mobile}</p>
      </div>

      {isSuperAdmin && (
        <div className="hidden shrink-0 text-xs md:block">
          <p className="flex items-center gap-1 text-brand-ink/40">
            <Building2 size={10} /> Project
          </p>
          <p className="font-semibold text-brand-ink/70">
            {projectName(f.projectId)}
          </p>
        </div>
      )}

      <div className="hidden shrink-0 text-xs md:block">
        <p className="flex items-center gap-1 text-brand-ink/40">
          <UserIcon size={10} /> Agent
        </p>
        <p className="font-semibold text-brand-ink/70">{f.agent}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="flex items-center gap-1 text-brand-ink/40">
          <Calendar size={10} /> Date
        </p>
        <p className="font-semibold text-brand-ink/70">{f.date}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="flex items-center gap-1 text-brand-ink/40">
          <Clock size={10} /> Time
        </p>
        <p className="font-semibold text-brand-ink/70">{f.time}</p>
      </div>

      <StatusBadge status={f.status} />

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onCall}
          className="hidden h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-[11px] font-semibold text-emerald-600 transition-all hover:bg-emerald-100 sm:flex"
        >
          <Phone size={12} /> Call
        </button>
        <button
          onClick={onComplete}
          disabled={f.status === 'Completed'}
          className={`hidden h-8 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold transition-all sm:flex ${
            f.status === 'Completed'
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-brand-lilac/50 text-brand-purple hover:bg-brand-lilac'
          }`}
        >
          <Check size={12} /> Done
        </button>

        <div className="relative">
          <button
            onClick={() =>
              setMenuOpenId(menuOpenId === f.id ? null : f.id)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 transition-colors hover:bg-brand-lilac"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === f.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={Phone} label="Call Now" onClick={onCall} />
                <MenuItem
                  icon={CheckCircle2}
                  label="Mark Complete"
                  onClick={onComplete}
                />
                <MenuItem
                  icon={CalendarClock}
                  label="Reschedule"
                  onClick={onReschedule}
                />
                <div className="my-1 h-px bg-brand-lilac/60" />
                <MenuItem
                  icon={Trash2}
                  label="Delete"
                  danger
                  onClick={onDelete}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= FOLLOW-UP CARD (GRID VIEW) ================= */
function FollowUpCard({
  followUp: f,
  projectName,
  isSuperAdmin,
  onCall,
  onComplete,
  onReschedule,
  onDelete,
}) {
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)] ${
        f.status === 'Overdue'
          ? 'border-rose-200 hover:border-rose-300'
          : f.status === 'Today'
          ? 'border-violet-200 hover:border-violet-300'
          : 'border-brand-lilac/80 hover:border-brand-purple/50'
      }`}
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-purple to-brand-magenta transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative flex flex-col p-5">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
              f.status === 'Overdue'
                ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                : f.status === 'Completed'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
            }`}
          >
            {f.leadName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-brand-ink">{f.leadName}</p>
            <p className="truncate text-xs text-brand-ink/50">{f.mobile}</p>
          </div>
          <StatusBadge status={f.status} />
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
          {isSuperAdmin && (
            <div className="flex items-center justify-between gap-2 whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-brand-ink/50">
                <Building2 size={11} /> Project
              </span>
              <span className="truncate font-semibold text-brand-ink">
                {projectName(f.projectId)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-brand-ink/50">
              <UserIcon size={11} /> Agent
            </span>
            <span className="truncate font-semibold text-brand-ink">
              {f.agent}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-brand-ink/50">
              <Calendar size={11} /> Date
            </span>
            <span className="truncate font-semibold text-brand-ink">{f.date}</span>
          </div>
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-brand-ink/50">
              <Clock size={11} /> Time
            </span>
            <span className="truncate font-medium text-brand-ink">{f.time}</span>
          </div>
        </div>

        {f.notes && (
          <div className="mt-3 rounded-xl border border-brand-lilac/60 bg-brand-mist/40 p-2.5 text-[11px] text-brand-ink/60">
            <p className="flex items-start gap-1.5">
              <MessageSquare size={11} className="mt-0.5 shrink-0 text-brand-purple" />
              <span className="italic">{f.notes}</span>
            </p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={onCall}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Phone size={12} /> Call
          </button>
          <button
            onClick={onComplete}
            disabled={f.status === 'Completed'}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
              f.status === 'Completed'
                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-brand-lilac/50 text-brand-purple hover:bg-brand-lilac'
            }`}
          >
            <Check size={12} /> Done
          </button>
          <button
            onClick={onReschedule}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
          >
            <CalendarClock size={12} /> Move
          </button>
        </div>

        <button
          onClick={onDelete}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white py-2 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-50"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

/* ================= MENU ITEM ================= */
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

/* ================= EMPTY STATE ================= */
function EmptyState({ hasFilters, onClear, tab }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <Calendar size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters
          ? `No ${tab !== 'all' ? tab.toLowerCase() : ''} follow-ups found`
          : 'No follow-ups yet'}
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

/* ================= WORKING CALL MODAL ================= */
function CallModal({ target, onClose, onEnd }) {
  const [callState, setCallState] = useState('ringing');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [notes, setNotes] = useState('');

  const phone = target.mobile || '';
  const displayName = target.name;

  useEffect(() => {
    if (callState !== 'ringing') return;
    const t = setTimeout(() => setCallState('connected'), 2000);
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
    return `${m}m ${sec.toString().padStart(2, '0')}s`;
  };

  const handleHangUp = (disposition) => {
    onEnd(formatTime(seconds), disposition);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        <div
          className={`relative px-6 pb-8 pt-8 text-center text-white ${
            callState === 'connected'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20"
          >
            <X size={18} />
          </button>

          <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 text-2xl font-bold">
              {displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          </div>

          <p className="text-lg font-semibold">{displayName}</p>
          <p className="text-xs text-white/70">{phone}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            {callState === 'ringing' && 'Ringing…'}
            {callState === 'connected' && `Connected · ${formatTime(seconds)}`}
          </p>
        </div>

        <div className="p-6">
          {callState === 'connected' && (
            <>
              <div className="mb-5 grid grid-cols-3 gap-3">
                <CallControl icon={muted ? MicOff : Mic} label="Mute" active={muted} onClick={() => setMuted((m) => !m)} />
                <CallControl icon={speaker ? Volume2 : VolumeX} label="Speaker" active={speaker} onClick={() => setSpeaker((s) => !s)} />
                <CallControl icon={onHold ? PlayCircle : PauseCircle} label="Hold" active={onHold} onClick={() => setOnHold((h) => !h)} />
              </div>

              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                  Call Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this call..."
                  className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                />
              </div>
            </>
          )}

          {callState === 'ringing' && (
            <p className="mb-5 text-center text-sm text-brand-ink/60">
              Connecting your call to{' '}
              <span className="font-semibold text-brand-ink">{displayName}</span>
              …
            </p>
          )}

          <a
            href={`tel:${phone}`}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <PhoneOutgoing size={14} /> Open in Phone App
          </a>

          <button
            onClick={() => handleHangUp('Connected')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <PhoneOff size={16} /> End Call
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= CALL CONTROL ================= */
function CallControl({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
        active
          ? 'border-brand-purple bg-brand-lilac/50 text-brand-purple'
          : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

/* ================= RESCHEDULE MODAL ================= */
function RescheduleModal({ followUp, onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(followUp.date || today);
  const [time, setTime] = useState(followUp.time || '10:00');
  const [notes, setNotes] = useState(followUp.notes || '');
  const [usePreset, setUsePreset] = useState(null);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!usePreset && !date) {
      setError('Please pick a date or a preset.');
      return;
    }
    setError('');
    onSave({
      date,
      time,
      hoursFromNow: usePreset,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <CalendarClock size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Reschedule Follow-Up
              </h3>
              <p className="text-xs text-brand-ink/50">
                {followUp.leadName} · {followUp.mobile}
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

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {RESCHEDULE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setUsePreset(p.hours)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    usePreset === p.hours
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-[10px] text-brand-ink/40">or pick manually</div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Date
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => {
                  setDate(e.target.value);
                  setUsePreset(null);
                }}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <MessageSquare size={11} /> Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Context for this follow-up..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
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
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <span className="inline-flex items-center gap-1.5">
                <Save size={14} /> Save
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= REPORT DRAWER ================= */
function ReportDrawer({ followUps, summary, projectName, onClose }) {
  /* Group by status */
  const byStatus = useMemo(() => {
    const map = {};
    ['Today', 'Upcoming', 'Overdue', 'Completed'].forEach((s) => {
      map[s] = followUps.filter((f) => f.status === s).length;
    });
    return map;
  }, [followUps]);

  /* Group by project */
  const byProject = useMemo(() => {
    const map = {};
    followUps.forEach((f) => {
      const name = projectName(f.projectId);
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [followUps, projectName]);

  /* Group by agent */
  const byAgent = useMemo(() => {
    const map = {};
    followUps.forEach((f) => {
      map[f.agent] = (map[f.agent] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [followUps]);

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total', summary.total],
      ['Today', summary.today],
      ['Upcoming', summary.upcoming],
      ['Overdue', summary.overdue],
      ['Completed', summary.completed],
      ['Completion Rate', `${summary.completionRate}%`],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `follow-up-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxProjectCount = Math.max(...byProject.map(([, v]) => v), 1);
  const maxAgentCount = Math.max(...byAgent.map(([, v]) => v), 1);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <BarChart3 size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Follow-Up Report
              </h3>
              <p className="text-xs text-brand-ink/50">
                Based on current filters · {followUps.length} items
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
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Total" value={summary.total} color="purple" />
            <InfoBox label="Overdue" value={summary.overdue} color="rose" />
            <InfoBox
              label="Completion"
              value={`${summary.completionRate}%`}
              color="emerald"
            />
          </div>

          {/* By Status */}
          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              By Status
            </h4>
            <div className="space-y-2.5">
              {Object.entries(byStatus).map(([status, count]) => {
                const pct = summary.total > 0 ? (count / summary.total) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-brand-ink/70">
                        {status}
                      </span>
                      <span className="font-bold tabular-nums text-brand-ink">
                        {count} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                      <div
                        className={`h-full rounded-full ${
                          status === 'Overdue'
                            ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                            : status === 'Today'
                            ? 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                            : status === 'Upcoming'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Project */}
          {byProject.length > 0 && (
            <div className="card !p-4 space-y-3">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                By Project
              </h4>
              <div className="space-y-2.5">
                {byProject.map(([name, count]) => {
                  const pct = (count / maxProjectCount) * 100;
                  return (
                    <div key={name}>
                      <div className="mb-1 flex items-center justify-between text-[10px]">
                        <span className="truncate font-semibold text-brand-ink/70">
                          {name}
                        </span>
                        <span className="font-bold tabular-nums text-brand-ink">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* By Agent */}
          {byAgent.length > 0 && (
            <div className="card !p-4 space-y-3">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                By Agent
              </h4>
              <div className="space-y-2.5">
                {byAgent.map(([name, count]) => {
                  const pct = (count / maxAgentCount) * 100;
                  return (
                    <div key={name}>
                      <div className="mb-1 flex items-center justify-between text-[10px]">
                        <span className="truncate font-semibold text-brand-ink/70">
                          {name}
                        </span>
                        <span className="font-bold tabular-nums text-brand-ink">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <button
              onClick={handleExport}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Download size={14} /> Export Report (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= CONFIRM DIALOG ================= */
function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
            <AlertCircle size={18} />
          </div>
          <h3 className="font-display text-base font-semibold text-brand-ink">
            {title}
          </h3>
        </div>
        <p className="mb-5 text-sm text-brand-ink/60">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= TOAST ================= */
function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
          type === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-600'
            : 'border-emerald-200 bg-emerald-50 text-emerald-600'
        }`}
      >
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
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
      <p className="mt-1 truncate text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}