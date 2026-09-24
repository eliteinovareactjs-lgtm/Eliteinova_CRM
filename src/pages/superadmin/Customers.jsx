// src/pages/superadmin/Customers.jsx
import { useMemo, useState } from 'react';
import {
  Search, Users, Phone, Mail, Building2, Eye, Activity, Clock,
  FileText, X, Check, Award, PhoneCall, PhoneIncoming, PhoneOutgoing,
  PhoneMissed, ChevronRight, Calendar, TrendingUp, TrendingDown, Pause,
} from 'lucide-react';
import { CUSTOMERS, PROJECTS, CALLS } from '../../data/mockData';

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  /* ========== DRAWERS ========== */
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [viewingActivityFor, setViewingActivityFor] = useState(null);
  const [viewingHistoryFor, setViewingHistoryFor] = useState(null);

  /* ========== FILTERED ========== */
  const filtered = useMemo(() => {
    return CUSTOMERS.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (projectFilter !== 'All' && c.projectId !== projectFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${c.name} ${c.mobile} ${c.email} ${c.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [searchQuery, statusFilter, projectFilter]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = CUSTOMERS.length;
    const active = CUSTOMERS.filter((c) => c.status === 'Active').length;
    const inactive = CUSTOMERS.filter((c) => c.status === 'Inactive').length;
    const totalCalls = CUSTOMERS.reduce((s, c) => s + (c.totalCalls || 0), 0);
    return { total, active, inactive, totalCalls };
  }, []);

  const projectName = (id) => PROJECTS.find((p) => p.id === id)?.name || id;

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
            Customers
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Users size={13} className="text-brand-purple" />
            All customers across every project.
          </p>
        </div>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total Customers"
          value={summary.total}
          sub={`${summary.active} currently active`}
          icon={Users}
          color="purple"
          trend="+6%"
          trendUp
        />
        <AnimatedStatCard
          label="Active"
          value={summary.active}
          sub={`of ${summary.total} customers`}
          icon={Activity}
          color="emerald"
          trend="+4%"
          trendUp
        />
        <AnimatedStatCard
          label="Total Calls"
          value={summary.totalCalls}
          sub="Across all customers"
          icon={PhoneCall}
          color="amber"
          trend="+9%"
          trendUp
        />
        <AnimatedStatCard
          label="Inactive"
          value={summary.inactive}
          sub="Require re-engagement"
          icon={Pause}
          color="rose"
          trend="-1"
          trendUp={false}
        />
      </div>

      {/* ================= FILTER BAR (Customer Search) ================= */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 md:max-w-md">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, email, or ID..."
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
          label="Project"
          value={projectFilter}
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

        <DropdownFilter
          label="Status"
          value={statusFilter}
          options={['All', 'Active', 'Inactive']}
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
      </div>

      {/* ================= ALL CUSTOMERS TABLE ================= */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 text-center font-semibold">Calls</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
                        <Users size={20} />
                      </div>
                      <p className="font-display text-sm font-semibold text-brand-ink">
                        {hasFilters
                          ? 'No customers match your filters'
                          : 'No customers yet'}
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
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-brand-lilac/60 hover:bg-brand-mist/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                          {c.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-brand-ink">
                            {c.name}
                          </p>
                          <p className="text-xs text-brand-ink/50">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-ink/70">
                      <p>{c.mobile}</p>
                      <p className="text-xs text-brand-ink/50">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-ink/70">
                      {projectName(c.projectId)}
                    </td>
                    <td className="px-4 py-3 text-center text-brand-ink/70">
                      {c.totalCalls}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          c.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingCustomer(c)}
                          title="View Details"
                          className="flex items-center gap-1 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                        >
                          <Eye size={13} />
                          View
                        </button>
                        <button
                          onClick={() => setViewingActivityFor(c)}
                          title="Activity Log"
                          className="flex items-center gap-1 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                        >
                          <Activity size={13} />
                          Activity
                        </button>
                        <button
                          onClick={() => setViewingHistoryFor(c)}
                          title="History"
                          className="flex items-center gap-1 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                        >
                          <FileText size={13} />
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= DRAWERS ================= */}
      {viewingCustomer && (
        <CustomerDetailsDrawer
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onActivity={() => {
            setViewingActivityFor(viewingCustomer);
            setViewingCustomer(null);
          }}
          onHistory={() => {
            setViewingHistoryFor(viewingCustomer);
            setViewingCustomer(null);
          }}
        />
      )}

      {viewingActivityFor && (
        <ActivityDrawer
          customer={viewingActivityFor}
          onClose={() => setViewingActivityFor(null)}
        />
      )}

      {viewingHistoryFor && (
        <HistoryDrawer
          customer={viewingHistoryFor}
          onClose={() => setViewingHistoryFor(null)}
        />
      )}
    </div>
  );
}

/* ================= ANIMATED STAT CARD (matches Projects / Admins / Agents) ================= */
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
        <p className={`mt-3 font-display text-3xl font-bold leading-tight ${t.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
      </div>
    </div>
  );
}

/* ================= DROPDOWN FILTER ================= */
function DropdownFilter({
  label,
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
        {label}: <span className="text-brand-purple">{value}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-48 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
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

/* ================= CUSTOMER DETAILS DRAWER ================= */
function CustomerDetailsDrawer({ customer, onClose, onActivity, onHistory }) {
  const project = PROJECTS.find((p) => p.id === customer.projectId);
  const customerCalls = CALLS.filter(
    (c) => c.customerId === customer.id || c.phone === customer.mobile
  );
  const connectedCalls = customerCalls.filter((c) => c.status === 'Connected').length;
  const missedCalls = customerCalls.filter((c) => c.status === 'Missed').length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
              {customer.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {customer.name}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {customer.id} · {customer.mobile}
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
          {/* Status / Project / Joined */}
          <div className="grid grid-cols-3 gap-3">
            <InfoBox
              label="Status"
              value={customer.status}
              color={customer.status === 'Active' ? 'emerald' : 'amber'}
            />
            <InfoBox label="Project" value={project?.code || '—'} color="purple" />
            <InfoBox
              label="Joined"
              value={customer.joinedOn || '—'}
              color="purple"
            />
          </div>

          {/* Contact Information */}
          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Contact Information
            </h4>
            <InfoRow icon={Phone} label="Mobile" value={customer.mobile} />
            <InfoRow icon={Mail} label="Email" value={customer.email || '—'} />
            <InfoRow
              icon={Building2}
              label="Project"
              value={project?.name || '—'}
            />
            <InfoRow
              icon={Calendar}
              label="Joined On"
              value={customer.joinedOn || '—'}
            />
          </div>

          {/* Call Activity */}
          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Call Activity
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <UsageStat
                icon={PhoneCall}
                label="Total Calls"
                value={customerCalls.length}
                max={50}
                used={customerCalls.length}
              />
              <UsageStat
                icon={PhoneIncoming}
                label="Connected"
                value={connectedCalls}
                max={50}
                used={connectedCalls}
              />
              <UsageStat
                icon={PhoneMissed}
                label="Missed"
                value={missedCalls}
                max={20}
                used={missedCalls}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="card !p-4 space-y-2">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Quick Links
            </h4>
            <button
              onClick={onActivity}
              className="flex w-full items-center justify-between rounded-xl border border-brand-lilac bg-white px-4 py-3 text-sm font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
            >
              <span className="flex items-center gap-2">
                <Activity size={14} className="text-brand-purple" />
                View Activity Log
              </span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={onHistory}
              className="flex w-full items-center justify-between rounded-xl border border-brand-lilac bg-white px-4 py-3 text-sm font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
            >
              <span className="flex items-center gap-2">
                <FileText size={14} className="text-brand-purple" />
                View Full History
              </span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Sticky actions */}
          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onActivity}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <Activity size={14} /> Activity Log
              </button>
              <button
                onClick={onHistory}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                <FileText size={14} /> View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ACTIVITY DRAWER ================= */
function ActivityDrawer({ customer, onClose }) {
  const activities = [
    { id: 1, action: 'Called customer', detail: 'Outbound call — Duration 4m 12s', time: 'Today, 10:24 AM', color: 'emerald' },
    { id: 2, action: 'WhatsApp sent', detail: 'Campaign "Diwali Offer"', time: 'Yesterday, 6:32 PM', color: 'emerald' },
    { id: 3, action: 'Email sent', detail: 'Subject: Your enquiry summary', time: 'Yesterday, 4:10 PM', color: 'amber' },
    { id: 4, action: 'Follow-up scheduled', detail: 'For Oct 25, 11:00 AM', time: '2 days ago, 3:00 PM', color: 'purple' },
    { id: 5, action: 'Missed call', detail: 'Inbound from +91 98XXX 12345', time: '3 days ago, 5:32 PM', color: 'rose' },
    { id: 6, action: 'Profile created', detail: 'Imported from Website enquiry form', time: '5 days ago, 9:45 AM', color: 'emerald' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
              {customer.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Customer Activity
              </h3>
              <p className="text-xs text-brand-ink/50">
                {customer.name} · {customer.mobile}
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
            <InfoBox label="Total Events" value={activities.length} color="purple" />
            <InfoBox label="Calls" value={3} color="emerald" />
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

/* ================= HISTORY DRAWER ================= */
function HistoryDrawer({ customer, onClose }) {
  const history = [
    { id: 1, date: 'Oct 20, 2024', event: 'Enquiry received', detail: 'Via Website — Matrimony enquiry form' },
    { id: 2, date: 'Oct 21, 2024', event: 'First call', detail: 'Discussed requirements, 5m 22s' },
    { id: 3, date: 'Oct 23, 2024', event: 'Proposal sent', detail: 'Premium plan discussed' },
    { id: 4, date: 'Oct 25, 2024', event: 'Follow-up call', detail: 'Awaiting decision' },
    { id: 5, date: 'Nov 01, 2024', event: 'Became customer', detail: 'Payment received' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Customer History
              </h3>
              <p className="text-xs text-brand-ink/50">
                Complete journey of {customer.name}
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
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Events" value={history.length} color="purple" />
            <InfoBox label="Calls" value={customer.totalCalls || 0} color="amber" />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
              Journey Timeline
            </p>

            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-brand-lilac" />
              <div className="space-y-3">
                {history.map((h, i) => {
                  const isLast = i === history.length - 1;
                  return (
                    <div key={h.id} className="relative flex items-start gap-3">
                      <span
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                          isLast
                            ? 'border-emerald-200 bg-emerald-100 text-emerald-600'
                            : 'border-brand-lilac bg-violet-100 text-brand-purple'
                        }`}
                      >
                        {isLast ? <Award size={12} /> : <Check size={12} />}
                      </span>
                      <div className="min-w-0 flex-1 rounded-xl border border-brand-lilac/60 bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-brand-ink">
                            {h.event}
                          </p>
                          <span className="shrink-0 text-[10px] font-semibold text-brand-ink/40">
                            {h.date}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-brand-ink/60">
                          {h.detail}
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