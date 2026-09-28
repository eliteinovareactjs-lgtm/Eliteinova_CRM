// src/pages/admin/Integrations.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plug, CheckCircle2, XCircle, Plus, Key, X, Search, ChevronDown,
  MoreVertical, Eye, EyeOff, Copy, Check, Trash2, Pencil, Save,
  AlertCircle, Settings, Wifi, WifiOff, DollarSign, MessageSquare,
  MessageCircle, Mail, Phone, Globe, Link2, Lock, RefreshCw,
  Clock, Zap, Download, Layers, Hash, Webhook, CreditCard,
  Grid3x3, List, Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INTEGRATIONS as INITIAL_INTEGRATIONS } from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'all',        label: 'All',            icon: Plug },
  { key: 'Telephony',  label: 'Telephony',      icon: Phone },
  { key: 'WhatsApp',   label: 'WhatsApp',       icon: MessageCircle },
  { key: 'SMS',        label: 'SMS',            icon: MessageSquare },
  { key: 'Email',      label: 'Email',          icon: Mail },
  { key: 'Payment',    label: 'Payment',        icon: DollarSign },
  { key: 'Website',    label: 'Website / API',  icon: Globe },
  { key: 'Webhooks',   label: 'Webhooks',       icon: Link2 },
];

const STATUS_STYLES = {
  Connected:    { chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Connected' },
  Disconnected: { chip: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400',   label: 'Disconnected' },
  Error:        { chip: 'bg-rose-100 text-rose-600 border-rose-200',          dot: 'bg-rose-500',    label: 'Error' },
};

const PROVIDER_CATALOG = {
  Telephony: ['Exotel', 'Twilio', 'Plivo', 'Knowlarity', 'Acefone'],
  WhatsApp:  ['WhatsApp Business API (Meta)', 'Twilio WhatsApp', 'Interakt'],
  SMS:       ['Twilio SMS', 'MSG91', 'Exotel SMS', 'Kaleyra', 'Textlocal'],
  Email:     ['SendGrid', 'Amazon SES', 'Mailgun', 'Postmark', 'SMTP'],
  Payment:   ['Razorpay', 'Stripe', 'PayU', 'Cashfree'],
  Website:   ['Website Lead API', 'Meta Lead Ads', 'Google Lead Ads', 'Google Ads', 'Third-party API'],
};

const CATEGORY_FEATURES = {
  Telephony: ['Inbound calls', 'Outbound calls', 'Call recording', 'Call tracking', 'IVR'],
  WhatsApp:  ['Customer engagement', 'Template messaging', 'Auto-replies'],
  SMS:       ['Automated messaging', 'Manual messaging', 'Bulk SMS'],
  Email:     ['Business email', 'CRM communication', 'Auto-responders'],
  Payment:   ['Payment collection', 'Payment links', 'Refunds'],
  Website:   ['Lead capture', 'Landing pages', 'External systems'],
};

const STORAGE_PREFIX = 'integrations:';

const DEFAULT_WEBHOOKS = [
  {
    id: 'WH-001',
    projectId: 'matrimony',
    name: 'Lead Created',
    url: 'https://crm.example.com/webhooks/lead-created',
    event: 'lead.created',
    status: 'Active',
    lastTriggered: '2 min ago',
    method: 'POST',
  },
  {
    id: 'WH-002',
    projectId: 'matrimony',
    name: 'Call Completed',
    url: 'https://crm.example.com/webhooks/call-completed',
    event: 'call.completed',
    status: 'Active',
    lastTriggered: '15 min ago',
    method: 'POST',
  },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Integrations() {
  const { activeWebsiteId, activeWebsite } = useAuth();

  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  /* ✅ Single source of truth for which KPI card is active */
  const [activeKpi, setActiveKpi] = useState('total');

  const [integrations, setIntegrations] = useState(() =>
    loadState(
      `list:${activeWebsiteId}`,
      INITIAL_INTEGRATIONS.map((i) => ({
        ...i,
        apiSecret: i.apiSecret || '',
        endpoint: i.endpoint || '',
        lastSync: i.lastSync || 'Just now',
        configured: i.status === 'Connected',
      }))
    )
  );
  const [webhooks, setWebhooks] = useState(() =>
    loadState(`webhooks:${activeWebsiteId}`, DEFAULT_WEBHOOKS)
  );

  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [configuring, setConfiguring] = useState(null);
  const [viewingIntegration, setViewingIntegration] = useState(null);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteWebhook, setConfirmDeleteWebhook] = useState(null);

  useEffect(() => {
    setIntegrations(
      loadState(
        `list:${activeWebsiteId}`,
        INITIAL_INTEGRATIONS.map((i) => ({
          ...i,
          apiSecret: i.apiSecret || '',
          endpoint: i.endpoint || '',
          lastSync: i.lastSync || 'Just now',
          configured: i.status === 'Connected',
        }))
      )
    );
    setWebhooks(loadState(`webhooks:${activeWebsiteId}`, DEFAULT_WEBHOOKS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebsiteId]);

  useEffect(() => { saveState(`list:${activeWebsiteId}`, integrations); }, [integrations, activeWebsiteId]);
  useEffect(() => { saveState(`webhooks:${activeWebsiteId}`, webhooks); }, [webhooks, activeWebsiteId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const categoryIcon = (cat) => {
    const icons = {
      Telephony: Phone,
      SMS: MessageSquare,
      WhatsApp: MessageCircle,
      Email: Mail,
      Payment: CreditCard,
      Website: Globe,
    };
    return icons[cat] || Plug;
  };

  /* ── Filtered ── */
  const filteredIntegrations = useMemo(() => {
    let rows = integrations;
    if (tab !== 'all' && tab !== 'Webhooks') {
      rows = rows.filter((i) => i.category === tab);
    }
    if (statusFilter !== 'All') {
      rows = rows.filter((i) => i.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((i) =>
        `${i.name} ${i.category} ${i.status}`.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [integrations, tab, searchQuery, statusFilter]);

  /* ── Summary ── */
  const summary = useMemo(() => {
    const total = integrations.length;
    const connected = integrations.filter((i) => i.status === 'Connected').length;
    const disconnected = integrations.filter((i) => i.status !== 'Connected').length;
    const activeWebhooks = webhooks.filter((w) => w.status === 'Active').length;
    const categories = new Set(integrations.map((i) => i.category)).size;
    return { total, connected, disconnected, activeWebhooks, categories };
  }, [integrations, webhooks]);

  /* ✅ KPI click — single handler, resets conflicting state */
  const handleKpiClick = (kpiKey) => {
    setActiveKpi(kpiKey);
    setSearchQuery('');
    setStatusOpen(false);

    switch (kpiKey) {
      case 'total':
        setTab('all');
        setStatusFilter('All');
        break;
      case 'connected':
        setTab('all');
        setStatusFilter('Connected');
        break;
      case 'disconnected':
        setTab('all');
        setStatusFilter('Disconnected');
        break;
      case 'webhooks':
        setTab('Webhooks');
        setStatusFilter('All');
        break;
      case 'categories':
        /* ✅ FIX: navigate to the first category that actually has data,
           falling back to Telephony if none do. */
        {
          const firstNonEmpty = Object.keys(PROVIDER_CATALOG).find(
            (cat) => integrations.some((i) => i.category === cat)
          );
          setTab(firstNonEmpty || 'Telephony');
          setStatusFilter('All');
        }
        break;
      default:
        break;
    }
  };

  /* ✅ Tab click — resets status filter when switching to a category tab */
  const handleTabClick = (key) => {
    setTab(key);
    setSearchQuery('');
    setStatusOpen(false);

    if (key === 'Webhooks') {
      setActiveKpi('webhooks');
      setStatusFilter('All');
    } else if (key === 'all') {
      /* ✅ FIX: reset status filter when going back to "All" so the list
         actually shows everything the "All" tab implies. */
      setStatusFilter('All');
      setActiveKpi('total');
    } else {
      setActiveKpi('categories');
      setStatusFilter('All');
    }
  };

  /* ── Actions ── */
  const handleConnect = (id) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'Connected', configured: true, lastSync: 'Just now' }
          : i
      )
    );
    setMenuOpenId(null);
    showToast('Integration connected');
  };

  const handleDisconnect = (id) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: 'Disconnected', configured: false } : i
      )
    );
    setMenuOpenId(null);
    showToast('Integration disconnected', 'error');
  };

  const handleSync = (id) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, lastSync: 'Just now' } : i
      )
    );
    setMenuOpenId(null);
    showToast('Sync completed');
  };

  const handleSaveConfig = (id, data) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, ...data, configured: true, status: 'Connected', lastSync: 'Just now' }
          : i
      )
    );
    setConfiguring(null);
    showToast('Configuration saved');
  };

  const handleAddIntegration = (data) => {
    const newInt = {
      id: uid('INT'),
      name: data.name,
      category: data.category,
      status: data.apiKey ? 'Connected' : 'Disconnected',
      apiKey: data.apiKey || '',
      apiSecret: data.apiSecret || '',
      endpoint: data.endpoint || '',
      lastSync: 'Just now',
      configured: !!data.apiKey,
    };
    setIntegrations((prev) => [newInt, ...prev]);
    setShowAddModal(false);
    showToast(`Integration "${data.name}" added`);
  };

  const handleDeleteIntegration = (id) => {
    const i = integrations.find((x) => x.id === id);
    setIntegrations((prev) => prev.filter((x) => x.id !== id));
    setConfirmDelete(null);
    setViewingIntegration(null);
    showToast(`Integration "${i?.name || ''}" removed`, 'error');
  };

  /* ── Webhook actions ── */
  const handleSaveWebhook = (data) => {
    if (editingWebhook) {
      setWebhooks((prev) =>
        prev.map((w) => (w.id === editingWebhook.id ? { ...w, ...data } : w))
      );
      showToast('Webhook updated');
    } else {
      const newW = {
        id: uid('WH'),
        projectId: activeWebsiteId,
        ...data,
        status: data.status || 'Active',
        lastTriggered: 'Never',
      };
      setWebhooks((prev) => [newW, ...prev]);
      showToast('Webhook created');
    }
    setShowWebhookModal(false);
    setEditingWebhook(null);
  };

  const handleDeleteWebhook = (id) => {
    const w = webhooks.find((x) => x.id === id);
    setWebhooks((prev) => prev.filter((x) => x.id !== id));
    setConfirmDeleteWebhook(null);
    showToast(`Webhook "${w?.name || ''}" deleted`, 'error');
  };

  const handleToggleWebhook = (id) => {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === 'Active' ? 'Inactive' : 'Active' }
          : w
      )
    );
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    showToast('Copied to clipboard');
  };

  const handleExport = () => {
    if (filteredIntegrations.length === 0) {
      showToast('No integrations to export', 'error');
      return;
    }
    const rows = [
      ['ID', 'Name', 'Category', 'Status', 'Configured', 'Last Sync'],
      ...filteredIntegrations.map((i) => [
        i.id, i.name, i.category, i.status, i.configured ? 'Yes' : 'No', i.lastSync,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integrations-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredIntegrations.length} integrations`);
  };

  const canExport = tab !== 'Webhooks';

  const counts = {
    all: summary.total,
    Telephony: integrations.filter((i) => i.category === 'Telephony').length,
    WhatsApp: integrations.filter((i) => i.category === 'WhatsApp').length,
    SMS: integrations.filter((i) => i.category === 'SMS').length,
    Email: integrations.filter((i) => i.category === 'Email').length,
    Payment: integrations.filter((i) => i.category === 'Payment').length,
    Website: integrations.filter((i) => i.category === 'Website').length,
    Webhooks: webhooks.length,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Integrations</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Plug size={13} className="text-brand-magenta" />
              Connect your existing business tools for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canExport && (
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:shadow-md"
              >
                <Download size={14} /> Export
              </button>
            )}
            {tab === 'Webhooks' ? (
              <button
                onClick={() => { setEditingWebhook(null); setShowWebhookModal(true); }}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <Plus size={14} className="transition-transform group-hover:rotate-90" />
                Add Webhook
              </button>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <Plus size={14} className="transition-transform group-hover:rotate-90" />
                Add Integration
              </button>
            )}
          </div>
        </div>

        {/* ═══ KPI STRIP — 5 PER ROW ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Overview</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <KpiCard
              icon={Plug}
              label="Total"
              value={summary.total}
              sub="Registered services"
              color="purple"
              active={activeKpi === 'total'}
              onClick={() => handleKpiClick('total')}
              delay={0}
            />
            <KpiCard
              icon={Wifi}
              label="Connected"
              value={summary.connected}
              sub="Active and working"
              color="emerald"
              active={activeKpi === 'connected'}
              onClick={() => handleKpiClick('connected')}
              delay={40}
            />
            <KpiCard
              icon={WifiOff}
              label="Disconnected"
              value={summary.disconnected}
              sub="Require config"
              color="rose"
              active={activeKpi === 'disconnected'}
              onClick={() => handleKpiClick('disconnected')}
              delay={80}
            />
            <KpiCard
              icon={Link2}
              label="Webhooks"
              value={summary.activeWebhooks}
              sub="Live listeners"
              color="amber"
              active={activeKpi === 'webhooks'}
              onClick={() => handleKpiClick('webhooks')}
              delay={120}
            />
            <KpiCard
              icon={Layers}
              label="Categories"
              value={summary.categories}
              sub="Service types"
              color="cyan"
              active={activeKpi === 'categories'}
              onClick={() => handleKpiClick('categories')}
              delay={160}
            />
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'}`}>
                    {counts[key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ FILTER BAR ═══ */}
        {tab !== 'Webhooks' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, category, or status..."
                className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac">
                  <X size={14} className="text-brand-ink/50" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setStatusOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
              >
                <Filter size={14} className="text-brand-magenta" />
                Status: <span className="font-semibold text-brand-magenta">{statusFilter}</span>
              </button>
              {statusOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                    {['All', 'Connected', 'Disconnected'].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setStatusFilter(s);
                          setStatusOpen(false);
                          /* Sync activeKpi when user picks from dropdown */
                          if (s === 'Connected') setActiveKpi('connected');
                          else if (s === 'Disconnected') setActiveKpi('disconnected');
                          else if (tab === 'Webhooks') setActiveKpi('webhooks');
                          else if (tab === 'all') setActiveKpi('total');
                          else setActiveKpi('categories');
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          statusFilter === s
                            ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                            : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-full p-1.5 ${viewMode === 'grid' ? 'bg-brand-magenta/10 text-brand-magenta' : 'text-brand-ink/50 hover:bg-brand-lilac/30'}`}
              ><Grid3x3 size={14} /></button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-full p-1.5 ${viewMode === 'list' ? 'bg-brand-magenta/10 text-brand-magenta' : 'text-brand-ink/50 hover:bg-brand-lilac/30'}`}
              ><List size={14} /></button>
            </div>
          </div>
        )}

        {/* ═══ CAPABILITY STRIP ═══ */}
        {tab !== 'all' && tab !== 'Webhooks' && CATEGORY_FEATURES[tab] && (
          <CapabilityStrip
            category={tab}
            features={CATEGORY_FEATURES[tab]}
            icon={categoryIcon(tab)}
          />
        )}

        {/* ═══ TAB CONTENT ═══ */}
        {tab === 'Webhooks' ? (
          <WebhooksTab
            webhooks={webhooks}
            onAdd={() => { setEditingWebhook(null); setShowWebhookModal(true); }}
            onEdit={(w) => { setEditingWebhook(w); setShowWebhookModal(true); }}
            onToggle={handleToggleWebhook}
            onDelete={(w) => setConfirmDeleteWebhook(w)}
            onCopy={handleCopy}
            copiedId={copiedId}
          />
        ) : filteredIntegrations.length === 0 ? (
          <EmptyState
            onAdd={() => setShowAddModal(true)}
            hasFilters={!!searchQuery || statusFilter !== 'All'}
            onClear={() => {
              /* ✅ FIX: also reset tab so empty state is fully cleared */
              setSearchQuery('');
              setStatusFilter('All');
              setTab('all');
              setActiveKpi('total');
            }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredIntegrations.map((i) => (
              <IntegrationCard
                key={i.id}
                integration={i}
                categoryIcon={categoryIcon}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onView={() => setViewingIntegration(i)}
                onConfigure={() => { setConfiguring(i); setMenuOpenId(null); }}
                onConnect={() => handleConnect(i.id)}
                onDisconnect={() => handleDisconnect(i.id)}
                onSync={() => handleSync(i.id)}
                onDelete={() => { setConfirmDelete(i); setMenuOpenId(null); }}
                onCopy={handleCopy}
                copiedId={copiedId}
              />
            ))}
          </div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <ul className="divide-y divide-brand-lilac/40">
              {filteredIntegrations.map((i) => (
                <IntegrationRow
                  key={i.id}
                  integration={i}
                  categoryIcon={categoryIcon}
                  menuOpenId={menuOpenId}
                  setMenuOpenId={setMenuOpenId}
                  onView={() => setViewingIntegration(i)}
                  onConfigure={() => { setConfiguring(i); setMenuOpenId(null); }}
                  onConnect={() => handleConnect(i.id)}
                  onDisconnect={() => handleDisconnect(i.id)}
                  onSync={() => handleSync(i.id)}
                  onDelete={() => { setConfirmDelete(i); setMenuOpenId(null); }}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))}
            </ul>
          </div>
        )}

        {/* ═══ MODALS / DRAWERS ═══ */}
        {showAddModal && (
          <AddIntegrationModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddIntegration}
          />
        )}

        {configuring && (
          <ConfigureModal
            integration={configuring}
            onClose={() => setConfiguring(null)}
            onSave={(data) => handleSaveConfig(configuring.id, data)}
          />
        )}

        {viewingIntegration && (
          <IntegrationDetailDrawer
            integration={viewingIntegration}
            webhooks={webhooks}
            onClose={() => setViewingIntegration(null)}
            onEdit={() => { setConfiguring(viewingIntegration); setViewingIntegration(null); }}
            onDelete={() => { setConfirmDelete(viewingIntegration); setViewingIntegration(null); }}
            onConnect={() => { handleConnect(viewingIntegration.id); setViewingIntegration(null); }}
            onDisconnect={() => { handleDisconnect(viewingIntegration.id); setViewingIntegration(null); }}
            onSync={() => { handleSync(viewingIntegration.id); }}
            onCopy={handleCopy}
            copiedId={copiedId}
          />
        )}

        {showWebhookModal && (
          <WebhookModal
            mode={editingWebhook ? 'edit' : 'create'}
            initial={editingWebhook || {}}
            onClose={() => { setShowWebhookModal(false); setEditingWebhook(null); }}
            onSubmit={handleSaveWebhook}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title="Remove integration?"
            message={`This will permanently remove "${confirmDelete.name}". Connected services will be disconnected.`}
            confirmLabel="Remove Integration"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDeleteIntegration(confirmDelete.id)}
          />
        )}

        {confirmDeleteWebhook && (
          <ConfirmDialog
            title="Delete webhook?"
            message={`This will permanently delete "${confirmDeleteWebhook.name}". All events will stop being delivered.`}
            confirmLabel="Delete Webhook"
            onCancel={() => setConfirmDeleteWebhook(null)}
            onConfirm={() => handleDeleteWebhook(confirmDeleteWebhook.id)}
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
    cyan:    { border: 'border-cyan-200 hover:border-cyan-400', bg: 'from-cyan-50 via-cyan-50/30 to-white', iconBg: 'bg-cyan-100 text-cyan-600 border-cyan-200', bar: 'from-cyan-500 to-blue-400', glow: 'bg-cyan-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(6,182,212,0.4)]', valueColor: 'text-cyan-600', ring: 'ring-cyan-300' },
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
   CAPABILITY STRIP
   ═══════════════════════════════════════════════════════════════ */
function CapabilityStrip({ category, features, icon: Icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-r from-brand-mist/70 via-white to-brand-mist/40 p-4">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-magenta opacity-70" />
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
            <Icon size={18} />
          </span>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Supported Capabilities</p>
            <p className="font-display text-sm font-bold text-brand-ink">{category} Integration</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {features.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink/75 shadow-sm"
            >
              <CheckCircle2 size={11} className="text-emerald-500" />
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTEGRATION CARD (GRID)
   ═══════════════════════════════════════════════════════════════ */
function IntegrationCard({
  integration, categoryIcon, menuOpenId, setMenuOpenId,
  onView, onConfigure, onConnect, onDisconnect, onSync, onDelete,
  onCopy, copiedId,
}) {
  const Icon = categoryIcon(integration.category);
  const isConnected = integration.status === 'Connected';
  const style = STATUS_STYLES[integration.status] || STATUS_STYLES.Disconnected;

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-[0_1px_3px_rgba(139,47,214,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.35)] ${
      isConnected ? 'border-emerald-200 hover:border-emerald-400' : 'border-brand-lilac hover:border-brand-magenta/40'
    }`}>
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${
        isConnected ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-brand-magenta to-brand-purple'
      }`} />
      <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-magenta/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start gap-3">
        <button
          onClick={onView}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-110 ${
            isConnected
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
          }`}
          title="View details"
        >
          <Icon size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <button onClick={onView} className="block truncate text-left font-semibold text-brand-ink hover:text-brand-magenta">
            {integration.name}
          </button>
          <p className="truncate text-xs text-brand-ink/50">{integration.category}</p>
        </div>

        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${style.chip}`}>
          <span className="inline-flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {integration.status}
          </span>
        </span>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpenId(menuOpenId === integration.id ? null : integration.id)}
            className="rounded-lg p-1.5 text-brand-ink/40 hover:bg-brand-lilac"
            title="More actions"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === integration.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={Settings} label="Configure" onClick={onConfigure} />
                {isConnected ? (
                  <MenuItem icon={XCircle} label="Disconnect" danger onClick={onDisconnect} />
                ) : (
                  <MenuItem icon={CheckCircle2} label="Connect" onClick={onConnect} />
                )}
                <MenuItem icon={RefreshCw} label="Sync Now" onClick={onSync} />
                <MenuItem icon={Copy} label="Copy API Key" onClick={() => onCopy(integration.id, integration.apiKey)} />
                <div className="my-1 h-px bg-brand-lilac/60" />
                <MenuItem icon={Trash2} label="Remove" danger onClick={onDelete} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative mt-3 space-y-1.5 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
        <div className="flex items-center justify-between gap-2 whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-brand-ink/50">
            <Key size={11} /> API Key
          </span>
          <span className="truncate font-mono font-medium text-brand-ink">
            {integration.apiKey ? `${integration.apiKey.slice(0, 12)}...` : 'Not set'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-brand-ink/50">
            <Clock size={11} /> Last Sync
          </span>
          <span className="truncate font-medium text-brand-ink">{integration.lastSync}</span>
        </div>
      </div>

      <div className="relative mt-3 flex gap-1.5">
        <button
          onClick={onConfigure}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-violet-50 hover:text-brand-purple"
        >
          <Settings size={12} /> Configure
        </button>
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-500 transition-all hover:border-rose-400 hover:bg-rose-100"
          >
            <XCircle size={12} /> Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <CheckCircle2 size={12} /> Connect
          </button>
        )}
        <button
          onClick={() => onCopy(integration.id, integration.apiKey)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="Copy API Key"
        >
          {copiedId === integration.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 transition-all hover:border-rose-400 hover:bg-rose-100"
          title="Remove integration"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTEGRATION ROW (LIST)
   ═══════════════════════════════════════════════════════════════ */
function IntegrationRow({
  integration, categoryIcon, menuOpenId, setMenuOpenId,
  onView, onConfigure, onConnect, onDisconnect, onSync, onDelete,
  onCopy, copiedId,
}) {
  const Icon = categoryIcon(integration.category);
  const isConnected = integration.status === 'Connected';
  const style = STATUS_STYLES[integration.status] || STATUS_STYLES.Disconnected;

  return (
    <li className="group flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
      <button
        onClick={onView}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-110 ${
          isConnected
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
        }`}
        title="View details"
      >
        <Icon size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <button onClick={onView} className="block truncate text-left text-sm font-semibold text-brand-ink hover:text-brand-magenta">
          {integration.name}
        </button>
        <p className="truncate text-[11px] text-brand-ink/50">{integration.category}</p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="text-brand-ink/40">API Key</p>
        <p className="truncate font-mono text-[11px] font-semibold text-brand-ink">
          {integration.apiKey ? `${integration.apiKey.slice(0, 10)}...` : 'Not set'}
        </p>
      </div>
      <div className="hidden shrink-0 text-xs md:block">
        <p className="text-brand-ink/40">Last Sync</p>
        <p className="font-semibold text-brand-ink">{integration.lastSync}</p>
      </div>

      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${style.chip}`}>
        <span className="inline-flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {integration.status}
        </span>
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onConfigure}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-violet-50 hover:text-brand-purple"
        >
          <Settings size={12} /> Configure
        </button>
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-500 transition-all hover:bg-rose-100"
          >
            <XCircle size={12} /> Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
          >
            <CheckCircle2 size={12} /> Connect
          </button>
        )}
        {/* ✅ Copy button now available in list view too */}
        <button
          onClick={() => onCopy(integration.id, integration.apiKey)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/50 hover:bg-brand-lilac hover:text-brand-magenta"
          title="Copy API Key"
        >
          {copiedId === integration.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpenId(menuOpenId === integration.id ? null : integration.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 hover:bg-brand-lilac"
            title="More actions"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === integration.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={Settings} label="Configure" onClick={onConfigure} />
                <MenuItem icon={RefreshCw} label="Sync Now" onClick={onSync} />
                <div className="my-1 h-px bg-brand-lilac/60" />
                <MenuItem icon={Trash2} label="Remove" danger onClick={onDelete} />
              </div>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTEGRATION DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════ */
function IntegrationDetailDrawer({
  integration, webhooks, onClose, onEdit, onDelete, onConnect, onDisconnect, onSync, onCopy, copiedId,
}) {
  const Icon = {
    Telephony: Phone,
    SMS: MessageSquare,
    WhatsApp: MessageCircle,
    Email: Mail,
    Payment: CreditCard,
    Website: Globe,
  }[integration.category] || Plug;

  const isConnected = integration.status === 'Connected';
  const style = STATUS_STYLES[integration.status] || STATUS_STYLES.Disconnected;
  const features = CATEGORY_FEATURES[integration.category] || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${
              isConnected
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
            }`}>
              <Icon size={16} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Integration Details</p>
              <h2 className="font-display text-base font-bold text-brand-ink">{integration.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/40 to-white p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-magenta/10 blur-3xl" />

            <div className="relative flex flex-wrap items-start gap-4">
              <span className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                isConnected
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
              }`}>
                <Icon size={32} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-bold text-brand-ink">{integration.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${style.chip}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {integration.status}
                  </span>
                  <span className="rounded-full bg-brand-lilac/70 px-2.5 py-1 text-[11px] font-bold text-brand-purple">
                    {integration.category}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-brand-ink/70">
                    <Hash size={14} className="shrink-0 text-brand-magenta" />
                    <span className="truncate font-mono text-xs">{integration.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-ink/70">
                    <Clock size={14} className="shrink-0 text-brand-magenta" />
                    <span className="font-medium">Synced {integration.lastSync}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-5 flex flex-wrap gap-2">
              <button
                onClick={onSync}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
              >
                <RefreshCw size={13} /> Sync Now
              </button>
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-brand-purple hover:bg-violet-100"
              >
                <Pencil size={13} /> Configure
              </button>
              {isConnected ? (
                <button
                  onClick={onDisconnect}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
                >
                  <XCircle size={13} /> Disconnect
                </button>
              ) : (
                <button
                  onClick={onConnect}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
                >
                  <CheckCircle2 size={13} /> Connect
                </button>
              )}
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>

          {features.length > 0 && (
            <div className="card !p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-brand-magenta">
                  <Zap size={14} />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-brand-ink">Supported Capabilities</h3>
                  <p className="text-[10px] text-brand-ink/50">Features enabled by this {integration.category} integration</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink/75 shadow-sm"
                  >
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="card !p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
                <Key size={14} />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-brand-ink">Credentials</h3>
                <p className="text-[10px] text-brand-ink/50">API keys and endpoint configuration</p>
              </div>
            </div>

            <div className="space-y-3">
              <CredentialField
                label="API Key"
                value={integration.apiKey || 'Not set'}
                onCopy={() => onCopy(integration.id, integration.apiKey)}
                copied={copiedId === integration.id}
                mono
              />
              <CredentialField
                label="API Secret"
                value={integration.apiSecret ? '••••••••••••' : 'Not set'}
                mono
              />
              <CredentialField
                label="Endpoint URL"
                value={integration.endpoint || 'Not configured'}
                onCopy={() => onCopy(`${integration.id}-ep`, integration.endpoint)}
                copied={copiedId === `${integration.id}-ep`}
                mono
              />
            </div>
          </div>

          {integration.category === 'Website' && (
            <div className="card !p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                  <Link2 size={14} />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-brand-ink">Related Webhooks</h3>
                  <p className="text-[10px] text-brand-ink/50">{webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured</p>
                </div>
              </div>
              {webhooks.length === 0 ? (
                <p className="rounded-lg bg-brand-mist/40 px-3 py-2 text-xs text-brand-ink/50">
                  No webhooks configured yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {webhooks.slice(0, 3).map((w) => (
                    <li key={w.id} className="flex items-center gap-2 rounded-lg border border-brand-lilac bg-white px-3 py-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${
                        w.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Webhook size={11} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-brand-ink">{w.name}</span>
                      <span className="shrink-0 rounded-full bg-brand-lilac px-2 py-0.5 text-[9px] font-bold text-brand-purple">{w.method}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Summary</p>
            <p className="mt-1.5 text-sm text-brand-ink/80">
              <strong>{integration.name}</strong> is a <strong>{integration.category}</strong> integration that is currently{' '}
              <strong>{integration.status.toLowerCase()}</strong>. It powers {features.length} capabilities and was last synced{' '}
              <strong>{integration.lastSync}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CredentialField({ label, value, mono, onCopy, copied }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{label}</p>
      <div className="flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3 py-2">
        <span className={`min-w-0 flex-1 truncate text-xs font-medium text-brand-ink ${mono ? 'font-mono' : ''}`}>{value}</span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-brand-ink/50 hover:bg-brand-lilac"
            title="Copy"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WEBHOOKS TAB
   ═══════════════════════════════════════════════════════════════ */
function WebhooksTab({ webhooks, onAdd, onEdit, onToggle, onDelete, onCopy, copiedId }) {
  return (
    <div className="space-y-4">
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-brand-magenta">
              <Link2 size={16} />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-brand-ink">Webhooks</h3>
              <p className="text-[11px] text-brand-ink/50">{webhooks.length} configured</p>
            </div>
          </div>
        </div>

        {webhooks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
              <Link2 size={22} />
            </span>
            <p className="font-display text-base font-semibold text-brand-ink">No webhooks yet</p>
            <p className="max-w-sm text-sm text-brand-ink/50">Send CRM events to other business systems.</p>
            <button
              onClick={onAdd}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card"
            >
              <Plus size={16} /> Add Webhook
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-brand-lilac/40">
            {webhooks.map((w) => (
              <li key={w.id} className="group flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                  w.status === 'Active'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                }`}>
                  <Webhook size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">{w.name}</p>
                  <p className="truncate font-mono text-[11px] text-brand-ink/50">{w.event} → {w.url}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-lilac px-2.5 py-1 text-[10px] font-bold text-brand-purple">
                  {w.method}
                </span>
                <button
                  onClick={() => onToggle(w.id)}
                  className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                    w.status === 'Active'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  {w.status === 'Active' ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {w.status}
                </button>
                <span className="hidden shrink-0 text-[10px] text-brand-ink/40 md:block">{w.lastTriggered}</span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => onCopy(w.id, w.url)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
                  >
                    {copiedId === w.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copy
                  </button>
                  <button
                    onClick={() => onEdit(w)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-brand-purple transition-all hover:bg-violet-100"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(w)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-500 transition-all hover:bg-rose-100"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MENU ITEM
   ═══════════════════════════════════════════════════════════════ */
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
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════ */
function EmptyState({ onAdd, hasFilters, onClear }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Plug size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No integrations match your filters' : 'No integrations yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button onClick={onClear} className="font-semibold text-brand-magenta hover:underline">
            Clear all filters
          </button>
        ) : (
          'Connect your first business tool to get started.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onAdd}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card"
        >
          <Plus size={16} /> Add First Integration
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL SHELL
   ═══════════════════════════════════════════════════════════════ */
function ModalShell({ title, subtitle, children, onClose, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className={`w-full ${maxWidth} overflow-hidden rounded-2xl bg-white shadow-panel`}>
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div>
            <h3 className="font-display text-base font-bold text-brand-ink">{title}</h3>
            {subtitle && <p className="text-[11px] text-brand-ink/50">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADD INTEGRATION MODAL
   ═══════════════════════════════════════════════════════════════ */
function AddIntegrationModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    category: 'Telephony',
    apiKey: '',
    apiSecret: '',
    endpoint: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const CATEGORIES = Object.keys(PROVIDER_CATALOG);

  const validate = () => {
    if (!form.name.trim()) return 'Integration name is required.';
    if (form.apiKey && form.apiKey.length < 6) return 'API Key must be at least 6 characters.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit(form);
    }, 400);
  };

  return (
    <ModalShell
      title="Add Integration"
      subtitle="Register a new external service"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value, name: PROVIDER_CATALOG[e.target.value]?.[0] || '' })}
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Provider</label>
          <input
            list="provider-list"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Twilio SMS"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <datalist id="provider-list">
            {(PROVIDER_CATALOG[form.category] || []).map((p) => <option key={p} value={p} />)}
          </datalist>
        </div>

        {CATEGORY_FEATURES[form.category] && (
          <div className="rounded-xl border border-brand-lilac/70 bg-brand-mist/40 p-3">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-brand-magenta">
              <Zap size={10} /> Capabilities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_FEATURES[form.category].map((f) => (
                <span key={f} className="rounded-full border border-brand-lilac bg-white px-2 py-0.5 text-[10px] font-medium text-brand-ink/70">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">API Key</label>
            <input
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="demo_xxxxxxxx"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">API Secret</label>
            <input
              type="password"
              value={form.apiSecret}
              onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
              placeholder="••••••••••"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Endpoint URL (optional)</label>
          <input
            value={form.endpoint}
            onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
            placeholder="https://api.example.com"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
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
                Adding…
              </span>
            ) : 'Add Integration'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONFIGURE MODAL
   ═══════════════════════════════════════════════════════════════ */
function ConfigureModal({ integration, onClose, onSave }) {
  const [form, setForm] = useState({
    apiKey: integration.apiKey || '',
    apiSecret: integration.apiSecret || '',
    endpoint: integration.endpoint || '',
  });
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.apiKey.trim()) return 'API Key is required.';
    if (form.endpoint && !/^https?:\/\//.test(form.endpoint)) return 'Endpoint must start with http:// or https://';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSave(form);
    }, 400);
  };

  return (
    <ModalShell
      title={`Configure ${integration.name}`}
      subtitle={integration.category}
      onClose={onClose}
    >
      {CATEGORY_FEATURES[integration.category] && (
        <div className="mb-4 rounded-xl border border-brand-lilac/70 bg-brand-mist/40 p-3">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-brand-magenta">
            <Zap size={10} /> Supported Features
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_FEATURES[integration.category].map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full border border-brand-lilac bg-white px-2 py-0.5 text-[10px] font-medium text-brand-ink/70">
                <CheckCircle2 size={9} className="text-emerald-500" />
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Key size={11} /> API Key
          </label>
          <input
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            placeholder="demo_xxxxxxxx"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Lock size={11} /> API Secret
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={form.apiSecret}
              onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
              placeholder="••••••••••"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 pr-10 font-mono text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
            <button
              type="button"
              onClick={() => setShowSecret((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/40 hover:text-brand-magenta"
            >
              {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Globe size={11} /> Endpoint URL
          </label>
          <input
            value={form.endpoint}
            onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
            placeholder="https://api.example.com"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
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
                Saving…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Save size={14} /> Save &amp; Connect
              </span>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WEBHOOK MODAL
   ═══════════════════════════════════════════════════════════════ */
function WebhookModal({ mode = 'create', initial = {}, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    name: initial.name || '',
    event: initial.event || 'lead.created',
    url: initial.url || '',
    method: initial.method || 'POST',
    status: initial.status || 'Active',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Webhook name is required.';
    if (!form.url.trim()) return 'URL is required.';
    if (!/^https?:\/\//.test(form.url)) return 'URL must start with http:// or https://';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit(form);
    }, 400);
  };

  return (
    <ModalShell
      title={isEdit ? 'Edit Webhook' : 'New Webhook'}
      subtitle={isEdit ? 'Update webhook details' : 'Register a new event listener'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Webhook Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Lead Created"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Event</label>
          <select
            value={form.event}
            onChange={(e) => setForm({ ...form, event: e.target.value })}
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          >
            <option value="lead.created">lead.created</option>
            <option value="lead.updated">lead.updated</option>
            <option value="call.completed">call.completed</option>
            <option value="campaign.completed">campaign.completed</option>
            <option value="customer.created">customer.created</option>
            <option value="payment.received">payment.received</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">URL</label>
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://crm.example.com/webhooks"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Method</label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
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
                Saving…
              </span>
            ) : isEdit ? 'Save Changes' : 'Create Webhook'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONFIRM DIALOG
   ═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════ */
function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
        type === 'error'
          ? 'border-rose-200 bg-rose-50 text-rose-600'
          : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}