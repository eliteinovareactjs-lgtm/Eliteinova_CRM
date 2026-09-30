// src/pages/agent/Tasks.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  ListChecks, CheckCircle2, Clock, Calendar, AlertCircle, X, Search,
  ChevronDown, ChevronLeft, ChevronRight, StickyNote, ListFilter, Inbox,
  User, Tag, TrendingUp, Flame, Play, RotateCcw, Ban, List, Grid3x3,
  Trash2, Plus, Briefcase, Phone, CheckSquare, Square, Zap, Timer,
  CircleDot, Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ================================================================
   CONSTANTS
   ================================================================ */
const TABS = [
  { key: 'pending',     label: 'Pending',         icon: Clock },
  { key: 'in_progress', label: 'In Progress',     icon: Play },
  { key: 'completed',   label: 'Completed',       icon: CheckCircle2 },
  { key: 'calendar',    label: 'Task Calendar',   icon: Calendar },
];

const TASK_TYPES = [
  { value: 'call',     label: 'Call Task' },
  { value: 'followup', label: 'Follow-Up' },
  { value: 'document', label: 'Document' },
  { value: 'meeting',  label: 'Meeting' },
  { value: 'admin',    label: 'Admin' },
  { value: 'other',    label: 'Other' },
];

const TYPE_META = {
  call:     { label: 'Call Task', icon: Phone,      tint: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  followup: { label: 'Follow-Up', icon: Calendar,   tint: 'bg-violet-50 text-brand-purple border-violet-200' },
  document: { label: 'Document',  icon: Briefcase,  tint: 'bg-blue-50 text-blue-600 border-blue-200' },
  meeting:  { label: 'Meeting',   icon: User,       tint: 'bg-amber-50 text-amber-600 border-amber-200' },
  admin:    { label: 'Admin',     icon: ListChecks, tint: 'bg-slate-50 text-slate-600 border-slate-200' },
  other:    { label: 'Other',     icon: Tag,        tint: 'bg-rose-50 text-brand-magenta border-rose-200' },
};

const PRIORITY_STYLES = {
  High:   'border-rose-200 bg-rose-50 text-rose-600',
  Medium: 'border-amber-200 bg-amber-50 text-amber-600',
  Low:    'border-emerald-200 bg-emerald-50 text-emerald-600',
};

const STATUS_STYLES = {
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-600',
  completed:   'bg-emerald-100 text-emerald-600',
};

/* ================================================================
   HELPERS
   ================================================================ */
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const isOverdue = (task) => {
  if (task.status === 'completed') return false;
  const now = new Date();
  const [y, m, d] = task.dueDate.split('-').map(Number);
  const [hh, mm] = task.dueTime.split(':').map(Number);
  const due = new Date(y, m - 1, d, hh, mm);
  return due.getTime() < now.getTime();
};

const isToday = (task) => task.dueDate === ymd(new Date());

/* ================================================================
   DEMO DATA
   ================================================================ */
const buildDemoTasks = (agentName, websiteId) => {
  const today = new Date();
  const todayStr     = ymd(today);
  const tomorrowStr  = ymd(new Date(today.getTime() + 86400000));
  const nextWeekStr  = ymd(new Date(today.getTime() + 5 * 86400000));
  const yesterdayStr = ymd(new Date(today.getTime() - 86400000));
  const lastWeekStr  = ymd(new Date(today.getTime() - 5 * 86400000));

  return [
    { id: 't-1', agentName, websiteId, title: 'Call Customer A about pricing',       customer: 'Customer A', mobile: '9876543210', type: 'call',     dueDate: todayStr,     dueTime: '10:00', priority: 'High',   status: 'pending',     notes: '' },
    { id: 't-2', agentName, websiteId, title: 'Prepare proposal for Customer B',      customer: 'Customer B', mobile: '9876543211', type: 'document', dueDate: todayStr,     dueTime: '13:30', priority: 'Medium', status: 'pending',     notes: '' },
    { id: 't-3', agentName, websiteId, title: 'Follow-up with Customer C after demo', customer: 'Customer C', mobile: '9876543212', type: 'followup', dueDate: todayStr,     dueTime: '16:00', priority: 'High',   status: 'in_progress', notes: 'Prefers email.' },
    { id: 't-4', agentName, websiteId, title: 'Schedule team meeting for next sprint',customer: '—',          mobile: '—',          type: 'meeting',  dueDate: tomorrowStr,  dueTime: '09:00', priority: 'Medium', status: 'pending',     notes: '' },
    { id: 't-5', agentName, websiteId, title: 'Update CRM notes for Customer D',      customer: 'Customer D', mobile: '9876543213', type: 'admin',    dueDate: nextWeekStr,  dueTime: '11:30', priority: 'Low',    status: 'pending',     notes: '' },
    { id: 't-6', agentName, websiteId, title: 'Called Customer E',                    customer: 'Customer E', mobile: '9876543214', type: 'call',     dueDate: yesterdayStr, dueTime: '15:00', priority: 'High',   status: 'completed',   notes: '', completedAt: new Date(Date.now() - 86400_000).toISOString() },
    { id: 't-7', agentName, websiteId, title: 'Sent documents to Customer F',         customer: 'Customer F', mobile: '9876543215', type: 'document', dueDate: lastWeekStr,  dueTime: '12:00', priority: 'Medium', status: 'completed',   notes: '', completedAt: new Date(Date.now() - 5 * 86400_000).toISOString() },
    { id: 't-8', agentName, websiteId, title: 'Reviewed quotes with Customer G',      customer: 'Customer G', mobile: '9876543216', type: 'followup', dueDate: todayStr,     dueTime: '17:15', priority: 'Low',    status: 'in_progress', notes: '' },
  ];
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function Tasks() {
  const { user, activeWebsiteId } = useAuth();

  const [activeTab, setActiveTab] = useState('pending');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [toast, setToast] = useState(null);

  const [selected, setSelected] = useState(null);
  const [showNote, setShowNote] = useState(null);
  const [showReschedule, setShowReschedule] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarDay, setCalendarDay] = useState(null);

  const [selectedIds, setSelectedIds] = useState(new Set());

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const [tasks, setTasks] = useState(() =>
    buildDemoTasks(user?.name || 'Agent', activeWebsiteId)
  );

  useEffect(() => {
    setTasks(buildDemoTasks(user?.name || 'Agent', activeWebsiteId));
  }, [user?.name, activeWebsiteId]);

  /* ---------- KEYBOARD SHORTCUT: N = New Task ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target?.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        setShowAddTask(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---------- SUMMARY ---------- */
  const summary = useMemo(() => {
    const pending    = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const completed  = tasks.filter((t) => t.status === 'completed').length;
    const overdue    = tasks.filter(isOverdue).length;
    const todayCount = tasks.filter(isToday).length;
    const todayDone  = tasks.filter((t) => isToday(t) && t.status === 'completed').length;

    const nextTask = [...tasks]
      .filter((t) => t.status !== 'completed' && !isOverdue(t))
      .sort((a, b) => `${a.dueDate} ${a.dueTime}`.localeCompare(`${b.dueDate} ${b.dueTime}`))[0];

    return { pending, inProgress, completed, total: tasks.length, overdue, todayCount, todayDone, nextTask };
  }, [tasks]);

  /* ---------- FILTERED ---------- */
  const filteredTasks = useMemo(() => {
    if (activeTab === 'calendar') return [];
    let list = tasks.filter((t) => t.status === activeTab);
    if (priorityFilter !== 'All') list = list.filter((t) => t.priority === priorityFilter);
    if (typeFilter !== 'All') list = list.filter((t) => t.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) =>
        `${t.title} ${t.customer} ${t.mobile} ${t.notes || ''}`.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const aKey = a.status === 'completed' ? a.completedAt || `${a.dueDate} ${a.dueTime}` : `${a.dueDate} ${a.dueTime}`;
      const bKey = b.status === 'completed' ? b.completedAt || `${b.dueDate} ${b.dueTime}` : `${b.dueDate} ${b.dueTime}`;
      return a.status === 'completed' ? bKey.localeCompare(aKey) : aKey.localeCompare(bKey);
    });
  }, [tasks, activeTab, priorityFilter, typeFilter, searchQuery]);

  /* ---------- ACTIONS ---------- */
  const updateTask = (id, patch) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const handleStart = (t) => { updateTask(t.id, { status: 'in_progress' }); showToast(`Task started · ${t.title}`); };
  const handleComplete = (t) => { updateTask(t.id, { status: 'completed', completedAt: new Date().toISOString() }); showToast(`Task completed · ${t.title}`); };
  const handleReopen = (t) => { updateTask(t.id, { status: 'pending', completedAt: null }); showToast(`Task reopened · ${t.title}`); };

  const handleReschedule = (t, { dueDate, dueTime }) => {
    updateTask(t.id, { dueDate, dueTime });
    setShowReschedule(null);
    showToast(`Rescheduled to ${dueDate} · ${dueTime}`);
  };

  const handleSaveNote = (t, note) => {
    updateTask(t.id, { notes: (t.notes ? `${t.notes}\n` : '') + note });
    setShowNote(null);
    showToast('Note saved');
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setConfirmDelete(null);
    showToast('Task deleted', 'error');
  };

  const handleAddTask = (data) => {
    const newTask = {
      id: `t-${Date.now()}`,
      agentName: user?.name || 'Agent',
      websiteId: activeWebsiteId,
      title: data.title,
      customer: data.customer || '—',
      mobile: data.mobile || '—',
      type: data.type,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      priority: data.priority,
      status: 'pending',
      notes: data.notes || '',
    };
    setTasks((prev) => [newTask, ...prev]);
    setShowAddTask(false);
    showToast('Task added');
  };

  const handleUpdateTask = (id, data) => {
    updateTask(id, data);
    setShowEditTask(null);
    showToast('Task updated');
  };

  /* ---------- BULK ---------- */
  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.size === filteredTasks.length ? new Set() : new Set(filteredTasks.map((t) => t.id))
    );

  const handleBulkStart = () => {
    setTasks((prev) => prev.map((t) => (selectedIds.has(t.id) && t.status === 'pending' ? { ...t, status: 'in_progress' } : t)));
    showToast(`${selectedIds.size} tasks started`);
    setSelectedIds(new Set());
  };
  const handleBulkComplete = () => {
    setTasks((prev) => prev.map((t) => (selectedIds.has(t.id) ? { ...t, status: 'completed', completedAt: new Date().toISOString() } : t)));
    showToast(`${selectedIds.size} tasks completed`);
    setSelectedIds(new Set());
  };
  const handleBulkDelete = () => {
    setTasks((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    showToast(`${selectedIds.size} tasks deleted`, 'error');
    setSelectedIds(new Set());
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
            <h1 className="font-display text-xl font-semibold text-brand-ink">My Tasks</h1>
            <p className="text-sm text-brand-ink/50">
              Your operational tasks — pending → in progress → completed.
            </p>
          </div>

          <button
            onClick={() => setShowAddTask(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={14} /> New Task <span className="ml-1 rounded border border-white/40 px-1 text-[9px]">N</span>
          </button>
        </div>

        {/* ================= TODAY STATS BAR ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TodayStatCard icon={Layers}      label="Today"   value={`${summary.todayDone}/${summary.todayCount}`} sub="completed"                              color="purple" />
          <TodayStatCard icon={AlertCircle} label="Overdue" value={summary.overdue}                               sub="past due"                                color="rose" />
          <TodayStatCard icon={Timer}       label="Pending" value={summary.pending}                               sub="to start"                                color="amber" />
          <TodayStatCard icon={Zap}         label="Up Next" value={summary.nextTask ? summary.nextTask.dueTime : '—'} sub={summary.nextTask ? summary.nextTask.title.slice(0, 22) + '…' : 'nothing scheduled'} color="emerald" />
        </div>

        {/* ================= KPI STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard label="Total"       value={summary.total}      sub="All tasks"     icon={ListChecks}   color="purple"  delay={0} />
          <AnimatedStatCard label="Pending"     value={summary.pending}    sub="To start"      icon={Clock}        color="amber"   delay={40} />
          <AnimatedStatCard label="In Progress" value={summary.inProgress} sub="Working on it" icon={Play}         color="emerald" delay={80} />
          <AnimatedStatCard label="Overdue"     value={summary.overdue}    sub="Past due"      icon={AlertCircle}  color="rose"    delay={120} />
          <AnimatedStatCard label="Completed"   value={summary.completed}  sub="Done"          icon={CheckCircle2} color="emerald" delay={160} />
        </div>

        {/* ================= TABS + VIEW TOGGLE ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count =
                t.key === 'pending'     ? summary.pending :
                t.key === 'in_progress' ? summary.inProgress :
                t.key === 'completed'   ? summary.completed :
                                          summary.total;
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

            {activeTab !== 'calendar' && (
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
            )}
          </div>
        </div>

        {/* ================= CALENDAR VIEW ================= */}
        {activeTab === 'calendar' ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <TaskCalendar
                tasks={tasks}
                month={calendarMonth}
                onPrev={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                onNext={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                onToday={() => setCalendarMonth(new Date())}
                onSelectDay={(dateKey) => setCalendarDay(dateKey)}
                activeDay={calendarDay}
              />
            </div>
            <DayTasksPanel
              dateKey={calendarDay}
              tasks={tasks}
              onClear={() => setCalendarDay(null)}
              onView={(t) => setSelected(t)}
              onStart={handleStart}
              onComplete={handleComplete}
              onAddForDay={(dateKey) => { setCalendarDay(dateKey); setShowAddTask(true); }}
            />
          </div>
        ) : (
          <>
            {/* ============ SEARCH + FILTERS ============ */}
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
                label="Priority"
                icon={Flame}
                value={priorityFilter}
                options={['All', 'High', 'Medium', 'Low']}
                onChange={setPriorityFilter}
              />

              <DropdownFilter
                label="Type"
                icon={Tag}
                value={typeFilter}
                options={[{ value: 'All', label: 'All Types' }, ...TASK_TYPES]}
                onChange={setTypeFilter}
              />

              <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
                <ListFilter size={14} className="text-brand-magenta" />
                Showing: <span className="text-brand-magenta">{filteredTasks.length}</span>
              </span>
            </div>

            {/* ============ BULK SELECT BAR ============ */}
            {filteredTasks.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 rounded-full border border-brand-lilac bg-white px-4 py-2.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink/70">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredTasks.length && filteredTasks.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
                  />
                  Select all
                </label>
                <span className="text-xs text-brand-ink/50">
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${filteredTasks.length} tasks`}
                </span>

                {selectedIds.size > 0 && (
                  <div className="ml-auto flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={handleBulkStart}
                      className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-600 hover:bg-amber-100"
                    >
                      <Play size={12} /> Start
                    </button>
                    <button
                      onClick={handleBulkComplete}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-100"
                    >
                      <CheckCircle2 size={12} /> Complete
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-100"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-brand-ink/50 hover:bg-brand-lilac/40"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ============ LIST / GRID ============ */}
            {filteredTasks.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    selected={selectedIds.has(t.id)}
                    onToggleSelect={() => toggleSelect(t.id)}
                    onView={() => setSelected(t)}
                    onStart={() => handleStart(t)}
                    onComplete={() => handleComplete(t)}
                    onReopen={() => handleReopen(t)}
                    onNote={() => setShowNote(t)}
                    onReschedule={() => setShowReschedule(t)}
                    onEdit={() => setShowEditTask(t)}
                    onDelete={() => setConfirmDelete(t)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    selected={selectedIds.has(t.id)}
                    onToggleSelect={() => toggleSelect(t.id)}
                    onView={() => setSelected(t)}
                    onStart={() => handleStart(t)}
                    onComplete={() => handleComplete(t)}
                    onReopen={() => handleReopen(t)}
                    onNote={() => setShowNote(t)}
                    onReschedule={() => setShowReschedule(t)}
                    onEdit={() => setShowEditTask(t)}
                    onDelete={() => setConfirmDelete(t)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ================= DRAWER / MODALS ================= */}
        {selected && (
          <TaskDrawer
            task={selected}
            onClose={() => setSelected(null)}
            onStart={() => { handleStart(selected); setSelected(null); }}
            onComplete={() => { handleComplete(selected); setSelected(null); }}
            onReopen={() => { handleReopen(selected); setSelected(null); }}
            onNote={() => { setShowNote(selected); setSelected(null); }}
            onReschedule={() => { setShowReschedule(selected); setSelected(null); }}
            onEdit={() => { setShowEditTask(selected); setSelected(null); }}
            onDelete={() => { setConfirmDelete(selected); setSelected(null); }}
          />
        )}

        {showNote && (
          <NoteModal task={showNote} onClose={() => setShowNote(null)} onSave={handleSaveNote} />
        )}

        {showReschedule && (
          <RescheduleModal task={showReschedule} onClose={() => setShowReschedule(null)} onSave={handleReschedule} />
        )}

        {showAddTask && (
          <TaskFormModal
            title="New Task"
            defaultDate={calendarDay || undefined}
            onClose={() => setShowAddTask(false)}
            onSave={handleAddTask}
          />
        )}

        {showEditTask && (
          <TaskFormModal
            title="Edit Task"
            initial={showEditTask}
            onClose={() => setShowEditTask(null)}
            onSave={(data) => handleUpdateTask(showEditTask.id, data)}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title="Delete task?"
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
   TODAY STAT CARD
   ================================================================ */
function TodayStatCard({ icon: Icon, label, value, sub, color = 'purple' }) {
  const tones = {
    purple:  { bg: 'from-violet-500/10 to-brand-magenta/10', iconBg: 'bg-violet-100 text-brand-purple',  ring: 'border-violet-200 hover:border-violet-400' },
    emerald: { bg: 'from-emerald-500/10 to-teal-500/10',      iconBg: 'bg-emerald-100 text-emerald-600',  ring: 'border-emerald-200 hover:border-emerald-400' },
    amber:   { bg: 'from-amber-500/10 to-orange-500/10',      iconBg: 'bg-amber-100 text-amber-600',      ring: 'border-amber-200 hover:border-amber-400' },
    rose:    { bg: 'from-rose-500/10 to-pink-500/10',         iconBg: 'bg-rose-100 text-brand-magenta',   ring: 'border-rose-200 hover:border-rose-400' },
  };
  const t = tones[color];
  return (
    <div className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 ${t.ring}`}>
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
          <p className="font-display text-lg font-bold leading-tight text-brand-ink">{value}</p>
          <p className="truncate text-[10px] text-brand-ink/50">{sub}</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TASK ROW — no dropdown, full View Details button
   ================================================================ */
function TaskRow({
  task, selected, onToggleSelect,
  onView, onStart, onComplete, onReopen, onNote, onReschedule, onEdit, onDelete,
}) {
  const t = task;
  const meta = TYPE_META[t.type] || TYPE_META.other;
  const Icon = meta.icon;
  const isDone = t.status === 'completed';
  const overdue = isOverdue(t);

  return (
    <div className={`group relative flex flex-wrap items-center gap-3 rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
      overdue ? 'border-rose-200 hover:border-rose-400' : 'border-brand-lilac/70 hover:border-brand-magenta/40'
    } ${selected ? 'bg-brand-mist/60' : ''}`}>
      <button
        onClick={onToggleSelect}
        className="flex h-5 w-5 shrink-0 items-center justify-center"
      >
        {selected
          ? <CheckSquare size={16} className="text-brand-magenta" />
          : <Square size={16} className="text-brand-ink/30" />
        }
      </button>

      <div className={`flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-lg ${
        overdue ? 'bg-rose-100' : 'bg-gradient-to-br from-brand-magenta/10 to-brand-purple/10'
      }`}>
        <p className={`font-display text-sm font-bold ${overdue ? 'text-rose-600' : 'text-brand-ink'}`}>{t.dueTime}</p>
        <p className={`font-mono text-[9px] uppercase tracking-wide ${overdue ? 'text-rose-500' : 'text-brand-ink/50'}`}>
          {t.dueDate.slice(5)}
        </p>
      </div>

      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.tint}`}>
        <Icon size={15} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta"
          >
            {t.title}
          </button>
          {overdue && (
            <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-600">
              Overdue
            </span>
          )}
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[t.priority]}`}>
            {t.priority}
          </span>
        </div>
        <p className="truncate text-xs text-brand-ink/50">
          {t.customer !== '—' ? `${t.customer} · ${t.mobile} · ` : ''}{meta.label}
        </p>
      </div>

      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${STATUS_STYLES[t.status]}`}>
        {t.status.replace('_', ' ')}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        {t.status === 'pending' && (
          <button
            onClick={onStart}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 px-3 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
          >
            <Play size={12} /> Start
          </button>
        )}
        {t.status === 'in_progress' && (
          <button
            onClick={onComplete}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple px-3 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
          >
            <CheckCircle2 size={12} /> Done
          </button>
        )}
        {isDone && (
          <button
            onClick={onReopen}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-3 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <RotateCcw size={12} /> Reopen
          </button>
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
   TASK CARD — no dropdown, View Details button
   ================================================================ */
function TaskCard({
  task, selected, onToggleSelect,
  onView, onStart, onComplete, onReopen, onNote, onReschedule, onEdit, onDelete,
}) {
  const t = task;
  const meta = TYPE_META[t.type] || TYPE_META.other;
  const Icon = meta.icon;
  const isDone = t.status === 'completed';
  const overdue = isOverdue(t);

  return (
    <div className={`group relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)] ${
      overdue ? 'border-rose-200 hover:border-rose-400' : 'border-brand-lilac/80 hover:border-brand-magenta/50'
    } ${selected ? 'ring-2 ring-brand-magenta/30' : ''}`}>

      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-2xl">
        <span className={`block h-full w-full origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100 ${
          overdue ? 'from-rose-500 to-brand-magenta' : 'from-brand-magenta to-brand-purple'
        }`} />
      </span>

      <div className="relative flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={onToggleSelect}
            className="flex h-5 w-5 shrink-0 items-center justify-center"
          >
            {selected
              ? <CheckSquare size={16} className="text-brand-magenta" />
              : <Square size={16} className="text-brand-ink/30" />
            }
          </button>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${STATUS_STYLES[t.status]}`}>
            {t.status.replace('_', ' ')}
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between">
          <div>
            <p className={`font-display text-lg font-bold leading-tight ${overdue ? 'text-rose-600' : 'text-brand-ink'}`}>
              {t.dueTime}
            </p>
            <p className={`font-mono text-[10px] uppercase tracking-wide ${overdue ? 'text-rose-500' : 'text-brand-ink/50'}`}>
              {t.dueDate}
            </p>
          </div>
          {overdue && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-600">
              Overdue
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.tint}`}>
            <Icon size={14} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-ink/50">
            {meta.label}
          </span>
        </div>

        <button
          onClick={onView}
          className="mt-3 line-clamp-2 text-left text-sm font-semibold text-brand-ink hover:text-brand-magenta"
        >
          {t.title}
        </button>
        <p className="mt-1 truncate text-[11px] text-brand-ink/50">
          {t.customer !== '—' ? `${t.customer} · ${t.mobile}` : 'No customer assigned'}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[t.priority]}`}>
            {t.priority}
          </span>
          {t.notes && (
            <span className="truncate text-[10px] text-brand-ink/50">📝 {t.notes}</span>
          )}
        </div>

        {!isDone ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {t.status === 'pending' ? (
              <button
                onClick={onStart}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Play size={12} /> Start
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <CheckCircle2 size={12} /> Done
              </button>
            )}
            <button
              onClick={onNote}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <StickyNote size={12} /> Note
            </button>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
            <CheckCircle2 size={12} /> Completed
          </div>
        )}

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
   TASK CALENDAR
   ================================================================ */
function TaskCalendar({ tasks, month, onPrev, onNext, onToday, onSelectDay, activeDay }) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startWeekday = monthStart.getDay();

  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) days.push(new Date(month.getFullYear(), month.getMonth(), d));

  const byDate = tasks.reduce((acc, t) => {
    if (!acc[t.dueDate]) acc[t.dueDate] = [];
    acc[t.dueDate].push(t);
    return acc;
  }, {});

  const todayStr = ymd(new Date());
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const densityTint = (count, isToday) => {
    if (isToday) return 'bg-brand-magenta/[0.06]';
    if (count === 0) return 'hover:bg-brand-mist/40';
    if (count === 1) return 'bg-brand-lilac/[0.15] hover:bg-brand-lilac/30';
    if (count <= 3) return 'bg-brand-lilac/[0.30] hover:bg-brand-lilac/40';
    return 'bg-brand-lilac/[0.55] hover:bg-brand-lilac/60';
  };

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-brand-lilac/60 bg-gradient-to-r from-brand-magenta/[0.05] to-brand-purple/[0.05] px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
            Task Calendar
          </p>
          <h2 className="font-display text-base font-bold text-brand-ink">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToday}
            className="mr-1 rounded-lg border border-brand-lilac bg-white px-3 py-2 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Today
          </button>
          <button
            onClick={onPrev}
            className="rounded-lg border border-brand-lilac bg-white p-2 text-brand-ink/60 hover:bg-brand-lilac/40"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={onNext}
            className="rounded-lg border border-brand-lilac bg-white p-2 text-brand-ink/60 hover:bg-brand-lilac/40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-brand-lilac/60 bg-brand-mist/40">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((date, idx) => {
          if (!date) {
            return (
              <div
                key={idx}
                className="min-h-[112px] border-b border-r border-brand-lilac/40 bg-brand-mist/20"
              />
            );
          }
          const key = ymd(date);
          const items = byDate[key] || [];
          const isTod = key === todayStr;
          const isActive = key === activeDay;
          const overdueCount = items.filter(isOverdue).length;

          return (
            <button
              key={idx}
              onClick={() => onSelectDay(key)}
              className={`min-h-[112px] border-b border-r border-brand-lilac/40 p-1.5 text-left transition-all ${densityTint(items.length, isTod)} ${
                isActive ? 'ring-2 ring-inset ring-brand-magenta' : ''
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={`font-bold ${isTod ? 'text-brand-magenta' : 'text-brand-ink/60'} ${
                  isTod ? 'text-[13px]' : 'text-[11px]'
                }`}>
                  {date.getDate()}
                </span>
                {overdueCount > 0 && (
                  <span className="rounded-full bg-rose-100 px-1.5 text-[9px] font-bold text-rose-600">
                    {overdueCount}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {items.slice(0, 2).map((t) => {
                  const meta = TYPE_META[t.type] || TYPE_META.other;
                  const TIcon = meta.icon;
                  const over = isOverdue(t);
                  const done = t.status === 'completed';
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-left text-[10px] font-semibold ${
                        done ? 'bg-emerald-100 text-emerald-600' :
                        over ? 'bg-rose-100 text-rose-600' :
                               'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <TIcon size={9} />
                      <span className="font-mono">{t.dueTime}</span>
                      <span className="truncate">{t.title}</span>
                    </div>
                  );
                })}
                {items.length > 2 && (
                  <p className="pl-1 text-[10px] font-semibold text-brand-magenta">
                    +{items.length - 2} more
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   DAY TASKS PANEL
   ================================================================ */
function DayTasksPanel({ dateKey, tasks, onClear, onView, onStart, onComplete, onAddForDay }) {
  const dayTasks = useMemo(() => {
    if (!dateKey) return [];
    return [...tasks]
      .filter((t) => t.dueDate === dateKey)
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  }, [tasks, dateKey]);

  const prettyDate = dateKey
    ? new Date(...dateKey.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v)))).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  if (!dateKey) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center xl:sticky xl:top-4 xl:self-start">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
          <Calendar size={22} />
        </span>
        <p className="font-display text-base font-semibold text-brand-ink">Pick a day</p>
        <p className="max-w-[220px] text-xs text-brand-ink/50">
          Click any date on the calendar to see all tasks scheduled for that day.
        </p>
      </div>
    );
  }

  return (
    <div className="card !p-0 overflow-hidden xl:sticky xl:top-4 xl:self-start">
      <div className="flex items-start justify-between gap-2 border-b border-brand-lilac/60 bg-gradient-to-r from-brand-magenta/[0.05] to-brand-purple/[0.05] px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">Selected Day</p>
          <p className="truncate font-display text-sm font-bold text-brand-ink">{prettyDate}</p>
          <p className="text-[10px] text-brand-ink/50">
            {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClear}
          className="rounded-lg p-1.5 text-brand-ink/50 hover:bg-brand-lilac"
          title="Clear selection"
        >
          <X size={14} />
        </button>
      </div>

      <div className="max-h-[560px] overflow-y-auto p-3">
        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
              <Inbox size={18} />
            </span>
            <p className="text-xs font-semibold text-brand-ink">No tasks for this day</p>
            <button
              onClick={() => onAddForDay(dateKey)}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
            >
              <Plus size={11} /> Add Task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {dayTasks.map((t) => {
              const meta = TYPE_META[t.type] || TYPE_META.other;
              const TIcon = meta.icon;
              const over = isOverdue(t);
              const done = t.status === 'completed';

              return (
                <div
                  key={t.id}
                  className={`rounded-xl border-2 bg-white p-2.5 transition-all hover:shadow-sm ${
                    over ? 'border-rose-200' : done ? 'border-emerald-200' : 'border-brand-lilac/70'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.tint}`}>
                      <TIcon size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onView(t)}
                          className="truncate text-xs font-semibold text-brand-ink hover:text-brand-magenta"
                        >
                          {t.title}
                        </button>
                        {over && (
                          <span className="shrink-0 rounded-full bg-rose-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-rose-600">
                            Late
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[10px] text-brand-ink/50">
                        {t.dueTime} · {t.customer !== '—' ? t.customer : meta.label}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1.5">
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[t.priority]}`}>
                      {t.priority}
                    </span>
                    <div className="flex items-center gap-1">
                      {!done && t.status === 'pending' && (
                        <button
                          onClick={() => onStart(t)}
                          className="rounded-md bg-gradient-to-br from-amber-500 to-orange-500 p-1.5 text-white shadow-sm hover:scale-105"
                          title="Start"
                        >
                          <Play size={10} />
                        </button>
                      )}
                      {!done && (
                        <button
                          onClick={() => onComplete(t)}
                          className="rounded-md bg-gradient-to-br from-brand-magenta to-brand-purple p-1.5 text-white shadow-sm hover:scale-105"
                          title="Complete"
                        >
                          <CheckCircle2 size={10} />
                        </button>
                      )}
                      {done && (
                        <span className="rounded-md bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-600">
                          DONE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => onAddForDay(dateKey)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-brand-lilac bg-white py-2.5 text-[11px] font-semibold text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta"
            >
              <Plus size={12} /> Add Task for this day
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   TASK DRAWER — all secondary actions live here now
   ================================================================ */
function TaskDrawer({ task, onClose, onStart, onComplete, onReopen, onNote, onReschedule, onEdit, onDelete }) {
  const t = task;
  const meta = TYPE_META[t.type] || TYPE_META.other;
  const Icon = meta.icon;
  const isDone = t.status === 'completed';
  const isPending = t.status === 'pending';
  const isInProgress = t.status === 'in_progress';
  const overdue = isOverdue(t);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">Task</p>
            <h3 className="font-display text-lg font-semibold text-brand-ink">Task Details</h3>
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
              <p className="font-semibold text-brand-ink">{t.title}</p>
              <p className="text-xs text-brand-ink/50">
                {t.customer !== '—' ? `${t.customer} · ${t.mobile}` : 'No customer assigned'}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[t.status]}`}>
              {t.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${PRIORITY_STYLES[t.priority]}`}>
              <Flame size={11} /> {t.priority} Priority
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 text-[11px] font-semibold text-brand-ink/70">
              <Icon size={11} /> {meta.label}
            </span>
            {overdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold uppercase text-rose-600">
                <AlertCircle size={11} /> Overdue
              </span>
            )}
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Task Details</h4>
            <Row icon={Calendar}  label="Due Date" value={t.dueDate} />
            <Row icon={Clock}     label="Due Time" value={t.dueTime} />
            <Row icon={User}      label="Customer" value={t.customer} />
            <Row icon={Phone}     label="Mobile"   value={t.mobile} />
            <Row icon={Tag}       label="Type"     value={meta.label} />
          </div>

          {t.notes && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">Notes</p>
              <p className="whitespace-pre-line text-sm text-brand-ink/80">{t.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {isPending && (
              <button
                onClick={onStart}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                <Play size={16} /> Start Task
              </button>
            )}
            {isInProgress && (
              <button
                onClick={onComplete}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                <CheckCircle2 size={16} /> Mark Complete
              </button>
            )}
            {isDone && (
              <button
                onClick={onReopen}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <RotateCcw size={16} /> Reopen Task
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onReschedule}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <Calendar size={12} /> Reschedule
            </button>
            <button
              onClick={onNote}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <StickyNote size={12} /> Add Note
            </button>
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <ListChecks size={12} /> Edit
            </button>
          </div>

          <button
            onClick={onDelete}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-100"
          >
            <Trash2 size={12} /> Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TASK FORM MODAL
   ================================================================ */
function TaskFormModal({ title, initial, defaultDate, onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title:      initial?.title || '',
    customer:   initial?.customer && initial.customer !== '—' ? initial.customer : '',
    mobile:     initial?.mobile && initial.mobile !== '—' ? initial.mobile : '',
    type:       initial?.type || 'call',
    dueDate:    initial?.dueDate || defaultDate || today,
    dueTime:    initial?.dueTime || '10:00',
    priority:   initial?.priority || 'Medium',
    notes:      initial?.notes || '',
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim()) return setError('Task title is required.');
    if (!form.dueDate) return setError('Due date is required.');
    setError('');
    onSave({
      ...form,
      customer: form.customer.trim() || '—',
      mobile: form.mobile.trim() || '—',
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <ListChecks size={18} />
            </div>
            <h3 className="font-display text-lg font-semibold text-brand-ink">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Task Title *" value={form.title} onChange={(v) => set('title', v)} placeholder="e.g. Call customer about proposal" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer / Lead" value={form.customer} onChange={(v) => set('customer', v)} placeholder="optional" />
            <Field label="Mobile" value={form.mobile} onChange={(v) => set('mobile', v.replace(/\D/g, '').slice(0, 10))} placeholder="optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Task Type" value={form.type} onChange={(v) => set('type', v)} options={TASK_TYPES} />
            <SelectField
              label="Priority"
              value={form.priority}
              onChange={(v) => set('priority', v)}
              options={[{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due Date" type="date" value={form.dueDate} onChange={(v) => set('dueDate', v)} />
            <Field label="Due Time" type="time" value={form.dueTime} onChange={(v) => set('dueTime', v)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Any context for this task..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">{error}</div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              {initial ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   NOTE MODAL
   ================================================================ */
function NoteModal({ task, onClose, onSave }) {
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
              <p className="text-xs text-brand-ink/50">{task.title}</p>
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
          placeholder="Add context for this task..."
          className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />

        {task.notes && (
          <div className="mt-4 max-h-40 overflow-y-auto">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">Previous notes</p>
            <p className="whitespace-pre-line rounded-lg border border-brand-lilac/60 bg-brand-mist/40 p-2.5 text-xs text-brand-ink/70">
              {task.notes}
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
            onClick={() => text.trim() && onSave(task, text.trim())}
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
function RescheduleModal({ task, onClose, onSave }) {
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [dueTime, setDueTime] = useState(task.dueTime);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Reschedule Task</h3>
              <p className="text-xs text-brand-ink/50">{task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
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
              onClick={() => onSave(task, { dueDate, dueTime })}
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
    pending:     'No pending tasks',
    in_progress: 'No tasks in progress',
    completed:   'No completed tasks yet',
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
        Tasks appear here as you or your administrator creates them.
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
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-48 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
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
   FORM FIELDS
   ================================================================ */
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

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
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