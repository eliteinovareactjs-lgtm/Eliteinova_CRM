// src/pages/admin/AdminDashboard.jsx
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Phone, PhoneMissed, UserCheck, TrendingUp, Award, Activity,
  Zap, ArrowRight, BarChart3, Sparkles, Target,
  CheckCircle2, Building2, Layers, Calendar, Megaphone,
  RefreshCw, Download, ChevronRight, PhoneIncoming, PhoneOutgoing,
  XCircle, AlertTriangle, Plus, UserPlus,
  ListChecks, Radio, Percent,
} from 'lucide-react';

import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';

import { useAuth } from '../../context/AuthContext';
import {
  AGENTS, LEADS, CALLS, FOLLOW_UPS, CAMPAIGNS,
  DAILY_CALL_TREND, statsForWebsite,
} from '../../data/mockData';

const COLORS = ['#E31C79', '#8B2FD6', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

/* ═══════════════════════════════════════════════════════════════════
   ROUTE MAP
   ═══════════════════════════════════════════════════════════════════ */
const ROUTES = {
  allLeads:      '/admin/leads',
  agents:        '/admin/agents',
  calling:       '/admin/calling',
  liveCalls:     '/admin/live-calls',
  followUps:     '/admin/follow-ups',
  campaigns:     '/admin/campaigns',
  tasks:         '/admin/tasks',
  reports:       '/admin/reports',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, activeWebsiteId, activeWebsite } = useAuth();
  const [chartView, setChartView] = useState('leads');
  const [refreshed, setRefreshed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

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
  const calls = useMemo(
    () => (CALLS || []).filter((c) => c.projectId === activeWebsiteId),
    [activeWebsiteId]
  );
  const followUps = useMemo(
    () => (FOLLOW_UPS || []).filter((f) => f.projectId === activeWebsiteId),
    [activeWebsiteId]
  );
  const campaigns = useMemo(
    () => (CAMPAIGNS || []).filter((c) => c.projectId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* ========== KPI METRICS ========== */
  const metrics = useMemo(() => {
    const wonLeads = leads.filter((l) => l.status === 'Won').length;
    const newLeads = leads.filter((l) => l.status === 'Fresh').length;
    const assignedLeads = leads.filter((l) => l.assignedAgent && l.assignedAgent !== 'Unassigned').length;
    const unassignedLeads = leads.length - assignedLeads;
    const todayFollowUps = followUps.filter((f) => f.status === 'Today').length;
    const overdueFollowUps = followUps.filter((f) => f.status === 'Overdue').length;
    const todaysCalls = calls.filter((c) => c.date === '2026-09-22').length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;

    return {
      totalLeads: leads.length,
      newLeads,
      assignedLeads,
      unassignedLeads,
      todayFollowUps,
      overdueFollowUps,
      todaysCalls,
      missedCalls: stats.missedCalls,
      activeAgents: stats.activeAgents,
      convertedLeads: wonLeads,
      activeCampaigns,
      conversionRate: leads.length ? Math.round((wonLeads / leads.length) * 100) : 0,
    };
  }, [leads, calls, followUps, campaigns, stats]);

  /* ========== LEAD ANALYTICS ========== */
  const leadAnalytics = useMemo(() => {
    const bySource = {}, byStatus = {}, byCategory = {};
    leads.forEach((l) => {
      bySource[l.leadSource] = (bySource[l.leadSource] || 0) + 1;
      if (l.category) byCategory[l.category] = (byCategory[l.category] || 0) + 1;
      byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    });
    return {
      bySource: Object.entries(bySource).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    };
  }, [leads]);

  /* ========== AGENT PERFORMANCE ========== */
  const agentPerformance = useMemo(
    () =>
      agents
        .map((a) => {
          const agentLeads = leads.filter((l) => l.assignedAgent === a.name);
          const won = agentLeads.filter((l) => l.status === 'Won').length;
          const rate = agentLeads.length ? Math.round((won / agentLeads.length) * 100) : 0;
          return { id: a.id, name: a.name, status: a.status, leads: agentLeads.length, won, rate };
        })
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 5),
    [agents, leads]
  );

  /* ========== CALL ANALYTICS ========== */
  const callAnalytics = useMemo(() => {
    const inbound = calls.filter((c) => c.type === 'inbound').length;
    const outbound = calls.filter((c) => c.type === 'outbound').length;
    const missed = calls.filter((c) => c.status === 'missed').length;
    const connected = calls.filter((c) => c.status === 'connected').length;
    const totalDuration = calls.reduce((sum, c) => {
      const [m, s] = (c.duration || '0:0').split(':').map(Number);
      return sum + m * 60 + s;
    }, 0);
    return {
      inbound, outbound, missed, connected,
      totalDuration,
      avgDuration: calls.length ? Math.round(totalDuration / calls.length) : 0,
    };
  }, [calls]);

  /* ========== FOLLOW-UP ANALYTICS ========== */
  const followUpAnalytics = useMemo(() => ({
    today: followUps.filter((f) => f.status === 'Today').length,
    upcoming: followUps.filter((f) => f.status === 'Upcoming').length,
    overdue: followUps.filter((f) => f.status === 'Overdue').length,
    completed: followUps.filter((f) => f.status === 'Completed').length,
  }), [followUps]);

  /* ========== CAMPAIGN ANALYTICS ========== */
  const campaignAnalytics = useMemo(() => ({
    active: campaigns.filter((c) => c.status === 'Active').length,
    completed: campaigns.filter((c) => c.status === 'Completed').length,
    totalLeads: campaigns.reduce((s, c) => s + (c.leads || 0), 0),
    totalCalls: campaigns.reduce((s, c) => s + (c.calls || 0), 0),
    connected: campaigns.reduce((s, c) => s + (c.connected || 0), 0),
    interested: campaigns.reduce((s, c) => s + (c.interested || 0), 0),
    converted: campaigns.reduce((s, c) => s + (c.converted || 0), 0),
  }), [campaigns]);

  /* ========== HANDLERS ========== */
  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1200);
  };

  const handleExport = () => {
    const rows = [
      ['Admin Dashboard Report'],
      ['Website', activeWebsite?.name],
      ['Total Leads', metrics.totalLeads],
      ['New Leads', metrics.newLeads],
      ['Assigned Leads', metrics.assignedLeads],
      ['Unassigned Leads', metrics.unassignedLeads],
      ["Today's Follow-ups", metrics.todayFollowUps],
      ['Overdue Follow-ups', metrics.overdueFollowUps],
      ["Today's Calls", metrics.todaysCalls],
      ['Missed Calls', metrics.missedCalls],
      ['Active Agents', metrics.activeAgents],
      ['Converted Leads', metrics.convertedLeads],
      ['Active Campaigns', metrics.activeCampaigns],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `admin-report-${activeWebsiteId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    /* ✨ RICHER BACKGROUND: layered gradient mesh + stronger blobs */
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FBE9F3] via-[#FDF6FB] to-[#EDE1FB]">
      {/* Ambient color anchors */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-brand-magenta/[0.14] blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-[28rem] w-[28rem] rounded-full bg-brand-purple/[0.13] blur-3xl animate-float-slower" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-brand-rose/[0.10] blur-3xl animate-float-slow" />

      {/* Fine grid texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(139,47,214,0.10) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className={`relative space-y-6 px-1 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Admin Dashboard</h1>
            <p className="text-sm text-brand-ink/60">Good afternoon, {user?.name} 👋</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* ✨ CHANGED: stronger gradient tint + darker border */}
            <div className="group flex items-center gap-2 rounded-full border border-brand-magenta/25 bg-gradient-to-r from-brand-magenta/[0.12] to-brand-purple/[0.10] px-4 py-2 text-sm font-semibold text-brand-purple shadow-sm transition-all hover:border-brand-magenta/50 hover:shadow-md">
              <Building2 size={16} className="transition-transform group-hover:rotate-6" />
              {activeWebsite?.name}
            </div>

            <button
              onClick={handleRefresh}
              className={`rounded-full border border-brand-lilac bg-white p-2.5 shadow-sm transition-all duration-500 ${
                refreshed
                  ? 'rotate-[360deg] text-brand-magenta border-brand-magenta/40 shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]'
                  : 'text-brand-ink/60 hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta'
              }`}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>

            <button
              onClick={handleExport}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:bg-brand-magenta/[0.03] hover:shadow-md"
            >
              <Download size={14} className="transition-transform group-hover:translate-y-0.5" />
              Export
            </button>
          </div>
        </div>

        {/* ================= PROJECT OVERVIEW BANNER ================= */}
        {/* ✨ CHANGED: darker gradient base + stronger border + elevated shadow */}
        <div className="group relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl border border-brand-magenta/30 bg-gradient-to-r from-brand-magenta/[0.14] via-brand-purple/[0.10] to-brand-rose/[0.10] px-5 py-4 shadow-[0_10px_30px_-18px_rgba(227,28,121,0.5)] transition-all hover:border-brand-magenta/50 hover:shadow-[0_14px_36px_-16px_rgba(227,28,121,0.55)]">
          <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rotate-45 bg-gradient-to-br from-brand-magenta/[0.15] to-transparent" />
          <span className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-brand-purple/10 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-magenta">Project Overview</p>
              <p className="font-display text-base font-bold text-brand-ink">{activeWebsite?.name}</p>
              <p className="text-xs font-medium text-brand-ink/60">
                {agents.length} agents · {leads.length} leads · {metrics.conversionRate}% conversion
              </p>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-3">
            {[
              { label: 'This Week', value: `+${DAILY_CALL_TREND.reduce((s, d) => s + d.calls, 0)}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
              { label: 'Active Agents', value: stats.activeAgents, icon: UserCheck, color: 'text-brand-purple', bg: 'bg-violet-50', ring: 'ring-violet-200' },
              { label: 'Conversion', value: `${metrics.conversionRate}%`, icon: Target, color: 'text-brand-magenta', bg: 'bg-rose-50', ring: 'ring-rose-200' },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className={`group/pill flex items-center gap-2 rounded-full border border-white/70 ${m.bg} px-3.5 py-2 shadow-md ring-1 ${m.ring} transition-all hover:-translate-y-0.5 hover:shadow-lg`}
                >
                  <Icon size={14} className={`${m.color} transition-transform group-hover/pill:scale-110`} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-ink/50">{m.label}</p>
                    <p className="text-sm font-bold text-brand-ink">{m.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 11 KPI CARDS ================= */}
        <div className="space-y-3">
          <SectionTitle eyebrow="Live Metrics" title="Dashboard KPIs" hint="Click any card to open its module" />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            <KPICard icon={Layers}        label="Total Leads"        value={metrics.totalLeads}       color="rose"    sub="All in project"    to={ROUTES.allLeads} delay={0} />
            <KPICard icon={Sparkles}      label="New Leads"          value={metrics.newLeads}         color="purple"  sub="Fresh today"       to={ROUTES.allLeads} delay={40} />
            <KPICard icon={UserCheck}     label="Assigned Leads"     value={metrics.assignedLeads}    color="emerald" sub="With an agent"     to={ROUTES.allLeads} delay={80} />
            <KPICard icon={Users}         label="Unassigned Leads"   value={metrics.unassignedLeads}  color="amber"   sub="Awaiting action"   to={ROUTES.allLeads} alert={metrics.unassignedLeads > 0} delay={120} />
            <KPICard icon={Calendar}      label="Today's Follow-ups" value={metrics.todayFollowUps}   color="purple"  sub="Scheduled"         to={ROUTES.followUps} delay={160} />
            <KPICard icon={AlertTriangle} label="Overdue Follow-ups" value={metrics.overdueFollowUps} color="rose"    sub="Needs attention"   to={ROUTES.followUps} alert={metrics.overdueFollowUps > 0} delay={200} />
            <KPICard icon={Phone}         label="Today's Calls"      value={metrics.todaysCalls}      color="purple"  sub="Inbound + outbound" to={ROUTES.calling} delay={240} />
            <KPICard icon={PhoneMissed}   label="Missed Calls"       value={metrics.missedCalls}      color="rose"    sub="Not answered"      to={ROUTES.calling} alert={metrics.missedCalls > 0} delay={280} />
            <KPICard icon={UserCheck}     label="Active Agents"      value={metrics.activeAgents}     color="emerald" sub={`${agents.length} total`} to={ROUTES.agents} delay={320} />
            <KPICard icon={Target}        label="Converted Leads"    value={metrics.convertedLeads}   color="emerald" sub={`${metrics.conversionRate}% rate`} to={ROUTES.allLeads} delay={360} />
            <KPICard icon={Megaphone}     label="Active Campaigns"   value={metrics.activeCampaigns}  color="purple"  sub={`${campaignAnalytics.completed} completed`} to={ROUTES.campaigns} delay={400} />
          </div>
        </div>

        {/* ================= ANALYTICS SECTION ================= */}
        <div className="space-y-3">
          <SectionTitle eyebrow="Analytics" title="Performance Snapshot" hint="Live trends & breakdowns" />

          {/* ─── Lead Growth Trend + Source ─── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Lead Growth Trend */}
            <Panel
              title="Lead Growth"
              subtitle="Last 7 days"
              icon={TrendingUp}
              action={
                <div className="inline-flex items-center gap-1 rounded-full border border-brand-lilac bg-brand-mist p-1">
                  {[
                    { key: 'leads', label: 'Leads' },
                    { key: 'calls', label: 'Calls' },
                    { key: 'conversion', label: 'Conv.' },
                    { key: 'activity', label: 'Activity' },
                  ].map((v) => {
                    const active = chartView === v.key;
                    return (
                      <button
                        key={v.key}
                        onClick={() => setChartView(v.key)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
                          active
                            ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-105'
                            : 'text-brand-ink/60 hover:text-brand-magenta'
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              }
              className="lg:col-span-2"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === 'activity' ? (
                    <AreaChart data={DAILY_CALL_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E31C79" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="#E31C79" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#E9D5F5" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b5b7e', fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E31C79', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="calls" stroke="#E31C79" strokeWidth={3} fill="url(#areaGrad)" dot={{ r: 3, fill: '#E31C79', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#E31C79', stroke: '#fff', strokeWidth: 2 }} name="Activity" />
                    </AreaChart>
                  ) : chartView === 'conversion' ? (
                    <LineChart data={DAILY_CALL_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#E9D5F5" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b5b7e', fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8B2FD6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Line type="monotone" dataKey="calls" stroke="#8B2FD6" strokeWidth={3} dot={{ r: 3, fill: '#E31C79', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#E31C79', stroke: '#fff', strokeWidth: 2 }} name="Conversion %" />
                    </LineChart>
                  ) : (
                    <BarChart data={DAILY_CALL_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartView === 'leads' ? '#E31C79' : '#8B2FD6'} />
                          <stop offset="100%" stopColor={chartView === 'leads' ? '#F0388A' : '#B14FEB'} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#E9D5F5" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b5b7e', fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1E4FB', radius: 8 }} />
                      <Bar dataKey="calls" fill="url(#barGrad)" radius={[8, 8, 2, 2]} barSize={26} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Lead Source Performance */}
            <Panel title="Lead Source" subtitle={`${leadAnalytics.bySource.length} channels`} icon={BarChart3}>
              {leadAnalytics.bySource.length === 0 ? (
                <EmptyState message="No source data yet" />
              ) : (
                <div className="space-y-3">
                  {leadAnalytics.bySource.slice(0, 6).map((s, i) => (
                    <div key={s.name} className="group">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-brand-ink/80">
                          <span
                            className="h-2 w-2 rounded-full transition-transform group-hover:scale-150"
                            style={{ background: COLORS[i % COLORS.length] }}
                          />
                          {s.name}
                        </span>
                        <span className="font-mono font-bold text-brand-ink">{s.value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${(s.value / (leadAnalytics.bySource[0]?.value || 1)) * 100}%`,
                            background: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* ─── Lead Status + Agent Activity ─── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Lead Status Distribution */}
            <Panel title="Lead Status Distribution" subtitle="Pipeline snapshot" icon={Layers}>
              {leadAnalytics.byStatus.length === 0 ? (
                <EmptyState message="No status data yet" />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {leadAnalytics.byStatus.map((s, i) => {
                    const pct = Math.round((s.value / Math.max(metrics.totalLeads, 1)) * 100);
                    return (
                      <div key={s.name} className="group relative overflow-hidden rounded-xl border border-brand-lilac bg-gradient-to-br from-white to-brand-mist/60 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md">
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-magenta/[0.05] to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                        <div className="relative flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-semibold text-brand-ink/80">
                            <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            {s.name}
                          </span>
                          <span className="font-display text-lg font-bold text-brand-ink">{s.value}</span>
                        </div>
                        <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                          />
                        </div>
                        <p className="relative mt-1 font-mono text-[10px] font-semibold text-brand-ink/50">{pct}% of total</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Agent Activity / Performance */}
            <Panel
              title="Agent Performance"
              subtitle={`Top ${agentPerformance.length} of ${agents.length}`}
              icon={Award}
              action={
                <button
                  onClick={() => navigate(ROUTES.agents)}
                  className="group inline-flex items-center gap-1 text-[11px] font-semibold text-brand-magenta hover:underline"
                >
                  Manage <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              }
            >
              {agentPerformance.length === 0 ? (
                <EmptyState message="No agents yet" />
              ) : (
                <div className="space-y-2.5">
                  {agentPerformance.map((a, i) => (
                    <div
                      key={a.id}
                      className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-brand-lilac bg-gradient-to-r from-white to-brand-mist/40 p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-[0_10px_24px_-12px_rgba(227,28,121,0.35)]"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                      <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white transition-transform duration-300 group-hover:scale-110 ${
                        i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_4px_10px_-4px_rgba(245,158,11,0.5)]'
                        : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500'
                        : i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900'
                        : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
                      }`}>
                        {i < 3 ? <Award size={14} /> : `#${i + 1}`}
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white shadow-sm">
                        {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <div className="relative min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-ink">{a.name}</p>
                        <p className="truncate text-[11px] font-medium text-brand-ink/60">{a.leads} leads · {a.won} won</p>
                      </div>
                      <div className="relative flex items-center gap-2">
                        <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-brand-lilac sm:block">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000 ease-out"
                            style={{ width: `${a.rate}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-brand-magenta">{a.rate}%</span>
                      </div>
                      <span className={`relative shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        a.status === 'Active' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* ─── Calling Performance + Follow-up Activity ─── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Calling Performance */}
            <Panel title="Calling Performance" subtitle={`${calls.length} calls total`} icon={Phone}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatTile icon={Phone}         label="Total"     value={calls.length}            color="purple" />
                <StatTile icon={PhoneIncoming} label="Inbound"   value={callAnalytics.inbound}   color="emerald" />
                <StatTile icon={PhoneOutgoing} label="Outbound"  value={callAnalytics.outbound}  color="purple" />
                <StatTile icon={PhoneMissed}   label="Missed"    value={callAnalytics.missed}    color="rose" />
                <StatTile icon={CheckCircle2}  label="Connected" value={callAnalytics.connected} color="emerald" />
                <StatTile icon={XCircle}       label="Failed"    value={calls.length - callAnalytics.connected - callAnalytics.missed} color="rose" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="relative overflow-hidden rounded-xl border border-brand-lilac bg-gradient-to-br from-brand-magenta/[0.06] to-white p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md">
                  <span className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full bg-gradient-to-br from-brand-magenta/[0.15] to-transparent blur-xl" />
                  <p className="relative font-mono text-[10px] uppercase tracking-wider text-brand-ink/60">Total Duration</p>
                  <p className="relative mt-1 font-display text-lg font-bold text-brand-ink">{Math.floor(callAnalytics.totalDuration / 60)}m</p>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-brand-lilac bg-gradient-to-br from-brand-purple/[0.06] to-white p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-purple/40 hover:shadow-md">
                  <span className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full bg-gradient-to-br from-brand-purple/[0.15] to-transparent blur-xl" />
                  <p className="relative font-mono text-[10px] uppercase tracking-wider text-brand-ink/60">Avg Duration</p>
                  <p className="relative mt-1 font-display text-lg font-bold text-brand-ink">{callAnalytics.avgDuration}s</p>
                </div>
              </div>
            </Panel>

            {/* Follow-Up Activity */}
            <Panel title="Follow-Up Activity" subtitle={`${followUps.length} follow-ups total`} icon={Calendar}>
              <div className="grid grid-cols-2 gap-3">
                <StatTile icon={Calendar}      label="Today"     value={followUpAnalytics.today}     color="purple" />
                <StatTile icon={Calendar}      label="Upcoming"  value={followUpAnalytics.upcoming}  color="emerald" />
                <StatTile icon={AlertTriangle} label="Overdue"   value={followUpAnalytics.overdue}   color="rose" alert={followUpAnalytics.overdue > 0} />
                <StatTile icon={CheckCircle2}  label="Completed" value={followUpAnalytics.completed} color="emerald" />
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/60">Compliance</span>
                  <span className="font-display text-sm font-bold text-brand-magenta">
                    {followUps.length
                      ? Math.round(((followUps.length - followUpAnalytics.overdue) / followUps.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000 ease-out"
                    style={{ width: `${followUps.length ? ((followUps.length - followUpAnalytics.overdue) / followUps.length) * 100 : 0}%` }}
                  >
                    <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* ─── Campaign Performance + Conversion Trend ─── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Campaign Performance */}
            <Panel title="Campaign Performance" subtitle={`${campaigns.length} campaigns`} icon={Megaphone}>
              {campaigns.length === 0 ? (
                <EmptyState message="No campaigns yet" />
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatTile label="Active"     value={campaignAnalytics.active}     color="emerald" />
                  <StatTile label="Completed"  value={campaignAnalytics.completed}  color="purple" />
                  <StatTile label="Leads"      value={campaignAnalytics.totalLeads} color="rose" />
                  <StatTile label="Calls"      value={campaignAnalytics.totalCalls} color="purple" />
                  <StatTile label="Connected"  value={campaignAnalytics.connected}  color="emerald" />
                  <StatTile label="Interested" value={campaignAnalytics.interested} color="amber" />
                  <StatTile label="Converted"  value={campaignAnalytics.converted}  color="emerald" />
                  <StatTile label="Rate"       value={`${campaignAnalytics.totalLeads ? Math.round((campaignAnalytics.converted / campaignAnalytics.totalLeads) * 100) : 0}%`} color="rose" />
                </div>
              )}
            </Panel>

            {/* Conversion Trend */}
            <Panel title="Conversion Trend" subtitle="Leads → Calls → Won" icon={Target}>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between rounded-xl border border-brand-lilac bg-gradient-to-r from-white to-brand-mist/50 p-3 shadow-sm transition-colors hover:border-brand-magenta/40">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-brand-magenta ring-1 ring-rose-200 transition-transform hover:scale-110">
                      <Layers size={16} />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/60">Total Leads</p>
                      <p className="font-display text-lg font-bold text-brand-ink">{metrics.totalLeads}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="animate-pulse text-brand-magenta/60" />
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-brand-purple ring-1 ring-violet-200 transition-transform hover:scale-110">
                      <Phone size={16} />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/60">Calls</p>
                      <p className="font-display text-lg font-bold text-brand-ink">{calls.length}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="animate-pulse text-brand-magenta/60" />
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200 transition-transform hover:scale-110">
                      <CheckCircle2 size={16} />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/60">Won</p>
                      <p className="font-display text-lg font-bold text-emerald-600">{metrics.convertedLeads}</p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-brand-magenta/25 bg-gradient-to-br from-brand-magenta/[0.10] via-brand-purple/[0.06] to-transparent p-4 shadow-sm">
                  <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-magenta/15 blur-2xl" />
                  <div className="relative flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-ink/60">Overall Conversion</span>
                    <span className="font-display text-2xl font-bold text-brand-magenta">{metrics.conversionRate}%</span>
                  </div>
                  <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-white/60">
                    <div
                      className="relative h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000 ease-out"
                      style={{ width: `${metrics.conversionRate}%` }}
                    >
                      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    </div>
                  </div>
                  <p className="relative mt-2 text-[11px] font-medium text-brand-ink/60">
                    {metrics.convertedLeads} of {metrics.totalLeads} leads converted
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* ================= 7 QUICK ACTIONS ================= */}
        <div className="space-y-3">
          <SectionTitle eyebrow="Shortcuts" title="Quick Actions" hint="Jump straight to common tasks" />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {[
              { label: 'Add Lead',           icon: Plus,        to: ROUTES.allLeads,  tone: 'magenta' },
              { label: 'Assign Leads',       icon: UserPlus,    to: ROUTES.allLeads,  tone: 'purple' },
              { label: 'Create Campaign',    icon: Megaphone,   to: ROUTES.campaigns, tone: 'amber' },
              { label: 'Schedule Follow-up', icon: Calendar,    to: ROUTES.followUps, tone: 'emerald' },
              { label: 'View Missed Calls',  icon: PhoneMissed, to: ROUTES.calling,   tone: 'rose' },
              { label: "Today's Tasks",      icon: ListChecks,  to: ROUTES.tasks,     tone: 'purple' },
              { label: 'View Reports',       icon: BarChart3,   to: ROUTES.reports,   tone: 'emerald' },
            ].map(({ label, icon: Icon, to, tone }, idx) => (
              <QuickAction key={label} label={label} icon={Icon} to={to} tone={tone} delay={idx * 40} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function SectionTitle({ eyebrow, title, hint }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple shadow-[0_0_12px_rgba(227,28,121,0.4)]" />
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-brand-magenta">{eyebrow}</p>
          <h2 className="font-display text-sm font-bold text-brand-ink">{title}</h2>
        </div>
      </div>
      {hint && <p className="text-[11px] font-medium text-brand-ink/50">{hint}</p>}
    </div>
  );
}

/* ✨ Panel now has a subtle warm gradient base + defined border */
function Panel({ title, subtitle, action, icon: Icon, className = '', children }) {
  return (
    <div className={`group/panel relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-white via-white to-brand-mist/40 shadow-[0_4px_16px_-8px_rgba(139,47,214,0.15)] backdrop-blur-sm transition-all duration-300 hover:border-brand-magenta/35 hover:shadow-[0_14px_36px_-16px_rgba(227,28,121,0.28)] ${className}`}>
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand-magenta/40 to-transparent opacity-70 transition-opacity duration-500 group-hover/panel:opacity-100" />

      <div className="flex items-start justify-between gap-3 border-b border-brand-lilac/70 bg-gradient-to-r from-brand-mist/60 to-transparent px-5 py-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-[0_4px_12px_-4px_rgba(227,28,121,0.5)] transition-transform group-hover/panel:scale-110 group-hover/panel:rotate-3">
              <Icon size={15} />
            </span>
          )}
          <div>
            <h2 className="font-display text-[15px] font-bold leading-tight text-brand-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11px] font-medium text-brand-ink/60">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ================= KPI CARD ================= */
function KPICard({ icon: Icon, label, value, color = 'purple', sub, to, alert, delay = 0 }) {
  const navigate = useNavigate();
  const themes = {
    purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'bg-violet-50', fg: 'text-brand-purple', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(139,47,214,0.55)]', bar: 'from-brand-purple to-brand-magenta', corner: 'bg-brand-purple/25', ring: 'ring-violet-100' },
    emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'bg-emerald-50', fg: 'text-emerald-600', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(16,185,129,0.5)]', bar: 'from-emerald-500 to-emerald-400', corner: 'bg-emerald-400/25', ring: 'ring-emerald-100' },
    amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'bg-amber-50', fg: 'text-amber-600', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(245,158,11,0.5)]', bar: 'from-amber-500 to-orange-400', corner: 'bg-amber-400/25', ring: 'ring-amber-100' },
    rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'bg-rose-50', fg: 'text-brand-magenta', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(227,28,121,0.55)]', bar: 'from-brand-magenta to-brand-purple', corner: 'bg-brand-magenta/25', ring: 'ring-rose-100' },
  };
  const t = themes[color];

  return (
    <button
      onClick={() => to && navigate(to)}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/40 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 ease-out ${t.border} ${t.glow} hover:-translate-y-1.5 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brand-magenta/40 animate-fade-slide-in`}
    >
      <span className={`absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.corner} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      {alert && (
        <span className="pointer-events-none absolute right-3 top-3 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
      )}

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${t.border} ${t.bg} ${t.fg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={16} />
        </span>
        <ChevronRight size={14} className="mt-1 -translate-x-2 text-brand-ink/30 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-brand-magenta group-hover:opacity-100" />
      </div>

      <div className="relative z-10 w-full">
        <p className="font-display text-2xl font-bold leading-tight text-brand-ink">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </button>
  );
}

/* ================= STAT TILE ================= */
function StatTile({ icon: Icon, label, value, color = 'purple', alert }) {
  const colors = {
    purple:  'bg-gradient-to-br from-violet-50 to-violet-100/60 text-brand-purple border-violet-200 ring-violet-100',
    emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-600 border-emerald-200 ring-emerald-100',
    amber:   'bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-600 border-amber-200 ring-amber-100',
    rose:    'bg-gradient-to-br from-rose-50 to-rose-100/60 text-brand-magenta border-rose-200 ring-rose-100',
  };
  return (
    <div className={`group relative overflow-hidden rounded-xl border ${colors[color]} p-3 shadow-sm ring-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {alert && (
        <span className="absolute right-2 top-2 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
        </span>
      )}
      {Icon && (
        <div className="relative flex items-center gap-1.5">
          <Icon size={12} className="transition-transform duration-300 group-hover:scale-125" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
        </div>
      )}
      {!Icon && <p className="relative font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>}
      <p className="relative mt-1 font-display text-lg font-bold">{value?.toLocaleString?.() ?? value}</p>
    </div>
  );
}

/* ================= QUICK ACTION ================= */
function QuickAction({ label, icon: Icon, to, tone, delay = 0 }) {
  const navigate = useNavigate();
  const tones = {
    magenta: { from: 'from-brand-magenta', to: 'to-brand-purple', shadow: 'shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)]', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(227,28,121,0.6)]', border: 'hover:border-brand-magenta/60', ring: 'ring-rose-100' },
    purple:  { from: 'from-brand-purple', to: 'to-brand-magenta', shadow: 'shadow-[0_6px_18px_-6px_rgba(139,47,214,0.6)]', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(139,47,214,0.6)]', border: 'hover:border-brand-purple/60', ring: 'ring-violet-100' },
    amber:   { from: 'from-amber-500', to: 'to-orange-500', shadow: 'shadow-[0_6px_18px_-6px_rgba(245,158,11,0.6)]', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(245,158,11,0.6)]', border: 'hover:border-amber-400', ring: 'ring-amber-100' },
    emerald: { from: 'from-emerald-500', to: 'to-emerald-400', shadow: 'shadow-[0_6px_18px_-6px_rgba(16,185,129,0.6)]', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(16,185,129,0.6)]', border: 'hover:border-emerald-400', ring: 'ring-emerald-100' },
    rose:    { from: 'from-rose-500', to: 'to-brand-magenta', shadow: 'shadow-[0_6px_18px_-6px_rgba(244,63,94,0.6)]', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(244,63,94,0.6)]', border: 'hover:border-rose-400', ring: 'ring-rose-100' },
  };
  const t = tones[tone] || tones.magenta;

  return (
    <button
      onClick={() => navigate(to)}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-white via-white to-brand-mist/50 p-4 shadow-[0_4px_16px_-8px_rgba(139,47,214,0.15)] transition-all duration-300 hover:-translate-y-1.5 ${t.border} ${t.glow} animate-fade-slide-in`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-magenta/[0.08] to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <span className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.from} ${t.to} text-white ${t.shadow} ring-2 ${t.ring} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
        <Icon size={18} />
      </span>
      <span className="relative text-center text-xs font-semibold text-brand-ink leading-tight">{label}</span>
    </button>
  );
}

/* ================= CUSTOM TOOLTIP ================= */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-brand-magenta/30 bg-white px-3 py-2 shadow-[0_8px_24px_-8px_rgba(227,28,121,0.4)]">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-magenta">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="mt-0.5 font-display text-sm font-bold text-brand-ink">
          {p.value}
          {p.name && <span className="ml-1 text-xs font-normal text-brand-ink/60">{p.name}</span>}
        </p>
      ))}
    </div>
  );
}

/* ================= EMPTY STATE ================= */
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-brand-ink/50">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta/15 to-brand-purple/10 ring-1 ring-brand-lilac animate-pulse">
        <BarChart3 size={18} className="text-brand-magenta" />
      </span>
      <p className="text-xs font-medium">{message}</p>
    </div>
  );
}