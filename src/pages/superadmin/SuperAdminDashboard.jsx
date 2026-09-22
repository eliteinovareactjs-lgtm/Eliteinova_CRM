// src/pages/superadmin/SuperAdminDashboard.jsx
import { useMemo, useState } from "react";
import {
  Users,
  Phone,
  PhoneMissed,
  UserCheck,
  Globe2,
  TrendingUp,
  TrendingDown,
  Building2,
  Activity,
  Zap,
  Award,
  Clock,
  ArrowRight,
  Eye,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
} from "lucide-react";

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
  Legend,
} from "recharts";

import StatCard from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";

import {
  AGENTS,
  LEADS,
  WEBSITES,
  DAILY_CALL_TREND,
  statsForWebsite,
} from "../../data/mockData";

export default function SuperAdminDashboard() {
  const { user, activeWebsiteId, activeWebsite } = useAuth();
  const [chartView, setChartView] = useState("leads"); // leads | calls | conversion

  /* ========== SCOPED DATA ========== */
  const stats = statsForWebsite(activeWebsiteId);

  const agents = useMemo(
    () => AGENTS.filter((agent) => agent.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  const leads = useMemo(
    () => LEADS.filter((lead) => lead.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* ========== AGENT ALLOCATION ========== */
  const pieData = useMemo(
    () =>
      agents.map((agent) => ({
        name: agent.name,
        value: agent.leadsAssigned || 0,
      })),
    [agents]
  );

  const colors = ["#E31C79", "#8B2FD6", "#F0388A", "#6D28D9", "#26A69A"];

  const totalPie = pieData.reduce((sum, item) => sum + item.value, 0) || 1;

  /* ========== GLOBAL (ALL WEBSITES) METRICS ========== */
  const globalStats = useMemo(() => {
    const totalLeads = WEBSITES.reduce(
      (sum, w) => sum + statsForWebsite(w.id).totalLeads,
      0
    );
    const totalAgents = AGENTS.length;
    const activeSites = WEBSITES.filter((w) => w.status === "Active").length;
    const blockedSites = WEBSITES.filter(
      (w) => w.status === "Blocked"
    ).length;
    return { totalLeads, totalAgents, activeSites, blockedSites };
  }, []);

  /* ========== SOURCE BREAKDOWN (per active website) ========== */
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

  /* ========== RECENT ACTIVITY ========== */
  const recentActivity = useMemo(() => {
    return [
      {
        icon: Zap,
        text: `${leads.length} new leads captured for ${activeWebsite?.name}`,
        time: "2 min ago",
        color: "bg-rose-50 text-brand-magenta",
      },
      {
        icon: UserCheck,
        text: `${stats.activeAgents} agents online across the network`,
        time: "15 min ago",
        color: "bg-emerald-50 text-emerald-500",
      },
      {
        icon: PhoneMissed,
        text: `${stats.missedCalls} missed calls need follow-up`,
        time: "1 hr ago",
        color: "bg-amber-50 text-amber-500",
      },
      {
        icon: Building2,
        text: `${globalStats.activeSites} websites running smoothly`,
        time: "3 hrs ago",
        color: "bg-violet-50 text-brand-purple",
      },
    ];
  }, [activeWebsite, leads.length, stats, globalStats]);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-brand-ink/50">
            Good afternoon, {user?.name} 👋
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-brand-lilac/60 px-4 py-2 text-sm font-semibold text-brand-purple">
            <Globe2 size={16} />
            Viewing: <span>{activeWebsite?.name}</span>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-brand-lilac bg-white p-1">
            {[
              { key: "leads", label: "Leads", icon: BarChart3 },
              { key: "calls", label: "Calls", icon: Phone },
              { key: "conversion", label: "Conversion", icon: TrendingUp },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.key}
                  onClick={() => setChartView(v.key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    chartView === v.key
                      ? "bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card"
                      : "text-brand-ink/50 hover:text-brand-purple"
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

      {/* ================= GLOBAL SNAPSHOT ================= */}
      <div className="card bg-gradient-to-br from-brand-purple/5 via-brand-magenta/5 to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-magenta" />
          <h2 className="font-display text-sm font-semibold text-brand-ink">
            Network Overview — All Websites
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: "Total Websites",
              value: WEBSITES.length,
              icon: Building2,
              color: "text-brand-purple",
            },
            {
              label: "Active Sites",
              value: globalStats.activeSites,
              icon: Activity,
              color: "text-emerald-500",
            },
            {
              label: "Total Leads",
              value: globalStats.totalLeads,
              icon: Users,
              color: "text-brand-magenta",
            },
            {
              label: "Total Agents",
              value: globalStats.totalAgents,
              icon: Award,
              color: "text-amber-500",
            },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon size={18} className={m.color} />
                </div>
                <div>
                  <p className="text-xl font-bold text-brand-ink">
                    {m.value}
                  </p>
                  <p className="text-xs text-brand-ink/50">{m.label}</p>
                </div>
              </div>
            );
          })}
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
        {/* Main chart */}
        <div className="card xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                {chartView === "leads" && "Total Leads — Last 7 Days"}
                {chartView === "calls" && "Total Calls — Last 7 Days"}
                {chartView === "conversion" && "Conversion Trend — Last 7 Days"}
              </h2>
              <p className="text-xs text-brand-ink/40">
                Website: {activeWebsite?.name}
              </p>
            </div>
            <span className="rounded-full bg-brand-lilac/60 px-3 py-1 text-xs font-semibold text-brand-purple">
              Live
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "conversion" ? (
                <LineChart data={DAILY_CALL_TREND}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#8b7a9e" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#8b7a9e" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #F1E4FB",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="#8B2FD6"
                    strokeWidth={3}
                    dot={{ fill: "#E31C79", r: 4 }}
                    name="Conversion %"
                  />
                </LineChart>
              ) : (
                <BarChart data={DAILY_CALL_TREND}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#8b7a9e" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#8b7a9e" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#F1E4FB" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #F1E4FB",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="calls"
                    fill={chartView === "leads" ? "#E31C79" : "#8B2FD6"}
                    radius={[6, 6, 0, 0]}
                    barSize={28}
                    name={chartView === "leads" ? "Leads" : "Calls"}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent allocation pie */}
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
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={colors[index % colors.length]}
                    />
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
            {pieData.map((data, index) => (
              <div
                key={data.name}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 text-brand-ink/70">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: colors[index % colors.length],
                    }}
                  />
                  {data.name}
                </span>
                <span className="font-semibold text-brand-ink">
                  {data.value} (
                  {totalPie
                    ? Math.round((data.value / totalPie) * 100)
                    : 0}
                  %)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= SOURCE + ACTIVITY ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Source chart */}
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
                  <CartesianGrid
                    horizontal={false}
                    stroke="#F1E4FB"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#8b7a9e" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#8b7a9e" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: "#F1E4FB" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #F1E4FB",
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
                    <p className="mt-0.5 text-xs text-brand-ink/40">
                      {a.time}
                    </p>
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

      {/* ================= SOURCE / STATUS LEADS ================= */}
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
                <th className="rounded-r-xl px-4 py-3 font-semibold">
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-lilac/60">
                <td className="px-4 py-3 font-medium text-brand-ink">
                  IVR
                </td>
                <td className="px-4 py-3 text-brand-ink/70">
                  {stats.fresh}
                </td>
                <td className="px-4 py-3 text-brand-ink/70">
                  {stats.followUp}
                </td>
                <td className="px-4 py-3 text-brand-ink/70">
                  {stats.missed}
                </td>
                <td className="px-4 py-3 text-brand-ink/70">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ALL WEBSITES SNAPSHOT ================= */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-brand-ink">
              All Websites Snapshot
            </h2>
            <p className="text-xs text-brand-ink/50">
              Complete overview of every tenant
            </p>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline">
            Manage Websites <ArrowRight size={12} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              <tr>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Agents</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {WEBSITES.map((website) => {
                const websiteStats = statsForWebsite(website.id);
                const websiteAgents = AGENTS.filter(
                  (agent) => agent.websiteId === website.id
                ).length;
                const isBlocked = website.status === "Blocked";

                return (
                  <tr
                    key={website.id}
                    className="border-t border-brand-lilac/60 hover:bg-brand-mist/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
                          <Building2 size={14} />
                        </div>
                        <span className="font-semibold text-brand-ink">
                          {website.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-lilac px-2.5 py-1 text-xs font-semibold text-brand-purple">
                        {website.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-ink/70">
                      {websiteStats.totalLeads}
                    </td>
                    <td className="px-4 py-3 text-brand-ink/70">
                      {websiteAgents}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          website.status === "Active"
                            ? "bg-emerald-100 text-emerald-600"
                            : website.status === "Trial"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {website.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          isBlocked
                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                            : "bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card hover:brightness-110"
                        }`}
                        disabled={isBlocked}
                      >
                        <Eye size={12} />
                        {isBlocked ? "Blocked" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}