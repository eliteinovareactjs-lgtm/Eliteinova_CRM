// src/pages/admin/Campaigns.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Megaphone, Plus, Play, Pause, X, Search, Filter, ChevronDown,
  MoreVertical, Eye, Pencil, Trash2, BarChart3, TrendingUp,
  TrendingDown, Users, Layers, Target, PhoneCall, Headphones,
  Percent, Check, AlertCircle, CheckCircle2, Download, Calendar,
  Clock, Repeat, Timer, Info, Save, Star, Award, Zap, ArrowRight,
  PhoneOff, MessageSquare, Copy, Briefcase, Hash, Sparkles, Radio,
  ListChecks, Megaphone as MegaphoneIcon, PhoneOutgoing, PhoneIncoming,
  PhoneMissed, Circle, XCircle, ClipboardList, UserPlus, RefreshCw,
  Grid3x3, List, MoreHorizontal, CheckSquare, Flag, TrendingUp as TrendIcon,
  Activity, Award as AwardIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CAMPAIGNS as INITIAL_CAMPAIGNS,
  AGENTS,
  LEADS,
} from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const CAMPAIGN_TYPES = [
  { key: 'Outbound',     label: 'Outbound Calls',    icon: PhoneOutgoing },
  { key: 'Inbound',      label: 'Inbound Follow-up', icon: PhoneIncoming },
  { key: 'Callback',     label: 'Callback Drive',    icon: Repeat },
  { key: 'FollowUp',     label: 'Follow-up Drive',   icon: Calendar },
  { key: 'Feedback',     label: 'Feedback / Survey', icon: ClipboardList },
  { key: 'Reactivation', label: 'Reactivation',      icon: Zap },
];

const STATUSES = ['Active', 'Paused', 'Completed', 'Draft'];

const LEAD_SOURCES = ['All', 'IVR', 'Website', 'WhatsApp', 'Referral', 'Google Ads', 'Meta Ads', 'Campaign'];

const LEAD_GROUPS = [
  { key: 'all',        label: 'All Leads',   filter: () => true },
  { key: 'fresh',      label: 'Fresh Leads', filter: (l) => l.status === 'Fresh' },
  { key: 'followup',   label: 'Follow-Up',   filter: (l) => l.status === 'Follow Up' },
  { key: 'interested', label: 'Interested',  filter: (l) => l.status === 'Qualified' },
  { key: 'unassigned', label: 'Unassigned',  filter: (l) => !l.assignedAgent || l.assignedAgent === 'Unassigned' },
  { key: 'lost',       label: 'Lost',        filter: (l) => l.status === 'Lost' || l.status === 'Missed' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STORAGE_PREFIX = 'campaigns:';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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

const typeLabel = (typeKey) =>
  CAMPAIGN_TYPES.find((t) => t.key === typeKey)?.label || 'Outbound Calls';

const typeIcon = (typeKey) =>
  CAMPAIGN_TYPES.find((t) => t.key === typeKey)?.icon || PhoneOutgoing;

const groupLabel = (groupKey) =>
  LEAD_GROUPS.find((g) => g.key === groupKey)?.label || 'All Leads';

const statusTone = (status) => {
  switch (status) {
    case 'Active':    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Paused':    return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Completed': return 'bg-violet-100 text-brand-purple border-violet-200';
    default:          return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

/* Normalize a raw campaign into a fully-formed one */
const buildFullCampaign = (c, websiteId) => ({
  status: 'Draft',
  type: 'Outbound',
  leadSource: 'All',
  leadGroup: 'all',
  callTargets: 500,
  agentIds: AGENTS.filter((a) => a.websiteId === websiteId).slice(0, 2).map((a) => a.id),
  callingHours: { from: '09:00', to: '18:00' },
  callingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  retryRules: { maxAttempts: 3, intervalHours: 24, retryOnNoAnswer: true },
  leads: 0, calls: 0, connected: 0, interested: 0, converted: 0,
  responses: 0, followUpsGenerated: 0, noAnswer: 0, notInterested: 0,
  ...c,
});

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Campaigns() {
  const { activeWebsiteId, activeWebsite } = useAuth();

  /* ── Load with localStorage override ── */
  const [allCampaigns, setAllCampaigns] = useState(() =>
    loadState(
      `list:${activeWebsiteId}`,
      INITIAL_CAMPAIGNS
        .filter((c) => c.projectId === activeWebsiteId)
        .map((c) => buildFullCampaign(c, activeWebsiteId))
    )
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');   // stores status string
  const [statusOpen, setStatusOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');       // ✅ stores TYPE KEY (not label)
  const [typeOpen, setTypeOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [toast, setToast] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [monitoringCampaign, setMonitoringCampaign] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    setAllCampaigns(
      loadState(
        `list:${activeWebsiteId}`,
        INITIAL_CAMPAIGNS
          .filter((c) => c.projectId === activeWebsiteId)
          .map((c) => buildFullCampaign(c, activeWebsiteId))
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebsiteId]);

  useEffect(() => {
    saveState(`list:${activeWebsiteId}`, allCampaigns);
  }, [allCampaigns, activeWebsiteId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  const websiteLeads = useMemo(
    () => LEADS.filter((l) => l.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* ✅ FIXED: uses filtered agents, not global AGENTS */
  const agentName = (id) =>
    agents.find((a) => a.id === id)?.name ||
    AGENTS.find((a) => a.id === id)?.name ||
    'Unknown Agent';

  /* ── Filtered campaigns ── */
  const filtered = useMemo(() => {
    let rows = [...allCampaigns];
    if (statusFilter !== 'All') rows = rows.filter((c) => c.status === statusFilter);
    if (typeFilter !== 'All') rows = rows.filter((c) => c.type === typeFilter); // ✅ compares KEY
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((c) =>
        `${c.name} ${c.leadSource} ${c.status} ${typeLabel(c.type)} ${groupLabel(c.leadGroup)}`
          .toLowerCase()
          .includes(q)
      );
    }
    return rows;
  }, [allCampaigns, statusFilter, typeFilter, searchQuery]);

  /* ── Summary (filtered — label says "of shown") ── */
  const summary = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((c) => c.status === 'Active').length;
    const paused = filtered.filter((c) => c.status === 'Paused').length;
    const completed = filtered.filter((c) => c.status === 'Completed').length;
    const draft = filtered.filter((c) => c.status === 'Draft').length;

    const totalLeads = filtered.reduce((s, c) => s + (c.leads || 0), 0);
    const totalCalls = filtered.reduce((s, c) => s + (c.calls || 0), 0);
    const totalConnected = filtered.reduce((s, c) => s + (c.connected || 0), 0);
    const totalInterested = filtered.reduce((s, c) => s + (c.interested || 0), 0);
    const totalConverted = filtered.reduce((s, c) => s + (c.converted || 0), 0);
    const totalNoAnswer = filtered.reduce((s, c) => s + (c.noAnswer || 0), 0);
    const totalNotInterested = filtered.reduce((s, c) => s + (c.notInterested || 0), 0);
    const totalFollowUps = filtered.reduce((s, c) => s + (c.followUpsGenerated || 0), 0);
    const totalTargets = filtered.reduce((s, c) => s + (c.callTargets || 0), 0);
    const conversion = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;
    const connectionRate = totalCalls > 0 ? Math.round((totalConnected / totalCalls) * 100) : 0;
    const targetProgress = totalTargets > 0 ? Math.round((totalCalls / totalTargets) * 100) : 0;

    return {
      total, active, paused, completed, draft,
      totalLeads, totalCalls, totalConnected, totalInterested,
      totalConverted, totalNoAnswer, totalNotInterested, totalFollowUps,
      totalTargets, conversion, connectionRate, targetProgress,
    };
  }, [filtered]);

  /* ── CRUD ── */
  const handleCreate = (data) => {
    const newCampaign = buildFullCampaign(
      {
        id: 'CMP-' + String(Date.now()).slice(-5),
        projectId: activeWebsiteId,
        ...data,
      },
      activeWebsiteId
    );
    setAllCampaigns((prev) => [newCampaign, ...prev]);
    setShowCreateModal(false);
    showToast(`Campaign "${data.name}" created`);
  };

  const handleEdit = (id, updates) => {
    setAllCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setEditingCampaign(null);
    showToast('Campaign updated');
  };

  const handleDelete = (id) => {
    setAllCampaigns((prev) => prev.filter((c) => c.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
    showToast('Campaign deleted', 'error');
  };

  /* ✅ FIXED: prevent starting Draft campaigns */
  const handleToggleStatus = (id, currentStatus) => {
    if (currentStatus === 'Completed') {
      showToast('Completed campaigns cannot be restarted. Duplicate to create a new one.', 'error');
      setMenuOpenId(null);
      return;
    }
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    setAllCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    setMenuOpenId(null);
    showToast(
      newStatus === 'Active' ? 'Campaign resumed' : 'Campaign paused',
      newStatus === 'Active' ? 'success' : 'error'
    );
  };

  const handleComplete = (id) => {
    setAllCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Completed' } : c)));
    setMenuOpenId(null);
    showToast('Campaign marked as completed');
  };

  const handleDuplicate = (campaign) => {
    const copy = {
      ...campaign,
      id: 'CMP-' + String(Date.now()).slice(-5),
      name: `${campaign.name} (Copy)`,
      status: 'Draft',
      leads: 0, calls: 0, connected: 0, interested: 0, converted: 0,
      responses: 0, followUpsGenerated: 0, noAnswer: 0, notInterested: 0,
    };
    setAllCampaigns((prev) => [copy, ...prev]);
    setMenuOpenId(null);
    showToast('Campaign duplicated');
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast('No campaigns to export', 'error');
      return;
    }
    /* ✅ FIXED: exports labels for type/group, not raw keys */
    const rows = [
      ['ID', 'Name', 'Type', 'Status', 'Lead Source', 'Lead Group', 'Leads', 'Calls', 'Connected', 'No Answer', 'Interested', 'Not Interested', 'Follow-ups', 'Converted', 'Start', 'End'],
      ...filtered.map((c) => [
        c.id, c.name, typeLabel(c.type), c.status, c.leadSource, groupLabel(c.leadGroup),
        c.leads, c.calls, c.connected, c.noAnswer, c.interested, c.notInterested,
        c.followUpsGenerated, c.converted, c.startDate, c.endDate,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaigns-${activeWebsite?.name || 'website'}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} campaigns`);
  };

  const hasFilters = searchQuery || statusFilter !== 'All' || typeFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Campaigns</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Megaphone size={13} className="text-brand-magenta" />
              Manage calling campaigns for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md"
            >
              <Download size={14} className="transition-transform group-hover:translate-y-0.5" /> Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <Plus size={14} className="transition-transform group-hover:rotate-90" /> Create Campaign
            </button>
          </div>
        </div>

        {/* ═══ PRIMARY KPI STRIP ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Campaign Overview</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <KpiCard icon={Megaphone}   label="Total Campaigns" value={summary.total}        sub={`${summary.active} active · ${summary.paused} paused`} color="purple"  delay={0} />
            <KpiCard icon={Users}       label="Total Leads"     value={summary.totalLeads}   sub={`${summary.totalCalls} calls made`}                    color="emerald" delay={40} />
            <KpiCard icon={Target}      label="Converted"       value={summary.totalConverted} sub={`${summary.conversion}% conversion rate`}             color="amber"   delay={80} />
            <KpiCard icon={Star}        label="Interested"      value={summary.totalInterested} sub={`${summary.totalFollowUps} follow-ups generated`}    color="rose"    delay={120} />
          </div>
        </div>

        {/* ═══ SECONDARY KPI STRIP ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Campaign Monitoring</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Performance Metrics</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <MiniStat icon={CheckCircle2} label="Successful"     value={summary.totalConnected}     color="emerald" sub={`${summary.connectionRate}% rate`} />
            <MiniStat icon={PhoneOff}     label="No Answer"      value={summary.totalNoAnswer}      color="rose" />
            <MiniStat icon={Star}         label="Interested"     value={summary.totalInterested}    color="amber" />
            <MiniStat icon={XCircle}      label="Not Interested" value={summary.totalNotInterested} color="rose" />
            <MiniStat icon={Layers}       label="Follow-ups"     value={summary.totalFollowUps}     color="purple" />
            <MiniStat icon={Target}       label="Converted"      value={summary.totalConverted}     color="emerald" />
          </div>
        </div>

        {/* ═══ FILTER BAR ═══ */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by campaign name, source, status…"
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
            label="Status"
            icon={Filter}
            value={statusFilter}
            options={['All', ...STATUSES]}
            open={statusOpen}
            onToggle={() => { setStatusOpen((s) => !s); setTypeOpen(false); }}
            onChange={(v) => { setStatusFilter(v); setStatusOpen(false); }}
          />

          {/* ✅ FIXED: options are KEYS, display is LABELS */}
          <DropdownFilter
            label="Type"
            icon={MegaphoneIcon}
            value={typeFilter}
            options={['All', ...CAMPAIGN_TYPES.map((t) => t.key)]}
            displayValue={(v) => (v === 'All' ? 'All' : typeLabel(v))}
            open={typeOpen}
            onToggle={() => { setTypeOpen((s) => !s); setStatusOpen(false); }}
            onChange={(v) => { setTypeFilter(v); setTypeOpen(false); }}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
            >
              <X size={12} /> Clear
            </button>
          )}

          <div className="flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-full p-1.5 transition-all ${viewMode === 'grid' ? 'bg-brand-magenta/10 text-brand-magenta' : 'text-brand-ink/50 hover:bg-brand-lilac/30'}`}
              title="Grid view"
            >
              <Grid3x3 size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-full p-1.5 transition-all ${viewMode === 'list' ? 'bg-brand-magenta/10 text-brand-magenta' : 'text-brand-ink/50 hover:bg-brand-lilac/30'}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* ═══ CAMPAIGNS ═══ */}
        {filtered.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClear={clearFilters}
            onCreate={() => setShowCreateModal(true)}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                agentName={agentName}
                onView={() => setViewingCampaign(c)}
                onEdit={() => setEditingCampaign(c)}
                onToggle={() => handleToggleStatus(c.id, c.status)}
                onMonitoring={() => setMonitoringCampaign(c)}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onDuplicate={() => handleDuplicate(c)}
                onComplete={() => handleComplete(c.id)}
                onDelete={() => { setConfirmDelete(c); setMenuOpenId(null); }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <CampaignRow
                key={c.id}
                campaign={c}
                agentName={agentName}
                onView={() => setViewingCampaign(c)}
                onEdit={() => setEditingCampaign(c)}
                onToggle={() => handleToggleStatus(c.id, c.status)}
                onMonitoring={() => setMonitoringCampaign(c)}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onDuplicate={() => handleDuplicate(c)}
                onComplete={() => handleComplete(c.id)}
                onDelete={() => { setConfirmDelete(c); setMenuOpenId(null); }}
              />
            ))}
          </div>
        )}

        {/* ═══ MODALS ═══ */}
        {showCreateModal && (
          <CampaignModal
            mode="create"
            agents={agents}
            websiteLeads={websiteLeads}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreate}
          />
        )}

        {editingCampaign && (
          <CampaignModal
            mode="edit"
            initial={editingCampaign}
            agents={agents}
            websiteLeads={websiteLeads}
            onClose={() => setEditingCampaign(null)}
            onSubmit={(data) => handleEdit(editingCampaign.id, data)}
          />
        )}

        {viewingCampaign && (
          <CampaignDetailsDrawer
            campaign={viewingCampaign}
            agentName={agentName}
            onClose={() => setViewingCampaign(null)}
            onEdit={() => { setEditingCampaign(viewingCampaign); setViewingCampaign(null); }}
            onMonitoring={() => { setMonitoringCampaign(viewingCampaign); setViewingCampaign(null); }}
            onToggle={() => { handleToggleStatus(viewingCampaign.id, viewingCampaign.status); setViewingCampaign(null); }}
          />
        )}

        {monitoringCampaign && (
          <CampaignMonitoringDrawer
            campaign={monitoringCampaign}
            onClose={() => setMonitoringCampaign(null)}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title={`Delete "${confirmDelete.name}"?`}
            message="This will permanently delete this campaign and all its data. This action cannot be undone."
            confirmLabel="Delete Campaign"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDelete(confirmDelete.id)}
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
function KpiCard({ icon: Icon, label, value, sub, color = 'purple', delay = 0 }) {
  const displayValue = useAnimatedCount(value);
  const themes = {
    purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'from-violet-50 via-violet-50/30 to-white', iconBg: 'bg-violet-100 text-brand-purple border-violet-200', bar: 'from-brand-purple to-brand-magenta', glow: 'bg-brand-purple/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]', valueColor: 'text-brand-purple' },
    emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'from-emerald-50 via-emerald-50/30 to-white', iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'from-emerald-500 to-emerald-400', glow: 'bg-emerald-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]', valueColor: 'text-emerald-600' },
    amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'from-amber-50 via-amber-50/30 to-white', iconBg: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'from-amber-500 to-orange-400', glow: 'bg-amber-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]', valueColor: 'text-amber-600' },
    rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'from-rose-50 via-rose-50/30 to-white', iconBg: 'bg-rose-100 text-brand-magenta border-rose-200', bar: 'from-brand-magenta to-brand-purple', glow: 'bg-brand-magenta/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]', valueColor: 'text-brand-magenta' },
  };
  const t = themes[color] || themes.purple;

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/30 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 hover:-translate-y-1.5 animate-fade-slide-in ${t.border} ${t.shadow}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${t.iconBg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} />
        </span>
      </div>

      <div className="relative z-10 w-full">
        <p className={`font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>{displayValue}</p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </div>
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
function MiniStat({ icon: Icon, label, value, color = 'purple', sub }) {
  const colors = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-brand-magenta',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color] || colors.purple}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{label}</p>
        <p className="font-display text-lg font-bold text-brand-ink tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {sub && <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/40">{sub}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DROPDOWN FILTER (supports key → label display)
   ═══════════════════════════════════════════════════════════════ */
function DropdownFilter({ label, icon: Icon, value, options, displayValue, open, onToggle, onChange }) {
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
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-56 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === o
                    ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
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
   CAMPAIGN CARD
   ═══════════════════════════════════════════════════════════════ */
function CampaignCard({ campaign: c, agentName, onView, onEdit, onToggle, onMonitoring, menuOpenId, setMenuOpenId, onDuplicate, onComplete, onDelete }) {
  const conversionRate = c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0;
  const connectionRate = c.calls > 0 ? Math.round((c.connected / c.calls) * 100) : 0;
  const targetProgress = c.callTargets > 0 ? Math.round((c.calls / c.callTargets) * 100) : 0;
  const TypeIcon = typeIcon(c.type);

  const isCompleted = c.status === 'Completed';
  const isActive = c.status === 'Active';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-magenta/50 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)]">
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-magenta/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-col p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            <TypeIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-semibold text-brand-ink">{c.name}</p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-brand-magenta">
              {typeLabel(c.type)}
            </p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusTone(c.status)}`}>
            {c.status}
          </span>
          <div className="relative">
            <button
              onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
              className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-lilac"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpenId === c.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                  <MenuItem icon={Eye}       label="View Details"  onClick={onView} />
                  <MenuItem icon={Pencil}    label="Edit Campaign" onClick={onEdit} />
                  <MenuItem icon={BarChart3} label="Monitoring"    onClick={onMonitoring} />
                  <MenuItem icon={Copy}      label="Duplicate"     onClick={onDuplicate} />
                  {!isCompleted && (
                    <>
                      <MenuItem
                        icon={isActive ? Pause : Play}
                        label={isActive ? 'Pause' : 'Start'}
                        onClick={onToggle}
                      />
                      {isActive && (
                        <MenuItem icon={CheckSquare} label="Mark Complete" onClick={onComplete} />
                      )}
                    </>
                  )}
                  <div className="my-1 h-px bg-brand-lilac/60" />
                  <MenuItem icon={Trash2}    label="Delete"        danger onClick={onDelete} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-brand-ink/50"><Calendar size={11} /> Duration</span>
            <span className="truncate font-semibold text-brand-ink">{c.startDate} → {c.endDate || '—'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-brand-ink/50"><Clock size={11} /> Hours</span>
            <span className="truncate font-semibold text-brand-ink">{c.callingHours?.from} – {c.callingHours?.to}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-brand-ink/50"><Users size={11} /> Agents</span>
            <span className="truncate font-semibold text-brand-ink">{c.agentIds?.length || 0} assigned</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-brand-ink/50"><Target size={11} /> Targets</span>
            <span className="truncate font-semibold text-brand-ink">{c.calls} / {c.callTargets}</span>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <MiniBox label="Leads"      value={c.leads}          tone="purple" />
          <MiniBox label="Connected"  value={c.connected}      tone="emerald" />
          <MiniBox label="Converted"  value={c.converted}      tone="rose" />
        </div>

        {/* Progress bars */}
        <div className="mt-3 space-y-2">
          <ProgressBar label="Target Progress" value={targetProgress} tone="amber" />
          <ProgressBar label="Connection Rate" value={connectionRate} tone="purple" />
          <ProgressBar label="Conversion Rate" value={conversionRate} tone="emerald" />
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          >
            <Eye size={12} /> View
          </button>
          <button
            onClick={onMonitoring}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          >
            <BarChart3 size={12} /> Monitor
          </button>
          <button
            onClick={onToggle}
            disabled={isCompleted}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white shadow-card transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : isCompleted
                ? 'bg-gradient-to-r from-slate-400 to-slate-500'
                : 'bg-gradient-to-r from-brand-magenta to-brand-purple'
            }`}
          >
            {isActive ? <><Pause size={12} /> Pause</> : isCompleted ? <><Check size={12} /> Done</> : <><Play size={12} /> Start</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN ROW (LIST)
   ═══════════════════════════════════════════════════════════════ */
function CampaignRow({ campaign: c, agentName, onView, onEdit, onToggle, onMonitoring, menuOpenId, setMenuOpenId, onDuplicate, onComplete, onDelete }) {
  const conversionRate = c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0;
  const TypeIcon = typeIcon(c.type);
  const isCompleted = c.status === 'Completed';
  const isActive = c.status === 'Active';

  return (
    <div className="group flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
        <TypeIcon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">{c.name}</p>
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-brand-magenta">
          {typeLabel(c.type)}
        </p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="font-mono text-[10px] uppercase text-brand-ink/40">Leads</p>
        <p className="font-semibold tabular-nums text-brand-ink">{c.leads}</p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="font-mono text-[10px] uppercase text-brand-ink/40">Calls</p>
        <p className="font-semibold tabular-nums text-brand-ink">{c.calls}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="font-mono text-[10px] uppercase text-brand-ink/40">Conv.</p>
        <p className="font-semibold tabular-nums text-emerald-600">{conversionRate}%</p>
      </div>

      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusTone(c.status)}`}>
        {c.status}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="View"
        >
          <Eye size={13} />
        </button>
        <button
          onClick={onMonitoring}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="Monitoring"
        >
          <BarChart3 size={13} />
        </button>
        <button
          onClick={onToggle}
          disabled={isCompleted}
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${
            isActive
              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : isCompleted
              ? 'bg-gradient-to-r from-slate-400 to-slate-500'
              : 'bg-gradient-to-r from-brand-magenta to-brand-purple'
          }`}
        >
          {isActive ? <><Pause size={11} /> Pause</> : isCompleted ? <><Check size={11} /> Done</> : <><Play size={11} /> Start</>}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 transition-colors hover:bg-brand-lilac"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === c.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={Pencil}  label="Edit Campaign" onClick={onEdit} />
                <MenuItem icon={Copy}    label="Duplicate"     onClick={onDuplicate} />
                {isActive && <MenuItem icon={CheckSquare} label="Mark Complete" onClick={onComplete} />}
                <div className="my-1 h-px bg-brand-lilac/60" />
                <MenuItem icon={Trash2}  label="Delete"        danger onClick={onDelete} />
              </div>
            </>
          )}
        </div>
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
   MINI BOX
   ═══════════════════════════════════════════════════════════════ */
function MiniBox({ label, value, tone = 'purple' }) {
  const tones = {
    purple:  'bg-violet-50 text-brand-purple border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose:    'bg-rose-50 text-brand-magenta border-rose-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className={`rounded-xl border ${tones[tone] || tones.purple} p-2.5`}>
      <p className="font-display text-base font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */
function ProgressBar({ label, value, tone = 'purple' }) {
  const tones = {
    purple:  { bar: 'from-brand-purple to-brand-magenta', text: 'text-brand-purple' },
    emerald: { bar: 'from-emerald-500 to-emerald-400',     text: 'text-emerald-600' },
    amber:   { bar: 'from-amber-500 to-orange-400',        text: 'text-amber-600' },
    rose:    { bar: 'from-brand-magenta to-brand-purple',  text: 'text-brand-magenta' },
  };
  const t = tones[tone] || tones.purple;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="font-mono uppercase tracking-wider text-brand-ink/50">{label}</span>
        <span className={`font-semibold tabular-nums ${t.text}`}>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${t.bar} transition-all duration-1000`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN MODAL
   ═══════════════════════════════════════════════════════════════ */
function CampaignModal({ mode = 'create', initial = {}, agents, websiteLeads, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    name: initial.name || '',
    type: initial.type || 'Outbound',
    leadSource: initial.leadSource || 'All',
    leadGroup: initial.leadGroup || 'all',
    status: initial.status || 'Draft',
    startDate: initial.startDate || new Date().toISOString().slice(0, 10),
    endDate: initial.endDate || '',
    agentIds: initial.agentIds || [],
    callingHours: initial.callingHours || { from: '09:00', to: '18:00' },
    callingDays: initial.callingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    retryRules: initial.retryRules || { maxAttempts: 3, intervalHours: 24, retryOnNoAnswer: true },
    callTargets: initial.callTargets || 500,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* Filter agents who actually exist in the current website */
  const availableAgents = useMemo(
    () => agents.filter((a) => !initial.agentIds || true), // all agents
    [agents]
  );

  /* Preview leads count */
  const previewLeads = useMemo(() => {
    const groupFilter = LEAD_GROUPS.find((g) => g.key === form.leadGroup)?.filter || (() => true);
    return websiteLeads.filter((l) => {
      if (form.leadSource !== 'All' && l.leadSource !== form.leadSource) return false;
      return groupFilter(l);
    }).length;
  }, [websiteLeads, form.leadSource, form.leadGroup]);

  const validate = () => {
    if (!form.name.trim()) return 'Campaign name is required.';
    if (!form.startDate) return 'Start date is required.';
    if (!form.endDate) return 'End date is required.';
    if (form.endDate < form.startDate) return 'End date must be after start date.';
    if (form.agentIds.length === 0) return 'Select at least one agent.';
    if (form.callingDays.length === 0) return 'Select at least one day.';
    if (Number(form.callTargets) <= 0) return 'Call targets must be greater than 0.';
    if (form.retryRules.maxAttempts < 1) return 'Retry attempts must be at least 1.';
    if (form.retryRules.intervalHours < 1) return 'Retry interval must be at least 1 hour.';
    if (form.callingHours.from >= form.callingHours.to) return 'Calling hours "from" must be before "to".';
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
      onSubmit({
        name: form.name.trim(),
        type: form.type,
        leadSource: form.leadSource,
        leadGroup: form.leadGroup,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        agentIds: form.agentIds,
        callingHours: form.callingHours,
        callingDays: form.callingDays,
        retryRules: form.retryRules,
        callTargets: Number(form.callTargets),
      });
    }, 300);
  };

  const toggleAgent = (id) => {
    setForm((f) => ({ ...f, agentIds: f.agentIds.includes(id) ? f.agentIds.filter((a) => a !== id) : [...f.agentIds, id] }));
  };

  const toggleDay = (day) => {
    setForm((f) => ({ ...f, callingDays: f.callingDays.includes(day) ? f.callingDays.filter((d) => d !== day) : [...f.callingDays, day] }));
  };

  /* Clamp helpers */
  const setNumeric = (field, value, min = 1, max = 1000) => {
    const n = Number(value);
    if (isNaN(n)) return;
    const clamped = Math.max(min, Math.min(max, n));
    setForm((f) => ({ ...f, [field]: clamped }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Megaphone size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-brand-ink">
                {isEdit ? 'Edit Campaign' : 'Create Campaign'}
              </h3>
              <p className="text-[11px] text-brand-ink/50">
                {isEdit ? 'Update campaign details' : 'Configure a new campaign end-to-end'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          {/* Basic Info */}
          <SectionTitle icon={Info} label="Basic Information" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="Campaign Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="e.g. Q3 Matrimony Outreach"
              icon={Megaphone}
              required
            />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Campaign Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                {CAMPAIGN_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lead Selection */}
          <SectionTitle icon={Users} label="Lead Selection" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Lead Source</label>
              <select
                value={form.leadSource}
                onChange={(e) => setForm({ ...form, leadSource: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Lead Group</label>
              <select
                value={form.leadGroup}
                onChange={(e) => setForm({ ...form, leadGroup: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                {LEAD_GROUPS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-brand-magenta/30 bg-gradient-to-br from-brand-magenta/[0.06] to-brand-purple/[0.04] p-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand-magenta" />
              <p className="text-xs font-semibold text-brand-ink">
                <strong className="text-brand-magenta">{previewLeads}</strong> lead{previewLeads !== 1 ? 's' : ''} match this criteria
              </p>
            </div>
            <p className="mt-1 text-[10px] text-brand-ink/50">
              Only matching leads will be included in this campaign
            </p>
          </div>

          {/* Call Targets */}
          <SectionTitle icon={Target} label="Call Targets" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="Total Call Target"
              type="number"
              value={form.callTargets}
              onChange={(v) => setNumeric('callTargets', v, 1, 100000)}
              placeholder="e.g. 500"
              icon={Target}
              required
            />
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Auto-computed</p>
              <p className="mt-1 text-xs text-brand-ink/70">
                Retry attempts per lead: <strong>{form.retryRules.maxAttempts}</strong>
              </p>
              <p className="text-xs text-brand-ink/70">
                Max total attempts: <strong>{(previewLeads * form.retryRules.maxAttempts).toLocaleString()}</strong>
              </p>
            </div>
          </div>

          {/* Agents */}
          <SectionTitle icon={Users} label="Assign Agents" />
          <div className="rounded-xl border border-brand-lilac bg-white p-3">
            {agents.length === 0 ? (
              <p className="py-3 text-center text-xs text-brand-ink/40">No agents available</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {agents.map((a) => {
                  const selected = form.agentIds.includes(a.id);
                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => toggleAgent(a.id)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                        selected
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'border-brand-lilac bg-white text-brand-ink/70 hover:bg-brand-lilac/30'
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${selected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-brand-lilac'}`}>
                        {selected && <Check size={12} />}
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                        {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{a.name}</p>
                        <p className="truncate text-[10px] opacity-70">{a.phone} · {a.status}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">
              {form.agentIds.length} agent{form.agentIds.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Schedule */}
          <SectionTitle icon={Calendar} label="Calling Schedule" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput label="Start Date" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} icon={Calendar} required />
            <ModalInput label="End Date" type="date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} icon={Calendar} required />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="Calling Hours From" type="time" value={form.callingHours.from}
              onChange={(v) => setForm({ ...form, callingHours: { ...form.callingHours, from: v } })}
              icon={Clock}
            />
            <ModalInput
              label="Calling Hours To" type="time" value={form.callingHours.to}
              onChange={(v) => setForm({ ...form, callingHours: { ...form.callingHours, to: v } })}
              icon={Clock}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Calling Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const active = form.callingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                      active
                        ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                        : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Retry Rules */}
          <SectionTitle icon={Repeat} label="Retry Rules" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Max Retry Attempts</label>
              <input
                type="number" min={1} max={10}
                value={form.retryRules.maxAttempts}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (isNaN(n)) return;
                  setForm({ ...form, retryRules: { ...form.retryRules, maxAttempts: Math.max(1, Math.min(10, n)) } });
                }}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
              <p className="mt-1 text-[10px] text-brand-ink/50">Between 1 and 10</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Interval (hours)</label>
              <input
                type="number" min={1} max={168}
                value={form.retryRules.intervalHours}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (isNaN(n)) return;
                  setForm({ ...form, retryRules: { ...form.retryRules, intervalHours: Math.max(1, Math.min(168, n)) } });
                }}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
              <p className="mt-1 text-[10px] text-brand-ink/50">Between 1 and 168 hours</p>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-lilac bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={form.retryRules.retryOnNoAnswer}
              onChange={(e) => setForm({ ...form, retryRules: { ...form.retryRules, retryOnNoAnswer: e.target.checked } })}
              className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
            />
            <span className="text-sm font-semibold text-brand-ink/70">Retry on no-answer</span>
          </label>

          {/* Status */}
          <SectionTitle icon={Zap} label="Initial Status" />
          <div className="flex flex-wrap gap-2">
            {['Draft', 'Active', 'Paused'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, status: s })}
                className={`min-w-[100px] flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                  form.status === s
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                    : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />{error}
            </div>
          )}

          <div className="flex gap-2 border-t border-brand-lilac/60 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */
function SectionTitle({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 border-b border-brand-lilac/60 pb-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta/10 to-brand-purple/10 text-brand-magenta">
        {Icon ? <Icon size={12} /> : null}
      </span>
      <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/60">{label}</h4>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL INPUT
   ═══════════════════════════════════════════════════════════════ */
function ModalInput({ label, type = 'text', value, onChange, placeholder, icon: Icon, required }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-magenta/60" />}
        <input
          type={type}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-brand-lilac bg-white py-2.5 ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15`}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN DETAILS DRAWER
   ═══════════════════════════════════════════════════════════════ */
function CampaignDetailsDrawer({ campaign: c, agentName, onClose, onEdit, onMonitoring, onToggle }) {
  const conversionRate = c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0;
  const connectionRate = c.calls > 0 ? Math.round((c.connected / c.calls) * 100) : 0;
  const targetProgress = c.callTargets > 0 ? Math.round((c.calls / c.callTargets) * 100) : 0;
  const TypeIcon = typeIcon(c.type);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
              <TypeIcon size={20} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">{typeLabel(c.type)}</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{c.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Status" value={c.status} color={c.status === 'Active' ? 'emerald' : c.status === 'Paused' ? 'amber' : 'purple'} />
            <InfoBox label="Leads"  value={c.leads}  color="purple" />
            <InfoBox label="Calls"  value={c.calls}  color="emerald" />
          </div>

          <div className="card !p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Call Targets Progress</p>
                <p className="mt-0.5 font-display text-2xl font-bold text-brand-magenta">
                  {c.calls} <span className="text-sm font-medium text-brand-ink/40">/ {c.callTargets}</span>
                </p>
              </div>
              <span className="rounded-full bg-brand-magenta/10 px-3 py-1 font-mono text-xs font-bold text-brand-magenta">
                {targetProgress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Lead Selection</h4>
            <InfoRow icon={Filter} label="Source" value={c.leadSource} />
            <InfoRow icon={Users}  label="Group"  value={groupLabel(c.leadGroup)} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Schedule</h4>
            <InfoRow icon={Calendar} label="Start Date"    value={c.startDate} />
            <InfoRow icon={Calendar} label="End Date"      value={c.endDate || '—'} />
            <InfoRow icon={Clock}    label="Calling Hours" value={`${c.callingHours?.from} – ${c.callingHours?.to}`} />
            <InfoRow icon={Calendar} label="Calling Days"  value={c.callingDays?.join(', ') || '—'} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Assigned Agents ({c.agentIds?.length || 0})</h4>
            {c.agentIds?.length === 0 ? (
              <p className="text-xs text-brand-ink/40">No agents assigned</p>
            ) : (
              <div className="space-y-2">
                {c.agentIds?.map((id) => {
                  const name = agentName(id);
                  return (
                    <div key={id} className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 p-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                        {name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <p className="truncate text-sm font-semibold text-brand-ink">{name}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Retry Rules</h4>
            <InfoRow icon={Repeat}    label="Max Attempts"  value={c.retryRules?.maxAttempts || 0} />
            <InfoRow icon={Timer}     label="Interval"      value={`${c.retryRules?.intervalHours || 0} hours`} />
            <InfoRow icon={RefreshCw} label="Retry No-Ans"  value={c.retryRules?.retryOnNoAnswer ? 'Yes' : 'No'} />
          </div>

          <div className="card !p-4">
            <h4 className="mb-3 font-display text-sm font-semibold text-brand-ink">Performance Snapshot</h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoBox label="Connection" value={`${connectionRate}%`} color="purple" />
              <InfoBox label="Conversion" value={`${conversionRate}%`} color="emerald" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={onEdit} className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <Pencil size={13} /> Edit
            </button>
            <button onClick={onMonitoring} className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <BarChart3 size={13} /> Monitor
            </button>
            <button
              onClick={onToggle}
              disabled={c.status === 'Completed'}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                c.status === 'Active' ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-brand-magenta to-brand-purple'
              }`}
            >
              {c.status === 'Active' ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Start</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN MONITORING DRAWER
   ═══════════════════════════════════════════════════════════════ */
function CampaignMonitoringDrawer({ campaign: c, onClose }) {
  const conversionRate = c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0;
  const connectionRate = c.calls > 0 ? Math.round((c.connected / c.calls) * 100) : 0;
  const targetProgress = c.callTargets > 0 ? Math.round((c.calls / c.callTargets) * 100) : 0;
  const noAnswerRate   = c.calls > 0 ? Math.round((c.noAnswer / c.calls) * 100) : 0;

  const funnel = [
    { label: 'Target Leads',   value: c.leads,               tone: 'purple' },
    { label: 'Calls Made',     value: c.calls,               tone: 'purple' },
    { label: 'Connected',      value: c.connected,           tone: 'emerald' },
    { label: 'No Answer',      value: c.noAnswer,            tone: 'rose' },
    { label: 'Interested',     value: c.interested,          tone: 'amber' },
    { label: 'Not Interested', value: c.notInterested,       tone: 'rose' },
    { label: 'Follow-ups',     value: c.followUpsGenerated,  tone: 'purple' },
    { label: 'Converted',      value: c.converted,           tone: 'emerald' },
  ];

  /* ✅ FIXED: denominator uses max(leads, calls) so percentages stay sensible */
  const funnelDenom = Math.max(c.leads, c.calls, 1);

  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Campaign', c.name],
      ['Type', typeLabel(c.type)],
      ['Status', c.status],
      ['Source', c.leadSource],
      ['Start', c.startDate],
      ['End', c.endDate || '—'],
      ['Call Targets', c.callTargets],
      ['Leads', c.leads],
      ['Calls', c.calls],
      ['Connected', c.connected],
      ['No Answer', c.noAnswer],
      ['Interested', c.interested],
      ['Not Interested', c.notInterested],
      ['Follow-ups Generated', c.followUpsGenerated],
      ['Converted', c.converted],
      ['Connection Rate', `${connectionRate}%`],
      ['Conversion Rate', `${conversionRate}%`],
      ['Target Progress', `${targetProgress}%`],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-monitoring-${c.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
              <BarChart3 size={18} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Campaign Monitoring</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{c.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Target progress hero */}
          <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-white p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-magenta/10 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Call Targets</p>
                <p className="mt-1 font-display text-3xl font-bold text-brand-magenta">
                  {c.calls}
                  <span className="ml-2 text-lg font-medium text-brand-ink/40">/ {c.callTargets}</span>
                </p>
                <p className="mt-1 text-xs text-brand-ink/60">
                  {targetProgress}% complete · {Math.max(0, c.callTargets - c.calls)} remaining
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-md">
                <Target size={24} />
              </div>
            </div>
            <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Monitoring tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MonitorTile icon={CheckCircle2} label="Successful Calls" value={c.connected}           tone="emerald" subtitle={`${connectionRate}% rate`} />
            <MonitorTile icon={PhoneOff}     label="No Answer"        value={c.noAnswer}            tone="rose"    subtitle={`${noAnswerRate}% of calls`} />
            <MonitorTile icon={Star}         label="Interested"       value={c.interested}          tone="amber"   subtitle="Warm leads" />
            <MonitorTile icon={XCircle}      label="Not Interested"   value={c.notInterested}       tone="rose"    subtitle="Cold leads" />
            <MonitorTile icon={Calendar}     label="Follow-ups"       value={c.followUpsGenerated}  tone="purple"  subtitle="Generated" />
            <MonitorTile icon={Target}       label="Converted"        value={c.converted}           tone="emerald" subtitle={`${conversionRate}% conversion`} />
          </div>

          {/* Funnel */}
          <div className="card !p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
                <TrendingUp size={14} />
              </span>
              <div>
                <h4 className="font-display text-sm font-bold text-brand-ink">Conversion Funnel</h4>
                <p className="text-[10px] text-brand-ink/50">Lead journey through the campaign</p>
              </div>
            </div>
            <div className="space-y-3">
              {funnel.map((step) => {
                /* ✅ FIXED: sensible denominator + clamped percentage */
                const pct = Math.min(100, Math.round((step.value / funnelDenom) * 100));
                const tones = {
                  purple:  { bar: 'from-brand-purple to-brand-magenta', text: 'text-brand-purple' },
                  emerald: { bar: 'from-emerald-500 to-emerald-400',     text: 'text-emerald-600' },
                  amber:   { bar: 'from-amber-500 to-orange-400',        text: 'text-amber-600' },
                  rose:    { bar: 'from-brand-magenta to-brand-purple',  text: 'text-brand-magenta' },
                };
                const tone = tones[step.tone];
                return (
                  <div key={step.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-brand-ink/70">{step.label}</span>
                      <span className="font-mono font-bold text-brand-ink tabular-nums">
                        {step.value.toLocaleString()} <span className={`ml-1 ${tone.text}`}>({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${tone.bar} transition-all duration-1000`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rate overview */}
          <div className="card !p-5">
            <h4 className="mb-4 font-display text-sm font-bold text-brand-ink">Rate Overview</h4>
            <div className="grid grid-cols-2 gap-3">
              <RateTile label="Connection Rate" value={connectionRate} tone="purple" />
              <RateTile label="No-Answer Rate"  value={noAnswerRate}   tone="rose" />
              <RateTile label="Conversion Rate" value={conversionRate} tone="emerald" />
              <RateTile label="Target Progress" value={targetProgress} tone="amber" />
            </div>
          </div>

          {/* Export */}
          <button
            onClick={handleExportReport}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Download size={14} /> Export Monitoring Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MONITORING SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function MonitorTile({ icon: Icon, label, value, tone = 'purple', subtitle }) {
  const tones = {
    purple:  { fg: 'text-brand-purple',  iconBg: 'bg-violet-100',  border: 'border-violet-200' },
    emerald: { fg: 'text-emerald-600',   iconBg: 'bg-emerald-100', border: 'border-emerald-200' },
    amber:   { fg: 'text-amber-600',     iconBg: 'bg-amber-100',   border: 'border-amber-200' },
    rose:    { fg: 'text-brand-magenta', iconBg: 'bg-rose-100',    border: 'border-rose-200' },
  };
  const t = tones[tone] || tones.purple;
  return (
    <div className={`rounded-2xl border-2 ${t.border} bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.iconBg} ${t.fg}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className={`mt-3 font-display text-2xl font-bold tabular-nums ${t.fg}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-brand-ink/75">{label}</p>
      {subtitle && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{subtitle}</p>}
    </div>
  );
}

function RateTile({ label, value, tone = 'purple' }) {
  const tones = {
    purple:  'text-brand-purple',
    emerald: 'text-emerald-600',
    amber:   'text-amber-600',
    rose:    'text-brand-magenta',
  };
  return (
    <div className="rounded-xl border border-brand-lilac bg-white p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${tones[tone]}`}>{value}%</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INFO HELPERS
   ═══════════════════════════════════════════════════════════════ */
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
      <p className="mt-1 truncate text-sm font-bold capitalize tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
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

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════ */
function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Megaphone size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No campaigns match your filters' : 'No campaigns yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button onClick={onClear} className="font-semibold text-brand-magenta hover:underline">
            Clear all filters
          </button>
        ) : (
          'Create your first campaign to start reaching leads.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onCreate}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={16} /> Create Campaign
        </button>
      )}
    </div>
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
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}