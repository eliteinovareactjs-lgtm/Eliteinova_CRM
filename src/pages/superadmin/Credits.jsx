// src/pages/superadmin/Credits.jsx
import { useMemo, useState } from 'react';
import {
  Coins, TrendingUp, TrendingDown, Plus, X, Search, Filter, Building2,
  ChevronDown, MoreVertical, Eye, Trash2, Download, BarChart3, Percent,
  Layers, Tag, ClipboardList, FileText, Info, AlertCircle, CheckCircle2,
  DollarSign, Zap, Star, MessageSquare, MessageCircle, Phone, PhoneCall,
  Mic, Mail, Smartphone, Users, User as UserIcon, ArrowUpRight,
  ArrowDownRight, AlertTriangle, Bell, Wallet, CircleDollarSign,
  RefreshCw, Calendar, ListFilter, CreditCard, Hash, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CREDITS as INITIAL_CREDITS,
  CREDIT_TRANSACTIONS as INITIAL_TRANSACTIONS,
  PROJECTS,
  AGENTS,
} from '../../data/mockData';

const TABS = [
  { key: 'overview', label: 'Overview', icon: Wallet },
  { key: 'usage', label: 'Usage', icon: BarChart3 },
  { key: 'transactions', label: 'Transactions', icon: ClipboardList },
  { key: 'alerts', label: 'Low Balance Alerts', icon: Bell },
];

const SERVICES = [
  { key: 'SMS', label: 'SMS', icon: MessageSquare, color: 'purple' },
  { key: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, color: 'emerald' },
  { key: 'Voice Calls', label: 'Voice Calls', icon: PhoneCall, color: 'amber' },
  { key: 'IVR', label: 'IVR', icon: Mic, color: 'rose' },
  { key: 'Email', label: 'Email', icon: Mail, color: 'purple' },
  { key: 'Other', label: 'Other', icon: Layers, color: 'emerald' },
];

const LOW_BALANCE_THRESHOLD = 1000; // credits

export default function Credits() {
  const { role, activeWebsiteId } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  /* ========== LOCAL DATA ========== */
  const [projects, setProjects] = useState(
    INITIAL_CREDITS.map((c) => ({
      ...c,
      // Simulated usage breakdown per service (mock)
      usage: {
        SMS: Math.round(c.used * 0.35),
        WhatsApp: Math.round(c.used * 0.25),
        'Voice Calls': Math.round(c.used * 0.2),
        IVR: Math.round(c.used * 0.1),
        Email: Math.round(c.used * 0.05),
        Other: Math.round(c.used * 0.05),
      },
    }))
  );

  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  /* ========== FILTERS ========== */
  const [tab, setTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [projectOpen, setProjectOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  /* ========== MODALS ========== */
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  /* ========== HELPERS ========== */
  const projectName = (id) =>
    PROJECTS.find((p) => p.id === id)?.name || id;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ========== SCOPED PROJECTS ========== */
  const scopedProjects = useMemo(() => {
    if (isSuperAdmin) return projects;
    return projects.filter((p) => p.projectId === activeWebsiteId);
  }, [projects, isSuperAdmin, activeWebsiteId]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const totalBalance = scopedProjects.reduce((s, c) => s + c.balance, 0);
    const totalLimit = scopedProjects.reduce((s, c) => s + c.limit, 0);
    const totalUsed = scopedProjects.reduce((s, c) => s + c.used, 0);
    const usageRate =
      totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;
    const lowBalanceProjects = scopedProjects.filter(
      (p) => p.balance < LOW_BALANCE_THRESHOLD
    );
    const totalTopUps = transactions
      .filter((t) => t.type === 'topup')
      .reduce((s, t) => s + t.amount, 0);
    return {
      totalBalance,
      totalLimit,
      totalUsed,
      usageRate,
      lowBalanceProjects,
      totalTopUps,
    };
  }, [scopedProjects, transactions]);

  /* ========== FILTERED TRANSACTIONS ========== */
  const filteredTransactions = useMemo(() => {
    let rows = isSuperAdmin
      ? projectFilter === 'All'
        ? transactions
        : transactions.filter((t) => t.projectId === projectFilter)
      : transactions.filter((t) => t.projectId === activeWebsiteId);

    if (serviceFilter !== 'All')
      rows = rows.filter((t) => t.service === serviceFilter);

    if (typeFilter !== 'All') rows = rows.filter((t) => t.type === typeFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((t) => {
        const hay = `${t.id} ${t.service} ${t.projectId} ${t.amount}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [
    transactions,
    isSuperAdmin,
    activeWebsiteId,
    projectFilter,
    serviceFilter,
    typeFilter,
    searchQuery,
  ]);

  /* ========== USAGE BREAKDOWN ========== */
  const usageByService = useMemo(() => {
    const map = {};
    SERVICES.forEach((s) => {
      map[s.key] = scopedProjects.reduce(
        (sum, p) => sum + (p.usage?.[s.key] || 0),
        0
      );
    });
    return map;
  }, [scopedProjects]);

  const totalServiceUsage = Object.values(usageByService).reduce(
    (s, v) => s + v,
    0
  );

  /* ========== ACTIONS ========== */
  const handleTopUp = (data) => {
    const { projectId, amount, service, note } = data;

    // Update project balance
    setProjects((prev) =>
      prev.map((p) =>
        p.projectId === projectId
          ? { ...p, balance: p.balance + amount, limit: p.limit + amount }
          : p
      )
    );

    // Log transaction
    const newT = {
      id: 'TXN-' + String(Date.now()).slice(-4),
      projectId,
      type: 'topup',
      amount,
      service: service || 'Credit Purchase',
      date: new Date().toISOString().slice(0, 10),
      note: note || '',
    };
    setTransactions((prev) => [newT, ...prev]);

    setShowTopUpModal(false);
    showToast(
      `Added ${amount.toLocaleString()} credits to ${projectName(projectId)}`
    );
  };

  const handleAllocate = (data) => {
    const { projectId, amount, service } = data;

    // Move credits from main pool — here we simulate by reducing a placeholder
    // In a real app you'd have a "central wallet" object
    setProjects((prev) =>
      prev.map((p) =>
        p.projectId === projectId
          ? { ...p, balance: p.balance + amount, limit: p.limit + amount }
          : p
      )
    );

    const newT = {
      id: 'TXN-' + String(Date.now()).slice(-4),
      projectId,
      type: 'topup',
      amount,
      service: service || 'Allocation',
      date: new Date().toISOString().slice(0, 10),
      note: `Allocated from central wallet`,
    };
    setTransactions((prev) => [newT, ...prev]);

    setShowAllocateModal(false);
    showToast(`Allocated ${amount.toLocaleString()} credits`);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setConfirmDelete(null);
    showToast('Transaction deleted', 'error');
  };

  const handleExport = () => {
    const rows = [
      ['ID', 'Project', 'Type', 'Service', 'Amount', 'Date'],
      ...filteredTransactions.map((t) => [
        t.id,
        projectName(t.projectId),
        t.type,
        t.service,
        t.amount,
        t.date,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credits-transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredTransactions.length} transactions`);
  };

  const hasFilters =
    searchQuery || projectFilter !== 'All' || serviceFilter !== 'All' || typeFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setProjectFilter('All');
    setServiceFilter('All');
    setTypeFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Credits &amp; Usage
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Coins size={13} className="text-brand-purple" />
            Manage platform-wide credits, top-ups, and usage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAllocateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <Layers size={14} /> Allocate
          </button>
          <button
            onClick={() => setShowTopUpModal(true)}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus
              size={14}
              className="transition-transform group-hover:rotate-90 duration-300"
            />
            Add Credits
          </button>
        </div>
      </div>

      {/* ================= BALANCE HERO CARD ================= */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-brand-purple/10 via-brand-magenta/10 to-transparent p-6">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-purple to-brand-magenta" />
        <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-purple/15 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card">
              <Coins size={28} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-purple/70">
                Total Platform Balance
              </p>
              <p className="font-display text-4xl font-bold tabular-nums text-brand-ink">
                {summary.totalBalance.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-brand-ink/50">
                of {summary.totalLimit.toLocaleString()} credits ·{' '}
                {summary.usageRate}% used
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <StatChip
              label="Total Used"
              value={summary.totalUsed.toLocaleString()}
              icon={TrendingDown}
              color="rose"
            />
            <StatChip
              label="Total Top-Ups"
              value={`+${summary.totalTopUps.toLocaleString()}`}
              icon={TrendingUp}
              color="emerald"
            />
            <StatChip
              label="Low Balance"
              value={summary.lowBalanceProjects.length}
              icon={AlertTriangle}
              color="amber"
            />
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          const count =
            key === 'alerts' ? summary.lowBalanceProjects.length : null;
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
              {count !== null && count > 0 && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    active
                      ? 'bg-brand-purple text-white'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={handleExport}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
        >
          <Download size={12} /> Export
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {tab === 'overview' && (
        <OverviewTab
          scopedProjects={scopedProjects}
          projectName={projectName}
          onTopUp={() => setShowTopUpModal(true)}
        />
      )}

      {tab === 'usage' && (
        <UsageTab
          usageByService={usageByService}
          totalServiceUsage={totalServiceUsage}
          scopedProjects={scopedProjects}
          projectName={projectName}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {tab === 'transactions' && (
        <TransactionsTab
          transactions={filteredTransactions}
          projectName={projectName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          projectOpen={projectOpen}
          setProjectOpen={setProjectOpen}
          serviceFilter={serviceFilter}
          setServiceFilter={setServiceFilter}
          serviceOpen={serviceOpen}
          setServiceOpen={setServiceOpen}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          typeOpen={typeOpen}
          setTypeOpen={setTypeOpen}
          isSuperAdmin={isSuperAdmin}
          hasFilters={hasFilters}
          clearFilters={clearFilters}
          onView={setViewingTransaction}
          onDelete={(t) => setConfirmDelete(t)}
        />
      )}

      {tab === 'alerts' && (
        <AlertsTab
          lowBalanceProjects={summary.lowBalanceProjects}
          projectName={projectName}
          onTopUp={() => setShowTopUpModal(true)}
        />
      )}

      {/* ================= MODALS ================= */}
      {showTopUpModal && (
        <TopUpModal
          projects={projects}
          onClose={() => setShowTopUpModal(false)}
          onSubmit={handleTopUp}
        />
      )}

      {showAllocateModal && (
        <AllocateModal
          projects={projects}
          onClose={() => setShowAllocateModal(false)}
          onSubmit={handleAllocate}
        />
      )}

      {viewingTransaction && (
        <TransactionDrawer
          transaction={viewingTransaction}
          projectName={projectName}
          onClose={() => setViewingTransaction(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete transaction?"
          message={`This will permanently delete transaction "${confirmDelete.id}". This action cannot be undone.`}
          confirmLabel="Delete Transaction"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteTransaction(confirmDelete.id)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= STAT CHIP ================= */
function StatChip({ label, value, icon: Icon, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border-2 bg-white/80 p-3 backdrop-blur ${colors[color]}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70">
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wide opacity-70">
          {label}
        </p>
        <p className="font-display text-base font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

/* ================= OVERVIEW TAB ================= */
function OverviewTab({ scopedProjects, projectName, onTopUp }) {
  return (
    <div className="space-y-4">
      {/* Project allocation cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scopedProjects.map((c) => {
          const pct = Math.min(100, Math.round((c.balance / c.limit) * 100));
          const isLow = c.balance < LOW_BALANCE_THRESHOLD;
          return (
            <div
              key={c.projectId}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)] ${
                isLow
                  ? 'border-rose-200 hover:border-rose-300'
                  : 'border-brand-lilac/80 hover:border-brand-purple/50'
              }`}
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${
                  isLow
                    ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                    : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                }`}
              />

              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-500 group-hover:scale-110 ${
                    isLow
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white'
                      : 'bg-gradient-to-br from-brand-purple to-brand-magenta text-white'
                  }`}
                >
                  <Building2 size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-brand-ink">
                    {projectName(c.projectId)}
                  </p>
                  <p className="truncate text-xs text-brand-ink/50">
                    {c.used.toLocaleString()} credits used
                  </p>
                </div>
                {isLow && (
                  <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                    LOW
                  </span>
                )}
              </div>

              <p
                className={`mt-4 font-display text-3xl font-bold tabular-nums ${
                  isLow ? 'text-rose-600' : 'text-brand-purple'
                }`}
              >
                {c.balance.toLocaleString()}
              </p>
              <p className="text-xs text-brand-ink/50">
                of {c.limit.toLocaleString()} credits
              </p>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="text-brand-ink/50">Balance</span>
                  <span
                    className={`font-bold tabular-nums ${
                      isLow ? 'text-rose-600' : 'text-brand-purple'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className={`h-full rounded-full ${
                      isLow
                        ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                        : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Service usage mini breakdown */}
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <MiniUsagePill
                  label="SMS"
                  value={c.usage?.SMS || 0}
                  color="purple"
                />
                <MiniUsagePill
                  label="WA"
                  value={c.usage?.WhatsApp || 0}
                  color="emerald"
                />
                <MiniUsagePill
                  label="Calls"
                  value={c.usage?.['Voice Calls'] || 0}
                  color="amber"
                />
              </div>

              <button
                onClick={onTopUp}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Plus size={12} /> Add Credits
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= MINI USAGE PILL ================= */
function MiniUsagePill({ label, value, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border px-1.5 py-1.5 text-center ${colors[color]}`}>
      <p className="font-display text-xs font-bold tabular-nums">{value}</p>
      <p className="text-[8px] font-semibold uppercase opacity-70">{label}</p>
    </div>
  );
}

/* ================= USAGE TAB ================= */
function UsageTab({ usageByService, totalServiceUsage, scopedProjects, projectName, isSuperAdmin }) {
  const maxUsage = Math.max(...Object.values(usageByService), 1);

  return (
    <div className="space-y-5">
      {/* Usage by Service */}
      <div className="card !p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <BarChart3 size={14} className="text-brand-purple" />
          Usage by Service
        </h3>
        <div className="space-y-3">
          {SERVICES.map((s) => {
            const count = usageByService[s.key] || 0;
            const pct = (count / maxUsage) * 100;
            const overallPct =
              totalServiceUsage > 0
                ? Math.round((count / totalServiceUsage) * 100)
                : 0;
            const Icon = s.icon;
            return (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold text-brand-ink/70">
                    <Icon size={12} className={`text-brand-${s.color === 'purple' ? 'purple' : s.color === 'emerald' ? 'emerald-600' : s.color === 'amber' ? 'amber-600' : 'magenta'}`} />
                    {s.label}
                  </span>
                  <span className="flex items-center gap-2 font-bold tabular-nums text-brand-ink">
                    {count.toLocaleString()}
                    <span className="text-brand-ink/40">({overallPct}%)</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className={`h-full rounded-full ${
                      s.color === 'emerald'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : s.color === 'amber'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : s.color === 'rose'
                        ? 'bg-gradient-to-r from-brand-magenta to-brand-purple'
                        : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage by Project */}
      {isSuperAdmin && scopedProjects.length > 0 && (
        <div className="card !p-4 space-y-3">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <Building2 size={14} className="text-brand-purple" />
            Usage by Project
          </h3>
          <div className="space-y-3">
            {scopedProjects.map((p) => {
              const pct = Math.min(
                100,
                Math.round((p.used / p.limit) * 100)
              );
              return (
                <div key={p.projectId}>
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="truncate font-semibold text-brand-ink/70">
                      {projectName(p.projectId)}
                    </span>
                    <span className="font-bold tabular-nums text-brand-ink">
                      {p.used.toLocaleString()} / {p.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
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
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-brand-ink/50">
                    <span>SMS: {p.usage?.SMS || 0}</span>
                    <span>WhatsApp: {p.usage?.WhatsApp || 0}</span>
                    <span>Calls: {p.usage?.['Voice Calls'] || 0}</span>
                    <span>IVR: {p.usage?.IVR || 0}</span>
                    <span>Email: {p.usage?.Email || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Usage Examples diagram (from doc) */}
      <div className="card !p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Coins size={14} className="text-brand-purple" />
          CRM Credits — How They're Used
        </h3>
        <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card">
              <Coins size={24} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-purple">
              CRM Credits
            </p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.key}
                    className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2"
                  >
                    <Icon size={12} className="text-brand-purple" />
                    <span className="text-[11px] font-semibold text-brand-ink">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= TRANSACTIONS TAB ================= */
function TransactionsTab({
  transactions,
  projectName,
  searchQuery,
  setSearchQuery,
  projectFilter,
  setProjectFilter,
  projectOpen,
  setProjectOpen,
  serviceFilter,
  setServiceFilter,
  serviceOpen,
  setServiceOpen,
  typeFilter,
  setTypeFilter,
  typeOpen,
  setTypeOpen,
  isSuperAdmin,
  hasFilters,
  clearFilters,
  onView,
  onDelete,
}) {
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, service, amount..."
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
              setServiceOpen(false);
              setTypeOpen(false);
            }}
            onChange={(v) => {
              setProjectFilter(v);
              setProjectOpen(false);
            }}
          />
        )}

        <DropdownFilter
          label="Service"
          icon={Tag}
          value={serviceFilter}
          options={['All', 'SMS', 'WhatsApp', 'Voice Calls', 'IVR', 'Email', 'Credit Purchase', 'Allocation']}
          open={serviceOpen}
          onToggle={() => {
            setServiceOpen((s) => !s);
            setProjectOpen(false);
            setTypeOpen(false);
          }}
          onChange={(v) => {
            setServiceFilter(v);
            setServiceOpen(false);
          }}
        />

        <DropdownFilter
          label="Type"
          icon={Filter}
          value={typeFilter}
          options={['All', 'topup', 'usage']}
          displayOptions={['All Types', 'Top-Up', 'Usage']}
          open={typeOpen}
          onToggle={() => {
            setTypeOpen((s) => !s);
            setProjectOpen(false);
            setServiceOpen(false);
          }}
          onChange={(v) => {
            setTypeFilter(v);
            setTypeOpen(false);
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

      {/* Transactions list */}
      {transactions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
            <ClipboardList size={22} />
          </div>
          <p className="font-display text-base font-semibold text-brand-ink">
            {hasFilters ? 'No transactions match' : 'No transactions yet'}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-brand-purple hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              projectName={projectName}
              onView={() => onView(t)}
              onDelete={() => onDelete(t)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= TRANSACTION ROW ================= */
function TransactionRow({ transaction: t, projectName, onView, onDelete }) {
  const isTopUp = t.type === 'topup' || t.amount > 0;
  return (
    <div className="group flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isTopUp
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-500'
        }`}
      >
        {isTopUp ? (
          <ArrowUpRight size={16} />
        ) : (
          <ArrowDownRight size={16} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">
          {t.service}
        </p>
        <p className="truncate text-xs text-brand-ink/50">{t.id}</p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="text-brand-ink/40">Project</p>
        <p className="font-semibold text-brand-ink/70">
          {projectName(t.projectId)}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
          isTopUp
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-rose-100 text-rose-600'
        }`}
      >
        {isTopUp ? 'TOP-UP' : 'USAGE'}
      </span>

      <span
        className={`shrink-0 text-sm font-bold tabular-nums ${
          isTopUp ? 'text-emerald-600' : 'text-rose-500'
        }`}
      >
        {isTopUp ? '+' : ''}
        {t.amount.toLocaleString()}
      </span>

      <span className="hidden shrink-0 text-[10px] text-brand-ink/40 lg:block">
        {t.date}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple sm:flex"
        >
          <Eye size={13} />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ================= ALERTS TAB ================= */
function AlertsTab({ lowBalanceProjects, projectName, onTopUp }) {
  if (lowBalanceProjects.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={22} />
        </div>
        <p className="font-display text-base font-semibold text-brand-ink">
          All projects have healthy balances
        </p>
        <p className="max-w-sm text-sm text-brand-ink/50">
          No projects are below the {LOW_BALANCE_THRESHOLD.toLocaleString()}{' '}
          credit threshold.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card !p-4">
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <AlertTriangle size={16} className="text-rose-500" />
          <p className="text-xs font-semibold text-rose-700">
            {lowBalanceProjects.length} project
            {lowBalanceProjects.length !== 1 ? 's' : ''} below the{' '}
            {LOW_BALANCE_THRESHOLD.toLocaleString()} credit threshold.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lowBalanceProjects.map((p) => {
          const pct = Math.min(100, Math.round((p.balance / p.limit) * 100));
          return (
            <div
              key={p.projectId}
              className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-rose-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-rose-300 hover:shadow-[0_20px_45px_-15px_rgba(244,63,94,0.25)]"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 to-rose-400" />

              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md">
                  <AlertTriangle size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-brand-ink">
                    {projectName(p.projectId)}
                  </p>
                  <p className="truncate text-xs text-rose-500">
                    Below threshold
                  </p>
                </div>
              </div>

              <p className="mt-4 font-display text-3xl font-bold tabular-nums text-rose-600">
                {p.balance.toLocaleString()}
              </p>
              <p className="text-xs text-brand-ink/50">
                of {p.limit.toLocaleString()} credits
              </p>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="text-brand-ink/50">Remaining</span>
                  <span className="font-bold tabular-nums text-rose-600">
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-rose-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <button
                onClick={onTopUp}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Plus size={12} /> Top Up Now
              </button>
            </div>
          );
        })}
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

/* ================= TOP-UP MODAL ================= */
function TopUpModal({ projects, onClose, onSubmit }) {
  const [form, setForm] = useState({
    projectId: projects[0]?.projectId || '',
    amount: 1000,
    service: 'Credit Purchase',
    note: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const PRESETS = [500, 1000, 2000, 5000, 10000];

  const validate = () => {
    if (!form.projectId) return 'Please select a project.';
    if (!form.amount || form.amount <= 0) return 'Amount must be greater than 0.';
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
              <Coins size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Add Credits
              </h3>
              <p className="text-xs text-brand-ink/50">
                Top up credits for a project.
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
              Project
            </label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {PROJECTS.find((x) => x.id === p.projectId)?.name ||
                    p.projectId}{' '}
                  (Balance: {p.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Quick Amount
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm({ ...form, amount: a })}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    form.amount === a
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {a.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Custom Amount
            </label>
            <input
              type="number"
              min={1}
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Service
            </label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              <option>Credit Purchase</option>
              <option>Manual Top-Up</option>
              <option>Bonus Credits</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Note (optional)
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              placeholder="Reason for top-up..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
                'Adding…'
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Coins size={14} /> Add {form.amount.toLocaleString()}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= ALLOCATE MODAL ================= */
function AllocateModal({ projects, onClose, onSubmit }) {
  const [form, setForm] = useState({
    projectId: projects[0]?.projectId || '',
    amount: 500,
    service: 'Allocation',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.projectId) return 'Please select a project.';
    if (!form.amount || form.amount <= 0) return 'Amount must be greater than 0.';
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Allocate Credits
              </h3>
              <p className="text-xs text-brand-ink/50">
                Distribute credits from the central wallet.
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
              Project
            </label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {PROJECTS.find((x) => x.id === p.projectId)?.name ||
                    p.projectId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Amount
            </label>
            <input
              type="number"
              min={1}
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-brand-purple">
            <p className="flex items-start gap-2">
              <Info size={14} className="mt-0.5 shrink-0" />
              Allocation pulls credits from the central wallet and assigns them to
              the selected project.
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
              {submitting ? 'Allocating…' : 'Allocate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= TRANSACTION DRAWER ================= */
function TransactionDrawer({ transaction: t, projectName, onClose }) {
  const isTopUp = t.type === 'topup' || t.amount > 0;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                isTopUp
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-br from-rose-500 to-rose-600'
              }`}
            >
              {isTopUp ? (
                <ArrowUpRight size={22} />
              ) : (
                <ArrowDownRight size={22} />
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {isTopUp ? 'Top-Up' : 'Usage'}
              </h3>
              <p className="text-xs text-brand-ink/50">{t.id}</p>
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
          <div
            className={`rounded-xl border-2 p-4 text-center ${
              isTopUp
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-rose-200 bg-rose-50'
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
              Amount
            </p>
            <p
              className={`mt-1 font-display text-4xl font-bold tabular-nums ${
                isTopUp ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {isTopUp ? '+' : ''}
              {t.amount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-brand-ink/50">credits</p>
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Transaction Details
            </h4>
            <InfoRow icon={Building2} label="Project" value={projectName(t.projectId)} />
            <InfoRow icon={Tag} label="Service" value={t.service} />
            <InfoRow
              icon={ClipboardList}
              label="Type"
              value={isTopUp ? 'Top-Up' : 'Usage'}
            />
            <InfoRow icon={Calendar} label="Date" value={t.date} />
            {t.note && <InfoRow icon={FileText} label="Note" value={t.note} />}
          </div>
        </div>
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