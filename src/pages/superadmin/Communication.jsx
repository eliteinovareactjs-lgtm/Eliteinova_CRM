// src/pages/superadmin/Communication.jsx
import { useMemo, useState } from 'react';
import {
  MessageSquare, Mail, Send, CheckCircle2, XCircle, Clock, X, Search,
  Filter, Building2, ChevronDown, MoreVertical, Eye, Pencil, Trash2,
  Phone, Copy, Download, BarChart3, TrendingUp, TrendingDown, Percent,
  Layers, Tag, ClipboardList, FileText, Plus, Settings, Save, Info,
  AlertCircle, Server, Wifi, WifiOff, DollarSign, Zap, Star, Radio,
  MessageCircle, Smartphone, Hash, ListFilter, Users, UserCheck,
  Calendar, Play, Pause, RefreshCw, Upload, Globe, Check, Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  COMMUNICATIONS as INITIAL_COMMUNICATIONS,
  PROJECTS,
  AGENTS,
} from '../../data/mockData';

const CHANNELS = ['SMS', 'WhatsApp', 'Email'];
const STATUSES = ['Sent', 'Delivered', 'Read', 'Pending', 'Failed'];

const DEFAULT_TEMPLATES = [
  { id: 'T-001', name: 'Welcome Message', channel: 'SMS', body: 'Hi {{name}}, welcome to our service! Reply YES to confirm.', status: 'Active' },
  { id: 'T-002', name: 'Appointment Confirmation', channel: 'SMS', body: 'Hi {{name}}, your appointment is confirmed for {{date}} at {{time}}.', status: 'Active' },
  { id: 'T-003', name: 'WhatsApp Enquiry Reply', channel: 'WhatsApp', body: 'Hello {{name}}, thanks for your interest in {{project}}. Our team will call you shortly.', status: 'Active' },
  { id: 'T-004', name: 'Follow-Up Reminder', channel: 'WhatsApp', body: 'Hi {{name}}, just following up on our last conversation. Do you have a moment?', status: 'Active' },
  { id: 'T-005', name: 'Proposal Email', channel: 'Email', body: 'Dear {{name}},\n\nPlease find attached our proposal for {{project}}.\n\nBest regards,\n{{sender}}', status: 'Active' },
  { id: 'T-006', name: 'Thank You Email', channel: 'Email', body: 'Hi {{name}}, thank you for choosing us. We appreciate your business.', status: 'Draft' },
];

const DEFAULT_SENDER_IDS = [
  { id: 'S-001', senderId: 'ELITEINV', channel: 'SMS', type: 'Alphanumeric', status: 'Approved', project: 'matrimony' },
  { id: 'S-002', senderId: 'PROPCRM', channel: 'SMS', type: 'Alphanumeric', status: 'Approved', project: 'property' },
  { id: 'S-003', senderId: '+91 44 4567 8900', channel: 'WhatsApp', type: 'Business', status: 'Verified', project: 'matrimony' },
  { id: 'S-004', senderId: 'noreply@matrimony.com', channel: 'Email', type: 'Domain', status: 'Verified', project: 'matrimony' },
];

const DEFAULT_USAGE_LIMITS = [
  { channel: 'SMS', dailyLimit: 5000, used: 1240, unit: 'messages' },
  { channel: 'WhatsApp', dailyLimit: 2000, used: 680, unit: 'messages' },
  { channel: 'Email', dailyLimit: 10000, used: 3450, unit: 'emails' },
];

const TABS = [
  { key: 'logs', label: 'Communication Logs', icon: ClipboardList },
  { key: 'templates', label: 'Templates', icon: FileText },
  { key: 'senders', label: 'Sender IDs', icon: Hash },
  { key: 'usage', label: 'Usage', icon: BarChart3 },
  { key: 'gateways', label: 'Gateways', icon: Server },
];

export default function Communication() {
  const { role, activeWebsiteId } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  /* ========== LOCAL DATA ========== */
  const [allMessages, setAllMessages] = useState(INITIAL_COMMUNICATIONS);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [senderIds, setSenderIds] = useState(DEFAULT_SENDER_IDS);
  const [usageLimits] = useState(DEFAULT_USAGE_LIMITS);

  /* ========== FILTERS ========== */
  const [tab, setTab] = useState('logs');
  const [channelTab, setChannelTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [templateChannelFilter, setTemplateChannelFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  /* ========== UI STATE ========== */
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  /* ========== MODALS ========== */
  const [viewingMessage, setViewingMessage] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendPrefill, setSendPrefill] = useState(null);
  const [showSenderModal, setShowSenderModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteTemplate, setConfirmDeleteTemplate] = useState(null);
  const [toast, setToast] = useState(null);

  /* ========== HELPERS ========== */
  const projectName = (id) =>
    PROJECTS.find((p) => p.id === id)?.name || id;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const statusIcon = (status) => {
    if (status === 'Delivered' || status === 'Read' || status === 'Sent')
      return <CheckCircle2 size={12} className="text-emerald-500" />;
    if (status === 'Failed')
      return <XCircle size={12} className="text-rose-500" />;
    return <Clock size={12} className="text-amber-500" />;
  };

  /* ========== SCOPED MESSAGES ========== */
  const scopedMessages = useMemo(() => {
    let rows = isSuperAdmin
      ? projectFilter === 'All'
        ? allMessages
        : allMessages.filter((m) => m.projectId === projectFilter)
      : allMessages.filter((m) => m.projectId === activeWebsiteId);

    if (channelTab !== 'All')
      rows = rows.filter((m) => m.channel === channelTab);

    if (statusFilter !== 'All')
      rows = rows.filter((m) => m.status === statusFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((m) => {
        const hay = `${m.to} ${m.message} ${m.projectId}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return rows;
  }, [
    allMessages,
    isSuperAdmin,
    activeWebsiteId,
    projectFilter,
    channelTab,
    statusFilter,
    searchQuery,
  ]);

  /* ========== FILTERED TEMPLATES ========== */
  const filteredTemplates = useMemo(() => {
    if (templateChannelFilter === 'All') return templates;
    return templates.filter((t) => t.channel === templateChannelFilter);
  }, [templates, templateChannelFilter]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const scoped = isSuperAdmin
      ? allMessages
      : allMessages.filter((m) => m.projectId === activeWebsiteId);

    const total = scoped.length;
    const sms = scoped.filter((m) => m.channel === 'SMS').length;
    const whatsapp = scoped.filter((m) => m.channel === 'WhatsApp').length;
    const email = scoped.filter((m) => m.channel === 'Email').length;
    const sent = scoped.filter((m) => m.status === 'Sent').length;
    const delivered = scoped.filter((m) => m.status === 'Delivered').length;
    const read = scoped.filter((m) => m.status === 'Read').length;
    const failed = scoped.filter((m) => m.status === 'Failed').length;
    const pending = scoped.filter((m) => m.status === 'Pending').length;
    const deliveryRate =
      total > 0 ? Math.round(((delivered + read + sent) / total) * 100) : 0;
    return {
      total,
      sms,
      whatsapp,
      email,
      sent,
      delivered,
      read,
      failed,
      pending,
      deliveryRate,
    };
  }, [allMessages, isSuperAdmin, activeWebsiteId]);

  /* ========== ACTIONS ========== */
  const handleDelete = (id) => {
    setAllMessages((prev) => prev.filter((m) => m.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
    showToast('Message deleted', 'error');
  };

  const handleSaveTemplate = (data) => {
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? { ...t, ...data } : t))
      );
      showToast('Template updated');
    } else {
      const newT = {
        id: 'T-' + String(Date.now()).slice(-4),
        ...data,
        status: data.status || 'Active',
      };
      setTemplates((prev) => [newT, ...prev]);
      showToast('Template created');
    }
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setConfirmDeleteTemplate(null);
    showToast('Template deleted', 'error');
  };

  /* ========== SEND MESSAGE (WORKING) ========== */
  const handleOpenSend = (prefill = null) => {
    setSendPrefill(prefill);
    setShowSendModal(true);
  };

  const handleSend = (data) => {
    const newMessage = {
      id: 'MSG-' + String(Date.now()).slice(-4),
      projectId: data.projectId,
      channel: data.channel,
      to: data.to,
      message: data.message,
      status: 'Sent',
      date: new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setAllMessages((prev) => [newMessage, ...prev]);
    setShowSendModal(false);
    setSendPrefill(null);
    showToast(
      `${data.channel} sent to ${data.to}`
    );
  };

  /* ========== SENDER ID (WORKING) ========== */
  const handleAddSender = (data) => {
    const newSender = {
      id: 'S-' + String(Date.now()).slice(-4),
      ...data,
      status: 'Pending',
    };
    setSenderIds((prev) => [newSender, ...prev]);
    setShowSenderModal(false);
    showToast(`Sender ID "${data.senderId}" submitted for approval`);
  };

  const handleDeleteSender = (id) => {
    setSenderIds((prev) => prev.filter((s) => s.id !== id));
    showToast('Sender ID removed', 'error');
  };

  const handleExport = () => {
    if (scopedMessages.length === 0) {
      showToast('No messages to export', 'error');
      return;
    }
    const rows = [
      ['ID', 'Channel', 'To', 'Message', 'Project', 'Status', 'Date'],
      ...scopedMessages.map((m) => [
        m.id,
        m.channel,
        m.to,
        m.message,
        projectName(m.projectId),
        m.status,
        m.date,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communications-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${scopedMessages.length} messages`);
  };

  const hasFilters =
    searchQuery ||
    statusFilter !== 'All' ||
    projectFilter !== 'All' ||
    channelTab !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setProjectFilter('All');
    setChannelTab('All');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Communication
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <MessageSquare size={13} className="text-brand-purple" />
            Central management of SMS, WhatsApp, and Email.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tab === 'templates' ? (
            <button
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              <Plus
                size={14}
                className="transition-transform group-hover:rotate-90 duration-300"
              />
              New Template
            </button>
          ) : tab === 'senders' ? (
            <button
              onClick={() => setShowSenderModal(true)}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              <Plus
                size={14}
                className="transition-transform group-hover:rotate-90 duration-300"
              />
              Add Sender ID
            </button>
          ) : (
            <>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <Download size={14} /> Export
              </button>
              <button
                onClick={() => handleOpenSend()}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                <Send
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 duration-300"
                />
                Send Message
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total Messages"
          value={summary.total}
          sub={`${summary.sms} SMS · ${summary.whatsapp} WA`}
          icon={Send}
          color="purple"
          trend="+12%"
          trendUp
        />
        <AnimatedStatCard
          label="Delivered"
          value={summary.delivered + summary.read + summary.sent}
          sub={`${summary.deliveryRate}% delivery rate`}
          icon={CheckCircle2}
          color="emerald"
          trend="+8%"
          trendUp
        />
        <AnimatedStatCard
          label="Pending"
          value={summary.pending}
          sub="Awaiting delivery"
          icon={Clock}
          color="amber"
          trend="+2"
          trendUp
        />
        <AnimatedStatCard
          label="Failed"
          value={summary.failed}
          sub="Require attention"
          icon={XCircle}
          color="rose"
          trend="-1"
          trendUp={false}
        />
      </div>

      {/* ================= SECONDARY STATS ================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MiniStatCard
          label="SMS"
          value={summary.sms}
          icon={MessageSquare}
          color="purple"
        />
        <MiniStatCard
          label="WhatsApp"
          value={summary.whatsapp}
          icon={MessageCircle}
          color="emerald"
        />
        <MiniStatCard
          label="Email"
          value={summary.email}
          icon={Mail}
          color="amber"
        />
        <MiniStatCard
          label="Delivery Rate"
          value={`${summary.deliveryRate}%`}
          icon={Percent}
          color="rose"
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
      </div>

      {/* ================= TAB CONTENT ================= */}
      {tab === 'logs' && (
        <LogsTab
          scopedMessages={scopedMessages}
          channelTab={channelTab}
          setChannelTab={setChannelTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOpen={statusOpen}
          setStatusOpen={setStatusOpen}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          projectOpen={projectOpen}
          setProjectOpen={setProjectOpen}
          isSuperAdmin={isSuperAdmin}
          projectName={projectName}
          statusIcon={statusIcon}
          viewMode={viewMode}
          setViewMode={setViewMode}
          hasFilters={hasFilters}
          clearFilters={clearFilters}
          onView={setViewingMessage}
          onDelete={(m) => setConfirmDelete(m)}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          onCompose={(prefill) => handleOpenSend(prefill)}
        />
      )}

      {tab === 'templates' && (
        <TemplatesTab
          templates={filteredTemplates}
          channelFilter={templateChannelFilter}
          setChannelFilter={setTemplateChannelFilter}
          onEdit={(t) => {
            setEditingTemplate(t);
            setShowTemplateModal(true);
          }}
          onDelete={(t) => setConfirmDeleteTemplate(t)}
          onUse={(t) => handleOpenSend({ channel: t.channel, message: t.body })}
        />
      )}

      {tab === 'senders' && (
        <SenderIdsTab
          senderIds={senderIds}
          projectName={projectName}
          onAdd={() => setShowSenderModal(true)}
          onDelete={handleDeleteSender}
        />
      )}

      {tab === 'usage' && (
        <UsageTab
          usageLimits={usageLimits}
          scopedMessages={scopedMessages}
          projectName={projectName}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {tab === 'gateways' && <GatewaysTab />}

      {/* ================= MODALS / DRAWERS ================= */}
      {viewingMessage && (
        <MessageDetailsDrawer
          message={viewingMessage}
          projectName={projectName}
          statusIcon={statusIcon}
          onClose={() => setViewingMessage(null)}
        />
      )}

      {showTemplateModal && (
        <TemplateModal
          mode={editingTemplate ? 'edit' : 'create'}
          initial={editingTemplate || {}}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
          onSubmit={handleSaveTemplate}
        />
      )}

      {showSendModal && (
        <SendMessageModal
          prefill={sendPrefill}
          templates={templates}
          onClose={() => {
            setShowSendModal(false);
            setSendPrefill(null);
          }}
          onSend={handleSend}
        />
      )}

      {showSenderModal && (
        <AddSenderModal
          onClose={() => setShowSenderModal(false)}
          onSubmit={handleAddSender}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete message?"
          message={`This will permanently delete this ${confirmDelete.channel} message log.`}
          confirmLabel="Delete Message"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
      )}

      {confirmDeleteTemplate && (
        <ConfirmDialog
          title="Delete template?"
          message={`This will permanently delete the template "${confirmDeleteTemplate.name}".`}
          confirmLabel="Delete Template"
          onCancel={() => setConfirmDeleteTemplate(null)}
          onConfirm={() => handleDeleteTemplate(confirmDeleteTemplate.id)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= LOGS TAB ================= */
function LogsTab({
  scopedMessages,
  channelTab,
  setChannelTab,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  statusOpen,
  setStatusOpen,
  projectFilter,
  setProjectFilter,
  projectOpen,
  setProjectOpen,
  isSuperAdmin,
  projectName,
  statusIcon,
  viewMode,
  setViewMode,
  hasFilters,
  clearFilters,
  onView,
  onDelete,
  menuOpenId,
  setMenuOpenId,
  onCompose,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {['All', ...CHANNELS].map((c) => (
          <button
            key={c}
            onClick={() => setChannelTab(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              channelTab === c
                ? 'border-transparent bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card'
                : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/40'
            }`}
          >
            {c}
          </button>
        ))}

        <button
          onClick={() => onCompose()}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-xs font-semibold text-brand-purple hover:bg-brand-lilac/40"
        >
          <Plus size={12} /> Compose
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipient, message..."
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
              setStatusOpen(false);
            }}
            onChange={(v) => {
              setProjectFilter(v);
              setProjectOpen(false);
            }}
          />
        )}

        <DropdownFilter
          label="Status"
          icon={Filter}
          value={statusFilter}
          options={['All', ...STATUSES]}
          open={statusOpen}
          onToggle={() => {
            setStatusOpen((s) => !s);
            setProjectOpen(false);
          }}
          onChange={(v) => {
            setStatusFilter(v);
            setStatusOpen(false);
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

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg border p-1.5 ${
              viewMode === 'list'
                ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
            }`}
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
          >
            <Layers size={14} />
          </button>
        </div>
      </div>

      {scopedMessages.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onClear={clearFilters}
          message="No messages found"
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {scopedMessages.map((m) => (
            <MessageRow
              key={m.id}
              message={m}
              projectName={projectName}
              statusIcon={statusIcon}
              isSuperAdmin={isSuperAdmin}
              onView={() => onView(m)}
              onDelete={() => onDelete(m)}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scopedMessages.map((m) => (
            <MessageCard
              key={m.id}
              message={m}
              projectName={projectName}
              statusIcon={statusIcon}
              isSuperAdmin={isSuperAdmin}
              onView={() => onView(m)}
              onDelete={() => onDelete(m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= MESSAGE ROW ================= */
function MessageRow({
  message: m,
  projectName,
  statusIcon,
  isSuperAdmin,
  onView,
  onDelete,
  menuOpenId,
  setMenuOpenId,
}) {
  return (
    <div className="group flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          m.channel === 'SMS'
            ? 'bg-violet-50 text-brand-purple'
            : m.channel === 'WhatsApp'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-amber-50 text-amber-600'
        }`}
      >
        {m.channel === 'SMS' ? (
          <MessageSquare size={16} />
        ) : m.channel === 'WhatsApp' ? (
          <MessageCircle size={16} />
        ) : (
          <Mail size={16} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">{m.to}</p>
        <p className="truncate text-xs text-brand-ink/50">{m.message}</p>
      </div>

      {isSuperAdmin && (
        <div className="hidden shrink-0 text-xs md:block">
          <p className="text-brand-ink/40">Project</p>
          <p className="font-semibold text-brand-ink/70">
            {projectName(m.projectId)}
          </p>
        </div>
      )}

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
          m.channel === 'SMS'
            ? 'bg-violet-100 text-brand-purple'
            : m.channel === 'WhatsApp'
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-amber-100 text-amber-600'
        }`}
      >
        {m.channel}
      </span>

      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
        {statusIcon(m.status)} {m.status}
      </span>

      <span className="hidden shrink-0 text-[10px] text-brand-ink/40 lg:block">
        {m.date}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple sm:flex"
        >
          <Eye size={13} />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpenId(menuOpenId === m.id ? null : m.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 transition-colors hover:bg-brand-lilac"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === m.id && (
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
                <MenuItem
                  icon={Copy}
                  label="Copy Message"
                  onClick={() => {
                    navigator.clipboard?.writeText(m.message);
                    setMenuOpenId(null);
                  }}
                />
                <MenuItem
                  icon={Phone}
                  label="Call Recipient"
                  onClick={() => {
                    window.location.href = `tel:${m.to}`;
                    setMenuOpenId(null);
                  }}
                />
                <div className="my-1 h-px bg-brand-lilac/60" />
                <MenuItem
                  icon={Trash2}
                  label="Delete"
                  danger
                  onClick={() => {
                    onDelete();
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

/* ================= MESSAGE CARD ================= */
function MessageCard({
  message: m,
  projectName,
  statusIcon,
  isSuperAdmin,
  onView,
  onDelete,
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-purple/50 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)]">
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${
          m.channel === 'SMS'
            ? 'from-brand-purple to-brand-magenta'
            : m.channel === 'WhatsApp'
            ? 'from-emerald-500 to-emerald-400'
            : 'from-amber-500 to-orange-400'
        } transition-transform duration-500 group-hover:scale-x-100`}
      />

      <div className="relative flex flex-col p-5">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
              m.channel === 'SMS'
                ? 'bg-gradient-to-br from-brand-purple to-brand-magenta text-white'
                : m.channel === 'WhatsApp'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
            }`}
          >
            {m.channel === 'SMS' ? (
              <MessageSquare size={20} />
            ) : m.channel === 'WhatsApp' ? (
              <MessageCircle size={20} />
            ) : (
              <Mail size={20} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-brand-ink">{m.to}</p>
            <p className="truncate text-xs text-brand-ink/50">{m.date}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              m.channel === 'SMS'
                ? 'bg-violet-100 text-brand-purple'
                : m.channel === 'WhatsApp'
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-amber-100 text-amber-600'
            }`}
          >
            {m.channel}
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3">
          <p className="line-clamp-3 text-xs leading-relaxed text-brand-ink/70">
            {m.message}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="mt-3 flex items-center justify-between gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-brand-ink/50">
              <Building2 size={10} /> Project
            </span>
            <span className="truncate font-semibold text-brand-ink">
              {projectName(m.projectId)}
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mist px-2.5 py-1 text-[10px] font-semibold text-brand-ink/70">
            {statusIcon(m.status)} {m.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
          >
            <Eye size={13} /> View
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white py-2.5 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-50"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= TEMPLATES TAB ================= */
function TemplatesTab({ templates, channelFilter, setChannelFilter, onEdit, onDelete, onUse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {['All', ...CHANNELS].map((c) => (
          <button
            key={c}
            onClick={() => setChannelFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              channelFilter === c
                ? 'border-transparent bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card'
                : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/40'
            }`}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto text-xs text-brand-ink/50">
          {templates.length} template{templates.length !== 1 ? 's' : ''}
        </span>
      </div>

      {templates.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
            <FileText size={22} />
          </div>
          <p className="font-display text-sm font-semibold text-brand-ink">
            No templates for this channel
          </p>
          <button
            onClick={() => setChannelFilter('All')}
            className="text-xs font-semibold text-brand-purple hover:underline"
          >
            Show all channels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-brand-lilac/80 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-purple/50 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)]"
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${
                  t.channel === 'SMS'
                    ? 'from-brand-purple to-brand-magenta'
                    : t.channel === 'WhatsApp'
                    ? 'from-emerald-500 to-emerald-400'
                    : 'from-amber-500 to-orange-400'
                } transition-transform duration-500 group-hover:scale-x-100`}
              />

              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    t.channel === 'SMS'
                      ? 'bg-violet-100 text-brand-purple'
                      : t.channel === 'WhatsApp'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {t.channel === 'SMS' ? (
                    <MessageSquare size={18} />
                  ) : t.channel === 'WhatsApp' ? (
                    <MessageCircle size={18} />
                  ) : (
                    <Mail size={18} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-brand-ink">{t.name}</p>
                  <p className="truncate text-xs text-brand-ink/50">{t.id}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    t.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div className="mt-3 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3">
                <p className="line-clamp-4 text-xs leading-relaxed text-brand-ink/70 italic">
                  "{t.body}"
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    t.channel === 'SMS'
                      ? 'bg-violet-100 text-brand-purple'
                      : t.channel === 'WhatsApp'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {t.channel}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUse(t)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
                >
                  <Send size={12} /> Use
                </button>
                <button
                  onClick={() => onEdit(t)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => onDelete(t)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white py-2 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-50"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= SENDER IDS TAB ================= */
function SenderIdsTab({ senderIds, projectName, onAdd, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <Hash size={14} className="text-brand-purple" />
            Sender IDs
          </h3>
          <span className="text-xs text-brand-ink/50">
            {senderIds.length} registered
          </span>
        </div>

        <div className="space-y-2">
          {senderIds.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-brand-ink/50">No sender IDs yet.</p>
              <button
                onClick={onAdd}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Plus size={12} /> Add First Sender ID
              </button>
            </div>
          ) : (
            senderIds.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    s.channel === 'SMS'
                      ? 'bg-violet-100 text-brand-purple'
                      : s.channel === 'WhatsApp'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {s.channel === 'SMS' ? (
                    <MessageSquare size={14} />
                  ) : s.channel === 'WhatsApp' ? (
                    <MessageCircle size={14} />
                  ) : (
                    <Mail size={14} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-semibold text-brand-ink">
                    {s.senderId}
                  </p>
                  <p className="truncate text-[10px] text-brand-ink/50">
                    {s.channel} · {s.type} · {projectName(s.project)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    s.status === 'Approved' || s.status === 'Verified'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {s.status}
                </span>
                <button
                  onClick={() => onDelete(s.id)}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= USAGE TAB ================= */
function UsageTab({ usageLimits, scopedMessages, projectName, isSuperAdmin }) {
  const byProject = useMemo(() => {
    const map = {};
    scopedMessages.forEach((m) => {
      const name = projectName(m.projectId);
      if (!map[name]) map[name] = { total: 0, sms: 0, whatsapp: 0, email: 0 };
      map[name].total++;
      map[name][m.channel.toLowerCase()] =
        (map[name][m.channel.toLowerCase()] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [scopedMessages, projectName]);

  const byChannel = useMemo(() => {
    const map = { SMS: 0, WhatsApp: 0, Email: 0 };
    scopedMessages.forEach((m) => {
      map[m.channel] = (map[m.channel] || 0) + 1;
    });
    return map;
  }, [scopedMessages]);

  const maxProject = Math.max(...byProject.map(([, d]) => d.total), 1);
  const maxChannel = Math.max(...Object.values(byChannel), 1);

  return (
    <div className="space-y-5">
      <div className="card !p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <DollarSign size={14} className="text-brand-purple" />
          Usage Limits
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {usageLimits.map((u) => {
            const pct = Math.min(100, Math.round((u.used / u.dailyLimit) * 100));
            return (
              <div
                key={u.channel}
                className="rounded-xl border border-brand-lilac bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                    {u.channel === 'SMS' ? (
                      <MessageSquare size={12} className="text-brand-purple" />
                    ) : u.channel === 'WhatsApp' ? (
                      <MessageCircle size={12} className="text-emerald-600" />
                    ) : (
                      <Mail size={12} className="text-amber-600" />
                    )}
                    {u.channel}
                  </span>
                  <span className="rounded-full bg-brand-lilac px-2 py-0.5 text-[10px] font-bold text-brand-purple">
                    {pct}%
                  </span>
                </div>
                <p className="mt-2 font-display text-xl font-bold tabular-nums text-brand-ink">
                  {u.used.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-brand-ink/50">
                    / {u.dailyLimit.toLocaleString()}
                  </span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className={`h-full rounded-full ${
                      pct > 85
                        ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                        : pct > 60
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-brand-ink/40">
                  {u.unit} per day
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card !p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <BarChart3 size={14} className="text-brand-purple" />
          Usage by Channel
        </h3>
        <div className="space-y-2.5">
          {Object.entries(byChannel).map(([channel, count]) => {
            const pct = (count / maxChannel) * 100;
            return (
              <div key={channel}>
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-brand-ink/70">
                    {channel}
                  </span>
                  <span className="font-bold tabular-nums text-brand-ink">
                    {count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className={`h-full rounded-full ${
                      channel === 'SMS'
                        ? 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                        : channel === 'WhatsApp'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : 'bg-gradient-to-r from-amber-500 to-orange-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isSuperAdmin && byProject.length > 0 && (
        <div className="card !p-4 space-y-3">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <Building2 size={14} className="text-brand-purple" />
            Usage by Project
          </h3>
          <div className="space-y-2.5">
            {byProject.map(([name, data]) => {
              const pct = (data.total / maxProject) * 100;
              return (
                <div key={name}>
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="truncate font-semibold text-brand-ink/70">
                      {name}
                    </span>
                    <span className="font-bold tabular-nums text-brand-ink">
                      {data.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-brand-ink/50">
                    <span>SMS: {data.sms || 0}</span>
                    <span>WhatsApp: {data.whatsapp || 0}</span>
                    <span>Email: {data.email || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= GATEWAYS TAB ================= */
function GatewaysTab() {
  const gateways = [
    { name: 'Twilio SMS', type: 'SMS Gateway', status: 'Connected', provider: 'Twilio', icon: MessageSquare },
    { name: 'WhatsApp Business API', type: 'WhatsApp API', status: 'Connected', provider: 'Meta', icon: MessageCircle },
    { name: 'SendGrid SMTP', type: 'Email / SMTP', status: 'Connected', provider: 'SendGrid', icon: Mail },
    { name: 'Exotel Voice', type: 'Voice Services', status: 'Disconnected', provider: 'Exotel', icon: Phone },
  ];

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Server size={14} className="text-brand-purple" />
          Communication Gateways
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {gateways.map((g) => {
            const Icon = g.icon;
            const isConnected = g.status === 'Connected';
            return (
              <div
                key={g.name}
                className={`flex items-center gap-3 rounded-xl border-2 bg-white p-4 transition-all ${
                  isConnected
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-rose-200 hover:border-rose-300'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-500'
                  }`}
                >
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {g.name}
                  </p>
                  <p className="truncate text-[10px] text-brand-ink/50">
                    {g.type} · {g.provider}
                  </p>
                </div>
                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-500'
                  }`}
                >
                  {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {g.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card !p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Bell size={14} className="text-brand-purple" />
          Communication Credits
        </h3>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-purple/70">
                Available Balance
              </p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums text-brand-purple">
                ₹8,500
              </p>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110">
              <DollarSign size={14} /> Top Up
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-[10px]">
            <div className="rounded-lg bg-white/60 p-2">
              <p className="text-brand-purple/70">SMS Used</p>
              <p className="font-bold tabular-nums text-brand-purple">₹1,240</p>
            </div>
            <div className="rounded-lg bg-white/60 p-2">
              <p className="text-brand-purple/70">WhatsApp</p>
              <p className="font-bold tabular-nums text-brand-purple">₹680</p>
            </div>
            <div className="rounded-lg bg-white/60 p-2">
              <p className="text-brand-purple/70">Email</p>
              <p className="font-bold tabular-nums text-brand-purple">₹320</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= MESSAGE DETAILS DRAWER ================= */
function MessageDetailsDrawer({ message: m, projectName, statusIcon, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                m.channel === 'SMS'
                  ? 'bg-gradient-to-br from-brand-purple to-brand-magenta'
                  : m.channel === 'WhatsApp'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-br from-amber-500 to-orange-500'
              }`}
            >
              {m.channel === 'SMS' ? (
                <MessageSquare size={22} />
              ) : m.channel === 'WhatsApp' ? (
                <MessageCircle size={22} />
              ) : (
                <Mail size={22} />
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {m.channel} Message
              </h3>
              <p className="text-xs text-brand-ink/50">{m.id}</p>
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
              label="Status"
              value={m.status}
              color={
                m.status === 'Delivered' || m.status === 'Read'
                  ? 'emerald'
                  : m.status === 'Failed'
                  ? 'rose'
                  : 'amber'
              }
            />
            <InfoBox label="Channel" value={m.channel} color="purple" />
            <InfoBox label="Project" value={projectName(m.projectId)} color="purple" />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Delivery Details
            </h4>
            <InfoRow icon={Phone} label="Recipient" value={m.to} />
            <InfoRow icon={Calendar} label="Sent On" value={m.date} />
            <InfoRow icon={CheckCircle2} label="Status" value={m.status} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Message Content
            </h4>
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-ink/80">
                {m.message}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(m.message)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <Copy size={14} /> Copy Message
            </button>
          </div>

          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${m.to}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <Phone size={14} /> Call Recipient
              </a>
              <a
                href={`mailto:${m.to}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                <Mail size={14} /> Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= TEMPLATE MODAL ================= */
function TemplateModal({ mode = 'create', initial = {}, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    name: initial.name || '',
    channel: initial.channel || 'SMS',
    body: initial.body || '',
    status: initial.status || 'Active',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Template name is required.';
    if (!form.body.trim()) return 'Message body is required.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit(form);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {isEdit ? 'Edit Template' : 'New Template'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {isEdit
                  ? 'Update template content.'
                  : 'Create a reusable message template.'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Template Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Welcome Message"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Channel
            </label>
            <div className="flex gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, channel: c })}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    form.channel === c
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Message Body
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={5}
              placeholder="Use {{name}}, {{date}}, {{project}} as placeholders..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['{{name}}', '{{date}}', '{{time}}', '{{project}}', '{{sender}}'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, body: form.body + ' ' + p })}
                  className="rounded-lg bg-brand-lilac/50 px-2 py-0.5 text-[10px] font-mono font-semibold text-brand-purple hover:bg-brand-lilac"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Status
            </label>
            <div className="flex gap-2">
              {['Active', 'Draft'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    form.status === s
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {form.body && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-brand-purple">
                Preview
              </p>
              <p className="whitespace-pre-wrap text-sm italic text-brand-ink/70">
                {form.body
                  .replace(/\{\{name\}\}/g, 'John Doe')
                  .replace(/\{\{date\}\}/g, '25 Oct 2026')
                  .replace(/\{\{time\}\}/g, '11:00 AM')
                  .replace(/\{\{project\}\}/g, 'Matrimony CRM')
                  .replace(/\{\{sender\}\}/g, 'Eliteinova')}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              {submitting
                ? 'Saving…'
                : isEdit
                ? 'Save Changes'
                : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= SEND MESSAGE MODAL (NEW) ================= */
function SendMessageModal({ prefill, templates, onClose, onSend }) {
  const { activeWebsiteId } = useAuth();
  const [form, setForm] = useState({
    channel: prefill?.channel || 'SMS',
    to: prefill?.to || '',
    message: prefill?.message || '',
    projectId: prefill?.projectId || activeWebsiteId || PROJECTS[0].id,
    templateId: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const applyTemplate = (id) => {
    const t = templates.find((t) => t.id === id);
    if (!t) return;
    setForm((f) => ({
      ...f,
      channel: t.channel,
      message: t.body,
      templateId: id,
    }));
  };

  const validate = () => {
    if (!form.to.trim()) return 'Recipient is required.';
    if (form.channel === 'SMS' && !/^[0-9]{10,15}$/.test(form.to.replace(/\D/g, '')))
      return 'Enter a valid mobile number.';
    if (form.channel === 'Email' && !/^\S+@\S+\.\S+$/.test(form.to))
      return 'Enter a valid email address.';
    if (!form.message.trim()) return 'Message body is required.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSend(form);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Send size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Send Message
              </h3>
              <p className="text-xs text-brand-ink/50">
                Compose an SMS, WhatsApp, or Email message.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Channel
            </label>
            <div className="flex gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, channel: c })}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    form.channel === c
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Recipient
            </label>
            <input
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              placeholder={
                form.channel === 'Email'
                  ? 'customer@example.com'
                  : '+91 9876543210'
              }
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Project
              </label>
              <select
                value={form.projectId}
                onChange={(e) =>
                  setForm({ ...form, projectId: e.target.value })
                }
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              >
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Use Template (optional)
              </label>
              <select
                value={form.templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              >
                <option value="">Choose a template...</option>
                {templates
                  .filter((t) => t.channel === form.channel && t.status === 'Active')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Message
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              placeholder="Write your message here..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['{{name}}', '{{date}}', '{{time}}', '{{project}}', '{{sender}}'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, message: form.message + ' ' + p })
                  }
                  className="rounded-lg bg-brand-lilac/50 px-2 py-0.5 text-[10px] font-mono font-semibold text-brand-purple hover:bg-brand-lilac"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {form.message && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-brand-purple">
                Preview
              </p>
              <p className="whitespace-pre-wrap text-sm italic text-brand-ink/70">
                {form.message
                  .replace(/\{\{name\}\}/g, 'John Doe')
                  .replace(/\{\{date\}\}/g, '25 Oct 2026')
                  .replace(/\{\{time\}\}/g, '11:00 AM')
                  .replace(/\{\{project\}\}/g, 'Matrimony CRM')
                  .replace(/\{\{sender\}\}/g, 'Eliteinova')}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Sending…
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Send size={14} /> Send Message
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= ADD SENDER MODAL (NEW) ================= */
function AddSenderModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    senderId: '',
    channel: 'SMS',
    type: 'Alphanumeric',
    project: PROJECTS[0].id,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.senderId.trim()) return 'Sender ID is required.';
    if (form.channel === 'SMS' && form.type === 'Alphanumeric') {
      if (!/^[A-Za-z]{6}$/.test(form.senderId.trim()))
        return 'Alphanumeric sender ID must be 6 letters (e.g. ELITEINV).';
    }
    if (form.channel === 'Email' && !/^\S+@\S+\.\S+$/.test(form.senderId.trim()))
      return 'Enter a valid email for Email sender ID.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit(form);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Hash size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Add Sender ID
              </h3>
              <p className="text-xs text-brand-ink/50">
                Register a new sender identity for outbound messages.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Channel
            </label>
            <div className="flex gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      channel: c,
                      type:
                        c === 'Email'
                          ? 'Domain'
                          : c === 'WhatsApp'
                          ? 'Business'
                          : 'Alphanumeric',
                    })
                  }
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    form.channel === c
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Sender ID
            </label>
            <input
              value={form.senderId}
              onChange={(e) =>
                setForm({ ...form, senderId: e.target.value })
              }
              placeholder={
                form.channel === 'SMS'
                  ? 'e.g. ELITEINV'
                  : form.channel === 'WhatsApp'
                  ? '+91 44 4567 8900'
                  : 'noreply@example.com'
              }
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              >
                <option>Alphanumeric</option>
                <option>Numeric</option>
                <option>Business</option>
                <option>Domain</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Project
              </label>
              <select
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              >
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <p className="flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              New sender IDs are submitted for approval. Delivery may take up to
              24 hours.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Sender ID'}
            </button>
          </div>
        </form>
      </div>
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
function EmptyState({ hasFilters, onClear, message }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <MessageSquare size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No messages match your filters' : message}
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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-purple">
        <Icon size={14} />
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="text-brand-ink/50">{label}</span>
        <span className="truncate font-semibold text-brand-ink">{value}</span>
      </div>
    </div>
  );
}