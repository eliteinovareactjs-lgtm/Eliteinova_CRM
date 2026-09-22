import { Users, Phone, PhoneMissed, UserCheck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { AGENTS, LEADS, DAILY_CALL_TREND, statsForWebsite } from '../../data/mockData';

export default function AdminDashboard() {
  const { user, activeWebsiteId } = useAuth();
  const stats = statsForWebsite(activeWebsiteId);
  const agents = AGENTS.filter((a) => a.websiteId === activeWebsiteId);

  const pieData = agents.map((a) => ({ name: a.name, value: a.leadsAssigned || 0 }));
  const colors = ['#E31C79', '#8B2FD6', '#F0388A', '#6D28D9'];
  const totalPie = pieData.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">LMS Dashboard</h1>
          <p className="text-sm text-brand-ink/50">Good afternoon, {user.name} 👋</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Leads" value={stats.totalLeads} tint="rose" trend="↑ 12.5% vs last month" />
        <StatCard icon={Phone} label="Total Calls" value={stats.totalCalls} tint="purple" trend="↑ 0% vs last month" />
        <StatCard icon={PhoneMissed} label="Missed Calls" value={stats.missedCalls} tint="amber" trend="↑ 0% vs last month" />
        <StatCard icon={UserCheck} label="Active Agents" value={stats.activeAgents} tint="emerald" trend="↑ 0% vs last month" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">Total Leads — Last 7 Days</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_CALL_TREND}>
                <CartesianGrid vertical={false} stroke="#F1E4FB" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#F1E4FB' }} />
                <Bar dataKey="calls" fill="#E31C79" radius={[6, 6, 0, 0]} barSize={28} name="Total Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col items-center">
          <h2 className="mb-2 self-start font-display text-base font-semibold text-brand-ink">Agent Wise Leads Allocation</h2>
          <div className="relative h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={3}>
                  {pieData.map((_, i) => (<Cell key={i} fill={colors[i % colors.length]} />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-xl font-bold text-brand-ink">{totalPie}</p>
              <p className="text-[10px] text-brand-ink/50">Total Leads</p>
            </div>
          </div>
          <div className="mt-4 w-full space-y-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-brand-ink/70">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
                  {d.name}
                </span>
                <span className="font-semibold text-brand-ink">
                  {d.value} ({totalPie ? Math.round((d.value / totalPie) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">Source / Status Leads</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="rounded-xl bg-brand-button text-left text-white">
                <th className="rounded-l-xl px-4 py-3 font-semibold">Lead Source</th>
                <th className="px-4 py-3 font-semibold">Fresh</th>
                <th className="px-4 py-3 font-semibold">Follow Up</th>
                <th className="px-4 py-3 font-semibold">Missed</th>
                <th className="rounded-r-xl px-4 py-3 font-semibold">Active</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-lilac/60">
                <td className="px-4 py-3 font-medium text-brand-ink">IVR</td>
                <td className="px-4 py-3">{stats.fresh}</td>
                <td className="px-4 py-3">{stats.followUp}</td>
                <td className="px-4 py-3">{stats.missed}</td>
                <td className="px-4 py-3">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}