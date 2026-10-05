// src/pages/agent/Tasks.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  ListChecks, CheckCircle2, Clock, Calendar, AlertCircle, X, Search,
  ChevronDown, ChevronLeft, ChevronRight, StickyNote, ListFilter, Inbox,
  User, Tag, TrendingUp, Flame, Play, RotateCcw, Ban, List, Grid3x3,
  Trash2, Plus, Briefcase, Phone, CheckSquare, Square, Zap, Timer,
  CircleDot, Layers, Target, Building2, MapPin, IndianRupee, Sparkles,
  History, MessageCircle, MessageSquare, Mail, ExternalLink, Bell,
  ArrowRight, Send, FileText, Users,
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

const DATE_RANGE_OPTIONS = [
  { value: 'all',       label: 'All dates' },
  { value: 'today',     label: 'Today' },
  { value: 'tomorrow',  label: 'Tomorrow' },
  { value: 'week',      label: 'This week' },
  { value: 'next-week', label: 'Next week' },
  { value: 'overdue',   label: 'Overdue' },
];

const SNOOZE_PRESETS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour',     value: 60 },
  { label: 'Later today', value: 180 },
  { label: 'Tomorrow',   value: 24 * 60 },
  { label: 'Next week',  value: 7 * 24 * 60 },
];

const OUTCOME_OPTIONS = [
  'Customer contacted', 'Information sent', 'Document submitted',
  'Meeting completed', 'Follow-up completed', 'Customer unavailable',
  'No response', 'Other',
];

const QUICK_TAGS = [
  { key: 'urgent',   label: '🔥 Urgent' },
  { key: 'pricing',  label: '💰 Pricing' },
  { key: 'document', label: '📄 Document' },
  { key: 'request',  label: '📌 Customer Request' },
  { key: 'campaign', label: '📢 Campaign' },
  { key: 'manager',  label: '👔 Manager Request' },
];

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

const getTiming = (task) => {
  if (task.status === 'completed') return { state: 'completed', minutes: 0, label: 'Completed' };
  const [y, m, d] = task.dueDate.split('-').map(Number);
  const [hh, mm] = task.dueTime.split(':').map(Number);
  const due = new Date(y, m - 1, d, hh, mm);
  const diffMin = Math.round((due.getTime() - Date.now()) / 60000);
  if (diffMin < -1) return { state: 'overdue', minutes: Math.abs(diffMin), label: `${formatDuration(Math.abs(diffMin))} overdue` };
  if (diffMin <= 60) return { state: 'due-soon', minutes: diffMin, label: diffMin <= 0 ? 'Due now' : `In ${diffMin}m` };
  return { state: 'scheduled', minutes: diffMin, label: `In ${formatDuration(diffMin)}` };
};

const formatDuration = (min) => {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ${min % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
};

const inDateRange = (task, range) => {
  if (range === 'all') return true;
  const taskDate = new Date(`${task.dueDate}T${task.dueTime}`);
  const now = new Date();
  const todayKey = ymd(now);
  const tomorrowKey = ymd(new Date(now.getTime() + 86400000));

  if (range === 'today')     return task.dueDate === todayKey;
  if (range === 'tomorrow')  return task.dueDate === tomorrowKey;
  if (range === 'overdue')   return taskDate.getTime() < now.getTime() && task.status !== 'completed';
  if (range === 'week') {
    const weekEnd = new Date(now.getTime() + 7 * 86400000);
    return taskDate >= now && taskDate <= weekEnd;
  }
  if (range === 'next-week') {
    const weekStart = new Date(now.getTime() + 7 * 86400000);
    const weekEnd = new Date(now.getTime() + 14 * 86400000);
    return taskDate >= weekStart && taskDate <= weekEnd;
  }
  return true;
};

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

  const pastTime = (minsAgo) => {
    const d = new Date(Date.now() - minsAgo * 60000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const futureTime = (minsAhead) => {
    const d = new Date(Date.now() + minsAhead * 60000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return [
    {
      id: 't-1', agentName, websiteId,
      title: 'Call Customer A about pricing', customer: 'Customer A', mobile: '9876543210',
      type: 'call', dueDate: todayStr, dueTime: pastTime(45), priority: 'High', status: 'pending',
      notes: '', purpose: 'Pricing discussion',
      leadStage: 'Hot', source: 'Landing Page', campaign: 'Property Enquiry',
      budget: '₹60L', location: 'Bangalore', lastOutcome: 'Interested',
      leadId: 'LD-1024', tags: ['urgent', 'pricing'],
      activity: [
        { at: '09:15', text: 'Task created' },
        { at: '09:20', text: 'Reminder set' },
      ],
    },
    {
      id: 't-2', agentName, websiteId,
      title: 'Prepare proposal for Customer B', customer: 'Customer B', mobile: '9876543211',
      type: 'document', dueDate: todayStr, dueTime: '13:30', priority: 'Medium', status: 'pending',
      notes: '', purpose: 'Send proposal',
      leadStage: 'Warm', source: 'Facebook Ad', campaign: 'Q4 Push',
      budget: '₹45L', location: 'Mumbai', lastOutcome: 'Requested proposal',
      leadId: 'LD-1025', tags: ['document'],
      activity: [
        { at: '08:30', text: 'Task created' },
      ],
    },
    {
      id: 't-3', agentName, websiteId,
      title: 'Follow-up with Customer C after demo', customer: 'Customer C', mobile: '9876543212',
      type: 'followup', dueDate: todayStr, dueTime: futureTime(30), priority: 'High', status: 'in_progress',
      notes: 'Prefers email.', purpose: 'Demo feedback',
      leadStage: 'Hot', source: 'Referral', campaign: 'Demo Drive',
      budget: '₹75L', location: 'Pune', lastOutcome: 'Interested',
      leadId: 'LD-1026', tags: ['urgent'],
      activity: [
        { at: '09:00', text: 'Task created' },
        { at: '09:30', text: 'Task started' },
      ],
    },
    {
      id: 't-4', agentName, websiteId,
      title: 'Schedule team meeting for next sprint', customer: '—', mobile: '—',
      type: 'meeting', dueDate: tomorrowStr, dueTime: '09:00', priority: 'Medium', status: 'pending',
      notes: '', purpose: 'Team sync',
      leadStage: '—', source: '—', campaign: '—',
      budget: '—', location: '—', lastOutcome: '—',
      leadId: '—', tags: [],
      activity: [],
    },
    {
      id: 't-5', agentName, websiteId,
      title: 'Update CRM notes for Customer D', customer: 'Customer D', mobile: '9876543213',
      type: 'admin', dueDate: nextWeekStr, dueTime: '11:30', priority: 'Low', status: 'pending',
      notes: '', purpose: 'Data cleanup',
      leadStage: 'Warm', source: 'Referral', campaign: '—',
      budget: '₹30L', location: 'Delhi', lastOutcome: 'Contacted',
      leadId: 'LD-1027', tags: [],
      activity: [],
    },
    {
      id: 't-6', agentName, websiteId,
      title: 'Called Customer E', customer: 'Customer E', mobile: '9876543214',
      type: 'call', dueDate: yesterdayStr, dueTime: '15:00', priority: 'High', status: 'completed',
      notes: '', purpose: 'Initial contact',
      leadStage: 'Warm', source: 'Google Ads', campaign: 'Demo Drive',
      budget: '₹40L', location: 'Hyderabad', lastOutcome: 'Converted',
      leadId: 'LD-1028', tags: [],
      completedAt: new Date(Date.now() - 86400_000).toISOString(),
      completionOutcome: 'Customer contacted',
      activity: [
        { at: 'Yesterday 15:00', text: 'Task created' },
        { at: 'Yesterday 15:05', text: 'Task started' },
        { at: 'Yesterday 15:22', text: 'Task completed: Customer contacted' },
      ],
    },
    {
      id: 't-7', agentName, websiteId,
      title: 'Sent documents to Customer F', customer: 'Customer F', mobile: '9876543215',
      type: 'document', dueDate: lastWeekStr, dueTime: '12:00', priority: 'Medium', status: 'completed',
      notes: '', purpose: 'Send brochure',
      leadStage: 'Cold', source: 'Walk-in', campaign: '—',
      budget: '—', location: 'Chennai', lastOutcome: 'Information sent',
      leadId: 'LD-1029', tags: ['document'],
      completedAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
      completionOutcome: 'Document submitted',
      activity: [
        { at: 'Last week 12:00', text: 'Task created' },
        { at: 'Last week 12:10', text: 'Task completed: Document submitted' },
      ],
    },
    {
      id: 't-8', agentName, websiteId,
      title: 'Reviewed quotes with Customer G', customer: 'Customer G', mobile: '9876543216',
      type: 'followup', dueDate: todayStr, dueTime: '17:15', priority: 'Low', status: 'in_progress',
      notes: '', purpose: 'Quote review',
      leadStage: 'Warm', source: '—', campaign: '—',
      budget: '₹35L', location: '—', lastOutcome: 'Requested quote',
      leadId: 'LD-1030', tags: [],
      activity: [],
    },
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
  const [dateRange, setDateRange] = useState('all');
  const [quickFilter, setQuickFilter] = useState('All');
  const [toast, setToast] = useState(null);

  const [selected, setSelected] = useState(null);
  const [showNote, setShowNote] = useState(null);
  const [showReschedule, setShowReschedule] = useState(null);
  const [showSnooze, setShowSnooze] = useState(null);
  const [showComplete, setShowComplete] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarDay, setCalendarDay] = useState(null);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

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

  /* ---------- TIMED TASKS ---------- */
  const timedTasks = useMemo(
    () => tasks.map((t) => ({ ...t, _timing: getTiming(t) })),
    [tasks, tick]
  );

  /* ---------- SUMMARY ---------- */
  const summary = useMemo(() => {
    const pending    = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const completed  = tasks.filter((t) => t.status === 'completed').length;
    const overdue    = tasks.filter(isOverdue).length;
    const todayCount = tasks.filter((t) => isToday(t) && t.status !== 'completed').length;
    const todayDone  = tasks.filter((t) => isToday(t) && t.status === 'completed').length;
    const dueSoon    = timedTasks.filter((t) => t._timing.state === 'due-soon' && t.status !== 'completed').length;

    const nextTask = [...timedTasks]
      .filter((t) => t.status !== 'completed' && t._timing.state !== 'overdue')
      .sort((a, b) => a._timing.minutes - b._timing.minutes)[0];

    return {
      pending, inProgress, completed, total: tasks.length,
      overdue, todayCount, todayDone, dueSoon, nextTask,
    };
  }, [tasks, timedTasks]);

  /* ---------- FILTERED ---------- */
  const filteredTasks = useMemo(() => {
    if (activeTab === 'calendar') return [];
    let list = timedTasks.filter((t) => t.status === activeTab);

    if (priorityFilter !== 'All') list = list.filter((t) => t.priority === priorityFilter);
    if (typeFilter !== 'All')     list = list.filter((t) => t.type === typeFilter);
    if (dateRange !== 'all')      list = list.filter((t) => inDateRange(t, dateRange));

    if (quickFilter === 'high')       list = list.filter((t) => t.priority === 'High');
    if (quickFilter === 'overdue')    list = list.filter((t) => t._timing.state === 'overdue');
    if (quickFilter === 'due-soon')   list = list.filter((t) => t._timing.state === 'due-soon');
    if (quickFilter === 'calls')      list = list.filter((t) => t.type === 'call');
    if (quickFilter === 'documents')  list = list.filter((t) => t.type === 'document');
    if (quickFilter === 'meetings')   list = list.filter((t) => t.type === 'meeting');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) =>
        `${t.title} ${t.customer} ${t.mobile} ${t.notes || ''} ${t.leadId || ''}`.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      const aKey = a.status === 'completed' ? a.completedAt || `${a.dueDate} ${a.dueTime}` : `${a.dueDate} ${a.dueTime}`;
      const bKey = b.status === 'completed' ? b.completedAt || `${b.dueDate} ${b.dueTime}` : `${b.dueDate} ${b.dueTime}`;
      if (a.status === 'completed' && b.status === 'completed') return bKey.localeCompare(aKey);
      if (a.status === 'completed') return 1;
      if (b.status === 'completed') return -1;
      // Overdue first
      const order = { overdue: 0, 'due-soon': 1, scheduled: 2 };
      const oa = order[a._timing.state] ?? 2;
      const ob = order[b._timing.state] ?? 2;
      if (oa !== ob) return oa - ob;
      return aKey.localeCompare(bKey);
    });
  }, [timedTasks, activeTab, priorityFilter, typeFilter, dateRange, quickFilter, searchQuery]);

  /* ---------- ACTIONS ---------- */
  const updateTask = (id, patch) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const logActivity = (id, text) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              activity: [
                ...(t.activity || []),
                { at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text },
              ],
            }
          : t
      )
    );
  };

  const handleStart = (t) => {
    updateTask(t.id, { status: 'in_progress' });
    logActivity(t.id, 'Task started');
    showToast(`Task started · ${t.title}`);
  };

  const handleComplete = (t, outcome, note, scheduleNext, nextDate, nextTime) => {
    updateTask(t.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      completionOutcome: outcome,
      notes: note ? (t.notes ? `${t.notes}\n${note}` : note) : t.notes,
    });
    logActivity(t.id, `Task completed: ${outcome}`);

    // Auto-create follow-up
    if (scheduleNext && nextDate) {
      const followUp = {
        id: `t-${Date.now()}`,
        agentName: user?.name || 'Agent',
        websiteId: activeWebsiteId,
        title: `Follow-up: ${t.title}`,
        customer: t.customer,
        mobile: t.mobile,
        type: 'followup',
        dueDate: nextDate,
        dueTime: nextTime,
        priority: 'Medium',
        status: 'pending',
        notes: `Auto-created after: ${t.title}`,
        leadId: t.leadId,
        tags: [],
        activity: [{ at: 'Now', text: 'Follow-up created' }],
      };
      setTasks((prev) => [followUp, ...prev]);
      showToast(`Completed · Follow-up scheduled for ${nextDate}`);
    } else {
      showToast(`Task completed · ${t.title}`);
    }

    setShowComplete(null);
  };

  const handleReopen = (t) => {
    updateTask(t.id, { status: 'pending', completedAt: null, completionOutcome: null });
    logActivity(t.id, 'Task reopened');
    showToast(`Task reopened · ${t.title}`);
  };

  const handleSnooze = (t, minutes) => {
    const d = new Date(Date.now() + minutes * 60000);
    const newDate = ymd(d);
    const newTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    updateTask(t.id, { dueDate: newDate, dueTime: newTime });
    logActivity(t.id, `Snoozed ${minutes} min`);
    setShowSnooze(null);
    showToast(`Snoozed ${minutes} min`);
  };

  const handleReschedule = (t, { dueDate, dueTime }) => {
    updateTask(t.id, { dueDate, dueTime });
    logActivity(t.id, `Rescheduled to ${dueDate} ${dueTime}`);
    setShowReschedule(null);
    showToast(`Rescheduled to ${dueDate} · ${dueTime}`);
  };

  const handleSaveNote = (t, note) => {
    updateTask(t.id, { notes: (t.notes ? `${t.notes}\n` : '') + note });
    logActivity(t.id, `Note added: ${note}`);
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
      purpose: data.purpose || '',
      tags: data.tags || [],
      leadId: data.leadId || '—',
      notify: data.notify,
      activity: [{ at: 'Now', text: 'Task created' }],
    };
    setTasks((prev) => [newTask, ...prev]);
    setShowAddTask(false);
    showToast('Task added');
  };

  const handleUpdateTask = (id, data) => {
    updateTask(id, data);
    logActivity(id, 'Task updated');
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

      <div className="relative space-y-5 px-1 py-1 pb-24">
        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">My Tasks</h1>
            <p className="text-sm text-brand-ink/50">
              What work do I need to finish, who is it for, and what happens next?
            </p>
          </div>

          <button
            onClick={() => setShowAddTask(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={14} /> New Task <span className="ml-1 rounded border border-white/40 px-1 text-[9px]">N</span>
          </button>
        </div>

        {/* ================= NEEDS ATTENTION BAR ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AttentionCard
            icon={AlertCircle} label="Overdue" value={summary.overdue}
            sub="past due" color="rose"
            onClick={() => { setActiveTab('pending'); setQuickFilter('overdue'); }}
            active={quickFilter === 'overdue'}
          />
          <AttentionCard
            icon={Zap} label="Due Soon" value={summary.dueSoon}
            sub="next 60 min" color="amber"
            onClick={() => { setActiveTab('pending'); setQuickFilter('due-soon'); }}
            active={quickFilter === 'due-soon'}
          />
          <AttentionCard
            icon={Clock} label="Today" value={summary.todayCount}
            sub="due today" color="purple"
            onClick={() => { setActiveTab('pending'); setQuickFilter('All'); setDateRange('today'); }}
            active={dateRange === 'today'}
          />
          <AttentionCard
            icon={CheckCircle2} label="Done Today" value={summary.todayDone}
            sub="completed" color="emerald"
            onClick={() => setActiveTab('completed')}
            active={activeTab === 'completed'}
          />
        </div>

        {/* ================= KPI STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard label="Total"       value={summary.total}      sub="All tasks"     icon={ListChecks}   color="purple"  delay={0} />
          <AnimatedStatCard label="Pending"     value={summary.pending}    sub="To start"      icon={Clock}        color="amber"   delay={40} />
          <AnimatedStatCard label="In Progress" value={summary.inProgress} sub="Working on it" icon={Play}         color="emerald" delay={80} />
          <AnimatedStatCard label="Overdue"     value={summary.overdue}    sub="Past due"      icon={AlertCircle}  color="rose"    delay={120} />
          <AnimatedStatCard label="Completed"   value={summary.completed}  sub="Done"          icon={CheckCircle2} color="emerald" delay={160} />
        </div>

        {/* ================= NEXT UP HERO ================= */}
        {summary.nextTask && (
          <NextTaskCard
            task={summary.nextTask}
            onStart={() => handleStart(summary.nextTask)}
            onComplete={() => setShowComplete(summary.nextTask)}
            onSnooze={() => setShowSnooze(summary.nextTask)}
            onView={() => setSelected(summary.nextTask)}
          />
        )}

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
                  onClick={() => { setActiveTab(t.key); setQuickFilter('All'); setDateRange('all'); }}
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

        {/* ================= QUICK FILTER CHIPS ================= */}
        {activeTab !== 'calendar' && (
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'All',       label: 'All' },
              { key: 'high',      label: 'High Priority', icon: Flame },
              { key: 'overdue',   label: 'Overdue',       icon: AlertCircle },
              { key: 'due-soon',  label: 'Due Soon',      icon: Zap },
              { key: 'calls',     label: 'Calls',         icon: Phone },
              { key: 'documents', label: 'Documents',     icon: Briefcase },
              { key: 'meetings',  label: 'Meetings',      icon: Users },
            ].map((f) => {
              const Icon = f.icon;
              const active = quickFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setQuickFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta text-white shadow-card'
                      : 'border-brand-lilac bg-white text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta'
                  }`}
                >
                  {Icon && <Icon size={11} />}
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

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
              onComplete={(t) => setShowComplete(t)}
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
                  placeholder="Search by title, customer, mobile, lead ID..."
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
                    onComplete={() => setShowComplete(t)}
                    onReopen={() => handleReopen(t)}
                    onNote={() => setShowNote(t)}
                    onSnooze={() => setShowSnooze(t)}
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
                    onComplete={() => setShowComplete(t)}
                    onReopen={() => handleReopen(t)}
                    onNote={() => setShowNote(t)}
                    onSnooze={() => setShowSnooze(t)}
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
            onComplete={() => { setShowComplete(selected); setSelected(null); }}
            onReopen={() => { handleReopen(selected); setSelected(null); }}
            onNote={() => { setShowNote(selected); setSelected(null); }}
            onSnooze={() => { setShowSnooze(selected); setSelected(null); }}
            onReschedule={() => { setShowReschedule(selected); setSelected(null); }}
            onEdit={() => { setShowEditTask(selected); setSelected(null); }}
            onDelete={() => { setConfirmDelete(selected); setSelected(null); }}
          />
        )}

        {showNote && (
          <NoteModal task={showNote} onClose={() => setShowNote(null)} onSave={handleSaveNote} />
        )}

        {showSnooze && (
          <SnoozeModal task={showSnooze} onClose={() => setShowSnooze(null)} onSave={handleSnooze} />
        )}

        {showReschedule && (
          <RescheduleModal task={showReschedule} onClose={() => setShowReschedule(null)} onSave={handleReschedule} />
        )}

        {showComplete && (
          <CompleteModal
            task={showComplete}
            onClose={() => setShowComplete(null)}
            onSave={handleComplete}
          />
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
   ATTENTION CARD (clickable)
   ================================================================ */
function AttentionCard({ icon: Icon, label, value, sub, color = 'purple', onClick, active }) {
  const tones = {
    purple:  { active: 'border-violet-500 ring-2 ring-violet-200',  bg: 'from-violet-500/10 to-brand-magenta/10',  iconBg: 'bg-violet-100 text-brand-purple' },
    emerald: { active: 'border-emerald-500 ring-2 ring-emerald-200',bg: 'from-emerald-500/10 to-teal-500/10',      iconBg: 'bg-emerald-100 text-emerald-600' },
    amber:   { active: 'border-amber-500 ring-2 ring-amber-200',    bg: 'from-amber-500/10 to-orange-500/10',      iconBg: 'bg-amber-100 text-amber-600' },
    rose:    { active: 'border-rose-500 ring-2 ring-rose-200',      bg: 'from-rose-500/10 to-pink-500/10',         iconBg: 'bg-rose-100 text-brand-magenta' },
  };
  const t = tones[color];
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 ${
        active ? t.active : 'border-brand-lilac/70 hover:border-brand-magenta/40'
      }`}
    >
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
          <p className="font-display text-2xl font-bold leading-tight text-brand-ink">{value}</p>
          <p className="truncate text-[10px] text-brand-ink/50">{sub}</p>
        </div>
      </div>
    </button>
  );
}

/* ================================================================
   NEXT TASK HERO
   ================================================================ */
function NextTaskCard({ task, onStart, onComplete, onSnooze, onView }) {
  const t = task;
  const meta = TYPE_META[t.type] || TYPE_META.other;
  const Icon = meta.icon;
  const timing = t._timing;

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-brand-magenta/30 bg-gradient-to-r from-white via-white to-brand-lilac/30 shadow-[0_10px_30px_-15px_rgba(227,28,121,0.35)]">
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-magenta/15 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-brand-purple/15 blur-3xl" />
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-magenta to-brand-purple" />

      <div className="relative flex flex-wrap items-center gap-4 p-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <Zap size={20} />
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-magenta/30" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
                Next Up
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                timing.state === 'due-soon'
                  ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                  : 'bg-brand-mist text-brand-ink/60'
              }`}>
                <Timer size={9} />
                {t.dueTime} · {timing.label}
              </span>
            </div>

            <p className="mt-1 truncate text-base font-semibold text-brand-ink">{t.title}</p>
            <p className="truncate text-xs text-brand-ink/50">
              {t.customer !== '—' ? `${t.customer} · ${t.mobile} · ` : ''}{meta.label}
              {t.leadStage && t.leadStage !== '—' ? ` · ${t.leadStage}` : ''}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onView}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-3 text-xs font-semibold text-brand-ink hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
          >
            <User size={12} /> View
          </button>
          <button
            onClick={onSnooze}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-600 hover:bg-amber-100"
          >
            <Clock size={12} /> Snooze
          </button>
          {t.status === 'pending' && (
            <button
              onClick={onStart}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 text-xs font-bold text-white shadow-card hover:brightness-110"
            >
              <Play size={13} /> Start
            </button>
          )}
          <button
            onClick={onComplete}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 text-xs font-bold text-white shadow-card hover:brightness-110"
          >
            <CheckCircle2 size={13} /> Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TASK ROW
   ================================================================ */
function TaskRow({
  task, selected, onToggleSelect,
  onView, onStart, onComplete, onReopen, onNote, onSnooze, onReschedule, onEdit, onDelete,
}) {
  const t = task;
  const meta = TYPE_META[t.type] || TYPE_META.other;
  const Icon = meta.icon;
  const isDone = t.status === 'completed';
  const timing = t._timing;

  const timingStyle =
    timing.state === 'overdue' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' :
    timing.state === 'due-soon' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
    timing.state === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' :
    'bg-brand-mist text-brand-ink/60';

  // Context-aware actions
  const primaryAction =
    t.type === 'call'     ? { label: 'Call', icon: Phone } :
    t.type === 'followup' ? { label: 'Call', icon: Phone } :
    t.type === 'document' ? { label: 'Open', icon: FileText } :
    t.type === 'meeting'  ? { label: 'Open', icon: Users } :
                            { label: 'Start', icon: Play };

  return (
    <div className={`group relative flex flex-wrap items-center gap-3 rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
      timing.state === 'overdue' ? 'border-rose-200 hover:border-rose-400' :
      timing.state === 'due-soon' ? 'border-amber-200 hover:border-amber-400' :
      'border-brand-lilac/70 hover:border-brand-magenta/40'
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
        timing.state === 'overdue' ? 'bg-rose-50' :
        timing.state === 'due-soon' ? 'bg-amber-50' :
        'bg-gradient-to-br from-brand-magenta/10 to-brand-purple/10'
      }`}>
        <p className={`font-display text-sm font-bold ${
          timing.state === 'overdue' ? 'text-rose-600' :
          timing.state === 'due-soon' ? 'text-amber-700' :
          'text-brand-ink'
        }`}>{t.dueTime}</p>
        <p className="font-mono text-[9px] uppercase tracking-wide text-brand-ink/50">
          {t.dueDate.slice(5)}
        </p>
      </div>

      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.tint}`}>
        <Icon size={15} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onView}
            className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta"
          >
            {t.title}
          </button>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[t.priority]}`}>
            {t.priority}
          </span>
          {t.purpose && (
            <span className="hidden shrink-0 rounded-full bg-brand-lilac/50 px-2 py-0.5 text-[9px] font-semibold text-brand-purple sm:inline-block">
              {t.purpose}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-brand-ink/50">
          {t.customer !== '—' ? `${t.customer} · ${t.mobile} · ` : ''}{meta.label}
          {t.leadId && t.leadId !== '—' ? ` · ${t.leadId}` : ''}
        </p>
      </div>

      <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${timingStyle}`}>
        {timing.state === 'overdue' && <AlertCircle size={9} />}
        {timing.state === 'due-soon' && <Zap size={9} />}
        {timing.state === 'completed' && <CheckCircle2 size={9} />}
        {timing.state === 'scheduled' && <Clock size={9} />}
        {timing.label}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        {!isDone && (
          <>
            {t.status === 'pending' && (
              <button
                onClick={onStart}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 px-3 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
              >
                <primaryAction.icon size={12} /> {primaryAction.label}
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
            <button
              onClick={onSnooze}
              className="hidden h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-[11px] font-semibold text-amber-600 transition-all hover:bg-amber-100 sm:flex"
              title="Snooze"
            >
              <Clock size={12} />
            </button>
          </>
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
          <User size={12} /> View
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   TASK CARD
   ================================================================ */
function TaskCard({
  task, selected, onToggleSelect,
  onView, onStart, onComplete, onReopen, onNote, onSnooze, onReschedule, onEdit, onDelete,
}) {
  const t = task;
  const meta = TYPE_META[t.type] || TYPE_META.other;
  const Icon = meta.icon;
  const isDone = t.status === 'completed';
  const timing = t._timing;

  const accentBar =
    timing.state === 'overdue' ? 'from-rose-500 to-rose-600' :
    timing.state === 'due-soon' ? 'from-amber-500 to-orange-500' :
    timing.state === 'completed' ? 'from-emerald-500 to-emerald-600' :
    'from-brand-magenta to-brand-purple';

  return (
    <div className={`group relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)] ${
      timing.state === 'overdue' ? 'border-rose-200 hover:border-rose-400' :
      timing.state === 'due-soon' ? 'border-amber-200 hover:border-amber-400' :
      'border-brand-lilac/80 hover:border-brand-magenta/50'
    } ${selected ? 'ring-2 ring-brand-magenta/30' : ''}`}>
      <span className={`pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-2xl bg-gradient-to-r ${accentBar}`} />

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
            <p className={`font-display text-lg font-bold leading-tight ${
              timing.state === 'overdue' ? 'text-rose-600' :
              timing.state === 'due-soon' ? 'text-amber-700' :
              'text-brand-ink'
            }`}>
              {t.dueTime}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand-ink/50">
              {t.dueDate}
            </p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${PRIORITY_STYLES[t.priority]}`}>
            {t.priority}
          </span>
        </div>

        <div className={`mt-3 inline-flex items-center gap-1.5 self-start rounded-full px-2 py-0.5 text-[10px] font-bold ${
          timing.state === 'overdue' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' :
          timing.state === 'due-soon' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
          timing.state === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' :
          'bg-brand-mist text-brand-ink/60'
        }`}>
          {timing.state === 'overdue' && <AlertCircle size={9} />}
          {timing.state === 'due-soon' && <Zap size={9} />}
          {timing.state === 'completed' && <CheckCircle2 size={9} />}
          {timing.state === 'scheduled' && <Clock size={9} />}
          {timing.label}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.tint}`}>
            <Icon size={14} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-ink/50">
            {meta.label}
          </span>
          {t.purpose && (
            <span className="ml-auto rounded-full bg-brand-lilac/50 px-2 py-0.5 text-[9px] font-semibold text-brand-purple">
              {t.purpose}
            </span>
          )}
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
              onClick={onSnooze}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-100"
            >
              <Clock size={12} /> Snooze
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
   TASK DRAWER — rich lead context + activity + actions
   ================================================================ */
function TaskDrawer({ task, onClose, onStart, onComplete, onReopen, onNote, onSnooze, onReschedule, onEdit, onDelete }) {
  const t = task;
  const meta = TYPE_META[t.type] || TYPE_META.other;
  const Icon = meta.icon;
  const isDone = t.status === 'completed';
  const isPending = t.status === 'pending';
  const isInProgress = t.status === 'in_progress';
  const timing = t._timing;

  const canCall = t.type === 'call' || t.type === 'followup';

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
                {t.leadId && t.leadId !== '—' ? ` · ${t.leadId}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${PRIORITY_STYLES[t.priority]}`}>
              <Flame size={11} /> {t.priority}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              timing.state === 'overdue' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' :
              timing.state === 'due-soon' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
              timing.state === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' :
              'bg-brand-mist text-brand-ink/70'
            }`}>
              <Timer size={11} /> {timing.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLES[t.status]}`}>
              {t.status.replace('_', ' ')}
            </span>
          </div>

          {t.purpose && (
            <div className="rounded-xl border border-brand-lilac bg-brand-lilac/20 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-purple">
                <Target size={10} /> Purpose
              </p>
              <p className="text-sm font-semibold text-brand-ink">{t.purpose}</p>
            </div>
          )}

          {/* Lead Context */}
          {t.customer !== '—' && (
            <div className="card !p-4 space-y-3">
              <h4 className="flex items-center gap-1.5 font-display text-sm font-semibold text-brand-ink">
                <Sparkles size={12} className="text-brand-magenta" /> Lead Context
              </h4>
              <Row icon={Flame}       label="Stage"       value={t.leadStage || '—'} />
              <Row icon={Building2}   label="Source"      value={t.source || '—'} />
              <Row icon={Layers}      label="Campaign"    value={t.campaign || '—'} />
              <Row icon={IndianRupee} label="Budget"      value={t.budget || '—'} />
              <Row icon={MapPin}      label="Location"    value={t.location || '—'} />
              <Row icon={Target}      label="Last Outcome" value={t.lastOutcome || '—'} />
            </div>
          )}

          {/* Task Details */}
          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Task</h4>
            <Row icon={Calendar} label="Due Date" value={t.dueDate} />
            <Row icon={Clock}    label="Due Time" value={t.dueTime} />
            <Row icon={Tag}      label="Type"     value={meta.label} />
          </div>

          {/* Tags */}
          {t.tags && t.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {t.tags.map((tag) => {
                const tg = QUICK_TAGS.find((q) => q.key === tag);
                if (!tg) return null;
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-brand-lilac/50 px-2.5 py-1 text-[11px] font-semibold text-brand-purple"
                  >
                    {tg.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Notes */}
          {t.notes && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                <StickyNote size={10} /> Notes
              </p>
              <p className="whitespace-pre-line text-sm text-brand-ink/80">{t.notes}</p>
            </div>
          )}

          {/* Completion outcome */}
          {isDone && t.completionOutcome && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                <CheckCircle2 size={10} /> Completion Outcome
              </p>
              <p className="text-sm font-semibold text-emerald-700">{t.completionOutcome}</p>
            </div>
          )}

          {/* Activity history */}
          {t.activity && t.activity.length > 0 && (
            <div className="card !p-4 space-y-3">
              <h4 className="flex items-center gap-1.5 font-display text-sm font-semibold text-brand-ink">
                <History size={12} className="text-brand-magenta" /> Activity
              </h4>
              <div className="relative space-y-3">
                <span className="pointer-events-none absolute left-[15px] top-4 bottom-4 w-px bg-brand-lilac" />
                {t.activity.map((a, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-mist text-brand-magenta ring-4 ring-white">
                      <CircleDot size={10} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-brand-ink">{a.text}</p>
                      <p className="text-[10px] text-brand-ink/40">{a.at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isDone && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {isPending && (
                  <button
                    onClick={onStart}
                    className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 ${
                      !canCall ? 'col-span-2' : ''
                    }`}
                  >
                    <Play size={16} /> Start Task
                  </button>
                )}
                <button
                  onClick={onComplete}
                  className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 ${
                    isPending && !canCall ? '' : isPending ? '' : 'col-span-2'
                  }`}
                >
                  <CheckCircle2 size={16} /> {isInProgress ? 'Complete' : 'Mark Done'}
                </button>
              </div>

              {canCall && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <QuickAction icon={Phone}         label="Call" />
                    <QuickAction icon={MessageCircle} label="WhatsApp" />
                    <QuickAction icon={MessageSquare} label="SMS" />
                    <QuickAction icon={ExternalLink}  label="View Lead" />
                  </div>
                </div>
              )}

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
                  <Calendar size={12} /> Reschedule
                </button>
                <button
                  onClick={onNote}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
                >
                  <StickyNote size={12} /> Note
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onEdit}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
                >
                  <ListChecks size={12} /> Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-100"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </>
          )}

          {isDone && (
            <button
              onClick={onReopen}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <RotateCcw size={16} /> Reopen Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white p-2 text-center transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40">
      <Icon size={14} className="text-brand-magenta" />
      <span className="text-[10px] font-semibold text-brand-ink/70">{label}</span>
    </button>
  );
}

/* ================================================================
   COMPLETE MODAL — captures outcome + optional next follow-up
   ================================================================ */
function CompleteModal({ task, onClose, onSave }) {
  const [outcome, setOutcome] = useState('Customer contacted');
  const [note, setNote] = useState('');
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState(() => ymd(new Date(Date.now() + 86400000)));
  const [nextTime, setNextTime] = useState('10:00');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Complete Task</h3>
              <p className="text-xs text-brand-ink/50">{task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">How was this task completed?</label>
            <div className="grid grid-cols-2 gap-2">
              {OUTCOME_OPTIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOutcome(o)}
                  className={`rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-all ${
                    outcome === o
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac bg-white text-brand-ink/70 hover:bg-brand-lilac/30'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Notes (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Additional context..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-ink/70">
            <input
              type="checkbox"
              checked={scheduleNext}
              onChange={(e) => setScheduleNext(e.target.checked)}
              className="h-4 w-4 rounded border-brand-lilac accent-brand-magenta"
            />
            Create follow-up task
          </label>

          {scheduleNext && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full rounded-lg border border-brand-lilac bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
              />
              <input
                type="time"
                value={nextTime}
                onChange={(e) => setNextTime(e.target.value)}
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
              onClick={() => onSave(task, outcome, note, scheduleNext, nextDate, nextTime)}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Complete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SNOOZE MODAL
   ================================================================ */
function SnoozeModal({ task, onClose, onSave }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Snooze</h3>
              <p className="text-xs text-brand-ink/50">{task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {SNOOZE_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onSave(task, p.value)}
              className="flex w-full items-center justify-between rounded-xl border border-brand-lilac bg-white px-4 py-3 text-sm font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
            >
              <span>{p.label}</span>
              <ChevronRight size={14} className="text-brand-ink/30" />
            </button>
          ))}
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
    purpose:    initial?.purpose || '',
    tags:       initial?.tags || [],
    notify:     initial?.notify || '15',
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleTag = (key) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(key) ? f.tags.filter((k) => k !== key) : [...f.tags, key],
    }));
  };

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
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-panel">
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
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Purpose</label>
            <select
              value={form.purpose}
              onChange={(e) => set('purpose', e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option value="">— Select purpose —</option>
              {['Pricing discussion', 'Send proposal', 'Demo feedback', 'Initial contact', 'Quote review', 'Send brochure', 'Team sync', 'Data cleanup', 'Other'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due Date" type="date" value={form.dueDate} onChange={(v) => set('dueDate', v)} />
            <Field label="Due Time" type="time" value={form.dueTime} onChange={(v) => set('dueTime', v)} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleTag(t.key)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    form.tags.includes(t.key)
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <Bell size={12} /> Notify me
            </label>
            <select
              value={form.notify}
              onChange={(e) => set('notify', e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option value="5">5 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="0">At due time</option>
            </select>
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
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/60 pb-2 last:border-b-0 last:pb-0">
      <span className="flex shrink-0 items-center gap-1.5 text-brand-ink/50">
        {Icon && <Icon size={12} />}
        {label}
      </span>
      <span className="truncate font-medium text-brand-ink">{value}</span>
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