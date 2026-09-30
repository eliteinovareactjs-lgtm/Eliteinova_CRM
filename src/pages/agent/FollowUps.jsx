// src/pages/agent/FollowUps.jsx
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar, CalendarCheck, CalendarClock, CalendarX, CheckCircle2,
  AlertCircle, Clock, Phone, X, Search, ChevronDown, ChevronLeft,
  ChevronRight, StickyNote, ListFilter, Inbox, User, Tag, TrendingUp,
  Megaphone, Flame, MessageCircle, Ban, RotateCcw, List, Grid3x3,
  Mail, Briefcase, XCircle, History, Plus, Zap, Play, AlertTriangle,
  Timer, AlarmClock, Send, Coffee, SkipForward,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS } from '../../data/mockData';

/* ================================================================
   CONSTANTS
   ================================================================ */
const TABS = [
  { key: 'today',           label: "Today's Follow-Ups", icon: CalendarCheck },
  { key: 'upcoming',        label: 'Upcoming',           icon: CalendarClock },
  { key: 'overdue',         label: 'Overdue',            icon: CalendarX },
  { key: 'completed',       label: 'Completed',          icon: CheckCircle2 },
  { key: 'not_interested',  label: 'Not Interested',     icon: Ban },
  { key: 'cancelled',       label: 'Cancelled',          icon: XCircle },
  { key: 'history',         label: 'Follow-Up History',  icon: History },
  { key: 'calendar',        label: 'Follow-Up Calendar', icon: Calendar },
];

const PRIORITY_STYLES = {
  High:   'border-rose-200 bg-rose-50 text-rose-600',
  Medium: 'border-amber-200 bg-amber-50 text-amber-600',
  Low:    'border-emerald-200 bg-emerald-50 text-emerald-600',
};

const STATUS_STYLES = {
  today:          'bg-amber-100 text-amber-700',
  upcoming:       'bg-blue-100 text-blue-600',
  overdue:        'bg-rose-100 text-rose-500',
  completed:      'bg-emerald-100 text-emerald-600',
  not_interested: 'bg-amber-100 text-amber-700',
  cancelled:      'bg-red-100 text-red-600',
};

const PURPOSE_OPTIONS = [
  'Callback', 'Product enquiry', 'Payment follow-up', 'Renewal',
  'Demo', 'Pricing', 'Document submission', 'Other',
];

const CLOSED_STATUSES = ['completed', 'not_interested', 'cancelled'];

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

/* ================================================================
   HELPERS
   ================================================================ */
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayYMD = () => ymd(new Date());

const toDateTime = (dateStr, timeStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

const relativeTime = (dateStr, timeStr) => {
  const due = toDateTime(dateStr, timeStr);
  const now = new Date();
  const diffMs = due - now;
  const absMin = Math.abs(Math.floor(diffMs / 60000));

  if (diffMs < 0) {
    if (absMin < 60) return { label: `Overdue ${absMin} min`, tone: 'overdue' };
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    if (h < 24) return { label: `Overdue ${h}h ${m}m`, tone: 'overdue' };
    const d = Math.floor(h / 24);
    return { label: `Overdue ${d}d ${h % 24}h`, tone: 'overdue' };
  }

  if (absMin < 1) return { label: 'Due now', tone: 'now' };
  if (absMin < 60) return { label: `Due in ${absMin} min`, tone: 'soon' };
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  if (h < 24) return { label: `Due in ${h}h ${m}m`, tone: 'later' };
  const d = Math.floor(h / 24);
  return { label: `Due in ${d}d ${h % 24}h`, tone: 'future' };
};

const getTimeBucket = (dateStr, timeStr) => {
  const due = toDateTime(dateStr, timeStr);
  const now = new Date();
  const diffMin = (due - now) / 60000;

  if (diffMin < 0) return 'overdue';
  if (diffMin <= 30) return 'due-now';
  if (diffMin <= 120) return 'soon';
  return 'later';
};

const addToDateTime = (dateStr, timeStr, { minutes = 0, hours = 0, days = 0 }) => {
  const dt = toDateTime(dateStr, timeStr);
  dt.setMinutes(dt.getMinutes() + minutes);
  dt.setHours(dt.getHours() + hours);
  dt.setDate(dt.getDate() + days);
  return {
    date: ymd(dt),
    time: `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
  };
};

/* ================================================================
   DEMO FOLLOW-UPS
   ================================================================ */
const buildDemoFollowUps = (agentName, websiteId) => {
  const now = new Date();
  const today     = ymd(now);
  const tomorrow  = ymd(new Date(now.getTime() + 86400000));
  const yesterday = ymd(new Date(now.getTime() - 86400000));
  const nextWeek  = ymd(new Date(now.getTime() + 5 * 86400000));
  const lastWeek  = ymd(new Date(now.getTime() - 5 * 86400000));

  return [
    { id: 'f-1', agentName, websiteId, customer: 'Customer A', mobile: '9876543210', date: today,     time: '10:00', purpose: 'Callback',            priority: 'High',   status: 'today',          notes: 'Wants pricing details.' },
    { id: 'f-2', agentName, websiteId, customer: 'Customer B', mobile: '9876543211', date: today,     time: '11:30', purpose: 'Product enquiry',     priority: 'Medium', status: 'today',          notes: '' },
    { id: 'f-3', agentName, websiteId, customer: 'Customer C', mobile: '9876543212', date: today,     time: '14:00', purpose: 'Payment follow-up',   priority: 'High',   status: 'today',          notes: 'Awaiting PO.' },
    { id: 'f-4', agentName, websiteId, customer: 'Customer D', mobile: '9876543213', date: today,     time: '16:15', purpose: 'Renewal',             priority: 'Medium', status: 'today',          notes: '' },
    { id: 'f-5', agentName, websiteId, customer: 'Customer E', mobile: '9876543214', date: tomorrow,  time: '09:45', purpose: 'Demo',                priority: 'High',   status: 'upcoming',       notes: '' },
    { id: 'f-6', agentName, websiteId, customer: 'Customer F', mobile: '9876543215', date: nextWeek,  time: '11:00', purpose: 'Pricing',             priority: 'Medium', status: 'upcoming',       notes: '' },
    { id: 'f-7', agentName, websiteId, customer: 'Customer G', mobile: '9876543216', date: yesterday, time: '15:00', purpose: 'Document submission', priority: 'High',   status: 'overdue',        notes: 'Asked for GST cert.' },
    { id: 'f-8', agentName, websiteId, customer: 'Customer H', mobile: '9876543217', date: lastWeek,  time: '12:30', purpose: 'Callback',            priority: 'Low',    status: 'overdue',        notes: '' },
    { id: 'f-9', agentName, websiteId, customer: 'Customer I', mobile: '9876543218', date: today,     time: '08:30', purpose: 'Payment follow-up',   priority: 'Medium', status: 'completed',      notes: 'Paid in full.', closedAt: new Date(Date.now() - 3600_000).toISOString() },
    { id: 'f-10', agentName, websiteId, customer: 'Customer J', mobile: '9876543219', date: yesterday, time: '11:00', purpose: 'Product enquiry',     priority: 'Low',    status: 'not_interested', notes: 'Not interested.', closedAt: new Date(Date.now() - 86400_000).toISOString() },
    { id: 'f-11', agentName, websiteId, customer: 'Customer K', mobile: '9876543220', date: lastWeek,  time: '13:00', purpose: 'Demo',                priority: 'Medium', status: 'not_interested', notes: 'Chose competitor.', closedAt: new Date(Date.now() - 6 * 86400_000).toISOString() },
    { id: 'f-12', agentName, websiteId, customer: 'Customer L', mobile: '9876543221', date: yesterday, time: '17:00', purpose: 'Callback',            priority: 'Low',    status: 'cancelled',      notes: 'Customer cancelled.', closedAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
  ];
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function FollowUps() {
  const { user, activeWebsiteId } = useAuth();

  const [activeTab, setActiveTab] = useState('today');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [toast, setToast] = useState(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [showNote, setShowNote] = useState(null);
  const [showReschedule, setShowReschedule] = useState(null);
  const [showSnooze, setShowSnooze] = useState(null);
  const [callingFollowUp, setCallingFollowUp] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarDay, setCalendarDay] = useState(null);
  const [showAddFollowUp, setShowAddFollowUp] = useState(null);

  const [callQueue, setCallQueue] = useState(null);
  const [queueIndex, setQueueIndex] = useState(0);
  const [dispositionTarget, setDispositionTarget] = useState(null);
  const [sessionCompleted, setSessionCompleted] = useState(0);

  const [, forceTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(i);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const [followUps, setFollowUps] = useState(() =>
    buildDemoFollowUps(user?.name || 'Agent', activeWebsiteId)
  );

  useEffect(() => {
    setFollowUps(buildDemoFollowUps(user?.name || 'Agent', activeWebsiteId));
  }, [user?.name, activeWebsiteId]);

  const summary = useMemo(() => {
    const today         = followUps.filter((f) => f.status === 'today').length;
    const upcoming      = followUps.filter((f) => f.status === 'upcoming').length;
    const overdue       = followUps.filter((f) => f.status === 'overdue').length;
    const completed     = followUps.filter((f) => f.status === 'completed').length;
    const notInterested = followUps.filter((f) => f.status === 'not_interested').length;
    const cancelled     = followUps.filter((f) => f.status === 'cancelled').length;
    const historyCount  = completed + notInterested + cancelled;
    return { today, upcoming, overdue, completed, notInterested, cancelled, historyCount, total: followUps.length };
  }, [followUps]);

  const todayFocus = useMemo(() => {
    const todays = followUps.filter(
      (f) => f.status === 'today' || f.status === 'overdue'
    );

    const overdue = todays.filter((f) => getTimeBucket(f.date, f.time) === 'overdue');
    const dueNow  = todays.filter((f) => getTimeBucket(f.date, f.time) === 'due-now');
    const soon    = todays.filter((f) => getTimeBucket(f.date, f.time) === 'soon');
    const high    = todays.filter((f) => f.priority === 'High');

    const todayAll = followUps.filter((f) => f.status === 'today' || f.status === 'overdue');
    const todayDone = followUps.filter(
      (f) => f.status === 'completed' && f.date === todayYMD()
    ).length;

    return {
      overdueCount: overdue.length,
      dueNowCount: dueNow.length,
      soonCount: soon.length,
      highCount: high.length,
      todayTotal: todayAll.length,
      todayDone,
      progressPct: todayAll.length > 0 ? Math.round((todayDone / todayAll.length) * 100) : 0,
      queue: [...todays].sort((a, b) => {
        const ba = getTimeBucket(a.date, a.time);
        const bb = getTimeBucket(b.date, b.time);
        const bucketRank = { overdue: 0, 'due-now': 1, soon: 2, later: 3 };
        const bucketDiff = bucketRank[ba] - bucketRank[bb];
        if (bucketDiff !== 0) return bucketDiff;
        const prioDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (prioDiff !== 0) return prioDiff;
        return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
      }),
    };
  }, [followUps]);

  const filteredFollowUps = useMemo(() => {
    if (activeTab === 'calendar' || activeTab === 'history') return [];
    let list = followUps.filter((f) => f.status === activeTab);

    if (priorityFilter !== 'All') list = list.filter((f) => f.priority === priorityFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => {
        const hay = `${f.customer} ${f.mobile} ${f.purpose} ${f.notes || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return [...list].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );
  }, [followUps, activeTab, priorityFilter, searchQuery]);

  const historyFollowUps = useMemo(() => {
    let list = followUps.filter((f) => CLOSED_STATUSES.includes(f.status));
    if (priorityFilter !== 'All') list = list.filter((f) => f.priority === priorityFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => {
        const hay = `${f.customer} ${f.mobile} ${f.purpose} ${f.notes || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return [...list].sort((a, b) => {
      const aKey = a.closedAt || `${a.date} ${a.time}`;
      const bKey = b.closedAt || `${b.date} ${b.time}`;
      return bKey.localeCompare(aKey);
    });
  }, [followUps, priorityFilter, searchQuery]);

  const updateFollowUp = useCallback((id, patch) =>
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f))), []);

  const handleComplete = (f) => {
    updateFollowUp(f.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
    });
    setSessionCompleted((n) => n + 1);
    showToast(`Follow-up marked complete for ${f.customer}`);
  };

  const handleMarkNotInterested = (f) => {
    updateFollowUp(f.id, {
      status: 'not_interested',
      notes: (f.notes ? `${f.notes}\n` : '') + 'Marked as Not Interested',
      closedAt: new Date().toISOString(),
    });
    showToast(`${f.customer} marked Not Interested`, 'error');
  };

  const handleCancel = (f) => {
    updateFollowUp(f.id, {
      status: 'cancelled',
      notes: (f.notes ? `${f.notes}\n` : '') + 'Cancelled',
      closedAt: new Date().toISOString(),
    });
    showToast('Follow-up cancelled', 'error');
  };

  const handleReschedule = (f, { date, time }) => {
    const isToday = date === todayYMD();
    const isPast = toDateTime(date, time) < new Date();
    const newStatus = isPast ? 'overdue' : isToday ? 'today' : 'upcoming';
    updateFollowUp(f.id, { date, time, status: newStatus });
    setShowReschedule(null);
    showToast(`Rescheduled to ${date} · ${time}`);
  };

  const handleSnooze = (f, option) => {
    let newDate = f.date;
    let newTime = f.time;

    switch (option) {
      case '15min': {
        const r = addToDateTime(f.date, f.time, { minutes: 15 });
        newDate = r.date; newTime = r.time; break;
      }
      case '30min': {
        const r = addToDateTime(f.date, f.time, { minutes: 30 });
        newDate = r.date; newTime = r.time; break;
      }
      case '1hour': {
        const r = addToDateTime(f.date, f.time, { hours: 1 });
        newDate = r.date; newTime = r.time; break;
      }
      case 'tomorrow': {
        const r = addToDateTime(f.date, '10:00', { days: 1 });
        newDate = r.date; newTime = r.time; break;
      }
      case 'nextweek': {
        const r = addToDateTime(f.date, f.time, { days: 7 });
        newDate = r.date; newTime = r.time; break;
      }
      default: break;
    }

    const isToday = newDate === todayYMD();
    const isPast = toDateTime(newDate, newTime) < new Date();
    updateFollowUp(f.id, {
      date: newDate,
      time: newTime,
      status: isPast ? 'overdue' : isToday ? 'today' : 'upcoming',
    });
    setShowSnooze(null);
    showToast(`Snoozed to ${newDate} · ${newTime}`);
  };

  const handleSaveNote = (f, note) => {
    updateFollowUp(f.id, { notes: (f.notes ? `${f.notes}\n` : '') + note });
    setShowNote(null);
    showToast('Note saved');
  };

  const handleCallNow = (f) => setCallingFollowUp(f);

  const handleCallEnd = (payload) => {
    if (!callingFollowUp) return;
    const target = callingFollowUp;
    updateFollowUp(target.id, {
      notes:
        (target.notes ? `${target.notes}\n` : '') +
        `Call: ${payload.outcome} (${payload.duration})${payload.notes ? ` — ${payload.notes}` : ''}`,
      lastCallAt: new Date().toISOString(),
      lastOutcome: payload.outcome,
    });
    setCallingFollowUp(null);
    setDispositionTarget({ ...target, callNotes: payload.notes });
  };

  const handleSaveDisposition = (f, outcome, notes, nextDateTime) => {
    if (outcome === 'Callback' && nextDateTime) {
      updateFollowUp(f.id, {
        date: nextDateTime.date,
        time: nextDateTime.time,
        status: nextDateTime.date === todayYMD() ? 'today' : 'upcoming',
        notes:
          (f.notes ? `${f.notes}\n` : '') +
          `Rescheduled callback${notes ? `: ${notes}` : ''}`,
        lastOutcome: 'Callback',
        lastCallAt: new Date().toISOString(),
      });
      showToast(`Rescheduled callback for ${nextDateTime.date} · ${nextDateTime.time}`);
    } else if (outcome === 'Converted' || outcome === 'Interested') {
      updateFollowUp(f.id, {
        status: 'completed',
        notes:
          (f.notes ? `${f.notes}\n` : '') +
          `Call: ${outcome}${notes ? ` — ${notes}` : ''}`,
        lastOutcome: outcome,
        lastCallAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
      });
      setSessionCompleted((n) => n + 1);
      showToast(`Marked ${outcome}`);
    } else if (outcome === 'Not Interested') {
      updateFollowUp(f.id, {
        status: 'not_interested',
        notes:
          (f.notes ? `${f.notes}\n` : '') +
          `Call: ${outcome}${notes ? ` — ${notes}` : ''}`,
        lastOutcome: outcome,
        lastCallAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
      });
      showToast(`Marked Not Interested`, 'error');
    } else {
      updateFollowUp(f.id, {
        notes:
          (f.notes ? `${f.notes}\n` : '') +
          `Call: ${outcome}${notes ? ` — ${notes}` : ''}`,
        lastOutcome: outcome,
        lastCallAt: new Date().toISOString(),
      });
      showToast(`Logged ${outcome}`);
    }

    setDispositionTarget(null);

    if (callQueue) {
      const nextIndex = queueIndex + 1;
      if (nextIndex < callQueue.length) {
        setQueueIndex(nextIndex);
        setCallingFollowUp(callQueue[nextIndex]);
        showToast(`Next follow-up · ${callQueue[nextIndex].customer}`);
      } else {
        setCallQueue(null);
        setQueueIndex(0);
        showToast('Follow-up queue complete 🎉');
      }
    }
  };

  const handleStartQueue = () => {
    const queue = todayFocus.queue;
    if (queue.length === 0) {
      showToast('No follow-ups to call right now', 'error');
      return;
    }
    setCallQueue(queue);
    setQueueIndex(0);
    setCallingFollowUp(queue[0]);
  };

  const handleSkipQueue = () => {
    if (!callQueue) return;
    const nextIndex = queueIndex + 1;
    if (nextIndex < callQueue.length) {
      setQueueIndex(nextIndex);
      setCallingFollowUp(callQueue[nextIndex]);
    } else {
      setCallQueue(null);
      setQueueIndex(0);
      showToast('Follow-up queue complete 🎉');
    }
  };

  const handleStopQueue = () => {
    setCallQueue(null);
    setQueueIndex(0);
    setCallingFollowUp(null);
    setDispositionTarget(null);
  };

  const handleAddFollowUp = (data) => {
    const isToday = data.date === todayYMD();
    const newFollowUp = {
      id: `f-${Date.now()}`,
      agentName: user?.name || 'Agent',
      websiteId: activeWebsiteId,
      customer: data.customer,
      mobile: data.mobile,
      date: data.date,
      time: data.time,
      purpose: data.purpose,
      priority: data.priority,
      status: isToday ? 'today' : 'upcoming',
      notes: data.notes || '',
    };
    setFollowUps((prev) => [newFollowUp, ...prev]);
    setShowAddFollowUp(null);
    showToast(`Follow-up scheduled for ${data.customer}`);
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
            <h1 className="font-display text-xl font-semibold text-brand-ink">Follow-Ups</h1>
            <p className="text-sm text-brand-ink/50">
              Stay on top of every scheduled customer follow-up.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {callQueue ? (
              <div className="flex items-center gap-3 rounded-full border border-brand-magenta/30 bg-gradient-to-r from-brand-magenta/[0.10] to-brand-purple/[0.10] px-4 py-2 text-xs font-semibold text-brand-magenta">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} />
                  Follow-Up Queue
                  <span className="ml-0.5 rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] text-brand-magenta">
                    {String(queueIndex + 1).padStart(2, '0')} / {String(callQueue.length).padStart(2, '0')}
                  </span>
                </span>
                <button
                  onClick={handleStopQueue}
                  className="rounded-full p-0.5 hover:bg-brand-magenta/20"
                  title="Stop queue"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddFollowUp(true)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Plus size={14} /> New Follow-Up
              </button>
            )}
          </div>
        </div>

        {/* ================= TODAY'S FOCUS + PROGRESS ================= */}
        <TodayFocusCard
          focus={todayFocus}
          onStartQueue={handleStartQueue}
        />

        {/* ================= KPI STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard label="Total"     value={summary.total}     sub="All follow-ups"   icon={Calendar}       color="purple"  delay={0} />
          <AnimatedStatCard label="Today"     value={summary.today}     sub="Scheduled today"  icon={CalendarCheck}  color="purple"  delay={40} />
          <AnimatedStatCard label="Upcoming"  value={summary.upcoming}  sub="Next days"        icon={CalendarClock}  color="emerald" delay={80} />
          <AnimatedStatCard label="Overdue"   value={summary.overdue}   sub="Needs attention"  icon={CalendarX}      color="rose"    delay={120} />
          <AnimatedStatCard label="Completed" value={summary.completed} sub="Done"             icon={CheckCircle2}   color="emerald" delay={160} />
        </div>

        {/* ================= TABS + VIEW TOGGLE ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count =
                t.key === 'today'           ? summary.today :
                t.key === 'upcoming'        ? summary.upcoming :
                t.key === 'overdue'         ? summary.overdue :
                t.key === 'completed'       ? summary.completed :
                t.key === 'not_interested'  ? summary.notInterested :
                t.key === 'cancelled'       ? summary.cancelled :
                t.key === 'history'         ? summary.historyCount :
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
              <CalendarView
                followUps={followUps}
                month={calendarMonth}
                onPrev={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                onNext={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                onToday={() => setCalendarMonth(new Date())}
                onSelectDay={(dateKey) => setCalendarDay(dateKey)}
                activeDay={calendarDay}
              />
            </div>
            <DayFollowUpsPanel
              dateKey={calendarDay}
              followUps={followUps}
              onClear={() => setCalendarDay(null)}
              onView={(f) => setSelectedFollowUp(f)}
              onCall={(f) => handleCallNow(f)}
              onComplete={(f) => handleComplete(f)}
              onAddForDay={(dateKey) => { setCalendarDay(dateKey); setShowAddFollowUp({ date: dateKey }); }}
            />
          </div>
        ) : activeTab === 'history' ? (
          /* ============================================================
             FOLLOW-UP HISTORY — now respects viewMode (list / grid)
             ============================================================ */
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search closed follow-ups..."
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

              <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
                <History size={14} className="text-brand-magenta" />
                History: <span className="text-brand-magenta">{historyFollowUps.length}</span>
              </span>
            </div>

            {historyFollowUps.length === 0 ? (
              <EmptyState tab="history" />
            ) : viewMode === 'grid' ? (
              /* ⬅️ NEW — grid view */
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {historyFollowUps.map((f) => (
                  <FollowUpCard
                    key={f.id}
                    followUp={f}
                    history
                    onView={() => setSelectedFollowUp(f)}
                    onCall={() => handleCallNow(f)}
                    onComplete={() => handleComplete(f)}
                    onReschedule={() => setShowReschedule(f)}
                    onSnooze={() => setShowSnooze(f)}
                    onNote={() => setShowNote(f)}
                    onCancel={() => handleCancel(f)}
                    onNotInterested={() => handleMarkNotInterested(f)}
                  />
                ))}
              </div>
            ) : (
              /* ⬅️ list view */
              <div className="space-y-2">
                {historyFollowUps.map((f) => (
                  <FollowUpRow
                    key={f.id}
                    followUp={f}
                    history
                    onView={() => setSelectedFollowUp(f)}
                    onCall={() => handleCallNow(f)}
                    onComplete={() => handleComplete(f)}
                    onReschedule={() => setShowReschedule(f)}
                    onSnooze={() => setShowSnooze(f)}
                    onNote={() => setShowNote(f)}
                    onCancel={() => handleCancel(f)}
                    onNotInterested={() => handleMarkNotInterested(f)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* ================= NORMAL TABS ================= */
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer, mobile, purpose..."
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

              <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
                <ListFilter size={14} className="text-brand-magenta" />
                Showing: <span className="text-brand-magenta">{filteredFollowUps.length}</span>
              </span>
            </div>

            {filteredFollowUps.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredFollowUps.map((f) => (
                  <FollowUpCard
                    key={f.id}
                    followUp={f}
                    onView={() => setSelectedFollowUp(f)}
                    onCall={() => handleCallNow(f)}
                    onComplete={() => handleComplete(f)}
                    onReschedule={() => setShowReschedule(f)}
                    onSnooze={() => setShowSnooze(f)}
                    onNote={() => setShowNote(f)}
                    onCancel={() => handleCancel(f)}
                    onNotInterested={() => handleMarkNotInterested(f)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFollowUps.map((f) => (
                  <FollowUpRow
                    key={f.id}
                    followUp={f}
                    onView={() => setSelectedFollowUp(f)}
                    onCall={() => handleCallNow(f)}
                    onComplete={() => handleComplete(f)}
                    onReschedule={() => setShowReschedule(f)}
                    onSnooze={() => setShowSnooze(f)}
                    onNote={() => setShowNote(f)}
                    onCancel={() => handleCancel(f)}
                    onNotInterested={() => handleMarkNotInterested(f)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ================= MODALS ================= */}
        {selectedFollowUp && (
          <FollowUpDrawer
            followUp={selectedFollowUp}
            onClose={() => setSelectedFollowUp(null)}
            onCall={() => { setCallingFollowUp(selectedFollowUp); setSelectedFollowUp(null); }}
            onComplete={() => { handleComplete(selectedFollowUp); setSelectedFollowUp(null); }}
            onReschedule={() => { setShowReschedule(selectedFollowUp); setSelectedFollowUp(null); }}
            onSnooze={() => { setShowSnooze(selectedFollowUp); setSelectedFollowUp(null); }}
            onNote={() => { setShowNote(selectedFollowUp); setSelectedFollowUp(null); }}
            onCancel={() => { handleCancel(selectedFollowUp); setSelectedFollowUp(null); }}
            onNotInterested={() => { handleMarkNotInterested(selectedFollowUp); setSelectedFollowUp(null); }}
          />
        )}

        {showNote && (
          <NoteModal
            followUp={showNote}
            onClose={() => setShowNote(null)}
            onSave={handleSaveNote}
          />
        )}

        {showReschedule && (
          <RescheduleModal
            followUp={showReschedule}
            onClose={() => setShowReschedule(null)}
            onSave={handleReschedule}
          />
        )}

        {showSnooze && (
          <SnoozeModal
            followUp={showSnooze}
            onClose={() => setShowSnooze(null)}
            onPick={handleSnooze}
          />
        )}

        {callingFollowUp && (
          <CallModal
            target={callingFollowUp}
            inQueue={!!callQueue}
            queueIndex={queueIndex}
            queueSize={callQueue?.length || 0}
            nextFollowUp={callQueue?.[queueIndex + 1]}
            onSkip={handleSkipQueue}
            onClose={() => setCallingFollowUp(null)}
            onEnd={handleCallEnd}
          />
        )}

        {dispositionTarget && (
          <DispositionModal
            followUp={dispositionTarget}
            initialNotes={dispositionTarget.callNotes || ''}
            onClose={() => {
              setDispositionTarget(null);
              if (callQueue) handleSkipQueue();
            }}
            onSave={handleSaveDisposition}
          />
        )}

        {showAddFollowUp && (
          <AddFollowUpModal
            defaultDate={typeof showAddFollowUp === 'object' ? showAddFollowUp.date : undefined}
            onClose={() => setShowAddFollowUp(null)}
            onSave={handleAddFollowUp}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ================================================================
   TODAY'S FOCUS CARD
   ================================================================ */
function TodayFocusCard({ focus, onStartQueue }) {
  const hasWork = focus.queue.length > 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-r from-white via-white to-brand-lilac/20 shadow-[0_8px_24px_-12px_rgba(227,28,121,0.2)]">
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-magenta/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-brand-purple/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
              <Zap size={14} />
              <span className="absolute inset-0 -z-10 animate-ping rounded-lg bg-brand-magenta/30" />
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
              Today's Follow-Up Focus
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <FocusStat value={focus.overdueCount}  label="Overdue"      tone="rose"  icon={AlertTriangle} />
            <span className="hidden h-8 w-px bg-brand-lilac sm:block" />
            <FocusStat value={focus.dueNowCount}   label="Due Now"      tone="amber" icon={Timer} />
            <span className="hidden h-8 w-px bg-brand-lilac sm:block" />
            <FocusStat value={focus.soonCount}     label="Due Soon"     tone="purple" icon={Clock} />
            <span className="hidden h-8 w-px bg-brand-lilac sm:block" />
            <FocusStat value={focus.highCount}     label="High Priority" tone="rose"  icon={Flame} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-semibold uppercase tracking-wide text-brand-ink/50">
                Today's progress
              </span>
              <span className="font-mono font-bold text-brand-ink">
                {focus.todayDone} / {focus.todayTotal} · {focus.progressPct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                style={{ width: `${focus.progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={onStartQueue}
          disabled={!hasWork}
          className="group/btn relative inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-14px_rgba(227,28,121,0.7)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Play size={15} className="transition-transform group-hover/btn:scale-110" />
          Start Follow-Up Queue
          {hasWork && (
            <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
              {focus.queue.length}
            </span>
          )}
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
   RELATIVE TIME BADGE
   ================================================================ */
function RelativeTimeBadge({ date, time }) {
  const { label, tone } = relativeTime(date, time);

  const styles = {
    overdue: 'border-rose-200 bg-rose-50 text-rose-600',
    now:     'border-amber-200 bg-amber-50 text-amber-700',
    soon:    'border-amber-200 bg-amber-50 text-amber-700',
    later:   'border-slate-200 bg-slate-50 text-slate-600',
    future:  'border-slate-200 bg-slate-50 text-slate-600',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${styles[tone] || styles.later}`}>
      {tone === 'overdue' ? <AlertTriangle size={9} /> :
       tone === 'now' ? <Timer size={9} /> :
       tone === 'soon' ? <Clock size={9} /> :
       <CalendarClock size={9} />}
      {label}
    </span>
  );
}

/* ================================================================
   FOLLOW-UP ROW
   ================================================================ */
function FollowUpRow({
  followUp, history = false,
  onView, onCall, onComplete, onReschedule, onSnooze, onNote, onCancel, onNotInterested,
}) {
  const f = followUp;
  const isClosed = CLOSED_STATUSES.includes(f.status);

  return (
    <div className="group relative flex flex-wrap items-center gap-3 rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:border-brand-magenta/40 hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <div className="flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta/10 to-brand-purple/10">
        <p className="font-display text-sm font-bold text-brand-ink">{f.time}</p>
        <p className="font-mono text-[9px] uppercase tracking-wide text-brand-ink/50">
          {f.date.slice(5)}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onView}
            className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta"
          >
            {f.customer}
          </button>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[f.priority]}`}>
            {f.priority}
          </span>
          {!isClosed && <RelativeTimeBadge date={f.date} time={f.time} />}
          {history && (
            <span className="shrink-0 rounded-full bg-brand-mist px-2 py-0.5 text-[9px] font-bold text-brand-purple">
              Closed
            </span>
          )}
        </div>
        <p className="truncate text-xs text-brand-ink/50">
          {f.mobile} · {f.purpose}
        </p>
      </div>

      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${STATUS_STYLES[f.status]}`}>
        {f.status.replace('_', ' ')}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        {!isClosed && (
          <>
            <button
              onClick={onCall}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 px-3 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
              title="Call Now"
            >
              <Phone size={12} /> Call
            </button>
            <button
              onClick={onSnooze}
              className="hidden h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta sm:flex"
              title="Snooze"
            >
              <AlarmClock size={12} />
            </button>
            <button
              onClick={onComplete}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple px-3 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
              title="Complete"
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
          <User size={12} /> View
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   FOLLOW-UP CARD
   ================================================================ */
function FollowUpCard({
  followUp, history = false,
  onView, onCall, onComplete, onReschedule, onSnooze, onNote, onCancel, onNotInterested,
}) {
  const f = followUp;
  const isClosed = CLOSED_STATUSES.includes(f.status);

  return (
    <div className="group relative flex flex-col rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-magenta/50 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-2xl">
        <span className="block h-full w-full origin-left scale-x-0 bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />
      </span>

      <div className="relative flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex flex-col">
            <p className="font-display text-lg font-bold leading-tight text-brand-ink">{f.time}</p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-brand-ink/50">
              {f.date}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${STATUS_STYLES[f.status]}`}>
            {f.status.replace('_', ' ')}
          </span>
        </div>

        {!isClosed && (
          <div className="mb-3">
            <RelativeTimeBadge date={f.date} time={f.time} />
          </div>
        )}

        {isClosed && history && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-purple">
              <History size={9} /> Closed
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white shadow-sm">
            {f.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </span>
          <div className="min-w-0 flex-1">
            <button
              onClick={onView}
              className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta"
            >
              {f.customer}
            </button>
            <p className="truncate text-[11px] text-brand-ink/50">{f.mobile}</p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-2.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-brand-ink/50">
              <MessageCircle size={10} /> Purpose
            </span>
            <span className="truncate font-semibold text-brand-ink">{f.purpose}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-brand-ink/50">
              <Flame size={10} /> Priority
            </span>
            <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[f.priority]}`}>
              {f.priority}
            </span>
          </div>
        </div>

        {!isClosed ? (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={onCall}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Phone size={12} /> Call
              </button>
              <button
                onClick={onComplete}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <CheckCircle2 size={12} /> Done
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={onSnooze}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
              >
                <AlarmClock size={12} /> Snooze
              </button>
              <button
                onClick={onView}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
              >
                <User size={12} /> Details
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={`mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold ring-1 ${
              f.status === 'completed'
                ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
                : f.status === 'not_interested'
                  ? 'bg-amber-50 text-amber-700 ring-amber-200'
                  : 'bg-red-50 text-red-600 ring-red-200'
            }`}>
              <CheckCircle2 size={12} /> {f.status === 'completed' ? 'Completed' : f.status === 'not_interested' ? 'Not Interested' : 'Cancelled'}
            </div>

            <button
              onClick={onView}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
            >
              <User size={12} /> View Details
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   SNOOZE MODAL
   ================================================================ */
function SnoozeModal({ followUp, onClose, onPick }) {
  const options = [
    { key: '15min',    label: 'In 15 minutes',  icon: Timer,   hint: 'Quick snooze' },
    { key: '30min',    label: 'In 30 minutes',  icon: Timer,   hint: '' },
    { key: '1hour',    label: 'In 1 hour',      icon: Clock,   hint: '' },
    { key: 'tomorrow', label: 'Tomorrow 10 AM', icon: CalendarClock, hint: '' },
    { key: 'nextweek', label: 'Next week',      icon: CalendarClock, hint: '' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <AlarmClock size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Snooze Follow-Up</h3>
              <p className="text-xs text-brand-ink/50">{followUp.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1.5">
          {options.map((o) => {
            const Icon = o.icon;
            return (
              <button
                key={o.key}
                onClick={() => onPick(followUp, o.key)}
                className="flex w-full items-center gap-3 rounded-xl border border-brand-lilac bg-white px-3 py-2.5 text-left transition-all hover:border-brand-magenta hover:bg-brand-magenta/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-brand-magenta">
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-ink">{o.label}</p>
                  {o.hint && <p className="text-[10px] text-brand-ink/50">{o.hint}</p>}
                </div>
                <ChevronRight size={14} className="text-brand-ink/30" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   DISPOSITION MODAL
   ================================================================ */
function DispositionModal({ followUp, initialNotes = '', onClose, onSave }) {
  const [outcome, setOutcome] = useState('Connected');
  const [notes, setNotes] = useState(initialNotes);
  const [rescheduleDate, setRescheduleDate] = useState(followUp.date);
  const [rescheduleTime, setRescheduleTime] = useState(followUp.time);

  const isCallback = outcome === 'Callback';

  const OUTCOMES = [
    { key: 'Connected' },
    { key: 'No Answer' },
    { key: 'Busy' },
    { key: 'Interested' },
    { key: 'Converted' },
    { key: 'Not Interested' },
    { key: 'Callback' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <ListFilter size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Call Outcome</h3>
              <p className="text-xs text-brand-ink/50">{followUp.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Outcome</label>
            <div className="grid grid-cols-2 gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setOutcome(o.key)}
                  className={`rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-all ${
                    outcome === o.key
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac bg-white text-brand-ink/70 hover:bg-brand-lilac/30'
                  }`}
                >
                  {o.key}
                </button>
              ))}
            </div>
          </div>

          {isCallback && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-amber-700">
                <CalendarClock size={12} /> Reschedule for callback
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
                />
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
                />
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
              placeholder="Add context..."
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
              onClick={() =>
                onSave(
                  followUp,
                  outcome,
                  notes,
                  isCallback ? { date: rescheduleDate, time: rescheduleTime } : null
                )
              }
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              {isCallback ? 'Save & Reschedule' : 'Save & Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CALENDAR VIEW
   ================================================================ */
function CalendarView({ followUps, month, onPrev, onNext, onToday, onSelectDay, activeDay }) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startWeekday = monthStart.getDay();

  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) {
    days.push(new Date(month.getFullYear(), month.getMonth(), d));
  }

  const byDate = followUps.reduce((acc, f) => {
    if (!acc[f.date]) acc[f.date] = [];
    acc[f.date].push(f);
    return acc;
  }, {});

  const todayStr = todayYMD();
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const densityTint = (count, isToday) => {
    if (isToday) return 'bg-brand-magenta/[0.06]';
    if (count === 0) return 'hover:bg-brand-mist/40';
    if (count === 1) return 'bg-brand-lilac/[0.15] hover:bg-brand-lilac/30';
    if (count <= 3) return 'bg-brand-lilac/[0.30] hover:bg-brand-lilac/40';
    return 'bg-brand-lilac/[0.55] hover:bg-brand-lilac/60';
  };

  const cellColor = (status) =>
    status === 'overdue'        ? 'bg-rose-100 text-rose-600' :
    status === 'completed'      ? 'bg-emerald-100 text-emerald-600' :
    status === 'upcoming'       ? 'bg-blue-100 text-blue-600' :
    status === 'not_interested' ? 'bg-amber-100 text-amber-700' :
    status === 'cancelled'      ? 'bg-red-100 text-red-600' :
                                  'bg-amber-100 text-amber-700';

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-brand-lilac/60 bg-gradient-to-r from-brand-magenta/[0.05] to-brand-purple/[0.05] px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
            Follow-Up Calendar
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
                {items.length > 0 && (
                  <span className="rounded-full bg-brand-lilac px-1.5 text-[9px] font-bold text-brand-purple">
                    {items.length}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {items.slice(0, 2).map((f) => (
                  <div
                    key={f.id}
                    className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-left text-[10px] font-semibold ${cellColor(f.status)}`}
                  >
                    <span className="font-mono">{f.time}</span>
                    <span className="truncate">{f.customer}</span>
                  </div>
                ))}
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
   DAY PANEL
   ================================================================ */
function DayFollowUpsPanel({ dateKey, followUps, onClear, onView, onCall, onComplete, onAddForDay }) {
  const dayItems = useMemo(() => {
    if (!dateKey) return [];
    return [...followUps]
      .filter((f) => f.date === dateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [followUps, dateKey]);

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
          Click any date on the calendar to see all follow-ups scheduled for that day.
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
            {dayItems.length} follow-up{dayItems.length !== 1 ? 's' : ''}
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
        {dayItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
              <Inbox size={18} />
            </span>
            <p className="text-xs font-semibold text-brand-ink">No follow-ups for this day</p>
            <button
              onClick={() => onAddForDay(dateKey)}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
            >
              <Plus size={11} /> Add Follow-Up
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {dayItems.map((f) => {
              const isClosed = CLOSED_STATUSES.includes(f.status);
              return (
                <div
                  key={f.id}
                  className={`rounded-xl border-2 bg-white p-2.5 transition-all hover:shadow-sm ${
                    isClosed ? 'border-emerald-200' : 'border-brand-lilac/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                        {f.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => onView(f)}
                          className="truncate text-xs font-semibold text-brand-ink hover:text-brand-magenta"
                        >
                          {f.customer}
                        </button>
                        <p className="truncate text-[10px] text-brand-ink/50">
                          {f.time} · {f.purpose}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold capitalize ${STATUS_STYLES[f.status]}`}>
                      {f.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1.5">
                    <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[f.priority]}`}>
                      {f.priority}
                    </span>
                    <div className="flex items-center gap-1">
                      {!isClosed && (
                        <>
                          <button
                            onClick={() => onCall(f)}
                            className="rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 text-white shadow-sm hover:scale-105"
                            title="Call"
                          >
                            <Phone size={10} />
                          </button>
                          <button
                            onClick={() => onComplete(f)}
                            className="rounded-md bg-gradient-to-br from-brand-magenta to-brand-purple p-1.5 text-white shadow-sm hover:scale-105"
                            title="Complete"
                          >
                            <CheckCircle2 size={10} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onView(f)}
                        className="rounded-md border border-brand-lilac bg-white px-2 py-1 text-[9px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => onAddForDay(dateKey)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-brand-lilac bg-white py-2.5 text-[11px] font-semibold text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta"
            >
              <Plus size={12} /> Add Follow-Up for this day
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   ADD FOLLOW-UP MODAL
   ================================================================ */
function AddFollowUpModal({ defaultDate, onClose, onSave }) {
  const today = todayYMD();

  const [form, setForm] = useState({
    customer: '',
    mobile: '',
    date: defaultDate || today,
    time: '10:00',
    purpose: 'Callback',
    priority: 'Medium',
    notes: '',
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.customer.trim()) return setError('Customer name is required.');
    if (!/^\d{10}$/.test(form.mobile.trim())) return setError('Mobile must be 10 digits.');
    if (!form.date) return setError('Date is required.');
    setError('');
    onSave({
      customer: form.customer.trim(),
      mobile: form.mobile.trim(),
      date: form.date,
      time: form.time,
      purpose: form.purpose,
      priority: form.priority,
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <CalendarCheck size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">New Follow-Up</h3>
              <p className="text-xs text-brand-ink/50">Schedule a customer follow-up</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer Name *" value={form.customer} onChange={(v) => set('customer', v)} placeholder="e.g. Customer A" />
            <Field
              label="Mobile *"
              value={form.mobile}
              onChange={(v) => set('mobile', v.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit number"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *" type="date" value={form.date} onChange={(v) => set('date', v)} />
            <Field label="Time" type="time" value={form.time} onChange={(v) => set('time', v)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Purpose" value={form.purpose} onChange={(v) => set('purpose', v)} options={PURPOSE_OPTIONS} />
            <SelectField label="Priority" value={form.priority} onChange={(v) => set('priority', v)} options={['High', 'Medium', 'Low']} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Any context for this follow-up..."
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
              Schedule Follow-Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   FOLLOW-UP DRAWER
   ================================================================ */
function FollowUpDrawer({
  followUp, onClose, onCall, onComplete, onReschedule, onSnooze, onNote, onCancel, onNotInterested,
}) {
  const f = followUp;

  const lead = useMemo(
    () => (LEADS || []).find((l) => l.mobile === f.mobile),
    [f.mobile]
  );

  const isClosed = CLOSED_STATUSES.includes(f.status);

  const leadId      = lead?.id ? `#LG-${String(lead.id).padStart(4, '0')}` : '—';
  const email       = lead?.email || '—';
  const source      = lead?.leadSource || '—';
  const category    = lead?.category || '—';
  const campaign    = lead?.campaign || '—';
  const assigned    = lead?.assignedDate || '—';
  const lastContact = lead?.lastContact || '—';
  const lastOutcome = f.lastOutcome || lead?.lastOutcome || '—';

  const conversationHistory = useMemo(() => {
    const events = [];
    if (f.lastCallAt) {
      events.push({
        at: new Date(f.lastCallAt).toLocaleString(),
        icon: Phone,
        tone: 'emerald',
        title: `Call logged · ${lastOutcome}`,
        body: f.notes?.split('\n').slice(-1)[0] || '',
      });
    }
    if (f.notes) {
      const lines = f.notes.split('\n').filter(Boolean);
      lines.slice(-3).forEach((line) => {
        events.push({
          at: 'Earlier',
          icon: StickyNote,
          tone: 'amber',
          title: 'Note',
          body: line,
        });
      });
    }
    if (assigned && assigned !== '—') {
      events.push({
        at: assigned,
        icon: Calendar,
        tone: 'purple',
        title: 'Lead assigned',
        body: `Campaign: ${campaign}`,
      });
    }
    return events;
  }, [f, assigned, campaign, lastOutcome]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
              {leadId} · Follow-Up
            </p>
            <h3 className="font-display text-lg font-semibold text-brand-ink">Customer Details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-sm font-bold text-white">
              {f.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{f.customer}</p>
              <p className="text-sm text-brand-ink/50">{f.mobile}</p>
              {email !== '—' && (
                <p className="flex items-center gap-1 text-xs text-brand-ink/50">
                  <Mail size={11} /> {email}
                </p>
              )}
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[f.status]}`}>
              {f.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${PRIORITY_STYLES[f.priority] || PRIORITY_STYLES.Medium}`}>
              <Flame size={11} /> {f.priority} Priority
            </span>
            {!isClosed && <RelativeTimeBadge date={f.date} time={f.time} />}
          </div>

          {!isClosed && (
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={onCall}
                className="flex flex-col items-center gap-1 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 py-2.5 text-[10px] font-bold text-white shadow-card hover:brightness-110"
              >
                <Phone size={14} /> Call
              </button>
              <button
                onClick={onSnooze}
                className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-2.5 text-[10px] font-bold text-brand-ink hover:bg-brand-lilac/40"
              >
                <AlarmClock size={14} /> Snooze
              </button>
              <button
                onClick={onReschedule}
                className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-2.5 text-[10px] font-bold text-brand-ink hover:bg-brand-lilac/40"
              >
                <RotateCcw size={14} /> Resched
              </button>
              <button
                onClick={onComplete}
                className="flex flex-col items-center gap-1 rounded-xl bg-gradient-to-b from-brand-magenta to-brand-purple py-2.5 text-[10px] font-bold text-white shadow-card hover:brightness-110"
              >
                <CheckCircle2 size={14} /> Done
              </button>
            </div>
          )}

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Follow-Up Details</h4>
            <Row icon={Calendar}      label="Date"    value={f.date} />
            <Row icon={Clock}         label="Time"    value={f.time} />
            <Row icon={MessageCircle} label="Purpose" value={f.purpose} />
            <Row icon={Tag}           label="Status"  value={f.status.replace('_', ' ')} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Customer Information</h4>
            <Row icon={Tag}          label="Lead ID"           value={leadId} />
            <Row icon={Megaphone}    label="Lead Source"       value={source} />
            <Row icon={Briefcase}    label="Category"          value={category} />
            <Row icon={Megaphone}    label="Campaign"          value={campaign} />
            <Row icon={Calendar}     label="Assigned Date"     value={assigned} />
            <Row icon={Phone}        label="Last Contact"      value={lastContact} />
            <Row icon={CheckCircle2} label="Last Call Outcome" value={lastOutcome} />
          </div>

          {conversationHistory.length > 0 && (
            <div className="card !p-4">
              <h4 className="mb-3 font-display text-sm font-semibold text-brand-ink">
                Conversation History
              </h4>
              <div className="relative space-y-3">
                <span className="pointer-events-none absolute left-[7px] top-3 bottom-3 w-px bg-brand-lilac" />
                {conversationHistory.map((e, i) => {
                  const Icon = e.icon;
                  return (
                    <div key={i} className="relative flex items-start gap-3">
                      <span className={`relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                        e.tone === 'emerald' ? 'bg-emerald-500' :
                        e.tone === 'amber'   ? 'bg-amber-500' :
                        e.tone === 'purple'  ? 'bg-brand-purple' :
                                                'bg-slate-400'
                      }`}>
                        <Icon size={8} className="text-white" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-brand-ink">{e.title}</p>
                        {e.body && (
                          <p className="mt-0.5 line-clamp-3 text-[11px] text-brand-ink/60">{e.body}</p>
                        )}
                        <p className="mt-0.5 text-[10px] text-brand-ink/40">{e.at}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {f.notes && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                Notes
              </p>
              <p className="whitespace-pre-line text-sm text-brand-ink/80">{f.notes}</p>
            </div>
          )}

          {!isClosed && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onNote}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
                >
                  <StickyNote size={12} /> Add Note
                </button>
                <button
                  onClick={onNotInterested}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                >
                  <Ban size={12} /> Not Interested
                </button>
              </div>
              <button
                onClick={onCancel}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <X size={12} /> Cancel Follow-Up
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
function NoteModal({ followUp, onClose, onSave }) {
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
              <p className="text-xs text-brand-ink/50">{followUp.customer}</p>
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
          placeholder="Add context for this follow-up..."
          className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />

        {followUp.notes && (
          <div className="mt-4 max-h-40 space-y-2 overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/40">Previous notes</p>
            <p className="whitespace-pre-line rounded-lg border border-brand-lilac/60 bg-brand-mist/40 p-2.5 text-xs text-brand-ink/70">
              {followUp.notes}
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
            onClick={() => text.trim() && onSave(followUp, text.trim())}
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
function RescheduleModal({ followUp, onClose, onSave }) {
  const [date, setDate] = useState(followUp.date);
  const [time, setTime] = useState(followUp.time);

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
              <p className="text-xs text-brand-ink/50">{followUp.customer}</p>
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
              onClick={() => onSave(followUp, { date, time })}
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
function CallModal({ target, inQueue, queueIndex, queueSize, nextFollowUp, onSkip, onClose, onEnd }) {
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const endCall = () => onEnd({ notes, duration: formatTime(seconds) });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pb-6 pt-6 text-center text-white">
          <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
            <span className="truncate text-white/80">{target.purpose}</span>
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

          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/25 text-2xl font-bold">
            {target.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <p className="text-lg font-semibold">{target.customer}</p>
          <p className="text-xs text-white/70">{target.mobile}</p>

          <div className="mt-3 flex flex-col items-center">
            <p className="font-display text-3xl font-bold tabular-nums">{formatTime(seconds)}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
              Connected
            </p>
          </div>
        </div>

        <div className="space-y-3 p-6">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMuted((m) => !m)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-[10px] font-semibold ${
                muted ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta' : 'border-brand-lilac bg-white text-brand-ink/60'
              }`}
            >
              {muted ? <MicOffIcon /> : <MicIcon />}
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <button className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-3 text-[10px] font-semibold text-brand-ink/60">
              <Coffee size={14} />
              Hold
            </button>
            <button className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-3 text-[10px] font-semibold text-brand-ink/60">
              <Send size={14} />
              Transfer
            </button>
          </div>

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

          <button
            onClick={endCall}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Phone size={16} /> End Call · {formatTime(seconds)}
          </button>

          {inQueue && (
            <button
              onClick={onSkip}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <SkipForward size={14} /> Skip to Next Follow-Up
            </button>
          )}

          {inQueue && nextFollowUp && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3 text-xs">
              <span className="font-semibold uppercase tracking-wider text-brand-ink/40">Next:</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[9px] font-bold text-white">
                {nextFollowUp.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
              <span className="truncate font-semibold text-brand-ink">{nextFollowUp.customer}</span>
              <ChevronRight size={14} className="ml-auto text-brand-ink/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);
const MicOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

/* ================================================================
   EMPTY STATE
   ================================================================ */
function EmptyState({ tab }) {
  const messages = {
    today:          "No follow-ups scheduled for today",
    upcoming:       'No upcoming follow-ups',
    overdue:        'No overdue follow-ups — nice!',
    completed:      'No completed follow-ups yet',
    not_interested: 'No not-interested customers yet',
    cancelled:      'No cancelled follow-ups yet',
    history:        'No follow-up history yet',
  };
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Inbox size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {messages[tab] || 'Nothing to show'}
      </p>
    </div>
  );
}

/* ================================================================
   DROPDOWN FILTER
   ================================================================ */
function DropdownFilter({ label, icon: Icon, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        <span className="text-brand-ink/60">{label}:</span>
        <span className="font-semibold capitalize text-brand-magenta">{value}</span>
        <ChevronDown size={14} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm capitalize ${
                  value === o
                    ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
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
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
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