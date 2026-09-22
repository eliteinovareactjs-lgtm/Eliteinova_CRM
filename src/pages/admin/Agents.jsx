// src/pages/admin/Agents.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Phone, Users2, Search, Filter, MoreVertical, Mail,
  CheckCircle2, Pause, X, Trash2, AlertCircle, TrendingUp,
  Target, Activity, Clock, Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AGENTS as INITIAL_AGENTS, LEADS } from '../../data/mockData';

export default function Agents() {
  const { activeWebsiteId, activeWebsite } = useAuth();
  const navigate = useNavigate();

  const [allAgents, setAllAgents] = useState(INITIAL_AGENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  /* ========== SCOPED AGENTS ========== */
  const websiteAgents = useMemo(
    () => allAgents.filter((a) => a.websiteId === activeWebsiteId),
    [allAgents, activeWebsiteId]
  );

  /* ========== FILTERED ========== */
  const filteredAgents = useMemo(() => {
    return websiteAgents.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${a.name} ${a.phone} ${a.email || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [websiteAgents, statusFilter, searchQuery]);

  /* ========== SUMMARY STATS ========== */
  const stats = useMemo(() => {
    const active = websiteAgents.filter((a) => a.status === 'Active').length;
    const totalLeads = websiteAgents.reduce(
      (s, a) => s + (a.leadsAssigned || 0),
      0
    );
    const totalCalls = websiteAgents.reduce(
      (s, a) => s + (a.callsToday || 0),
      0
    );
    return { active, totalLeads, totalCalls };
  }, [websiteAgents]);

  /* ========== ADD ========== */
  const handleAdd = (data) => {
    setAllAgents((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...data,
        leadsAssigned: 0,
        callsToday: 0,
        websiteId: activeWebsiteId,
      },
    ]);
    setShowAddModal(false);
  };

  /* ========== EDIT ========== */
  const handleEdit = (id, updates) => {
    setAllAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    setEditingAgent(null);
  };

  /* ========== DELETE ========== */
  const handleDelete = (id) => {
    if (!confirm('Remove this agent? This cannot be undone.')) return;
    setAllAgents((prev) => prev.filter((a) => a.id !== id));
    setMenuOpenId(null);
  };

  /* ========== SET STATUS ========== */
  const handleSetStatus = (id, newStatus) => {
    setAllAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    setMenuOpenId(null);
  };

  /* ========== VIEW LEADS ========== */
  const handleViewLeads = (agentName) => {
    navigate('/admin/leads', { state: { filterAgent: agentName } });
  };

  const hasActiveFilters = statusFilter !== 'All' || searchQuery;

  const clearFilters = () => {
    setStatusFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Agents
          </h1>
          <p className="text-sm text-brand-ink/50">
            Manage calling agents for{' '}
            <span className="font-semibold text-brand-purple">
              {activeWebsite?.name}
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus size={16} /> Add Agent
        </button>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniStat
          label="Total Agents"
          value={websiteAgents.length}
          icon={Users2}
          color="purple"
        />
        <MiniStat
          label="Active Now"
          value={stats.active}
          icon={Activity}
          color="emerald"
        />
        <MiniStat
          label="Leads Assigned"
          value={stats.totalLeads}
          icon={Target}
          color="rose"
        />
        <MiniStat
          label="Calls Today"
          value={stats.totalCalls}
          icon={Phone}
          color="amber"
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
            placeholder="Search by name, phone, or email..."
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

        <div className="relative">
          <button
            onClick={() => setStatusOpen((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
          >
            <Filter size={14} className="text-brand-purple" />
            Status:{' '}
            <span className="text-brand-purple">{statusFilter}</span>
          </button>
          {statusOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStatusOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                {['All', 'Active', 'Break', 'Offline'].map((s) => (
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

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ================= AGENTS GRID ================= */}
      {filteredAgents.length === 0 ? (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClear={clearFilters}
          onAdd={() => setShowAddModal(true)}
          websiteName={activeWebsite?.name}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent) => {
            const agentLeads = LEADS.filter(
              (l) =>
                l.websiteId === activeWebsiteId &&
                l.assignedAgent === agent.name
            );
            const won = agentLeads.filter((l) => l.status === 'Won').length;
            const conversion =
              agentLeads.length > 0
                ? Math.round((won / agentLeads.length) * 100)
                : 0;

            return (
              <div key={agent.id} className="card relative">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
                    {agent.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-brand-ink">
                      {agent.name}
                    </p>
                    <p className="truncate text-xs text-brand-ink/50">
                      {agent.phone}
                    </p>
                    {agent.email && (
                      <p className="truncate text-xs text-brand-ink/40">
                        {agent.email}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      agent.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : agent.status === 'Break'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {agent.status}
                  </span>

                  <button
                    onClick={() =>
                      setMenuOpenId(menuOpenId === agent.id ? null : agent.id)
                    }
                    className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 hover:bg-brand-lilac"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {menuOpenId === agent.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-3 top-14 z-20 w-44 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                        <MenuItem
                          icon={CheckCircle2}
                          label="Edit"
                          onClick={() => {
                            setEditingAgent(agent);
                            setMenuOpenId(null);
                          }}
                        />
                        <MenuItem
                          icon={Pause}
                          label="Set Break"
                          onClick={() => handleSetStatus(agent.id, 'Break')}
                        />
                        <MenuItem
                          icon={CheckCircle2}
                          label="Set Active"
                          onClick={() => handleSetStatus(agent.id, 'Active')}
                        />
                        <div className="my-1 h-px bg-brand-lilac/60" />
                        <MenuItem
                          icon={Trash2}
                          label="Remove"
                          danger
                          onClick={() => handleDelete(agent.id)}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-brand-mist p-2.5">
                    <p className="font-display text-base font-semibold text-brand-ink">
                      {agent.leadsAssigned}
                    </p>
                    <p className="text-[10px] text-brand-ink/50">Leads</p>
                  </div>
                  <div className="rounded-xl bg-brand-mist p-2.5">
                    <p className="font-display text-base font-semibold text-brand-ink">
                      {agent.callsToday}
                    </p>
                    <p className="text-[10px] text-brand-ink/50">Calls</p>
                  </div>
                  <div className="rounded-xl bg-brand-mist p-2.5">
                    <p className="font-display text-base font-semibold text-emerald-600">
                      {conversion}%
                    </p>
                    <p className="text-[10px] text-brand-ink/50">Conv.</p>
                  </div>
                </div>

                {/* Conversion bar */}
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                      style={{ width: `${conversion}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/50"
                    title="Call agent"
                  >
                    <Phone size={14} /> Call
                  </button>
                  <button
                    onClick={() => handleViewLeads(agent.name)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/50"
                  >
                    <Users2 size={14} /> View Leads
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODALS ================= */}
      {showAddModal && (
        <AgentModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {editingAgent && (
        <AgentModal
          mode="edit"
          initial={editingAgent}
          onClose={() => setEditingAgent(null)}
          onSubmit={(data) => handleEdit(editingAgent.id, data)}
        />
      )}
    </div>
  );
}

/* ================= MINI STAT ================= */
function MiniStat({ label, value, icon: Icon, color = 'purple' }) {
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
        <Icon size={18} />
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
function EmptyState({ hasFilters, onClear, onAdd, websiteName }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <Users2 size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No agents match your filters' : 'No agents yet'}
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
          <>
            Add your first calling agent for{' '}
            <span className="font-semibold text-brand-ink">
              {websiteName || 'this website'}
            </span>{' '}
            to start assigning leads.
          </>
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onAdd}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card"
        >
          <Plus size={16} /> Add First Agent
        </button>
      )}
    </div>
  );
}

/* ================= AGENT MODAL ================= */
function AgentModal({ mode = 'add', initial = {}, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    email: initial.email || '',
    status: initial.status || 'Active',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^[0-9]{10}$/.test(form.phone.trim()))
      return 'Phone must be exactly 10 digits.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      return 'Please enter a valid email.';
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
        phone: form.phone.trim(),
        email: form.email.trim(),
        status: form.status,
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Users2 size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {mode === 'add' ? 'Add New Agent' : 'Edit Agent'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {mode === 'add'
                  ? 'Fill in the agent details below.'
                  : 'Update the agent information.'}
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
            label="Full Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g. Ravi Kumar"
            required
          />

          <ModalInput
            label="Phone Number"
            value={form.phone}
            onChange={(v) =>
              setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) })
            }
            placeholder="10-digit mobile number"
            icon={Phone}
            required
          />

          <ModalInput
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="agent@example.com"
            icon={Mail}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Status
            </label>
            <div className="flex gap-2">
              {['Active', 'Break', 'Offline'].map((s) => (
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
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving…
                </span>
              ) : mode === 'add' ? (
                'Add Agent'
              ) : (
                'Save Changes'
              )}
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