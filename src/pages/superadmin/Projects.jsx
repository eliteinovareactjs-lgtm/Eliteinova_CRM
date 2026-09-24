// src/pages/superadmin/Projects.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, ArrowRight, Globe, Search, Filter, X, MoreVertical,
  Trash2, Pencil, AlertCircle, Phone, Mail, TrendingUp, Building2,
  ShieldBan, ShieldCheck, Copy, Eye, Calendar, Users, MapPin,
  Activity, CheckCircle2, Clock, UserCog, Briefcase, Link2, Layers,
  LayoutDashboard, Target, RefreshCw, Sparkles, Zap, TrendingDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  PROJECTS as INITIAL_PROJECTS,
  AGENTS,
  LEADS,
  ADMINS,
  CALLS,
  FOLLOW_UPS,
  statsForProject,
} from '../../data/mockData';

const PLANS = ['Starter', 'Growth', 'Business'];
const STATUSES = ['Active', 'Trial', 'Blocked'];
const BUSINESS_TYPES = [
  'Matrimony Services',
  'Real Estate',
  'Insurance',
  'Education',
  'Healthcare',
  'E-commerce',
  'Other',
];

export default function Projects() {
  const { setActiveWebsiteId } = useAuth();
  const navigate = useNavigate();

  /* ========== STATE ========== */
  const [allProjects, setAllProjects] = useState(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planOpen, setPlanOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* ========== FILTER ========== */
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      if (planFilter !== 'All' && p.plan !== planFilter) return false;
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${p.name} ${p.code} ${p.ivrNumber} ${p.plan} ${p.domain || ''} ${p.businessType || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allProjects, searchQuery, planFilter, statusFilter]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = allProjects.length;
    const active = allProjects.filter((p) => p.status === 'Active').length;
    const trial = allProjects.filter((p) => p.status === 'Trial').length;
    const blocked = allProjects.filter((p) => p.status === 'Blocked').length;
    const totalLeads = allProjects.reduce(
      (sum, p) => sum + statsForProject(p.id).totalLeads,
      0
    );
    const totalAgents = AGENTS.length;
    return { total, active, trial, blocked, totalLeads, totalAgents };
  }, [allProjects]);

  /* ========== HELPERS ========== */
  const adminName = (adminId) =>
    ADMINS.find((a) => a.id === adminId)?.name || 'Unassigned';

  /* ========== ACTIONS ========== */
  const handleAdd = (data) => {
    const newProject = {
      id: data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      ...data,
    };
    setAllProjects((prev) => [...prev, newProject]);
    setShowAddModal(false);
  };

  const handleEdit = (id, updates) => {
    setAllProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    setEditingProject(null);
  };

  const handleDelete = (id) => {
    setAllProjects((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
  };

  const handleToggleBlock = (id, currentStatus) => {
    const newStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
    setAllProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    setMenuOpenId(null);
  };

  const handleCopyIvr = (ivr) => {
    navigator.clipboard?.writeText(ivr);
    setMenuOpenId(null);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setMenuOpenId(null);
  };

  const handleOpenDashboard = (p) => {
    if (p.status === 'Blocked') {
      alert('This project is blocked. Unblock it before opening the dashboard.');
      return;
    }
    setActiveWebsiteId(p.id);
    navigate('/superadmin/dashboard');
  };

  const hasFilters =
    searchQuery || planFilter !== 'All' || statusFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setPlanFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Projects
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Globe size={13} className="text-brand-purple" />
            Manage every project running on Eliteinova CRM.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
        >
          <Plus size={16} className="transition-transform group-hover:rotate-90 duration-300" />
          Add Project
        </button>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <AnimatedStatCard
          label="Total Projects"
          value={summary.total}
          sub={`${summary.active} currently active`}
          icon={Building2}
          color="purple"
          trend="+12%"
          trendUp
        />
        <AnimatedStatCard
          label="Active"
          value={summary.active}
          sub={`of ${summary.total} projects`}
          icon={Activity}
          color="emerald"
          trend="+8%"
          trendUp
        />
        <AnimatedStatCard
          label="Trial"
          value={summary.trial}
          sub="Pending conversion"
          icon={Clock}
          color="amber"
          trend="+2 new"
          trendUp
        />
        <AnimatedStatCard
          label="Blocked"
          value={summary.blocked}
          sub="Require attention"
          icon={ShieldBan}
          color="rose"
          trend="-1"
          trendUp={false}
        />
        <AnimatedStatCard
          label="Total Leads"
          value={summary.totalLeads}
          sub={`${summary.totalAgents} agents`}
          icon={Layers}
          color="purple"
          trend="+18%"
          trendUp
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
            placeholder="Search by name, code, IVR, or domain..."
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

        <DropdownFilter
          label="Plan"
          value={planFilter}
          options={['All', ...PLANS]}
          open={planOpen}
          onToggle={() => {
            setPlanOpen((s) => !s);
            setStatusOpen(false);
          }}
          onChange={(v) => {
            setPlanFilter(v);
            setPlanOpen(false);
          }}
        />

        <DropdownFilter
          label="Status"
          value={statusFilter}
          options={['All', ...STATUSES]}
          open={statusOpen}
          onToggle={() => {
            setStatusOpen((s) => !s);
            setPlanOpen(false);
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
      </div>

      {/* ================= GRID ================= */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onClear={clearFilters}
          onAdd={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((p) => {
            const stats = statsForProject(p.id);
            const agentCount = AGENTS.filter((a) => a.websiteId === p.id).length;
            const projectCalls = CALLS.filter((c) => c.projectId === p.id).length;
            const projectFollowUps = FOLLOW_UPS.filter((f) => f.projectId === p.id).length;
            const isBlocked = p.status === 'Blocked';

            return (
              <div
                key={p.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)] ${
                  isBlocked
                    ? 'border-rose-200 hover:border-rose-300'
                    : 'border-brand-lilac/80 hover:border-brand-purple/50'
                }`}
              >
                {/* Top gradient accent */}
                <span
                  className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${
                    isBlocked
                      ? 'from-rose-500 to-rose-400'
                      : 'from-brand-purple to-brand-magenta'
                  } transition-transform duration-500 group-hover:scale-x-100`}
                />

                {/* Soft hover glow */}
                <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-purple/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex flex-col p-5">
                  {/* Row 1: Logo + Name + Status + Menu */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                        isBlocked
                          ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                          : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
                      }`}
                    >
                      <Building2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold text-brand-ink">
                        {p.name}
                      </p>
                      <p className="truncate text-xs text-brand-ink/50">
                        {p.code ? `${p.code} • ` : ''}
                        {p.businessType || 'General'}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        p.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : p.status === 'Trial'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === p.id ? null : p.id)
                      }
                      className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-lilac"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {menuOpenId === p.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpenId(null)}
                        />
                        <div className="absolute right-3 top-14 z-20 w-52 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel animate-dropdown">
                          <MenuItem
                            icon={Eye}
                            label="View Details"
                            onClick={() => {
                              setViewingProject(p);
                              setMenuOpenId(null);
                            }}
                          />
                          <MenuItem
                            icon={Pencil}
                            label="Edit Details"
                            onClick={() => {
                              setEditingProject(p);
                              setMenuOpenId(null);
                            }}
                          />
                          <MenuItem
                            icon={LayoutDashboard}
                            label="Open Dashboard"
                            onClick={() => {
                              handleOpenDashboard(p);
                              setMenuOpenId(null);
                            }}
                          />
                          <MenuItem
                            icon={Copy}
                            label="Copy IVR"
                            onClick={() => handleCopyIvr(p.ivrNumber)}
                          />
                          <MenuItem
                            icon={Copy}
                            label="Copy Code"
                            onClick={() => handleCopyCode(p.code || '')}
                          />
                          <MenuItem
                            icon={isBlocked ? ShieldCheck : ShieldBan}
                            label={isBlocked ? 'Unblock' : 'Block'}
                            onClick={() => handleToggleBlock(p.id, p.status)}
                          />
                          <div className="my-1 h-px bg-brand-lilac/60" />
                          <MenuItem
                            icon={Trash2}
                            label="Delete Project"
                            danger
                            onClick={() => {
                              setConfirmDelete(p);
                              setMenuOpenId(null);
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Row 2: Info list */}
                  <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-brand-ink/50">
                        <Link2 size={11} /> Domain
                      </span>
                      <span className="truncate font-medium text-brand-ink">
                        {p.domain || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-brand-ink/50">
                        <UserCog size={11} /> Admin
                      </span>
                      <span className="truncate font-medium text-brand-ink">
                        {adminName(p.assignedAdminId)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-brand-ink/50">
                        <Phone size={11} /> IVR
                      </span>
                      <span className="truncate font-mono font-medium text-brand-ink">
                        {p.ivrNumber}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Metrics */}
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <MetricPill label="Leads" value={stats.totalLeads} color="rose" />
                    <MetricPill label="Agents" value={agentCount} color="purple" />
                    <MetricPill label="Calls" value={projectCalls} color="emerald" />
                    <MetricPill label="Follow" value={projectFollowUps} color="amber" />
                  </div>

                  {/* Row 4: Expiry */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-ink/50">
                    <Calendar size={11} />
                    Expires {p.expiresOn}
                  </div>

                  {/* Row 5: Action buttons */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setViewingProject(p)}
                      className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                    >
                      <Eye size={13} className="transition-transform group-hover/btn:scale-110" />
                      View
                    </button>
                    <button
                      onClick={() => setEditingProject(p)}
                      className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                    >
                      <Pencil size={13} className="transition-transform group-hover/btn:scale-110" />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(p)}
                      className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white py-2.5 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-50"
                    >
                      <Trash2 size={13} className="transition-transform group-hover/btn:scale-110" />
                      Delete
                    </button>
                  </div>

                  {/* Row 6: Open Dashboard */}
                  <button
                    onClick={() => handleOpenDashboard(p)}
                    disabled={isBlocked}
                    className={`group/btn mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      isBlocked
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
                    }`}
                  >
                    {isBlocked ? (
                      <>
                        <ShieldBan size={14} /> Blocked
                      </>
                    ) : (
                      <>
                        Open Dashboard
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover/btn:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODALS ================= */}
      {showAddModal && (
        <ProjectModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {editingProject && (
        <ProjectModal
          mode="edit"
          initial={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={(data) => handleEdit(editingProject.id, data)}
        />
      )}

      {viewingProject && (
        <ProjectDetailsDrawer
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          onEdit={() => {
            setEditingProject(viewingProject);
            setViewingProject(null);
          }}
          onToggleBlock={() => {
            handleToggleBlock(viewingProject.id, viewingProject.status);
            setViewingProject(null);
          }}
          onOpen={() => handleOpenDashboard(viewingProject)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete project?"
          message={`This will permanently delete "${confirmDelete.name}" and all its data. This action cannot be undone.`}
          confirmLabel="Delete Project"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
      )}
    </div>
  );
}

/* ================= ANIMATED STAT CARD (with proper borders) ================= */
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
      {/* Gradient background on hover */}
      <span
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Animated top bar */}
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`}
      />

      {/* Soft glow */}
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

        <p
          className={`mt-3 font-display text-3xl font-bold leading-tight ${t.valueColor}`}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ================= METRIC PILL ================= */
function MetricPill({ label, value, color }) {
  const colors = {
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };
  return (
    <div
      className={`rounded-lg border p-2 transition-transform duration-300 hover:scale-105 ${colors[color]}`}
    >
      <p className="font-display text-sm font-bold">{value}</p>
      <p className="text-[10px] opacity-70">{label}</p>
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

/* ================= DROPDOWN FILTER ================= */
function DropdownFilter({ label, value, options, open, onToggle, onChange }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        <Filter size={14} className="text-brand-purple" />
        {label}: <span className="text-brand-purple">{value}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === o
                    ? 'bg-brand-lilac font-semibold text-brand-purple'
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

/* ================= EMPTY STATE ================= */
function EmptyState({ hasFilters, onClear, onAdd }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <Globe size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No projects match your filters' : 'No projects yet'}
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
          'Add your first project to get started.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onAdd}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card"
        >
          <Plus size={16} /> Add Project
        </button>
      )}
    </div>
  );
}

/* ================= PROJECT DETAILS DRAWER ================= */
function ProjectDetailsDrawer({ project, onClose, onEdit, onToggleBlock, onOpen }) {
  const stats = statsForProject(project.id);
  const projectAgents = AGENTS.filter((a) => a.websiteId === project.id);
  const projectLeads = LEADS.filter((l) => l.websiteId === project.id);
  const projectCalls = CALLS.filter((c) => c.projectId === project.id);
  const projectFollowUps = FOLLOW_UPS.filter((f) => f.projectId === project.id);
  const assignedAdmin = ADMINS.find((a) => a.id === project.assignedAdminId);
  const isBlocked = project.status === 'Blocked';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                isBlocked
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                  : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
              }`}
            >
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {project.name}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {project.code ? `${project.code} • ` : ''}
                {project.businessType || 'Project'}
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

        {/* Body */}
        <div className="space-y-5 p-5">
          {/* Status + Plan + Expires */}
          <div className="grid grid-cols-3 gap-3">
            <InfoBox
              label="Status"
              value={project.status}
              color={
                project.status === 'Active'
                  ? 'emerald'
                  : project.status === 'Trial'
                  ? 'amber'
                  : 'rose'
              }
            />
            <InfoBox label="Plan" value={project.plan} color="purple" />
            <InfoBox label="Expires" value={project.expiresOn} color="purple" />
          </div>

          {/* Business Info */}
          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Business Information
            </h4>
            <InfoRow icon={Briefcase} label="Business Type" value={project.businessType || '—'} />
            <InfoRow icon={Link2} label="Domain" value={project.domain || '—'} />
            <InfoRow icon={Clock} label="Business Hours" value={project.businessHours || '—'} />
            <InfoRow icon={Globe} label="Timezone" value={project.timezone || '—'} />
          </div>

          {/* Contact & IVR */}
          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Contact & IVR
            </h4>
            <InfoRow icon={Phone} label="IVR Number" value={project.ivrNumber} />
            <InfoRow
              icon={Mail}
              label="Contact Email"
              value={project.contactEmail || `support@${project.id}.com`}
            />
            <InfoRow
              icon={Phone}
              label="Contact Phone"
              value={project.contactPhone || '—'}
            />
          </div>

          {/* Assigned Admin */}
          <div className="card !p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                Assigned Admin
              </h4>
              <button className="text-xs font-semibold text-brand-purple hover:underline">
                Change
              </button>
            </div>
            {assignedAdmin ? (
              <div className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-xs font-bold text-white">
                  {assignedAdmin.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {assignedAdmin.name}
                  </p>
                  <p className="truncate text-xs text-brand-ink/50">
                    {assignedAdmin.email}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    assignedAdmin.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {assignedAdmin.status}
                </span>
              </div>
            ) : (
              <p className="text-xs text-brand-ink/40">No admin assigned yet.</p>
            )}
          </div>

          {/* Usage & Activity */}
          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Usage & Activity
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <UsageStat icon={Users} label="Total Agents" value={projectAgents.length} max={50} used={projectAgents.length} />
              <UsageStat icon={Activity} label="Total Leads" value={stats.totalLeads} max={10000} used={stats.totalLeads} />
              <UsageStat icon={Phone} label="Total Calls" value={projectCalls.length} max={500} used={projectCalls.length} />
              <UsageStat icon={Clock} label="Follow-Ups" value={projectFollowUps.length} max={100} used={projectFollowUps.length} />
            </div>
          </div>

          {/* Recent Leads */}
          <div className="card !p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                Recent Leads
              </h4>
              <span className="text-xs text-brand-ink/50">
                {projectLeads.length} total
              </span>
            </div>
            {projectLeads.length === 0 ? (
              <p className="py-3 text-center text-xs text-brand-ink/40">
                No leads yet for this project.
              </p>
            ) : (
              <div className="space-y-2.5">
                {projectLeads.slice(0, 4).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 p-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-lilac text-[10px] font-bold text-brand-purple">
                      {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {lead.name}
                      </p>
                      <p className="truncate text-xs text-brand-ink/50">
                        {lead.mobile}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        lead.status === 'Won'
                          ? 'bg-emerald-100 text-emerald-600'
                          : lead.status === 'Missed'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agents preview */}
          <div className="card !p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                Agents
              </h4>
              <span className="text-xs text-brand-ink/50">
                {projectAgents.length} total
              </span>
            </div>
            {projectAgents.length === 0 ? (
              <p className="py-3 text-center text-xs text-brand-ink/40">
                No agents assigned yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {projectAgents.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 p-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                      {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {a.name}
                      </p>
                      <p className="truncate text-xs text-brand-ink/50">
                        {a.phone}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        a.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={onToggleBlock}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold ${
                  isBlocked
                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    : 'border-rose-200 text-rose-500 hover:bg-rose-50'
                }`}
              >
                {isBlocked ? (
                  <>
                    <ShieldCheck size={14} /> Unblock
                  </>
                ) : (
                  <>
                    <ShieldBan size={14} /> Block
                  </>
                )}
              </button>
              <button
                onClick={onOpen}
                disabled={isBlocked}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold ${
                  isBlocked
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                    : 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card hover:brightness-110'
                }`}
              >
                Open <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
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
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
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
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div className="rounded-xl border border-brand-lilac/70 p-3">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-purple">
          <Icon size={14} />
        </span>
        <span className="font-display text-lg font-bold text-brand-ink">
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

/* ================= PROJECT MODAL ================= */
function ProjectModal({ mode = 'add', initial = {}, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    code: initial.code || '',
    businessType: initial.businessType || BUSINESS_TYPES[0],
    domain: initial.domain || '',
    contactEmail: initial.contactEmail || '',
    contactPhone: initial.contactPhone || '',
    ivrNumber: initial.ivrNumber || '',
    plan: initial.plan || 'Starter',
    status: initial.status || 'Active',
    expiresOn: initial.expiresOn || '',
    assignedAdminId: initial.assignedAdminId || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Project name is required.';
    if (!form.code.trim()) return 'Project code is required.';
    if (!form.ivrNumber.trim()) return 'IVR number is required.';
    if (!/^[0-9]{10}$/.test(form.ivrNumber.trim()))
      return 'IVR must be exactly 10 digits.';
    if (!form.expiresOn.trim()) return 'Expiry date is required.';
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
        code: form.code.trim(),
        businessType: form.businessType,
        domain: form.domain.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        ivrNumber: form.ivrNumber.trim(),
        plan: form.plan,
        status: form.status,
        expiresOn: form.expiresOn.trim(),
        assignedAdminId: form.assignedAdminId,
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {mode === 'add' ? 'Add Project' : 'Edit Project'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {mode === 'add'
                  ? 'Create a new tenant project.'
                  : 'Update project details.'}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="Project Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="e.g. Matrimony CRM"
              required
            />
            <ModalInput
              label="Project Code"
              value={form.code}
              onChange={(v) =>
                setForm({ ...form, code: v.toUpperCase().slice(0, 6) })
              }
              placeholder="e.g. MAT"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Business Type
              </label>
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              >
                {BUSINESS_TYPES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <ModalInput
              label="Domain"
              value={form.domain}
              onChange={(v) => setForm({ ...form, domain: v })}
              placeholder="e.g. matrimony.eliteinova.com"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(v) => setForm({ ...form, contactEmail: v })}
              placeholder="contact@domain.com"
              icon={Mail}
            />
            <ModalInput
              label="Contact Phone"
              value={form.contactPhone}
              onChange={(v) =>
                setForm({
                  ...form,
                  contactPhone: v.replace(/\D/g, '').slice(0, 10),
                })
              }
              placeholder="10-digit mobile number"
              icon={Phone}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="IVR Number"
              value={form.ivrNumber}
              onChange={(v) =>
                setForm({
                  ...form,
                  ivrNumber: v.replace(/\D/g, '').slice(0, 10),
                })
              }
              placeholder="10-digit IVR number"
              icon={Phone}
              required
            />
            <ModalInput
              label="Expires On"
              type="date"
              value={form.expiresOn}
              onChange={(v) => setForm({ ...form, expiresOn: v })}
              icon={Calendar}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Assigned Admin
            </label>
            <select
              value={form.assignedAdminId}
              onChange={(e) =>
                setForm({ ...form, assignedAdminId: e.target.value })
              }
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              <option value="">Unassigned</option>
              {ADMINS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Plan
            </label>
            <div className="flex gap-2">
              {PLANS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, plan: p })}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    form.plan === p
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
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
              {STATUSES.map((s) => (
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
                : mode === 'add'
                ? 'Add Project'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
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