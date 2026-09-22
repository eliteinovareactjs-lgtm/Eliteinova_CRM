// src/pages/agent/AgentDashboard.jsx
import { useMemo, useState } from 'react';
import {
  Users, Phone, PhoneMissed, UserCheck, Calendar, Plus, ChevronDown,
  Filter, MessageCircle, X, PhoneCall, Search, Trash2, Clock,
  CheckCircle2, ChevronLeft, ChevronRight, MoreVertical, TrendingUp,
  Target, Activity, Award, Headphones, Play, Mic, PhoneIncoming,
  PhoneOutgoing, Sparkles, ArrowRight, Building2, Keyboard, Upload,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { LEADS, DAILY_CALL_TREND } from '../../data/mockData';

const STATUS_STYLES = {
  Fresh: 'bg-violet-100 text-brand-purple',
  'Follow Up': 'bg-amber-100 text-amber-600',
  Missed: 'bg-rose-100 text-brand-magenta',
  Won: 'bg-emerald-100 text-emerald-600',
};

const LEAD_SOURCES = ['All', 'IVR', 'Website', 'WhatsApp', 'Campaign'];
const LEAD_STATUSES = ['All', 'Fresh', 'Follow Up', 'Missed', 'Won'];
const CHART_COLORS = ['#E31C79', '#8B2FD6', '#F0388A', '#6D28D9', '#26A69A'];

export default function AgentDashboard() {
  const { user, activeWebsiteId, activeWebsite } = useAuth();

  /* ============ STATE ============ */
  const [activeTab, setActiveTab] = useState('lms');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [chartView, setChartView] = useState('bars');
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [datePreset, setDatePreset] = useState('Today');

  /* ============ DATA ============ */
  const myLeads = useMemo(
    () =>
      LEADS.filter(
        (l) => l.websiteId === activeWebsiteId && l.assignedAgent === user.name
      ),
    [activeWebsiteId, user.name]
  );

  const filteredLeads = useMemo(() => {
    return myLeads.filter((l) => {
      if (sourceFilter !== 'All' && l.leadSource !== sourceFilter) return false;
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${l.name} ${l.mobile} ${l.account} ${l.category} ${l.leadSource}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [myLeads, sourceFilter, statusFilter, searchQuery]);

  /* ============ STATS ============ */
  const stats = useMemo(() => {
    const total = myLeads.length;
    const won = myLeads.filter((l) => l.status === 'Won').length;
    return {
      total,
      fresh: myLeads.filter((l) => l.status === 'Fresh').length,
      followUp: myLeads.filter((l) => l.status === 'Follow Up').length,
      missed: myLeads.filter((l) => l.status === 'Missed').length,
      won,
      conversion: total > 0 ? Math.round((won / total) * 100) : 0,
    };
  }, [myLeads]);

  /* ============ REPORT DATA ============ */
  const sourceReport = useMemo(() => {
    const sources = ['IVR', 'Website', 'WhatsApp', 'Campaign'];
    return sources.map((s) => {
      const rows = myLeads.filter((l) => l.leadSource === s);
      return {
        label: s,
        fresh: rows.filter((r) => r.status === 'Fresh').length,
        followUp: rows.filter((r) => r.status === 'Follow Up').length,
        missed: rows.filter((r) => r.status === 'Missed').length,
        active: rows.length,
      };
    });
  }, [myLeads]);

  const categoryReport = useMemo(() => {
    const categories = [...new Set(myLeads.map((l) => l.category))];
    return categories.map((c) => {
      const rows = myLeads.filter((l) => l.category === c);
      return {
        label: c,
        fresh: rows.filter((r) => r.status === 'Fresh').length,
        followUp: rows.filter((r) => r.status === 'Follow Up').length,
        missed: rows.filter((r) => r.status === 'Missed').length,
        active: rows.length,
      };
    });
  }, [myLeads]);

  const sourceCategoryReport = useMemo(() => {
    const sources = ['IVR', 'Website', 'WhatsApp', 'Campaign'];
    return sources.map((s) => {
      const rows = myLeads.filter((l) => l.leadSource === s);
      return {
        label: s,
        ivr: rows.filter((r) => r.leadSource === 'IVR').length,
        website: rows.filter((r) => r.leadSource === 'Website').length,
        whatsapp: rows.filter((r) => r.leadSource === 'WhatsApp').length,
        campaign: rows.filter((r) => r.leadSource === 'Campaign').length,
      };
    });
  }, [myLeads]);

  /* ============ STATUS PIE ============ */
  const statusPieData = useMemo(() => {
    return [
      { name: 'Fresh', value: stats.fresh },
      { name: 'Follow Up', value: stats.followUp },
      { name: 'Missed', value: stats.missed },
      { name: 'Won', value: stats.won },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const formatDate = (d) =>
    d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  /* ============ DATE PICKER ============ */
  const applyPreset = (preset) => {
    const today = new Date();
    let from = today;
    let to = today;

    if (preset === 'Yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      from = y;
      to = y;
    } else if (preset === 'Last 7 Days') {
      const f = new Date(today);
      f.setDate(today.getDate() - 6);
      from = f;
      to = today;
    } else if (preset === 'Last 30 Days') {
      const f = new Date(today);
      f.setDate(today.getDate() - 29);
      from = f;
      to = today;
    } else if (preset === 'This Month') {
      const f = new Date(today.getFullYear(), today.getMonth(), 1);
      from = f;
      to = today;
    }

    setDateRange({ from, to });
    setDatePreset(preset);
    setShowDatePicker(false);
  };

  const shiftDate = (dir) => {
    const { from, to } = dateRange;
    const days = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1);
    const newFrom = new Date(from);
    newFrom.setDate(from.getDate() + dir * days);
    const newTo = new Date(to);
    newTo.setDate(to.getDate() + dir * days);
    setDateRange({ from: newFrom, to: newTo });
    setDatePreset('Custom');
  };

  /* ============ FILTERS ============ */
  const handleClearAll = () => {
    setSourceFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
  };

  const hasActiveFilters =
    sourceFilter !== 'All' || statusFilter !== 'All' || searchQuery;

  /* ============ EXPORT ============ */
  const handleExport = () => {
    const rows = [
      ['S.No', 'Name', 'Mobile', 'Source', 'Category', 'Account', 'Follow-up', 'Status'],
      ...filteredLeads.map((l, i) => [
        i + 1,
        l.name,
        l.mobile,
        l.leadSource,
        l.category,
        l.account,
        l.followUpDate,
        l.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-leads-${user.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowActionMenu(false);
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* ================= HEADER BANNER ================= */}
      <div className="card bg-gradient-to-br from-brand-purple/5 via-brand-magenta/5 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-brand-ink">
                Welcome back, {user?.name} 👋
              </p>
              <p className="flex items-center gap-1.5 text-xs text-brand-ink/50">
                <Building2 size={11} />
                {activeWebsite?.name} • You have{' '}
                <span className="font-semibold text-brand-purple">
                  {stats.followUp} follow-ups
                </span>{' '}
                today
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <BannerChip
              icon={Target}
              label="Conversion"
              value={`${stats.conversion}%`}
              color="purple"
            />
            <BannerChip
              icon={Award}
              label="Won"
              value={stats.won}
              color="emerald"
            />
            <BannerChip
              icon={Activity}
              label="Active Leads"
              value={stats.fresh + stats.followUp}
              color="rose"
            />
          </div>
        </div>
      </div>

      {/* ================= TABS + LIVE CALLS ================= */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-8 border-b border-brand-lilac text-sm font-semibold">
          <button
            onClick={() => setActiveTab('lms')}
            className={`relative pb-3 transition-colors ${
              activeTab === 'lms'
                ? 'text-brand-ink'
                : 'text-brand-ink/50 hover:text-brand-purple'
            }`}
          >
            LMS Dashboard
            {activeTab === 'lms' && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-brand-purple to-brand-magenta" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`relative pb-3 transition-colors ${
              activeTab === 'leads'
                ? 'text-brand-ink'
                : 'text-brand-ink/50 hover:text-brand-purple'
            }`}
          >
            Leads &amp; Logs
            {activeTab === 'leads' && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-brand-purple to-brand-magenta" />
            )}
          </button>
        </div>

        <div className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card">
          <span className="hidden sm:inline">Live Calls</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
            <PhoneIncoming size={12} /> 0
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
            <PhoneOutgoing size={12} /> 0
          </span>
          <PhoneCall size={14} />
        </div>
      </div>

      {/* ================= VIEW LEADS BAR ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-brand-ink">
          View Leads
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Date range picker */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-lg border border-brand-lilac bg-white px-2 py-2 text-brand-ink/70">
              <button
                onClick={() => shiftDate(-1)}
                className="rounded p-1 hover:bg-brand-lilac/50"
                title="Previous period"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                onClick={() => setShowDatePicker((s) => !s)}
                className="flex items-center gap-2 px-1"
              >
                <Calendar size={14} className="text-brand-purple" />
                <span className="whitespace-nowrap font-medium">
                  {formatDate(dateRange.from)} – {formatDate(dateRange.to)}
                </span>
                <ChevronDown size={14} className="text-brand-ink/40" />
              </button>

              <button
                onClick={() => shiftDate(1)}
                className="rounded p-1 hover:bg-brand-lilac/50"
                title="Next period"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {showDatePicker && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDatePicker(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-brand-lilac bg-white p-2 shadow-panel">
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                    Quick Range
                  </p>
                  {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'].map(
                    (preset) => (
                      <button
                        key={preset}
                        onClick={() => applyPreset(preset)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          datePreset === preset
                            ? 'bg-brand-lilac font-semibold text-brand-purple'
                            : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                        }`}
                      >
                        {preset}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* Search toggle */}
          <button
            onClick={() => {
              setShowSearch((s) => !s);
              if (showSearch) setSearchQuery('');
            }}
            className={`rounded-lg border p-2 transition ${
              showSearch
                ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/40'
            }`}
            title="Search"
          >
            <Search size={16} />
          </button>

          {/* Add Lead */}
          <button
            onClick={() => setShowAddLead(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-sm font-semibold text-white shadow-card"
          >
            <Plus size={14} /> Lead
          </button>

          {/* Action dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActionMenu((s) => !s)}
              className="rounded-lg border border-brand-magenta px-4 py-2 text-sm font-semibold text-brand-magenta hover:bg-brand-magenta/5"
            >
              Action
            </button>
            {showActionMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActionMenu(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                  <button
                    onClick={handleExport}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-ink/70 hover:bg-brand-lilac/40"
                  >
                    <MoreVertical size={14} /> Export CSV
                  </button>
                  {['Bulk Assign', 'Bulk Follow-up', 'Bulk Close'].map((label) => (
                    <button
                      key={label}
                      onClick={() => setShowActionMenu(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-ink/70 hover:bg-brand-lilac/40"
                    >
                      <MoreVertical size={14} /> {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= SEARCH BAR ================= */}
      {showSearch && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40"
          />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, account, category..."
            className="w-full rounded-xl border border-brand-lilac bg-white py-3 pl-11 pr-10 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
      )}

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          label="Source"
          value={sourceFilter}
          options={LEAD_SOURCES}
          onChange={setSourceFilter}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={LEAD_STATUSES}
          onChange={setStatusFilter}
        />
        <div className="flex items-center gap-2 rounded-lg border border-brand-lilac bg-white px-4 py-2.5 text-sm">
          <span className="font-semibold text-brand-ink">Total Leads:</span>
          <span className="rounded-md bg-brand-mist px-2 py-0.5 font-bold text-brand-purple">
            {filteredLeads.length}
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ================= TAB CONTENT ================= */}
      {activeTab === 'lms' ? (
        <LmsTab
          myLeads={myLeads}
          stats={stats}
          statusPieData={statusPieData}
          sourceReport={sourceReport}
          categoryReport={categoryReport}
          sourceCategoryReport={sourceCategoryReport}
          chartView={chartView}
          setChartView={setChartView}
        />
      ) : (
        <LeadsTab filteredLeads={filteredLeads} />
      )}

      {/* ================= FLOATING CALL BUTTON ================= */}
      <button className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-panel transition hover:scale-110">
        <PhoneCall size={22} />
      </button>

      {/* ================= ADD LEAD MODAL ================= */}
      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} />}
    </div>
  );
}

/* ================= BANNER CHIP ================= */
function BannerChip({ icon: Icon, label, value, color = 'purple' }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-500',
    rose: 'bg-rose-50 text-brand-magenta',
  };
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors[color]}`}
      >
        <Icon size={14} />
      </span>
      <div>
        <p className="text-[10px] text-brand-ink/50">{label}</p>
        <p className="text-sm font-bold text-brand-ink">{value}</p>
      </div>
    </div>
  );
}

/* ================= LMS TAB ================= */
function LmsTab({
  myLeads, stats, statusPieData, sourceReport, categoryReport,
  sourceCategoryReport, chartView, setChartView,
}) {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Leads" value={stats.total} tint="rose" trend="↑ 12.5% vs last month" />
        <StatCard icon={Clock} label="Follow Ups" value={stats.followUp} tint="purple" trend="↑ 4.2% vs last month" />
        <StatCard icon={PhoneMissed} label="Missed" value={stats.missed} tint="amber" trend="↓ 2.1% vs last month" />
        <StatCard icon={CheckCircle2} label="Won" value={stats.won} tint="emerald" trend="↑ 8.9% vs last month" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main chart */}
        <div className="card xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                {chartView === 'bars' && 'My Leads — Last 7 Days'}
                {chartView === 'trend' && 'Trend Line'}
              </h2>
              <p className="text-xs text-brand-ink/50">Your personal lead flow</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-brand-lilac bg-white p-0.5">
              <button
                onClick={() => setChartView('bars')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  chartView === 'bars'
                    ? 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white'
                    : 'text-brand-ink/50 hover:text-brand-purple'
                }`}
              >
                Bars
              </button>
              <button
                onClick={() => setChartView('trend')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  chartView === 'trend'
                    ? 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white'
                    : 'text-brand-ink/50 hover:text-brand-purple'
                }`}
              >
                Trend
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'bars' ? (
                <BarChart data={DAILY_CALL_TREND}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#F1E4FB' }} contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                  <Bar dataKey="calls" fill="#E31C79" radius={[6, 6, 0, 0]} barSize={28} name="Total Leads" />
                </BarChart>
              ) : (
                <LineChart data={DAILY_CALL_TREND}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                  <Line type="monotone" dataKey="calls" stroke="#8B2FD6" strokeWidth={3} dot={{ fill: '#E31C79', r: 4 }} name="Leads" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status donut */}
        <div className="card flex flex-col">
          <h2 className="mb-3 font-display text-base font-semibold text-brand-ink">
            Lead Status Mix
          </h2>
          {statusPieData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-xs text-brand-ink/50">
              No data yet
            </div>
          ) : (
            <>
              <div className="relative mx-auto h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} dataKey="value" innerRadius={50} outerRadius={72} paddingAngle={3}>
                      {statusPieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-display text-xl font-bold text-brand-ink">{stats.total}</p>
                  <p className="text-[10px] text-brand-ink/50">Leads</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {statusPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-brand-ink/70">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-brand-ink">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report tables */}
      <ReportTable
        title="Source/Status Leads"
        headers={['Lead Source', 'Fresh', 'Follow Up', 'Missed', 'Active']}
        rows={sourceReport}
        keys={['fresh', 'followUp', 'missed', 'active']}
      />
      <ReportTable
        title="Category/Status Leads"
        headers={['Category', 'Fresh', 'Follow Up', 'Missed', 'Active']}
        rows={categoryReport}
        keys={['fresh', 'followUp', 'missed', 'active']}
      />
      <ReportTable
        title="Source/Category Leads"
        headers={['Lead Source', 'IVR', 'Website', 'WhatsApp', 'Campaign']}
        rows={sourceCategoryReport}
        keys={['ivr', 'website', 'whatsapp', 'campaign']}
      />
    </div>
  );
}

/* ================= LEADS TAB ================= */
function LeadsTab({ filteredLeads }) {
  return <LeadsTable leads={filteredLeads} />;
}

/* ================= FILTER SELECT ================= */
function FilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/30"
      >
        <Filter size={14} className="text-brand-purple" />
        <span>
          {label}: <span className="text-brand-purple">{value}</span>
        </span>
        <ChevronDown size={14} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === opt
                    ? 'bg-brand-lilac font-semibold text-brand-purple'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= LEADS TABLE ================= */
function LeadsTable({ leads }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const toggleCheck = (id) =>
    setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const toggleAll = () =>
    setChecked((c) => (c.length === leads.length ? [] : leads.map((l) => l.id)));

  return (
    <div className="card !p-0">
      {checked.length > 0 && (
        <div className="flex items-center justify-between border-b border-brand-lilac bg-brand-mist/60 px-5 py-3">
          <p className="text-sm font-semibold text-brand-ink">
            {checked.length} selected
          </p>
          <div className="relative">
            <button
              onClick={() => setBulkOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-button px-3 py-1.5 text-xs font-semibold text-white"
            >
              Bulk Action <ChevronDown size={12} />
            </button>
            {bulkOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBulkOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                  {[
                    { label: 'Mark as Follow Up', icon: Clock },
                    { label: 'Mark as Won', icon: CheckCircle2 },
                    { label: 'Delete', icon: Trash2 },
                  ].map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => setBulkOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-ink/70 hover:bg-brand-lilac/40"
                    >
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  className="accent-white"
                  checked={checked.length === leads.length && leads.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-3 py-3 font-semibold">S.No</th>
              <th className="px-3 py-3 font-semibold">Lead Source</th>
              <th className="px-3 py-3 font-semibold">Category</th>
              <th className="px-3 py-3 font-semibold">Mobile/Name</th>
              <th className="px-3 py-3 font-semibold">Account</th>
              <th className="px-3 py-3 font-semibold">Action</th>
              <th className="px-3 py-3 font-semibold">Followup</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Log ID</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center text-sm text-brand-ink/50">
                  No record found.
                </td>
              </tr>
            ) : (
              leads.map((lead, idx) => (
                <tr
                  key={lead.id}
                  className={`border-t border-brand-lilac/60 hover:bg-brand-mist/60 ${
                    checked.includes(lead.id) ? 'bg-brand-mist/40' : ''
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={checked.includes(lead.id)}
                      onChange={() => toggleCheck(lead.id)}
                    />
                  </td>
                  <td className="px-3 py-3 text-brand-ink/60">{idx + 1}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-brand-lilac px-2.5 py-1 text-xs font-semibold text-brand-purple">
                      {lead.leadSource}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-brand-ink/70">{lead.category}</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setSelected(lead)}
                      className="text-left font-semibold text-brand-ink hover:text-brand-purple"
                    >
                      {lead.name}
                    </button>
                    <p className="text-xs text-brand-ink/50">{lead.mobile}</p>
                  </td>
                  <td className="px-3 py-3 text-brand-ink/60">{lead.account}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-emerald-50 p-2 text-emerald-500 hover:bg-emerald-100" title="Call">
                        <Phone size={14} />
                      </button>
                      <button className="rounded-lg bg-emerald-50 p-2 text-emerald-500 hover:bg-emerald-100" title="WhatsApp">
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-brand-ink/60">{lead.followUpDate}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-500'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-brand-ink/60">
                    #LG-{String(lead.id).padStart(4, '0')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && <LeadDrawer lead={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ================= CUSTOMER DRAWER ================= */
function LeadDrawer({ lead, onClose }) {
  const recordings = [
    { id: 1, type: 'inbound', duration: '3:42', date: 'Today · 10:24 AM', summary: 'Discussed pricing options.' },
    { id: 2, type: 'outbound', duration: '1:18', date: 'Yesterday · 4:12 PM', summary: 'Follow-up on brochure.' },
    { id: 3, type: 'inbound', duration: '0:47', date: '3 days ago · 11:05 AM', summary: 'Missed call — no answer.', missed: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-brand-ink">Customer Details</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
              {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{lead.name}</p>
              <p className="text-sm text-brand-ink/50">{lead.mobile}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-500'}`}>
              {lead.status}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <Row label="Lead Source" value={lead.leadSource} />
            <Row label="Category" value={lead.category} />
            <Row label="Account" value={lead.account} />
            <Row label="Status" value={lead.status} />
            <Row label="Follow-up" value={lead.followUpDate} />
          </div>

          <div className="flex gap-2">
            <button className="btn-primary flex-1">
              <Phone size={16} /> Call Now
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50">
              <Calendar size={16} /> Set Follow-up
            </button>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <Mic size={12} /> Call Recordings
              </p>
              <span className="text-xs text-brand-ink/50">{recordings.length} recordings</span>
            </div>
            <div className="space-y-2.5">
              {recordings.map((rec) => (
                <div key={rec.id} className="rounded-xl border border-brand-lilac bg-white p-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${rec.missed ? 'bg-rose-50 text-rose-500' : rec.type === 'inbound' ? 'bg-emerald-50 text-emerald-500' : 'bg-violet-50 text-brand-purple'}`}>
                      {rec.missed ? <PhoneMissed size={16} /> : rec.type === 'inbound' ? <PhoneIncoming size={16} /> : <PhoneOutgoing size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-brand-ink capitalize">
                        {rec.missed ? 'Missed call' : `${rec.type} call`}
                      </p>
                      <p className="text-xs text-brand-ink/50">{rec.date}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-semibold text-brand-ink/60">
                      <Clock size={10} /> {rec.duration}
                    </span>
                    {!rec.missed && (
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card">
                        <Play size={12} fill="currentColor" />
                      </button>
                    )}
                  </div>
                  {rec.summary && (
                    <p className="mt-2 border-t border-brand-lilac/60 pt-2 text-xs text-brand-ink/60">
                      {rec.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              Latest transcript
            </p>
            <p className="text-sm italic leading-relaxed text-brand-ink/70">
              "Agent: Good afternoon, this is {lead.assignedAgent || 'your agent'} from Eliteinova. Am I speaking with {lead.name.split(' ')[0]}?"
              <br />
              "Customer: Yes, speaking."
              <br />
              "Agent: I'm calling regarding your enquiry about property options — do you have a moment?"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-brand-lilac/60 pb-2">
      <span className="text-brand-ink/50">{label}</span>
      <span className="font-medium text-brand-ink">{value}</span>
    </div>
  );
}

/* ================= REPORT TABLE ================= */
function ReportTable({ title, headers, rows = [], keys = [] }) {
  return (
    <div className="card !p-0">
      <div className="border-b border-brand-lilac/60 bg-brand-mist/50 px-5 py-3">
        <h3 className="font-display text-sm font-semibold text-brand-ink">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-white">
              {headers.map((h, i) => (
                <th key={h} className={`px-4 py-3 font-semibold ${i === 0 ? 'text-left' : 'text-center'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-brand-ink/50">
                  No record found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.label} className="border-t border-brand-lilac/60 hover:bg-brand-mist/60">
                  <td className="px-4 py-3 font-medium text-brand-ink">{row.label}</td>
                  {keys.map((k) => (
                    <td key={k} className="px-4 py-3 text-center text-brand-ink/70">
                      {row[k]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= ADD LEAD MODAL (Daffytel-style) ================= */
function AddLeadModal({ onClose }) {
  const { user } = useAuth();
  const [mode, setMode] = useState('manual');
  const [form, setForm] = useState({
    account: '',
    name: '',
    mobile: '',
    altMobile: '',
    email: '',
    address: '',
    agent: `${user?.name || 'Agent'} (${user?.id || '0000'})`,
    description: '',
    restoreDeleted: false,
    reassignExisting: false,
    leadSource: 'IVR',
    followUpDate: new Date().toISOString().split('T')[0],
    status: 'Fresh',
    category: 'IVR Inbound',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (f) => {
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'manual') {
      if (!form.name.trim()) return setError('Name is required.');
      if (!/^[0-9]{10}$/.test(form.mobile.trim()))
        return setError('Mobile Number must be exactly 10 digits.');
      if (form.altMobile && !/^[0-9]{10}$/.test(form.altMobile))
        return setError('Alternate Mobile must be 10 digits.');
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
        return setError('Enter a valid email.');
    } else {
      if (!file) return setError('Please select a CSV or Excel file.');
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert(
        mode === 'manual'
          ? `Lead added: ${form.name}`
          : `Bulk upload started: ${file?.name}`
      );
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-panel">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-lilac/60 px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-brand-ink">Leads</span>
            <span className="text-brand-ink/40">›</span>
            <span className="font-semibold text-brand-magenta">
              {mode === 'manual' ? 'Add Leads' : 'Bulk Upload'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('manual')}
              title="Manual Entry"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                mode === 'manual'
                  ? 'bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card'
                  : 'border border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/40'
              }`}
            >
              <Keyboard size={16} />
            </button>
            <button
              type="button"
              onClick={() => setMode('bulk')}
              title="Bulk Upload"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                mode === 'bulk'
                  ? 'bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card'
                  : 'border border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/40'
              }`}
            >
              <Upload size={16} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {mode === 'manual' ? (
            <div className="space-y-5">
              {/* Account */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                  Account
                </label>
                <div className="relative">
                  <input
                    value={form.account}
                    onChange={(e) =>
                      setForm({ ...form, account: e.target.value })
                    }
                    placeholder="Select account from list or Add new"
                    className="w-full rounded-lg border border-brand-lilac bg-white py-2.5 pl-3.5 pr-10 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                  />
                  <Search
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple"
                  />
                </div>
              </div>

              {/* Name + Mobile */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label="Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Enter Name"
                  required
                />
                <Field
                  label="Mobile Number"
                  value={form.mobile}
                  onChange={(v) =>
                    setForm({ ...form, mobile: v.replace(/\D/g, '').slice(0, 10) })
                  }
                  placeholder="Enter Mobile Number"
                  required
                />
              </div>

              {/* Alt + Email */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label="Alternate Mobile Number"
                  value={form.altMobile}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      altMobile: v.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                  placeholder="Enter Alternate Number"
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="Enter Email"
                />
              </div>

              {/* Address + Agent */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label="Address"
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                  placeholder="Enter Address"
                />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                    Agent
                  </label>
                  <div className="relative">
                    <select
                      value={form.agent}
                      onChange={(e) =>
                        setForm({ ...form, agent: e.target.value })
                      }
                      className="w-full appearance-none rounded-lg border border-brand-lilac bg-white py-2.5 pl-3.5 pr-10 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                    >
                      <option>{form.agent}</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-magenta"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Enter Description"
                  className="w-full rounded-lg border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Checkbox
                  checked={form.restoreDeleted}
                  onChange={(v) => setForm({ ...form, restoreDeleted: v })}
                  label="Restore/Update Deleted Leads."
                />
                <Checkbox
                  checked={form.reassignExisting}
                  onChange={(v) => setForm({ ...form, reassignExisting: v })}
                  label="Re-assign/Update Existing Leads."
                />
              </div>

              {/* Lead Source + Follow-up */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Dropdown
                  label="Lead Source"
                  value={form.leadSource}
                  options={['IVR', 'Website', 'WhatsApp', 'Campaign']}
                  onChange={(v) => setForm({ ...form, leadSource: v })}
                />
                <Field
                  label="Follow-up Date"
                  type="date"
                  value={form.followUpDate}
                  onChange={(v) => setForm({ ...form, followUpDate: v })}
                />
              </div>

              {/* Status + Category */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Dropdown
                  label="Status"
                  value={form.status}
                  options={['Fresh', 'Follow Up', 'Missed', 'Won']}
                  onChange={(v) => setForm({ ...form, status: v })}
                />
                <Dropdown
                  label="Category"
                  value={form.category}
                  options={['IVR Inbound', 'IVR Missed', 'Landing Page', 'Campaign']}
                  onChange={(v) => setForm({ ...form, category: v })}
                />
              </div>
            </div>
          ) : (
            /* ---------------- BULK UPLOAD ---------------- */
            <div className="space-y-5">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                  dragActive
                    ? 'border-brand-purple bg-brand-lilac/30'
                    : 'border-brand-purple/40 bg-brand-lilac/10'
                }`}
              >
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Upload size={20} className="text-brand-purple" />
                  <span className="text-sm font-semibold text-brand-ink">
                    Drag &amp; Drop File Here
                  </span>
                  <span className="text-xs text-brand-ink/50">or</span>
                  <label className="cursor-pointer rounded-lg bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2 text-xs font-semibold text-white shadow-card">
                    Browse File
                    <input
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                  </label>
                  <span className="text-xs text-brand-ink/50">
                    {file ? file.name : 'No File Chosen'}
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-3 text-xs font-semibold text-brand-purple hover:underline"
                  onClick={() =>
                    alert('Downloading sample template... (connect backend)')
                  }
                >
                  Download Sample
                </button>
              </div>

              {/* Select Agent */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                  Select Agent
                </label>
                <div className="relative">
                  <select
                    value={form.agent}
                    onChange={(e) => setForm({ ...form, agent: e.target.value })}
                    className="w-full appearance-none rounded-lg border border-brand-lilac bg-white py-2.5 pl-3.5 pr-10 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                  >
                    <option>{form.agent}</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-magenta"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Checkbox
                  checked={form.restoreDeleted}
                  onChange={(v) => setForm({ ...form, restoreDeleted: v })}
                  label="Restore/Update Deleted Leads."
                />
                <Checkbox
                  checked={form.reassignExisting}
                  onChange={(v) => setForm({ ...form, reassignExisting: v })}
                  label="Re-assign/Update Existing Leads."
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Dropdown
                  label="Lead Source"
                  value={form.leadSource}
                  options={['IVR', 'Website', 'WhatsApp', 'Campaign']}
                  onChange={(v) => setForm({ ...form, leadSource: v })}
                />
                <Field
                  label="Follow-up Date"
                  type="date"
                  value={form.followUpDate}
                  onChange={(v) => setForm({ ...form, followUpDate: v })}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Dropdown
                  label="Status"
                  value={form.status}
                  options={['Fresh', 'Follow Up', 'Missed', 'Won']}
                  onChange={(v) => setForm({ ...form, status: v })}
                />
                <Dropdown
                  label="Category"
                  value={form.category}
                  options={['IVR Inbound', 'IVR Missed', 'Landing Page', 'Campaign']}
                  onChange={(v) => setForm({ ...form, category: v })}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-brand-lilac/60 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-brand-lilac px-5 py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-6 py-2.5 text-sm font-semibold text-white shadow-card transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {mode === 'manual' ? 'Adding…' : 'Uploading…'}
                </>
              ) : mode === 'manual' ? (
                <>
                  <Plus size={16} /> Add Lead
                </>
              ) : (
                <>
                  <Upload size={16} /> Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= FORM HELPERS ================= */
function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
      />
    </div>
  );
}

function Dropdown({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-brand-lilac bg-white py-2.5 pl-3.5 pr-10 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-magenta"
        />
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-ink/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-brand-lilac accent-brand-purple"
      />
      {label}
    </label>
  );
}