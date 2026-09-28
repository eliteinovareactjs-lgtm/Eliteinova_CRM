// src/pages/admin/Tasks.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, Plus, X, Search, Filter,
  ChevronDown, MoreVertical, Eye, Pencil, Trash2, Save, AlertCircle,
  Calendar, Bell, Flag, ListFilter, User as UserIcon, Timer, Zap,
  CalendarClock, Repeat, Star, ArrowRight, Info, Layers, Target,
  Check, BellRing, MessageSquare, PhoneCall, PhoneMissed, UserPlus,
  Megaphone, CircleDot, Send, AtSign, Radio, FileText, Hash, Copy,
  StickyNote, ClipboardList, Users, Sparkles, RotateCcw, Download,
  PhoneIncoming, PhoneOutgoing, Mail, MessageCircle, XCircle, Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  TASKS as INITIAL_TASKS,
  REMINDERS as INITIAL_REMINDERS,
  NOTIFICATIONS as INITIAL_NOTIFICATIONS,
  AGENTS,
} from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

const REMINDER_TYPES = [
  { key: 'Call',       label: 'Call Reminder',      icon: PhoneCall,    tone: 'purple' },
  { key: 'Follow-up',  label: 'Follow-up Reminder', icon: Repeat,       tone: 'amber' },
  { key: 'Customer',   label: 'Customer Reminder',  icon: Users,        tone: 'rose' },
  { key: 'Task',       label: 'Task Reminder',      icon: ClipboardList, tone: 'emerald' },
];

const NOTIFICATION_TYPES = [
  { key: 'new_lead',   label: 'New Lead Alert',       icon: Sparkles,    tone: 'purple' },
  { key: 'missed_call',label: 'Missed Call Alert',    icon: PhoneMissed, tone: 'rose' },
  { key: 'assignment', label: 'Assignment',           icon: UserPlus,    tone: 'emerald' },
  { key: 'follow_up',  label: 'Follow-up Reminder',   icon: Calendar,    tone: 'amber' },
  { key: 'agent',      label: 'Agent Notification',   icon: UserIcon,    tone: 'purple' },
  { key: 'campaign',   label: 'Campaign Update',      icon: Megaphone,   tone: 'emerald' },
];

const TABS = [
  { key: 'tasks',         label: 'Tasks',         icon: CheckCircle2 },
  { key: 'reminders',     label: 'Reminders',     icon: Bell },
  { key: 'notifications', label: 'Notifications', icon: Zap },
];

const PRIORITY_STYLES = {
  Low:    'bg-gray-100 text-gray-600 border-gray-200',
  Medium: 'bg-blue-100 text-blue-600 border-blue-200',
  High:   'bg-amber-100 text-amber-600 border-amber-200',
  Urgent: 'bg-rose-100 text-rose-600 border-rose-200',
};

const TASK_STATUS_STYLES = {
  Pending:       'bg-amber-100 text-amber-600',
  'In Progress': 'bg-violet-100 text-brand-purple',
  Completed:     'bg-emerald-100 text-emerald-600',
  Cancelled:     'bg-gray-100 text-gray-500',
};

const TONE_CLASSES = {
  purple:  { chip: 'bg-violet-100 text-brand-purple',  icon: 'bg-violet-100 text-brand-purple' },
  emerald: { chip: 'bg-emerald-100 text-emerald-600',  icon: 'bg-emerald-100 text-emerald-600' },
  amber:   { chip: 'bg-amber-100 text-amber-600',      icon: 'bg-amber-100 text-amber-600' },
  rose:    { chip: 'bg-rose-100 text-brand-magenta',   icon: 'bg-rose-100 text-brand-magenta' },
};

const STORAGE_PREFIX = 'tasks:';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const today = () => new Date().toISOString().slice(0, 10);

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

const formatRelative = (iso) => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Tasks() {
  const { activeWebsiteId, activeWebsite, user } = useAuth();

  /* ── Load with localStorage ── */
  const [tasks, setTasks] = useState(() =>
    loadState(
      `list:${activeWebsiteId}`,
      INITIAL_TASKS.filter((t) => t.projectId === activeWebsiteId).map((t) => ({ ...t }))
    )
  );
  const [reminders, setReminders] = useState(() =>
    loadState(
      `reminders:${activeWebsiteId}`,
      INITIAL_REMINDERS.filter((r) => r.projectId === activeWebsiteId).map((r) => ({ ...r }))
    )
  );
  const [notifications, setNotifications] = useState(() =>
    loadState(
      `notifications:${activeWebsiteId}`,
      INITIAL_NOTIFICATIONS.filter((n) => n.projectId === activeWebsiteId).map((n) => ({ ...n }))
    )
  );

  useEffect(() => {
    setTasks(loadState(`list:${activeWebsiteId}`, INITIAL_TASKS.filter((t) => t.projectId === activeWebsiteId).map((t) => ({ ...t }))));
    setReminders(loadState(`reminders:${activeWebsiteId}`, INITIAL_REMINDERS.filter((r) => r.projectId === activeWebsiteId).map((r) => ({ ...r }))));
    setNotifications(loadState(`notifications:${activeWebsiteId}`, INITIAL_NOTIFICATIONS.filter((n) => n.projectId === activeWebsiteId).map((n) => ({ ...n }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebsiteId]);

  useEffect(() => { saveState(`list:${activeWebsiteId}`, tasks); }, [tasks, activeWebsiteId]);
  useEffect(() => { saveState(`reminders:${activeWebsiteId}`, reminders); }, [reminders, activeWebsiteId]);
  useEffect(() => { saveState(`notifications:${activeWebsiteId}`, notifications); }, [notifications, activeWebsiteId]);

  /* State */
  const [tab, setTab] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [toast, setToast] = useState(null);

  /* Modals */
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  /* ── Filtered tasks ── */
  const filteredTasks = useMemo(() => {
    let rows = [...tasks];
    if (statusFilter !== 'All') rows = rows.filter((t) => t.status === statusFilter);
    if (priorityFilter !== 'All') rows = rows.filter((t) => t.priority === priorityFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((t) =>
        `${t.title} ${t.description} ${t.assignedTo}`.toLowerCase().includes(q)
      );
    }
    const statusPriority = { 'In Progress': 0, Pending: 1, Completed: 2, Cancelled: 3 };
    return rows.sort((a, b) => {
      const p = (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9);
      if (p !== 0) return p;
      return String(a.dueDate).localeCompare(String(b.dueDate));
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  const summary = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const overdue = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled' && t.dueDate < today()).length;
    const urgent = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed').length;
    const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
    const upcomingReminders = reminders.filter((r) => r.status === 'Upcoming').length;
    const unreadNotifs = notifications.filter((n) => !n.read).length;
    return { total, pending, inProgress, completed, overdue, urgent, completion, upcomingReminders, unreadNotifs };
  }, [tasks, reminders, notifications]);

  /* ── Task actions ── */
  const handleCreateTask = (data) => {
    const newTask = {
      id: 'TSK-' + String(Date.now()).slice(-4),
      projectId: activeWebsiteId,
      ...data,
      createdAt: today(),
      status: data.status || 'Pending',
    };
    setTasks((prev) => [newTask, ...prev]);
    setShowTaskModal(false);
    showToast(`Task "${data.title}" created`);
  };

  const handleEditTask = (id, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    setEditingTask(null);
    setShowTaskModal(false);
    showToast('Task updated');
  };

  const handleDeleteTask = (id) => {
    const t = tasks.find((x) => x.id === id);
    setTasks((prev) => prev.filter((x) => x.id !== id));
    setConfirmDelete(null);
    showToast(`Task "${t?.title || ''}" deleted`, 'error');
  };

  const handleCompleteTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Completed' } : t)));
    showToast('Task marked complete');
  };

  /* ── Reminder actions ── */
  const handleCreateReminder = (data) => {
    const newReminder = {
      id: uid('rem'),
      projectId: activeWebsiteId,
      ...data,
      status: 'Upcoming',
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newReminder, ...prev]);
    setShowReminderModal(false);
    showToast(`Reminder "${data.title}" created`);
  };

  const handleCompleteReminder = (id) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Completed' } : r)));
    showToast('Reminder marked complete');
  };

  const handleDeleteReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    showToast('Reminder deleted', 'error');
  };

  /* ── Notification actions ── */
  const handleCreateNotification = (data) => {
    const newNotif = {
      id: uid('notif'),
      projectId: activeWebsiteId,
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
      time: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setShowNotificationModal(false);
    showToast('Notification sent');
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification deleted', 'error');
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    showToast('All notifications cleared', 'error');
  };

  const hasFilters = searchQuery || statusFilter !== 'All' || priorityFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Tasks &amp; Reminders</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <CheckCircle2 size={13} className="text-brand-magenta" />
              Stay on top of your work for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tab === 'tasks' && (
              <button
                onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <Plus size={14} className="transition-transform group-hover:rotate-90" /> New Task
              </button>
            )}
            {tab === 'reminders' && (
              <button
                onClick={() => setShowReminderModal(true)}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <Plus size={14} className="transition-transform group-hover:rotate-90" /> New Reminder
              </button>
            )}
            {tab === 'notifications' && (
              <button
                onClick={() => setShowNotificationModal(true)}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <Plus size={14} className="transition-transform group-hover:rotate-90" /> Send Notification
              </button>
            )}
          </div>
        </div>

        {/* ═══ KPI STRIP ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Workspace</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
            <p className="text-[11px] text-brand-ink/40">Click a card to switch tab</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <KpiCard icon={Layers}         label="Total Tasks"       value={summary.total}             sub={`${summary.completion}% completion`} color="purple" active={tab === 'tasks'}         onClick={() => setTab('tasks')}         delay={0} />
            <KpiCard icon={Timer}          label="In Progress"       value={summary.inProgress}        sub={`${summary.pending} pending`}          color="emerald" active={false}                 onClick={() => setTab('tasks')}         delay={40} />
            <KpiCard icon={AlertTriangle}  label="Overdue"           value={summary.overdue}           sub="Needs attention"                        color="rose"   active={false}                 onClick={() => setTab('tasks')}         delay={80} />
            <KpiCard icon={Flag}           label="Urgent"            value={summary.urgent}            sub="High priority"                          color="amber"  active={false}                 onClick={() => setTab('tasks')}         delay={120} />
            <KpiCard icon={Bell}           label="Upcoming Reminders" value={summary.upcomingReminders} sub="Scheduled"                            color="purple" active={tab === 'reminders'}   onClick={() => setTab('reminders')}     delay={160} />
            <KpiCard icon={Zap}            label="Unread Alerts"     value={summary.unreadNotifs}      sub="Notifications"                          color="rose"   active={tab === 'notifications'} onClick={() => setTab('notifications')} delay={200} />
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              const count = key === 'tasks' ? tasks.length : key === 'reminders' ? reminders.length : notifications.length;
              const badge = key === 'notifications' && unreadNotifs > 0 ? unreadNotifs : null;
              return (
                <button
                  key={key}
                  onClick={() => { setTab(key); setSearchQuery(''); setStatusFilter('All'); setPriorityFilter('All'); }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/25 text-white' : badge ? 'bg-brand-magenta text-white' : 'bg-brand-lilac/70 text-brand-purple'}`}>
                    {badge || count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ FILTER BAR (tasks only) ═══ */}
        {tab === 'tasks' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or assignee…"
                className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac">
                  <X size={14} className="text-brand-ink/50" />
                </button>
              )}
            </div>

            <DropdownFilter
              label="Status" icon={ListFilter} value={statusFilter}
              options={['All', ...TASK_STATUSES]}
              open={statusOpen}
              onToggle={() => { setStatusOpen((s) => !s); setPriorityOpen(false); }}
              onChange={(v) => { setStatusFilter(v); setStatusOpen(false); }}
            />
            <DropdownFilter
              label="Priority" icon={Flag} value={priorityFilter}
              options={['All', ...PRIORITIES]}
              open={priorityOpen}
              onToggle={() => { setPriorityOpen((s) => !s); setStatusOpen(false); }}
              onChange={(v) => { setPriorityFilter(v); setPriorityOpen(false); }}
            />

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}

        {/* ═══ TAB CONTENT ═══ */}
        {tab === 'tasks' && (
          <TasksTab
            tasks={filteredTasks}
            hasFilters={hasFilters}
            onClear={clearFilters}
            onView={setViewingTask}
            onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }}
            onDelete={(t) => setConfirmDelete(t)}
            onComplete={(t) => handleCompleteTask(t.id)}
            onCreate={() => { setEditingTask(null); setShowTaskModal(true); }}
          />
        )}

        {tab === 'reminders' && (
          <RemindersTab
            reminders={reminders}
            onCreate={() => setShowReminderModal(true)}
            onComplete={handleCompleteReminder}
            onDelete={handleDeleteReminder}
          />
        )}

        {tab === 'notifications' && (
          <NotificationsTab
            notifications={notifications}
            unreadCount={unreadNotifs}
            onCreate={() => setShowNotificationModal(true)}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDelete={handleDeleteNotification}
            onClearAll={handleClearAllNotifications}
          />
        )}

        {/* ═══ MODALS ═══ */}
        {showTaskModal && (
          <TaskModal
            mode={editingTask ? 'edit' : 'create'}
            initial={editingTask || {}}
            agents={agents}
            onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
            onSubmit={(data) => (editingTask ? handleEditTask(editingTask.id, data) : handleCreateTask(data))}
          />
        )}

        {viewingTask && (
          <TaskDetailsDrawer
            task={viewingTask}
            onClose={() => setViewingTask(null)}
            onEdit={() => { setEditingTask(viewingTask); setViewingTask(null); setShowTaskModal(true); }}
            onComplete={() => { handleCompleteTask(viewingTask.id); setViewingTask(null); }}
          />
        )}

        {showReminderModal && (
          <ReminderModal
            agents={agents}
            onClose={() => setShowReminderModal(false)}
            onSubmit={handleCreateReminder}
          />
        )}

        {showNotificationModal && (
          <NotificationModal
            agents={agents}
            onClose={() => setShowNotificationModal(false)}
            onSubmit={handleCreateNotification}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title="Delete task?"
            message={`This will permanently delete "${confirmDelete.title}". This action cannot be undone.`}
            confirmLabel="Delete Task"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDeleteTask(confirmDelete.id)}
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
  const t = themes[color];

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
   DROPDOWN FILTER
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
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-48 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${value === o ? 'bg-brand-magenta/10 font-semibold text-brand-magenta' : 'text-brand-ink/70 hover:bg-brand-lilac/40'}`}
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

/* ═══════════════════════════════════════════════════════════════
   TASKS TAB
   ═══════════════════════════════════════════════════════════════ */
function TasksTab({ tasks, hasFilters, onClear, onView, onEdit, onDelete, onComplete, onCreate }) {
  if (tasks.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
          <CheckCircle2 size={22} />
        </span>
        <p className="font-display text-base font-semibold text-brand-ink">
          {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
        </p>
        <p className="max-w-sm text-sm text-brand-ink/50">
          {hasFilters ? (
            <button onClick={onClear} className="font-semibold text-brand-magenta hover:underline">
              Clear all filters
            </button>
          ) : (
            'Create your first task to stay organized.'
          )}
        </p>
        {!hasFilters && (
          <button
            onClick={onCreate}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={16} /> Create Task
          </button>
        )}
      </div>
    );
  }

  const todayStr = today();

  return (
    <div className="space-y-2">
      {tasks.map((t) => {
        const isOverdue = t.status !== 'Completed' && t.status !== 'Cancelled' && t.dueDate < todayStr;
        const isCompleted = t.status === 'Completed';
        const isCancelled = t.status === 'Cancelled';
        const isUrgent = t.priority === 'Urgent';

        return (
          <div
            key={t.id}
            className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-nowrap ${
              isOverdue ? 'border-rose-200 hover:border-rose-300'
              : isCompleted ? 'border-emerald-200 hover:border-emerald-300'
              : isUrgent ? 'border-amber-200 hover:border-amber-300'
              : 'border-brand-lilac/70 hover:border-brand-magenta/40'
            }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => !isCompleted && !isCancelled && onComplete()}
              disabled={isCompleted || isCancelled}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                isCompleted ? 'border-emerald-500 bg-emerald-500 text-white'
                : isCancelled ? 'cursor-not-allowed border-gray-200 bg-gray-100'
                : 'border-brand-lilac hover:border-brand-magenta hover:bg-brand-magenta/5'
              }`}
            >
              {isCompleted && <Check size={14} />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onView(t)}
                  className={`truncate text-left text-sm font-semibold hover:text-brand-magenta ${
                    isCompleted || isCancelled ? 'text-brand-ink/50 line-through' : 'text-brand-ink'
                  }`}
                >
                  {t.title}
                </button>
                {isOverdue && (
                  <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-600">
                    OVERDUE
                  </span>
                )}
              </div>
              <p className="truncate text-[11px] text-brand-ink/50">{t.description}</p>
            </div>

            <div className="hidden shrink-0 text-xs md:block">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Assigned</p>
              <p className="truncate font-semibold text-brand-ink/70">{t.assignedTo}</p>
            </div>

            <div className="hidden shrink-0 text-xs lg:block">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Due</p>
              <p className={`font-semibold tabular-nums ${isOverdue ? 'text-rose-500' : 'text-brand-ink/70'}`}>{t.dueDate}</p>
            </div>

            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.Medium}`}>
              {t.priority.toUpperCase()}
            </span>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${TASK_STATUS_STYLES[t.status] || 'bg-brand-lilac text-brand-purple'}`}>
              {t.status.toUpperCase()}
            </span>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => onView(t)}
                className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta sm:flex"
                title="View"
              >
                <Eye size={13} />
              </button>
              <button
                onClick={() => onEdit(t)}
                className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta sm:flex"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(t)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-500 transition-all hover:bg-rose-50"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REMINDERS TAB
   ═══════════════════════════════════════════════════════════════ */
function RemindersTab({ reminders, onCreate, onComplete, onDelete }) {
  const upcoming = reminders.filter((r) => r.status === 'Upcoming');
  const completed = reminders.filter((r) => r.status === 'Completed');

  if (reminders.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
          <Bell size={22} />
        </span>
        <p className="font-display text-base font-semibold text-brand-ink">No reminders yet</p>
        <p className="max-w-sm text-sm text-brand-ink/50">
          Create reminders for calls, follow-ups, customer meetings, or tasks.
        </p>
        <button
          onClick={onCreate}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={16} /> Create Reminder
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Upcoming section */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Upcoming</p>
              <h3 className="font-display text-sm font-semibold text-brand-ink">{upcoming.length} reminder{upcoming.length !== 1 ? 's' : ''}</h3>
            </div>
          </div>
          {upcoming.map((r) => <ReminderRow key={r.id} reminder={r} onComplete={onComplete} onDelete={onDelete} />)}
        </div>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-emerald-400" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-600">Completed</p>
              <h3 className="font-display text-sm font-semibold text-brand-ink">{completed.length} reminder{completed.length !== 1 ? 's' : ''}</h3>
            </div>
          </div>
          {completed.map((r) => <ReminderRow key={r.id} reminder={r} onComplete={onComplete} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

function ReminderRow({ reminder: r, onComplete, onDelete }) {
  const config = REMINDER_TYPES.find((t) => t.key === r.type) || REMINDER_TYPES[0];
  const Icon = config.icon;
  const tone = TONE_CLASSES[config.tone];
  const isCompleted = r.status === 'Completed';

  return (
    <div className={`group flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-nowrap ${
      isCompleted ? 'border-emerald-200' : 'border-brand-lilac/70 hover:border-brand-magenta/40'
    }`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isCompleted ? 'bg-emerald-100 text-emerald-600' : tone.icon}`}>
        {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${isCompleted ? 'text-brand-ink/50 line-through' : 'text-brand-ink'}`}>
          {r.title}
        </p>
        <p className="truncate text-[11px] text-brand-ink/50">
          {r.time} {r.assignedTo && `· ${r.assignedTo}`}
        </p>
      </div>

      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone.chip}`}>
        {config.label}
      </span>

      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
      }`}>
        {r.status}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        {!isCompleted && (
          <button
            onClick={() => onComplete(r.id)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-[11px] font-semibold text-brand-purple hover:bg-violet-100"
          >
            <Check size={12} /> Done
          </button>
        )}
        <button
          onClick={() => onDelete(r.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-500 hover:bg-rose-50"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATIONS TAB
   ═══════════════════════════════════════════════════════════════ */
function NotificationsTab({ notifications, unreadCount, onCreate, onMarkRead, onMarkAllRead, onDelete, onClearAll }) {
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  if (notifications.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
          <Zap size={22} />
        </span>
        <p className="font-display text-base font-semibold text-brand-ink">No notifications yet</p>
        <p className="max-w-sm text-sm text-brand-ink/50">
          Send notifications to your team or they'll appear here automatically.
        </p>
        <button
          onClick={onCreate}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Send size={16} /> Send Notification
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-brand-ink/60">
          <strong className="text-brand-ink">{notifications.length}</strong> notification{notifications.length !== 1 ? 's' : ''} · <strong className="text-brand-magenta">{unreadCount}</strong> unread
        </p>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <Check size={12} /> Mark all read
            </button>
          )}
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-100"
          >
            <Trash2 size={12} /> Clear all
          </button>
        </div>
      </div>

      {unread.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Unread</p>
              <h3 className="font-display text-sm font-semibold text-brand-ink">{unread.length} new</h3>
            </div>
          </div>
          {unread.map((n) => <NotificationRow key={n.id} notification={n} onMarkRead={onMarkRead} onDelete={onDelete} />)}
        </div>
      )}

      {read.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-slate-300" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">Read</p>
              <h3 className="font-display text-sm font-semibold text-brand-ink">{read.length} archived</h3>
            </div>
          </div>
          {read.map((n) => <NotificationRow key={n.id} notification={n} onMarkRead={onMarkRead} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notification: n, onMarkRead, onDelete }) {
  const config = NOTIFICATION_TYPES.find((t) => t.key === n.type) || NOTIFICATION_TYPES[0];
  const Icon = config.icon;
  const tone = TONE_CLASSES[config.tone];

  return (
    <div className={`group flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-nowrap ${
      n.read ? 'border-brand-lilac/60' : 'border-brand-magenta/40 bg-brand-magenta/[0.03]'
    }`}>
      <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
        <Icon size={16} />
        {!n.read && (
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-magenta opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-magenta" />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">{n.title}</p>
        <p className="truncate text-[11px] text-brand-ink/60">{n.body}</p>
      </div>

      <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider lg:inline-block ${tone.chip}`}>
        {config.label}
      </span>

      <span className="hidden shrink-0 font-mono text-[10px] text-brand-ink/40 sm:block">
        {n.createdAt ? formatRelative(n.createdAt) : n.time}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        {!n.read && (
          <button
            onClick={() => onMarkRead(n.id)}
            className="rounded-lg border border-brand-purple/40 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-brand-purple hover:bg-brand-lilac/40"
          >
            Mark read
          </button>
        )}
        {n.read && (
          <span className="rounded-full bg-brand-lilac/40 px-2.5 py-1 text-[10px] font-semibold text-brand-ink/50">Read</span>
        )}
        <button
          onClick={() => onDelete(n.id)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-500 hover:bg-rose-50"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TASK MODAL
   ═══════════════════════════════════════════════════════════════ */
function TaskModal({ mode = 'create', initial = {}, agents, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    assignedTo: initial.assignedTo || user?.name || 'Admin',
    dueDate: initial.dueDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    priority: initial.priority || 'Medium',
    status: initial.status || 'Pending',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Task title is required'); return; }
    if (!form.dueDate) { setError('Due date is required'); return; }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo,
        dueDate: form.dueDate,
        priority: form.priority,
        status: form.status,
      });
    }, 300);
  };

  return (
    <ModalShell
      title={isEdit ? 'Edit Task' : 'Create Task'}
      subtitle={isEdit ? 'Update task details' : 'Add a new task to your list'}
      onClose={onClose}
      icon={CheckCircle2}
      iconTone="purple"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Task Title *" value={form.title} onChange={(v) => { setForm({ ...form, title: v }); setError(''); }} placeholder="e.g. Review Q3 lead quality" />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Add details..."
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Assign To</label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option value={user?.name || 'Admin'}>{user?.name || 'Admin'} (Me)</option>
              {agents.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
          <Field label="Due Date *" type="date" value={form.dueDate} onChange={(v) => { setForm({ ...form, dueDate: v }); setError(''); }} />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-brand-ink/70">Priority</label>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, priority: p })}
                className={`min-w-[80px] flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                  form.priority === p
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="mb-2 block text-xs font-semibold text-brand-ink/70">Status</label>
            <div className="flex flex-wrap gap-2">
              {TASK_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`min-w-[100px] flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                    form.status === s
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />{error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REMINDER MODAL
   ═══════════════════════════════════════════════════════════════ */
function ReminderModal({ agents, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    type: 'Call',
    date: new Date(Date.now() + 3600000).toISOString().slice(0, 10),
    time: new Date(Date.now() + 3600000).toTimeString().slice(0, 5),
    assignedTo: agents[0]?.name || 'Admin',
    notes: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('Reminder title is required'); return; }
    if (!form.date) { setError('Date is required'); return; }
    onSubmit({
      title: form.title.trim(),
      type: form.type,
      time: `${form.date} · ${form.time}`,
      date: form.date,
      assignedTo: form.assignedTo,
      notes: form.notes.trim(),
    });
  };

  return (
    <ModalShell
      title="Create Reminder"
      subtitle="Set up a call, follow-up, customer, or task reminder"
      onClose={onClose}
      icon={BellRing}
      iconTone="amber"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold text-brand-ink/70">Reminder Type</label>
          <div className="grid grid-cols-2 gap-2">
            {REMINDER_TYPES.map(({ key, label, icon: Icon, tone }) => {
              const active = form.type === key;
              const t = TONE_CLASSES[tone];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, type: key })}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.icon}`}>
                    <Icon size={13} />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Reminder Title *" value={form.title} onChange={(v) => { setForm({ ...form, title: v }); setError(''); }} placeholder="e.g. Call Priya about pricing" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Date *" type="date" value={form.date} onChange={(v) => { setForm({ ...form, date: v }); setError(''); }} />
          <Field label="Time" type="time" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Assign To</label>
          <select
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          >
            <option value="Admin">Admin (Me)</option>
            {agents.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            placeholder="Any context for this reminder..."
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
            onClick={handleSubmit}
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
   NOTIFICATION MODAL
   ═══════════════════════════════════════════════════════════════ */
function NotificationModal({ agents, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'new_lead',
    recipient: 'All Agents',
    priority: 'Medium',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.body.trim()) { setError('Message body is required'); return; }
    onSubmit({
      title: form.title.trim(),
      body: form.body.trim(),
      type: form.type,
      recipient: form.recipient,
      priority: form.priority,
    });
  };

  return (
    <ModalShell
      title="Send Notification"
      subtitle="Broadcast a message to your team"
      onClose={onClose}
      icon={Send}
      iconTone="purple"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold text-brand-ink/70">Notification Type</label>
          <div className="grid grid-cols-2 gap-2">
            {NOTIFICATION_TYPES.map(({ key, label, icon: Icon, tone }) => {
              const active = form.type === key;
              const t = TONE_CLASSES[tone];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, type: key })}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.icon}`}>
                    <Icon size={13} />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Title *" value={form.title} onChange={(v) => { setForm({ ...form, title: v }); setError(''); }} placeholder="e.g. New high-priority lead" />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Message *</label>
          <textarea
            value={form.body}
            onChange={(e) => { setForm({ ...form, body: e.target.value }); setError(''); }}
            rows={3}
            placeholder="Write the notification message..."
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Send To</label>
            <select
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option value="All Agents">All Agents</option>
              <option value="Admin Only">Admin Only</option>
              {agents.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
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
            onClick={handleSubmit}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TASK DETAILS DRAWER
   ═══════════════════════════════════════════════════════════════ */
function TaskDetailsDrawer({ task, onClose, onEdit, onComplete }) {
  const isCompleted = task.status === 'Completed';
  const isOverdue = task.dueDate < today() && !isCompleted && task.status !== 'Cancelled';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Task Details</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{task.title}</h3>
              <p className="font-mono text-[10px] text-brand-ink/50">{task.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Status" value={task.status} color={task.status === 'Completed' ? 'emerald' : task.status === 'In Progress' ? 'purple' : task.status === 'Cancelled' ? 'rose' : 'amber'} />
            <InfoBox label="Priority" value={task.priority} color={task.priority === 'Urgent' ? 'rose' : task.priority === 'High' ? 'amber' : 'purple'} />
            <InfoBox label="Due" value={isOverdue ? 'Overdue' : task.dueDate} color={isOverdue ? 'rose' : 'emerald'} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Task Info</h4>
            <InfoRow icon={UserIcon} label="Assigned To" value={task.assignedTo} />
            <InfoRow icon={Calendar} label="Due Date" value={task.dueDate} />
            <InfoRow icon={Calendar} label="Created On" value={task.createdAt || '—'} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Description</h4>
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-4">
              <p className="text-sm leading-relaxed text-brand-ink/80">{task.description || 'No description'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={onEdit} className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <Pencil size={14} /> Edit
            </button>
            {!isCompleted && (
              <button onClick={onComplete} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110">
                <CheckCircle2 size={14} /> Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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

function InfoBox({ label, value, color = 'purple' }) {
  const colors = {
    purple:  'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber:   'bg-amber-50 text-amber-600 border-amber-200',
    rose:    'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color]}`}>
      <p className="font-mono text-[9px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 truncate text-sm font-bold capitalize">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-magenta">
        <Icon size={14} />
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="shrink-0 text-brand-ink/50">{label}</span>
        <span className="truncate font-semibold text-brand-ink">{value}</span>
      </div>
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
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}