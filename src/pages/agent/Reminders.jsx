// src/pages/agent/Reminders.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Bell, BellRing, Clock, Calendar, CheckCircle2, AlertCircle, X, Search,
  ChevronDown, StickyNote, ListFilter, Inbox, User, Tag, TrendingUp,
  Flame, PhoneCall, Phone, ListChecks, RotateCcw, Ban,
  List, Grid3x3, Trash2, Zap, ArrowRight, MessageCircle, Mail,
  MessageSquare, ExternalLink, History, Target, Building2, MapPin,
  IndianRupee, Layers, Sparkles, Timer, ChevronRight, CircleDot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ================================================================
   CONSTANTS
   ================================================================ */
const TABS = [
  { key: 'today',     label: 'Today',     icon: BellRing },
  { key: 'overdue',   label: 'Overdue',   icon: AlertCircle, live: true },
  { key: 'upcoming',  label: 'Upcoming',  icon: Calendar },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const TYPE_META = {
  followup: { label: 'Follow-Up',          icon: Calendar,   tint: 'bg-violet-50 text-brand-purple border-violet-200' },
  call:     { label: 'Call Reminder',      icon: PhoneCall,  tint: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  callback: { label: 'Customer Callback',  icon: Phone,      tint: 'bg-amber-50 text-amber-600 border-amber-200' },
  task:     { label: 'Pending Task',       icon: ListChecks, tint: 'bg-rose-50 text-brand-magenta border-rose-200' },
};

const PURPOSE_OPTIONS = [
  'Product enquiry', 'Pricing', 'Demo', 'Payment', 'Renewal',
  'Document submission', 'Callback', 'Appointment', 'Other',
];

const SNOOZE_PRESETS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour',     value: 60 },
  { label: '2 hours',    value: 120 },
  { label: 'Tomorrow',   value: 24 * 60 },
  { label: 'Next week',  value: 7 * 24 * 60 },
];

const PRIORITY_STYLES = {
  High:   'border-rose-200 bg-rose-50 text-rose-600',
  Medium: 'border-amber-200 bg-amber-50 text-amber-600',
  Low:    'border-emerald-200 bg-emerald-50 text-emerald-600',
};

const OUTCOME_OPTIONS = [
  'Customer contacted', 'Customer unavailable', 'Follow-up completed',
  'Information sent', 'Appointment confirmed', 'Customer not interested',
  'Converted', 'Other',
];

/* ================================================================
   HELPERS
   ================================================================ */
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const getTiming = (r) => {
  if (r.status === 'completed') return { state: 'completed', minutes: 0, label: 'Completed' };
  const due = new Date(`${r.date}T${r.time}:00`);
  const diffMin = Math.round((due.getTime() - Date.now()) / 60000);
  if (diffMin < -1) return { state: 'overdue', minutes: Math.abs(diffMin), label: `${formatDuration(Math.abs(diffMin))} overdue` };
  if (diffMin <= 15) return { state: 'due-now', minutes: diffMin, label: diffMin <= 0 ? 'Due now' : `Due in ${diffMin}m` };
  return { state: 'scheduled', minutes: diffMin, label: `In ${formatDuration(diffMin)}` };
};

const formatDuration = (min) => {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ${min % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
};

/* ================================================================
   DEMO DATA
   ================================================================ */
const buildDemoReminders = (agentName, websiteId) => {
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
      id: 'r-1', agentName, websiteId, type: 'callback',
      title: 'Customer C asked for a callback', customer: 'Customer C', mobile: '9876543212',
      date: todayStr, time: pastTime(135), priority: 'High', status: 'today',
      purpose: 'Callback', notes: 'Prefers afternoon.',
      leadStage: 'Hot', source: 'Landing Page', campaign: 'Diwali Campaign',
      budget: '₹45L', location: 'Pune', lastOutcome: 'Interested',
      preferredContact: '10:00 AM – 12:00 PM · Weekdays',
      history: [
        { icon: 'call', label: 'Call',         detail: 'Interested',           when: 'Yesterday · 4:20 PM' },
        { icon: 'note', label: 'Note',         detail: 'Requested pricing',    when: 'Yesterday · 4:25 PM' },
      ],
    },
    {
      id: 'r-2', agentName, websiteId, type: 'call',
      title: 'Call Customer B', customer: 'Customer B', mobile: '9876543211',
      date: todayStr, time: pastTime(45), priority: 'Medium', status: 'today',
      purpose: 'Pricing', notes: '',
      leadStage: 'Warm', source: 'Facebook Ad', campaign: 'Q4 Push',
      budget: '₹30L', location: 'Mumbai', lastOutcome: 'No Answer',
      preferredContact: '2:00 PM – 5:00 PM · All days',
      history: [],
    },
    {
      id: 'r-3', agentName, websiteId, type: 'followup',
      title: 'Follow-up with Customer A', customer: 'Customer A', mobile: '9876543210',
      date: todayStr, time: futureTime(8), priority: 'High', status: 'today',
      purpose: 'Demo', notes: '',
      leadStage: 'Hot', source: 'Landing Page', campaign: 'Property Enquiry',
      budget: '₹60L', location: 'Bangalore', lastOutcome: 'Interested',
      preferredContact: '10:00 AM – 12:00 PM · Weekdays',
      history: [
        { icon: 'call', label: 'Call', detail: 'Interested · 4:20',  when: 'Yesterday' },
        { icon: 'note', label: 'Note', detail: 'Requested brochure', when: 'Yesterday' },
      ],
    },
    {
      id: 'r-4', agentName, websiteId, type: 'task',
      title: 'Prepare quotes for Customer D', customer: 'Customer D', mobile: '9876543213',
      date: todayStr, time: '16:15', priority: 'Medium', status: 'today',
      purpose: 'Document submission', notes: '',
      leadStage: 'Warm', source: 'Referral', campaign: '—',
      budget: '₹25L', location: 'Delhi', lastOutcome: 'Requested quote',
      preferredContact: '—',
      history: [],
    },
    {
      id: 'r-5', agentName, websiteId, type: 'call',
      title: 'Call Customer E for demo', customer: 'Customer E', mobile: '9876543214',
      date: tomorrowStr, time: '09:45', priority: 'High', status: 'upcoming',
      purpose: 'Demo', notes: '',
      leadStage: 'Warm', source: 'Google Ads', campaign: 'Demo Drive',
      budget: '₹50L', location: 'Hyderabad', lastOutcome: 'Interested',
      preferredContact: '9:00 AM – 11:00 AM',
      history: [],
    },
    {
      id: 'r-6', agentName, websiteId, type: 'followup',
      title: 'Follow-up with Customer F', customer: 'Customer F', mobile: '9876543215',
      date: nextWeekStr, time: '11:00', priority: 'Medium', status: 'upcoming',
      purpose: 'Renewal', notes: '',
      leadStage: 'Cold', source: 'Walk-in', campaign: '—',
      budget: '—', location: 'Chennai', lastOutcome: 'Contacted',
      preferredContact: '—',
      history: [],
    },
    {
      id: 'r-7', agentName, websiteId, type: 'call',
      title: 'Called Customer G', customer: 'Customer G', mobile: '9876543216',
      date: yesterdayStr, time: '15:00', priority: 'Low', status: 'completed',
      purpose: 'Pricing', notes: 'Customer not interested in current pricing.',
      leadStage: 'Cold', source: '—', campaign: '—',
      budget: '—', location: '—', lastOutcome: 'Not Interested',
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      completionOutcome: 'Customer not interested',
      history: [],
    },
    {
      id: 'r-8', agentName, websiteId, type: 'task',
      title: 'Sent brochure to Customer H', customer: 'Customer H', mobile: '9876543217',
      date: lastWeekStr, time: '12:30', priority: 'Low', status: 'completed',
      purpose: 'Document submission', notes: '',
      leadStage: 'Warm', source: 'Referral', campaign: '—',
      budget: '—', location: '—', lastOutcome: 'Information sent',
      completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      completionOutcome: 'Information sent',
      history: [],
    },
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
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [quickFilter, setQuickFilter] = useState('All');
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showNote, setShowNote] = useState(null);
  const [showReschedule, setShowReschedule] = useState(null);
  const [showSnooze, setShowSnooze] = useState(null);
  const [showComplete, setShowComplete] = useState(null);
  const [calling, setCalling] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

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

  const timedReminders = useMemo(
    () => reminders.map((r) => ({ ...r, _timing: getTiming(r) })),
    [reminders, tick]
  );

  const summary = useMemo(() => {
    const t = timedReminders.filter((r) => r.status !== 'completed');
    const overdue = t.filter((r) => r._timing.state === 'overdue').length;
    const dueNow  = t.filter((r) => r._timing.state === 'due-now').length;
    const today   = t.filter((r) => r.status === 'today').length;
    const upcoming = t.filter((r) => r.status === 'upcoming').length;
    const completed = timedReminders.filter((r) => r.status === 'completed').length;
    const highPriority = t.filter((r) => r.priority === 'High').length;
    return { overdue, dueNow, today, upcoming, completed, highPriority, total: timedReminders.length };
  }, [timedReminders]);

  const nextUp = useMemo(() => {
    const candidates = timedReminders
      .filter((r) => r.status !== 'completed' && r._timing.state !== 'overdue')
      .sort((a, b) => a._timing.minutes - b._timing.minutes);
    return candidates[0] || null;
  }, [timedReminders]);

  const filtered = useMemo(() => {
    let list = timedReminders;

    if (activeTab === 'today') {
      list = list.filter((r) => r.status === 'today' || r._timing.state === 'overdue' || r._timing.state === 'due-now');
    } else if (activeTab === 'overdue') {
      list = list.filter((r) => r._timing.state === 'overdue');
    } else if (activeTab === 'upcoming') {
      list = list.filter((r) => r.status === 'upcoming');
    } else if (activeTab === 'completed') {
      list = list.filter((r) => r.status === 'completed');
    }

    if (quickFilter === 'high')       list = list.filter((r) => r.priority === 'High');
    if (quickFilter === 'due-now')    list = list.filter((r) => r._timing.state === 'due-now');
    if (quickFilter === 'overdue')    list = list.filter((r) => r._timing.state === 'overdue');
    if (quickFilter === 'callbacks')  list = list.filter((r) => r.type === 'callback');
    if (quickFilter === 'calls')      list = list.filter((r) => r.type === 'call');
    if (quickFilter === 'followups')  list = list.filter((r) => r.type === 'followup');
    if (quickFilter === 'tasks')      list = list.filter((r) => r.type === 'task');

    if (typeFilter !== 'All')      list = list.filter((r) => r.type === typeFilter);
    if (priorityFilter !== 'All')  list = list.filter((r) => r.priority === priorityFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) =>
        `${r.title} ${r.customer} ${r.mobile} ${r.notes || ''} ${r.purpose || ''}`.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      if (a.status === 'completed') {
        return (b.completedAt || '').localeCompare(a.completedAt || '');
      }
      const order = { overdue: 0, 'due-now': 1, scheduled: 2 };
      const oa = order[a._timing.state] ?? 2;
      const ob = order[b._timing.state] ?? 2;
      if (oa !== ob) return oa - ob;
      return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
    });
  }, [timedReminders, activeTab, quickFilter, typeFilter, priorityFilter, searchQuery]);

  const updateReminder = (id, patch) =>
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleComplete = (r, outcome, note) => {
    updateReminder(r.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      completionOutcome: outcome,
      notes: note ? (r.notes ? `${r.notes}\n${note}` : note) : r.notes,
    });
    setShowComplete(null);
    showToast(`Completed · ${r.title}`);
  };

  const handleSnooze = (r, minutes) => {
    const d = new Date(Date.now() + minutes * 60000);
    const newTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const newDate = ymd(d);
    updateReminder(r.id, {
      time: newTime,
      date: newDate,
      status: newDate === ymd(new Date()) ? 'today' : 'upcoming',
    });
    setShowSnooze(null);
    showToast(`Snoozed · ${minutes} min`);
  };

  const handleReschedule = (r, { date, time }) => {
    updateReminder(r.id, { date, time, status: date === ymd(new Date()) ? 'today' : 'upcoming' });
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
      lastOutcome: payload.outcome,
    });
    setCalling(null);
    showToast(`Call logged · ${payload.outcome}`);
  };

  const handleSkip = (r) => {
    handleSnooze(r, 60);
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
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Reminders</h1>
          <p className="text-sm text-brand-ink/50">
            What do I need to act on right now?
          </p>
        </div>

        {/* ================= KPI STRIP (Today first) ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard
            label="Today" value={summary.today} sub="All today"
            icon={BellRing} color="purple" delay={0}
            onClick={() => { setActiveTab('today'); setQuickFilter('All'); }}
            active={activeTab === 'today' && quickFilter === 'All'}
          />
          <AnimatedStatCard
            label="Overdue" value={summary.overdue} sub="Act immediately"
            icon={AlertCircle} color="rose" delay={40}
            onClick={() => { setActiveTab('overdue'); setQuickFilter('All'); }}
            active={activeTab === 'overdue'}
          />
          <AnimatedStatCard
            label="Due Now" value={summary.dueNow} sub="Within 15 min"
            icon={Zap} color="amber" delay={80}
            onClick={() => { setActiveTab('today'); setQuickFilter('due-now'); }}
            active={quickFilter === 'due-now'}
          />
          <AnimatedStatCard
            label="Upcoming" value={summary.upcoming} sub="Next days"
            icon={Calendar} color="emerald" delay={120}
            onClick={() => { setActiveTab('upcoming'); setQuickFilter('All'); }}
            active={activeTab === 'upcoming'}
          />
          <AnimatedStatCard
            label="Completed" value={summary.completed} sub="All time"
            icon={CheckCircle2} color="emerald" delay={160}
            onClick={() => { setActiveTab('completed'); setQuickFilter('All'); }}
            active={activeTab === 'completed'}
          />
        </div>

        {/* ================= NEXT UP HERO ================= */}
        {nextUp && (
          <NextUpCard
            reminder={nextUp}
            onCall={() => handleCall(nextUp)}
            onComplete={() => setShowComplete(nextUp)}
            onSnooze={() => setShowSnooze(nextUp)}
            onView={() => setSelected(nextUp)}
          />
        )}

        {/* ================= TABS + VIEW TOGGLE ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count =
                t.key === 'today'     ? summary.today :
                t.key === 'overdue'   ? summary.overdue :
                t.key === 'upcoming'  ? summary.upcoming :
                                        summary.completed;
              return (
                <button
                  key={t.key}
                  onClick={() => { setActiveTab(t.key); setQuickFilter('All'); }}
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

        {/* ================= QUICK FILTER CHIPS ================= */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'All',       label: 'All' },
            { key: 'high',      label: 'High Priority', icon: Flame },
            { key: 'due-now',   label: 'Due Now',       icon: Zap },
            { key: 'overdue',   label: 'Overdue',       icon: AlertCircle },
            { key: 'callbacks', label: 'Callbacks',     icon: Phone },
            { key: 'calls',     label: 'Calls',         icon: PhoneCall },
            { key: 'followups', label: 'Follow-Ups',    icon: Calendar },
            { key: 'tasks',     label: 'Tasks',         icon: ListChecks },
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

          <DropdownFilter
            label="Priority"
            icon={Flame}
            value={priorityFilter}
            options={[
              { value: 'All',    label: 'All Priorities' },
              { value: 'High',   label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low',    label: 'Low' },
            ]}
            onChange={setPriorityFilter}
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
                onComplete={() => setShowComplete(r)}
                onSnooze={() => setShowSnooze(r)}
                onCall={() => handleCall(r)}
                onReschedule={() => setShowReschedule(r)}
                onSkip={() => handleSkip(r)}
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
                onComplete={() => setShowComplete(r)}
                onSnooze={() => setShowSnooze(r)}
                onCall={() => handleCall(r)}
                onReschedule={() => setShowReschedule(r)}
                onSkip={() => handleSkip(r)}
              />
            ))}
          </div>
        )}

        {/* ================= DRAWER / MODALS ================= */}
        {selected && (
          <ReminderDrawer
            reminder={selected}
            onClose={() => setSelected(null)}
            onComplete={() => { setShowComplete(selected); setSelected(null); }}
            onSnooze={() => { setShowSnooze(selected); setSelected(null); }}
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

        {showSnooze && (
          <SnoozeModal
            reminder={showSnooze}
            onClose={() => setShowSnooze(null)}
            onSave={handleSnooze}
          />
        )}

        {showComplete && (
          <CompleteModal
            reminder={showComplete}
            onClose={() => setShowComplete(null)}
            onSave={handleComplete}
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
   NEXT UP HERO CARD
   ================================================================ */
function NextUpCard({ reminder, onCall, onComplete, onSnooze, onView }) {
  const r = reminder;
  const meta = TYPE_META[r.type] || TYPE_META.followup;
  const Icon = meta.icon;
  const canCall = r.type === 'call' || r.type === 'callback' || r.type === 'followup';
  const timing = r._timing;

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
                timing.state === 'due-now'
                  ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                  : 'bg-brand-mist text-brand-ink/60'
              }`}>
                <Timer size={9} />
                {timing.label}
              </span>
            </div>

            <p className="mt-1 truncate text-base font-semibold text-brand-ink">{r.title}</p>
            <p className="truncate text-xs text-brand-ink/50">
              {r.customer} · {r.mobile} · {meta.label}
              {r.purpose ? ` · ${r.purpose}` : ''}
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
          {canCall && (
            <button
              onClick={onCall}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 text-xs font-bold text-white shadow-card hover:brightness-110"
            >
              <Phone size={13} /> Call Now
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
   REMINDER ROW
   ================================================================ */
function ReminderRow({
  reminder, onView, onComplete, onSnooze, onCall, onReschedule, onSkip,
}) {
  const r = reminder;
  const meta = TYPE_META[r.type] || TYPE_META.followup;
  const Icon = meta.icon;
  const isDone = r.status === 'completed';
  const canCall = r.type === 'call' || r.type === 'callback' || r.type === 'followup';
  const timing = r._timing;

  const timingStyle =
    timing.state === 'overdue' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' :
    timing.state === 'due-now' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
    timing.state === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' :
    'bg-brand-mist text-brand-ink/60';

  return (
    <div className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
      timing.state === 'overdue' ? 'border-rose-200 hover:border-rose-400' :
      timing.state === 'due-now' ? 'border-amber-200 hover:border-amber-400' :
      'border-brand-lilac/70 hover:border-brand-magenta/40'
    }`}>
      <div className={`flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-lg ${
        timing.state === 'overdue' ? 'bg-rose-50' :
        timing.state === 'due-now' ? 'bg-amber-50' :
        'bg-gradient-to-br from-brand-magenta/10 to-brand-purple/10'
      }`}>
        <p className="font-display text-sm font-bold text-brand-ink">{r.time}</p>
        <p className="font-mono text-[9px] uppercase tracking-wide text-brand-ink/50">
          {r.date.slice(5)}
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
            {r.title}
          </button>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[r.priority]}`}>
            {r.priority}
          </span>
          {r.purpose && (
            <span className="hidden shrink-0 rounded-full bg-brand-lilac/50 px-2 py-0.5 text-[9px] font-semibold text-brand-purple sm:inline-block">
              {r.purpose}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-brand-ink/50">
          {r.customer} · {r.mobile} · {meta.label}
        </p>
      </div>

      <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${timingStyle}`}>
        {timing.state === 'overdue' && <AlertCircle size={9} />}
        {timing.state === 'due-now' && <Zap size={9} />}
        {timing.state === 'completed' && <CheckCircle2 size={9} />}
        {timing.state === 'scheduled' && <Clock size={9} />}
        {timing.label}
      </span>

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
            {timing.state === 'overdue' && (
              <button
                onClick={onReschedule}
                className="hidden h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-3 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta sm:flex"
                title="Reschedule"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </>
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
   REMINDER CARD
   ================================================================ */
function ReminderCard({
  reminder, onView, onComplete, onSnooze, onCall, onReschedule,
}) {
  const r = reminder;
  const meta = TYPE_META[r.type] || TYPE_META.followup;
  const Icon = meta.icon;
  const isDone = r.status === 'completed';
  const canCall = r.type === 'call' || r.type === 'callback' || r.type === 'followup';
  const timing = r._timing;

  const accentBar =
    timing.state === 'overdue' ? 'from-rose-500 to-rose-600' :
    timing.state === 'due-now' ? 'from-amber-500 to-orange-500' :
    timing.state === 'completed' ? 'from-emerald-500 to-emerald-600' :
    'from-brand-magenta to-brand-purple';

  return (
    <div className={`group relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)] ${
      timing.state === 'overdue' ? 'border-rose-200 hover:border-rose-400' :
      timing.state === 'due-now' ? 'border-amber-200 hover:border-amber-400' :
      'border-brand-lilac/80 hover:border-brand-magenta/50'
    }`}>
      <span className={`pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-2xl bg-gradient-to-r ${accentBar}`} />

      <div className="relative flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg font-bold leading-tight text-brand-ink">{r.time}</p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand-ink/50">
              {r.date}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${PRIORITY_STYLES[r.priority]}`}>
            {r.priority}
          </span>
        </div>

        <div className={`mt-3 inline-flex items-center gap-1.5 self-start rounded-full px-2 py-0.5 text-[10px] font-bold ${
          timing.state === 'overdue' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' :
          timing.state === 'due-now' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
          timing.state === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' :
          'bg-brand-mist text-brand-ink/60'
        }`}>
          {timing.state === 'overdue' && <AlertCircle size={9} />}
          {timing.state === 'due-now' && <Zap size={9} />}
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
          {r.purpose && (
            <span className="ml-auto rounded-full bg-brand-lilac/50 px-2 py-0.5 text-[9px] font-semibold text-brand-purple">
              {r.purpose}
            </span>
          )}
        </div>

        <button
          onClick={onView}
          className="mt-3 truncate text-left text-sm font-semibold text-brand-ink hover:text-brand-magenta"
        >
          {r.title}
        </button>
        <p className="truncate text-[11px] text-brand-ink/50">
          {r.customer} · {r.mobile}
        </p>

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
   REMINDER DRAWER
   ================================================================ */
function ReminderDrawer({ reminder, onClose, onComplete, onSnooze, onCall, onNote, onReschedule, onDelete }) {
  const r = reminder;
  const meta = TYPE_META[r.type] || TYPE_META.followup;
  const Icon = meta.icon;
  const isDone = r.status === 'completed';
  const canCall = r.type === 'call' || r.type === 'callback' || r.type === 'followup';
  const timing = r._timing;

  const history = r.history || [];

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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${PRIORITY_STYLES[r.priority]}`}>
              <Flame size={11} /> {r.priority}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              timing.state === 'overdue' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' :
              timing.state === 'due-now' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
              timing.state === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' :
              'bg-brand-mist text-brand-ink/70'
            }`}>
              <Timer size={11} /> {timing.label}
            </span>
            {r.purpose && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-lilac/50 px-2.5 py-1 text-[11px] font-semibold text-brand-purple">
                <Target size={11} /> {r.purpose}
              </span>
            )}
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="flex items-center gap-1.5 font-display text-sm font-semibold text-brand-ink">
              <Sparkles size={12} className="text-brand-magenta" /> Lead Context
            </h4>
            <Row icon={Flame}       label="Stage"     value={r.leadStage || '—'} />
            <Row icon={Building2}   label="Source"    value={r.source || '—'} />
            <Row icon={Layers}      label="Campaign"  value={r.campaign || '—'} />
            <Row icon={IndianRupee} label="Budget"    value={r.budget || '—'} />
            <Row icon={MapPin}      label="Location"  value={r.location || '—'} />
            <Row icon={Target}      label="Last Outcome" value={r.lastOutcome || '—'} />
            {r.preferredContact && r.preferredContact !== '—' && (
              <Row icon={Clock} label="Preferred Contact" value={r.preferredContact} />
            )}
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Reminder</h4>
            <Row icon={Calendar} label="Date"     value={r.date} />
            <Row icon={Clock}    label="Time"     value={r.time} />
            <Row icon={Tag}      label="Type"     value={meta.label} />
          </div>

          {history.length > 0 && (
            <div className="card !p-4 space-y-3">
              <h4 className="flex items-center gap-1.5 font-display text-sm font-semibold text-brand-ink">
                <History size={12} className="text-brand-magenta" /> Recent Activity
              </h4>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 bg-white p-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-brand-magenta">
                      {h.icon === 'call' ? <Phone size={12} /> : h.icon === 'note' ? <StickyNote size={12} /> : <Calendar size={12} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-brand-ink">
                        {h.label}: <span className="font-normal text-brand-ink/70">{h.detail}</span>
                      </p>
                      <p className="text-[10px] text-brand-ink/40">{h.when}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {r.notes && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                <StickyNote size={10} /> Notes
              </p>
              <p className="whitespace-pre-line text-sm text-brand-ink/80">{r.notes}</p>
            </div>
          )}

          {isDone && r.completionOutcome && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                <CheckCircle2 size={10} /> Completion Outcome
              </p>
              <p className="text-sm font-semibold text-emerald-700">{r.completionOutcome}</p>
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

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
                  Quick Actions
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <QuickAction icon={MessageCircle} label="WhatsApp" />
                  <QuickAction icon={MessageSquare} label="SMS" />
                  <QuickAction icon={Mail}          label="Email" />
                  <QuickAction icon={ExternalLink}  label="View Lead" />
                </div>
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

function QuickAction({ icon: Icon, label }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white p-2 text-center transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40">
      <Icon size={14} className="text-brand-magenta" />
      <span className="text-[10px] font-semibold text-brand-ink/70">{label}</span>
    </button>
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

  const today = new Date();
  const suggestions = [
    { label: 'Today',     date: ymd(today),                       time: '17:00' },
    { label: 'Tomorrow',  date: ymd(new Date(today.getTime() + 86400000)), time: '10:00' },
    { label: 'Tomorrow',  date: ymd(new Date(today.getTime() + 86400000)), time: '14:00' },
    { label: 'Next week', date: ymd(new Date(today.getTime() + 7 * 86400000)), time: '10:00' },
  ];

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
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
              Suggested Times
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setDate(s.date); setTime(s.time); }}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                    date === s.date && time === s.time
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac bg-white text-brand-ink/70 hover:border-brand-magenta/40'
                  }`}
                >
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-[10px] opacity-70">{s.time}</p>
                </button>
              ))}
            </div>
          </div>

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
   SNOOZE MODAL
   ================================================================ */
function SnoozeModal({ reminder, onClose, onSave }) {
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
              <p className="text-xs text-brand-ink/50">{reminder.title}</p>
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
              onClick={() => onSave(reminder, p.value)}
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
   COMPLETE MODAL
   ================================================================ */
function CompleteModal({ reminder, onClose, onSave }) {
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
              <h3 className="font-display text-lg font-semibold text-brand-ink">Complete Reminder</h3>
              <p className="text-xs text-brand-ink/50">{reminder.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">What happened?</label>
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
            Schedule next follow-up
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
              onClick={() => onSave(reminder, outcome, note)}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Complete
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
    today:     'Nothing due today',
    overdue:   'No overdue reminders — nice!',
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

function AnimatedStatCard({ label, value, sub, icon: Icon, color, delay = 0, onClick, active }) {
  const numeric = typeof value === 'number' ? value : 0;
  const animated = useAnimatedCount(numeric);
  const display = typeof value === 'number' ? animated : value;

  const themes = {
    purple: {
      border: 'border-violet-200 hover:border-violet-400',
      activeBorder: 'border-violet-500 ring-2 ring-violet-200',
      bg: 'from-violet-50 via-violet-50/30 to-white',
      iconBg: 'bg-violet-100 text-brand-purple border-violet-200',
      bar: 'from-brand-purple to-brand-magenta',
      valueColor: 'text-brand-purple',
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-400',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-200',
      bg: 'from-emerald-50 via-emerald-50/30 to-white',
      iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      bar: 'from-emerald-500 to-emerald-400',
      valueColor: 'text-emerald-600',
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-400',
      activeBorder: 'border-amber-500 ring-2 ring-amber-200',
      bg: 'from-amber-50 via-amber-50/30 to-white',
      iconBg: 'bg-amber-100 text-amber-600 border-amber-200',
      bar: 'from-amber-500 to-orange-400',
      valueColor: 'text-amber-600',
    },
    rose: {
      border: 'border-rose-200 hover:border-rose-400',
      activeBorder: 'border-rose-500 ring-2 ring-rose-200',
      bg: 'from-rose-50 via-rose-50/30 to-white',
      iconBg: 'bg-rose-100 text-brand-magenta border-rose-200',
      bar: 'from-brand-magenta to-brand-purple',
      valueColor: 'text-brand-magenta',
    },
  };
  const t = themes[color] || themes.purple;
  const clickable = typeof onClick === 'function';

  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition-all duration-500 animate-fade-slide-in ${
        active ? t.activeBorder : t.border
      } ${clickable ? 'hover:-translate-y-1 hover:shadow-lg' : ''}`}
    >
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`absolute inset-x-0 top-0 h-1 origin-left bg-gradient-to-r ${t.bar} transition-transform duration-500 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />

      <div className="relative">
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} />
          </span>
        </div>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {display}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
      </div>
    </button>
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