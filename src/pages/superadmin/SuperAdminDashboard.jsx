import {
  Users,
  Phone,
  PhoneMissed,
  UserCheck,
  Globe2,
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
  const {
    user,
    activeWebsiteId,
    activeWebsite,
  } = useAuth();

  const stats = statsForWebsite(activeWebsiteId);

  const agents = AGENTS.filter(
    (agent) => agent.websiteId === activeWebsiteId
  );

  const leads = LEADS.filter(
    (lead) => lead.websiteId === activeWebsiteId
  );

  const pieData = agents.map((agent) => ({
    name: agent.name,
    value: agent.leadsAssigned || 0,
  }));

  const colors = [
    "#E31C79",
    "#8B2FD6",
    "#F0388A",
    "#6D28D9",
  ];

  const totalPie =
    pieData.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Super Admin Dashboard
          </h1>

          <p className="text-sm text-brand-ink/50">
            Good afternoon, {user?.name} 👋
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-brand-lilac/60 px-4 py-2 text-sm font-semibold text-brand-purple">
          <Globe2 size={16} />

          Viewing:
          <span>{activeWebsite?.name}</span>
        </div>
      </div>

      {/* Stats */}
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
          trend="↑ 0% vs last month"
        />

        <StatCard
          icon={PhoneMissed}
          label="Missed Calls"
          value={stats.missedCalls}
          tint="amber"
          trend="↑ 0% vs last month"
        />

        <StatCard
          icon={UserCheck}
          label="Active Agents"
          value={stats.activeAgents}
          tint="emerald"
          trend="↑ 0% vs last month"
        />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Bar Chart */}
        <div className="card xl:col-span-2">

          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Total Leads — Last 7 Days
            </h2>

            <p className="text-xs text-brand-ink/40">
              Website: {activeWebsite?.name}
            </p>
          </div>

          <div className="h-64">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={DAILY_CALL_TREND}>

                <CartesianGrid
                  vertical={false}
                  stroke="#F1E4FB"
                />

                <XAxis
                  dataKey="day"
                  tick={{
                    fontSize: 11,
                    fill: "#8b7a9e",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "#8b7a9e",
                  }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  cursor={{
                    fill: "#F1E4FB",
                  }}
                />

                <Bar
                  dataKey="calls"
                  fill="#E31C79"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                  name="Total Leads"
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Pie Chart */}
        <div className="card flex flex-col items-center">

          <h2 className="mb-2 self-start font-display text-base font-semibold text-brand-ink">
            Agent Wise Leads Allocation
          </h2>

          <div className="relative h-44 w-44">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
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

              <p className="text-[10px] text-brand-ink/50">
                Total Leads
              </p>

            </div>

          </div>

          <div className="mt-4 w-full space-y-2">

            {pieData.map((data, index) => (
              <div
                key={data.name}
                className="flex items-center justify-between text-xs"
              >

                <span className="flex items-center gap-2 text-brand-ink/70">

                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background:
                        colors[index % colors.length],
                    }}
                  />

                  {data.name}

                </span>

                <span className="font-semibold text-brand-ink">
                  {data.value} (
                  {totalPie
                    ? Math.round(
                        (data.value / totalPie) * 100
                      )
                    : 0}
                  %)
                </span>

              </div>
            ))}

          </div>

        </div>

      </div>

      {/* Website Leads */}
      <div className="card">

        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Source / Status Leads
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[480px] text-sm">

            <thead>
              <tr className="rounded-xl bg-brand-button text-left text-white">

                <th className="rounded-l-xl px-4 py-3">
                  Lead Source
                </th>

                <th className="px-4 py-3">
                  Fresh
                </th>

                <th className="px-4 py-3">
                  Follow Up
                </th>

                <th className="px-4 py-3">
                  Missed
                </th>

                <th className="rounded-r-xl px-4 py-3">
                  Active
                </th>

              </tr>
            </thead>

            <tbody>

              <tr className="border-b border-brand-lilac/60">

                <td className="px-4 py-3 font-medium text-brand-ink">
                  IVR
                </td>

                <td className="px-4 py-3">
                  {stats.fresh}
                </td>

                <td className="px-4 py-3">
                  {stats.followUp}
                </td>

                <td className="px-4 py-3">
                  {stats.missed}
                </td>

                <td className="px-4 py-3">
                  0
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

      {/* All Websites */}
      <div className="card">

        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          All Websites Snapshot
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[560px] text-sm">

            <thead className="text-left text-brand-ink/50">

              <tr>

                <th className="px-4 py-2">
                  Website
                </th>

                <th className="px-4 py-2">
                  Plan
                </th>

                <th className="px-4 py-2">
                  Leads
                </th>

                <th className="px-4 py-2">
                  Agents
                </th>

                <th className="px-4 py-2">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {WEBSITES.map((website) => {

                const websiteStats =
                  statsForWebsite(website.id);

                const websiteAgents =
                  AGENTS.filter(
                    (agent) =>
                      agent.websiteId === website.id
                  ).length;

                return (
                  <tr
                    key={website.id}
                    className="border-t border-brand-lilac/60"
                  >

                    <td className="px-4 py-3 font-semibold text-brand-ink">
                      {website.name}
                    </td>

                    <td className="px-4 py-3 text-brand-ink/70">
                      {website.plan}
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
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {website.status}
                      </span>

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