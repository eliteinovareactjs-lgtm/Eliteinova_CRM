// src/pages/agent/Reminders.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Bell, BellRing, Clock, Calendar, CheckCircle2, AlertCircle, X, Search,
  ChevronDown, StickyNote, ListFilter, Inbox, User, Tag, TrendingUp,
  Flame, Megaphone, PhoneCall, Phone, ListChecks, RotateCcw, Ban,
  List, Grid3x3, Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ================================================================
   CONSTANTS
   ================================================================ */
const TABS = [
  { key: 'today',     label: "Today's Reminders", icon: BellRing },
  { key: 'upcoming',  label: 'Upcoming',          icon: Calendar },
  { key: 'completed', label: 'Completed',         icon: CheckCircle2 },
];

const TYPE_META = {
  followup: { label: 'Follow-Up',        icon: Calendar,   tint: 'bg-violet-50 text-brand-purple border-violet-200' },
  call:     { label: 'Call Reminder',    icon: PhoneCall,  tint: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  callback: { label: 'Customer Callback',icon: Phone,      tint: 'bg-amber-50 text-amber-600 border-amber-200' },
  task:     { label: 'Pending Task',     icon: ListChecks, tint: 'bg-rose-50 text-brand-magenta border-rose-200' },
};

const PRIORITY_STYLES = {
  High:   'border-rose-200 bg-rose-50 text-rose-600',
  Medium: 'border-amber-200 bg-amber-50 text-amber-600',
  Low:    'border-emerald-200 bg-emerald-50 text-emerald-600',
};

/* ================================================================
   DEMO DATA
   ================================================================ */
const buildDemoReminders = (agentName, websiteId) => {
  const ymd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = new Date();
  const todayStr     = ymd(today);
  const tomorrowStr  = ymd(new Date(today.getTime() + 86400000));
  const nextWeekStr  = ymd(new Date(today.getTime() + 5 * 86400000));
  const yesterdayStr = ymd(new Date(today.getTime() - 86400000));
  const lastWeekStr  = ymd(new Date(today.getTime() - 5 * 86400000));

  return [
    { id: 'r-1', agentName, websiteId, type: 'followup', title: 'Follow-up with Customer A',      customer: 'Customer A', mobile: '9876543210', date: todayStr,     time: '10:00', priority: 'High',   status: 'today',     notes: '' },
    { id: 'r-2', agentName, websiteId, type: 'call',     title: 'Call Customer B',                customer: 'Customer B', mobile: '9876543211', date: todayStr,     time: '11:30', priority: 'Medium', status: 'today',     notes: '' },
    { id: 'r-3', agentName, websiteId, type: 'callback', title: 'Customer C asked for a callback',customer: 'Customer C', mobile: '9876543212', date: todayStr,     time: '14:00', priority: 'High',   status: 'today',     notes: 'Prefers afternoon.' },
    { id: 'r-4', agentName, websiteId, type: 'task',     title: 'Prepare quotes for Customer D',  customer: 'Customer D', mobile: '9876543213', date: todayStr,     time: '16:15', priority: 'Medium', status: 'today',     notes: '' },
    { id: 'r-5', agentName, websiteId, type: 'call',     title: 'Call Customer E for demo',       customer: 'Customer E', mobile: '9876543214', date: tomorrowStr,  time: '09:45', priority: 'High',   status: 'upcoming',  notes: '' },
    { id: 'r-6', agentName, websiteId, type: 'followup', title: 'Follow-up with Customer F',      customer: 'Customer F', mobile: '9876543215', date: nextWeekStr,  time: '11:00', priority: 'Medium', status: 'upcoming',  notes: '' },
    { id: 'r-7', agentName, websiteId, type: 'call',     title: 'Called Customer G',              customer: 'Customer G', mobile: '9876543216', date: yesterdayStr, time: '15:00', priority: 'Low',    status: 'completed', notes: '', completedAt: new Date(Date.now() - 86400_000).toISOString() },
    { id: 'r-8', agentName, websiteId, type: 'task',     title: 'Sent brochure to Customer H',    customer: 'Customer H', mobile: '9876543217', date: lastWeekStr,  time: '12:30', priority: 'Low',    status: 'completed', notes: '', completedAt: new Date(Date.now() - 5 * 86400_000).toISOString() },
  ];
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function Reminders() {
  const { user, activeWebsiteId } = useAuth();

  const [activeTab, setActiveTab] = useState('today');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showNote, setShowNote] = useState(null);
  const [showReschedule, setShowReschedule] = useState(null);
  const [calling, setCalling] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const [reminders, setReminders] = useState(() =>
    buildDemoReminders(user?.name || 'Agent', activeWebsiteId)
  );

  useEffect(() => {
    setReminders(buildDemoReminders(user?.name || 'Agent', activeWebsiteId));
  }, [user?.name, activeWebsiteId]);

  /* ---------- SUMMARY ---------- */
  const summary = useMemo(() => {
    const today = reminders.filter((r) => r.status === 'today').length;
    const upcoming = reminders.filter((r) => r.status === 'upcoming').length;
    const completed = reminders.filter((r) => r.status === 'completed').length;
    return { today, upcoming, completed, total: reminders.length };
  }, [reminders]);

  /* ---------- FILTERED ---------- */
  const filtered = useMemo(() => {
    let list = reminders.filter((r) => r.status === activeTab);

    if (typeFilter !== 'All') list = list.filter((r) => r.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) =>
        `${r.title} ${r.customer} ${r.mobile} ${r.notes || ''}`.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      const aKey = a.status === 'completed' ? a.completedAt || `${a.date} ${a.time}` : `${a.date} ${a.time}`;
      const bKey = b.status === 'completed' ? b.completedAt || `${b.date} ${b.time}` : `${b.date} ${b.time}`;
      return a.status === 'completed' ? bKey.localeCompare(aKey) : aKey.localeCompare(bKey);
    });
  }, [reminders, activeTab, typeFilter, searchQuery]);

  /* ---------- ACTIONS ---------- */
  const updateReminder = (id, patch) =>
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleComplete = (r) => {
    updateReminder(r.id, { status: 'completed', completedAt: new Date().toISOString() });
    showToast(`Reminder completed · ${r.title}`);
  };

  const handleSnooze = (r, minutes) => {
    const newTime = (() => {
      const [h, m] = r.time.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m + minutes);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    })();
    updateReminder(r.id, { time: newTime });
    showToast(`Snoozed ${minutes} min · new time ${newTime}`);
  };

  const handleReschedule = (r, { date, time }) => {
    updateReminder(r.id, { date, time, status: 'upcoming' });
    setShowReschedule(null);
    showToast(`Rescheduled to ${date} · ${time}`);
  };

  const handleSaveNote = (r, note) => {
    updateReminder(r.id, { notes: (r.notes ? `${r.notes}\n` : '') + note });
    setShowNote(null);
    showToast('Note saved');
  };

  const handleDelete = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    setConfirmDelete(null);
    showToast('Reminder deleted', 'error');
  };

  const handleCall = (r) => setCalling(r);

  const handleCallEnd = (payload) => {
    updateReminder(calling.id, {
      notes: (calling.notes ? `${calling.notes}\n` : '') + `Call: ${payload.outcome} (${payload.duration})`,
      lastCallAt: new Date().toISOString(),
    });
    setCalling(null);
    showToast(`Call logged · ${payload.outcome}`);
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
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Reminders</h1>
          <p className="text-sm text-brand-ink/50">
            Follow-ups, calls, callbacks and tasks you need to act on.
          </p>
        </div>

        {/* ================= KPI STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard label="Total"     value={summary.total}     sub="All reminders"    icon={Bell}          color="purple"  delay={0} />
          <AnimatedStatCard label="Today"     value={summary.today}     sub="Due today"        icon={BellRing}      color="amber"   delay={40} />
          <AnimatedStatCard label="Upcoming"  value={summary.upcoming}  sub="Next days"        icon={Calendar}      color="emerald" delay={80} />
          <AnimatedStatCard label="Completed" value={summary.completed} sub="Done"             icon={CheckCircle2}  color="emerald" delay={120} />
        </div>

        {/* ================= TABS + VIEW TOGGLE ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count =
                t.key === 'today'     ? summary.today :
                t.key === 'upcoming'  ? summary.upcoming :
                                        summary.completed;
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
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'
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
                className={`rounded-full border p-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                    : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
                }`}
                title="List view"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-full border p-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                    : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
                }`}
                title="Grid view"
              >
                <Grid3x3 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= SEARCH + FILTERS ================= */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, customer, mobile..."
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
            label="Type"
            icon={Tag}
            value={typeFilter}
            options={[
              { value: 'All',       label: 'All Types' },
              { value: 'followup',  label: 'Follow-Up' },
              { value: 'call',      label: 'Call Reminder' },
              { value: 'callback',  label: 'Customer Callback' },
              { value: 'task',      label: 'Pending Task' },
            ]}
            onChange={setTypeFilter}
          />

          <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
            <ListFilter size={14} className="text-brand-magenta" />
            Showing: <span className="text-brand-magenta">{filtered.length}</span>
          </span>
        </div>

        {/* ================= LIST / GRID ================= */}
        {filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                onView={() => setSelected(r)}
                onComplete={() => handleComplete(r)}
                onSnooze={() => handleSnooze(r, 15)}
                onCall={() => handleCall(r)}
                onNote={() => setShowNote(r)}
                onReschedule={() => setShowReschedule(r)}
                onDelete={() => setConfirmDelete(r)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => (
              <ReminderRow
                key={r.id}
                reminder={r}
                onView={() => setSelected(r)}
                onComplete={() => handleComplete(r)}
                onSnooze={() => handleSnooze(r, 15)}
                onCall={() => handleCall(r)}
                onNote={() => setShowNote(r)}
                onReschedule={() => setShowReschedule(r)}
                onDelete={() => setConfirmDelete(r)}
              />
            ))}
          </div>
        )}

        {/* ================= DRAWER / MODALS ================= */}
        {selected && (
          <ReminderDrawer
            reminder={selected}
            onClose={() => setSelected(null)}
            onComplete={() => { handleComplete(selected); setSelected(null); }}
            onSnooze={() => { handleSnooze(selected, 15); setSelected(null); }}
            onCall={() => { handleCall(selected); setSelected(null); }}
            onNote={() => { setShowNote(selected); setSelected(null); }}
            onReschedule={() => { setShowReschedule(selected); setSelected(null); }}
            onDelete={() => { setConfirmDelete(selected); setSelected(null); }}
          />
        )}

        {showNote && (
          <NoteModal
            reminder={showNote}
            onClose={() => setShowNote(null)}
            onSave={handleSaveNote}
          />
        )}

        {showReschedule && (
          <RescheduleModal
            reminder={showReschedule}
            onClose={() => setShowReschedule(null)}
            onSave={handleReschedule}
          />
        )}

        {calling && (
          <CallModal
            target={calling}
            onClose={() => setCalling(null)}
            onEnd={handleCallEnd}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title="Delete reminder?"
            message={`This will permanently delete "${confirmDelete.title}".`}
            confirmLabel="Delete"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDelete(confirmDelete.id)}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ================================================================
   REMINDER ROW — no dropdown, View Details button
   ================================================================ */
function ReminderRow({
  reminder, onView, onComplete, onSnooze, onCall, onNote, onReschedule, onDelete,
}) {
  const r = reminder;
  const meta = TYPE_META[r.type] || TYPE_META.followup;
  const Icon = meta.icon;
  const isDone = r.status === 'completed';
  const canCall = r.type === 'call' || r.type === 'callback' || r.type === 'followup';

  return (
    <div className="group relative flex flex-wrap items-center gap-3 rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:border-brand-magenta/40 hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      {/* Time block */}
      <div className="flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta/10 to-brand-purple/10">
        <p className="font-display text-sm font-bold text-brand-ink">{r.time}</p>
        <p className="font-mono text-[9px] uppercase tracking-wide text-brand-ink/50">
          {r.date.slice(5)}
        </p>
      </div>

      {/* Type icon */}
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.tint}`}>
        <Icon size={15} />
      </span>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta"
          >
            {r.title}
          </button>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[r.priority]}`}>
            {r.priority}
          </span>
        </div>
        <p className="truncate text-xs text-brand-ink/50">
          {r.customer} · {r.mobile} · {meta.label}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
          isDone ? 'bg-emerald-100 text-emerald-600' : r.status === 'upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-700'
        }`}
      >
        {r.status}
      </span>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        {!isDone && (
          <>
            {canCall && (
              <button
                onClick={onCall}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 px-3 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
                title="Call now"
              >
                <Phone size={12} /> Call
              </button>
            )}
            <button
              onClick={onComplete}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple px-3 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
              title="Mark complete"
            >
              <CheckCircle2 size={12} /> Done
            </button>
          </>
        )}

        <button
          onClick={onView}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-3 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
          title="View details"
        >
          <User size={12} /> View Details
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   REMINDER CARD — no dropdown, View Details button
   ================================================================ */
function ReminderCard({
  reminder, onView, onComplete, onSnooze, onCall, onNote, onReschedule, onDelete,
}) {
  const r = reminder;
  const meta = TYPE_META[r.type] || TYPE_META.followup;
  const Icon = meta.icon;
  const isDone = r.status === 'completed';
  const canCall = r.type === 'call' || r.type === 'callback' || r.type === 'followup';

  return (
    <div className="group relative flex flex-col rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-magenta/50 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-2xl">
        <span className="block h-full w-full origin-left scale-x-0 bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />
      </span>

      <div className="relative flex flex-1 flex-col p-4">
        {/* Header: time + status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg font-bold leading-tight text-brand-ink">{r.time}</p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand-ink/50">
              {r.date}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
              isDone ? 'bg-emerald-100 text-emerald-600' : r.status === 'upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {r.status}
          </span>
        </div>

        {/* Type chip */}
        <div className="mt-3 flex items-center gap-2">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.tint}`}>
            <Icon size={14} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-ink/50">
            {meta.label}
          </span>
        </div>

        {/* Title + customer */}
        <button
          onClick={onView}
          className="mt-3 truncate text-left text-sm font-semibold text-brand-ink hover:text-brand-magenta"
        >
          {r.title}
        </button>
        <p className="truncate text-[11px] text-brand-ink/50">
          {r.customer} · {r.mobile}
        </p>

        {/* Meta row */}
        <div className="mt-3 flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[r.priority]}`}>
            {r.priority}
          </span>
          {r.notes && (
            <span className="truncate text-[10px] text-brand-ink/50">📝 {r.notes}</span>
          )}
        </div>

        {/* Primary actions */}
        {!isDone ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {canCall ? (
              <button
                onClick={onCall}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Phone size={12} /> Call
              </button>
            ) : (
              <button
                onClick={onSnooze}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-100"
              >
                <Clock size={12} /> Snooze
              </button>
            )}
            <button
              onClick={onComplete}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
            >
              <CheckCircle2 size={12} /> Done
            </button>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
            <CheckCircle2 size={12} /> Completed
          </div>
        )}

        {/* View Details button replaces dropdown */}
        <button
          onClick={onView}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
        >
          <User size={12} /> View Details
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   REMINDER DRAWER — all secondary actions live here
   ================================================================ */
function ReminderDrawer({ reminder, onClose, onComplete, onSnooze, onCall, onNote, onReschedule, onDelete }) {
  const r = reminder;
  const meta = TYPE_META[r.type] || TYPE_META.followup;
  const Icon = meta.icon;
  const isDone = r.status === 'completed';
  const canCall = r.type === 'call' || r.type === 'callback' || r.type === 'followup';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
              Reminder
            </p>
            <h3 className="font-display text-lg font-semibold text-brand-ink">Details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-start gap-3">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${meta.tint}`}>
              <Icon size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{r.title}</p>
              <p className="text-xs text-brand-ink/50">
                {r.customer} · {r.mobile}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                isDone ? 'bg-emerald-100 text-emerald-600' : r.status === 'upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {r.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${PRIORITY_STYLES[r.priority]}`}>
              <Flame size={11} /> {r.priority} Priority
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 text-[11px] font-semibold text-brand-ink/70">
              <Icon size={11} /> {meta.label}
            </span>
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Reminder Details</h4>
            <Row icon={Calendar}  label="Date"     value={r.date} />
            <Row icon={Clock}     label="Time"     value={r.time} />
            <Row icon={User}      label="Customer" value={r.customer} />
            <Row icon={Phone}     label="Mobile"   value={r.mobile} />
            <Row icon={Tag}       label="Type"     value={meta.label} />
          </div>

          {r.notes && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                Notes
              </p>
              <p className="whitespace-pre-line text-sm text-brand-ink/80">{r.notes}</p>
            </div>
          )}

          {!isDone && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {canCall && (
                  <button
                    onClick={onCall}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
                  >
                    <Phone size={16} /> Call Now
                  </button>
                )}
                <button
                  onClick={onComplete}
                  className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 ${
                    !canCall ? 'col-span-2' : ''
                  }`}
                >
                  <CheckCircle2 size={16} /> Complete
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onSnooze}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-100"
                >
                  <Clock size={12} /> Snooze
                </button>
                <button
                  onClick={onReschedule}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
                >
                  <RotateCcw size={12} /> Reschedule
                </button>
                <button
                  onClick={onNote}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
                >
                  <StickyNote size={12} /> Note
                </button>
              </div>

              <button
                onClick={onDelete}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-100"
              >
                <Trash2 size={12} /> Delete Reminder
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   NOTE MODAL
   ================================================================ */
function NoteModal({ reminder, onClose, onSave }) {
  const [text, setText] = useState('');
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <StickyNote size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Add Note</h3>
              <p className="text-xs text-brand-ink/50">{reminder.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Add context for this reminder..."
          className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />

        {reminder.notes && (
          <div className="mt-4 max-h-40 overflow-y-auto">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">Previous notes</p>
            <p className="whitespace-pre-line rounded-lg border border-brand-lilac/60 bg-brand-mist/40 p-2.5 text-xs text-brand-ink/70">
              {reminder.notes}
            </p>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Cancel
          </button>
          <button
            onClick={() => text.trim() && onSave(reminder, text.trim())}
            disabled={!text.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   RESCHEDULE MODAL
   ================================================================ */
function RescheduleModal({ reminder, onClose, onSave }) {
  const [date, setDate] = useState(reminder.date);
  const [time, setTime] = useState(reminder.time);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <RotateCcw size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Reschedule</h3>
              <p className="text-xs text-brand-ink/50">{reminder.title}</p>
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

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(reminder, { date, time })}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Reschedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CALL MODAL
   ================================================================ */
function CallModal({ target, onClose, onEnd }) {
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('Connected');

  useEffect(() => {
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pb-8 pt-8 text-center text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20"
          >
            <X size={18} />
          </button>

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/25 text-2xl font-bold">
            {target.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <p className="text-lg font-semibold">{target.customer}</p>
          <p className="text-xs text-white/70">{target.mobile}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            Connected · {formatTime(seconds)}
          </p>
        </div>

        <div className="space-y-3 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Call Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notes..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Outcome</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              {['Connected', 'No Answer', 'Busy', 'Callback', 'Interested', 'Not Interested', 'Converted'].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onEnd({ outcome, notes, duration: formatTime(seconds) })}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            End Call · {formatTime(seconds)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CONFIRM DIALOG
   ================================================================ */
function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
            <AlertCircle size={18} />
          </div>
          <h3 className="font-display text-base font-semibold text-brand-ink">{title}</h3>
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

/* ================================================================
   EMPTY STATE
   ================================================================ */
function EmptyState({ tab }) {
  const messages = {
    today:     'No reminders for today',
    upcoming:  'No upcoming reminders',
    completed: 'No completed reminders yet',
  };
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Inbox size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {messages[tab] || 'Nothing to show'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        Follow-ups, calls, callbacks and tasks appear here as you schedule them.
      </p>
    </div>
  );
}

/* ================================================================
   DROPDOWN FILTER
   ================================================================ */
function DropdownFilter({ label, icon: Icon, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

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
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-48 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
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
   INFO ROW
   ================================================================ */
function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/60 pb-2">
      <span className="flex shrink-0 items-center gap-1.5 text-brand-ink/50">
        {Icon && <Icon size={12} />}
        {label}
      </span>
      <span className="truncate font-medium capitalize text-brand-ink">{value}</span>
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