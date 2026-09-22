// src/pages/superadmin/Websites.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, ArrowRight, Globe, Search, Filter, X, MoreVertical,
  Trash2, Pencil, AlertCircle, Phone, Mail, TrendingUp, Building2,
  ShieldBan, ShieldCheck, Copy, Eye, Calendar, Users, MapPin,
  CreditCard, Activity, User, CheckCircle2, Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  WEBSITES as INITIAL_WEBSITES,
  AGENTS,
  LEADS,
  statsForWebsite,
} from '../../data/mockData';

const PLANS = ['Starter', 'Growth', 'Business'];
const STATUSES = ['Active', 'Trial', 'Blocked'];

export default function Websites() {
  const { setActiveWebsiteId } = useAuth();
  const navigate = useNavigate();

  /* ========== STATE ========== */
  const [allWebsites, setAllWebsites] = useState(INITIAL_WEBSITES);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planOpen, setPlanOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [viewingWebsite, setViewingWebsite] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* ========== FILTER ========== */
  const filteredWebsites = useMemo(() => {
    return allWebsites.filter((w) => {
      if (planFilter !== 'All' && w.plan !== planFilter) return false;
      if (statusFilter !== 'All' && w.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${w.name} ${w.ivrNumber} ${w.plan}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allWebsites, searchQuery, planFilter, statusFilter]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = allWebsites.length;
    const active = allWebsites.filter((w) => w.status === 'Active').length;
    const blocked = allWebsites.filter((w) => w.status === 'Blocked').length;
    const totalLeads = allWebsites.reduce(
      (sum, w) => sum + statsForWebsite(w.id).totalLeads,
      0
    );
    return { total, active, blocked, totalLeads };
  }, [allWebsites]);

  /* ========== ACTIONS ========== */
  const openWebsite = (id, status) => {
    if (status === 'Blocked') {
      alert('This website is blocked. Unblock it before opening the dashboard.');
      return;
    }
    setActiveWebsiteId(id);
    navigate('/superadmin/dashboard');
  };

  const handleAdd = (data) => {
    const newSite = {
      id: data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: data.name,
      ivrNumber: data.ivrNumber,
      plan: data.plan,
      status: data.status,
      expiresOn: data.expiresOn,
    };
    setAllWebsites((prev) => [...prev, newSite]);
    setShowAddModal(false);
  };

  const handleEdit = (id, updates) => {
    setAllWebsites((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
    setEditingWebsite(null);
  };

  const handleDelete = (id) => {
    setAllWebsites((prev) => prev.filter((w) => w.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
  };

  const handleToggleBlock = (id, currentStatus) => {
    const newStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
    setAllWebsites((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
    setMenuOpenId(null);
  };

  const handleCopyIvr = (ivr) => {
    navigator.clipboard?.writeText(ivr);
    setMenuOpenId(null);
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
            Websites
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Globe size={13} className="text-brand-purple" />
            Full control over every tenant on Eliteinova CRM.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus size={16} /> Add Website
        </button>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniStat label="Total Websites" value={summary.total} color="purple" />
        <MiniStat label="Active" value={summary.active} color="emerald" />
        <MiniStat label="Blocked" value={summary.blocked} color="rose" />
        <MiniStat label="Total Leads" value={summary.totalLeads} color="amber" />
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
            placeholder="Search by name, IVR, or plan..."
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
      {filteredWebsites.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onClear={clearFilters}
          onAdd={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredWebsites.map((w) => {
            const stats = statsForWebsite(w.id);
            const agentCount = AGENTS.filter((a) => a.websiteId === w.id).length;
            const isBlocked = w.status === 'Blocked';

            return (
              <div
                key={w.id}
                className={`card relative flex flex-col ${
                  isBlocked ? 'opacity-80 ring-1 ring-rose-200' : ''
                }`}
              >
                {/* Row 1 */}
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold text-brand-ink">
                      {w.name}
                    </p>
                    <p className="truncate text-xs text-brand-ink/50">
                      IVR: {w.ivrNumber}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      w.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : w.status === 'Trial'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {w.status}
                  </span>
                  <button
                    onClick={() =>
                      setMenuOpenId(menuOpenId === w.id ? null : w.id)
                    }
                    className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 hover:bg-brand-lilac"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {menuOpenId === w.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-3 top-14 z-20 w-52 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                        <MenuItem
                          icon={Eye}
                          label="View Details"
                          onClick={() => {
                            setViewingWebsite(w);
                            setMenuOpenId(null);
                          }}
                        />
                        <MenuItem
                          icon={Pencil}
                          label="Edit Details"
                          onClick={() => {
                            setEditingWebsite(w);
                            setMenuOpenId(null);
                          }}
                        />
                        <MenuItem
                          icon={Copy}
                          label="Copy IVR Number"
                          onClick={() => handleCopyIvr(w.ivrNumber)}
                        />
                        <MenuItem
                          icon={isBlocked ? ShieldCheck : ShieldBan}
                          label={isBlocked ? 'Unblock Website' : 'Block Website'}
                          onClick={() => handleToggleBlock(w.id, w.status)}
                        />
                        <div className="my-1 h-px bg-brand-lilac/60" />
                        <MenuItem
                          icon={Trash2}
                          label="Delete Website"
                          danger
                          onClick={() => {
                            setConfirmDelete(w);
                            setMenuOpenId(null);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-brand-mist p-2">
                    <p className="font-display text-sm font-semibold text-brand-ink">
                      {stats.totalLeads}
                    </p>
                    <p className="text-[10px] text-brand-ink/50">Leads</p>
                  </div>
                  <div className="rounded-xl bg-brand-mist p-2">
                    <p className="font-display text-sm font-semibold text-brand-ink">
                      {agentCount}
                    </p>
                    <p className="text-[10px] text-brand-ink/50">Agents</p>
                  </div>
                  <div className="rounded-xl bg-brand-mist p-2">
                    <p className="font-display text-sm font-semibold text-brand-ink">
                      {w.plan}
                    </p>
                    <p className="text-[10px] text-brand-ink/50">Plan</p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-brand-ink/40">
                  Expires {w.expiresOn}
                </p>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setViewingWebsite(w)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
                  >
                    <Eye size={14} /> Details
                  </button>
                  <button
                    onClick={() => openWebsite(w.id, w.status)}
                    disabled={isBlocked}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      isBlocked
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card hover:brightness-110'
                    }`}
                  >
                    {isBlocked ? (
                      <>
                        <ShieldBan size={14} /> Blocked
                      </>
                    ) : (
                      <>
                        Open <ArrowRight size={14} />
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
        <WebsiteModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {editingWebsite && (
        <WebsiteModal
          mode="edit"
          initial={editingWebsite}
          onClose={() => setEditingWebsite(null)}
          onSubmit={(data) => handleEdit(editingWebsite.id, data)}
        />
      )}

      {viewingWebsite && (
        <WebsiteDetailsDrawer
          website={viewingWebsite}
          onClose={() => setViewingWebsite(null)}
          onEdit={() => {
            setEditingWebsite(viewingWebsite);
            setViewingWebsite(null);
          }}
          onToggleBlock={() => {
            handleToggleBlock(viewingWebsite.id, viewingWebsite.status);
            setViewingWebsite(null);
          }}
          onOpen={() => openWebsite(viewingWebsite.id, viewingWebsite.status)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete website?"
          message={`This will permanently delete "${confirmDelete.name}" and all its data. This action cannot be undone.`}
          confirmLabel="Delete Website"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
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

/* ================= MINI STAT ================= */
function MiniStat({ label, value, color = 'purple' }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-500',
    amber: 'bg-amber-50 text-amber-500',
    rose: 'bg-rose-50 text-brand-magenta',
  };
  return (
    <div className="card flex items-center gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
      >
        <TrendingUp size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-brand-ink/50">{label}</p>
        <p className="font-display text-lg font-semibold text-brand-ink">
          {value}
        </p>
      </div>
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
        {hasFilters ? 'No websites match your filters' : 'No websites yet'}
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
          'Add your first tenant website to get started.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onAdd}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card"
        >
          <Plus size={16} /> Add Website
        </button>
      )}
    </div>
  );
}

/* ================= WEBSITE DETAILS DRAWER ================= */
function WebsiteDetailsDrawer({ website, onClose, onEdit, onToggleBlock, onOpen }) {
  const stats = statsForWebsite(website.id);
  const websiteAgents = AGENTS.filter((a) => a.websiteId === website.id);
  const websiteLeads = LEADS.filter((l) => l.websiteId === website.id);
  const isBlocked = website.status === 'Blocked';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {website.name}
              </h3>
              <p className="text-xs text-brand-ink/50">Full website overview</p>
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
          {/* Status + Plan + IVR */}
          <div className="grid grid-cols-3 gap-3">
            <InfoBox
              label="Status"
              value={website.status}
              color={
                website.status === 'Active'
                  ? 'emerald'
                  : website.status === 'Trial'
                  ? 'amber'
                  : 'rose'
              }
            />
            <InfoBox label="Plan" value={website.plan} color="purple" />
            <InfoBox label="Expires" value={website.expiresOn} color="purple" />
          </div>

          {/* Contact / IVR */}
          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Contact & IVR
            </h4>
            <InfoRow icon={Phone} label="IVR Number" value={website.ivrNumber} />
            <InfoRow
              icon={Mail}
              label="Support Email"
              value={`support@${website.id}.com`}
            />
            <InfoRow
              icon={MapPin}
              label="Region"
              value="India (IN-South)"
            />
          </div>

          {/* Usage / stats */}
          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Usage & Activity
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <UsageStat
                icon={Users}
                label="Total Agents"
                value={websiteAgents.length}
                max={50}
                used={websiteAgents.length}
              />
              <UsageStat
                icon={Activity}
                label="Total Leads"
                value={stats.totalLeads}
                max={10000}
                used={stats.totalLeads}
              />
              <UsageStat
                icon={CheckCircle2}
                label="Active Agents"
                value={stats.activeAgents}
                max={50}
                used={stats.activeAgents}
              />
              <UsageStat
                icon={Clock}
                label="Follow Ups"
                value={stats.followUp}
                max={100}
                used={stats.followUp}
              />
            </div>
          </div>

          {/* Recent Leads */}
          <div className="card !p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                Recent Leads
              </h4>
              <span className="text-xs text-brand-ink/50">
                {websiteLeads.length} total
              </span>
            </div>
            {websiteLeads.length === 0 ? (
              <p className="py-3 text-center text-xs text-brand-ink/40">
                No leads yet for this website.
              </p>
            ) : (
              <div className="space-y-2.5">
                {websiteLeads.slice(0, 4).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 p-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-lilac text-[10px] font-bold text-brand-purple">
                      {lead.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
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
                {websiteAgents.length} total
              </span>
            </div>
            {websiteAgents.length === 0 ? (
              <p className="py-3 text-center text-xs text-brand-ink/40">
                No agents assigned yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {websiteAgents.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 p-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                      {a.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
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
    purple: 'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className={`rounded-xl p-3 text-center ${colors[color]}`}>
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

/* ================= WEBSITE MODAL ================= */
function WebsiteModal({ mode = 'add', initial = {}, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    ivrNumber: initial.ivrNumber || '',
    plan: initial.plan || 'Starter',
    status: initial.status || 'Active',
    expiresOn: initial.expiresOn || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Website name is required.';
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
        ivrNumber: form.ivrNumber.trim(),
        plan: form.plan,
        status: form.status,
        expiresOn: form.expiresOn.trim(),
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {mode === 'add' ? 'Add Website' : 'Edit Website'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {mode === 'add'
                  ? 'Create a new tenant.'
                  : 'Update website details.'}
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
          <ModalInput
            label="Website Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g. Sunrise Realty"
            required
          />
          <ModalInput
            label="IVR Number"
            value={form.ivrNumber}
            onChange={(v) =>
              setForm({ ...form, ivrNumber: v.replace(/\D/g, '').slice(0, 10) })
            }
            placeholder="10-digit IVR number"
            icon={Phone}
            required
          />
          <ModalInput
            label="Expires On"
            value={form.expiresOn}
            onChange={(v) => setForm({ ...form, expiresOn: v })}
            placeholder="e.g. 30 Nov 2026"
            icon={Calendar}
            required
          />

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
                ? 'Add Website'
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