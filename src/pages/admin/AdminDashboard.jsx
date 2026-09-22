// src/pages/admin/AdminDashboard.jsx
import { useMemo, useState } from 'react';
import {
  Users,
  Phone,
  PhoneMissed,
  UserCheck,
  TrendingUp,
  Clock,
  Award,
  Activity,
  Zap,
  ArrowRight,
  Eye,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  Target,
  CheckCircle2,
  Building2,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import {
  AGENTS,
  LEADS,
  DAILY_CALL_TREND,
  statsForWebsite,
} from '../../data/mockData';

export default function AdminDashboard() {
  const { user, activeWebsiteId, activeWebsite } = useAuth();
  const [chartView, setChartView] = useState('leads'); // leads | calls | conversion

  /* ========== SCOPED DATA ========== */
  const stats = statsForWebsite(activeWebsiteId);

  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  const leads = useMemo(
    () => LEADS.filter((l) => l.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* ========== PIE / ALLOCATION ========== */
  const pieData = useMemo(
    () =>
      agents.map((a) => ({
        name: a.name,
        value: a.leadsAssigned || 0,
      })),
    [agents]
  );

  const colors = ['#E31C79', '#8B2FD6', '#F0388A', '#6D28D9', '#26A69A'];
  const totalPie = pieData.reduce((s, d) => s + d.value, 0) || 1;

  /* ========== ADDITIONAL METRICS ========== */
  const wonLeads = leads.filter((l) => l.status === 'Won').length;
  const conversionRate =
    leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;

  /* ========== SOURCE BREAKDOWN ========== */
  const sourceBreakdown = useMemo(() => {
    const sources = {};
    leads.forEach((l) => {
      sources[l.leadSource] = (sources[l.leadSource] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({
      name,
      value,
    }));
  }, [leads]);

  /* ========== TOP AGENTS ========== */
  const topAgents = useMemo(() => {
    return [...agents]
      .sort((a, b) => (b.leadsAssigned || 0) - (a.leadsAssigned || 0))
      .slice(0, 3);
  }, [agents]);

  /* ========== RECENT ACTIVITY ========== */
  const recentActivity = useMemo(() => {
    return [
      {
        icon: Zap,
        text: `${leads.length} leads captured for ${activeWebsite?.name}`,
        time: '2 min ago',
        color: 'bg-rose-50 text-brand-magenta',
      },
      {
        icon: UserCheck,
        text: `${stats.activeAgents} agents are online right now`,
        time: '12 min ago',
        color: 'bg-emerald-50 text-emerald-500',
      },
      {
        icon: PhoneMissed,
        text: `${stats.missedCalls} missed calls need follow-up`,
        time: '45 min ago',
        color: 'bg-amber-50 text-amber-500',
      },
      {
        icon: CheckCircle2,
        text: `${wonLeads} leads converted this month`,
        time: '2 hrs ago',
        color: 'bg-violet-50 text-brand-purple',
      },
    ];
  }, [activeWebsite, leads.length, stats, wonLeads]);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            LMS Dashboard
          </h1>
          <p className="text-sm text-brand-ink/50">
            Good afternoon, {user?.name} 👋
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-brand-lilac/60 px-4 py-2 text-sm font-semibold text-brand-purple">
            <Building2 size={16} />
            {activeWebsite?.name}
          </div>

          {/* Chart switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-brand-lilac bg-white p-1">
            {[
              { key: 'leads', label: 'Leads', icon: BarChart3 },
              { key: 'calls', label: 'Calls', icon: Phone },
              { key: 'conversion', label: 'Conversion', icon: TrendingUp },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.key}
                  onClick={() => setChartView(v.key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    chartView === v.key
                      ? 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card'
                      : 'text-brand-ink/50 hover:text-brand-purple'
                  }`}
                >
                  <Icon size={12} />
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= TOP BANNER ================= */}
      <div className="card bg-gradient-to-br from-brand-purple/5 via-brand-magenta/5 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-brand-ink">
                Website Overview
              </p>
              <p className="text-xs text-brand-ink/50">
                {agents.length} agents • {leads.length} total leads •{' '}
                {conversionRate}% conversion
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              {
                label: 'This Week',
                value: `+${DAILY_CALL_TREND.reduce(
                  (s, d) => s + d.calls,
                  0
                )}`,
                icon: TrendingUp,
                color: 'text-emerald-500',
              },
              {
                label: 'Active Agents',
                value: stats.activeAgents,
                icon: UserCheck,
                color: 'text-brand-purple',
              },
              {
                label: 'Conversion',
                value: `${conversionRate}%`,
                icon: Target,
                color: 'text-brand-magenta',
              },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm"
                >
                  <Icon size={14} className={m.color} />
                  <div>
                    <p className="text-[10px] text-brand-ink/50">{m.label}</p>
                    <p className="text-sm font-bold text-brand-ink">{m.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Leads"
          value={stats.totalLeads}
          tint="rose"
          trend="↑ 12.5% vs last month"
        />
        <StatCard
          icon={Phone}
          label="Total Calls"
          value={stats.totalCalls}
          tint="purple"
          trend="↑ 8.3% vs last month"
        />
        <StatCard
          icon={PhoneMissed}
          label="Missed Calls"
          value={stats.missedCalls}
          tint="amber"
          trend="↓ 2.1% vs last month"
        />
        <StatCard
          icon={UserCheck}
          label="Active Agents"
          value={stats.activeAgents}
          tint="emerald"
          trend="↑ 4.8% vs last month"
        />
      </div>

      {/* ================= MAIN CHART + PIE ================= */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Chart */}
        <div className="card xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                {chartView === 'leads' && 'Total Leads — Last 7 Days'}
                {chartView === 'calls' && 'Total Calls — Last 7 Days'}
                {chartView === 'conversion' && 'Conversion Trend — Last 7 Days'}
              </h2>
              <p className="text-xs text-brand-ink/40">
                Website: {activeWebsite?.name}
              </p>
            </div>
            <span className="rounded-full bg-brand-lilac/60 px-3 py-1 text-xs font-semibold text-brand-purple">
              Live
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'conversion' ? (
                <LineChart data={DAILY_CALL_TREND}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#8b7a9e' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#8b7a9e' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #F1E4FB',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="#8B2FD6"
                    strokeWidth={3}
                    dot={{ fill: '#E31C79', r: 4 }}
                    name="Conversion %"
                  />
                </LineChart>
              ) : (
                <BarChart data={DAILY_CALL_TREND}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#8b7a9e' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#8b7a9e' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F1E4FB' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #F1E4FB',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="calls"
                    fill={chartView === 'leads' ? '#E31C79' : '#8B2FD6'}
                    radius={[6, 6, 0, 0]}
                    barSize={28}
                    name={chartView === 'leads' ? 'Leads' : 'Calls'}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Agent Allocation
            </h2>
            <PieIcon size={14} className="text-brand-purple" />
          </div>

          <div className="relative mx-auto h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-xl font-bold text-brand-ink">
                {totalPie}
              </p>
              <p className="text-[10px] text-brand-ink/50">Total Leads</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {pieData.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 text-brand-ink/70">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: colors[i % colors.length] }}
                  />
                  {d.name}
                </span>
                <span className="font-semibold text-brand-ink">
                  {d.value} (
                  {totalPie ? Math.round((d.value / totalPie) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= SOURCE + ACTIVITY ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Source breakdown */}
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Leads by Source
            </h2>
            <span className="text-xs text-brand-ink/50">
              {sourceBreakdown.length} sources
            </span>
          </div>

          {sourceBreakdown.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-sm text-brand-ink/40">
              No leads for this website yet.
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceBreakdown} layout="vertical">
                  <CartesianGrid horizontal={false} stroke="#F1E4FB" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#8b7a9e' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#8b7a9e' }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: '#F1E4FB' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #F1E4FB',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8B2FD6"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Recent Activity
            </h2>
            <Clock size={14} className="text-brand-purple" />
          </div>

          <div className="space-y-4">
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.color}`}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-brand-ink">
                      {a.text}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-ink/40">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
            View All Activity <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* ================= TOP AGENTS + SOURCE/STATUS ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top agents */}
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                Top Performing Agents
              </h2>
              <p className="text-xs text-brand-ink/50">
                Ranked by leads assigned
              </p>
            </div>
            <Award size={16} className="text-amber-500" />
          </div>

          {topAgents.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-brand-ink/40">
              No agents yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topAgents.map((agent, i) => {
                const agentLeads = leads.filter(
                  (l) => l.assignedAgent === agent.name
                );
                const agentWon = agentLeads.filter(
                  (l) => l.status === 'Won'
                ).length;
                const rate =
                  agentLeads.length > 0
                    ? Math.round((agentWon / agentLeads.length) * 100)
                    : 0;

                return (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 rounded-xl border border-brand-lilac p-3"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        i === 0
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                          : i === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                          : 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                      }`}
                    >
                      #{i + 1}
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-xs font-bold text-white">
                      {agent.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {agent.name}
                      </p>
                      <p className="truncate text-xs text-brand-ink/50">
                        {agentLeads.length} leads • {agentWon} won
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-brand-lilac sm:block">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-brand-purple">
                        {rate}%
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        agent.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Source/Status summary */}
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
            Quick Summary
          </h2>
          <div className="space-y-3">
            <SummaryRow
              label="Fresh"
              value={stats.fresh}
              color="bg-violet-100 text-brand-purple"
            />
            <SummaryRow
              label="Follow Up"
              value={stats.followUp}
              color="bg-amber-100 text-amber-600"
            />
            <SummaryRow
              label="Missed"
              value={stats.missed}
              color="bg-rose-100 text-brand-magenta"
            />
            <SummaryRow
              label="Won"
              value={wonLeads}
              color="bg-emerald-100 text-emerald-600"
            />
          </div>

          <div className="mt-4 rounded-xl bg-brand-mist p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-ink/50">Conversion Rate</span>
              <span className="font-display text-lg font-bold text-brand-purple">
                {conversionRate}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= SOURCE / STATUS TABLE ================= */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-brand-ink">
            Source / Status Leads
          </h2>
          <button className="text-xs font-semibold text-brand-purple hover:underline">
            View Leads →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
                <th className="rounded-l-xl px-4 py-3 font-semibold">
                  Lead Source
                </th>
                <th className="px-4 py-3 font-semibold">Fresh</th>
                <th className="px-4 py-3 font-semibold">Follow Up</th>
                <th className="px-4 py-3 font-semibold">Missed</th>
                <th className="rounded-r-xl px-4 py-3 font-semibold">Active</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-lilac/60">
                <td className="px-4 py-3 font-medium text-brand-ink">IVR</td>
                <td className="px-4 py-3 text-brand-ink/70">{stats.fresh}</td>
                <td className="px-4 py-3 text-brand-ink/70">{stats.followUp}</td>
                <td className="px-4 py-3 text-brand-ink/70">{stats.missed}</td>
                <td className="px-4 py-3 text-brand-ink/70">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= SUMMARY ROW ================= */
function SummaryRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-brand-ink/70">
        <span className={`h-2.5 w-2.5 rounded-full ${color.split(' ')[0]}`} />
        {label}
      </span>
      <span className="font-display text-lg font-semibold text-brand-ink">
        {value}
      </span>
    </div>
  );
}