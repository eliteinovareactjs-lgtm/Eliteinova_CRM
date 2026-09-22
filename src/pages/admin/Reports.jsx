// src/pages/admin/Reports.jsx
import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import {
  Download, TrendingUp, TrendingDown, Phone, Users, Target, Clock,
  CheckCircle2, AlertTriangle, Filter, ChevronDown, Award, Mic, Play,
  BarChart3, Calendar, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS, AGENTS, DAILY_CALL_TREND } from '../../data/mockData';

const COLORS = ['#E31C79', '#8B2FD6', '#F0388A', '#6D28D9', '#26A69A', '#FF9800'];

export default function Reports() {
  const { activeWebsiteId, activeWebsite } = useAuth();
  const [range, setRange] = useState('7d');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [activeChart, setActiveChart] = useState('calls');

  /* ========== SCOPED DATA ========== */
  const scopedLeads = useMemo(
    () => LEADS.filter((l) => l.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  const scopedAgents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* ========== METRICS ========== */
  const metrics = useMemo(() => {
    const total = scopedLeads.length;
    const won = scopedLeads.filter((l) => l.status === 'Won').length;
    const missed = scopedLeads.filter((l) => l.status === 'Missed').length;
    const followUp = scopedLeads.filter((l) => l.status === 'Follow Up').length;
    const conversion = total > 0 ? Math.round((won / total) * 100) : 0;
    const compliance = total > 0 ? Math.round(((total - missed) / total) * 100) : 0;
    const avgHandling = total > 0 ? (total * 2.5).toFixed(1) : '0.0';
    return { total, won, missed, followUp, conversion, compliance, avgHandling };
  }, [scopedLeads]);

  /* ========== SOURCE BREAKDOWN ========== */
  const sourceData = useMemo(() => {
    const sources = {};
    scopedLeads.forEach((l) => {
      sources[l.leadSource] = (sources[l.leadSource] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [scopedLeads]);

  /* ========== STATUS BREAKDOWN ========== */
  const statusData = useMemo(() => {
    const statuses = ['Fresh', 'Follow Up', 'Missed', 'Won'];
    return statuses.map((s) => ({
      name: s,
      value: scopedLeads.filter((l) => l.status === s).length,
    }));
  }, [scopedLeads]);

  /* ========== AGENT PERFORMANCE ========== */
  const agentData = useMemo(() => {
    return scopedAgents.map((a) => {
      const agentLeads = scopedLeads.filter((l) => l.assignedAgent === a.name);
      const won = agentLeads.filter((l) => l.status === 'Won').length;
      const missed = agentLeads.filter((l) => l.status === 'Missed').length;
      return {
        name: a.name,
        leads: agentLeads.length,
        won,
        missed,
        calls: a.callsToday || 0,
        rate: agentLeads.length > 0 ? Math.round((won / agentLeads.length) * 100) : 0,
      };
    });
  }, [scopedAgents, scopedLeads]);

  /* ========== HOURLY ACTIVITY ========== */
  const hourlyData = useMemo(
    () => [
      { hour: '9 AM', leads: 3, calls: 5 },
      { hour: '10 AM', leads: 8, calls: 12 },
      { hour: '11 AM', leads: 12, calls: 18 },
      { hour: '12 PM', leads: 9, calls: 14 },
      { hour: '1 PM', leads: 4, calls: 6 },
      { hour: '2 PM', leads: 11, calls: 17 },
      { hour: '3 PM', leads: 14, calls: 21 },
      { hour: '4 PM', leads: 10, calls: 15 },
      { hour: '5 PM', leads: 7, calls: 11 },
      { hour: '6 PM', leads: 3, calls: 5 },
    ],
    []
  );

  /* ========== RANGE ========== */
  const ranges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Custom'];

  /* ========== EXPORT ========== */
  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Website', activeWebsite?.name || '—'],
      ['Total Leads', metrics.total],
      ['Won', metrics.won],
      ['Missed', metrics.missed],
      ['Follow Ups', metrics.followUp],
      ['Conversion Rate', `${metrics.conversion}%`],
      ['Compliance', `${metrics.compliance}%`],
      ['Avg Handling (mins)', metrics.avgHandling],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${activeWebsite?.name || 'website'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Reports & Analytics
          </h1>
          <p className="text-sm text-brand-ink/50">
            Detailed insights for{' '}
            <span className="font-semibold text-brand-purple">
              {activeWebsite?.name}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Range picker */}
          <div className="relative">
            <button
              onClick={() => setRangeOpen((s) => !s)}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <Calendar size={14} className="text-brand-purple" />
              {ranges.find((r) => r.toLowerCase().startsWith(range.split('d')[0])) || 'Last 7 Days'}
              <ChevronDown size={14} className="text-brand-ink/40" />
            </button>
            {rangeOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setRangeOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                  {ranges.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRange(r);
                        setRangeOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                        range === r
                          ? 'bg-brand-lilac font-semibold text-brand-purple'
                          : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2 text-sm font-semibold text-white shadow-card"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* ================= METRIC CARDS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label="Total Leads"
          value={metrics.total}
          tint="rose"
          trend="↑ 12.5%"
        />
        <MetricCard
          icon={Target}
          label="Conversion Rate"
          value={`${metrics.conversion}%`}
          tint="purple"
          trend="↑ 3.2%"
        />
        <MetricCard
          icon={Clock}
          label="Avg Handling"
          value={`${metrics.avgHandling}m`}
          tint="amber"
          trend="↓ 0.4m"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Compliance"
          value={`${metrics.compliance}%`}
          tint="emerald"
          trend="↑ 5.1%"
        />
      </div>

      {/* ================= MAIN CHART ================= */}
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-brand-ink">
              {activeChart === 'calls' && 'Call Volume Trend'}
              {activeChart === 'leads' && 'Lead Volume Trend'}
              {activeChart === 'hourly' && 'Hourly Activity (Today)'}
            </h2>
            <p className="text-xs text-brand-ink/50">
              {activeWebsite?.name} • {range}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-brand-lilac bg-white p-1">
            {[
              { key: 'calls', label: 'Calls', icon: Phone },
              { key: 'leads', label: 'Leads', icon: Users },
              { key: 'hourly', label: 'Hourly', icon: BarChart3 },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.key}
                  onClick={() => setActiveChart(v.key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeChart === v.key
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

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'hourly' ? (
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B2FD6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8B2FD6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F1E4FB" />
                <XAxis
                  dataKey="hour"
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
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #F1E4FB',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#8B2FD6"
                  strokeWidth={2}
                  fill="url(#hourlyGrad)"
                  name="Calls"
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#E31C79"
                  strokeWidth={2}
                  fill="transparent"
                  name="Leads"
                />
              </AreaChart>
            ) : (
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
                  allowDecimals={false}
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
                  stroke={activeChart === 'calls' ? '#8B2FD6' : '#E31C79'}
                  strokeWidth={3}
                  dot={{ fill: '#E31C79', r: 4 }}
                  name={activeChart === 'calls' ? 'Calls' : 'Leads'}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= SOURCE + STATUS ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Source pie */}
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
            Leads by Source
          </h2>
          {sourceData.length === 0 ? (
            <EmptyState text="No leads for this website yet." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #F1E4FB',
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
            Lead Status Breakdown
          </h2>
          {metrics.total === 0 ? (
            <EmptyState text="No leads for this website yet." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis
                    dataKey="name"
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
                    dataKey="value"
                    fill="#8B2FD6"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ================= AGENT PERFORMANCE ================= */}
      <div className="card !p-0">
        <div className="border-b border-brand-lilac/60 bg-brand-mist/50 px-5 py-3">
          <h2 className="font-display text-sm font-semibold text-brand-ink">
            Agent Performance Scorecard
          </h2>
          <p className="text-xs text-brand-ink/50">
            Ranked by conversion rate
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Agent</th>
                <th className="px-4 py-3 text-center font-semibold">Assigned</th>
                <th className="px-4 py-3 text-center font-semibold">Won</th>
                <th className="px-4 py-3 text-center font-semibold">Missed</th>
                <th className="px-4 py-3 text-center font-semibold">Calls</th>
                <th className="px-4 py-3 text-center font-semibold">
                  Conversion
                </th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-brand-ink/50"
                  >
                    No agents for this website yet.
                  </td>
                </tr>
              ) : (
                [...agentData]
                  .sort((a, b) => b.rate - a.rate)
                  .map((a, i) => (
                    <tr
                      key={a.name}
                      className="border-t border-brand-lilac/60 hover:bg-brand-mist/60"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                            i === 0
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                              : i === 1
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                              : i === 2
                              ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                              : 'bg-brand-lilac text-brand-purple'
                          }`}
                        >
                          #{i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                            {a.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </span>
                          <span className="font-semibold text-brand-ink">
                            {a.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-brand-ink/70">
                        {a.leads}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-emerald-600">
                        {a.won}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-rose-500">
                        {a.missed}
                      </td>
                      <td className="px-4 py-3 text-center text-brand-ink/70">
                        {a.calls}
                      </td>
                      <td className="px-4 py-3">
                        <div className="mx-auto flex max-w-[140px] items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-lilac">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                              style={{ width: `${a.rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-brand-purple">
                            {a.rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-brand-purple hover:bg-violet-100">
                          <Mic size={12} /> Recordings
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CONVERSION FUNNEL + COMPLIANCE ================= */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Funnel */}
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
            Lead Conversion Funnel
          </h2>
          <div className="space-y-3">
            {[
              {
                label: 'Total Leads',
                value: metrics.total,
                color: 'from-brand-purple to-brand-magenta',
              },
              {
                label: 'Contacted',
                value: Math.round(metrics.total * 0.85),
                color: 'from-brand-magenta to-brand-rose',
              },
              {
                label: 'Followed Up',
                value: metrics.followUp + Math.round(metrics.total * 0.3),
                color: 'from-brand-rose to-amber-500',
              },
              {
                label: 'Won',
                value: metrics.won,
                color: 'from-amber-500 to-emerald-500',
              },
            ].map((step, i) => {
              const pct = metrics.total
                ? Math.round((step.value / metrics.total) * 100)
                : 0;
              return (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-ink">
                      {step.label}
                    </span>
                    <span className="text-brand-ink/50">
                      {step.value} · {pct}%
                    </span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-lg bg-brand-lilac/40">
                    <div
                      className={`flex h-full items-center justify-end rounded-lg bg-gradient-to-r ${step.color} px-3 text-[10px] font-bold text-white transition-all duration-1000`}
                      style={{ width: `${Math.max(pct, 12)}%` }}
                    >
                      {pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compliance */}
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
            Follow-up Compliance
          </h2>
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-brand-ink/70">
                  On-time Follow-ups
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  {metrics.compliance}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  style={{ width: `${metrics.compliance}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-brand-ink/70">Missed</span>
                <span className="text-sm font-bold text-rose-500">
                  {100 - metrics.compliance}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400"
                  style={{ width: `${100 - metrics.compliance}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-brand-mist/60 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <p className="text-xs leading-relaxed text-brand-ink/60">
                  {metrics.missed} leads missed their follow-up window this
                  period. Review and reassign to improve compliance.
                </p>
              </div>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
              View Missed Follow-ups <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= METRIC CARD ================= */
function MetricCard({ icon: Icon, label, value, tint = 'rose', trend }) {
  const tints = {
    rose: 'bg-rose-50 text-brand-magenta',
    purple: 'bg-violet-50 text-brand-purple',
    amber: 'bg-amber-50 text-amber-500',
    emerald: 'bg-emerald-50 text-emerald-500',
  };
  const isDown = trend?.startsWith('↓');
  return (
    <div className="card flex items-start gap-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tints[tint]}`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-brand-ink/50">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-brand-ink">
          {value}
        </p>
        {trend && (
          <p
            className={`mt-0.5 flex items-center gap-1 text-xs font-medium ${
              isDown ? 'text-rose-500' : 'text-emerald-500'
            }`}
          >
            {isDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {trend} vs last period
          </p>
        )}
      </div>
    </div>
  );
}

/* ================= EMPTY STATE ================= */
function EmptyState({ text }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <AlertTriangle size={20} />
      </div>
      <p className="text-sm text-brand-ink/50">{text}</p>
    </div>
  );
}