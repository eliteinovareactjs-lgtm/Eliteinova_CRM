// src/pages/superadmin/Reports.jsx
import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area,
  RadialBarChart, RadialBar,
} from 'recharts';
import {
  Download, TrendingUp, TrendingDown, Phone, Users, Target, Clock,
  CheckCircle2, AlertTriangle, Globe, Filter, ChevronDown, X, Search,
  Building2, User as UserIcon, Megaphone, MessageSquare, Coins, BarChart3,
  Layers, ArrowRight, Percent, PhoneCall, Headphones, PhoneMissed,
  Award, Zap, Star, DollarSign, Activity, FileText, ChevronRight,
  Grid3x3, ListFilter, Info, Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  LEADS,
  AGENTS,
  PROJECTS,
  ADMINS,
  CALLS,
  CAMPAIGNS,
  COMMUNICATIONS,
  CREDITS,
  DAILY_CALL_TREND,
  FOLLOW_UPS,
} from '../../data/mockData';

const COLORS = ['#E31C79', '#8B2FD6', '#F0388A', '#6D28D9', '#26A69A', '#FF9800', '#3B82F6', '#10B981'];

const REPORT_TABS = [
  { key: 'platform', label: 'Platform', icon: Globe },
  { key: 'projects', label: 'Projects', icon: Building2 },
  { key: 'leads', label: 'Leads', icon: Layers },
  { key: 'agents', label: 'Agents', icon: Users },
  { key: 'calls', label: 'Calls', icon: Phone },
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { key: 'conversion', label: 'Conversion', icon: Target },
  { key: 'communication', label: 'Communication', icon: MessageSquare },
  { key: 'usage', label: 'Usage', icon: Coins },
];

const RANGES = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Quarter', 'This Year'];

export default function Reports() {
  const { role, activeWebsiteId, activeWebsite } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  /* ========== STATE ========== */
  const [tab, setTab] = useState('platform');
  const [range, setRange] = useState('Last 7 Days');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [drilldown, setDrilldown] = useState(null); // for drill-down drawer
  const [toast, setToast] = useState(null);

  /* ========== HELPERS ========== */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const projectName = (id) =>
    PROJECTS.find((p) => p.id === id)?.name || id;

  /* ========== SCOPED DATA (Super Admin sees all, others see their project) ========== */
  const scope = useMemo(() => {
    const filterByProject = (arr, key = 'projectId') =>
      isSuperAdmin
        ? arr
        : arr.filter((x) => x[key] === activeWebsiteId || x.websiteId === activeWebsiteId);

    return {
      leads: filterByProject(LEADS, 'websiteId'),
      agents: filterByProject(AGENTS, 'websiteId'),
      calls: filterByProject(CALLS, 'projectId'),
      campaigns: filterByProject(CAMPAIGNS, 'projectId'),
      communications: filterByProject(COMMUNICATIONS, 'projectId'),
      credits: filterByProject(CREDITS, 'projectId'),
      followUps: filterByProject(FOLLOW_UPS, 'projectId'),
      projects: isSuperAdmin
        ? PROJECTS
        : PROJECTS.filter((p) => p.id === activeWebsiteId),
      admins: isSuperAdmin
        ? ADMINS
        : ADMINS.filter((a) => a.projectId === activeWebsiteId),
    };
  }, [isSuperAdmin, activeWebsiteId]);

  /* ========== PLATFORM SUMMARY (across everything) ========== */
  const platformMetrics = useMemo(() => {
    const totalLeads = scope.leads.length;
    const wonLeads = scope.leads.filter((l) => l.status === 'Won').length;
    const totalCalls = scope.calls.length;
    const connectedCalls = scope.calls.filter((c) => c.status === 'connected').length;
    const missedCalls = scope.calls.filter((c) => c.status === 'missed').length;
    const totalAgents = scope.agents.length;
    const activeAgents = scope.agents.filter((a) => a.status === 'Active').length;
    const totalProjects = scope.projects.length;
    const activeProjects = scope.projects.filter((p) => p.status === 'Active').length;
    const totalCampaigns = scope.campaigns.length;
    const activeCampaigns = scope.campaigns.filter((c) => c.status === 'Active').length;
    const totalMessages = scope.communications.length;
    const totalCreditBalance = scope.credits.reduce((s, c) => s + c.balance, 0);
    const totalCreditUsed = scope.credits.reduce((s, c) => s + c.used, 0);
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
    const connectionRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;
    return {
      totalLeads,
      wonLeads,
      totalCalls,
      connectedCalls,
      missedCalls,
      totalAgents,
      activeAgents,
      totalProjects,
      activeProjects,
      totalCampaigns,
      activeCampaigns,
      totalMessages,
      totalCreditBalance,
      totalCreditUsed,
      conversionRate,
      connectionRate,
    };
  }, [scope]);

  /* ========== CHART DATA — Lead growth (30d mock) ========== */
  const leadGrowthData = useMemo(() => {
    const base = scope.leads.length || 10;
    return Array.from({ length: 14 }, (_, i) => {
      const day = `D-${13 - i}`;
      const value = Math.max(
        1,
        Math.round((base / 14) * (1 + Math.sin(i / 3) * 0.4) + i * 0.3)
      );
      return { day, leads: value, converted: Math.round(value * 0.25) };
    });
  }, [scope.leads.length]);

  /* ========== CHART DATA — Call volume (from mock) ========== */
  const callTrendData = useMemo(() => {
    return DAILY_CALL_TREND.map((d) => ({
      day: d.day,
      calls: d.calls,
      connected: Math.round(d.calls * 0.7),
      missed: Math.round(d.calls * 0.15),
    }));
  }, []);

  /* ========== CHART DATA — Lead sources ========== */
  const sourceData = useMemo(() => {
    const sources = {};
    scope.leads.forEach((l) => {
      sources[l.leadSource] = (sources[l.leadSource] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [scope.leads]);

  /* ========== CHART DATA — Lead status ========== */
  const statusData = useMemo(() => {
    const statuses = ['Fresh', 'Follow Up', 'Missed', 'Won'];
    return statuses.map((s) => ({
      name: s,
      value: scope.leads.filter((l) => l.status === s).length,
    }));
  }, [scope.leads]);

  /* ========== CHART DATA — Per project ========== */
  const projectData = useMemo(() => {
    return scope.projects.map((p) => {
      const projLeads = LEADS.filter((l) => l.websiteId === p.id);
      const projCalls = CALLS.filter((c) => c.projectId === p.id);
      const projAgents = AGENTS.filter((a) => a.websiteId === p.id);
      const won = projLeads.filter((l) => l.status === 'Won').length;
      return {
        id: p.id,
        name: p.name,
        leads: projLeads.length,
        calls: projCalls.length,
        agents: projAgents.length,
        converted: won,
        rate: projLeads.length > 0 ? Math.round((won / projLeads.length) * 100) : 0,
      };
    });
  }, [scope.projects]);

  /* ========== CHART DATA — Per agent ========== */
  const agentData = useMemo(() => {
    return scope.agents.map((a) => {
      const agentLeads = scope.leads.filter((l) => l.assignedAgent === a.name);
      const won = agentLeads.filter((l) => l.status === 'Won').length;
      const missed = agentLeads.filter((l) => l.status === 'Missed').length;
      return {
        id: a.id,
        name: a.name,
        status: a.status,
        leads: agentLeads.length,
        won,
        missed,
        calls: a.callsToday || 0,
        rate: agentLeads.length > 0 ? Math.round((won / agentLeads.length) * 100) : 0,
      };
    });
  }, [scope.agents, scope.leads]);

  /* ========== CHART DATA — Calls by type ========== */
  const callTypeData = useMemo(() => {
    return [
      { name: 'Inbound', value: scope.calls.filter((c) => c.type === 'inbound').length },
      { name: 'Outbound', value: scope.calls.filter((c) => c.type === 'outbound').length },
      { name: 'Missed', value: scope.calls.filter((c) => c.status === 'missed').length },
      { name: 'Connected', value: scope.calls.filter((c) => c.status === 'connected').length },
    ];
  }, [scope.calls]);

  /* ========== CHART DATA — Campaign performance ========== */
  const campaignData = useMemo(() => {
    return scope.campaigns.map((c) => ({
      name: c.name,
      leads: c.leads,
      connected: c.connected,
      interested: c.interested,
      converted: c.converted,
      rate: c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0,
    }));
  }, [scope.campaigns]);

  /* ========== CHART DATA — Communication by channel ========== */
  const communicationData = useMemo(() => {
    return [
      { name: 'SMS', value: scope.communications.filter((c) => c.channel === 'SMS').length },
      { name: 'WhatsApp', value: scope.communications.filter((c) => c.channel === 'WhatsApp').length },
      { name: 'Email', value: scope.communications.filter((c) => c.channel === 'Email').length },
    ];
  }, [scope.communications]);

  /* ========== CHART DATA — Conversion funnel ========== */
  const funnelData = useMemo(() => {
    const total = scope.leads.length;
    const contacted = scope.leads.filter((l) => l.status !== 'Fresh').length;
    const followUp = scope.leads.filter((l) => l.status === 'Follow Up').length;
    const won = scope.leads.filter((l) => l.status === 'Won').length;
    return [
      { stage: 'Total', value: total, fill: '#8B2FD6' },
      { stage: 'Contacted', value: contacted, fill: '#A855F7' },
      { stage: 'Follow-Up', value: followUp, fill: '#E31C79' },
      { stage: 'Converted', value: won, fill: '#10B981' },
    ];
  }, [scope.leads]);

  /* ========== CHART DATA — Credit usage ========== */
  const creditData = useMemo(() => {
    return scope.credits.map((c) => ({
      name: projectName(c.projectId),
      balance: c.balance,
      used: c.used,
      limit: c.limit,
      pct: Math.round((c.used / c.limit) * 100),
    }));
  }, [scope.credits]);

  /* ========== CHART DATA — Follow-up stats ========== */
  const followUpData = useMemo(() => {
    const statuses = ['Today', 'Upcoming', 'Overdue', 'Completed'];
    return statuses.map((s) => ({
      name: s,
      value: scope.followUps.filter((f) => f.status === s).length,
    }));
  }, [scope.followUps]);

  /* ========== EXPORT ========== */
  const handleExport = () => {
    const csvRows = [];
    csvRows.push(['Report', tab]);
    csvRows.push(['Range', range]);
    csvRows.push(['Generated', new Date().toISOString()]);
    csvRows.push([]);
    csvRows.push(['Metric', 'Value']);
    Object.entries(platformMetrics).forEach(([k, v]) => {
      csvRows.push([k, v]);
    });
    const csv = csvRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${tab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${tab} report`);
  };

  const pageTitle = isSuperAdmin ? 'Platform Reports' : 'Reports';

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            {pageTitle}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <BarChart3 size={13} className="text-brand-purple" />
            {isSuperAdmin ? (
              <>
                Drilling down from Platform to Lead across{' '}
                <span className="font-semibold text-brand-purple">
                  {platformMetrics.totalProjects} projects
                </span>
              </>
            ) : (
              <>Reports for {activeWebsite?.name || '—'}</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
                <div className="fixed inset-0 z-10" onClick={() => setRangeOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                  {RANGES.map((r) => (
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
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* ================= PLATFORM KPI CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total Leads"
          value={platformMetrics.totalLeads}
          sub={`${platformMetrics.wonLeads} converted`}
          icon={Layers}
          color="purple"
          trend="+12%"
          trendUp
        />
        <AnimatedStatCard
          label="Total Calls"
          value={platformMetrics.totalCalls}
          sub={`${platformMetrics.connectionRate}% connected`}
          icon={PhoneCall}
          color="emerald"
          trend="+8%"
          trendUp
        />
        <AnimatedStatCard
          label="Active Agents"
          value={platformMetrics.activeAgents}
          sub={`of ${platformMetrics.totalAgents} agents`}
          icon={Users}
          color="amber"
          trend="+3"
          trendUp
        />
        <AnimatedStatCard
          label="Conversion Rate"
          value={`${platformMetrics.conversionRate}%`}
          sub={`${platformMetrics.wonLeads} won leads`}
          icon={Target}
          color="rose"
          trend="+2%"
          trendUp
        />
      </div>

      {/* ================= SECONDARY STATS ================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MiniStatCard label="Active Projects" value={platformMetrics.activeProjects} icon={Building2} color="purple" />
        <MiniStatCard label="Active Campaigns" value={platformMetrics.activeCampaigns} icon={Megaphone} color="emerald" />
        <MiniStatCard label="Messages Sent" value={platformMetrics.totalMessages} icon={MessageSquare} color="amber" />
        <MiniStatCard label="Credit Balance" value={platformMetrics.totalCreditBalance.toLocaleString()} icon={Coins} color="rose" />
      </div>

      {/* ================= REPORT TABS ================= */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3">
        {REPORT_TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                active
                  ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple shadow-sm'
                  : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ================= TAB CONTENT ================= */}
      {tab === 'platform' && (
        <PlatformTab
          metrics={platformMetrics}
          leadGrowthData={leadGrowthData}
          callTrendData={callTrendData}
          sourceData={sourceData}
          onDrilldown={(d) => setDrilldown(d)}
          range={range}
        />
      )}

      {tab === 'projects' && (
        <ProjectsTab
          projectData={projectData}
          onDrilldown={(d) => setDrilldown(d)}
        />
      )}

      {tab === 'leads' && (
        <LeadsTab
          leadGrowthData={leadGrowthData}
          sourceData={sourceData}
          statusData={statusData}
          metrics={platformMetrics}
        />
      )}

      {tab === 'agents' && (
        <AgentsTab
          agentData={agentData}
          onDrilldown={(d) => setDrilldown(d)}
        />
      )}

      {tab === 'calls' && (
        <CallsTab
          callTrendData={callTrendData}
          callTypeData={callTypeData}
          metrics={platformMetrics}
        />
      )}

      {tab === 'campaigns' && (
        <CampaignsTab campaignData={campaignData} />
      )}

      {tab === 'conversion' && (
        <ConversionTab
          funnelData={funnelData}
          statusData={statusData}
          metrics={platformMetrics}
        />
      )}

      {tab === 'communication' && (
        <CommunicationTab
          communicationData={communicationData}
          metrics={platformMetrics}
        />
      )}

      {tab === 'usage' && (
        <UsageTab creditData={creditData} followUpData={followUpData} />
      )}

      {/* ================= DRILL-DOWN DRAWER ================= */}
      {drilldown && (
        <DrilldownDrawer
          drilldown={drilldown}
          onClose={() => setDrilldown(null)}
          projectName={projectName}
        />
      )}

      {/* ================= TOAST ================= */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= PLATFORM TAB ================= */
function PlatformTab({ metrics, leadGrowthData, callTrendData, sourceData, onDrilldown, range }) {
  return (
    <div className="space-y-6">
      {/* Lead Growth + Calls Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                Lead Growth
              </h2>
              <p className="text-xs text-brand-ink/50">Leads vs converted · {range}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
              <TrendingUp size={10} /> +12%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadGrowthData}>
                <defs>
                  <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B2FD6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8B2FD6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F1E4FB" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                <Area type="monotone" dataKey="leads" stroke="#8B2FD6" strokeWidth={2.5} fill="url(#leadGradient)" name="Leads" />
                <Line type="monotone" dataKey="converted" stroke="#E31C79" strokeWidth={2.5} dot={{ fill: '#E31C79', r: 3 }} name="Converted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-ink">
                Calling Performance
              </h2>
              <p className="text-xs text-brand-ink/50">
                {metrics.totalCalls} calls · {metrics.connectionRate}% connected
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
              <TrendingUp size={10} /> +8%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={callTrendData}>
                <CartesianGrid vertical={false} stroke="#F1E4FB" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                <Line type="monotone" dataKey="calls" stroke="#8B2FD6" strokeWidth={2.5} dot={{ fill: '#8B2FD6', r: 3 }} name="Calls" />
                <Line type="monotone" dataKey="connected" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} name="Connected" />
                <Line type="monotone" dataKey="missed" stroke="#E31C79" strokeWidth={2.5} dot={{ fill: '#E31C79', r: 3 }} name="Missed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lead Source pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
            Leads by Source
          </h2>
          {sourceData.length === 0 ? (
            <EmptyState text="No leads yet." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-brand-purple" />
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Drill-Down Path
            </h2>
          </div>
          <p className="mt-1 text-xs text-brand-ink/50">
            Click any level to drill into the details.
          </p>
          <div className="mt-5 space-y-2">
            <DrilldownRow
              icon={Globe}
              label="Platform"
              value={`${metrics.totalProjects} projects`}
              color="purple"
              onClick={() => onDrilldown({ level: 'platform' })}
            />
            <DrilldownRow
              icon={Building2}
              label="Projects"
              value={`${metrics.activeProjects} active`}
              color="emerald"
              onClick={() => onDrilldown({ level: 'projects' })}
            />
            <DrilldownRow
              icon={Users}
              label="Agents"
              value={`${metrics.activeAgents} active`}
              color="amber"
              onClick={() => onDrilldown({ level: 'agents' })}
            />
            <DrilldownRow
              icon={Layers}
              label="Leads"
              value={`${metrics.totalLeads} total`}
              color="rose"
              onClick={() => onDrilldown({ level: 'leads' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= PROJECTS TAB ================= */
function ProjectsTab({ projectData, onDrilldown }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Per-Project Performance
            </h2>
            <p className="text-xs text-brand-ink/50">
              Compare leads, calls, agents, and conversions across projects.
            </p>
          </div>
        </div>
        {projectData.length === 0 ? (
          <EmptyState text="No projects yet." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <CartesianGrid vertical={false} stroke="#F1E4FB" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="leads" fill="#8B2FD6" radius={[6, 6, 0, 0]} barSize={28} name="Leads" />
                <Bar dataKey="calls" fill="#E31C79" radius={[6, 6, 0, 0]} barSize={28} name="Calls" />
                <Bar dataKey="converted" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Per-project table */}
      <div className="card !p-0 overflow-hidden">
        <div className="border-b border-brand-lilac/60 bg-brand-mist/50 px-5 py-3">
          <h2 className="font-display text-sm font-semibold text-brand-ink">
            Project Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 text-center font-semibold">Leads</th>
                <th className="px-4 py-3 text-center font-semibold">Calls</th>
                <th className="px-4 py-3 text-center font-semibold">Agents</th>
                <th className="px-4 py-3 text-center font-semibold">Converted</th>
                <th className="px-4 py-3 text-center font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody>
              {projectData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-brand-ink/50">
                    No projects.
                  </td>
                </tr>
              ) : (
                projectData.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer border-t border-brand-lilac/60 hover:bg-brand-mist/60"
                    onClick={() => onDrilldown({ level: 'project', id: p.id, name: p.name })}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                          {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </span>
                        <span className="font-semibold text-brand-ink">{p.name}</span>
                        <ChevronRight size={14} className="text-brand-ink/30" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-brand-ink/70 tabular-nums">{p.leads}</td>
                    <td className="px-4 py-3 text-center text-brand-ink/70 tabular-nums">{p.calls}</td>
                    <td className="px-4 py-3 text-center text-brand-ink/70 tabular-nums">{p.agents}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-600 tabular-nums">{p.converted}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="mx-auto flex max-w-[120px] items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-lilac">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                            style={{ width: `${p.rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-brand-purple tabular-nums">{p.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= LEADS TAB ================= */
function LeadsTab({ leadGrowthData, sourceData, statusData, metrics }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Lead Growth Trend
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={leadGrowthData}>
              <defs>
                <linearGradient id="leadGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E31C79" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E31C79" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F1E4FB" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
              <Area type="monotone" dataKey="leads" stroke="#E31C79" strokeWidth={2.5} fill="url(#leadGrowthGradient)" name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
            Leads by Source
          </h2>
          {sourceData.length === 0 ? (
            <EmptyState text="No leads yet." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
            Lead Status Breakdown
          </h2>
          {metrics.totalLeads === 0 ? (
            <EmptyState text="No leads yet." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid vertical={false} stroke="#F1E4FB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#F1E4FB' }} contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                  <Bar dataKey="value" fill="#8B2FD6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= AGENTS TAB ================= */
function AgentsTab({ agentData, onDrilldown }) {
  return (
    <div className="space-y-6">
      {/* Top Performers chart */}
      {agentData.length > 0 && (
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
            Agent Productivity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentData}>
                <CartesianGrid vertical={false} stroke="#F1E4FB" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="leads" fill="#8B2FD6" radius={[6, 6, 0, 0]} barSize={28} name="Leads" />
                <Bar dataKey="won" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} name="Won" />
                <Bar dataKey="calls" fill="#E31C79" radius={[6, 6, 0, 0]} barSize={28} name="Calls Today" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Agent table */}
      <div className="card !p-0 overflow-hidden">
        <div className="border-b border-brand-lilac/60 bg-brand-mist/50 px-5 py-3">
          <h2 className="font-display text-sm font-semibold text-brand-ink">
            Agent Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
                <th className="px-4 py-3 font-semibold">Agent</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Assigned</th>
                <th className="px-4 py-3 text-center font-semibold">Won</th>
                <th className="px-4 py-3 text-center font-semibold">Missed</th>
                <th className="px-4 py-3 text-center font-semibold">Calls</th>
                <th className="px-4 py-3 text-center font-semibold">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {agentData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-brand-ink/50">
                    No agents yet.
                  </td>
                </tr>
              ) : (
                agentData.map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer border-t border-brand-lilac/60 hover:bg-brand-mist/60"
                    onClick={() => onDrilldown({ level: 'agent', id: a.id, name: a.name })}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                          {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </span>
                        <span className="font-semibold text-brand-ink">{a.name}</span>
                        <ChevronRight size={14} className="text-brand-ink/30" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          a.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-600'
                            : a.status === 'Break'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-brand-ink/70 tabular-nums">{a.leads}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-600 tabular-nums">{a.won}</td>
                    <td className="px-4 py-3 text-center font-semibold text-rose-500 tabular-nums">{a.missed}</td>
                    <td className="px-4 py-3 text-center text-brand-ink/70 tabular-nums">{a.calls}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="mx-auto flex max-w-[120px] items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-lilac">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
                            style={{ width: `${a.rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-brand-purple tabular-nums">{a.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= CALLS TAB ================= */
function CallsTab({ callTrendData, callTypeData, metrics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricBox label="Total Calls" value={metrics.totalCalls} icon={Phone} color="purple" />
        <MetricBox label="Connected" value={metrics.connectedCalls} icon={Headphones} color="emerald" />
        <MetricBox label="Missed" value={metrics.missedCalls} icon={PhoneMissed} color="rose" />
        <MetricBox
          label="Connection Rate"
          value={`${metrics.connectionRate}%`}
          icon={Percent}
          color="amber"
        />
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Daily Call Volume
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={callTrendData}>
              <CartesianGrid vertical={false} stroke="#F1E4FB" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="calls" stroke="#8B2FD6" strokeWidth={2.5} dot={{ fill: '#8B2FD6', r: 3 }} name="Calls" />
              <Line type="monotone" dataKey="connected" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} name="Connected" />
              <Line type="monotone" dataKey="missed" stroke="#E31C79" strokeWidth={2.5} dot={{ fill: '#E31C79', r: 3 }} name="Missed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Calls by Type
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={callTypeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {callTypeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= CAMPAIGNS TAB ================= */
function CampaignsTab({ campaignData }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Campaign Performance
        </h2>
        {campaignData.length === 0 ? (
          <EmptyState text="No campaigns yet." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignData}>
                <CartesianGrid vertical={false} stroke="#F1E4FB" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="leads" fill="#8B2FD6" radius={[6, 6, 0, 0]} barSize={28} name="Leads" />
                <Bar dataKey="connected" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} name="Connected" />
                <Bar dataKey="converted" fill="#E31C79" radius={[6, 6, 0, 0]} barSize={28} name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Campaign table */}
      <div className="card !p-0 overflow-hidden">
        <div className="border-b border-brand-lilac/60 bg-brand-mist/50 px-5 py-3">
          <h2 className="font-display text-sm font-semibold text-brand-ink">
            Campaign Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
                <th className="px-4 py-3 font-semibold">Campaign</th>
                <th className="px-4 py-3 text-center font-semibold">Leads</th>
                <th className="px-4 py-3 text-center font-semibold">Connected</th>
                <th className="px-4 py-3 text-center font-semibold">Interested</th>
                <th className="px-4 py-3 text-center font-semibold">Converted</th>
                <th className="px-4 py-3 text-center font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaignData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-brand-ink/50">
                    No campaigns.
                  </td>
                </tr>
              ) : (
                campaignData.map((c, i) => (
                  <tr key={i} className="border-t border-brand-lilac/60 hover:bg-brand-mist/60">
                    <td className="px-4 py-3 font-semibold text-brand-ink">{c.name}</td>
                    <td className="px-4 py-3 text-center text-brand-ink/70 tabular-nums">{c.leads}</td>
                    <td className="px-4 py-3 text-center text-brand-ink/70 tabular-nums">{c.connected}</td>
                    <td className="px-4 py-3 text-center font-semibold text-amber-600 tabular-nums">{c.interested}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-600 tabular-nums">{c.converted}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-brand-purple tabular-nums">
                        {c.rate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= CONVERSION TAB ================= */
function ConversionTab({ funnelData, statusData, metrics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricBox label="Total Leads" value={metrics.totalLeads} icon={Layers} color="purple" />
        <MetricBox label="Won" value={metrics.wonLeads} icon={Award} color="emerald" />
        <MetricBox label="Conversion Rate" value={`${metrics.conversionRate}%`} icon={Percent} color="amber" />
        <MetricBox
          label="Missed"
          value={metrics.missedCalls}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Lead Conversion Funnel
        </h2>
        <div className="space-y-4">
          {funnelData.map((step, i) => {
            const pct =
              funnelData[0].value > 0
                ? Math.round((step.value / funnelData[0].value) * 100)
                : 0;
            const prevValue = i > 0 ? funnelData[i - 1].value : step.value;
            const dropOff =
              prevValue > 0 ? Math.round(((prevValue - step.value) / prevValue) * 100) : 0;
            return (
              <div key={step.stage}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-ink">{step.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold tabular-nums text-brand-ink">
                      {step.value}
                    </span>
                    <span className="text-brand-ink/50 tabular-nums">({pct}%)</span>
                    {i > 0 && dropOff > 0 && (
                      <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-500">
                        -{dropOff}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: step.fill,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Status Distribution
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid horizontal={false} stroke="#F1E4FB" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
              <Bar dataKey="value" fill="#8B2FD6" radius={[0, 6, 6, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= COMMUNICATION TAB ================= */
function CommunicationTab({ communicationData, metrics }) {
  const totalMessages = communicationData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricBox label="Total Messages" value={totalMessages} icon={MessageSquare} color="purple" />
        <MetricBox
          label="SMS"
          value={communicationData.find((c) => c.name === 'SMS')?.value || 0}
          icon={MessageSquare}
          color="emerald"
        />
        <MetricBox
          label="WhatsApp"
          value={communicationData.find((c) => c.name === 'WhatsApp')?.value || 0}
          icon={MessageSquare}
          color="amber"
        />
        <MetricBox
          label="Email"
          value={communicationData.find((c) => c.name === 'Email')?.value || 0}
          icon={MessageSquare}
          color="rose"
        />
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Messages by Channel
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={communicationData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {communicationData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= USAGE TAB ================= */
function UsageTab({ creditData, followUpData }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Credit Usage by Project
        </h2>
        {creditData.length === 0 ? (
          <EmptyState text="No credit data yet." />
        ) : (
          <div className="space-y-4">
            {creditData.map((c) => (
              <div key={c.name}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-ink">{c.name}</span>
                  <span className="text-brand-ink/60 tabular-nums">
                    {c.used.toLocaleString()} / {c.limit.toLocaleString()} ({c.pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className={`h-full rounded-full ${
                      c.pct > 85
                        ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                        : c.pct > 60
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                    }`}
                    style={{ width: `${Math.min(c.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">
          Follow-Up Distribution
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={followUpData}>
              <CartesianGrid vertical={false} stroke="#F1E4FB" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#F1E4FB' }} contentStyle={{ borderRadius: 12, border: '1px solid #F1E4FB', fontSize: 12 }} />
              <Bar dataKey="value" fill="#8B2FD6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= DRILLDOWN ROW ================= */
function DrilldownRow({ icon: Icon, label, value, color, onClick }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-brand-magenta',
  };
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-brand-lilac bg-white px-3.5 py-3 text-left transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/30"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-ink">{label}</p>
        <p className="text-[10px] text-brand-ink/50">{value}</p>
      </div>
      <ChevronRight size={14} className="text-brand-ink/30 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

/* ================= DRILLDOWN DRAWER ================= */
function DrilldownDrawer({ drilldown, onClose, projectName }) {
  const titleMap = {
    platform: 'Platform Overview',
    projects: 'Projects List',
    agents: 'Agents List',
    leads: 'Leads List',
    project: drilldown.name || 'Project Details',
    agent: drilldown.name || 'Agent Details',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {titleMap[drilldown.level] || 'Details'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                Drill-down from Platform → Project → Agent → Lead
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {drilldown.level === 'platform' && (
            <>
              <InfoRow label="Total Projects" value={PROJECTS.length} />
              <InfoRow label="Active Projects" value={PROJECTS.filter((p) => p.status === 'Active').length} />
              <InfoRow label="Total Agents" value={AGENTS.length} />
              <InfoRow label="Total Leads" value={LEADS.length} />
              <InfoRow label="Total Calls" value={CALLS.length} />
            </>
          )}

          {drilldown.level === 'projects' && (
            <div className="space-y-2">
              {PROJECTS.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-brand-lilac bg-white p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
                      {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-ink">{p.name}</p>
                      <p className="text-[10px] text-brand-ink/50">{p.code}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    p.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {drilldown.level === 'agents' && (
            <div className="space-y-2">
              {AGENTS.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-xs font-bold text-white">
                    {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{a.name}</p>
                    <p className="truncate text-[10px] text-brand-ink/50">
                      {projectName(a.websiteId)} · {a.leadsAssigned} leads
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    a.status === 'Active' ? 'bg-emerald-100 text-emerald-600'
                    : a.status === 'Break' ? 'bg-amber-100 text-amber-600'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {drilldown.level === 'leads' && (
            <div className="space-y-2">
              {LEADS.slice(0, 20).map((l) => (
                <div key={l.id} className="rounded-xl border border-brand-lilac bg-white p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-lilac text-[10px] font-bold text-brand-purple">
                      {l.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">{l.name}</p>
                      <p className="truncate text-xs text-brand-ink/50">{l.mobile}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      l.status === 'Won' ? 'bg-emerald-100 text-emerald-600'
                      : l.status === 'Missed' ? 'bg-rose-100 text-rose-600'
                      : 'bg-amber-100 text-amber-600'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {drilldown.level === 'project' && (
            <>
              <InfoRow label="Project" value={drilldown.name} />
              <InfoRow label="Leads" value={LEADS.filter((l) => l.websiteId === drilldown.id).length} />
              <InfoRow label="Agents" value={AGENTS.filter((a) => a.websiteId === drilldown.id).length} />
              <InfoRow label="Calls" value={CALLS.filter((c) => c.projectId === drilldown.id).length} />
            </>
          )}

          {drilldown.level === 'agent' && (
            <>
              <InfoRow label="Agent" value={drilldown.name} />
              <InfoRow label="Leads Assigned" value={LEADS.filter((l) => l.assignedAgent === drilldown.name).length} />
              <InfoRow label="Calls Today" value={CALLS.filter((c) => c.agent === drilldown.name).length} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= ANIMATED STAT CARD ================= */
function AnimatedStatCard({ label, value, sub, icon: Icon, color, trend, trendUp }) {
  const themes = {
    purple: {
      border: 'border-violet-200 hover:border-violet-400',
      bg: 'from-violet-50 via-violet-50/30 to-white',
      iconBg: 'bg-violet-100 text-brand-purple border-violet-200',
      bar: 'from-brand-purple to-brand-magenta',
      glow: 'bg-brand-purple/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]',
      valueColor: 'text-brand-purple',
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-400',
      bg: 'from-emerald-50 via-emerald-50/30 to-white',
      iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      bar: 'from-emerald-500 to-emerald-400',
      glow: 'bg-emerald-500/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]',
      valueColor: 'text-emerald-600',
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-400',
      bg: 'from-amber-50 via-amber-50/30 to-white',
      iconBg: 'bg-amber-100 text-amber-600 border-amber-200',
      bar: 'from-amber-500 to-orange-400',
      glow: 'bg-amber-500/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]',
      valueColor: 'text-amber-600',
    },
    rose: {
      border: 'border-rose-200 hover:border-rose-400',
      bg: 'from-rose-50 via-rose-50/30 to-white',
      iconBg: 'bg-rose-100 text-brand-magenta border-rose-200',
      bar: 'from-brand-magenta to-brand-purple',
      glow: 'bg-brand-magenta/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]',
      valueColor: 'text-brand-magenta',
    },
  };
  const t = themes[color];

  return (
    <div className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 ${t.border} ${t.shadow}`}>
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} />
          </span>
          {trend && (
            <span className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              trendUp ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-rose-200 bg-rose-50 text-rose-500'
            }`}>
              {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trend}
            </span>
          )}
        </div>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
      </div>
    </div>
  );
}

/* ================= MINI STAT CARD ================= */
function MiniStatCard({ label, value, icon: Icon, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div className={`flex items-center gap-3 rounded-xl border-2 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/60">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
        <p className="font-display text-xl font-bold tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}

/* ================= METRIC BOX ================= */
function MetricBox({ label, value, icon: Icon, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/60">
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
    </div>
  );
}

/* ================= INFO ROW ================= */
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-lilac bg-white p-3 text-sm">
      <span className="text-brand-ink/60">{label}</span>
      <span className="truncate font-semibold text-brand-ink">{value}</span>
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

/* ================= TOAST ================= */
function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
          type === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-600'
            : 'border-emerald-200 bg-emerald-50 text-emerald-600'
        }`}
      >
        {type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}