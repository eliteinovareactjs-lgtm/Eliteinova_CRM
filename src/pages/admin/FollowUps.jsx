// src/pages/admin/FollowUps.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, Phone, X, Search,
  Filter, Building2, User as UserIcon, ChevronDown, MoreVertical,
  Eye, Pencil, Trash2, PhoneCall, PhoneMissed, PhoneOutgoing, Play,
  Headphones, BarChart3, TrendingUp, TrendingDown, Percent, Target,
  ClipboardList, Timer, Info, Save, Check, AlertCircle, Download,
  RefreshCw, CalendarClock, MessageSquare, Layers, Mic, MicOff,
  Volume2, VolumeX, PauseCircle, PlayCircle, PhoneOff, Repeat,
  ListFilter, ChevronLeft, ChevronRight, Grid3x3, XCircle, Bell,
  BellRing, UserPlus, UserCheck, Send, RotateCcw, UserX, Hash,
  Mail, MessageCircle, Clipboard, Sparkles, Zap, Plus, CalendarDays,
  ArrowRight, X as XIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  FOLLOW_UPS as INITIAL_FOLLOW_UPS,
  AGENTS,
  LEADS,
} from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'all',       label: 'All',       icon: ClipboardList },
  { key: 'Today',     label: 'Today',     icon: Clock },
  { key: 'Upcoming',  label: 'Upcoming',  icon: Calendar },
  { key: 'Overdue',   label: 'Overdue',   icon: AlertTriangle },
  { key: 'Completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'Missed',    label: 'Missed',    icon: XCircle },
  { key: 'Cancelled', label: 'Cancelled', icon: UserX },
];

const STATUS_STYLES = {
  Today:     { chip: 'bg-violet-100 text-brand-purple border-violet-200',  dot: 'bg-violet-500',    from: 'from-violet-500',  icon: Clock },
  Upcoming:  { chip: 'bg-amber-100 text-amber-700 border-amber-200',        dot: 'bg-amber-500',     from: 'from-amber-500',   icon: Calendar },
  Overdue:   { chip: 'bg-rose-100 text-brand-magenta border-rose-200',      dot: 'bg-brand-magenta', from: 'from-brand-magenta', icon: AlertTriangle },
  Completed: { chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',  dot: 'bg-emerald-500',   from: 'from-emerald-500', icon: CheckCircle2 },
  Missed:    { chip: 'bg-rose-100 text-rose-600 border-rose-200',           dot: 'bg-rose-500',      from: 'from-rose-500',    icon: XCircle },
  Cancelled: { chip: 'bg-slate-100 text-slate-600 border-slate-200',        dot: 'bg-slate-400',     from: 'from-slate-400',   icon: UserX },
};

const RESCHEDULE_PRESETS = [
  { label: 'In 1 hour',  hours: 1 },
  { label: 'In 3 hours', hours: 3 },
  { label: 'Tomorrow',   hours: 24 },
  { label: 'In 3 days',  hours: 72 },
  { label: 'Next week',  hours: 168 },
];

const REMINDER_PRESETS = [
  { label: '15 min before', minutes: 15 },
  { label: '30 min before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
  { label: '1 day before',  minutes: 1440 },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STORAGE_PREFIX = 'followUps:';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const prettyDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

/* ✅ FIXED: now returns 'Missed' for past dates that were never completed/cancelled */
const computeStatus = (followUp) => {
  if (!followUp) return 'Upcoming';
  if (followUp.status === 'Completed') return 'Completed';
  if (followUp.status === 'Cancelled') return 'Cancelled';
  if (followUp.status === 'Missed')    return 'Missed';
  const today = todayKey();
  if (followUp.date < today) return 'Overdue';
  if (followUp.date === today) return 'Today';
  return 'Upcoming';
};

/* Normalize a follow-up from storage / mock data */
const buildFullFollowUp = (f) => ({
  notes: '',
  completedAt: null,
  cancelledAt: null,
  reminders: [],
  ...f,
});

const initials = (name) =>
  (name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function FollowUps() {
  const { activeWebsiteId, activeWebsite } = useAuth();

  const [allFollowUps, setAllFollowUps] = useState(() =>
    loadState(
      `list:${activeWebsiteId}`,
      INITIAL_FOLLOW_UPS
        .filter((f) => f.projectId === activeWebsiteId)
        .map((f) => buildFullFollowUp(f))
    )
  );

  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('All');
  const [agentOpen, setAgentOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [toast, setToast] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [callingFollowUp, setCallingFollowUp] = useState(null);
  const [rescheduleFor, setRescheduleFor] = useState(null);
  const [notesFor, setNotesFor] = useState(null);
  const [reminderFor, setReminderFor] = useState(null);
  const [assignFor, setAssignFor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [scheduleNew, setScheduleNew] = useState(false);

  useEffect(() => {
    setAllFollowUps(
      loadState(
        `list:${activeWebsiteId}`,
        INITIAL_FOLLOW_UPS
          .filter((f) => f.projectId === activeWebsiteId)
          .map((f) => buildFullFollowUp(f))
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebsiteId]);

  useEffect(() => {
    saveState(`list:${activeWebsiteId}`, allFollowUps);
  }, [allFollowUps, activeWebsiteId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* ✅ FIXED: memoize status per follow-up for O(n) instead of O(n²) */
  const withStatus = useMemo(
    () => allFollowUps.map((f) => ({ ...f, __status: computeStatus(f) })),
    [allFollowUps]
  );

  const filtered = useMemo(() => {
    let rows = [...withStatus];
    if (agentFilter !== 'All') rows = rows.filter((f) => f.agent === agentFilter);
    if (tab !== 'all') rows = rows.filter((f) => f.__status === tab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((f) =>
        `${f.leadName} ${f.mobile} ${f.agent}`.toLowerCase().includes(q)
      );
    }
    const priority = { Overdue: 0, Today: 1, Upcoming: 2, Missed: 3, Completed: 4, Cancelled: 5 };
    return rows.sort((a, b) => {
      const p = (priority[a.__status] ?? 9) - (priority[b.__status] ?? 9);
      if (p !== 0) return p;
      return String(a.date).localeCompare(String(b.date));
    });
  }, [withStatus, tab, searchQuery, agentFilter]);

  /* Follow-ups for the selected calendar date */
  const selectedDateFollowUps = useMemo(() => {
    if (!selectedDate) return [];
    return withStatus
      .filter((f) => f.date === selectedDate)
      .sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }, [withStatus, selectedDate]);

  /* ✅ FIXED: counts derive from `withStatus` so all 7 tabs work */
  const summary = useMemo(() => {
    const total = withStatus.length;
    const today = withStatus.filter((f) => f.__status === 'Today').length;
    const upcoming = withStatus.filter((f) => f.__status === 'Upcoming').length;
    const overdue = withStatus.filter((f) => f.__status === 'Overdue').length;
    const completed = withStatus.filter((f) => f.__status === 'Completed').length;
    const missed = withStatus.filter((f) => f.__status === 'Missed').length;
    const cancelled = withStatus.filter((f) => f.__status === 'Cancelled').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    /* ✅ FIXED: reminders only counted on active (non-completed, non-cancelled) follow-ups */
    const remindersActive = withStatus
      .filter((f) => f.__status !== 'Completed' && f.__status !== 'Cancelled')
      .reduce((s, f) => s + (f.reminders?.length || 0), 0);

    return {
      total, today, upcoming, overdue, completed, missed, cancelled,
      completionRate, remindersActive,
    };
  }, [withStatus]);

  /* Actions */
  const handleCall = (f) => {
    setMenuOpenId(null);
    setCallingFollowUp(f);
  };

  /* ✅ FIXED: call notes + disposition are now persisted */
  const handleCallEnd = (f, duration, disposition, callNotes) => {
    if (callNotes && callNotes.trim()) {
      setAllFollowUps((prev) =>
        prev.map((x) =>
          x.id === f.id
            ? {
                ...x,
                notes: x.notes
                  ? `${x.notes}\n\n[Call ${new Date().toLocaleDateString('en-IN')}] ${callNotes.trim()}`
                  : `[Call ${new Date().toLocaleDateString('en-IN')}] ${callNotes.trim()}`,
              }
            : x
        )
      );
    }
    /* If disposition indicates connected, mark completed */
    if (disposition === 'Connected' && duration) {
      setAllFollowUps((prev) =>
        prev.map((x) =>
          x.id === f.id
            ? { ...x, status: 'Completed', completedAt: new Date().toISOString() }
            : x
        )
      );
      showToast(`Call connected · ${duration} · marked complete`);
    } else if (disposition === 'Missed') {
      setAllFollowUps((prev) =>
        prev.map((x) => (x.id === f.id ? { ...x, status: 'Missed' } : x))
      );
      showToast(`Call missed · ${duration}`, 'error');
    } else {
      showToast(`Call ${disposition.toLowerCase()} · ${duration}`, 'error');
    }
    setCallingFollowUp(null);
  };

  const handleComplete = (id) => {
    setAllFollowUps((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: 'Completed', completedAt: new Date().toISOString() }
          : f
      )
    );
    setMenuOpenId(null);
    showToast('Follow-up marked complete');
  };

  const handleCancel = (id) => {
    setAllFollowUps((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: 'Cancelled', cancelledAt: new Date().toISOString() }
          : f
      )
    );
    setConfirmCancel(null);
    setMenuOpenId(null);
    showToast('Follow-up cancelled');
  };

  /* ✅ FIXED: also clears completedAt/cancelledAt when rescheduling */
  const handleSaveReschedule = (f, { date, time, hoursFromNow, notes }) => {
    let newDate = date;
    let newTime = time;
    if (hoursFromNow) {
      const target = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
      newDate = target.toISOString().slice(0, 10);
      newTime = target.toTimeString().slice(0, 5);
    }
    setAllFollowUps((prev) =>
      prev.map((x) =>
        x.id === f.id
          ? {
              ...x,
              date: newDate,
              time: newTime,
              status: computeStatus({ ...x, date: newDate, status: undefined }),
              notes: notes || x.notes,
              completedAt: null,
              cancelledAt: null,
            }
          : x
      )
    );
    setRescheduleFor(null);
    showToast(`Rescheduled to ${newDate} at ${newTime}`);
  };

  /* ✅ FIXED: explicit "reactivate" that reopens a cancelled follow-up */
  const handleReactivate = (f) => {
    setAllFollowUps((prev) =>
      prev.map((x) =>
        x.id === f.id
          ? {
              ...x,
              status: computeStatus({ ...x, status: undefined }),
              cancelledAt: null,
            }
          : x
      )
    );
    showToast('Follow-up reactivated');
  };

  const handleSaveNotes = (f, notes) => {
    setAllFollowUps((prev) => prev.map((x) => (x.id === f.id ? { ...x, notes } : x)));
    setNotesFor(null);
    showToast('Notes saved');
  };

  const handleSaveReminder = (f, reminder) => {
    setAllFollowUps((prev) =>
      prev.map((x) =>
        x.id === f.id
          ? { ...x, reminders: [...(x.reminders || []), { id: uid('rem'), ...reminder }] }
          : x
      )
    );
    setReminderFor(null);
    showToast('Reminder created');
  };

  const handleDeleteReminder = (followUpId, reminderId) => {
    setAllFollowUps((prev) =>
      prev.map((x) =>
        x.id === followUpId
          ? { ...x, reminders: (x.reminders || []).filter((r) => r.id !== reminderId) }
          : x
      )
    );
    showToast('Reminder deleted', 'error');
  };

  const handleAssign = (f, agentName) => {
    setAllFollowUps((prev) => prev.map((x) => (x.id === f.id ? { ...x, agent: agentName } : x)));
    setAssignFor(null);
    showToast(`Assigned to ${agentName}`);
  };

  const handleDelete = (id) => {
    setAllFollowUps((prev) => prev.filter((f) => f.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
    showToast('Follow-up deleted', 'error');
  };

  const handleAddNew = (data) => {
    const newFollowUp = {
      id: uid('fu'),
      projectId: activeWebsiteId,
      ...data,
      status: computeStatus(data),
      completedAt: null,
      cancelledAt: null,
      reminders: [],
      notes: data.notes || '',
    };
    setAllFollowUps((prev) => [newFollowUp, ...prev]);
    setScheduleNew(false);
    showToast(`Follow-up scheduled for ${data.leadName}`);
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast('No follow-ups to export', 'error');
      return;
    }
    const rows = [
      ['ID', 'Lead', 'Mobile', 'Agent', 'Date', 'Time', 'Status', 'Reminders', 'Notes'],
      ...filtered.map((f) => [
        f.id, f.leadName, f.mobile, f.agent, f.date, f.time,
        f.__status, (f.reminders || []).length, f.notes || '',
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `follow-ups-${activeWebsite?.name || 'website'}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} follow-ups`);
  };

  const hasFilters = searchQuery || agentFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setAgentFilter('All');
  };

  /* ✅ FIXED: includes Missed count */
  const tabCounts = {
    all: summary.total,
    Today: summary.today,
    Upcoming: summary.upcoming,
    Overdue: summary.overdue,
    Completed: summary.completed,
    Missed: summary.missed,
    Cancelled: summary.cancelled,
  };

  /* ✅ FIXED: unique agent names for filter dropdown */
  const agentNames = useMemo(() => {
    const set = new Set();
    agents.forEach((a) => set.add(a.name));
    allFollowUps.forEach((f) => { if (f.agent) set.add(f.agent); });
    return ['All', ...Array.from(set)];
  }, [agents, allFollowUps]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Follow-Ups</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Calendar size={13} className="text-brand-magenta" />
              Track follow-ups for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setScheduleNew(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <Plus size={14} className="transition-transform group-hover:rotate-90" /> Schedule Follow-Up
            </button>

            <button
              onClick={handleExport}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md"
            >
              <Download size={14} className="transition-transform group-hover:translate-y-0.5" /> Export
            </button>

            <div className="flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]'
                    : 'text-brand-ink/50 hover:text-brand-magenta'
                }`}
              >
                <ListFilter size={12} /> List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]'
                    : 'text-brand-ink/50 hover:text-brand-magenta'
                }`}
              >
                <Calendar size={12} /> Calendar
              </button>
            </div>
          </div>
        </div>

        {/* ═══ KPI STRIP ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Follow-Up Analytics</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <KpiCard icon={ClipboardList} label="Total"     value={summary.total}          sub="All follow-ups"      color="purple"  active={tab === 'all'}       onClick={() => setTab('all')}       delay={0} />
            <KpiCard icon={Clock}         label="Today"     value={summary.today}          sub="Due today"           color="purple"  active={tab === 'Today'}     onClick={() => setTab('Today')}     delay={40} />
            <KpiCard icon={Calendar}      label="Upcoming"  value={summary.upcoming}       sub="Scheduled ahead"     color="amber"   active={tab === 'Upcoming'}  onClick={() => setTab('Upcoming')}  delay={80} />
            <KpiCard icon={AlertTriangle} label="Overdue"   value={summary.overdue}        sub="Needs attention"     color="rose"    active={tab === 'Overdue'}   onClick={() => setTab('Overdue')}   delay={120} />
            <KpiCard icon={CheckCircle2}  label="Completed" value={summary.completed}      sub={`${summary.completionRate}% rate`} color="emerald" active={tab === 'Completed'} onClick={() => setTab('Completed')} delay={160} />
            <KpiCard icon={XCircle}       label="Missed"    value={summary.missed}         sub="Didn't happen"       color="rose"    active={tab === 'Missed'}    onClick={() => setTab('Missed')}    delay={200} />
            <KpiCard icon={Bell}          label="Reminders" value={summary.remindersActive} sub="On active follow-ups" color="purple" active={false}               onClick={() => {}}                 delay={240} />
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        {viewMode === 'list' && (
          <div className="card !p-2">
            <div className="flex flex-wrap items-center gap-1">
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                const count = tabCounts[key] || 0;
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
        )}

        {/* ═══ FILTER BAR ═══ */}
        {viewMode === 'list' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by lead, mobile, or agent…"
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

            <div className="relative">
              <button
                onClick={() => setAgentOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
              >
                <UserIcon size={14} className="text-brand-magenta" />
                Agent: <span className="font-semibold text-brand-magenta">{agentFilter}</span>
                <ChevronDown size={14} className={`text-brand-ink/40 transition-transform ${agentOpen ? 'rotate-180' : ''}`} />
              </button>
              {agentOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAgentOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                    {agentNames.map((o) => (
                      <button
                        key={o}
                        onClick={() => { setAgentFilter(o); setAgentOpen(false); }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${agentFilter === o ? 'bg-brand-magenta/10 font-semibold text-brand-magenta' : 'text-brand-ink/70 hover:bg-brand-lilac/40'}`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}

        {/* ═══ CONTENT ═══ */}
        {viewMode === 'calendar' ? (
          <CalendarView
            followUps={withStatus}
            month={calendarMonth}
            year={calendarYear}
            setMonth={setCalendarMonth}
            setYear={setCalendarYear}
            onDayClick={(dateKey) => setSelectedDate(dateKey)}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters || tab !== 'all'}
            onClear={() => { clearFilters(); setTab('all'); }}
            tab={tab}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((f) => (
              <FollowUpRow
                key={f.id}
                followUp={f}
                status={f.__status}
                onCall={() => handleCall(f)}
                onComplete={() => handleComplete(f.id)}
                onCancel={() => setConfirmCancel(f)}
                onReschedule={() => setRescheduleFor(f)}
                onReactivate={() => handleReactivate(f)}
                onNotes={() => setNotesFor(f)}
                onReminder={() => setReminderFor(f)}
                onAssign={() => setAssignFor(f)}
                onDelete={() => { setConfirmDelete(f); setMenuOpenId(null); }}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
              />
            ))}
          </div>
        )}

        {/* ═══ DAY DETAIL DRAWER ═══ */}
        {selectedDate && (
          <DayDetailDrawer
            date={selectedDate}
            followUps={selectedDateFollowUps}
            onClose={() => setSelectedDate(null)}
            onCall={handleCall}
            onComplete={handleComplete}
            onCancel={(f) => setConfirmCancel(f)}
            onReschedule={(f) => setRescheduleFor(f)}
            onReactivate={handleReactivate}
            onNotes={(f) => setNotesFor(f)}
            onReminder={(f) => setReminderFor(f)}
            onAssign={(f) => setAssignFor(f)}
            onDelete={(f) => { setConfirmDelete(f); setMenuOpenId(null); }}
            onCreateNew={() => { setScheduleNew(true); }}
          />
        )}

        {/* ═══ MODALS ═══ */}
        {callingFollowUp && (
          <CallModal
            target={{ name: callingFollowUp.leadName, mobile: callingFollowUp.mobile }}
            onClose={() => setCallingFollowUp(null)}
            onEnd={(d, disp, notes) => handleCallEnd(callingFollowUp, d, disp, notes)}
          />
        )}

        {rescheduleFor && (
          <RescheduleModal
            followUp={rescheduleFor}
            onClose={() => setRescheduleFor(null)}
            onSave={(data) => handleSaveReschedule(rescheduleFor, data)}
          />
        )}

        {notesFor && (
          <NotesModal
            followUp={notesFor}
            onClose={() => setNotesFor(null)}
            onSave={(notes) => handleSaveNotes(notesFor, notes)}
            onDeleteReminder={(rid) => handleDeleteReminder(notesFor.id, rid)}
          />
        )}

        {reminderFor && (
          <ReminderModal
            followUp={reminderFor}
            onClose={() => setReminderFor(null)}
            onSave={(reminder) => handleSaveReminder(reminderFor, reminder)}
          />
        )}

        {assignFor && (
          <AssignModal
            followUp={assignFor}
            agents={agents}
            onClose={() => setAssignFor(null)}
            onSave={(agentName) => handleAssign(assignFor, agentName)}
          />
        )}

        {scheduleNew && (
          <ScheduleNewModal
            agents={agents}
            onClose={() => setScheduleNew(false)}
            onSave={handleAddNew}
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

        {confirmCancel && (
          <ConfirmDialog
            title="Cancel follow-up?"
            message={`This will mark the follow-up for "${confirmCancel.leadName}" as cancelled. It will not be actioned.`}
            confirmLabel="Cancel Follow-Up"
            confirmTone="amber"
            onCancel={() => setConfirmCancel(null)}
            onConfirm={() => handleCancel(confirmCancel.id)}
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
  const displayValue = useAnimatedCount(value);
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
        <p className={`font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>{displayValue}</p>
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
   FOLLOW-UP ROW
   ═══════════════════════════════════════════════════════════════ */
function FollowUpRow({
  followUp: f, status, onCall, onComplete, onCancel, onReschedule, onReactivate, onNotes, onReminder, onAssign, onDelete,
  menuOpenId, setMenuOpenId,
}) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Upcoming;
  const StatusIcon = style.icon;
  const isCompleted = status === 'Completed';
  const isCancelled = status === 'Cancelled';
  const isOverdue = status === 'Overdue';
  const isToday = status === 'Today';
  const isMissed = status === 'Missed';

  return (
    <div className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
      isOverdue || isMissed ? 'border-rose-200 hover:border-rose-300'
      : isToday ? 'border-violet-200 hover:border-violet-300'
      : isCompleted ? 'border-emerald-200 hover:border-emerald-300'
      : isCancelled ? 'border-slate-200 hover:border-slate-300'
      : 'border-brand-lilac/70 hover:border-brand-magenta/40'
    }`}>
      {/* ✅ FIXED: uses explicit `from` class instead of string replace */}
      <span className={`absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b ${style.from} to-transparent transition-transform duration-300 group-hover:scale-y-100`} />

      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.chip}`}>
        <StatusIcon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">{f.leadName}</p>
        <p className="truncate text-[11px] text-brand-ink/50">{f.mobile}</p>
        {f.notes && <p className="mt-0.5 truncate text-[10px] italic text-brand-ink/40">"{f.notes}"</p>}
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Agent</p>
        <p className="truncate font-semibold text-brand-ink/70">{f.agent}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Date</p>
        <p className="font-semibold text-brand-ink/70 tabular-nums">{f.date}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Time</p>
        <p className="font-semibold text-brand-ink/70 tabular-nums">{f.time}</p>
      </div>

      {f.reminders && f.reminders.length > 0 && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-200">
          <Bell size={10} /> {f.reminders.length}
        </span>
      )}

      <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.chip}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        {status}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        {!isCompleted && !isCancelled && (
          <>
            <button
              onClick={onCall}
              className="hidden h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-600 transition-all hover:bg-emerald-100 sm:flex"
              title="Call now"
            >
              <Phone size={11} /> Call
            </button>
            <button
              onClick={onComplete}
              className="hidden h-8 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-[11px] font-semibold text-brand-purple transition-all hover:bg-violet-100 sm:flex"
              title="Mark complete"
            >
              <Check size={11} /> Done
            </button>
          </>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpenId(menuOpenId === f.id ? null : f.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 transition-colors hover:bg-brand-lilac"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === f.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                {!isCompleted && !isCancelled && (
                  <>
                    <MenuItem icon={Phone}         label="Call Now"        onClick={onCall} />
                    <MenuItem icon={CheckCircle2}  label="Mark Complete"   onClick={onComplete} />
                    <MenuItem icon={CalendarClock} label="Reschedule"      onClick={onReschedule} />
                    <MenuItem icon={UserCheck}     label="Assign to Agent" onClick={onAssign} />
                    <MenuItem icon={BellRing}      label="Create Reminder" onClick={onReminder} />
                    <MenuItem icon={MessageSquare} label="Add Notes"       onClick={onNotes} />
                    <div className="my-1 h-px bg-brand-lilac/60" />
                    <MenuItem icon={UserX}         label="Cancel"          onClick={onCancel} />
                    <div className="my-1 h-px bg-brand-lilac/60" />
                  </>
                )}
                {(isCompleted || isMissed) && (
                  <>
                    <MenuItem icon={CalendarClock} label="Schedule Again" onClick={onReschedule} />
                    <MenuItem icon={MessageSquare} label="Add Notes"      onClick={onNotes} />
                    <div className="my-1 h-px bg-brand-lilac/60" />
                  </>
                )}
                {isCancelled && (
                  <>
                    <MenuItem icon={RotateCcw}     label="Reactivate"   onClick={onReactivate} />
                    <MenuItem icon={MessageSquare} label="Add Notes"    onClick={onNotes} />
                    <div className="my-1 h-px bg-brand-lilac/60" />
                  </>
                )}
                <MenuItem icon={Trash2} label="Delete" danger onClick={onDelete} />
              </div>
            </>
          )}
        </div>
      </div>
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

/* ═══════════════════════════════════════════════════════════════
   CALENDAR VIEW
   ═══════════════════════════════════════════════════════════════ */
function CalendarView({ followUps, month, year, setMonth, setYear, onDayClick }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  /* ✅ FIXED: excludes cancelled follow-ups from calendar cells */
  const followUpsByDate = useMemo(() => {
    const map = {};
    followUps
      .filter((f) => f.__status !== 'Cancelled')
      .forEach((f) => {
        if (!map[f.date]) map[f.date] = [];
        map[f.date].push(f);
      });
    return map;
  }, [followUps]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = todayKey();

  return (
    <div className="card !p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
            <CalendarDays size={16} />
          </span>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Follow-Up Calendar</p>
            <h3 className="font-display text-base font-bold text-brand-ink">
              {MONTH_NAMES[month]} {year}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-lilac hover:bg-brand-lilac/40">
            <ChevronLeft size={16} className="text-brand-ink/60" />
          </button>
          <button
            onClick={() => { setMonth(new Date().getMonth()); setYear(new Date().getFullYear()); }}
            className="rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Today
          </button>
          <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-lilac hover:bg-brand-lilac/40">
            <ChevronRight size={16} className="text-brand-ink/60" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="py-2 text-center font-mono text-[10px] font-bold uppercase tracking-wide text-brand-ink/40">
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const items = followUpsByDate[dateKey] || [];
          const isTodayCell = dateKey === today;
          const hasItems = items.length > 0;

          return (
            <button
              key={i}
              onClick={() => onDayClick(dateKey)}
              className={`group relative flex min-h-[92px] flex-col rounded-xl border p-1.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isTodayCell
                  ? 'border-brand-magenta bg-brand-magenta/5 hover:border-brand-magenta'
                  : hasItems
                  ? 'border-brand-lilac bg-white hover:border-brand-magenta/40'
                  : 'border-brand-lilac/40 bg-white hover:border-brand-magenta/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`font-mono text-xs font-bold tabular-nums ${
                  isTodayCell ? 'text-brand-magenta' : 'text-brand-ink/60'
                }`}>
                  {day}
                </p>
                {hasItems && (
                  <span className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                    isTodayCell
                      ? 'bg-brand-magenta text-white'
                      : 'bg-brand-lilac/70 text-brand-purple'
                  }`}>
                    {items.length}
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex-1 space-y-1">
                {items.slice(0, 2).map((f) => {
                  const s = STATUS_STYLES[f.__status] || STATUS_STYLES.Upcoming;
                  return (
                    <span
                      key={f.id}
                      className={`block w-full truncate rounded-md border px-1.5 py-0.5 text-left text-[9px] font-semibold ${s.chip}`}
                    >
                      {f.leadName}
                    </span>
                  );
                })}
                {items.length > 2 && (
                  <p className="font-mono text-[9px] font-semibold text-brand-ink/40">
                    +{items.length - 2} more
                  </p>
                )}
              </div>

              <span className="pointer-events-none absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRight size={11} className="text-brand-magenta" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-brand-lilac/60 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Legend:</p>
        {Object.entries(STATUS_STYLES).map(([status, style]) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${style.dot}`} />
            <span className="text-[11px] font-semibold text-brand-ink/70">{status}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DAY DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════ */
function DayDetailDrawer({ date, followUps, onClose, onCall, onComplete, onCancel, onReschedule, onReactivate, onNotes, onReminder, onAssign, onDelete, onCreateNew }) {
  const [menuOpenId, setMenuOpenId] = useState(null);

  const summary = useMemo(() => {
    return {
      total: followUps.length,
      today: followUps.filter((f) => f.__status === 'Today').length,
      upcoming: followUps.filter((f) => f.__status === 'Upcoming').length,
      overdue: followUps.filter((f) => f.__status === 'Overdue').length,
      completed: followUps.filter((f) => f.__status === 'Completed').length,
      missed: followUps.filter((f) => f.__status === 'Missed').length,
      cancelled: followUps.filter((f) => f.__status === 'Cancelled').length,
    };
  }, [followUps]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
              <CalendarDays size={18} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Follow-Ups on</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{prettyDate(date)}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            <DayStat label="Total"     value={summary.total}     tone="purple" />
            <DayStat label="Today"     value={summary.today}     tone="violet" />
            <DayStat label="Upcoming"  value={summary.upcoming}  tone="amber" />
            <DayStat label="Overdue"   value={summary.overdue}   tone="rose" />
            <DayStat label="Completed" value={summary.completed} tone="emerald" />
            <DayStat label="Missed"    value={summary.missed}    tone="rose" />
          </div>

          {/* Actions bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-brand-ink/60">
              <strong className="text-brand-ink">{followUps.length}</strong> follow-up{followUps.length !== 1 ? 's' : ''} scheduled for this day
            </p>
            <button
              onClick={() => { onClose(); onCreateNew(); }}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:-translate-y-0.5 hover:brightness-110"
            >
              <Plus size={13} className="transition-transform group-hover:rotate-90" /> Schedule New
            </button>
          </div>

          {/* List */}
          {followUps.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-brand-lilac py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
                <CalendarDays size={22} />
              </span>
              <p className="font-display text-base font-semibold text-brand-ink">No follow-ups on this day</p>
              <p className="max-w-sm text-sm text-brand-ink/50">
                Click "Schedule New" to add a follow-up for {prettyDate(date)}
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {followUps.map((f) => {
                const status = f.__status;
                const style = STATUS_STYLES[status] || STATUS_STYLES.Upcoming;
                const StatusIcon = style.icon;
                const isCompleted = status === 'Completed';
                const isCancelled = status === 'Cancelled';
                const isMissed = status === 'Missed';

                return (
                  <li
                    key={f.id}
                    className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      status === 'Overdue' || status === 'Missed' ? 'border-rose-200'
                      : status === 'Today' ? 'border-violet-200'
                      : status === 'Completed' ? 'border-emerald-200'
                      : status === 'Cancelled' ? 'border-slate-200'
                      : 'border-brand-lilac/70'
                    }`}
                  >
                    <span className={`absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b ${style.from} to-transparent transition-transform duration-300 group-hover:scale-y-100`} />

                    <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-mist">
                      <Clock size={11} className="text-brand-magenta" />
                      <p className="font-mono text-[11px] font-bold text-brand-ink tabular-nums">{f.time}</p>
                    </div>

                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.chip}`}>
                      <StatusIcon size={15} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">{f.leadName}</p>
                      <p className="truncate text-[11px] text-brand-ink/50">
                        {f.mobile} · <span className="text-brand-purple">{f.agent}</span>
                      </p>
                      {f.notes && (
                        <p className="mt-0.5 truncate text-[10px] italic text-brand-ink/40">"{f.notes}"</p>
                      )}
                    </div>

                    {f.reminders && f.reminders.length > 0 && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-200">
                        <Bell size={10} /> {f.reminders.length}
                      </span>
                    )}

                    <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {status}
                    </span>

                    <div className="flex shrink-0 items-center gap-1">
                      {!isCompleted && !isCancelled && (
                        <>
                          <button
                            onClick={() => onCall(f)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100"
                            title="Call now"
                          >
                            <Phone size={12} />
                          </button>
                          <button
                            onClick={() => onComplete(f.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-brand-purple transition-all hover:bg-violet-100"
                            title="Mark complete"
                          >
                            <Check size={12} />
                          </button>
                        </>
                      )}

                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === f.id ? null : f.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 hover:bg-brand-lilac"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {menuOpenId === f.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                            <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                              {!isCompleted && !isCancelled && (
                                <>
                                  <MenuItem icon={Phone}         label="Call Now"        onClick={() => { onCall(f); setMenuOpenId(null); }} />
                                  <MenuItem icon={CheckCircle2}  label="Mark Complete"   onClick={() => { onComplete(f.id); setMenuOpenId(null); }} />
                                  <MenuItem icon={CalendarClock} label="Reschedule"      onClick={() => { onReschedule(f); setMenuOpenId(null); }} />
                                  <MenuItem icon={UserCheck}     label="Assign to Agent" onClick={() => { onAssign(f); setMenuOpenId(null); }} />
                                  <MenuItem icon={BellRing}      label="Create Reminder" onClick={() => { onReminder(f); setMenuOpenId(null); }} />
                                  <MenuItem icon={MessageSquare} label="Add Notes"       onClick={() => { onNotes(f); setMenuOpenId(null); }} />
                                  <div className="my-1 h-px bg-brand-lilac/60" />
                                  <MenuItem icon={UserX}         label="Cancel"          onClick={() => { onCancel(f); setMenuOpenId(null); }} />
                                  <div className="my-1 h-px bg-brand-lilac/60" />
                                </>
                              )}
                              {(isCompleted || isMissed) && (
                                <>
                                  <MenuItem icon={CalendarClock} label="Schedule Again" onClick={() => { onReschedule(f); setMenuOpenId(null); }} />
                                  <MenuItem icon={MessageSquare} label="Add Notes"      onClick={() => { onNotes(f); setMenuOpenId(null); }} />
                                  <div className="my-1 h-px bg-brand-lilac/60" />
                                </>
                              )}
                              {isCancelled && (
                                <>
                                  <MenuItem icon={RotateCcw}     label="Reactivate"   onClick={() => { onReactivate(f); setMenuOpenId(null); }} />
                                  <MenuItem icon={MessageSquare} label="Add Notes"    onClick={() => { onNotes(f); setMenuOpenId(null); }} />
                                  <div className="my-1 h-px bg-brand-lilac/60" />
                                </>
                              )}
                              <MenuItem icon={Trash2} label="Delete" danger onClick={() => { onDelete(f); setMenuOpenId(null); }} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function DayStat({ label, value, tone = 'purple' }) {
  const tones = {
    purple:  'bg-violet-50 text-brand-purple border-violet-200',
    violet:  'bg-violet-50 text-violet-600 border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber:   'bg-amber-50 text-amber-600 border-amber-200',
    rose:    'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-2.5 text-center ${tones[tone] || tones.purple}`}>
      <p className="font-display text-lg font-bold tabular-nums">{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CALL MODAL
   ═══════════════════════════════════════════════════════════════ */
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        <div className={`relative px-6 pb-8 pt-8 text-center text-white ${
          callState === 'connected' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
        }`}>
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20">
            <X size={18} />
          </button>

          <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 text-2xl font-bold">
              {initials(displayName)}
            </span>
          </div>

          <p className="text-lg font-semibold">{displayName}</p>
          <p className="text-xs text-white/70">{phone}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            {callState === 'ringing' ? 'Ringing…' : `Connected · ${formatTime(seconds)}`}
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
                <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Call Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this call..."
                  className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                />
              </div>
            </>
          )}

          {callState === 'ringing' && (
            <p className="mb-5 text-center text-sm text-brand-ink/60">
              Connecting your call to <span className="font-semibold text-brand-ink">{displayName}</span>…
            </p>
          )}

          <a
            href={`tel:${phone}`}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <PhoneOutgoing size={14} /> Open in Phone App
          </a>

          {/* ✅ FIXED: shows Cancel during ringing, End Call during connected */}
          {callState === 'ringing' ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-3 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                Cancel
              </button>
              <button
                onClick={() => onEnd(formatTime(seconds), 'Missed', notes)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                <PhoneMissed size={16} /> Missed
              </button>
            </div>
          ) : (
            <button
              onClick={() => onEnd(formatTime(seconds), 'Connected', notes)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <PhoneOff size={16} /> End Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CallControl({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
        active ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta' : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESCHEDULE MODAL
   ═══════════════════════════════════════════════════════════════ */
function RescheduleModal({ followUp, onClose, onSave }) {
  const today = todayKey();
  const [date, setDate] = useState(followUp.date || today);
  const [time, setTime] = useState(followUp.time || '10:00');
  const [notes, setNotes] = useState(followUp.notes || '');
  const [usePreset, setUsePreset] = useState(null);
  const [error, setError] = useState('');

  /* ✅ FIXED: applying a preset updates the date/time inputs too */
  const applyPreset = (hours) => {
    setUsePreset(hours);
    const target = new Date(Date.now() + hours * 60 * 60 * 1000);
    setDate(target.toISOString().slice(0, 10));
    setTime(target.toTimeString().slice(0, 5));
  };

  const handleSave = () => {
    if (!usePreset && !date) { setError('Please pick a date or a preset'); return; }
    if (!usePreset && date < today) { setError('Cannot schedule in the past'); return; }
    setError('');
    onSave({ date, time, hoursFromNow: usePreset, notes });
  };

  return (
    <ModalShell title="Reschedule Follow-Up" subtitle={`${followUp.leadName} · ${followUp.mobile}`} onClose={onClose} icon={CalendarClock} iconTone="amber">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {RESCHEDULE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { applyPreset(p.hours); setError(''); }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  usePreset === p.hours
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-brand-lilac" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">or pick manually</span>
          <span className="h-px flex-1 bg-brand-lilac" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" type="date" value={date} min={today} onChange={(v) => { setDate(v); setUsePreset(null); }} />
          <Field label="Time" type="time" value={time} onChange={(v) => { setTime(v); setUsePreset(null); }} />
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
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

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
            onClick={handleSave}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOTES MODAL (with reminder list)
   ═══════════════════════════════════════════════════════════════ */
function NotesModal({ followUp, onClose, onSave, onDeleteReminder }) {
  const [notes, setNotes] = useState(followUp.notes || '');

  return (
    <ModalShell title="Follow-Up Notes" subtitle={`${followUp.leadName} · ${followUp.mobile}`} onClose={onClose} icon={MessageSquare} iconTone="purple">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        placeholder="Write notes about this follow-up…"
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-3 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      />

      {/* ✅ NEW: existing reminders list with delete */}
      {followUp.reminders && followUp.reminders.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">
            Active Reminders ({followUp.reminders.length})
          </p>
          <ul className="space-y-1.5">
            {followUp.reminders.map((r) => (
              <li key={r.id} className="flex items-center gap-2 rounded-lg border border-brand-lilac/60 bg-brand-mist/30 px-3 py-2">
                <Bell size={12} className="text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-brand-ink">
                    {r.minutesBefore ? `${r.minutesBefore} min before` : 'Reminder'}
                  </p>
                  <p className="truncate text-[10px] text-brand-ink/50">
                    {r.channel || 'in-app'}{r.message ? ` · "${r.message}"` : ''}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteReminder(r.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                  title="Delete reminder"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
          Cancel
        </button>
        <button
          onClick={() => onSave(notes.trim())}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Save size={14} /> Save Notes
        </button>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REMINDER MODAL
   ═══════════════════════════════════════════════════════════════ */
function ReminderModal({ followUp, onClose, onSave }) {
  const [preset, setPreset] = useState(60);
  const [channel, setChannel] = useState('in-app');
  const [customMessage, setCustomMessage] = useState('');
  const [error, setError] = useState('');

  const channels = [
    { key: 'in-app',   label: 'In-App',   icon: Bell },
    { key: 'email',    label: 'Email',    icon: Mail },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { key: 'sms',      label: 'SMS',      icon: Send },
  ];

  /* ✅ FIXED: validate reminder time isn't in the past */
  const handleSave = () => {
    const followUpAt = new Date(`${followUp.date}T${followUp.time || '00:00'}`);
    const reminderAt = new Date(followUpAt.getTime() - preset * 60 * 1000);
    if (reminderAt.getTime() < Date.now()) {
      setError('This reminder time has already passed. Pick a shorter lead time or reschedule the follow-up.');
      return;
    }
    setError('');
    onSave({
      minutesBefore: preset,
      channel,
      message: customMessage.trim(),
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <ModalShell title="Create Reminder" subtitle={`For ${followUp.leadName} on ${followUp.date} at ${followUp.time}`} onClose={onClose} icon={BellRing} iconTone="amber">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">When to remind</label>
          <div className="grid grid-cols-2 gap-2">
            {REMINDER_PRESETS.map((r) => (
              <button
                key={r.label}
                onClick={() => { setPreset(r.minutes); setError(''); }}
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                  preset === r.minutes
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Channel</label>
          <div className="grid grid-cols-4 gap-2">
            {channels.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setChannel(key)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[10px] font-semibold transition-all ${
                  channel === key
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Custom message (optional)</label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={2}
            placeholder="Add a custom reminder message…"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

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
            onClick={handleSave}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Bell size={14} /> Create Reminder
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ASSIGN MODAL
   ═══════════════════════════════════════════════════════════════ */
function AssignModal({ followUp, agents, onClose, onSave }) {
  const [selected, setSelected] = useState(followUp.agent || '');
  const unchanged = selected === followUp.agent;

  return (
    <ModalShell title="Assign Follow-Up" subtitle={`Reassign follow-up for ${followUp.leadName}`} onClose={onClose} icon={UserCheck} iconTone="purple">
      {agents.length === 0 ? (
        <p className="rounded-xl bg-brand-mist/40 px-4 py-6 text-center text-sm text-brand-ink/50">
          No agents available
        </p>
      ) : (
        <ul className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-brand-lilac/60 p-1">
          {agents.map((a) => {
            const active = selected === a.name;
            return (
              <li key={a.id}>
                <button
                  onClick={() => setSelected(a.name)}
                  className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-all ${
                    active ? 'bg-brand-magenta/5 ring-1 ring-brand-magenta/30' : 'hover:bg-brand-mist/40'
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                    {initials(a.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{a.name}</p>
                    <p className="truncate text-[11px] text-brand-ink/50">
                      {a.status} · {a.leadsAssigned || 0} leads
                    </p>
                  </div>
                  {active && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-magenta text-white">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* ✅ FIXED: shows helper text when disabled */}
      {unchanged && selected && (
        <p className="mt-2 text-[10px] font-medium text-brand-ink/50">
          Currently assigned to {followUp.agent}. Pick a different agent to reassign.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
          Cancel
        </button>
        <button
          onClick={() => selected && onSave(selected)}
          disabled={!selected || unchanged}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
        >
          <UserCheck size={14} /> Assign
        </button>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCHEDULE NEW MODAL
   ═══════════════════════════════════════════════════════════════ */
function ScheduleNewModal({ agents, onClose, onSave }) {
  const today = todayKey();
  const [form, setForm] = useState({
    leadName: '',
    mobile: '',
    agent: agents[0]?.name || '',
    date: today,
    time: '10:00',
    notes: '',
  });
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!form.leadName.trim()) { setError('Lead name is required'); return; }
    if (!/^\d{10}$/.test(form.mobile)) { setError('Mobile must be exactly 10 digits'); return; }
    if (!form.date) { setError('Date is required'); return; }
    if (form.date < today) { setError('Cannot schedule in the past'); return; }
    if (!form.agent) { setError('Please assign an agent'); return; }
    if (!form.time) { setError('Time is required'); return; }
    onSave({
      leadName: form.leadName.trim(),
      mobile: form.mobile,
      agent: form.agent,
      date: form.date,
      time: form.time,
      notes: form.notes.trim(),
    });
  };

  return (
    <ModalShell title="Schedule Follow-Up" subtitle="Create a new follow-up for a lead" onClose={onClose} icon={Plus} iconTone="magenta">
      <div className="space-y-3">
        <Field
          label="Lead Name"
          value={form.leadName}
          onChange={(v) => { setForm({ ...form, leadName: v }); setError(''); }}
          placeholder="e.g. Priya Sharma"
        />
        <Field
          label="Mobile"
          value={form.mobile}
          onChange={(v) => { setForm({ ...form, mobile: v.replace(/\D/g, '').slice(0, 10) }); setError(''); }}
          placeholder="10-digit number"
        />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Assign to Agent</label>
          <select
            value={form.agent}
            onChange={(e) => setForm({ ...form, agent: e.target.value })}
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" type="date" value={form.date} min={today} onChange={(v) => setForm({ ...form, date: v })} />
          <Field label="Time" type="time" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <MessageSquare size={11} /> Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Context for this follow-up…"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

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
            onClick={handleSave}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Save size={14} /> Schedule
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function ModalShell({ title, subtitle, children, onClose, icon: Icon, iconTone = 'purple' }) {
  const tones = {
    purple:  'from-brand-magenta to-brand-purple',
    amber:   'from-amber-500 to-orange-500',
    magenta: 'from-brand-magenta to-rose-500',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tones[iconTone]} text-white`}>
                <Icon size={18} />
              </span>
            )}
            <div>
              <h3 className="font-display text-base font-bold text-brand-ink">{title}</h3>
              {subtitle && <p className="text-[11px] text-brand-ink/50">{subtitle}</p>}
            </div>
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

function Field({ label, type = 'text', value, onChange, placeholder, min }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <input
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      />
    </div>
  );
}

function EmptyState({ hasFilters, onClear, tab }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Calendar size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? `No ${tab !== 'all' ? tab.toLowerCase() : ''} follow-ups found` : 'No follow-ups yet'}
      </p>
      {hasFilters && (
        <button onClick={onClear} className="text-xs font-semibold text-brand-magenta hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, confirmTone = 'rose', onCancel, onConfirm }) {
  const tones = {
    rose:  'bg-rose-500 hover:bg-rose-600',
    amber: 'bg-amber-500 hover:bg-amber-600',
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${confirmTone === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-500'}`}>
            <AlertCircle size={18} />
          </div>
          <h3 className="font-display text-base font-semibold text-brand-ink">{title}</h3>
        </div>
        <p className="mb-5 text-sm text-brand-ink/60">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white ${tones[confirmTone] || tones.rose}`}>
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
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}