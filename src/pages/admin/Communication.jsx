// src/pages/admin/Communication.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageSquare, Mail, Send, CheckCircle2, XCircle, Clock, X, Search,
  Filter, ChevronDown, Eye, Pencil, Trash2, Phone, Copy,
  Download, FileText, Plus, AlertCircle, MessageCircle, ListFilter,
  Calendar, Check, Bell, Settings, TrendingUp,
  Sparkles, UserCheck, PhoneMissed, Megaphone, CreditCard, ClipboardList,
  CalendarClock, Repeat, Grid3x3, List,
  AtSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  COMMUNICATIONS as INITIAL_COMMUNICATIONS,
  TEMPLATES as INITIAL_TEMPLATES,
  NOTIFICATIONS as INITIAL_NOTIFICATIONS,
} from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const CHANNELS = ['SMS', 'WhatsApp', 'Email'];
const STATUSES = ['Sent', 'Delivered', 'Read', 'Pending', 'Failed'];

const TEMPLATE_CATEGORIES = [
  { key: 'Welcome',       label: 'Welcome',       icon: Sparkles,      tone: 'purple',  desc: 'New customer greetings' },
  { key: 'Follow-up',     label: 'Follow-up',     icon: Repeat,        tone: 'amber',   desc: 'Keep leads engaged' },
  { key: 'Appointment',   label: 'Appointment',   icon: CalendarClock, tone: 'emerald', desc: 'Meeting confirmations' },
  { key: 'Payment',       label: 'Payment',       icon: CreditCard,    tone: 'cyan',    desc: 'Invoices & reminders' },
  { key: 'Campaign',      label: 'Campaign',      icon: Megaphone,     tone: 'rose',    desc: 'Bulk outreach messages' },
  { key: 'Notifications', label: 'Notifications', icon: Bell,          tone: 'amber',   desc: 'System & event alerts' },
  { key: 'Other',         label: 'Other',         icon: FileText,      tone: 'slate',   desc: 'Misc templates' },
];

const NOTIFICATION_EVENTS = [
  { key: 'new_lead',         label: 'New Lead',          icon: Sparkles,      tone: 'purple',  desc: 'When a new lead is captured' },
  { key: 'lead_assigned',    label: 'Lead Assignment',   icon: UserCheck,     tone: 'emerald', desc: 'When a lead is assigned to an agent' },
  { key: 'missed_call',      label: 'Missed Call',       icon: PhoneMissed,   tone: 'rose',    desc: 'When a call is missed' },
  { key: 'follow_up_due',    label: 'Follow-up Due',     icon: Calendar,      tone: 'amber',   desc: 'When a follow-up is due' },
  { key: 'task_assigned',    label: 'Task Assigned',     icon: ClipboardList, tone: 'cyan',    desc: 'When a task is created or assigned' },
  { key: 'campaign_activity',label: 'Campaign Activity', icon: Megaphone,     tone: 'rose',    desc: 'When campaigns start, end, or update' },
];

const TABS = [
  { key: 'sms',           label: 'SMS',           icon: MessageSquare },
  { key: 'whatsapp',      label: 'WhatsApp',      icon: MessageCircle },
  { key: 'email',         label: 'Email',         icon: Mail },
  { key: 'logs',          label: 'Message Logs',  icon: ListFilter },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

const VARIABLES = [
  { key: '{{name}}',    label: 'Customer name' },
  { key: '{{mobile}}',  label: 'Mobile number' },
  { key: '{{agent}}',   label: 'Agent name' },
  { key: '{{date}}',    label: 'Date' },
  { key: '{{time}}',    label: 'Time' },
  { key: '{{project}}', label: 'Project name' },
  { key: '{{sender}}',  label: 'Sender name' },
  { key: '{{amount}}',  label: 'Payment amount' },
];

const STORAGE_PREFIX = 'comm:';
const TAB_TO_CHANNEL = { sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email' };
const CHANNEL_TO_TAB = { SMS: 'sms', WhatsApp: 'whatsapp', Email: 'email' };

const STATUS_STYLES = {
  Delivered: { chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  Read:      { chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  Sent:      { chip: 'bg-cyan-100 text-cyan-700 border-cyan-200',           dot: 'bg-cyan-500',   icon: Send },
  Pending:   { chip: 'bg-amber-100 text-amber-700 border-amber-200',        dot: 'bg-amber-500',  icon: Clock },
  Failed:    { chip: 'bg-rose-100 text-rose-700 border-rose-200',           dot: 'bg-rose-500',   icon: XCircle },
};

const TONE_CLASSES = {
  purple:  { chip: 'bg-violet-100 text-brand-purple',  icon: 'bg-violet-100 text-brand-purple',  dot: 'bg-brand-purple' },
  emerald: { chip: 'bg-emerald-100 text-emerald-600',  icon: 'bg-emerald-100 text-emerald-600',  dot: 'bg-emerald-500' },
  amber:   { chip: 'bg-amber-100 text-amber-600',      icon: 'bg-amber-100 text-amber-600',      dot: 'bg-amber-500' },
  rose:    { chip: 'bg-rose-100 text-brand-magenta',   icon: 'bg-rose-100 text-brand-magenta',   dot: 'bg-brand-magenta' },
  cyan:    { chip: 'bg-cyan-100 text-cyan-600',        icon: 'bg-cyan-100 text-cyan-600',        dot: 'bg-cyan-500' },
  slate:   { chip: 'bg-slate-100 text-slate-600',      icon: 'bg-slate-100 text-slate-600',      dot: 'bg-slate-500' },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) || typeof parsed === 'object') return parsed;
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
};

const renderPreview = (text) =>
  text
    .replace(/\{\{name\}\}/g, 'John Doe')
    .replace(/\{\{mobile\}\}/g, '+91 9876543210')
    .replace(/\{\{agent\}\}/g, 'Ravi Kumar')
    .replace(/\{\{date\}\}/g, '25 Oct 2026')
    .replace(/\{\{time\}\}/g, '11:00 AM')
    .replace(/\{\{project\}\}/g, 'Matrimony CRM')
    .replace(/\{\{sender\}\}/g, 'Eliteinova')
    .replace(/\{\{amount\}\}/g, '₹2,500');

const findCategory = (key) =>
  TEMPLATE_CATEGORIES.find((c) => c.key === key) ||
  TEMPLATE_CATEGORIES[TEMPLATE_CATEGORIES.length - 1];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Communication() {
  const { activeWebsiteId, activeWebsite } = useAuth();

  const [templates, setTemplates] = useState(() =>
    loadState(
      `templates:${activeWebsiteId}`,
      INITIAL_TEMPLATES.filter((t) => t.projectId === activeWebsiteId).map((t) => ({
        ...t,
        category: t.category || 'Other',
        status: t.status || 'Active',
      }))
    )
  );

  const [messages, setMessages] = useState(() =>
    loadState(
      `messages:${activeWebsiteId}`,
      INITIAL_COMMUNICATIONS.filter((m) => m.projectId === activeWebsiteId).map((m) => ({ ...m }))
    )
  );

  const [notifications, setNotifications] = useState(() =>
    loadState(
      `notifications:${activeWebsiteId}`,
      INITIAL_NOTIFICATIONS.filter((n) => n.projectId === activeWebsiteId).map((n) => ({ ...n }))
    )
  );

  const [notificationConfig, setNotificationConfig] = useState(() =>
    loadState(
      `notifConfig:${activeWebsiteId}`,
      NOTIFICATION_EVENTS.reduce((acc, e) => ({
        ...acc,
        [e.key]: { enabled: true, channel: 'in-app', recipients: ['Admin'] },
      }), {})
    )
  );

  useEffect(() => {
    setTemplates(
      loadState(
        `templates:${activeWebsiteId}`,
        INITIAL_TEMPLATES.filter((t) => t.projectId === activeWebsiteId).map((t) => ({
          ...t,
          category: t.category || 'Other',
          status: t.status || 'Active',
        }))
      )
    );
    setMessages(
      loadState(
        `messages:${activeWebsiteId}`,
        INITIAL_COMMUNICATIONS.filter((m) => m.projectId === activeWebsiteId).map((m) => ({ ...m }))
      )
    );
    setNotifications(
      loadState(
        `notifications:${activeWebsiteId}`,
        INITIAL_NOTIFICATIONS.filter((n) => n.projectId === activeWebsiteId).map((n) => ({ ...n }))
      )
    );
    setNotificationConfig(
      loadState(
        `notifConfig:${activeWebsiteId}`,
        NOTIFICATION_EVENTS.reduce((acc, e) => ({
          ...acc,
          [e.key]: { enabled: true, channel: 'in-app', recipients: ['Admin'] },
        }), {})
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebsiteId]);

  useEffect(() => { saveState(`templates:${activeWebsiteId}`, templates); }, [templates, activeWebsiteId]);
  useEffect(() => { saveState(`messages:${activeWebsiteId}`, messages); }, [messages, activeWebsiteId]);
  useEffect(() => { saveState(`notifications:${activeWebsiteId}`, notifications); }, [notifications, activeWebsiteId]);
  useEffect(() => { saveState(`notifConfig:${activeWebsiteId}`, notificationConfig); }, [notificationConfig, activeWebsiteId]);

  const [tab, setTab] = useState('sms');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendPrefill, setSendPrefill] = useState(null);
  const [viewingMessage, setViewingMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    showToast('Copied to clipboard');
  };

  const templatesByChannel = useMemo(() => {
    const channel = TAB_TO_CHANNEL[tab];
    if (!channel) return [];
    let rows = templates.filter((t) => t.channel === channel);
    if (categoryFilter !== 'All') rows = rows.filter((t) => t.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((t) => `${t.name} ${t.body} ${t.category}`.toLowerCase().includes(q));
    }
    return rows;
  }, [templates, tab, searchQuery, categoryFilter]);

  const categoryCounts = useMemo(() => {
    const channel = TAB_TO_CHANNEL[tab];
    const counts = {};
    TEMPLATE_CATEGORIES.forEach((c) => {
      counts[c.key] = templates.filter((t) => t.channel === channel && t.category === c.key).length;
    });
    return counts;
  }, [templates, tab]);

  const channelTotal = useMemo(() => {
    const channel = TAB_TO_CHANNEL[tab];
    if (!channel) return 0;
    return templates.filter((t) => t.channel === channel).length;
  }, [templates, tab]);

  const filteredMessages = useMemo(() => {
    let rows = [...messages];
    if (statusFilter !== 'All') rows = rows.filter((m) => m.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((m) => `${m.to} ${m.message} ${m.channel}`.toLowerCase().includes(q));
    }
    return rows.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [messages, statusFilter, searchQuery]);

  const summary = useMemo(() => {
    const total = messages.length;
    const sms = messages.filter((m) => m.channel === 'SMS').length;
    const whatsapp = messages.filter((m) => m.channel === 'WhatsApp').length;
    const email = messages.filter((m) => m.channel === 'Email').length;
    const sent = messages.filter((m) => m.status === 'Sent').length;
    const delivered = messages.filter((m) => m.status === 'Delivered').length;
    const read = messages.filter((m) => m.status === 'Read').length;
    const failed = messages.filter((m) => m.status === 'Failed').length;
    const pending = messages.filter((m) => m.status === 'Pending').length;
    const deliveryRate = total > 0 ? Math.round(((delivered + read + sent) / total) * 100) : 0;
    return { total, sms, whatsapp, email, sent, delivered, read, failed, pending, deliveryRate };
  }, [messages]);

  const handleSaveTemplate = (data) => {
    const today = new Date().toISOString().slice(0, 10);

    if (editingTemplate) {
      const channelChanged = data.channel !== editingTemplate.channel;
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id ? { ...t, ...data, updatedAt: today } : t
        )
      );
      if (channelChanged) {
        setTab(CHANNEL_TO_TAB[data.channel]);
        setCategoryFilter('All');
        setSearchQuery('');
      }
      showToast('Template updated');
    } else {
      const newT = {
        id: 'TPL-' + String(Date.now()).slice(-4),
        projectId: activeWebsiteId,
        ...data,
        status: data.status || 'Active',
        updatedAt: today,
      };
      setTemplates((prev) => [newT, ...prev]);

      const targetTab = CHANNEL_TO_TAB[data.channel];
      if (targetTab && targetTab !== tab) {
        setTab(targetTab);
        setCategoryFilter('All');
        setSearchQuery('');
      } else {
        if (categoryFilter !== 'All' && categoryFilter !== data.category) {
          setCategoryFilter('All');
        }
        if (searchQuery) setSearchQuery('');
      }
      showToast('Template created');
    }
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id) => {
    const t = templates.find((x) => x.id === id);
    setTemplates((prev) => prev.filter((x) => x.id !== id));
    setConfirmDelete(null);
    showToast(`Template "${t?.name || ''}" deleted`, 'error');
  };

  const handleOpenSend = (prefill = null) => {
    setSendPrefill(prefill);
    setShowSendModal(true);
  };

  const handleSend = (data) => {
    const newMessage = {
      id: 'MSG-' + String(Date.now()).slice(-4),
      projectId: activeWebsiteId,
      channel: data.channel,
      to: data.to,
      message: data.message,
      status: 'Sent',
      date: new Date().toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }),
    };
    setMessages((prev) => [newMessage, ...prev]);
    setShowSendModal(false);
    setSendPrefill(null);
    showToast(`${data.channel} sent to ${data.to}`);
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const toggleNotifEvent = (key) => {
    setNotificationConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
    showToast(`${NOTIFICATION_EVENTS.find((e) => e.key === key)?.label} ${notificationConfig[key]?.enabled ? 'disabled' : 'enabled'}`);
  };

  const setNotifChannel = (key, channel) => {
    setNotificationConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], channel },
    }));
  };

  const handleExport = () => {
    if (filteredMessages.length === 0) {
      showToast('No messages to export', 'error');
      return;
    }
    const rows = [
      ['ID', 'Channel', 'To', 'Message', 'Status', 'Date'],
      ...filteredMessages.map((m) => [m.id, m.channel, m.to, m.message, m.status, m.date]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communication-${activeWebsite?.name || 'website'}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredMessages.length} messages`);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasFilters = searchQuery || statusFilter !== 'All' || categoryFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
  };

  const handleOpenCreate = (prefillCategory = null) => {
    setEditingTemplate(prefillCategory ? { category: prefillCategory, __prefill: true } : null);
    setShowTemplateModal(true);
  };

  const templateModalInitial = useMemo(() => {
    if (editingTemplate && !editingTemplate.__prefill) return editingTemplate;
    return {
      channel: TAB_TO_CHANNEL[tab] || 'SMS',
      category:
        (editingTemplate && editingTemplate.__prefill && editingTemplate.category) ||
        (categoryFilter !== 'All' ? categoryFilter : 'Welcome'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTemplate, tab, categoryFilter]);

  const isTemplateMode = editingTemplate && !editingTemplate.__prefill;

  /* Tab counts for the tabs bar */
  const tabCounts = useMemo(() => ({
    sms: templates.filter((t) => t.channel === 'SMS').length,
    whatsapp: templates.filter((t) => t.channel === 'WhatsApp').length,
    email: templates.filter((t) => t.channel === 'Email').length,
    logs: messages.length,
    notifications: notifications.length,
  }), [templates, messages.length, notifications.length]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Communication</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <MessageSquare size={13} className="text-brand-magenta" />
              SMS, WhatsApp, and Email for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tab === 'logs' && (
              <button
                onClick={handleExport}
                className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md"
              >
                <Download size={14} className="transition-transform group-hover:translate-y-0.5" /> Export
              </button>
            )}
            <button
              onClick={() => handleOpenSend()}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <Send size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /> Send Message
            </button>
          </div>
        </div>

        {/* ═══ KPI STRIP — 5-COLUMN GRID, 4 CARDS (5th slot left empty) ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Communication</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
          </div>

          {/* ✅ FIXED: 5-column grid on large screens — cards match sibling pages' size */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <KpiCard
              icon={Send}
              label="Total Messages"
              value={summary.total}
              sub={`${summary.sms} SMS · ${summary.whatsapp} WA`}
              color="purple"
              active={tab === 'sms' || tab === 'whatsapp' || tab === 'email'}
              onClick={() => setTab('sms')}
              delay={0}
            />
            <KpiCard
              icon={CheckCircle2}
              label="Delivered"
              value={summary.delivered + summary.read + summary.sent}
              sub={`${summary.deliveryRate}% delivery rate`}
              color="emerald"
              delay={40}
            />
            <KpiCard
              icon={Clock}
              label="Pending"
              value={summary.pending}
              sub="Awaiting delivery"
              color="amber"
              delay={80}
            />
            <KpiCard
              icon={XCircle}
              label="Failed"
              value={summary.failed}
              sub="Require attention"
              color="rose"
              delay={120}
            />
            {/* 5th slot intentionally left empty */}
          </div>
        </div>

        {/* ═══ SECONDARY STRIP ═══ */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat icon={MessageSquare}  label="SMS"       value={summary.sms}        color="purple" />
          <MiniStat icon={MessageCircle}  label="WhatsApp"  value={summary.whatsapp}   color="emerald" />
          <MiniStat icon={Mail}           label="Email"     value={summary.email}      color="amber" />
          <MiniStat icon={FileText}       label="Templates" value={templates.length}   color="rose" />
        </div>

        {/* ═══ TABS ═══ */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              const count = tabCounts[key];
              const isNotifBadge = key === 'notifications' && unreadCount > 0;
              const badge = isNotifBadge ? unreadCount : count;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setTab(key);
                    setSearchQuery('');
                    setStatusFilter('All');
                    setCategoryFilter('All');
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  {badge != null && badge > 0 && (
                    <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? 'bg-white/25 text-white'
                        : isNotifBadge
                        ? 'bg-brand-magenta text-white'
                        : 'bg-brand-lilac/70 text-brand-purple'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ SEARCH BAR ═══ */}
        {['sms', 'whatsapp', 'email', 'logs'].includes(tab) && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tab === 'logs' ? 'Search by recipient or message…' : 'Search templates…'}
                className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac">
                  <X size={14} className="text-brand-ink/50" />
                </button>
              )}
            </div>

            {['sms', 'whatsapp', 'email'].includes(tab) && (
              <DropdownFilter
                label="Category" icon={Filter} value={categoryFilter}
                options={['All', ...TEMPLATE_CATEGORIES.map((c) => c.key)]}
                displayValue={(v) => (v === 'All' ? 'All' : findCategory(v).label)}
                open={categoryOpen}
                onToggle={() => { setCategoryOpen((s) => !s); setStatusOpen(false); }}
                onChange={(v) => { setCategoryFilter(v); setCategoryOpen(false); }}
              />
            )}

            {tab === 'logs' && (
              <DropdownFilter
                label="Status" icon={Filter} value={statusFilter}
                options={['All', ...STATUSES]}
                open={statusOpen}
                onToggle={() => { setStatusOpen((s) => !s); setCategoryOpen(false); }}
                onChange={(v) => { setStatusFilter(v); setStatusOpen(false); }}
              />
            )}

            {['sms', 'whatsapp', 'email'].includes(tab) && (
              <div className="flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-full p-1.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-brand-magenta/10 text-brand-magenta'
                      : 'text-brand-ink/50 hover:bg-brand-lilac/30'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-full p-1.5 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-brand-magenta/10 text-brand-magenta'
                      : 'text-brand-ink/50 hover:bg-brand-lilac/30'
                  }`}
                  title="List view"
                >
                  <List size={14} />
                </button>
              </div>
            )}

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}

        {/* ═══ CATEGORY CHIPS (templates only) ═══ */}
        {['sms', 'whatsapp', 'email'].includes(tab) && (
          <div className="card !p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Quick filter:</span>
              <button
                onClick={() => setCategoryFilter('All')}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  categoryFilter === 'All'
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                All ({channelTotal})
              </button>
              {TEMPLATE_CATEGORIES.map((c) => {
                const count = categoryCounts[c.key] || 0;
                const active = categoryFilter === c.key;
                const Icon = c.icon;
                const tone = TONE_CLASSES[c.tone];
                return (
                  <button
                    key={c.key}
                    onClick={() => setCategoryFilter(c.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      active
                        ? `border-brand-magenta ${tone.chip} ring-1 ring-brand-magenta/30`
                        : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                    }`}
                  >
                    <Icon size={11} />
                    {c.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${active ? 'bg-white/70' : 'bg-brand-lilac/70 text-brand-purple'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ TAB CONTENT ═══ */}
        {['sms', 'whatsapp', 'email'].includes(tab) && (
          <TemplatesTab
            templates={templatesByChannel}
            channel={TAB_TO_CHANNEL[tab]}
            viewMode={viewMode}
            onCreate={() => handleOpenCreate()}
            onEdit={(t) => { setEditingTemplate(t); setShowTemplateModal(true); }}
            onDelete={(t) => setConfirmDelete(t)}
            onUse={(t) => handleOpenSend({ channel: t.channel, message: t.body })}
            onCopy={(t) => handleCopy(t.id, t.body)}
            copiedId={copiedId}
            onView={(t) => setViewingTemplate(t)}
          />
        )}

        {tab === 'logs' && (
          <LogsTab
            messages={filteredMessages}
            viewMode={viewMode}
            onView={setViewingMessage}
            onCopy={(m) => handleCopy(m.id, m.message)}
            copiedId={copiedId}
          />
        )}

        {tab === 'notifications' && (
          <NotificationsTab
            notifications={notifications}
            config={notificationConfig}
            onToggleEvent={toggleNotifEvent}
            onSetChannel={setNotifChannel}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />
        )}

        {/* ═══ MODALS / DRAWERS ═══ */}
        {showTemplateModal && (
          <TemplateModal
            mode={isTemplateMode ? 'edit' : 'create'}
            initial={templateModalInitial}
            onClose={() => { setShowTemplateModal(false); setEditingTemplate(null); }}
            onSubmit={handleSaveTemplate}
          />
        )}

        {viewingTemplate && (
          <TemplateDetailsDrawer
            template={viewingTemplate}
            onClose={() => setViewingTemplate(null)}
            onUse={() => { handleOpenSend({ channel: viewingTemplate.channel, message: viewingTemplate.body }); setViewingTemplate(null); }}
            onEdit={() => { setEditingTemplate(viewingTemplate); setViewingTemplate(null); setShowTemplateModal(true); }}
            onCopy={() => handleCopy(viewingTemplate.id, viewingTemplate.body)}
          />
        )}

        {showSendModal && (
          <SendMessageModal
            prefill={sendPrefill}
            templates={templates}
            onClose={() => { setShowSendModal(false); setSendPrefill(null); }}
            onSend={handleSend}
          />
        )}

        {viewingMessage && (
          <MessageDetailsDrawer
            message={viewingMessage}
            onClose={() => setViewingMessage(null)}
            onCopy={() => handleCopy(viewingMessage.id, viewingMessage.message)}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title="Delete template?"
            message={`This will permanently delete the template "${confirmDelete.name}".`}
            confirmLabel="Delete Template"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDeleteTemplate(confirmDelete.id)}
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

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
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
    </Component>
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
   MINI STAT
   ═══════════════════════════════════════════════════════════════ */
function MiniStat({ icon: Icon, label, value, color = 'purple' }) {
  const colors = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-brand-magenta',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] text-brand-ink/50">{label}</p>
        <p className="font-display text-lg font-bold text-brand-ink tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DROPDOWN FILTER
   ═══════════════════════════════════════════════════════════════ */
function DropdownFilter({ label, icon: Icon, value, options, open, onToggle, onChange, displayValue }) {
  const render = (v) => (displayValue ? displayValue(v) : v);
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        {label}: <span className="font-semibold text-brand-magenta">{render(value)}</span>
        <ChevronDown size={14} className={`text-brand-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${value === o ? 'bg-brand-magenta/10 font-semibold text-brand-magenta' : 'text-brand-ink/70 hover:bg-brand-lilac/40'}`}
              >
                {render(o)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATES TAB — grid + list views
   ═══════════════════════════════════════════════════════════════ */
function TemplatesTab({ templates, channel, viewMode, onCreate, onEdit, onDelete, onUse, onCopy, copiedId, onView }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-brand-ink/50">
          {templates.length} {channel} template{templates.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-3.5 py-2 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={12} /> New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={`No ${channel} templates yet`}
          subtitle={`Create reusable ${channel} templates with {{name}} placeholders for personalization.`}
          onAdd={onCreate}
          addLabel="Create First Template"
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onView={() => onView(t)}
              onEdit={() => onEdit(t)}
              onDelete={() => onDelete(t)}
              onUse={() => onUse(t)}
              onCopy={() => onCopy(t)}
              copiedId={copiedId}
            />
          ))}
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <ul className="divide-y divide-brand-lilac/40">
            {templates.map((t) => (
              <TemplateRow
                key={t.id}
                template={t}
                onView={() => onView(t)}
                onEdit={() => onEdit(t)}
                onDelete={() => onDelete(t)}
                onUse={() => onUse(t)}
                onCopy={() => onCopy(t)}
                copiedId={copiedId}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Template Card (GRID) ── */
function TemplateCard({ template: t, onView, onEdit, onDelete, onUse, onCopy, copiedId }) {
  const cat = findCategory(t.category);
  const CatIcon = cat.icon;
  const tone = TONE_CLASSES[cat.tone];

  const channelAccent = t.channel === 'SMS'
    ? 'from-brand-magenta to-brand-purple'
    : t.channel === 'WhatsApp'
    ? 'from-emerald-500 to-teal-500'
    : 'from-amber-500 to-orange-500';

  const channelIconBg = t.channel === 'SMS'
    ? 'bg-violet-100 text-brand-purple'
    : t.channel === 'WhatsApp'
    ? 'bg-emerald-100 text-emerald-600'
    : 'bg-amber-100 text-amber-600';

  const ChannelIcon = t.channel === 'SMS' ? MessageSquare : t.channel === 'WhatsApp' ? MessageCircle : Mail;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-lilac bg-white p-4 shadow-[0_1px_3px_rgba(139,47,214,0.04)] transition-all hover:-translate-y-1 hover:border-brand-magenta/40 hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.35)]">
      <span className={`pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${channelAccent} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-magenta/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start gap-3">
        <button
          onClick={onView}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${channelIconBg} shadow-sm transition-transform hover:scale-110`}
          title="View details"
        >
          <ChannelIcon size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <button onClick={onView} className="block truncate text-left font-semibold text-brand-ink hover:text-brand-magenta">
            {t.name}
          </button>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tone.chip}`}>
              <CatIcon size={9} /> {cat.label}
            </span>
            <span className="font-mono text-[9px] text-brand-ink/40">{t.updatedAt}</span>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
          t.status === 'Active'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {t.status}
        </span>
      </div>

      <div className="relative mt-3 min-h-[72px] rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3">
        <p className="line-clamp-4 text-xs italic leading-relaxed text-brand-ink/70">"{t.body}"</p>
      </div>

      <div className="relative mt-4 flex gap-1.5">
        <button
          onClick={onUse}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2 text-xs font-semibold text-white shadow-card transition-all hover:brightness-110"
          title="Use template"
        >
          <Send size={12} /> Use
        </button>
        <button
          onClick={onView}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="View details"
        >
          <Eye size={12} /> View
        </button>
        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-violet-50 hover:text-brand-purple"
          title="Edit template"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 transition-all hover:border-rose-400 hover:bg-rose-100"
          title="Delete template"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── Template Row (LIST) ── */
function TemplateRow({ template: t, onView, onEdit, onDelete, onUse, onCopy, copiedId }) {
  const cat = findCategory(t.category);
  const CatIcon = cat.icon;
  const tone = TONE_CLASSES[cat.tone];

  const channelIconBg = t.channel === 'SMS'
    ? 'bg-violet-100 text-brand-purple'
    : t.channel === 'WhatsApp'
    ? 'bg-emerald-100 text-emerald-600'
    : 'bg-amber-100 text-amber-600';

  const ChannelIcon = t.channel === 'SMS' ? MessageSquare : t.channel === 'WhatsApp' ? MessageCircle : Mail;

  return (
    <li className="group flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
      <button
        onClick={onView}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${channelIconBg} transition-transform hover:scale-110`}
        title="View details"
      >
        <ChannelIcon size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <button onClick={onView} className="block truncate text-left text-sm font-semibold text-brand-ink hover:text-brand-magenta">
          {t.name}
        </button>
        <p className="truncate text-[11px] text-brand-ink/50">{t.body}</p>
      </div>

      <span className={`hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline-flex ${tone.chip}`}>
        <CatIcon size={9} /> {cat.label}
      </span>

      <span className="hidden font-mono text-[10px] text-brand-ink/40 lg:block">{t.updatedAt}</span>

      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        t.status === 'Active'
          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}>
        {t.status}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onUse}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="Use template"
        >
          <Send size={12} /> Use
        </button>
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/60 hover:bg-brand-lilac hover:text-brand-magenta"
          title="View"
        >
          <Eye size={13} />
        </button>
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/60 hover:bg-violet-50 hover:text-brand-purple"
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onCopy}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/60 hover:bg-brand-lilac hover:text-brand-magenta"
          title="Copy body"
        >
          {copiedId === t.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGS TAB
   ═══════════════════════════════════════════════════════════════ */
function LogsTab({ messages, viewMode, onView, onCopy, copiedId }) {
  if (messages.length === 0) {
    return (
      <EmptyState
        icon={ListFilter}
        title="No messages found"
        subtitle="Try adjusting your filters or send a new message."
      />
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {messages.map((m) => (
          <MessageCard key={m.id} message={m} onView={onView} onCopy={onCopy} copiedId={copiedId} />
        ))}
      </div>
    );
  }

  return (
    <div className="card !p-0 overflow-hidden">
      <ul className="divide-y divide-brand-lilac/40">
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} onView={onView} onCopy={onCopy} copiedId={copiedId} />
        ))}
      </ul>
    </div>
  );
}

function MessageCard({ message: m, onView, onCopy, copiedId }) {
  const status = STATUS_STYLES[m.status] || STATUS_STYLES.Pending;
  const StatusIcon = status.icon;
  const ChannelIcon = m.channel === 'SMS' ? MessageSquare : m.channel === 'WhatsApp' ? MessageCircle : Mail;

  const channelIconBg = m.channel === 'SMS'
    ? 'bg-violet-100 text-brand-purple'
    : m.channel === 'WhatsApp'
    ? 'bg-emerald-100 text-emerald-600'
    : 'bg-amber-100 text-amber-600';

  const channelAccent = m.channel === 'SMS'
    ? 'from-brand-magenta to-brand-purple'
    : m.channel === 'WhatsApp'
    ? 'from-emerald-500 to-teal-500'
    : 'from-amber-500 to-orange-500';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-lilac bg-white p-4 shadow-[0_1px_3px_rgba(139,47,214,0.04)] transition-all hover:-translate-y-1 hover:border-brand-magenta/40 hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.35)]">
      <span className={`pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${channelAccent} transition-transform duration-500 group-hover:scale-x-100`} />

      <div className="relative flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${channelIconBg}`}>
          <ChannelIcon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-brand-ink">{m.to}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              m.channel === 'SMS' ? 'bg-violet-100 text-brand-purple'
              : m.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-600'
              : 'bg-amber-100 text-amber-600'
            }`}>
              {m.channel}
            </span>
            <span className="font-mono text-[9px] text-brand-ink/40">{m.date}</span>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.chip}`}>
          <StatusIcon size={9} />
          {m.status}
        </span>
      </div>

      <div className="relative mt-3 min-h-[72px] rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3">
        <p className="line-clamp-4 text-xs italic leading-relaxed text-brand-ink/70">"{m.message}"</p>
      </div>

      <div className="relative mt-4 flex gap-1.5">
        <button
          onClick={() => onView(m)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
        >
          <Eye size={12} /> View
        </button>
        <button
          onClick={() => onCopy(m)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-violet-50 hover:text-brand-purple"
        >
          {copiedId === m.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copy
        </button>
        <a
          href={`tel:${m.to}`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-100"
          title="Call"
        >
          <Phone size={12} />
        </a>
      </div>
    </div>
  );
}

function MessageRow({ message: m, onView, onCopy, copiedId }) {
  const status = STATUS_STYLES[m.status] || STATUS_STYLES.Pending;
  const StatusIcon = status.icon;
  const ChannelIcon = m.channel === 'SMS' ? MessageSquare : m.channel === 'WhatsApp' ? MessageCircle : Mail;

  const channelIconBg = m.channel === 'SMS'
    ? 'bg-violet-100 text-brand-purple'
    : m.channel === 'WhatsApp'
    ? 'bg-emerald-100 text-emerald-600'
    : 'bg-amber-100 text-amber-600';

  return (
    <li className="group flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${channelIconBg}`}>
        <ChannelIcon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">{m.to}</p>
        <p className="truncate text-xs text-brand-ink/50">{m.message}</p>
      </div>

      <span className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:inline-flex ${
        m.channel === 'SMS' ? 'bg-violet-100 text-brand-purple'
        : m.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-600'
        : 'bg-amber-100 text-amber-600'
      }`}>
        {m.channel}
      </span>

      <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.chip}`}>
        <StatusIcon size={10} />
        {m.status}
      </span>

      <span className="hidden shrink-0 font-mono text-[10px] text-brand-ink/40 lg:block">{m.date}</span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => onView(m)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="View details"
        >
          <Eye size={12} /> View
        </button>
        <button
          onClick={() => onCopy(m)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/60 hover:bg-brand-lilac hover:text-brand-magenta"
          title="Copy"
        >
          {copiedId === m.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        </button>
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATIONS TAB
   ═══════════════════════════════════════════════════════════════ */
function NotificationsTab({ notifications, config, onToggleEvent, onSetChannel, onMarkRead, onMarkAllRead }) {
  const [section, setSection] = useState('events');
  const unread = notifications.filter((n) => !n.read).length;

  const typeStyles = {
    assignment:  { icon: UserCheck, style: 'bg-violet-100 text-brand-purple' },
    missed_call: { icon: PhoneMissed, style: 'bg-rose-100 text-brand-magenta' },
    follow_up:   { icon: Clock, style: 'bg-amber-100 text-amber-600' },
    campaign:    { icon: Megaphone, style: 'bg-emerald-100 text-emerald-600' },
    new_lead:    { icon: Sparkles, style: 'bg-violet-100 text-brand-purple' },
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-1">
        <button
          onClick={() => setSection('events')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            section === 'events'
              ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]'
              : 'text-brand-ink/50 hover:text-brand-magenta'
          }`}
        >
          <Settings size={12} /> Event Configuration
        </button>
        <button
          onClick={() => setSection('inbox')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            section === 'inbox'
              ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]'
              : 'text-brand-ink/50 hover:text-brand-magenta'
          }`}
        >
          <Bell size={12} /> Inbox
          {unread > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${section === 'inbox' ? 'bg-white/25 text-white' : 'bg-brand-magenta text-white'}`}>
              {unread}
            </span>
          )}
        </button>
      </div>

      {section === 'events' && (
        <div className="card !p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 bg-gradient-to-r from-brand-mist/60 to-transparent px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
                <Settings size={16} />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-brand-ink">Notification Events</h3>
                <p className="text-[11px] text-brand-ink/50">Choose which events trigger notifications and how they're delivered</p>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-brand-lilac/40">
            {NOTIFICATION_EVENTS.map((evt) => {
              const c = config[evt.key] || { enabled: true, channel: 'in-app' };
              const Icon = evt.icon;
              const tone = TONE_CLASSES[evt.tone];
              return (
                <li key={evt.key} className="flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-brand-mist/30">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                    <Icon size={16} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{evt.label}</p>
                    <p className="truncate text-[11px] text-brand-ink/50">{evt.desc}</p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-0.5">
                    {['in-app', 'email', 'sms'].map((ch) => (
                      <button
                        key={ch}
                        onClick={() => onSetChannel(evt.key, ch)}
                        disabled={!c.enabled}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                          c.channel === ch ? 'bg-brand-magenta/10 text-brand-magenta' : 'text-brand-ink/50 hover:text-brand-magenta'
                        } ${!c.enabled ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {ch === 'in-app' ? 'In-App' : ch === 'email' ? 'Email' : 'SMS'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onToggleEvent(evt.key)}
                    className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${c.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${c.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {section === 'inbox' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-brand-ink/60">
              <strong className="text-brand-ink">{notifications.length}</strong> notification{notifications.length !== 1 ? 's' : ''} · <strong className="text-brand-magenta">{unread}</strong> unread
            </p>
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications yet" subtitle="Notifications from events will appear here." />
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const config2 = typeStyles[n.type] || typeStyles.assignment;
                const Icon = config2.icon;
                return (
                  <div key={n.id} className={`group flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-nowrap ${n.read ? 'border-brand-lilac/60' : 'border-brand-magenta/40 bg-brand-magenta/[0.03]'}`}>
                    <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config2.style}`}>
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
                    <span className="hidden shrink-0 font-mono text-[10px] text-brand-ink/40 lg:block">{n.time}</span>
                    {!n.read ? (
                      <button onClick={() => onMarkRead(n.id)} className="shrink-0 rounded-full border border-brand-purple/40 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-brand-purple hover:bg-brand-lilac/40">
                        Mark read
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-full bg-brand-lilac/40 px-2.5 py-1 text-[10px] font-semibold text-brand-ink/50">Read</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE MODAL
   ═══════════════════════════════════════════════════════════════ */
function TemplateModal({ mode = 'create', initial = {}, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    name: initial.name || '',
    channel: initial.channel || 'SMS',
    category: initial.category || 'Welcome',
    body: initial.body || '',
    status: initial.status || 'Active',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const insertVariable = (v) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newText = form.body.slice(0, start) + v + form.body.slice(end);
      setForm((f) => ({ ...f, body: newText }));
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + v.length;
      }, 0);
    } else {
      setForm((f) => ({ ...f, body: f.body + ' ' + v }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Template name is required'); return; }
    if (!form.body.trim()) { setError('Message body is required'); return; }
    setError('');
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onSubmit(form); }, 300);
  };

  return (
    <ModalShell title={isEdit ? 'Edit Template' : 'New Template'} subtitle={isEdit ? 'Update template content and category' : 'Create a reusable message template'} onClose={onClose} icon={FileText} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ModalInput
            label="Template Name *"
            value={form.name}
            onChange={(v) => { setForm({ ...form, name: v }); setError(''); }}
            placeholder="e.g. Welcome Message"
            icon={FileText}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Channel</label>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-brand-ink/70">Category</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TEMPLATE_CATEGORIES.map((c) => {
              const active = form.category === c.key;
              const Icon = c.icon;
              const tone = TONE_CLASSES[c.tone];
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.key })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition-all ${
                    active
                      ? `border-brand-magenta ${tone.chip} ring-1 ring-brand-magenta/30`
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:border-brand-magenta/40 hover:bg-brand-magenta/5'
                  }`}
                >
                  <Icon size={14} />
                  <span className="text-[10px]">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Message Body *</label>
          <textarea
            ref={textareaRef}
            value={form.body}
            onChange={(e) => { setForm({ ...form, body: e.target.value }); setError(''); }}
            rows={5}
            placeholder="Hi {{name}}, welcome to {{project}}! We're glad to have you with us."
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <div className="mt-2">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Insert variable:</p>
            <div className="flex flex-wrap gap-1.5">
              {VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="rounded-lg bg-brand-lilac/50 px-2 py-0.5 font-mono text-[10px] font-semibold text-brand-magenta hover:bg-brand-lilac"
                  title={v.label}
                >
                  {v.key}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Status</label>
          <div className="flex gap-2">
            {['Active', 'Draft'].map((s) => (
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

        {form.body && (
          <div className="rounded-xl border border-brand-magenta/30 bg-gradient-to-br from-brand-magenta/[0.06] to-brand-purple/[0.04] p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-brand-magenta">Preview</p>
            <p className="whitespace-pre-wrap text-sm italic text-brand-ink/80">{renderPreview(form.body)}</p>
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
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE DETAILS DRAWER
   ═══════════════════════════════════════════════════════════════ */
function TemplateDetailsDrawer({ template, onClose, onUse, onEdit, onCopy }) {
  const cat = findCategory(template.category);
  const CatIcon = cat.icon;
  const tone = TONE_CLASSES[cat.tone];

  const channelGradient = template.channel === 'SMS'
    ? 'from-brand-magenta to-brand-purple'
    : template.channel === 'WhatsApp'
    ? 'from-emerald-500 to-emerald-600'
    : 'from-amber-500 to-orange-500';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm bg-gradient-to-br ${channelGradient}`}>
              {template.channel === 'SMS' ? <MessageSquare size={20} /> : template.channel === 'WhatsApp' ? <MessageCircle size={20} /> : <Mail size={20} />}
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Template Details</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{template.name}</h3>
              <p className="font-mono text-[10px] text-brand-ink/50">{template.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Channel" value={template.channel} color="purple" />
            <InfoBox label="Category" value={cat.label} color={cat.tone} />
            <InfoBox label="Status" value={template.status} color={template.status === 'Active' ? 'emerald' : 'amber'} />
          </div>

          <div className="card !p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone.icon}`}>
                <CatIcon size={14} />
              </span>
              <div>
                <h4 className="font-display text-sm font-bold text-brand-ink">{cat.label} Template</h4>
                <p className="text-[10px] text-brand-ink/50">{cat.desc}</p>
              </div>
            </div>
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Message Body</h4>
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-ink/80">{template.body}</p>
            </div>
            <button onClick={onCopy} className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <Copy size={14} /> Copy Body
            </button>
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Live Preview</h4>
            <div className="rounded-xl border border-brand-magenta/30 bg-gradient-to-br from-brand-magenta/[0.06] to-brand-purple/[0.04] p-4">
              <p className="whitespace-pre-wrap text-sm italic text-brand-ink/80">{renderPreview(template.body)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={onEdit} className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <Pencil size={14} /> Edit
            </button>
            <button onClick={onUse} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110">
              <Send size={14} /> Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SEND MESSAGE MODAL
   ═══════════════════════════════════════════════════════════════ */
function SendMessageModal({ prefill, templates, onClose, onSend }) {
  const [form, setForm] = useState({
    channel: prefill?.channel || 'SMS',
    to: prefill?.to || '',
    message: prefill?.message || '',
    templateId: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const applyTemplate = (id) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setForm((f) => ({ ...f, channel: t.channel, message: t.body, templateId: id }));
  };

  const insertVariable = (v) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newText = form.message.slice(0, start) + v + form.message.slice(end);
      setForm((f) => ({ ...f, message: newText }));
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + v.length;
      }, 0);
    } else {
      setForm((f) => ({ ...f, message: f.message + ' ' + v }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.to.trim()) { setError('Recipient is required'); return; }
    if (form.channel === 'SMS' && !/^[0-9]{10,15}$/.test(form.to.replace(/\D/g, ''))) { setError('Enter a valid mobile number'); return; }
    if (form.channel === 'Email' && !/^\S+@\S+\.\S+$/.test(form.to)) { setError('Enter a valid email address'); return; }
    if (!form.message.trim()) { setError('Message body is required'); return; }
    setError('');
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onSend(form); }, 400);
  };

  const channelTemplates = templates.filter((t) => t.channel === form.channel && t.status === 'Active');

  return (
    <ModalShell title="Send Message" subtitle="Compose an SMS, WhatsApp, or Email message" onClose={onClose} icon={Send} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold text-brand-ink/70">Channel</label>
          <div className="flex gap-2">
            {CHANNELS.map((c) => {
              const Icon = c === 'SMS' ? MessageSquare : c === 'WhatsApp' ? MessageCircle : Mail;
              const active = form.channel === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, channel: c, templateId: '' })}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-xs font-semibold transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  <Icon size={13} /> {c}
                </button>
              );
            })}
          </div>
        </div>

        <ModalInput
          label="Recipient *"
          value={form.to}
          onChange={(v) => { setForm({ ...form, to: v }); setError(''); }}
          placeholder={form.channel === 'Email' ? 'customer@example.com' : '+91 9876543210'}
          icon={AtSign}
        />

        {channelTemplates.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Use Template (optional)</label>
            <select
              value={form.templateId}
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option value="">Choose a template...</option>
              {channelTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {findCategory(t.category).label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Message *</label>
          <textarea
            ref={textareaRef}
            value={form.message}
            onChange={(e) => { setForm({ ...form, message: e.target.value }); setError(''); }}
            rows={5}
            placeholder="Write your message here..."
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <div className="mt-2">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">Insert variable:</p>
            <div className="flex flex-wrap gap-1.5">
              {VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="rounded-lg bg-brand-lilac/50 px-2 py-0.5 font-mono text-[10px] font-semibold text-brand-magenta hover:bg-brand-lilac"
                >
                  {v.key}
                </button>
              ))}
            </div>
          </div>
        </div>

        {form.message && (
          <div className="rounded-xl border border-brand-magenta/30 bg-gradient-to-br from-brand-magenta/[0.06] to-brand-purple/[0.04] p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-brand-magenta">Preview</p>
            <p className="whitespace-pre-wrap text-sm italic text-brand-ink/80">{renderPreview(form.message)}</p>
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
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5"><Send size={14} /> Send Message</span>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE DETAILS DRAWER
   ═══════════════════════════════════════════════════════════════ */
function MessageDetailsDrawer({ message: m, onClose, onCopy }) {
  const status = STATUS_STYLES[m.status] || STATUS_STYLES.Pending;
  const StatusIcon = status.icon;

  const channelGradient = m.channel === 'SMS'
    ? 'from-brand-magenta to-brand-purple'
    : m.channel === 'WhatsApp'
    ? 'from-emerald-500 to-emerald-600'
    : 'from-amber-500 to-orange-500';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm bg-gradient-to-br ${channelGradient}`}>
              {m.channel === 'SMS' ? <MessageSquare size={20} /> : m.channel === 'WhatsApp' ? <MessageCircle size={20} /> : <Mail size={20} />}
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">{m.channel} Message</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{m.to}</h3>
              <p className="font-mono text-[10px] text-brand-ink/50">{m.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Status" value={m.status} color={m.status === 'Delivered' || m.status === 'Read' ? 'emerald' : m.status === 'Failed' ? 'rose' : 'amber'} />
            <InfoBox label="Channel" value={m.channel} color="purple" />
            <InfoBox label="Recipient" value={m.to} color="purple" />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Delivery Details</h4>
            <InfoRow icon={Phone} label="Recipient" value={m.to} />
            <InfoRow icon={Calendar} label="Sent On" value={m.date} />
            <InfoRow icon={StatusIcon} label="Status" value={m.status} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Message Content</h4>
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-ink/80">{m.message}</p>
            </div>
            <button onClick={onCopy} className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <Copy size={14} /> Copy Message
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${m.to}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <Phone size={14} /> Call
            </a>
            <a href={`mailto:${m.to}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110">
              <Mail size={14} /> Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function ModalShell({ title, subtitle, children, onClose, icon: Icon, wide }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} overflow-hidden rounded-2xl bg-white shadow-panel`}>
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
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

function ModalInput({ label, type = 'text', value, onChange, placeholder, icon: Icon }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-magenta/60" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-brand-lilac bg-white py-2.5 ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15`}
        />
      </div>
    </div>
  );
}

function InfoBox({ label, value, color = 'purple' }) {
  const colors = {
    purple:  'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber:   'bg-amber-50 text-amber-600 border-amber-200',
    rose:    'bg-rose-50 text-brand-magenta border-rose-200',
    cyan:    'bg-cyan-50 text-cyan-600 border-cyan-200',
    slate:   'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color]}`}>
      <p className="font-mono text-[9px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
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

function EmptyState({ icon: Icon, title, subtitle, onAdd, addLabel }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Icon size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-brand-ink/50">{subtitle}</p>}
      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card"
        >
          <Plus size={16} /> {addLabel || 'Create'}
        </button>
      )}
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
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}