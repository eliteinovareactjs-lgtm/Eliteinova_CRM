// src/pages/superadmin/Integrations.jsx
import { useMemo, useState } from 'react';
import {
  Plug, CheckCircle2, XCircle, Plus, Key, X, Search, ChevronDown,
  MoreVertical, Eye, EyeOff, Copy, Check, Trash2, Pencil, Save, AlertCircle,
  Settings, Wifi, WifiOff, DollarSign, MessageSquare, MessageCircle, Mail,
  Phone, Globe, Server, Link2, Lock, RefreshCw, ExternalLink,
  Info, Activity, Clock, Zap, Download, Layers, ListFilter, Building2,
  Hash, PlayCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INTEGRATIONS as INITIAL_INTEGRATIONS } from '../../data/mockData';

/* ============================================================
   NOTE: All keys below are MOCK / DEMO values, not real secrets.
   They intentionally do not match any real-world API key format.
   ============================================================ */
const MOCK_KEY_PREFIX = 'demo_';

const CATEGORY_TABS = [
  { key: 'all', label: 'All', icon: Plug },
  { key: 'Telephony', label: 'Telephony', icon: Phone },
  { key: 'SMS', label: 'SMS Gateway', icon: MessageSquare },
  { key: 'WhatsApp', label: 'WhatsApp API', icon: MessageCircle },
  { key: 'Email', label: 'Email / SMTP', icon: Mail },
  { key: 'Payment', label: 'Payment Gateway', icon: DollarSign },
  { key: 'Website', label: 'Website API', icon: Globe },
  { key: 'CRM', label: 'CRM API', icon: Server },
  { key: 'Webhooks', label: 'Webhooks', icon: Link2 },
  { key: 'ApiKeys', label: 'API Keys', icon: Key },
];

const DEFAULT_WEBHOOKS = [
  { id: 'WH-001', name: 'Lead Created', url: 'https://crm.example.com/webhooks/lead-created', event: 'lead.created', status: 'Active', lastTriggered: '2 min ago', method: 'POST' },
  { id: 'WH-002', name: 'Call Completed', url: 'https://crm.example.com/webhooks/call-completed', event: 'call.completed', status: 'Active', lastTriggered: '15 min ago', method: 'POST' },
  { id: 'WH-003', name: 'Campaign Finished', url: 'https://crm.example.com/webhooks/campaign-done', event: 'campaign.completed', status: 'Inactive', lastTriggered: '3 days ago', method: 'POST' },
];

const DEFAULT_API_KEYS = [
  { id: 'AK-001', name: 'Production Key', key: `${MOCK_KEY_PREFIX}prod_xxxxxxxxxxxxxxxxxxxx`, scope: 'Full Access', status: 'Active', created: '2026-01-15', lastUsed: '2 min ago' },
  { id: 'AK-002', name: 'Staging Key', key: `${MOCK_KEY_PREFIX}stage_yyyyyyyyyyyyyyyyyyy`, scope: 'Read Only', status: 'Active', created: '2026-03-10', lastUsed: '1 hour ago' },
  { id: 'AK-003', name: 'Mobile App Key', key: `${MOCK_KEY_PREFIX}mobile_zzzzzzzzzzzzzzzzzz`, scope: 'Limited', status: 'Revoked', created: '2025-11-02', lastUsed: '30 days ago' },
];

export default function Integrations() {
  const { role } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  /* ========== LOCAL DATA ========== */
  const [integrations, setIntegrations] = useState(
    INITIAL_INTEGRATIONS.map((i) => ({
      ...i,
      apiSecret: i.apiSecret || '',
      endpoint: i.endpoint || '',
      webhookUrl: i.webhookUrl || '',
      lastSync: i.lastSync || 'Just now',
      configured: i.status === 'Connected',
    }))
  );
  const [webhooks, setWebhooks] = useState(DEFAULT_WEBHOOKS);
  const [apiKeys, setApiKeys] = useState(DEFAULT_API_KEYS);

  /* ========== FILTERS ========== */
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* ========== UI STATE ========== */
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [revealedKey, setRevealedKey] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  /* ========== MODALS ========== */
  const [showAddModal, setShowAddModal] = useState(false);
  const [configuring, setConfiguring] = useState(null);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  /* ========== HELPERS ========== */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const categoryIcon = (cat) => {
    const icons = {
      Telephony: Phone,
      SMS: MessageSquare,
      WhatsApp: MessageCircle,
      Email: Mail,
      Payment: DollarSign,
      Website: Globe,
      CRM: Server,
      Webhooks: Link2,
      ApiKeys: Key,
    };
    return icons[cat] || Plug;
  };

  /* ========== FILTERED ========== */
  const filteredIntegrations = useMemo(() => {
    let rows = integrations;

    if (tab !== 'all' && tab !== 'Webhooks' && tab !== 'ApiKeys') {
      rows = rows.filter((i) => i.category === tab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((i) => {
        const hay = `${i.name} ${i.category} ${i.status}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return rows;
  }, [integrations, tab, searchQuery]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = integrations.length;
    const connected = integrations.filter((i) => i.status === 'Connected').length;
    const disconnected = integrations.filter((i) => i.status !== 'Connected').length;
    const activeWebhooks = webhooks.filter((w) => w.status === 'Active').length;
    const activeKeys = apiKeys.filter((k) => k.status === 'Active').length;
    return { total, connected, disconnected, activeWebhooks, activeKeys };
  }, [integrations, webhooks, apiKeys]);

  /* ========== ACTIONS ========== */
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

  const handleSaveConfig = (id, data) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              ...data,
              configured: true,
              status: 'Connected',
              lastSync: 'Just now',
            }
          : i
      )
    );
    setConfiguring(null);
    showToast('Configuration saved');
  };

  const handleAddIntegration = (data) => {
    const newInt = {
      id: 'INT-' + String(Date.now()).slice(-4),
      name: data.name,
      category: data.category,
      status: data.apiKey ? 'Connected' : 'Disconnected',
      apiKey: data.apiKey || '',
      apiSecret: data.apiSecret || '',
      endpoint: data.endpoint || '',
      webhookUrl: data.webhookUrl || '',
      lastSync: 'Just now',
      configured: !!data.apiKey,
    };
    setIntegrations((prev) => [newInt, ...prev]);
    setShowAddModal(false);
    showToast(`Integration "${data.name}" added`);
  };

  const handleDeleteIntegration = (id) => {
    setIntegrations((prev) => prev.filter((i) => i.id !== id));
    setConfirmDelete(null);
    showToast('Integration removed', 'error');
  };

  const handleSaveWebhook = (data) => {
    if (editingWebhook) {
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === editingWebhook.id ? { ...w, ...data } : w
        )
      );
      showToast('Webhook updated');
    } else {
      const newW = {
        id: 'WH-' + String(Date.now()).slice(-4),
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
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    showToast('Webhook deleted', 'error');
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

  const handleAddApiKey = (data) => {
    const newK = {
      id: 'AK-' + String(Date.now()).slice(-4),
      name: data.name,
      key:
        MOCK_KEY_PREFIX +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
      scope: data.scope,
      status: 'Active',
      created: new Date().toISOString().slice(0, 10),
      lastUsed: 'Never',
    };
    setApiKeys((prev) => [newK, ...prev]);
    setShowApiKeyModal(false);
    showToast('API key generated');
  };

  const handleRevokeKey = (id) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'Revoked' } : k))
    );
    showToast('API key revoked', 'error');
  };

  const handleDeleteKey = (id) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    showToast('API key deleted', 'error');
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = () => {
    const rows = [
      ['ID', 'Name', 'Category', 'Status', 'Configured', 'Last Sync'],
      ...integrations.map((i) => [
        i.id,
        i.name,
        i.category,
        i.status,
        i.configured ? 'Yes' : 'No',
        i.lastSync,
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
    showToast(`Exported ${integrations.length} integrations`);
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Integrations
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Plug size={13} className="text-brand-purple" />
            Manage external services, webhooks, and API keys.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus
              size={14}
              className="transition-transform group-hover:rotate-90 duration-300"
            />
            Add Integration
          </button>
        </div>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total Integrations"
          value={summary.total}
          sub="Registered services"
          icon={Plug}
          color="purple"
        />
        <AnimatedStatCard
          label="Connected"
          value={summary.connected}
          sub="Active and working"
          icon={Wifi}
          color="emerald"
        />
        <AnimatedStatCard
          label="Active Webhooks"
          value={summary.activeWebhooks}
          sub="Live event listeners"
          icon={Link2}
          color="amber"
        />
        <AnimatedStatCard
          label="Active API Keys"
          value={summary.activeKeys}
          sub="Ready to use"
          icon={Key}
          color="rose"
        />
      </div>

      {/* ================= CATEGORY TABS ================= */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3">
        {CATEGORY_TABS.map(({ key, label, icon: Icon }) => {
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

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-48 rounded-xl border border-brand-lilac bg-white py-2 pl-9 pr-8 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-brand-lilac"
              >
                <X size={12} className="text-brand-ink/50" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {tab === 'Webhooks' ? (
        <WebhooksTab
          webhooks={webhooks}
          onAdd={() => {
            setEditingWebhook(null);
            setShowWebhookModal(true);
          }}
          onEdit={(w) => {
            setEditingWebhook(w);
            setShowWebhookModal(true);
          }}
          onToggle={handleToggleWebhook}
          onDelete={handleDeleteWebhook}
          onCopy={handleCopy}
          copiedId={copiedId}
        />
      ) : tab === 'ApiKeys' ? (
        <ApiKeysTab
          apiKeys={apiKeys}
          onAdd={() => setShowApiKeyModal(true)}
          onRevoke={handleRevokeKey}
          onDelete={handleDeleteKey}
          onCopy={handleCopy}
          copiedId={copiedId}
          revealedKey={revealedKey}
          setRevealedKey={setRevealedKey}
        />
      ) : (
        <IntegrationsGrid
          integrations={filteredIntegrations}
          categoryIcon={categoryIcon}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onConfigure={setConfiguring}
          onDelete={(i) => setConfirmDelete(i)}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          onCopy={handleCopy}
          copiedId={copiedId}
          searchQuery={searchQuery}
        />
      )}

      {/* ================= MODALS ================= */}
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

      {showWebhookModal && (
        <WebhookModal
          mode={editingWebhook ? 'edit' : 'create'}
          initial={editingWebhook || {}}
          onClose={() => {
            setShowWebhookModal(false);
            setEditingWebhook(null);
          }}
          onSubmit={handleSaveWebhook}
        />
      )}

      {showApiKeyModal && (
        <ApiKeyModal
          onClose={() => setShowApiKeyModal(false)}
          onSubmit={handleAddApiKey}
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

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= INTEGRATIONS GRID ================= */
function IntegrationsGrid({
  integrations,
  categoryIcon,
  onConnect,
  onDisconnect,
  onConfigure,
  onDelete,
  menuOpenId,
  setMenuOpenId,
  onCopy,
  copiedId,
  searchQuery,
}) {
  if (integrations.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
          <Plug size={22} />
        </div>
        <p className="font-display text-base font-semibold text-brand-ink">
          {searchQuery ? 'No integrations match' : 'No integrations yet'}
        </p>
        <p className="max-w-sm text-sm text-brand-ink/50">
          {searchQuery
            ? 'Try a different search term.'
            : 'Add your first integration to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {integrations.map((i) => {
        const Icon = categoryIcon(i.category);
        const isConnected = i.status === 'Connected';
        return (
          <div
            key={i.id}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)] ${
              isConnected
                ? 'border-emerald-200 hover:border-emerald-300'
                : 'border-brand-lilac/80 hover:border-brand-purple/50'
            }`}
          >
            <span
              className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${
                isConnected
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
              }`}
            />

            <div className="flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                  isConnected
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
                }`}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-brand-ink">
                  {i.name}
                </p>
                <p className="truncate text-xs text-brand-ink/50">
                  {i.category}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i.status.toUpperCase()}
              </span>
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId(menuOpenId === i.id ? null : i.id)
                  }
                  className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-lilac"
                >
                  <MoreVertical size={14} />
                </button>
                {menuOpenId === i.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpenId(null)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                      <MenuItem
                        icon={Settings}
                        label="Configure"
                        onClick={() => {
                          onConfigure(i);
                          setMenuOpenId(null);
                        }}
                      />
                      {isConnected ? (
                        <MenuItem
                          icon={XCircle}
                          label="Disconnect"
                          danger
                          onClick={() => {
                            onDisconnect(i.id);
                            setMenuOpenId(null);
                          }}
                        />
                      ) : (
                        <MenuItem
                          icon={CheckCircle2}
                          label="Connect"
                          onClick={() => {
                            onConnect(i.id);
                            setMenuOpenId(null);
                          }}
                        />
                      )}
                      <MenuItem
                        icon={Copy}
                        label="Copy API Key"
                        onClick={() => {
                          onCopy(i.id, i.apiKey);
                          setMenuOpenId(null);
                        }}
                      />
                      <div className="my-1 h-px bg-brand-lilac/60" />
                      <MenuItem
                        icon={Trash2}
                        label="Remove"
                        danger
                        onClick={() => {
                          onDelete(i);
                          setMenuOpenId(null);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
              <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="flex items-center gap-1.5 text-brand-ink/50">
                  <Key size={11} /> API Key
                </span>
                <span className="truncate font-mono font-medium text-brand-ink">
                  {i.apiKey ? `${i.apiKey.slice(0, 12)}...` : 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="flex items-center gap-1.5 text-brand-ink/50">
                  <Clock size={11} /> Last Sync
                </span>
                <span className="truncate font-medium text-brand-ink">
                  {i.lastSync}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => onConfigure(i)}
                className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
              >
                <Settings size={13} />
                Configure
              </button>
              {isConnected ? (
                <button
                  onClick={() => onDisconnect(i.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white py-2.5 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-50"
                >
                  <XCircle size={13} /> Disconnect
                </button>
              ) : (
                <button
                  onClick={() => onConnect(i.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110"
                >
                  <CheckCircle2 size={13} /> Connect
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= WEBHOOKS TAB ================= */
function WebhooksTab({ webhooks, onAdd, onEdit, onToggle, onDelete, onCopy, copiedId }) {
  return (
    <div className="space-y-4">
      <div className="card !p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <Link2 size={14} className="text-brand-purple" />
            Webhooks
          </h3>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-magenta px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add Webhook
          </button>
        </div>

        {webhooks.length === 0 ? (
          <p className="py-8 text-center text-xs text-brand-ink/40">
            No webhooks configured yet.
          </p>
        ) : (
          <div className="space-y-2">
            {webhooks.map((w) => (
              <div
                key={w.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    w.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Link2 size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {w.name}
                  </p>
                  <p className="truncate font-mono text-[10px] text-brand-ink/50">
                    {w.event} → {w.url}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-lilac px-2 py-0.5 text-[10px] font-bold text-brand-purple">
                  {w.method}
                </span>
                <button
                  onClick={() => onToggle(w.id)}
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    w.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {w.status === 'Active' ? (
                    <Wifi size={10} />
                  ) : (
                    <WifiOff size={10} />
                  )}
                  {w.status}
                </button>
                <span className="hidden shrink-0 text-[10px] text-brand-ink/40 md:block">
                  {w.lastTriggered}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => onCopy(w.id, w.url)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/50 hover:bg-brand-lilac"
                  >
                    {copiedId === w.id ? (
                      <Check size={13} className="text-emerald-500" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(w)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/50 hover:bg-brand-lilac"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(w.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= API KEYS TAB ================= */
function ApiKeysTab({ apiKeys, onAdd, onRevoke, onDelete, onCopy, copiedId, revealedKey, setRevealedKey }) {
  return (
    <div className="space-y-4">
      <div className="card !p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <Key size={14} className="text-brand-purple" />
            API Keys
          </h3>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-magenta px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Generate Key
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <p className="py-8 text-center text-xs text-brand-ink/40">
            No API keys yet.
          </p>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 ${
                  k.status === 'Active'
                    ? 'border-brand-lilac'
                    : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    k.status === 'Active'
                      ? 'bg-violet-100 text-brand-purple'
                      : 'bg-rose-100 text-rose-500'
                  }`}
                >
                  <Key size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {k.name}
                  </p>
                  <p className="truncate font-mono text-[10px] text-brand-ink/50">
                    {revealedKey === k.id
                      ? k.key
                      : `${k.key.slice(0, 12)}${'•'.repeat(20)}`}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-lilac px-2 py-0.5 text-[10px] font-bold text-brand-purple">
                  {k.scope}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    k.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {k.status}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() =>
                      setRevealedKey(revealedKey === k.id ? null : k.id)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/50 hover:bg-brand-lilac"
                  >
                    {revealedKey === k.id ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                  </button>
                  <button
                    onClick={() => onCopy(k.id, k.key)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/50 hover:bg-brand-lilac"
                  >
                    {copiedId === k.id ? (
                      <Check size={13} className="text-emerald-500" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  {k.status === 'Active' && (
                    <button
                      onClick={() => onRevoke(k.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50"
                      title="Revoke"
                    >
                      <Lock size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(k.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= ADD INTEGRATION MODAL ================= */
function AddIntegrationModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    category: 'SMS',
    apiKey: '',
    apiSecret: '',
    endpoint: '',
    webhookUrl: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const CATEGORIES = ['Telephony', 'SMS', 'WhatsApp', 'Email', 'Payment', 'Website', 'CRM'];

  const validate = () => {
    if (!form.name.trim()) return 'Integration name is required.';
    if (form.apiKey && form.apiKey.length < 6)
      return 'API Key must be at least 6 characters.';
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
              <Plug size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Add Integration
              </h3>
              <p className="text-xs text-brand-ink/50">
                Register a new external service.
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
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Twilio SMS"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                API Key
              </label>
              <input
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder={`${MOCK_KEY_PREFIX}xxxxxxxxxxxx`}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                API Secret
              </label>
              <input
                type="password"
                value={form.apiSecret}
                onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
                placeholder="••••••••••"
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Endpoint URL (optional)
            </label>
            <input
              value={form.endpoint}
              onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
              placeholder="https://api.example.com"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
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
              {submitting ? 'Adding…' : 'Add Integration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= CONFIGURE MODAL ================= */
function ConfigureModal({ integration, onClose, onSave }) {
  const [form, setForm] = useState({
    apiKey: integration.apiKey || '',
    apiSecret: integration.apiSecret || '',
    endpoint: integration.endpoint || '',
    webhookUrl: integration.webhookUrl || '',
  });
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.apiKey.trim()) return 'API Key is required.';
    if (form.endpoint && !/^https?:\/\//.test(form.endpoint))
      return 'Endpoint must start with http:// or https://';
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
      onSave(form);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Configure {integration.name}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {integration.category}
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
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <Key size={11} /> API Key
            </label>
            <input
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder={`${MOCK_KEY_PREFIX}xxxxxxxxxxxx`}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
                onChange={(e) =>
                  setForm({ ...form, apiSecret: e.target.value })
                }
                placeholder="••••••••••"
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 pr-10 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
              <button
                type="button"
                onClick={() => setShowSecret((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/40 hover:text-brand-purple"
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
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <Link2 size={11} /> Webhook URL (optional)
            </label>
            <input
              value={form.webhookUrl}
              onChange={(e) =>
                setForm({ ...form, webhookUrl: e.target.value })
              }
              placeholder="https://crm.example.com/webhooks"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
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
              {submitting ? (
                'Saving…'
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Save size={14} /> Save & Connect
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= WEBHOOK MODAL ================= */
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
    if (!/^https?:\/\//.test(form.url))
      return 'URL must start with http:// or https://';
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
              <Link2 size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {isEdit ? 'Edit Webhook' : 'New Webhook'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {isEdit
                  ? 'Update webhook details.'
                  : 'Register a new event listener.'}
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
              Webhook Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lead Created"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Event
            </label>
            <select
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              URL
            </label>
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://crm.example.com/webhooks"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Method
              </label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              >
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= API KEY MODAL ================= */
function ApiKeyModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    scope: 'Full Access',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Key name is required.';
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
      <div className="my-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Key size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Generate API Key
              </h3>
              <p className="text-xs text-brand-ink/50">
                Create a new API key for external access.
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
              Key Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Production Key"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Scope
            </label>
            <select
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              <option>Full Access</option>
              <option>Read Only</option>
              <option>Limited</option>
            </select>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <p className="flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              Store this key securely. You won't be able to see it again after
              closing this dialog.
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
              {submitting ? (
                'Generating…'
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Zap size={14} /> Generate
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= ANIMATED STAT CARD ================= */
function AnimatedStatCard({ label, value, sub, icon: Icon, color }) {
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
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} />
        </span>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
      </div>
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