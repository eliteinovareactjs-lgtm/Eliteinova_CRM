// src/pages/superadmin/Campaigns.jsx
import { useMemo, useState } from 'react';
import {
  Plus, Megaphone, TrendingUp, Users, Target, Pause, Play, X, Search,
  Filter, Building2, ChevronDown, MoreVertical, Eye, Pencil, Trash2,
  Calendar, Clock, PhoneCall, Headphones, Percent, Check, AlertCircle,
  CheckCircle2, Download, UserCheck, Layers, Tag, ClipboardList,
  PlayCircle, PauseCircle, Copy, BarChart3, TrendingDown, Award,
  DollarSign, Timer, ListFilter, RefreshCw, FileText, Settings,
  Repeat, Zap, Star, Radio, Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CAMPAIGNS as INITIAL_CAMPAIGNS,
  PROJECTS,
  AGENTS,
  LEADS,
} from '../../data/mockData';

const STATUSES = ['Active', 'Paused', 'Completed', 'Draft'];
const LEAD_SOURCES = ['Website', 'Referral', 'Campaign', 'Walk-in', 'Social Media', 'Other', 'IVR', 'WhatsApp'];
const LEAD_CATEGORIES = ['Matrimony', 'Property', 'Insurance', 'Education', 'Healthcare', 'Other', 'IVR Inbound', 'Campaign'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Campaigns() {
  const { role, activeWebsiteId } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  /* ========== LOCAL DATA ========== */
  const [allCampaigns, setAllCampaigns] = useState(
    INITIAL_CAMPAIGNS.map((c) => ({
      ...c,
      status: c.status || 'Draft',
      leadSource: c.leadSource || 'All',
      leadCategory: c.leadCategory || 'All',
      agentIds: c.agentIds || AGENTS.slice(0, 2).map((a) => a.id),
      callingHours: c.callingHours || { from: '09:00', to: '18:00' },
      callingDays: c.callingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      retryRules: c.retryRules || {
        maxAttempts: 3,
        intervalHours: 24,
        retryOnNoAnswer: true,
      },
      responses: c.responses || Math.round(c.connected * 0.4),
      followUpsGenerated:
        c.followUpsGenerated || Math.round(c.interested * 0.6),
    }))
  );

  /* ========== FILTERS ========== */
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  /* ========== UI STATE ========== */
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  /* ========== MODALS / DRAWERS ========== */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [viewingLeadsFor, setViewingLeadsFor] = useState(null);
  const [viewingAgentsFor, setViewingAgentsFor] = useState(null);
  const [viewingReportFor, setViewingReportFor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  /* ========== HELPERS ========== */
  const projectName = (id) =>
    PROJECTS.find((p) => p.id === id)?.name || id;

  const agentName = (id) => AGENTS.find((a) => a.id === id)?.name || 'Agent';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ========== FILTERED ========== */
  const filtered = useMemo(() => {
    let rows = isSuperAdmin
      ? projectFilter === 'All'
        ? allCampaigns
        : allCampaigns.filter((c) => c.projectId === projectFilter)
      : allCampaigns.filter((c) => c.projectId === activeWebsiteId);

    if (statusFilter !== 'All')
      rows = rows.filter((c) => c.status === statusFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((c) => {
        const hay = `${c.name} ${c.projectId} ${c.leadSource} ${c.leadCategory}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return rows;
  }, [
    allCampaigns,
    isSuperAdmin,
    activeWebsiteId,
    projectFilter,
    statusFilter,
    searchQuery,
  ]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((c) => c.status === 'Active').length;
    const paused = filtered.filter((c) => c.status === 'Paused').length;
    const totalLeads = filtered.reduce((s, c) => s + (c.leads || 0), 0);
    const totalCalls = filtered.reduce((s, c) => s + (c.calls || 0), 0);
    const totalConnected = filtered.reduce((s, c) => s + (c.connected || 0), 0);
    const totalInterested = filtered.reduce(
      (s, c) => s + (c.interested || 0),
      0
    );
    const totalConverted = filtered.reduce((s, c) => s + (c.converted || 0), 0);
    const totalResponses = filtered.reduce((s, c) => s + (c.responses || 0), 0);
    const totalFollowUps = filtered.reduce(
      (s, c) => s + (c.followUpsGenerated || 0),
      0
    );
    const conversion =
      totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;
    return {
      total,
      active,
      paused,
      totalLeads,
      totalCalls,
      totalConnected,
      totalInterested,
      totalConverted,
      totalResponses,
      totalFollowUps,
      conversion,
    };
  }, [filtered]);

  /* ========== ACTIONS ========== */
  const handleCreate = (data) => {
    const newCampaign = {
      id: 'CMP-' + String(Date.now()).slice(-5),
      name: data.name,
      projectId: data.projectId,
      leads: 0,
      calls: 0,
      connected: 0,
      interested: 0,
      converted: 0,
      responses: 0,
      followUpsGenerated: 0,
      status: data.status || 'Draft',
      startDate: data.startDate,
      endDate: data.endDate,
      leadSource: data.leadSource,
      leadCategory: data.leadCategory,
      agentIds: data.agentIds,
      callingHours: data.callingHours,
      callingDays: data.callingDays,
      retryRules: data.retryRules,
    };
    setAllCampaigns((prev) => [newCampaign, ...prev]);
    setShowCreateModal(false);
    showToast(`Campaign "${data.name}" created`);
  };

  const handleEdit = (id, updates) => {
    setAllCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    setEditingCampaign(null);
    showToast('Campaign updated');
  };

  const handleDelete = (id) => {
    setAllCampaigns((prev) => prev.filter((c) => c.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
    showToast('Campaign deleted', 'error');
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    setAllCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setMenuOpenId(null);
    showToast(
      newStatus === 'Active' ? 'Campaign resumed' : 'Campaign paused',
      newStatus === 'Active' ? 'success' : 'error'
    );
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast('No campaigns to export', 'error');
      return;
    }
    const rows = [
      ['ID', 'Name', 'Project', 'Status', 'Leads', 'Calls', 'Connected', 'Interested', 'Converted', 'Start', 'End'],
      ...filtered.map((c) => [
        c.id,
        c.name,
        projectName(c.projectId),
        c.status,
        c.leads,
        c.calls,
        c.connected,
        c.interested,
        c.converted,
        c.startDate,
        c.endDate,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaigns-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} campaigns`);
  };

  const hasFilters =
    searchQuery || statusFilter !== 'All' || projectFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setProjectFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Campaigns
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Megaphone size={13} className="text-brand-purple" />
            Create, monitor, and control calling campaigns across projects.
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
            onClick={() => setShowCreateModal(true)}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus
              size={14}
              className="transition-transform group-hover:rotate-90 duration-300"
            />
            Create Campaign
          </button>
        </div>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total Campaigns"
          value={summary.total}
          sub={`${summary.active} active · ${summary.paused} paused`}
          icon={Megaphone}
          color="purple"
          trend="+3"
          trendUp
        />
        <AnimatedStatCard
          label="Total Leads"
          value={summary.totalLeads}
          sub={`${summary.totalCalls} calls made`}
          icon={Users}
          color="emerald"
          trend="+18%"
          trendUp
        />
        <AnimatedStatCard
          label="Converted"
          value={summary.totalConverted}
          sub={`${summary.conversion}% conversion rate`}
          icon={Target}
          color="amber"
          trend="+6"
          trendUp
        />
        <AnimatedStatCard
          label="Interested"
          value={summary.totalInterested}
          sub={`${summary.totalResponses} total responses`}
          icon={Star}
          color="rose"
          trend="+12"
          trendUp
        />
      </div>

      {/* ================= SECONDARY STATS ================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MiniStatCard
          label="Connected Calls"
          value={summary.totalConnected}
          icon={Headphones}
          color="emerald"
        />
        <MiniStatCard
          label="Follow-ups Generated"
          value={summary.totalFollowUps}
          icon={ClipboardList}
          color="purple"
        />
        <MiniStatCard
          label="Avg Conversion"
          value={`${summary.conversion}%`}
          icon={Percent}
          color="amber"
        />
        <MiniStatCard
          label="Active Agents"
          value={new Set(filtered.flatMap((c) => c.agentIds || [])).size}
          icon={Users}
          color="rose"
        />
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by campaign name, project, source..."
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
            onClick={() => setViewMode('grid')}
            className={`rounded-lg border p-1.5 ${
              viewMode === 'grid'
                ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
            }`}
            title="Grid view"
          >
            <Megaphone size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg border p-1.5 ${
              viewMode === 'list'
                ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
            }`}
            title="List view"
          >
            <ListFilter size={14} />
          </button>
        </div>
      </div>

      {/* ================= CAMPAIGNS ================= */}
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
              projectName={projectName}
              agentName={agentName}
              onView={() => setViewingCampaign(c)}
              onEdit={() => setEditingCampaign(c)}
              onToggle={() => handleToggleStatus(c.id, c.status)}
              onLeads={() => setViewingLeadsFor(c)}
              onAgents={() => setViewingAgentsFor(c)}
              onReport={() => setViewingReportFor(c)}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              onDelete={() => {
                setConfirmDelete(c);
                setMenuOpenId(null);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <CampaignRow
              key={c.id}
              campaign={c}
              projectName={projectName}
              agentName={agentName}
              onView={() => setViewingCampaign(c)}
              onEdit={() => setEditingCampaign(c)}
              onToggle={() => handleToggleStatus(c.id, c.status)}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              onLeads={() => setViewingLeadsFor(c)}
              onAgents={() => setViewingAgentsFor(c)}
              onReport={() => setViewingReportFor(c)}
              onDelete={() => {
                setConfirmDelete(c);
                setMenuOpenId(null);
              }}
            />
          ))}
        </div>
      )}

      {/* ================= MODALS / DRAWERS ================= */}
      {showCreateModal && (
        <CampaignModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingCampaign && (
        <CampaignModal
          mode="edit"
          initial={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSubmit={(data) => handleEdit(editingCampaign.id, data)}
        />
      )}

      {viewingCampaign && (
        <CampaignDetailsDrawer
          campaign={viewingCampaign}
          projectName={projectName}
          agentName={agentName}
          onClose={() => setViewingCampaign(null)}
          onEdit={() => {
            setEditingCampaign(viewingCampaign);
            setViewingCampaign(null);
          }}
          onLeads={() => {
            setViewingLeadsFor(viewingCampaign);
            setViewingCampaign(null);
          }}
          onAgents={() => {
            setViewingAgentsFor(viewingCampaign);
            setViewingCampaign(null);
          }}
          onReport={() => {
            setViewingReportFor(viewingCampaign);
            setViewingCampaign(null);
          }}
          onToggle={() => {
            handleToggleStatus(viewingCampaign.id, viewingCampaign.status);
            setViewingCampaign(null);
          }}
        />
      )}

      {viewingLeadsFor && (
        <CampaignLeadsDrawer
          campaign={viewingLeadsFor}
          onClose={() => setViewingLeadsFor(null)}
        />
      )}

      {viewingAgentsFor && (
        <CampaignAgentsDrawer
          campaign={viewingAgentsFor}
          agentName={agentName}
          onClose={() => setViewingAgentsFor(null)}
        />
      )}

      {viewingReportFor && (
        <CampaignReportDrawer
          campaign={viewingReportFor}
          projectName={projectName}
          onClose={() => setViewingReportFor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete campaign?"
          message={`This will permanently delete "${confirmDelete.name}" and all its data. This action cannot be undone.`}
          confirmLabel="Delete Campaign"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
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
      <span
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`}
      />
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
          >
            <Icon size={18} />
          </span>
          {trend && (
            <span
              className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                trendUp
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-rose-200 bg-rose-50 text-rose-500'
              }`}
            >
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
    <div
      className={`flex items-center gap-3 rounded-xl border-2 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}
    >
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
function DropdownFilter({
  label,
  icon: Icon,
  value,
  options,
  displayOptions,
  open,
  onToggle,
  onChange,
}) {
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
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === o
                    ? 'bg-brand-lilac font-semibold text-brand-purple'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
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

/* ================= CAMPAIGN CARD ================= */
function CampaignCard({
  campaign: c,
  projectName,
  agentName,
  onView,
  onEdit,
  onToggle,
  onLeads,
  onAgents,
  onReport,
  menuOpenId,
  setMenuOpenId,
  onDelete,
}) {
  const conversionRate =
    c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0;
  const connectionRate =
    c.calls > 0 ? Math.round((c.connected / c.calls) * 100) : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-purple/50 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)]">
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-purple to-brand-magenta transition-transform duration-500 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-purple/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-col p-5">
        {/* Row 1: Icon + Name + Status + Menu */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            <Megaphone size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-semibold text-brand-ink">
              {c.name}
            </p>
            <p className="truncate text-xs text-brand-ink/50">
              {projectName(c.projectId)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              c.status === 'Active'
                ? 'bg-emerald-100 text-emerald-600'
                : c.status === 'Paused'
                ? 'bg-amber-100 text-amber-600'
                : c.status === 'Completed'
                ? 'bg-violet-100 text-brand-purple'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {c.status.toUpperCase()}
          </span>
          <div className="relative">
            <button
              onClick={() =>
                setMenuOpenId(menuOpenId === c.id ? null : c.id)
              }
              className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-lilac"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpenId === c.id && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpenId(null)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                  <MenuItem icon={Eye} label="View Details" onClick={onView} />
                  <MenuItem icon={Pencil} label="Edit Campaign" onClick={onEdit} />
                  <MenuItem icon={Layers} label="Campaign Leads" onClick={onLeads} />
                  <MenuItem icon={Users} label="Campaign Agents" onClick={onAgents} />
                  <MenuItem icon={BarChart3} label="Campaign Report" onClick={onReport} />
                  <MenuItem
                    icon={c.status === 'Active' ? PauseCircle : PlayCircle}
                    label={
                      c.status === 'Active'
                        ? 'Pause Campaign'
                        : 'Resume Campaign'
                    }
                    onClick={onToggle}
                  />
                  <MenuItem
                    icon={Copy}
                    label="Duplicate"
                    onClick={() => {
                      navigator.clipboard?.writeText(c.name);
                      setMenuOpenId(null);
                    }}
                  />
                  <div className="my-1 h-px bg-brand-lilac/60" />
                  <MenuItem
                    icon={Trash2}
                    label="Delete"
                    danger
                    onClick={onDelete}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Info panel */}
        <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-brand-ink/50">
              <Calendar size={11} /> Duration
            </span>
            <span className="truncate font-semibold text-brand-ink">
              {c.startDate} → {c.endDate}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-brand-ink/50">
              <Clock size={11} /> Calling Hours
            </span>
            <span className="truncate font-semibold text-brand-ink">
              {c.callingHours?.from} – {c.callingHours?.to}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-brand-ink/50">
              <Users size={11} /> Agents
            </span>
            <span className="truncate font-semibold text-brand-ink">
              {c.agentIds?.length || 0} assigned
            </span>
          </div>
        </div>

        {/* Row 3: Metrics */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <MetricPill label="Leads" value={c.leads} color="purple" />
          <MetricPill label="Calls" value={c.calls} color="emerald" />
          <MetricPill label="Interested" value={c.interested} color="amber" />
          <MetricPill label="Converted" value={c.converted} color="rose" />
        </div>

        {/* Row 4: Progress */}
        <div className="mt-3 space-y-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="text-brand-ink/50">Conversion rate</span>
              <span className="font-semibold tabular-nums text-emerald-600">
                {conversionRate}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${Math.min(conversionRate, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="text-brand-ink/50">Connection rate</span>
              <span className="font-semibold tabular-nums text-brand-purple">
                {connectionRate}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                style={{ width: `${Math.min(connectionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Row 5: Action buttons */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
          >
            <Eye size={13} />
            View
          </button>
          <button
            onClick={onReport}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
          >
            <BarChart3 size={13} />
            Report
          </button>
          <button
            onClick={onToggle}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white shadow-card transition-all hover:brightness-110 ${
              c.status === 'Active'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
            }`}
          >
            {c.status === 'Active' ? (
              <>
                <Pause size={13} /> Pause
              </>
            ) : (
              <>
                <Play size={13} /> Start
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= CAMPAIGN ROW (LIST VIEW) ================= */
function CampaignRow({
  campaign: c,
  projectName,
  agentName,
  onView,
  onEdit,
  onToggle,
  menuOpenId,
  setMenuOpenId,
  onLeads,
  onAgents,
  onReport,
  onDelete,
}) {
  const conversionRate =
    c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0;

  return (
    <div className="group flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-sm">
        <Megaphone size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">{c.name}</p>
        <p className="truncate text-xs text-brand-ink/50">
          {projectName(c.projectId)}
        </p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="text-brand-ink/40">Leads</p>
        <p className="font-semibold tabular-nums text-brand-ink">{c.leads}</p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="text-brand-ink/40">Calls</p>
        <p className="font-semibold tabular-nums text-brand-ink">{c.calls}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="text-brand-ink/40">Conversion</p>
        <p className="font-semibold tabular-nums text-emerald-600">
          {conversionRate}%
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
          c.status === 'Active'
            ? 'bg-emerald-100 text-emerald-600'
            : c.status === 'Paused'
            ? 'bg-amber-100 text-amber-600'
            : c.status === 'Completed'
            ? 'bg-violet-100 text-brand-purple'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {c.status.toUpperCase()}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple sm:flex"
        >
          <Eye size={13} />
        </button>
        <button
          onClick={onToggle}
          className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold text-white shadow-card hover:brightness-110 ${
            c.status === 'Active'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
          }`}
        >
          {c.status === 'Active' ? (
            <>
              <Pause size={12} /> Pause
            </>
          ) : (
            <>
              <Play size={12} /> Start
            </>
          )}
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
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpenId(null)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={Eye} label="View Details" onClick={onView} />
                <MenuItem icon={Pencil} label="Edit Campaign" onClick={onEdit} />
                <MenuItem icon={Layers} label="Campaign Leads" onClick={onLeads} />
                <MenuItem icon={Users} label="Campaign Agents" onClick={onAgents} />
                <MenuItem icon={BarChart3} label="Campaign Report" onClick={onReport} />
                <div className="my-1 h-px bg-brand-lilac/60" />
                <MenuItem icon={Trash2} label="Delete" danger onClick={onDelete} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= METRIC PILL (FIXED ALIGNMENT) ================= */
function MetricPill({ label, value, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div
      className={`flex min-h-[58px] flex-col items-center justify-center rounded-lg border px-1.5 py-2 text-center transition-transform duration-300 hover:scale-105 ${colors[color]}`}
    >
      <p className="font-display text-base font-bold leading-tight tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-0.5 text-[9px] font-semibold uppercase leading-tight tracking-wide opacity-70">
        {label}
      </p>
    </div>
  );
}

/* ================= MENU ITEM ================= */
function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
        danger
          ? 'text-rose-500 hover:bg-rose-50'
          : 'text-brand-ink/70 hover:bg-brand-lilac/40'
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

/* ================= EMPTY STATE ================= */
function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <Megaphone size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No campaigns match your filters' : 'No campaigns yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button
            onClick={onClear}
            className="font-semibold text-brand-purple hover:underline"
          >
            Clear all filters
          </button>
        ) : (
          'Create your first campaign to start reaching leads.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onCreate}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card"
        >
          <Plus size={16} /> Create Campaign
        </button>
      )}
    </div>
  );
}

/* ================= CAMPAIGN MODAL ================= */
function CampaignModal({ mode = 'create', initial = {}, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    name: initial.name || '',
    projectId: initial.projectId || PROJECTS[0].id,
    status: initial.status || 'Draft',
    startDate: initial.startDate || new Date().toISOString().slice(0, 10),
    endDate: initial.endDate || '',
    leadSource: initial.leadSource || 'All',
    leadCategory: initial.leadCategory || 'All',
    agentIds: initial.agentIds || [],
    callingHours: initial.callingHours || { from: '09:00', to: '18:00' },
    callingDays: initial.callingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    retryRules: initial.retryRules || {
      maxAttempts: 3,
      intervalHours: 24,
      retryOnNoAnswer: true,
    },
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Campaign name is required.';
    if (!form.startDate) return 'Start date is required.';
    if (!form.endDate) return 'End date is required.';
    if (form.endDate < form.startDate)
      return 'End date must be after start date.';
    if (form.agentIds.length === 0) return 'Select at least one agent.';
    if (form.callingDays.length === 0) return 'Select at least one calling day.';
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
      onSubmit({
        name: form.name.trim(),
        projectId: form.projectId,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        leadSource: form.leadSource,
        leadCategory: form.leadCategory,
        agentIds: form.agentIds,
        callingHours: form.callingHours,
        callingDays: form.callingDays,
        retryRules: form.retryRules,
      });
    }, 300);
  };

  const toggleAgent = (id) => {
    setForm((f) => ({
      ...f,
      agentIds: f.agentIds.includes(id)
        ? f.agentIds.filter((a) => a !== id)
        : [...f.agentIds, id],
    }));
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      callingDays: f.callingDays.includes(day)
        ? f.callingDays.filter((d) => d !== day)
        : [...f.callingDays, day],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Megaphone size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {isEdit ? 'Edit Campaign' : 'Create Campaign'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {isEdit
                  ? 'Update campaign details, schedule and agents.'
                  : 'Configure a new campaign end-to-end.'}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Basic Info */}
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
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Assign Project
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
          </div>

          {/* Section 2: Lead Database */}
          <SectionTitle icon={Layers} label="Lead Database" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Lead Source
              </label>
              <select
                value={form.leadSource}
                onChange={(e) =>
                  setForm({ ...form, leadSource: e.target.value })
                }
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              >
                <option value="All">All Sources</option>
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Lead Category
              </label>
              <select
                value={form.leadCategory}
                onChange={(e) =>
                  setForm({ ...form, leadCategory: e.target.value })
                }
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              >
                <option value="All">All Categories</option>
                {LEAD_CATEGORIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Agents */}
          <SectionTitle icon={Users} label="Assign Agents" />
          <div className="rounded-xl border border-brand-lilac bg-white p-3">
            {AGENTS.length === 0 ? (
              <p className="py-3 text-center text-xs text-brand-ink/40">
                No agents available.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {AGENTS.map((a) => {
                  const selected = form.agentIds.includes(a.id);
                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => toggleAgent(a.id)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                        selected
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-brand-lilac bg-white text-brand-ink/70 hover:bg-brand-lilac/30'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                          selected
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-brand-lilac'
                        }`}
                      >
                        {selected && <Check size={12} />}
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                        {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{a.name}</p>
                        <p className="truncate text-[10px] opacity-70">
                          {a.phone} · {a.status}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-[10px] text-brand-ink/50">
              {form.agentIds.length} agent
              {form.agentIds.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Section 4: Schedule */}
          <SectionTitle icon={Calendar} label="Calling Schedule" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(v) => setForm({ ...form, startDate: v })}
              icon={Calendar}
              required
            />
            <ModalInput
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(v) => setForm({ ...form, endDate: v })}
              icon={Calendar}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="Calling Hours From"
              type="time"
              value={form.callingHours.from}
              onChange={(v) =>
                setForm({
                  ...form,
                  callingHours: { ...form.callingHours, from: v },
                })
              }
              icon={Clock}
            />
            <ModalInput
              label="Calling Hours To"
              type="time"
              value={form.callingHours.to}
              onChange={(v) =>
                setForm({
                  ...form,
                  callingHours: { ...form.callingHours, to: v },
                })
              }
              icon={Clock}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Calling Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const active = form.callingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                      active
                        ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                        : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Retry Rules */}
          <SectionTitle icon={Repeat} label="Retry Rules" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Max Retry Attempts
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.retryRules.maxAttempts}
                onChange={(e) =>
                  setForm({
                    ...form,
                    retryRules: {
                      ...form.retryRules,
                      maxAttempts: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Interval (hours)
              </label>
              <input
                type="number"
                min={1}
                value={form.retryRules.intervalHours}
                onChange={(e) =>
                  setForm({
                    ...form,
                    retryRules: {
                      ...form.retryRules,
                      intervalHours: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-lilac bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={form.retryRules.retryOnNoAnswer}
              onChange={(e) =>
                setForm({
                  ...form,
                  retryRules: {
                    ...form.retryRules,
                    retryOnNoAnswer: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 rounded border-brand-lilac text-brand-purple focus:ring-brand-purple/30"
            />
            <span className="text-sm font-semibold text-brand-ink/70">
              Retry on no-answer
            </span>
          </label>

          {/* Section 6: Status */}
          <SectionTitle icon={Zap} label="Status" />
          <div className="flex flex-wrap gap-2">
            {['Draft', 'Active', 'Paused'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, status: s })}
                className={`min-w-[100px] flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                  form.status === s
                    ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                    : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="sticky bottom-0 -mx-6 flex gap-2 border-t border-brand-lilac bg-white px-6 pt-4">
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
                : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= SECTION TITLE ================= */
function SectionTitle({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 border-b border-brand-lilac/60 pb-1.5">
      <Icon size={14} className="text-brand-purple" />
      <h4 className="text-xs font-bold uppercase tracking-wide text-brand-ink/60">
        {label}
      </h4>
    </div>
  );
}

/* ================= MODAL INPUT ================= */
function ModalInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  required,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-purple/60"
          />
        )}
        <input
          type={type}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-brand-lilac bg-white py-2.5 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15`}
        />
      </div>
    </div>
  );
}

/* ================= CAMPAIGN DETAILS DRAWER ================= */
function CampaignDetailsDrawer({
  campaign: c,
  projectName,
  agentName,
  onClose,
  onEdit,
  onLeads,
  onAgents,
  onReport,
  onToggle,
}) {
  const conversionRate =
    c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0;
  const connectionRate =
    c.calls > 0 ? Math.round((c.connected / c.calls) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Megaphone size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {c.name}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {projectName(c.projectId)}
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

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox
              label="Status"
              value={c.status}
              color={
                c.status === 'Active'
                  ? 'emerald'
                  : c.status === 'Paused'
                  ? 'amber'
                  : 'purple'
              }
            />
            <InfoBox label="Leads" value={c.leads} color="purple" />
            <InfoBox label="Calls" value={c.calls} color="emerald" />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Schedule
            </h4>
            <InfoRow icon={Calendar} label="Start Date" value={c.startDate} />
            <InfoRow icon={Calendar} label="End Date" value={c.endDate} />
            <InfoRow
              icon={Clock}
              label="Calling Hours"
              value={`${c.callingHours?.from} – ${c.callingHours?.to}`}
            />
            <InfoRow
              icon={Calendar}
              label="Calling Days"
              value={c.callingDays?.join(', ') || '—'}
            />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Lead Database
            </h4>
            <InfoRow icon={Tag} label="Source" value={c.leadSource} />
            <InfoRow
              icon={ClipboardList}
              label="Category"
              value={c.leadCategory}
            />
          </div>

          <div className="card !p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                Assigned Agents
              </h4>
              <button
                onClick={onAgents}
                className="text-xs font-semibold text-brand-purple hover:underline"
              >
                View All
              </button>
            </div>
            {c.agentIds?.length === 0 ? (
              <p className="text-xs text-brand-ink/40">No agents assigned.</p>
            ) : (
              <div className="space-y-2">
                {c.agentIds?.slice(0, 4).map((id) => {
                  const name = agentName(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 p-2.5"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                        {name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Retry Rules
            </h4>
            <InfoRow
              icon={Repeat}
              label="Max Attempts"
              value={c.retryRules?.maxAttempts || 0}
            />
            <InfoRow
              icon={Timer}
              label="Interval"
              value={`${c.retryRules?.intervalHours || 0} hours`}
            />
            <InfoRow
              icon={RefreshCw}
              label="Retry on No-Answer"
              value={c.retryRules?.retryOnNoAnswer ? 'Yes' : 'No'}
            />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Performance
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <UsageStat
                icon={PhoneCall}
                label="Connected"
                value={c.connected}
                max={c.calls || 1}
                used={c.connected}
              />
              <UsageStat
                icon={Star}
                label="Interested"
                value={c.interested}
                max={c.connected || 1}
                used={c.interested}
              />
              <UsageStat
                icon={Target}
                label="Converted"
                value={c.converted}
                max={c.interested || 1}
                used={c.converted}
              />
              <UsageStat
                icon={ClipboardList}
                label="Follow-ups"
                value={c.followUpsGenerated || 0}
                max={c.interested || 1}
                used={c.followUpsGenerated || 0}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <InfoBox
                label="Connection"
                value={`${connectionRate}%`}
                color="purple"
              />
              <InfoBox
                label="Conversion"
                value={`${conversionRate}%`}
                color="emerald"
              />
              <InfoBox
                label="Responses"
                value={c.responses || 0}
                color="amber"
              />
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={onLeads}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <Layers size={14} /> Leads
              </button>
              <button
                onClick={onReport}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <BarChart3 size={14} /> Report
              </button>
              <button
                onClick={onToggle}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110 ${
                  c.status === 'Active'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                }`}
              >
                {c.status === 'Active' ? (
                  <>
                    <Pause size={14} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={14} /> Start
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= CAMPAIGN LEADS DRAWER ================= */
function CampaignLeadsDrawer({ campaign, onClose }) {
  const matchedLeads = LEADS.filter((l) => {
    if (l.websiteId !== campaign.projectId) return false;
    if (campaign.leadSource !== 'All' && l.leadSource !== campaign.leadSource)
      return false;
    if (
      campaign.leadCategory !== 'All' &&
      l.category !== campaign.leadCategory
    )
      return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Layers size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Campaign Leads
              </h3>
              <p className="text-xs text-brand-ink/50">
                {matchedLeads.length} matching · {campaign.name}
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

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox
              label="Matched"
              value={matchedLeads.length}
              color="purple"
            />
            <InfoBox
              label="Fresh"
              value={matchedLeads.filter((l) => l.status === 'Fresh').length}
              color="emerald"
            />
            <InfoBox
              label="Follow Up"
              value={
                matchedLeads.filter((l) => l.status === 'Follow Up').length
              }
              color="amber"
            />
          </div>

          <div className="card !p-4 space-y-2">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Filter Criteria
            </h4>
            <InfoRow icon={Tag} label="Source" value={campaign.leadSource} />
            <InfoRow
              icon={ClipboardList}
              label="Category"
              value={campaign.leadCategory}
            />
          </div>

          {matchedLeads.length === 0 ? (
            <p className="py-6 text-center text-xs text-brand-ink/40">
              No leads match this campaign's criteria yet.
            </p>
          ) : (
            <div className="space-y-2">
              {matchedLeads.slice(0, 20).map((l) => (
                <div
                  key={l.id}
                  className="rounded-xl border border-brand-lilac bg-white p-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-lilac text-[10px] font-bold text-brand-purple">
                      {l.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {l.name}
                      </p>
                      <p className="truncate text-xs text-brand-ink/50">
                        {l.mobile}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        l.status === 'Won'
                          ? 'bg-emerald-100 text-emerald-600'
                          : l.status === 'Missed'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= CAMPAIGN AGENTS DRAWER ================= */
function CampaignAgentsDrawer({ campaign, agentName, onClose }) {
  const assignedAgents = (campaign.agentIds || [])
    .map((id) => AGENTS.find((a) => a.id === id))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Campaign Agents
              </h3>
              <p className="text-xs text-brand-ink/50">
                {assignedAgents.length} agents assigned
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

        <div className="space-y-4 p-5">
          {assignedAgents.length === 0 ? (
            <p className="py-6 text-center text-xs text-brand-ink/40">
              No agents assigned to this campaign.
            </p>
          ) : (
            <div className="space-y-2">
              {assignedAgents.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
                    {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">
                      {a.name}
                    </p>
                    <p className="truncate text-xs text-brand-ink/50">
                      {a.phone} · {a.leadsAssigned} leads · {a.callsToday}{' '}
                      calls today
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      a.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : a.status === 'Break'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= CAMPAIGN REPORT DRAWER ================= */
function CampaignReportDrawer({ campaign: c, projectName, onClose }) {
  const conversionRate =
    c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0;
  const connectionRate =
    c.calls > 0 ? Math.round((c.connected / c.calls) * 100) : 0;
  const responseRate =
    c.connected > 0 ? Math.round((c.responses / c.connected) * 100) : 0;
  const interestRate =
    c.connected > 0 ? Math.round((c.interested / c.connected) * 100) : 0;

  const funnel = [
    { label: 'Total Leads', value: c.leads, color: 'purple', pct: 100 },
    {
      label: 'Calls Made',
      value: c.calls,
      color: 'purple',
      pct: c.leads > 0 ? (c.calls / c.leads) * 100 : 0,
    },
    {
      label: 'Connected',
      value: c.connected,
      color: 'emerald',
      pct: c.leads > 0 ? (c.connected / c.leads) * 100 : 0,
    },
    {
      label: 'Responses',
      value: c.responses || 0,
      color: 'emerald',
      pct: c.leads > 0 ? ((c.responses || 0) / c.leads) * 100 : 0,
    },
    {
      label: 'Interested',
      value: c.interested,
      color: 'amber',
      pct: c.leads > 0 ? (c.interested / c.leads) * 100 : 0,
    },
    {
      label: 'Follow-ups',
      value: c.followUpsGenerated || 0,
      color: 'amber',
      pct: c.leads > 0 ? ((c.followUpsGenerated || 0) / c.leads) * 100 : 0,
    },
    {
      label: 'Converted',
      value: c.converted,
      color: 'rose',
      pct: c.leads > 0 ? (c.converted / c.leads) * 100 : 0,
    },
  ];

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Campaign', c.name],
      ['Project', projectName(c.projectId)],
      ['Status', c.status],
      ['Start Date', c.startDate],
      ['End Date', c.endDate],
      ['Total Leads', c.leads],
      ['Calls Made', c.calls],
      ['Connected', c.connected],
      ['Interested', c.interested],
      ['Converted', c.converted],
      ['Responses', c.responses || 0],
      ['Follow-ups Generated', c.followUpsGenerated || 0],
      ['Connection Rate', `${connectionRate}%`],
      ['Conversion Rate', `${conversionRate}%`],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-report-${c.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <BarChart3 size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Campaign Report
              </h3>
              <p className="text-xs text-brand-ink/50">{c.name}</p>
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
            <InfoBox label="Leads" value={c.leads} color="purple" />
            <InfoBox label="Converted" value={c.converted} color="emerald" />
            <InfoBox
              label="Conversion"
              value={`${conversionRate}%`}
              color="amber"
            />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Conversion Funnel
            </h4>
            <div className="space-y-2.5">
              {funnel.map((step) => (
                <div key={step.label}>
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-brand-ink/70">
                      {step.label}
                    </span>
                    <span className="font-bold tabular-nums text-brand-ink">
                      {step.value} ({Math.round(step.pct)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                    <div
                      className={`h-full rounded-full ${
                        step.color === 'emerald'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : step.color === 'amber'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                          : step.color === 'rose'
                          ? 'bg-gradient-to-r from-brand-magenta to-brand-purple'
                          : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                      }`}
                      style={{ width: `${Math.min(step.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Performance Rates
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <RateBox
                label="Connection Rate"
                value={connectionRate}
                color="purple"
              />
              <RateBox
                label="Response Rate"
                value={responseRate}
                color="emerald"
              />
              <RateBox
                label="Interest Rate"
                value={interestRate}
                color="amber"
              />
              <RateBox
                label="Conversion Rate"
                value={conversionRate}
                color="rose"
              />
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <button
              onClick={handleExport}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Download size={14} /> Export Report (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= RATE BOX ================= */
function RateBox({ label, value, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <p className="text-[10px] font-semibold uppercase opacity-70">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">
        {value}%
      </p>
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
        {type === 'error' ? (
          <AlertCircle size={16} />
        ) : (
          <CheckCircle2 size={16} />
        )}
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

function UsageStat({ icon: Icon, label, value, used, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  return (
    <div className="rounded-xl border border-brand-lilac/70 p-3">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-purple">
          <Icon size={14} />
        </span>
        <span className="font-display text-lg font-bold tabular-nums text-brand-ink">
          {value}
        </span>
      </div>
      <p className="mt-1.5 text-[10px] text-brand-ink/50">{label}</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-brand-lilac">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}