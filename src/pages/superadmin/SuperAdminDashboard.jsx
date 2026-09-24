// src/pages/superadmin/SuperAdminDashboard.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Phone, PhoneMissed, UserCheck, Globe2, TrendingUp, TrendingDown,
  Building2, Activity, Zap, Award, Clock, ArrowRight, Eye, BarChart3,
  PieChart as PieIcon, Sparkles, UserCog, Target, Megaphone, Calendar,
  MessageSquare, Coins, Plug, FileText, Shield, AlertTriangle,
  CheckCircle2, XCircle, PhoneIncoming, PhoneOutgoing, Layers,
  RefreshCw, Download, Filter, ChevronRight, ChevronDown, Headphones, Check,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';

import { useAuth } from '../../context/AuthContext';
import {
  PROJECTS, WEBSITES, AGENTS, ADMINS, LEADS, CALLS, FOLLOW_UPS, CAMPAIGNS,
  COMMUNICATIONS, CREDITS, INTEGRATIONS, SYSTEM_LOGS, CUSTOMERS,
  DAILY_CALL_TREND, statsForProject,
} from '../../data/mockData';

const COLORS = ['#E31C79', '#8B2FD6', '#F0388A', '#6D28D9', '#26A69A', '#FF9800'];

export default function SuperAdminDashboard() {
  const { user, activeWebsiteId, activeWebsite, setActiveWebsiteId } = useAuth();
  const navigate = useNavigate();
  const [chartView, setChartView] = useState('leads');
  const [refreshed, setRefreshed] = useState(false);
  const [projectFilter, setProjectFilter] = useState('all'); // 'all' | projectId
  const [filterOpen, setFilterOpen] = useState(false);

  /* ==================== PROJECT OPTIONS ==================== */
  const projectOptions = useMemo(
    () => [
      { id: 'all', name: 'All Projects', code: 'ALL', status: 'Aggregate' },
      ...PROJECTS.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status,
      })),
    ],
    []
  );

  const activeProjectOption = useMemo(
    () => projectOptions.find((o) => o.id === projectFilter) || projectOptions[0],
    [projectFilter, projectOptions]
  );

  const isAllProjects = projectFilter === 'all';

  /* ==================== HELPER: SCOPED FILTERS ==================== */
  const scopedProjects = useMemo(
    () => (isAllProjects ? PROJECTS : PROJECTS.filter((p) => p.id === projectFilter)),
    [isAllProjects, projectFilter]
  );

  const scopedLeads = useMemo(
    () =>
      isAllProjects
        ? LEADS
        : LEADS.filter((l) => l.websiteId === projectFilter),
    [isAllProjects, projectFilter]
  );

  const scopedCalls = useMemo(
    () =>
      isAllProjects
        ? CALLS
        : CALLS.filter((c) => c.projectId === projectFilter),
    [isAllProjects, projectFilter]
  );

  const scopedAgents = useMemo(
    () =>
      isAllProjects
        ? AGENTS
        : AGENTS.filter((a) => a.websiteId === projectFilter),
    [isAllProjects, projectFilter]
  );

  const scopedAdmins = useMemo(
    () =>
      isAllProjects
        ? ADMINS
        : ADMINS.filter((a) => a.projectId === projectFilter),
    [isAllProjects, projectFilter]
  );

  const scopedFollowUps = useMemo(
    () =>
      isAllProjects
        ? FOLLOW_UPS
        : FOLLOW_UPS.filter((f) => f.projectId === projectFilter),
    [isAllProjects, projectFilter]
  );

  const scopedCampaigns = useMemo(
    () =>
      isAllProjects
        ? CAMPAIGNS
        : CAMPAIGNS.filter((c) => c.projectId === projectFilter),
    [isAllProjects, projectFilter]
  );

  const scopedCommunications = useMemo(
    () =>
      isAllProjects
        ? COMMUNICATIONS
        : COMMUNICATIONS.filter((c) => c.projectId === projectFilter),
    [isAllProjects, projectFilter]
  );

  const scopedCredits = useMemo(
    () =>
      isAllProjects
        ? CREDITS
        : CREDITS.filter((c) => c.projectId === projectFilter),
    [isAllProjects, projectFilter]
  );

  /* ==================== GLOBAL STATS (filtered) ==================== */
  const globalStats = useMemo(() => {
    const totalProjects = scopedProjects.length;
    const activeProjects = scopedProjects.filter((p) => p.status === 'Active').length;
    const totalAdmins = scopedAdmins.length;
    const activeAdmins = scopedAdmins.filter((a) => a.status === 'Active').length;
    const totalAgents = scopedAgents.length;
    const activeAgents = scopedAgents.filter((a) => a.status === 'Active').length;
    const totalLeads = scopedLeads.length;
    const totalCustomers = isAllProjects
      ? CUSTOMERS.length
      : CUSTOMERS.filter((c) => c.projectId === projectFilter).length;
    const totalCalls = scopedCalls.length;
    const todaysCalls = scopedCalls.filter((c) => c.date === '2026-09-22').length;
    const pendingFollowUps = scopedFollowUps.filter(
      (f) => f.status === 'Today' || f.status === 'Overdue'
    ).length;
    const activeCampaigns = scopedCampaigns.filter((c) => c.status === 'Active').length;
    const conversions = scopedLeads.filter((l) => l.status === 'Won').length;
    const newLeadsToday = scopedLeads.filter((l) => l.status === 'Fresh').length;
    const systemAlerts = 3;

    return {
      totalProjects, activeProjects, totalAdmins, activeAdmins,
      totalAgents, activeAgents, totalLeads, newLeadsToday, totalCustomers,
      conversions, totalCalls, todaysCalls, pendingFollowUps,
      activeCampaigns, systemAlerts,
    };
  }, [scopedProjects, scopedAdmins, scopedAgents, scopedLeads, scopedCalls, scopedFollowUps, scopedCampaigns, isAllProjects, projectFilter]);

  /* ==================== PROJECT PERFORMANCE ==================== */
  const projectPerformance = useMemo(() => {
    const list = isAllProjects ? PROJECTS : PROJECTS.filter((p) => p.id === projectFilter);
    return list.map((p) => {
      const stats = statsForProject(p.id);
      const projectAgents = AGENTS.filter((a) => a.websiteId === p.id).length;
      const projectCalls = CALLS.filter((c) => c.projectId === p.id).length;
      const projectFollowUps = FOLLOW_UPS.filter((f) => f.projectId === p.id).length;
      const projectLeads = LEADS.filter((l) => l.websiteId === p.id);
      const converted = projectLeads.filter((l) => l.status === 'Won').length;

      return {
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status,
        plan: p.plan,
        leads: stats.totalLeads,
        agents: projectAgents,
        calls: projectCalls,
        followUps: projectFollowUps,
        converted,
        conversionRate: stats.totalLeads > 0 ? Math.round((converted / stats.totalLeads) * 100) : 0,
      };
    });
  }, [isAllProjects, projectFilter]);

  const topProjects = useMemo(
    () => [...projectPerformance].sort((a, b) => b.leads - a.leads),
    [projectPerformance]
  );

  const maxLeads = useMemo(
    () => Math.max(...projectPerformance.map((p) => p.leads), 1),
    [projectPerformance]
  );

  /* ==================== LEAD ANALYTICS ==================== */
  const leadAnalytics = useMemo(() => {
    const bySource = {};
    const byCategory = {};
    const byStatus = {};
    scopedLeads.forEach((l) => {
      bySource[l.leadSource] = (bySource[l.leadSource] || 0) + 1;
      byCategory[l.category] = (byCategory[l.category] || 0) + 1;
      byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    });
    return {
      bySource: Object.entries(bySource).map(([name, value]) => ({ name, value })),
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
      assigned: scopedLeads.filter((l) => l.assignedAgent).length,
      unassigned: scopedLeads.filter((l) => !l.assignedAgent).length,
      contacted: scopedLeads.filter((l) => l.status !== 'Fresh').length,
      followUp: scopedLeads.filter((l) => l.status === 'Follow Up').length,
      qualified: scopedLeads.filter((l) => l.status === 'Follow Up' || l.status === 'Won').length,
      converted: scopedLeads.filter((l) => l.status === 'Won').length,
      lost: scopedLeads.filter((l) => l.status === 'Missed').length,
    };
  }, [scopedLeads]);

  /* ==================== CALL ANALYTICS ==================== */
  const callAnalytics = useMemo(() => {
    const inbound = scopedCalls.filter((c) => c.type === 'inbound').length;
    const outbound = scopedCalls.filter((c) => c.type === 'outbound').length;
    const missed = scopedCalls.filter((c) => c.status === 'missed').length;
    const connected = scopedCalls.filter((c) => c.status === 'connected').length;
    const failed = scopedCalls.filter((c) => c.status === 'failed').length;
    const totalDuration = scopedCalls.reduce((sum, c) => {
      const [m, s] = c.duration.split(':').map(Number);
      return sum + m * 60 + s;
    }, 0);
    const avgDuration = scopedCalls.length > 0 ? Math.round(totalDuration / scopedCalls.length) : 0;
    return { inbound, outbound, missed, connected, failed, totalDuration, avgDuration };
  }, [scopedCalls]);

  /* ==================== FOLLOW-UP ANALYTICS ==================== */
  const followUpAnalytics = useMemo(() => {
    return {
      today: scopedFollowUps.filter((f) => f.status === 'Today').length,
      upcoming: scopedFollowUps.filter((f) => f.status === 'Upcoming').length,
      overdue: scopedFollowUps.filter((f) => f.status === 'Overdue').length,
      completed: scopedFollowUps.filter((f) => f.status === 'Completed').length,
    };
  }, [scopedFollowUps]);

  /* ==================== CAMPAIGN ANALYTICS ==================== */
  const campaignAnalytics = useMemo(() => {
    const active = scopedCampaigns.filter((c) => c.status === 'Active');
    const completed = scopedCampaigns.filter((c) => c.status === 'Completed');
    return {
      active: active.length,
      completed: completed.length,
      totalLeads: scopedCampaigns.reduce((s, c) => s + c.leads, 0),
      totalCalls: scopedCampaigns.reduce((s, c) => s + c.calls, 0),
      connected: scopedCampaigns.reduce((s, c) => s + c.connected, 0),
      interested: scopedCampaigns.reduce((s, c) => s + c.interested, 0),
      converted: scopedCampaigns.reduce((s, c) => s + c.converted, 0),
    };
  }, [scopedCampaigns]);

  /* ==================== AGENT ALLOCATION ==================== */
  const agentPieData = useMemo(
    () =>
      scopedAgents.map((a) => ({
        name: a.name,
        value: a.leadsAssigned || 0,
      })),
    [scopedAgents]
  );
  const totalPie = agentPieData.reduce((s, d) => s + d.value, 0) || 1;

  /* ==================== SOURCE BREAKDOWN ==================== */
  const sourceBreakdown = useMemo(() => {
    const sources = {};
    scopedLeads.forEach((l) => {
      sources[l.leadSource] = (sources[l.leadSource] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [scopedLeads]);

  /* ==================== RECENT ACTIVITY ==================== */
  const recentActivity = useMemo(() => {
    let logs = SYSTEM_LOGS;
    if (!isAllProjects) {
      logs = logs.filter((l) => l.projectId === projectFilter);
    }
    return logs.slice(0, 5).map((log) => ({
      id: log.id,
      at: log.at,
      user: log.user,
      role: log.role,
      action: log.action,
      target: log.target,
    }));
  }, [isAllProjects, projectFilter]);

  /* ==================== HELPERS ==================== */
  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1200);
  };

  const handleExport = () => {
    const rows = [
      ['Platform Report'],
      ['Filter', activeProjectOption.name],
      ['Total Projects', globalStats.totalProjects],
      ['Active Projects', globalStats.activeProjects],
      ['Total Admins', globalStats.totalAdmins],
      ['Total Agents', globalStats.totalAgents],
      ['Total Leads', globalStats.totalLeads],
      ['Total Customers', globalStats.totalCustomers],
      ['Total Calls', globalStats.totalCalls],
      ['Conversions', globalStats.conversions],
      ['Active Campaigns', globalStats.activeCampaigns],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-report-${projectFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilterSelect = (id) => {
    setProjectFilter(id);
    setFilterOpen(false);
    if (id !== 'all') {
      setActiveWebsiteId(id);
    }
  };

  const openProject = (id, status) => {
    if (status === 'Blocked') {
      alert('This project is blocked.');
      return;
    }
    setActiveWebsiteId(id);
    navigate('/superadmin/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-brand-ink/50">
            Good afternoon, {user?.name || 'SuperAdmin'} 👋 — Centralized platform overview
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ========== PROJECT FILTER ========== */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen((f) => !f)}
              className="group flex items-center gap-2 rounded-xl border-2 border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink shadow-sm transition-all hover:border-violet-400 hover:shadow-md"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-[9px] font-bold text-white">
                {activeProjectOption.code}
              </span>
              <span className="hidden sm:inline text-brand-purple">
                {activeProjectOption.name}
              </span>
              <ChevronDown
                size={14}
                className={`text-brand-purple transition-transform duration-300 ${
                  filterOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-xl border border-brand-lilac bg-white shadow-panel animate-dropdown">
                  <div className="border-b border-brand-lilac/60 bg-brand-mist/50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">
                      Filter by Project
                    </p>
                    <p className="text-xs text-brand-ink/60 mt-0.5">
                      Showing data for one or all projects
                    </p>
                  </div>

                  <div className="p-1 max-h-72 overflow-y-auto">
                    {/* All Projects */}
                    <button
                      onClick={() => handleFilterSelect('all')}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        projectFilter === 'all'
                          ? 'bg-brand-lilac/60'
                          : 'hover:bg-brand-lilac/40'
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                        ALL
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-ink">
                          All Projects
                        </p>
                        <p className="truncate text-[10px] text-brand-ink/50">
                          Aggregate view across the platform
                        </p>
                      </div>
                      {projectFilter === 'all' && (
                        <Check size={14} className="shrink-0 text-brand-purple" />
                      )}
                    </button>

                    {/* Individual Projects */}
                    {PROJECTS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleFilterSelect(p.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          projectFilter === p.id
                            ? 'bg-brand-lilac/60'
                            : 'hover:bg-brand-lilac/40'
                        }`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                          {p.code}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brand-ink">
                            {p.name}
                          </p>
                          <p className="truncate text-[10px] text-brand-ink/50">
                            {p.businessType || 'General'}
                          </p>
                        </div>
                        {projectFilter === p.id ? (
                          <Check size={14} className="shrink-0 text-brand-purple" />
                        ) : (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                              p.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-600'
                                : p.status === 'Trial'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-rose-100 text-rose-600'
                            }`}
                          >
                            {p.status}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className={`rounded-lg border border-brand-lilac bg-white p-2 transition-all ${
              refreshed ? 'rotate-180 text-brand-magenta' : 'text-brand-ink/60 hover:bg-brand-lilac/40'
            }`}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <Download size={14} /> Export
          </button>

          {globalStats.systemAlerts > 0 && (
            <div className="relative">
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                <AlertTriangle size={14} />
                {globalStats.systemAlerts} alerts
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= ACTIVE FILTER BANNER ================= */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 ${
          isAllProjects
            ? 'border-violet-200 bg-gradient-to-r from-violet-50 via-white to-violet-50'
            : 'border-brand-purple/40 bg-gradient-to-r from-brand-purple/10 via-brand-magenta/5 to-brand-purple/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-[11px] font-bold text-white shadow-sm">
            {activeProjectOption.code}
          </span>
          <div>
            <p className="text-xs text-brand-ink/50">
              {isAllProjects ? 'Viewing' : 'Filtered to'}
            </p>
            <p className="font-display text-sm font-bold text-brand-ink">
              {activeProjectOption.name}
            </p>
          </div>
        </div>

        {!isAllProjects && (
          <button
            onClick={() => handleFilterSelect('all')}
            className="rounded-lg border border-brand-purple/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand-purple hover:bg-brand-lilac/40"
          >
            Clear filter — show all
          </button>
        )}
      </div>

      {/* ================= PLATFORM KPI CARDS ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-brand-magenta" />
            <h2 className="font-display text-sm font-semibold text-brand-ink">
              {isAllProjects ? 'Platform KPIs' : `${activeProjectOption.name} — KPIs`}
            </h2>
          </div>
          <p className="text-[11px] text-brand-ink/40">
            Click any card to navigate
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          <KPICard
            icon={Building2}
            label={isAllProjects ? 'Projects' : 'Project'}
            value={globalStats.totalProjects}
            color="purple"
            sub={`${globalStats.activeProjects} active`}
            to="/superadmin/projects"
          />
          <KPICard
            icon={UserCog}
            label="Admins"
            value={globalStats.totalAdmins}
            color="purple"
            sub={`${globalStats.activeAdmins} active`}
            to="/superadmin/admins"
          />
          <KPICard
            icon={Users}
            label="Agents"
            value={globalStats.totalAgents}
            color="purple"
            sub={`${globalStats.activeAgents} active`}
            to="/superadmin/agents"
          />
          <KPICard
            icon={Layers}
            label="Leads"
            value={globalStats.totalLeads}
            color="rose"
            sub={`${globalStats.newLeadsToday} new today`}
            to="/superadmin/leads"
          />
          <KPICard
            icon={Users}
            label="Customers"
            value={globalStats.totalCustomers}
            color="purple"
            sub="Total unique"
            to="/superadmin/customers"
          />
          <KPICard
            icon={Target}
            label="Conversions"
            value={globalStats.conversions}
            color="emerald"
            sub="Won leads"
            to="/superadmin/leads"
          />
          <KPICard
            icon={Phone}
            label="Calls Today"
            value={globalStats.todaysCalls}
            color="amber"
            sub={`${globalStats.totalCalls} total`}
            to="/superadmin/calling"
          />
          <KPICard
            icon={Calendar}
            label="Follow-Ups"
            value={globalStats.pendingFollowUps}
            color="rose"
            sub="Pending"
            to="/superadmin/follow-ups"
          />
          <KPICard
            icon={Megaphone}
            label="Campaigns"
            value={globalStats.activeCampaigns}
            color="purple"
            sub={`${campaignAnalytics.completed} done`}
            to="/superadmin/campaigns"
          />
          <KPICard
            icon={MessageSquare}
            label="Messages"
            value={scopedCommunications.length}
            color="rose"
            sub="SMS + WA + Email"
            to="/superadmin/communication"
          />
          <KPICard
            icon={Coins}
            label="Credits Used"
            value={scopedCredits.reduce((s, c) => s + c.used, 0)}
            color="amber"
            sub={`${scopedCredits.reduce((s, c) => s + c.balance, 0).toLocaleString()} left`}
            to="/superadmin/credits"
          />
          <KPICard
            icon={AlertTriangle}
            label="Alerts"
            value={globalStats.systemAlerts}
            color="rose"
            sub="Needs attention"
            to="/superadmin/logs"
            pulse
          />
        </div>
      </div>

      {/* ================= PROJECT PERFORMANCE ================= */}
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-brand-ink">
              {isAllProjects ? 'Project Performance' : `${activeProjectOption.name} Performance`}
            </h2>
            <p className="text-xs text-brand-ink/50">
              {isAllProjects ? 'Compare activity across all projects' : 'Project activity breakdown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/superadmin/projects')}
              className="flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
            >
              Manage Projects <ArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left: Bars */}
          <div className="space-y-3">
            {topProjects.map((p, idx) => (
              <div key={p.id} className="rounded-xl border-2 border-brand-lilac/70 bg-white p-3 transition-all hover:border-brand-purple/40 hover:shadow-md">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                      {p.code}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-ink">{p.name}</p>
                      <p className="text-[10px] text-brand-ink/50">
                        {p.plan} • {p.agents} agents
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-brand-ink">{p.leads}</p>
                    <p className="text-[10px] text-brand-ink/50">leads</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta transition-all duration-1000"
                    style={{ width: `${(p.leads / maxLeads) * 100}%` }}
                  />
                </div>

                {/* Metrics */}
                <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[10px]">
                  <div>
                    <p className="text-brand-ink/50">Calls</p>
                    <p className="font-bold text-brand-ink">{p.calls}</p>
                  </div>
                  <div>
                    <p className="text-brand-ink/50">Follow-ups</p>
                    <p className="font-bold text-brand-ink">{p.followUps}</p>
                  </div>
                  <div>
                    <p className="text-brand-ink/50">Won</p>
                    <p className="font-bold text-emerald-600">{p.converted}</p>
                  </div>
                  <div>
                    <p className="text-brand-ink/50">Conv.</p>
                    <p className="font-bold text-brand-purple">{p.conversionRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Comparison bar chart */}
          <div className="rounded-xl border-2 border-brand-lilac/70 p-3">
            <h3 className="mb-3 text-xs font-semibold text-brand-ink/70">
              {isAllProjects ? 'Leads vs Calls vs Conversions' : `${activeProjectOption.name} Comparison`}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectPerformance.map((p) => ({
                    name: p.code,
                    Leads: p.leads,
                    Calls: p.calls,
                    Won: p.converted,
                  }))}
                >
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
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #F1E4FB',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Leads" fill="#E31C79" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Calls" fill="#8B2FD6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Won" fill="#26A69A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CHART + AGENT PIE ================= */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Chart switcher */}
        <div className="card xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                {chartView === 'leads' && 'Leads — Last 7 Days'}
                {chartView === 'calls' && 'Calls — Last 7 Days'}
                {chartView === 'conversion' && 'Conversion Trend'}
                {chartView === 'activity' && 'Activity Trend'}
              </h2>
              <p className="text-xs text-brand-ink/40">
                {activeProjectOption.name}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-brand-lilac bg-white p-0.5">
              {[
                { key: 'leads', label: 'Leads' },
                { key: 'calls', label: 'Calls' },
                { key: 'activity', label: 'Activity' },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setChartView(v.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    chartView === v.key
                      ? 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card'
                      : 'text-brand-ink/50 hover:text-brand-purple'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'activity' ? (
                <AreaChart data={DAILY_CALL_TREND}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B2FD6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8B2FD6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                  <Area type="monotone" dataKey="calls" stroke="#8B2FD6" strokeWidth={3} fill="url(#areaGrad)" name="Activity" />
                </AreaChart>
              ) : chartView === 'conversion' ? (
                <LineChart data={DAILY_CALL_TREND}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                  <Line type="monotone" dataKey="calls" stroke="#8B2FD6" strokeWidth={3} dot={{ fill: '#E31C79', r: 4 }} name="Conversion %" />
                </LineChart>
              ) : (
                <BarChart data={DAILY_CALL_TREND}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#F1E4FB' }} contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
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

        {/* Agent allocation */}
        <div className="card flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Agent Allocation
            </h2>
            <PieIcon size={14} className="text-brand-purple" />
          </div>

          {agentPieData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-xs text-brand-ink/50">
              No agents in this project
            </div>
          ) : (
            <>
              <div className="relative mx-auto h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={agentPieData}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {agentPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-display text-xl font-bold text-brand-ink">{totalPie}</p>
                  <p className="text-[10px] text-brand-ink/50">Leads</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {agentPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-brand-ink/70">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-brand-ink">
                      {d.value} ({totalPie ? Math.round((d.value / totalPie) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= LEAD ANALYTICS ================= */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Lead Analytics
            </h2>
            <p className="text-xs text-brand-ink/50">
              {isAllProjects ? 'Leads across the platform' : `Leads for ${activeProjectOption.name}`}
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-9">
          <LeadStatBox label="Total" value={globalStats.totalLeads} color="purple" />
          <LeadStatBox label="New Today" value={globalStats.newLeadsToday} color="rose" />
          <LeadStatBox label="Assigned" value={leadAnalytics.assigned} color="emerald" />
          <LeadStatBox label="Unassigned" value={leadAnalytics.unassigned} color="amber" />
          <LeadStatBox label="Contacted" value={leadAnalytics.contacted} color="purple" />
          <LeadStatBox label="Follow-up" value={leadAnalytics.followUp} color="amber" />
          <LeadStatBox label="Qualified" value={leadAnalytics.qualified} color="emerald" />
          <LeadStatBox label="Converted" value={leadAnalytics.converted} color="emerald" />
          <LeadStatBox label="Lost" value={leadAnalytics.lost} color="rose" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BreakdownBlock title="By Source" data={leadAnalytics.bySource} colors={COLORS} />
          <BreakdownBlock title="By Category" data={leadAnalytics.byCategory} colors={COLORS} />
          <BreakdownBlock title="By Status" data={leadAnalytics.byStatus} colors={COLORS} />
        </div>
      </div>

      {/* ================= CALL + FOLLOW-UP ANALYTICS ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Call Analytics */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                Calling Analytics
              </h2>
              <p className="text-xs text-brand-ink/50">
                {scopedCalls.length} calls total
              </p>
            </div>
            <Phone size={16} className="text-brand-purple" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <CallStatBox icon={Phone} label="Total" value={scopedCalls.length} color="purple" />
            <CallStatBox icon={PhoneIncoming} label="Inbound" value={callAnalytics.inbound} color="emerald" />
            <CallStatBox icon={PhoneOutgoing} label="Outbound" value={callAnalytics.outbound} color="purple" />
            <CallStatBox icon={PhoneMissed} label="Missed" value={callAnalytics.missed} color="rose" />
            <CallStatBox icon={CheckCircle2} label="Connected" value={callAnalytics.connected} color="emerald" />
            <CallStatBox icon={XCircle} label="Failed" value={callAnalytics.failed} color="rose" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-violet-200 bg-brand-mist p-3 text-center">
              <p className="text-[10px] text-brand-ink/50">Total Duration</p>
              <p className="font-display text-lg font-bold text-brand-ink">
                {Math.floor(callAnalytics.totalDuration / 60)}m
              </p>
            </div>
            <div className="rounded-xl border-2 border-violet-200 bg-brand-mist p-3 text-center">
              <p className="text-[10px] text-brand-ink/50">Avg Duration</p>
              <p className="font-display text-lg font-bold text-brand-ink">
                {callAnalytics.avgDuration}s
              </p>
            </div>
          </div>
        </div>

        {/* Follow-up Analytics */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                Follow-Up Analytics
              </h2>
              <p className="text-xs text-brand-ink/50">
                {scopedFollowUps.length} follow-ups total
              </p>
            </div>
            <Calendar size={16} className="text-brand-purple" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FollowUpBox label="Today" value={followUpAnalytics.today} color="purple" icon={Clock} />
            <FollowUpBox label="Upcoming" value={followUpAnalytics.upcoming} color="emerald" icon={Calendar} />
            <FollowUpBox label="Overdue" value={followUpAnalytics.overdue} color="rose" icon={AlertTriangle} />
            <FollowUpBox label="Completed" value={followUpAnalytics.completed} color="emerald" icon={CheckCircle2} />
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-brand-ink/50">Compliance</span>
              <span className="font-bold text-brand-purple">
                {scopedFollowUps.length > 0
                  ? Math.round(((scopedFollowUps.length - followUpAnalytics.overdue) / scopedFollowUps.length) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                style={{
                  width: `${
                    scopedFollowUps.length > 0
                      ? ((scopedFollowUps.length - followUpAnalytics.overdue) / scopedFollowUps.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CAMPAIGN ANALYTICS ================= */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Campaign Analytics
            </h2>
            <p className="text-xs text-brand-ink/50">
              {scopedCampaigns.length} campaigns {isAllProjects ? 'across all projects' : `in ${activeProjectOption.name}`}
            </p>
          </div>
          <Megaphone size={16} className="text-brand-purple" />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          <CampaignStatBox label="Active" value={campaignAnalytics.active} color="emerald" />
          <CampaignStatBox label="Completed" value={campaignAnalytics.completed} color="purple" />
          <CampaignStatBox label="Leads" value={campaignAnalytics.totalLeads} color="rose" />
          <CampaignStatBox label="Calls" value={campaignAnalytics.totalCalls} color="purple" />
          <CampaignStatBox label="Connected" value={campaignAnalytics.connected} color="emerald" />
          <CampaignStatBox label="Interested" value={campaignAnalytics.interested} color="amber" />
          <CampaignStatBox label="Converted" value={campaignAnalytics.converted} color="emerald" />
        </div>
      </div>

      {/* ================= LEADS BY SOURCE + ACTIVITY ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Leads by Source — {activeProjectOption.name}
            </h2>
            <span className="text-xs text-brand-ink/50">
              {sourceBreakdown.length} sources
            </span>
          </div>

          {sourceBreakdown.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-brand-ink/40">
              No leads {isAllProjects ? 'yet' : 'for this project yet'}.
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
                  <Bar dataKey="value" fill="#8B2FD6" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* System Activity */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Recent System Activity
            </h2>
            <Activity size={14} className="text-brand-purple" />
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-brand-ink/40">
              No activity for this filter
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-brand-lilac/50 text-brand-purple">
                    <FileText size={13} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-brand-ink">
                      <span className="font-semibold">{log.user}</span>{' '}
                      <span className="text-brand-ink/60">— {log.action}</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-brand-ink/40">
                      {log.at} • {log.target}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/superadmin/logs')}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            View All Logs <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* ================= ALL PROJECTS SNAPSHOT (only when All) ================= */}
      {isAllProjects && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                All Projects Snapshot
              </h2>
              <p className="text-xs text-brand-ink/50">
                Complete overview of every tenant
              </p>
            </div>
            <button
              onClick={() => navigate('/superadmin/projects')}
              className="flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
            >
              Manage Projects <ArrowRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 text-center font-semibold">Leads</th>
                  <th className="px-4 py-3 text-center font-semibold">Agents</th>
                  <th className="px-4 py-3 text-center font-semibold">Calls</th>
                  <th className="px-4 py-3 text-center font-semibold">Won</th>
                  <th className="px-4 py-3 text-center font-semibold">Conv %</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map((p) => {
                  const perf = projectPerformance.find((x) => x.id === p.id);
                  const isBlocked = p.status === 'Blocked';
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-brand-lilac/60 hover:bg-brand-mist/60"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
                            <Building2 size={14} />
                          </div>
                          <div>
                            <p className="font-semibold text-brand-ink">{p.name}</p>
                            <p className="text-[10px] text-brand-ink/50">{p.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-brand-lilac px-2.5 py-1 text-xs font-semibold text-brand-purple">
                          {p.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-brand-ink/70">
                        {perf?.leads || 0}
                      </td>
                      <td className="px-4 py-3 text-center text-brand-ink/70">
                        {perf?.agents || 0}
                      </td>
                      <td className="px-4 py-3 text-center text-brand-ink/70">
                        {perf?.calls || 0}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-emerald-600">
                        {perf?.converted || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-brand-purple">
                          {perf?.conversionRate || 0}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            p.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-600'
                              : p.status === 'Trial'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-rose-100 text-rose-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openProject(p.id, p.status)}
                          disabled={isBlocked}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            isBlocked
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                              : 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card hover:brightness-110'
                          }`}
                        >
                          <Eye size={12} />
                          {isBlocked ? 'Blocked' : 'View'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= QUICK ACTIONS ================= */}
      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {[
            { label: 'Add Project', icon: Building2, to: '/superadmin/projects' },
            { label: 'Add Admin', icon: UserCog, to: '/superadmin/admins' },
            { label: 'Add Agent', icon: Users, to: '/superadmin/agents' },
            { label: 'New Campaign', icon: Megaphone, to: '/superadmin/campaigns' },
            { label: 'View Reports', icon: BarChart3, to: '/superadmin/reports' },
            { label: 'System Logs', icon: FileText, to: '/superadmin/logs' },
          ].map(({ label, icon: Icon, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="group flex flex-col items-center gap-2 rounded-xl border-2 border-brand-lilac p-4 transition-all hover:border-brand-purple hover:bg-brand-lilac/30 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white transition-transform group-hover:scale-110">
                <Icon size={18} />
              </span>
              <span className="text-xs font-semibold text-brand-ink">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== KPI CARD ==================== */
function KPICard({ icon: Icon, label, value, color = 'purple', sub, to, pulse }) {
  const navigate = useNavigate();

  const themes = {
    purple: {
      border: 'border-violet-200 hover:border-violet-400',
      bg: 'bg-violet-50',
      fg: 'text-brand-purple',
      glow: 'group-hover:shadow-[0_10px_30px_-10px_rgba(139,47,214,0.45)]',
      bar: 'from-brand-purple to-brand-magenta',
      ring: 'group-hover:ring-2 group-hover:ring-brand-purple/20',
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-400',
      bg: 'bg-emerald-50',
      fg: 'text-emerald-500',
      glow: 'group-hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.4)]',
      bar: 'from-emerald-500 to-emerald-400',
      ring: 'group-hover:ring-2 group-hover:ring-emerald-200',
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-400',
      bg: 'bg-amber-50',
      fg: 'text-amber-500',
      glow: 'group-hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.4)]',
      bar: 'from-amber-500 to-orange-400',
      ring: 'group-hover:ring-2 group-hover:ring-amber-200',
    },
    rose: {
      border: 'border-rose-200 hover:border-rose-400',
      bg: 'bg-rose-50',
      fg: 'text-brand-magenta',
      glow: 'group-hover:shadow-[0_10px_30px_-10px_rgba(227,28,121,0.45)]',
      bar: 'from-brand-magenta to-brand-purple',
      ring: 'group-hover:ring-2 group-hover:ring-brand-magenta/20',
    },
  };

  const t = themes[color];

  const handleClick = () => {
    if (to) navigate(to);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border-2 bg-white p-4 text-left transition-all duration-300 ${t.border} ${t.glow} ${t.ring} hover:-translate-y-1 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-purple/40`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`}
      />

      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.bg} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-80`}
      />

      {pulse && (
        <span className="pointer-events-none absolute right-3 top-3 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
      )}

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${t.border} ${t.bg} ${t.fg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon size={16} />
        </span>

        <ChevronRight
          size={14}
          className="mt-1 -translate-x-2 text-brand-ink/30 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-brand-purple group-hover:opacity-100"
        />
      </div>

      <div className="relative z-10 w-full">
        <p className="font-display text-2xl font-bold leading-tight text-brand-ink">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs font-medium text-brand-ink/60">{label}</p>
        {sub && (
          <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>
        )}
      </div>
    </button>
  );
}

/* ==================== LEAD STAT BOX ==================== */
function LeadStatBox({ label, value, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200 hover:border-violet-400',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200 hover:border-rose-400',
  };
  return (
    <div
      className={`rounded-xl border-2 p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}
    >
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-[10px] font-semibold opacity-70">{label}</p>
    </div>
  );
}

/* ==================== CALL STAT BOX ==================== */
function CallStatBox({ icon: Icon, label, value, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200 hover:border-violet-400',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200 hover:border-rose-400',
  };
  return (
    <div
      className={`rounded-xl border-2 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} />
        <p className="text-[10px] font-semibold opacity-70">{label}</p>
      </div>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
    </div>
  );
}

/* ==================== FOLLOW-UP BOX ==================== */
function FollowUpBox({ label, value, color, icon: Icon }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200 hover:border-violet-400',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200 hover:border-rose-400',
  };
  return (
    <div
      className={`rounded-xl border-2 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold opacity-70">{label}</p>
        <Icon size={14} />
      </div>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

/* ==================== CAMPAIGN STAT BOX ==================== */
function CampaignStatBox({ label, value, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200 hover:border-violet-400',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200 hover:border-rose-400',
  };
  return (
    <div
      className={`rounded-xl border-2 p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}
    >
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-[10px] font-semibold opacity-70">{label}</p>
    </div>
  );
}

/* ==================== BREAKDOWN BLOCK ==================== */
function BreakdownBlock({ title, data, colors }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-brand-lilac/60 p-4">
        <h3 className="mb-3 text-sm font-semibold text-brand-ink">{title}</h3>
        <p className="py-6 text-center text-xs text-brand-ink/40">No data</p>
      </div>
    );
  }
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-xl border border-brand-lilac/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-brand-ink">{title}</h3>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={d.name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-brand-ink/70">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: colors[i % colors.length] }}
                />
                {d.name}
              </span>
              <span className="font-semibold text-brand-ink">
                {d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac/50">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(d.value / total) * 100}%`,
                  background: colors[i % colors.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}