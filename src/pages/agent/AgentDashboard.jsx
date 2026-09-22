// src/pages/agent/AgentDashboard.jsx
import { Users, Phone, PhoneMissed, UserCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { LEADS, DAILY_CALL_TREND, statsForWebsite } from '../../data/mockData';

export default function AgentDashboard() {
  const { user, activeWebsiteId } = useAuth();

  const myLeads = LEADS.filter(
    (l) => l.websiteId === activeWebsiteId && l.assignedAgent === user.name
  );
  const stats = statsForWebsite(activeWebsiteId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-ink">Dashboard</h1>
        <p className="text-sm text-brand-ink/50">Good afternoon, {user.name} 👋</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="My Leads"
          value={myLeads.length}
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
          value="NA"
          tint="emerald"
          trend="↑ 0% vs last month"
        />
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          My Leads — Last 7 Days
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
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
              <Tooltip cursor={{ fill: '#F1E4FB' }} />
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
    </div>
  );
}