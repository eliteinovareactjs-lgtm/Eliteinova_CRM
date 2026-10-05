// src/pages/marketing/MarketingDashboard.jsx
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone, Target, Users, TrendingUp, Award, ArrowRight,
  BarChart3, Sparkles, CheckCircle2, Building2, Layers,
  Calendar, RefreshCw, Download, Share2, Globe,
  XCircle, AlertTriangle, UserPlus, ListChecks,
  Zap, DollarSign, Percent, Clock, FileText,
} from 'lucide-react';

import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';

import { useAuth } from '../../context/AuthContext';

const COLORS = ['#E31C79', '#8B2FD6', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

/* ═══════════════════════════════════════════════════════════════════
   ROUTE MAP
   ═══════════════════════════════════════════════════════════════════ */
const ROUTES = {
  dashboard:     '/marketing/dashboard',
  campaigns:     '/marketing/campaigns',
  leads:         '/marketing/leads',
  sources:       '/marketing/sources',
  handover:      '/marketing/handover',
  socialMedia:   '/marketing/social-media',
  performance:   '/marketing/performance',
  tasks:         '/marketing/tasks',
  communication: '/marketing/communication',
  reports:       '/marketing/reports',
};

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA — from Marketing Executive.txt
   ═══════════════════════════════════════════════════════════════════ */
const DAILY_LEAD_TREND = [
  { day: 'Mon', leads: 120, qualified: 45, converted: 12 },
  { day: 'Tue', leads: 145, qualified: 52, converted: 15 },
  { day: 'Wed', leads: 98,  qualified: 38, converted: 9  },
  { day: 'Thu', leads: 175, qualified: 68, converted: 21 },
  { day: 'Fri', leads: 210, qualified: 82, converted: 28 },
  { day: 'Sat', leads: 160, qualified: 55, converted: 18 },
  { day: 'Sun', leads: 132, qualified: 48, converted: 14 },
];

const CAMPAIGN_TYPES = [
  { name: 'Lead Generation', value: 8, color: COLORS[0] },
  { name: 'Brand Awareness', value: 5, color: COLORS[1] },
  { name: 'Promotion',       value: 6, color: COLORS[2] },
  { name: 'Product Launch',  value: 3, color: COLORS[3] },
  { name: 'Social Media',    value: 4, color: COLORS[4] },
];

const LEAD_SOURCES = [
  { name: 'Google Ads', value: 450 },
  { name: 'Meta Ads',   value: 320 },
  { name: 'Website',    value: 210 },
  { name: 'WhatsApp',   value: 150 },
  { name: 'Referral',   value: 85  },
  { name: 'LinkedIn',   value: 60  },
];

const SOCIAL_PLATFORMS = [
  { name: 'Facebook',  leads: 120, engagement: '4.5%', icon: '📘' },
  { name: 'Instagram', leads: 95,  engagement: '5.2%', icon: '📸' },
  { name: 'YouTube',   leads: 40,  engagement: '2.1%', icon: '▶️' },
  { name: 'LinkedIn',  leads: 60,  engagement: '3.8%', icon: '💼' },
  { name: 'WhatsApp',  leads: 150, engagement: '12%',  icon: '💬' },
];

const MOCK_CAMPAIGNS = [
  { id: 1, name: 'Summer Sale 2024',      type: 'Promotion',         status: 'Active',    budget: 5000, leads: 450, qualified: 120, converted: 35 },
  { id: 2, name: 'Google Search - CRM',   type: 'Lead Generation',   status: 'Active',    budget: 3000, leads: 120, qualified: 85,  converted: 22 },
  { id: 3, name: 'Facebook Awareness',    type: 'Brand Awareness',   status: 'Scheduled', budget: 1500, leads: 0,   qualified: 0,   converted: 0  },
  { id: 4, name: 'Product Launch Q3',     type: 'Product Launch',    status: 'Completed', budget: 8000, leads: 620, qualified: 210, converted: 68 },
  { id: 5, name: 'Diwali Festival Promo', type: 'Festival Campaign', status: 'Active',    budget: 4500, leads: 380, qualified: 145, converted: 42 },
];

const MOCK_HANDOVER = [
  { id: 'L-1023', name: 'John Doe',    source: 'Google Ads', status: 'Ready',     date: '2024-06-15' },
  { id: 'L-1024', name: 'Sarah Smith', source: 'Meta Ads',   status: 'Submitted', date: '2024-06-15' },
  { id: 'L-1025', name: 'Raj Patel',   source: 'Website',    status: 'Accepted',  date: '2024-06-14' },
  { id: 'L-1026', name: 'Emily Chen',  source: 'WhatsApp',   status: 'Rejected',  date: '2024-06-14' },
];

const MOCK_TASKS = [
  { id: 1, task: 'Review Google Ads Leads',  due: 'Today',     priority: 'High',   status: 'Pending' },
  { id: 2, task: 'Validate Facebook Leads',  due: 'Today',     priority: 'Medium', status: 'In Progress' },
  { id: 3, task: 'Handover Qualified Leads', due: 'Tomorrow',  priority: 'High',   status: 'Pending' },
  { id: 4, task: 'Update Campaign Budget',   due: 'Yesterday', priority: 'Low',    status: 'Overdue' },
  { id: 5, task: 'Social Media Posting',     due: 'Today',     priority: 'Medium', status: 'Completed' },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function MarketingDashboard() {
  const navigate = useNavigate();
  const { user, activeWebsite } = useAuth();
  const [chartView, setChartView] = useState('leads');
  const [refreshed, setRefreshed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  /* ========== KPI METRICS from spec ========== */
  const metrics = useMemo(() => {
    const totalCampaigns = MOCK_CAMPAIGNS.length;
    const activeCampaigns = MOCK_CAMPAIGNS.filter((c) => c.status === 'Active').length;
    const totalLeads = MOCK_CAMPAIGNS.reduce((s, c) => s + c.leads, 0);
    const todaysLeads = 45;
    const pendingLeads = 128;
    const qualifiedLeads = MOCK_CAMPAIGNS.reduce((s, c) => s + c.qualified, 0);
    const convertedLeads = MOCK_CAMPAIGNS.reduce((s, c) => s + c.converted, 0);
    const lostLeads = 87;
    const totalAdSpend = MOCK_CAMPAIGNS.reduce((s, c) => s + c.budget, 0);
    const costPerLead = totalLeads ? totalAdSpend / totalLeads : 0;
    const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    const pendingFollowUps = 23;

    return {
      totalCampaigns, activeCampaigns, totalLeads, todaysLeads,
      pendingLeads, qualifiedLeads, convertedLeads, lostLeads,
      totalAdSpend, costPerLead, conversionRate, pendingFollowUps,
    };
  }, []);

  /* ========== LEAD ANALYTICS ========== */
  const leadAnalytics = useMemo(() => {
    const bySource = LEAD_SOURCES;
    const byStatus = [
      { name: 'New',       value: 45  },
      { name: 'Pending',   value: 128 },
      { name: 'Qualified', value: metrics.qualifiedLeads },
      { name: 'Converted', value: metrics.convertedLeads },
      { name: 'Lost',      value: metrics.lostLeads },
    ];
    return { bySource, byStatus };
  }, [metrics]);

  /* ========== CAMPAIGN ANALYTICS ========== */
  const campaignAnalytics = useMemo(() => ({
    active:    MOCK_CAMPAIGNS.filter((c) => c.status === 'Active').length,
    scheduled: MOCK_CAMPAIGNS.filter((c) => c.status === 'Scheduled').length,
    completed: MOCK_CAMPAIGNS.filter((c) => c.status === 'Completed').length,
    totalLeads:     MOCK_CAMPAIGNS.reduce((s, c) => s + c.leads, 0),
    totalQualified: MOCK_CAMPAIGNS.reduce((s, c) => s + c.qualified, 0),
    totalConverted: MOCK_CAMPAIGNS.reduce((s, c) => s + c.converted, 0),
  }), []);

  /* ========== HANDOVER ANALYTICS ========== */
  const handoverAnalytics = useMemo(() => ({
    ready:     MOCK_HANDOVER.filter((h) => h.status === 'Ready').length,
    submitted: MOCK_HANDOVER.filter((h) => h.status === 'Submitted').length,
    accepted:  MOCK_HANDOVER.filter((h) => h.status === 'Accepted').length,
    rejected:  MOCK_HANDOVER.filter((h) => h.status === 'Rejected').length,
  }), []);

  /* ========== TASK ANALYTICS ========== */
  const taskAnalytics = useMemo(() => ({
    pending:     MOCK_TASKS.filter((t) => t.status === 'Pending').length,
    inProgress:  MOCK_TASKS.filter((t) => t.status === 'In Progress').length,
    completed:   MOCK_TASKS.filter((t) => t.status === 'Completed').length,
    overdue:     MOCK_TASKS.filter((t) => t.status === 'Overdue').length,
  }), []);

  /* ========== HANDLERS ========== */
  const handleRefresh = () => {
    setRefreshed(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshed(false), 1200);
  };

  const handleExport = () => {
    const rows = [
      ['Marketing Executive Dashboard Report', ''],
      ['Project', activeWebsite?.name || ''],
      ['Total Campaigns', metrics.totalCampaigns],
      ['Active Campaigns', metrics.activeCampaigns],
      ['Total Marketing Leads', metrics.totalLeads],
      ["Today's Leads", metrics.todaysLeads],
      ['Pending Leads', metrics.pendingLeads],
      ['Qualified Leads', metrics.qualifiedLeads],
      ['Converted Leads', metrics.convertedLeads],
      ['Lost Leads', metrics.lostLeads],
      ['Total Ad Spend', `$${metrics.totalAdSpend.toLocaleString()}`],
      ['Cost Per Lead', `$${metrics.costPerLead.toFixed(2)}`],
      ['Conversion Rate', `${metrics.conversionRate}%`],
      ['Pending Follow-ups', metrics.pendingFollowUps],
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-report-${Date.now()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
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

      <div
        key={refreshKey}
        className={`relative space-y-6 px-1 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
      >
        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Marketing Dashboard</h1>
            <p className="text-sm text-brand-ink/60">Good afternoon, {user?.name} 👋</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="group flex items-center gap-2 rounded-full border border-brand-magenta/25 bg-gradient-to-r from-brand-magenta/[0.12] to-brand-purple/[0.10] px-4 py-2 text-sm font-semibold text-brand-purple shadow-sm transition-all hover:border-brand-magenta/50 hover:shadow-md">
              <Building2 size={16} className="transition-transform group-hover:rotate-6" />
              {activeWebsite?.name || 'Marketing'}
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
        <div className="group relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl border border-brand-magenta/30 bg-gradient-to-r from-brand-magenta/[0.14] via-brand-purple/[0.10] to-brand-rose/[0.10] px-5 py-4 shadow-[0_10px_30px_-18px_rgba(227,28,121,0.5)] transition-all hover:border-brand-magenta/50 hover:shadow-[0_14px_36px_-16px_rgba(227,28,121,0.55)]">
          <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rotate-45 bg-gradient-to-br from-brand-magenta/[0.15] to-transparent" />
          <span className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-brand-purple/10 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-magenta">Marketing Overview</p>
              <p className="font-display text-base font-bold text-brand-ink">{activeWebsite?.name || 'Marketing Project'}</p>
              <p className="text-xs font-medium text-brand-ink/60">
                {metrics.activeCampaigns} active campaigns · {metrics.totalLeads.toLocaleString()} leads · {metrics.conversionRate}% conversion
              </p>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-3">
            {[
              { label: 'Today',     value: metrics.todaysLeads,    icon: TrendingUp,   color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
              { label: 'Qualified', value: metrics.qualifiedLeads, icon: CheckCircle2, color: 'text-brand-purple', bg: 'bg-violet-50',  ring: 'ring-violet-200' },
              { label: 'Converted', value: metrics.convertedLeads, icon: Award,        color: 'text-brand-magenta', bg: 'bg-rose-50',    ring: 'ring-rose-200' },
              { label: 'CPL',       value: `$${metrics.costPerLead.toFixed(2)}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' },
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

        {/* ================= 12 KPI CARDS ================= */}
        <div className="space-y-3">
          <SectionTitle eyebrow="Live Metrics" title="Marketing KPIs" />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            <KPICard icon={Megaphone}    label="Total Campaigns"    value={metrics.totalCampaigns}    color="purple"  sub="All time"          to={ROUTES.campaigns}   delay={0} />
            <KPICard icon={Zap}          label="Active Campaigns"   value={metrics.activeCampaigns}   color="emerald" sub="Running now"       to={ROUTES.campaigns}   delay={40} />
            <KPICard icon={Target}       label="Total Leads"        value={metrics.totalLeads}        color="rose"    sub="All marketing"     to={ROUTES.leads}       delay={80} />
            <KPICard icon={Sparkles}     label="Today's Leads"      value={metrics.todaysLeads}       color="purple"  sub="Captured today"    to={ROUTES.leads}       delay={120} />
            <KPICard icon={Clock}        label="Pending Leads"      value={metrics.pendingLeads}      color="amber"   sub="Awaiting review"   to={ROUTES.leads}       alert={metrics.pendingLeads > 0} delay={160} />
            <KPICard icon={CheckCircle2} label="Qualified Leads"    value={metrics.qualifiedLeads}    color="emerald" sub="Ready to convert"  to={ROUTES.handover}    delay={200} />
            <KPICard icon={Award}        label="Converted Leads"    value={metrics.convertedLeads}    color="emerald" sub={`${metrics.conversionRate}% rate`} to={ROUTES.performance} delay={240} />
            <KPICard icon={XCircle}      label="Lost Leads"         value={metrics.lostLeads}         color="rose"    sub="Not converted"     to={ROUTES.leads}       delay={280} />
            <KPICard icon={DollarSign}   label="Total Ad Spend"     value={`$${metrics.totalAdSpend.toLocaleString()}`} color="purple" sub="Across campaigns" to={ROUTES.performance} delay={320} />
            <KPICard icon={TrendingUp}   label="Cost Per Lead"      value={`$${metrics.costPerLead.toFixed(2)}`} color="amber" sub="Blended average" to={ROUTES.performance} delay={360} />
            <KPICard icon={Percent}      label="Conversion Rate"    value={`${metrics.conversionRate}%`} color="rose"  sub="Leads → Converted" to={ROUTES.performance} delay={400} />
            <KPICard icon={Calendar}     label="Pending Follow-ups" value={metrics.pendingFollowUps}  color="purple"  sub="Needs action"      to={ROUTES.tasks}       alert={metrics.pendingFollowUps > 0} delay={440} />
          </div>
        </div>

        {/* ================= ANALYTICS SECTION ================= */}
        <div className="space-y-3">
          <SectionTitle eyebrow="Analytics" title="Performance Snapshot" hint="Live trends & breakdowns" />

          {/* ─── Lead Trend + Source ─── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Panel
              title="Lead Generation Trend"
              subtitle="Last 7 days"
              icon={TrendingUp}
              action={
                <div className="inline-flex items-center gap-1 rounded-full border border-brand-lilac bg-brand-mist p-1">
                  {[
                    { key: 'leads',     label: 'Leads' },
                    { key: 'qualified', label: 'Qualified' },
                    { key: 'converted', label: 'Converted' },
                    { key: 'area',      label: 'Activity' },
                  ].map((v) => {
                    const active = chartView === v.key;
                    return (
                      <button
                        key={v.key}
                        type="button"
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
                  {chartView === 'area' ? (
                    <AreaChart data={DAILY_LEAD_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mktAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E31C79" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="#E31C79" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#E9D5F5" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b5b7e', fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E31C79', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="leads" stroke="#E31C79" strokeWidth={3} fill="url(#mktAreaGrad)" dot={{ r: 3, fill: '#E31C79', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#E31C79', stroke: '#fff', strokeWidth: 2 }} name="Leads" />
                    </AreaChart>
                  ) : chartView === 'converted' ? (
                    <LineChart data={DAILY_LEAD_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#E9D5F5" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b5b7e', fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8B2FD6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Line type="monotone" dataKey="converted" stroke="#8B2FD6" strokeWidth={3} dot={{ r: 3, fill: '#E31C79', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#E31C79', stroke: '#fff', strokeWidth: 2 }} name="Converted" />
                    </LineChart>
                  ) : (
                    <BarChart data={DAILY_LEAD_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mktBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartView === 'leads' ? '#E31C79' : '#8B2FD6'} />
                          <stop offset="100%" stopColor={chartView === 'leads' ? '#F0388A' : '#B14FEB'} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#E9D5F5" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b5b7e', fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1E4FB', radius: 8 }} />
                      <Bar
                        dataKey={chartView === 'leads' ? 'leads' : chartView === 'qualified' ? 'qualified' : 'leads'}
                        fill="url(#mktBarGrad)"
                        radius={[8, 8, 2, 2]}
                        barSize={26}
                        name={chartView === 'leads' ? 'Leads' : chartView === 'qualified' ? 'Qualified' : 'Leads'}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Lead Sources */}
            <Panel title="Leads by Source" subtitle={`${leadAnalytics.bySource.length} channels`} icon={Share2}>
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
            </Panel>
          </div>

          {/* ─── Lead Status + Campaign Types ─── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Lead Status Distribution" subtitle="Pipeline snapshot" icon={Layers}>
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
            </Panel>

            <Panel title="Campaign Types" subtitle={`${CAMPAIGN_TYPES.length} categories`} icon={Megaphone}>
              <div className="flex items-center gap-4">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CAMPAIGN_TYPES}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {CAMPAIGN_TYPES.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {CAMPAIGN_TYPES.map((t) => (
                    <div key={t.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-brand-ink/80">
                        <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                        {t.name}
                      </span>
                      <span className="font-mono font-bold text-brand-ink">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {/* ─── Social Media + Handover Status ─── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel
              title="Social Media Performance"
              subtitle={`${SOCIAL_PLATFORMS.length} platforms`}
              icon={Globe}
              action={
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.socialMedia)}
                  className="group inline-flex items-center gap-1 text-[11px] font-semibold text-brand-magenta hover:underline"
                >
                  Manage <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              }
            >
              <div className="space-y-2.5">
                {SOCIAL_PLATFORMS.map((p) => (
                  <div
                    key={p.name}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-brand-lilac bg-gradient-to-r from-white to-brand-mist/40 p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-[0_10px_24px_-12px_rgba(227,28,121,0.35)]"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-lg">
                      {p.icon}
                    </span>
                    <div className="relative min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">{p.name}</p>
                      <p className="truncate text-[11px] font-medium text-brand-ink/60">Engagement: {p.engagement}</p>
                    </div>
                    <span className="relative shrink-0 rounded-full bg-brand-lilac px-3 py-1 text-xs font-bold text-brand-purple tabular-nums">
                      {p.leads}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              title="Lead Handover Status"
              subtitle={`${MOCK_HANDOVER.length} total leads`}
              icon={Users}
              action={
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.handover)}
                  className="group inline-flex items-center gap-1 text-[11px] font-semibold text-brand-magenta hover:underline"
                >
                  Manage <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                <StatTile icon={Clock}        label="Ready"     value={handoverAnalytics.ready}     color="amber" />
                <StatTile icon={TrendingUp}   label="Submitted" value={handoverAnalytics.submitted} color="purple" />
                <StatTile icon={CheckCircle2} label="Accepted"  value={handoverAnalytics.accepted}  color="emerald" />
                <StatTile icon={XCircle}      label="Rejected"  value={handoverAnalytics.rejected}  color="rose" />
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/60">Acceptance Rate</span>
                  <span className="font-display text-sm font-bold text-brand-magenta">
                    {MOCK_HANDOVER.length
                      ? Math.round((handoverAnalytics.accepted / MOCK_HANDOVER.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000 ease-out"
                    style={{
                      width: `${MOCK_HANDOVER.length ? (handoverAnalytics.accepted / MOCK_HANDOVER.length) * 100 : 0}%`,
                    }}
                  >
                    <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* ─── Campaign Performance + Marketing Funnel ─── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Campaign Performance" subtitle={`${MOCK_CAMPAIGNS.length} campaigns`} icon={Megaphone}>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <StatTile label="Active"    value={campaignAnalytics.active}         color="emerald" />
                <StatTile label="Scheduled" value={campaignAnalytics.scheduled}      color="purple" />
                <StatTile label="Completed" value={campaignAnalytics.completed}      color="purple" />
                <StatTile label="Leads"     value={campaignAnalytics.totalLeads}     color="rose" />
                <StatTile label="Qualified" value={campaignAnalytics.totalQualified} color="amber" />
                <StatTile label="Converted" value={campaignAnalytics.totalConverted} color="emerald" />
              </div>
            </Panel>

            <Panel title="Marketing Funnel" subtitle="Leads → Converted" icon={Target}>
              <div className="space-y-3">
                {[
                  { label: 'Leads Generated', value: 100, color: 'bg-violet-500' },
                  { label: 'Valid Leads',     value: 80,  color: 'bg-indigo-500' },
                  { label: 'Contacted',       value: 60,  color: 'bg-purple-500' },
                  { label: 'Interested',      value: 35,  color: 'bg-pink-500' },
                  { label: 'Qualified',       value: 20,  color: 'bg-orange-500' },
                  { label: 'Converted',       value: 10,  color: 'bg-emerald-500' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold text-brand-ink/70">{s.label}</span>
                      <span className="font-bold text-brand-ink">{s.value}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-brand-lilac">
                      <div className={`h-3 rounded-full ${s.color} transition-all duration-1000`} style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* ─── Recent Handover Leads + Tasks ─── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel
              title="Recent Handover Leads"
              subtitle="Latest 4"
              icon={Users}
              action={
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.handover)}
                  className="group inline-flex items-center gap-1 text-[11px] font-semibold text-brand-magenta hover:underline"
                >
                  View all <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              }
            >
              <ul className="divide-y divide-brand-lilac/40">
                {MOCK_HANDOVER.slice(0, 4).map((h) => {
                  const st = {
                    Ready:     'bg-amber-100 text-amber-600',
                    Submitted: 'bg-blue-100 text-blue-600',
                    Accepted:  'bg-emerald-100 text-emerald-600',
                    Rejected:  'bg-rose-100 text-brand-magenta',
                  }[h.status] || 'bg-slate-100 text-slate-600';
                  return (
                    <li key={h.id} className="flex items-center gap-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                        {h.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-ink">{h.name}</p>
                        <p className="truncate text-[11px] text-brand-ink/50">{h.source} · {h.id}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${st}`}>
                        {h.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel
              title="Pending Tasks"
              subtitle={`${MOCK_TASKS.length} total tasks`}
              icon={ListChecks}
              action={
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.tasks)}
                  className="group inline-flex items-center gap-1 text-[11px] font-semibold text-brand-magenta hover:underline"
                >
                  Manage <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                <StatTile icon={Clock}         label="Pending"     value={taskAnalytics.pending}    color="amber" />
                <StatTile icon={TrendingUp}    label="In Progress" value={taskAnalytics.inProgress} color="purple" />
                <StatTile icon={CheckCircle2}  label="Completed"   value={taskAnalytics.completed}  color="emerald" />
                <StatTile icon={AlertTriangle} label="Overdue"     value={taskAnalytics.overdue}    color="rose" alert={taskAnalytics.overdue > 0} />
              </div>
            </Panel>
          </div>
        </div>

        {/* ================= 8 QUICK ACTIONS ================= */}
        <div className="space-y-3">
          <SectionTitle eyebrow="Shortcuts" title="Quick Actions" hint="Jump straight to common tasks" />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            {[
              { label: 'Create Campaign',    icon: Megaphone,  to: ROUTES.campaigns,   tone: 'magenta' },
              { label: 'Add Marketing Lead', icon: UserPlus,   to: ROUTES.leads,       tone: 'purple' },
              { label: 'View New Leads',     icon: Target,     to: ROUTES.leads,       tone: 'rose' },
              { label: 'Campaign Leads',     icon: BarChart3,  to: ROUTES.performance, tone: 'purple' },
              { label: 'Add Lead Source',    icon: Share2,     to: ROUTES.sources,     tone: 'emerald' },
              { label: 'Schedule Task',      icon: Calendar,   to: ROUTES.tasks,       tone: 'amber' },
              { label: 'Campaign Report',    icon: FileText,   to: ROUTES.reports,     tone: 'purple' },
              { label: 'Export Report',      icon: Download,   to: ROUTES.reports,     tone: 'emerald' },
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
   SUBCOMPONENTS (same as AdminDashboard for visual parity)
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
      type="button"
      onClick={() => to && navigate(to)}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/40 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 ease-out ${t.border} ${t.glow} hover:-translate-y-1.5 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brand-magenta/40`}
    >
      <span className={`absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.corner} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      {alert && (
        <span className="pointer-events-none absolute right-3 top-3 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-magenta opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-magenta" />
        </span>
      )}

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${t.border} ${t.bg} ${t.fg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={16} />
        </span>
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
      <p className="relative mt-1 font-display text-lg font-bold">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

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
      type="button"
      onClick={() => navigate(to)}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-white via-white to-brand-mist/50 p-4 shadow-[0_4px_16px_-8px_rgba(139,47,214,0.15)] transition-all duration-300 hover:-translate-y-1.5 ${t.border} ${t.glow}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-magenta/[0.08] to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <span className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.from} ${t.to} text-white ${t.shadow} ring-2 ${t.ring} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
        <Icon size={18} />
      </span>
      <span className="relative text-center text-xs font-semibold text-brand-ink leading-tight">{label}</span>
    </button>
  );
}

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