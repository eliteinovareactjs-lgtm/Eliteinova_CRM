// src/pages/superadmin/Reports.jsx
import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Download, TrendingUp, Phone, Users, Target, Clock, CheckCircle2,
  AlertTriangle, Globe, Filter, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS, AGENTS, WEBSITES, DAILY_CALL_TREND } from '../../data/mockData';

const COLORS = ['#E31C79', '#8B2FD6', '#F0388A', '#6D28D9', '#26A69A', '#FF9800'];

export default function Reports() {
  const { role, activeWebsiteId, activeWebsite } = useAuth();
  const [range, setRange] = useState('7d');
  const [rangeOpen, setRangeOpen] = useState(false);

  /* ========== SCOPED DATA (per active website) ========== */
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

  /* ========== STATUS BREAKDOWN ========== */
  const statusData = useMemo(() => {
    const statuses = ['Fresh', 'Follow Up', 'Missed', 'Won'];
    return statuses.map((s) => ({
      name: s,
      value: scopedLeads.filter((l) => l.status === s).length,
    }));
  }, [scopedLeads]);

  /* ========== RANGE OPTIONS ========== */
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

  /* ========== HEADER TITLE (depends on role) ========== */
  const pageTitle = role === 'superadmin' ? 'Network Reports' : 'Reports';

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            {pageTitle}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            {role === 'superadmin' ? (
              <>
                <Globe size={13} className="text-brand-purple" />
                Viewing reports for{' '}
                <span className="font-semibold text-brand-purple">
                  {activeWebsite?.name || '—'}
                </span>
              </>
            ) : (
              'Call and lead performance over time.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Range picker */}
          <div className="relative">
            <button
              onClick={() => setRangeOpen((s) => !s)}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <Filter size={14} className="text-brand-purple" />
              {range}
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

      {/* ================= CALL VOLUME TREND ================= */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Call Volume Trend
            </h2>
            <p className="text-xs text-brand-ink/50">
              {activeWebsite?.name || 'All websites'} • {range}
            </p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
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
                stroke="#8B2FD6"
                strokeWidth={3}
                dot={{ fill: '#E31C79', r: 4 }}
                name="Calls"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= TWO-COLUMN CHARTS ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Lead Sources */}
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
                  <Tooltip />
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

        {/* Status Breakdown */}
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
                  <Bar dataKey="value" fill="#8B2FD6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ================= AGENT PERFORMANCE TABLE ================= */}
      <div className="card !p-0">
        <div className="border-b border-brand-lilac/60 bg-brand-mist/50 px-5 py-3">
          <h2 className="font-display text-sm font-semibold text-brand-ink">
            Agent Performance — {activeWebsite?.name || 'Website'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
                <th className="px-4 py-3 font-semibold">Agent</th>
                <th className="px-4 py-3 text-center font-semibold">Assigned</th>
                <th className="px-4 py-3 text-center font-semibold">Won</th>
                <th className="px-4 py-3 text-center font-semibold">Missed</th>
                <th className="px-4 py-3 text-center font-semibold">Calls Today</th>
                <th className="px-4 py-3 text-center font-semibold">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {agentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-brand-ink/50"
                  >
                    No agents for this website yet.
                  </td>
                </tr>
              ) : (
                agentData.map((a) => (
                  <tr
                    key={a.name}
                    className="border-t border-brand-lilac/60 hover:bg-brand-mist/60"
                  >
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
                    <td className="px-4 py-3 text-center">
                      <div className="mx-auto flex max-w-[120px] items-center gap-2">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PLACEHOLDER CARDS ================= */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-base font-semibold text-brand-ink">
            Lead Conversion Funnel
          </h2>
          <p className="text-sm text-brand-ink/50">
            Connect a telephony backend to populate a full conversion funnel from
            lead capture to close.
          </p>
        </div>
        <div className="card">
          <h2 className="mb-3 font-display text-base font-semibold text-brand-ink">
            Follow-up Compliance
          </h2>
          <p className="text-sm text-brand-ink/50">
            Track how many follow-ups were completed on time versus missed, per
            agent and per source.
          </p>
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
          <p className="mt-0.5 text-xs font-medium text-emerald-500">
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