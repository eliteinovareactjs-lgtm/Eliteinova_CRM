// src/pages/superadmin/Admins.jsx
import { useMemo, useState } from 'react';
import {
  Plus, Search, X, MoreVertical, Mail, Clock, CheckCircle2, Pause,
  Trash2, Shield, Building2, Users, Activity, Eye, Pencil, AlertCircle,
  Phone, Calendar, TrendingUp, UserCog, Lock, Globe, Briefcase,
  Key, LogIn, Check, User as UserIcon, Layers, Award, TrendingDown,
} from 'lucide-react';
import { ADMINS as INITIAL_ADMINS, PROJECTS } from '../../data/mockData';

const STATUSES = ['Active', 'Inactive', 'Suspended'];
const ROLES = ['Project Admin', 'Supervisor', 'Moderator'];

export default function Admins() {
  const [allAdmins, setAllAdmins] = useState(INITIAL_ADMINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  /* ========== MODALS ========== */
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [viewingAdmin, setViewingAdmin] = useState(null);
  const [viewingActivityFor, setViewingActivityFor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* ========== FILTER ========== */
  const filtered = useMemo(() => {
    return allAdmins.filter((a) => {
      if (projectFilter !== 'All' && a.projectId !== projectFilter) return false;
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${a.name} ${a.email} ${a.username} ${a.phone || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allAdmins, projectFilter, statusFilter, searchQuery]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = allAdmins.length;
    const active = allAdmins.filter((a) => a.status === 'Active').length;
    const inactive = allAdmins.filter((a) => a.status === 'Inactive').length;
    const suspended = allAdmins.filter((a) => a.status === 'Suspended').length;
    return { total, active, inactive, suspended };
  }, [allAdmins]);

  /* ========== HELPERS ========== */
  const projectName = (id) => PROJECTS.find((p) => p.id === id)?.name || id;

  /* ========== ACTIONS ========== */
  const handleAdd = (data) => {
    const newAdmin = {
      id: 'admin-' + Date.now(),
      ...data,
      status: 'Active',
      lastLogin: 'Never',
      loginCount: 0,
    };
    setAllAdmins((prev) => [...prev, newAdmin]);
    setShowAddModal(false);
  };

  const handleEdit = (id, updates) => {
    setAllAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    setEditingAdmin(null);
  };

  const handleDelete = (id) => {
    setAllAdmins((prev) => prev.filter((a) => a.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
  };

  const handleToggleStatus = (id, status) => {
    const newStatus = status === 'Active' ? 'Inactive' : 'Active';
    setAllAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    setMenuOpenId(null);
  };

  /* ========== NEW: WORKING EMAIL ========== */
  const handleSendEmail = (admin) => {
    const subject = encodeURIComponent(`Eliteinova CRM — Message for ${admin.name}`);
    const body = encodeURIComponent(
      `Hi ${admin.name},\n\n\n\nBest regards,\nEliteinova Super Admin`
    );
    window.location.href = `mailto:${admin.email}?subject=${subject}&body=${body}`;
  };

  /* ========== NEW: WORKING ACTIVITY ========== */
  const handleViewActivity = (admin) => {
    setViewingActivityFor(admin);
  };

  const hasFilters =
    searchQuery || projectFilter !== 'All' || statusFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setProjectFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Administrators
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Shield size={13} className="text-brand-purple" />
            Manage project-level admins across the platform.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
        >
          <Plus size={16} className="transition-transform group-hover:rotate-90 duration-300" />
          Add Admin
        </button>
      </div>

      {/* ================= SUMMARY STAT CARDS (matches Projects page style) ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total Admins"
          value={summary.total}
          sub="Across all projects"
          icon={Users}
          color="purple"
          trend="+3"
          trendUp
        />
        <AnimatedStatCard
          label="Active"
          value={summary.active}
          sub={`of ${summary.total} admins`}
          icon={Activity}
          color="emerald"
          trend="+8%"
          trendUp
        />
        <AnimatedStatCard
          label="Inactive"
          value={summary.inactive}
          sub="Not currently active"
          icon={Pause}
          color="amber"
          trend="+1"
          trendUp
        />
        <AnimatedStatCard
          label="Suspended"
          value={summary.suspended}
          sub="Require attention"
          icon={Shield}
          color="rose"
          trend="-1"
          trendUp={false}
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
            placeholder="Search by name, email, username..."
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

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
        >
          <option value="All">All Projects</option>
          {PROJECTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="relative">
          <button
            onClick={() => setStatusOpen((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
          >
            <Shield size={14} className="text-brand-purple" />
            Status: <span className="text-brand-purple">{statusFilter}</span>
          </button>
          {statusOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStatusOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                {['All', ...STATUSES].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setStatusOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      statusFilter === s
                        ? 'bg-brand-lilac font-semibold text-brand-purple'
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

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ================= ADMIN GRID ================= */}
      {filtered.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onClear={clearFilters}
          onAdd={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((admin) => (
            <div
              key={admin.id}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)] ${
                admin.status === 'Suspended'
                  ? 'border-rose-200 hover:border-rose-300'
                  : 'border-brand-lilac/80 hover:border-brand-purple/50'
              }`}
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${
                  admin.status === 'Suspended'
                    ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                    : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                }`}
              />
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-purple/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex flex-col p-5">
                {/* Row 1 */}
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                      admin.status === 'Suspended'
                        ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                        : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
                    }`}
                  >
                    {admin.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-brand-ink">
                      {admin.name}
                    </p>
                    <p className="truncate text-xs text-brand-ink/50">
                      @{admin.username}
                    </p>
                    <p className="truncate text-xs text-brand-ink/40">
                      {admin.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      admin.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : admin.status === 'Inactive'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {admin.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() =>
                      setMenuOpenId(menuOpenId === admin.id ? null : admin.id)
                    }
                    className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-lilac"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {menuOpenId === admin.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-3 top-14 z-20 w-48 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel animate-dropdown">
                        <MenuItem
                          icon={Eye}
                          label="View Profile"
                          onClick={() => {
                            setViewingAdmin(admin);
                            setMenuOpenId(null);
                          }}
                        />
                        <MenuItem
                          icon={Pencil}
                          label="Edit Details"
                          onClick={() => {
                            setEditingAdmin(admin);
                            setMenuOpenId(null);
                          }}
                        />
                        <MenuItem
                          icon={Key}
                          label="Reset Password"
                          onClick={() => {
                            alert(`Password reset link sent to ${admin.email}`);
                            setMenuOpenId(null);
                          }}
                        />
                        <MenuItem
                          icon={admin.status === 'Active' ? Pause : CheckCircle2}
                          label={admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleStatus(admin.id, admin.status)}
                        />
                        <div className="my-1 h-px bg-brand-lilac/60" />
                        <MenuItem
                          icon={Trash2}
                          label="Remove"
                          danger
                          onClick={() => {
                            setConfirmDelete(admin);
                            setMenuOpenId(null);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Row 2: Project info */}
                <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-brand-ink/50">
                      <Building2 size={11} /> Project
                    </span>
                    <span className="truncate font-semibold text-brand-ink">
                      {projectName(admin.projectId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-brand-ink/50">
                      <Shield size={11} /> Role
                    </span>
                    <span className="truncate font-semibold text-brand-ink">
                      {admin.role || 'Project Admin'}
                    </span>
                  </div>
                  {admin.phone && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-brand-ink/50">
                        <Phone size={11} /> Phone
                      </span>
                      <span className="truncate font-mono font-medium text-brand-ink">
                        {admin.phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Row 3: Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <MetricPill
                    label="Last Login"
                    value={admin.lastLogin}
                    color="purple"
                  />
                  <MetricPill
                    label="Logins"
                    value={admin.loginCount || 0}
                    color="emerald"
                  />
                </div>

                {/* Row 4: Action buttons */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setViewingAdmin(admin)}
                    className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                  >
                    <Eye size={13} className="transition-transform group-hover/btn:scale-110" />
                    View
                  </button>
                  <button
                    onClick={() => setEditingAdmin(admin)}
                    className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                  >
                    <Pencil size={13} className="transition-transform group-hover/btn:scale-110" />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(admin)}
                    className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white py-2.5 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-50"
                  >
                    <Trash2 size={13} className="transition-transform group-hover/btn:scale-110" />
                    Delete
                  </button>
                </div>

                {/* Row 5: Working Email + Activity buttons */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSendEmail(admin)}
                    className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                  >
                    <Mail size={13} className="transition-transform group-hover/btn:scale-110" />
                    Email
                  </button>
                  <button
                    onClick={() => handleViewActivity(admin)}
                    className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                  >
                    <Clock size={13} className="transition-transform group-hover/btn:scale-110" />
                    Activity
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODALS ================= */}
      {showAddModal && (
        <AdminModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {editingAdmin && (
        <AdminModal
          mode="edit"
          initial={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSubmit={(data) => handleEdit(editingAdmin.id, data)}
        />
      )}

      {viewingAdmin && (
        <AdminDetailsDrawer
          admin={viewingAdmin}
          onClose={() => setViewingAdmin(null)}
          onEdit={() => {
            setEditingAdmin(viewingAdmin);
            setViewingAdmin(null);
          }}
          onSendEmail={handleSendEmail}
        />
      )}

      {viewingActivityFor && (
        <ActivityDrawer
          admin={viewingActivityFor}
          onClose={() => setViewingActivityFor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Remove admin?"
          message={`This will permanently remove "${confirmDelete.name}" from the platform. This action cannot be undone.`}
          confirmLabel="Remove Admin"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
      )}
    </div>
  );
}

/* ================= ANIMATED STAT CARD (matches Projects page) ================= */
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
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div
      className={`rounded-lg border p-2 transition-transform duration-300 hover:scale-105 ${colors[color]}`}
    >
      <p className="truncate font-display text-xs font-bold">{value}</p>
      <p className="text-[9px] font-semibold uppercase opacity-70">{label}</p>
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
function EmptyState({ hasFilters, onClear, onAdd }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <Shield size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No admins match your filters' : 'No admins yet'}
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
          'Add your first admin to get started.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onAdd}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card"
        >
          <Plus size={16} /> Add Admin
        </button>
      )}
    </div>
  );
}

/* ================= ACTIVITY DRAWER ================= */
function ActivityDrawer({ admin, onClose }) {
  const activities = [
    { id: 1, action: 'Logged in', detail: 'From Chennai, IN · Chrome on Windows', time: 'Today, 10:24 AM', color: 'emerald' },
    { id: 2, action: 'Edited lead', detail: 'Lead #LG-0042 — Updated status to Follow Up', time: 'Today, 10:15 AM', color: 'purple' },
    { id: 3, action: 'Created campaign', detail: 'Campaign "Q3 Outreach"', time: 'Yesterday, 4:32 PM', color: 'amber' },
    { id: 4, action: 'Assigned agent', detail: 'Agent1 → Project ' + admin.projectId, time: 'Yesterday, 2:10 PM', color: 'purple' },
    { id: 5, action: 'Logged in', detail: 'From Chennai, IN · Chrome on Windows', time: '3 days ago, 9:00 AM', color: 'emerald' },
    { id: 6, action: 'Exported report', detail: 'Leads report (Sep 1 – Sep 15)', time: '4 days ago, 3:45 PM', color: 'rose' },
    { id: 7, action: 'Logged in', detail: 'From Chennai, IN · Safari on iPhone', time: '5 days ago, 7:20 PM', color: 'emerald' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
              {admin.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Activity Log
              </h3>
              <p className="text-xs text-brand-ink/50">
                {admin.name} · @{admin.username}
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
            <InfoBox label="Total Logins" value={admin.loginCount || 0} color="purple" />
            <InfoBox label="Actions (30d)" value={activities.length} color="emerald" />
            <InfoBox label="Last Active" value="Today" color="amber" />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
              Recent Activity
            </p>

            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-brand-lilac" />

              <div className="space-y-3">
                {activities.map((a) => {
                  const colors = {
                    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
                    purple: 'bg-violet-100 text-brand-purple border-violet-200',
                    amber: 'bg-amber-100 text-amber-600 border-amber-200',
                    rose: 'bg-rose-100 text-rose-500 border-rose-200',
                  };
                  return (
                    <div key={a.id} className="relative flex items-start gap-3">
                      <span
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${colors[a.color]}`}
                      >
                        <Activity size={12} />
                      </span>
                      <div className="min-w-0 flex-1 rounded-xl border border-brand-lilac/60 bg-white p-3">
                        <p className="text-sm font-semibold text-brand-ink">
                          {a.action}
                        </p>
                        <p className="mt-0.5 text-xs text-brand-ink/60">
                          {a.detail}
                        </p>
                        <p className="mt-1 text-[10px] text-brand-ink/40">
                          {a.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ADMIN DETAILS DRAWER ================= */
function AdminDetailsDrawer({ admin, onClose, onEdit, onSendEmail }) {
  const project = PROJECTS.find((p) => p.id === admin.projectId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                admin.status === 'Suspended'
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                  : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
              }`}
            >
              <span className="text-sm font-bold">
                {admin.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {admin.name}
              </h3>
              <p className="text-xs text-brand-ink/50">@{admin.username}</p>
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
              value={admin.status}
              color={
                admin.status === 'Active'
                  ? 'emerald'
                  : admin.status === 'Inactive'
                  ? 'amber'
                  : 'rose'
              }
            />
            <InfoBox
              label="Role"
              value={admin.role || 'Project Admin'}
              color="purple"
            />
            <InfoBox
              label="Project"
              value={project?.code || '—'}
              color="purple"
            />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Contact Information
            </h4>
            <InfoRow icon={Mail} label="Email" value={admin.email} />
            <InfoRow icon={Phone} label="Phone" value={admin.phone || '—'} />
            <InfoRow icon={UserIcon} label="Username" value={admin.username} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Assigned Project
            </h4>
            {project ? (
              <div className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                  {project.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {project.name}
                  </p>
                  <p className="truncate text-xs text-brand-ink/50">
                    {project.businessType || 'General'}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    project.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-600'
                      : project.status === 'Trial'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {project.status}
                </span>
              </div>
            ) : (
              <p className="text-xs text-brand-ink/40">No project assigned.</p>
            )}
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Login Activity
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <UsageStat
                icon={LogIn}
                label="Total Logins"
                value={admin.loginCount || 0}
                max={200}
                used={admin.loginCount || 0}
              />
              <UsageStat
                icon={Clock}
                label="Sessions This Week"
                value={12}
                max={30}
                used={12}
              />
            </div>
            <InfoRow icon={Clock} label="Last Login" value={admin.lastLogin} />
          </div>

          <div className="card !p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                Permissions
              </h4>
              <button className="text-xs font-semibold text-brand-purple hover:underline">
                Manage
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'View Leads', enabled: true },
                { label: 'Edit Leads', enabled: true },
                { label: 'Manage Agents', enabled: true },
                { label: 'View Reports', enabled: true },
                { label: 'Export Data', enabled: false },
                { label: 'Manage Admins', enabled: false },
              ].map((p) => (
                <div
                  key={p.label}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                    p.enabled
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}
                >
                  <span className="font-medium">{p.label}</span>
                  {p.enabled && <Check size={12} />}
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <Pencil size={14} /> Edit Admin
              </button>
              <button
                onClick={() => onSendEmail(admin)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                <Mail size={14} /> Send Email
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

/* ================= ADMIN MODAL ================= */
function AdminModal({ mode = 'add', initial = {}, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    username: initial.username || '',
    email: initial.email || '',
    phone: initial.phone || '',
    projectId: initial.projectId || PROJECTS[0].id,
    role: initial.role || 'Project Admin',
    status: initial.status || 'Active',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.username.trim()) return 'Username is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return 'Please enter a valid email.';
    if (form.phone && !/^[0-9]{10}$/.test(form.phone))
      return 'Phone must be exactly 10 digits.';
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
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        projectId: form.projectId,
        role: form.role,
        status: form.status,
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {mode === 'add' ? 'Add Administrator' : 'Edit Administrator'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {mode === 'add'
                  ? 'Create a new project admin account.'
                  : 'Update admin details and permissions.'}
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
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="e.g. Admin"
              icon={UserIcon}
              required
            />
            <ModalInput
              label="Username"
              value={form.username}
              onChange={(v) =>
                setForm({ ...form, username: v.replace(/\s/g, '').slice(0, 20) })
              }
              placeholder="e.g. 620472"
              icon={UserCog}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="admin@eliteinova.com"
              icon={Mail}
              required
            />
            <ModalInput
              label="Phone"
              value={form.phone}
              onChange={(v) =>
                setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) })
              }
              placeholder="10-digit mobile number"
              icon={Phone}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Assigned Project
            </label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Role
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 min-w-[110px] rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    form.role === r
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {r}
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
                ? 'Add Admin'
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