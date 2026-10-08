// src/pages/marketing/CampaignPerformance.jsx
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown, AlertCircle, CheckCircle2, Users, Sparkles,
  Target, TrendingUp, Calendar, Layers, Flame, Inbox, Download,
  ArrowRight, Activity, DollarSign, Megaphone, BarChart3, Share2,
  Percent, Award, MessageSquare, UserPlus, XCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  CartesianGrid, Cell, AreaChart, Area,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   MODULE-LEVEL CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const CHART_COLORS = ['#E31C79', '#8B2FD6', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

const STORAGE_KEY = 'performance:marketing';

const TABS = [
  { key: 'lead',       label: 'Lead Performance',       icon: Users },
  { key: 'source',     label: 'Source Performance',     icon: Share2 },
  { key: 'cpl',        label: 'Cost Per Lead',          icon: DollarSign },
  { key: 'conversion', label: 'Conversion Performance', icon: Target },
  { key: 'roi',        label: 'ROI / Revenue',          icon: TrendingUp },
];

const CHART_VIEWS = [
  { key: 'funnel', label: 'Bars' },
  { key: 'area',   label: 'Flow' },
];

const KPI_THEMES = {
  purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'from-violet-50 via-violet-50/30 to-white', iconBg: 'bg-violet-100 text-brand-purple border-violet-200', bar: 'from-brand-purple to-brand-magenta', glow: 'bg-brand-purple/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]', valueColor: 'text-brand-purple' },
  emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'from-emerald-50 via-emerald-50/30 to-white', iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'from-emerald-500 to-emerald-400', glow: 'bg-emerald-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]', valueColor: 'text-emerald-600' },
  amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'from-amber-50 via-amber-50/30 to-white', iconBg: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'from-amber-500 to-orange-400', glow: 'bg-amber-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]', valueColor: 'text-amber-600' },
  rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'from-rose-50 via-rose-50/30 to-white', iconBg: 'bg-rose-100 text-brand-magenta border-rose-200', bar: 'from-brand-magenta to-brand-purple', glow: 'bg-brand-magenta/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]', valueColor: 'text-brand-magenta' },
};

const METRIC_TILE_COLORS = {
  purple:  'bg-violet-50 text-brand-purple border-violet-200',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  amber:   'bg-amber-50 text-amber-600 border-amber-200',
  rose:    'bg-rose-50 text-brand-magenta border-rose-200',
};

const METRIC_CARD_COLORS = {
  purple:  'text-brand-purple',
  emerald: 'text-emerald-600',
  rose:    'text-brand-magenta',
  amber:   'text-amber-600',
};

const COST_CARD_TONES = {
  purple:  { fg: 'text-brand-purple',  bg: 'bg-violet-50',  border: 'border-violet-200' },
  emerald: { fg: 'text-emerald-600',   bg: 'bg-emerald-50', border: 'border-emerald-200' },
  amber:   { fg: 'text-amber-600',     bg: 'bg-amber-50',   border: 'border-amber-200' },
  rose:    { fg: 'text-brand-magenta', bg: 'bg-rose-50',    border: 'border-rose-200' },
};

const COST_ROW_TONES = {
  purple:  'text-brand-purple',
  emerald: 'text-emerald-600',
  rose:    'text-brand-magenta',
  amber:   'text-amber-600',
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const loadState = (fallback) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (value) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* ignore */ }
};

/* Whole-rupee formatting for aggregate amounts (budget, revenue, profit) */
const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

/* Paise-precise formatting for per-unit cost metrics (CPL, CPQL, CPConv) */
const formatCurrencyPrecise = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatPercent  = (n) => `${Number(n || 0).toFixed(1)}%`;
const formatRatio    = (a, b) => (b > 0 ? (a / b) * 100 : 0);

/* ═══════════════════════════════════════════════════════════════
   SEED DATA — all values in INR
   ═══════════════════════════════════════════════════════════════ */
const SEED_CAMPAIGNS = [
  { id: 'cmp-1', name: 'Summer Sale 2024', type: 'Promotion', channel: 'Google Ads', project: 'Eliteinova Matrimony',
    budget: 500000, status: 'Active', startDate: '2024-06-01', endDate: '2024-06-30',
    leads: 100, validLeads: 80, contacted: 60, interested: 35, qualified: 20, converted: 10,
    assigned: 55, followUps: 40, lost: 15, revenue: 1500000,
    sources: [
      { name: 'Google Ads', leads: 55, qualified: 12, converted: 6 },
      { name: 'Meta Ads',   leads: 30, qualified: 5,  converted: 3 },
      { name: 'Referral',   leads: 15, qualified: 3,  converted: 1 },
    ] },
  { id: 'cmp-2', name: 'Google Search - CRM', type: 'Lead Generation', channel: 'Google Ads', project: 'Eliteinova CRM',
    budget: 300000, status: 'Active', startDate: '2024-06-10', endDate: '2024-07-10',
    leads: 120, validLeads: 95, contacted: 75, interested: 48, qualified: 30, converted: 15,
    assigned: 70, followUps: 55, lost: 22, revenue: 2250000,
    sources: [
      { name: 'Google Ads', leads: 80, qualified: 22, converted: 11 },
      { name: 'Website',    leads: 30, qualified: 6,  converted: 3 },
      { name: 'WhatsApp',   leads: 10, qualified: 2,  converted: 1 },
    ] },
  { id: 'cmp-3', name: 'Facebook Awareness', type: 'Brand Awareness', channel: 'Facebook', project: 'Eliteinova Matrimony',
    budget: 150000, status: 'Scheduled', startDate: '2024-07-01', endDate: '2024-07-31',
    leads: 60, validLeads: 48, contacted: 30, interested: 18, qualified: 8, converted: 3,
    assigned: 28, followUps: 20, lost: 10, revenue: 450000,
    sources: [
      { name: 'Facebook',  leads: 40, qualified: 6, converted: 2 },
      { name: 'Instagram', leads: 20, qualified: 2, converted: 1 },
    ] },
  { id: 'cmp-4', name: 'Product Launch Q3', type: 'Product Launch', channel: 'LinkedIn', project: 'Eliteinova CRM',
    budget: 800000, status: 'Completed', startDate: '2024-05-15', endDate: '2024-06-15',
    leads: 200, validLeads: 170, contacted: 140, interested: 90, qualified: 60, converted: 30,
    assigned: 130, followUps: 100, lost: 45, revenue: 4500000,
    sources: [
      { name: 'LinkedIn',   leads: 100, qualified: 35, converted: 18 },
      { name: 'Google Ads', leads: 60,  qualified: 18, converted: 8 },
      { name: 'Referral',   leads: 40,  qualified: 7,  converted: 4 },
    ] },
  { id: 'cmp-5', name: 'Diwali Festival Promo', type: 'Festival Campaign', channel: 'Meta Ads', project: 'Eliteinova Matrimony',
    budget: 450000, status: 'Active', startDate: '2024-10-20', endDate: '2024-11-15',
    leads: 150, validLeads: 125, contacted: 95, interested: 60, qualified: 35, converted: 18,
    assigned: 90, followUps: 70, lost: 30, revenue: 2700000,
    sources: [
      { name: 'Meta Ads', leads: 90, qualified: 22, converted: 11 },
      { name: 'WhatsApp', leads: 40, qualified: 9,  converted: 5 },
      { name: 'Referral', leads: 20, qualified: 4,  converted: 2 },
    ] },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function CampaignPerformance() {
  const { user: _user } = useAuth(); // reserved for future personalization

  const campaigns = useMemo(() => loadState(SEED_CAMPAIGNS), []);
  const [activeTab, setActiveTab] = useState('lead');
  const [selectedCampaignId, setSelectedCampaignId] = useState('all');
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [chartView, setChartView] = useState('funnel');
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => { saveState(campaigns); }, [campaigns]);
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId]
  );

  const scopedCampaigns = useMemo(() => {
    if (selectedCampaignId === 'all') return campaigns;
    return campaigns.filter((c) => c.id === selectedCampaignId);
  }, [campaigns, selectedCampaignId]);

  const metrics = useMemo(() => {
    const list = scopedCampaigns;
    let budget = 0, leads = 0, validLeads = 0, contacted = 0,
        interested = 0, qualified = 0, converted = 0, assigned = 0,
        followUps = 0, lost = 0, revenue = 0;

    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      budget     += c.budget     || 0;
      leads      += c.leads      || 0;
      validLeads += c.validLeads || 0;
      contacted  += c.contacted  || 0;
      interested += c.interested || 0;
      qualified  += c.qualified  || 0;
      converted  += c.converted  || 0;
      assigned   += c.assigned   || 0;
      followUps  += c.followUps  || 0;
      lost       += c.lost       || 0;
      revenue    += c.revenue    || 0;
    }

    return {
      budget, leads, validLeads, contacted, interested,
      qualified, converted, assigned, followUps, lost, revenue,
      cpl:            leads     > 0 ? budget / leads     : 0,
      cpql:           qualified > 0 ? budget / qualified : 0,
      cpConv:         converted > 0 ? budget / converted : 0,
      conversionRate: formatRatio(converted, leads),
      roi:            budget > 0 ? ((revenue - budget) / budget) * 100 : 0,
      profit:         revenue - budget,
    };
  }, [scopedCampaigns]);

  const funnelData = useMemo(() => {
    const max = Math.max(metrics.leads, 1);
    return [
      { stage: 'Leads Generated', value: metrics.leads,      color: '#8B2FD6' },
      { stage: 'Valid Leads',     value: metrics.validLeads, color: '#6366F1' },
      { stage: 'Contacted',       value: metrics.contacted,  color: '#E31C79' },
      { stage: 'Interested',      value: metrics.interested, color: '#EC4899' },
      { stage: 'Qualified',       value: metrics.qualified,  color: '#F59E0B' },
      { stage: 'Converted',       value: metrics.converted,  color: '#10B981' },
    ].map((f) => ({ ...f, pct: Math.round((f.value / max) * 100) }));
  }, [metrics]);

  const sourceAggregation = useMemo(() => {
    const map = new Map();
    for (const c of scopedCampaigns) {
      const srcs = c.sources || [];
      for (const s of srcs) {
        const leads     = s.leads     || 0;
        const qualified = s.qualified || 0;
        const converted = s.converted || 0;
        const existing = map.get(s.name);
        if (existing) {
          existing.leads     += leads;
          existing.qualified += qualified;
          existing.converted += converted;
        } else {
          map.set(s.name, { name: s.name, leads, qualified, converted });
        }
      }
    }
    return [...map.values()].sort((a, b) => b.leads - a.leads);
  }, [scopedCampaigns]);

  const kpis = useMemo(() => ([
    { icon: DollarSign,   label: 'Campaign Budget',   value: formatCurrency(metrics.budget),  sub: 'Total spend',                                     color: 'purple',  delay: 0   },
    { icon: Users,        label: 'Leads Generated',   value: metrics.leads,                   sub: `${metrics.validLeads} valid`,                     color: 'emerald', delay: 40  },
    { icon: CheckCircle2, label: 'Qualified',         value: metrics.qualified,               sub: `${formatPercent(formatRatio(metrics.qualified, metrics.leads))} of leads`, color: 'purple', delay: 80 },
    { icon: Target,       label: 'Converted',         value: metrics.converted,               sub: `${formatPercent(metrics.conversionRate)} rate`,   color: 'emerald', delay: 120 },
    { icon: Award,        label: 'Revenue Generated', value: formatCurrency(metrics.revenue), sub: `${formatPercent(metrics.roi)} ROI`,               color: 'rose',    delay: 160 },
  ]), [metrics]);

  const hasData = scopedCampaigns.length > 0;

  const handleExport = useCallback(() => showToast('Report generated'), [showToast]);
  const handleSelectAllCampaigns = useCallback(() => { setSelectedCampaignId('all'); setCampaignOpen(false); }, []);
  const handleSelectCampaign = useCallback((id) => { setSelectedCampaignId(id); setCampaignOpen(false); }, []);
  const handleToggleCampaignOpen = useCallback(() => setCampaignOpen((o) => !o), []);
  const handleCloseCampaignMenu = useCallback(() => setCampaignOpen(false), []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-40">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Campaign Performance</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <BarChart3 size={13} className="text-brand-magenta" />
              Funnel, cost, and ROI analytics across campaigns
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md"
            >
              <Download size={14} className="transition-transform group-hover:translate-y-0.5" /> Export Report
            </button>

            <CampaignSelector
              campaigns={campaigns}
              selectedCampaignId={selectedCampaignId}
              selectedCampaign={selectedCampaign}
              isOpen={campaignOpen}
              onToggle={handleToggleCampaignOpen}
              onClose={handleCloseCampaignMenu}
              onSelect={handleSelectCampaign}
              onSelectAll={handleSelectAllCampaigns}
            />
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Performance Overview</p>
              <h2 className="font-display text-sm font-semibold text-brand-ink">
                {selectedCampaign ? selectedCampaign.name : `${campaigns.length} campaigns combined`}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {kpis.map((k) => (
              <KpiCard key={k.label} {...k} />
            ))}
          </div>
        </div>

        {/* TABS */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            {activeTab === 'lead'       && <LeadTab       metrics={metrics} funnelData={funnelData} chartView={chartView} setChartView={setChartView} scopedCampaigns={scopedCampaigns} />}
            {activeTab === 'source'     && <SourceTab     sourceAggregation={sourceAggregation} metrics={metrics} />}
            {activeTab === 'cpl'        && <CplTab        metrics={metrics} />}
            {activeTab === 'conversion' && <ConversionTab metrics={metrics} funnelData={funnelData} />}
            {activeTab === 'roi'        && <RoiTab        metrics={metrics} scopedCampaigns={scopedCampaigns} />}
          </>
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN SELECTOR
   ═══════════════════════════════════════════════════════════════ */
const CampaignSelector = memo(function CampaignSelector({
  campaigns, selectedCampaignId, selectedCampaign, isOpen,
  onToggle, onClose, onSelect, onSelectAll,
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
      >
        <Megaphone size={14} className="text-brand-magenta" />
        Campaign:
        <span className="max-w-[160px] truncate font-bold text-brand-magenta">
          {selectedCampaign ? selectedCampaign.name : 'All Campaigns'}
        </span>
        <ChevronDown size={14} className={`text-brand-ink/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div className="absolute right-0 top-full z-30 mt-2 max-h-72 w-64 overflow-y-auto no-scrollbar rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            <button
              onClick={onSelectAll}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                selectedCampaignId === 'all'
                  ? 'bg-brand-magenta/10 text-brand-magenta'
                  : 'text-brand-ink/70 hover:bg-brand-lilac/40'
              }`}
            >
              All Campaigns
            </button>
            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selectedCampaignId === c.id
                    ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
              >
                <p className="truncate font-semibold">{c.name}</p>
                <p className="truncate font-mono text-[10px] opacity-60">{c.project}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   TAB COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ─────────── LEAD PERFORMANCE TAB ─────────── */
const LeadTab = memo(function LeadTab({ metrics, funnelData, chartView, setChartView, scopedCampaigns }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          title="Marketing Funnel"
          subtitle="Complete lead journey"
          icon={TrendingUp}
          action={
            <div className="inline-flex items-center gap-1 rounded-full border border-brand-lilac bg-brand-mist p-1">
              {CHART_VIEWS.map((v) => {
                const active = chartView === v.key;
                return (
                  <button
                    key={v.key}
                    onClick={() => setChartView(v.key)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-card scale-105'
                        : 'text-brand-ink/60 hover:text-brand-magenta'
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          }
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'area' ? (
                <AreaChart data={funnelData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="funnelArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E31C79" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#E31C79" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E9D5F5" strokeDasharray="3 3" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#6b5b7e', fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E31C79', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="value" stroke="#E31C79" strokeWidth={3} fill="url(#funnelArea)" dot={{ r: 4, fill: '#E31C79' }} activeDot={{ r: 6, fill: '#E31C79', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              ) : (
                <BarChart data={funnelData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E9D5F5" strokeDasharray="3 3" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#6b5b7e', fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1E4FB', radius: 8 }} />
                  <Bar dataKey="value" radius={[8, 8, 2, 2]} barSize={36}>
                    {funnelData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Funnel Stages" subtitle="Stage-by-stage conversion" icon={Layers}>
          <div className="space-y-4">
            {funnelData.map((f) => (
              <div key={f.stage}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-ink/70">{f.stage}</span>
                  <span className="font-mono font-bold text-brand-ink tabular-nums">
                    {f.value.toLocaleString('en-IN')} <span className="text-brand-ink/40">({f.pct}%)</span>
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${f.pct}%`, background: f.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="All Campaign Metrics" subtitle={`${scopedCampaigns.length} campaign${scopedCampaigns.length !== 1 ? 's' : ''}`} icon={Activity}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <MetricTile icon={DollarSign}    label="Campaign Budget" value={formatCurrency(metrics.budget)}                color="purple" />
          <MetricTile icon={Users}         label="Leads Generated" value={metrics.leads}                                color="rose" />
          <MetricTile icon={Sparkles}      label="Valid Leads"     value={metrics.validLeads}                           color="purple" />
          <MetricTile icon={UserPlus}      label="Assigned Leads"  value={metrics.assigned}                             color="emerald" />
          <MetricTile icon={MessageSquare} label="Contacted"       value={metrics.contacted}                            color="purple" />
          <MetricTile icon={Flame}         label="Interested"      value={metrics.interested}                           color="amber" />
          <MetricTile icon={Calendar}      label="Follow-ups"      value={metrics.followUps}                            color="purple" />
          <MetricTile icon={CheckCircle2}  label="Qualified"       value={metrics.qualified}                            color="emerald" />
          <MetricTile icon={Target}        label="Conversions"     value={metrics.converted}                            color="emerald" />
          <MetricTile icon={XCircle}       label="Lost Leads"      value={metrics.lost}                                 color="rose" />
          <MetricTile icon={DollarSign}    label="Cost Per Lead"   value={formatCurrencyPrecise(metrics.cpl)}           color="amber" />
          <MetricTile icon={Percent}       label="Conversion Rate" value={formatPercent(metrics.conversionRate)}        color="rose" />
        </div>
      </Panel>
    </div>
  );
});

/* ─────────── SOURCE PERFORMANCE TAB ─────────── */
const SourceTab = memo(function SourceTab({ sourceAggregation, metrics }) {
  return (
    <div className="space-y-5">
      <Panel title="Source Performance" subtitle={`${sourceAggregation.length} channels contributing`} icon={Share2}>
        {sourceAggregation.length === 0 ? (
          <EmptyState message="No source data" />
        ) : (
          <div className="space-y-4">
            {sourceAggregation.map((s, i) => {
              const pct = formatRatio(s.leads, metrics.leads);
              const conversionRate = formatRatio(s.converted, s.leads);
              return (
                <div key={s.name} className="group rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-white to-brand-mist/40 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-display text-sm font-bold text-brand-ink">{s.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">
                          {pct.toFixed(1)}% of total leads
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="font-display text-lg font-bold text-brand-purple tabular-nums">{s.leads.toLocaleString('en-IN')}</p>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/40">Leads</p>
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-amber-600 tabular-nums">{s.qualified.toLocaleString('en-IN')}</p>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/40">Qual.</p>
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-emerald-600 tabular-nums">{s.converted.toLocaleString('en-IN')}</p>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/40">Conv.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-lilac">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                  <p className="mt-2 flex items-center gap-1 font-mono text-[10px] text-emerald-600">
                    <TrendingUp size={10} /> {conversionRate.toFixed(1)}% conversion rate
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
});

/* ─────────── COST PER LEAD TAB ─────────── */
const CplTab = memo(function CplTab({ metrics }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <CostCard icon={DollarSign} label="Cost Per Lead"
          value={formatCurrencyPrecise(metrics.cpl)}
          formula={`${formatCurrency(metrics.budget)} ÷ ${metrics.leads.toLocaleString('en-IN')} leads`}
          tone="amber" />
        <CostCard icon={Target} label="Cost Per Qualified Lead"
          value={formatCurrencyPrecise(metrics.cpql)}
          formula={`${formatCurrency(metrics.budget)} ÷ ${metrics.qualified.toLocaleString('en-IN')} qualified`}
          tone="purple" />
        <CostCard icon={Award} label="Cost Per Conversion"
          value={formatCurrencyPrecise(metrics.cpConv)}
          formula={`${formatCurrency(metrics.budget)} ÷ ${metrics.converted.toLocaleString('en-IN')} conversions`}
          tone="emerald" />
      </div>

      <Panel title="Cost Breakdown" subtitle="Budget allocation & efficiency" icon={BarChart3}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <CostRow label="Total Campaign Budget" value={formatCurrency(metrics.budget)}          tone="purple" />
          <CostRow label="Total Leads Generated" value={metrics.leads.toLocaleString('en-IN')}   tone="emerald" />
          <CostRow label="Qualified Leads"       value={metrics.qualified.toLocaleString('en-IN')} tone="amber" />
          <CostRow label="Converted Leads"       value={metrics.converted.toLocaleString('en-IN')} tone="emerald" />
          <CostRow label="Revenue Generated"     value={formatCurrency(metrics.revenue)}         tone="rose" />
          <CostRow label="Profit"                value={formatCurrency(metrics.profit)}          tone={metrics.profit >= 0 ? 'emerald' : 'rose'} />
        </div>
      </Panel>
    </div>
  );
});

/* ─────────── CONVERSION PERFORMANCE TAB ─────────── */
const ConversionTab = memo(function ConversionTab({ metrics, funnelData }) {
  const cards = useMemo(() => ([
    { label: 'Conversion Rate', value: formatPercent(metrics.conversionRate),                              sub: 'Leads → Converted', color: 'emerald' },
    { label: 'Qualified Rate',  value: formatPercent(formatRatio(metrics.qualified, metrics.leads)),       sub: 'Leads → Qualified', color: 'purple' },
    { label: 'Contacted Rate',  value: formatPercent(formatRatio(metrics.contacted, metrics.leads)),       sub: 'Leads → Contacted', color: 'purple' },
    { label: 'Lost Rate',       value: formatPercent(formatRatio(metrics.lost, metrics.leads)),            sub: 'Leads → Lost',      color: 'rose' },
  ]), [metrics]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <MetricCard key={c.label} {...c} />
        ))}
      </div>

      <Panel title="Conversion Flow" subtitle="Stage-by-stage drop-off" icon={TrendingUp}>
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {funnelData.map((f, i, arr) => (
            <div key={f.stage} className="flex items-center gap-2">
              <div
                className="flex min-w-[110px] flex-col items-center rounded-xl border-2 bg-white px-3.5 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: f.color }}
              >
                <span className="font-display text-base font-bold tabular-nums" style={{ color: f.color }}>
                  {f.value.toLocaleString('en-IN')}
                </span>
                <span className="mt-0.5 text-center text-[10px] font-semibold text-brand-ink/60 leading-tight">
                  {f.stage}
                </span>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight size={14} className="shrink-0 text-brand-magenta/50" />
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
});

/* ─────────── ROI / REVENUE TAB ─────────── */
const RoiTab = memo(function RoiTab({ metrics, scopedCampaigns }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MetricCard label="Revenue Generated" value={formatCurrency(metrics.revenue)} sub="Total earned"   color="emerald" icon={Award} />
        <MetricCard label="Total Spend"       value={formatCurrency(metrics.budget)}  sub="Total invested" color="purple"  icon={DollarSign} />
        <MetricCard
          label="ROI"
          value={formatPercent(metrics.roi)}
          sub={`${metrics.profit >= 0 ? '+' : ''}${formatCurrency(metrics.profit)} profit`}
          color={metrics.roi >= 0 ? 'emerald' : 'rose'}
          icon={TrendingUp}
        />
      </div>

      <Panel title="Revenue Breakdown" subtitle="Per-campaign revenue contribution" icon={Award}>
        <div className="space-y-3">
          {scopedCampaigns.map((c) => {
            const pct = formatRatio(c.revenue, metrics.revenue);
            return (
              <div key={c.id} className="rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-white to-brand-mist/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
                      <Megaphone size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold text-brand-ink">{c.name}</p>
                      <p className="truncate font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">
                        {c.project} · {c.channel}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-right">
                    <div>
                      <p className="font-display text-base font-bold text-brand-purple tabular-nums">{formatCurrency(c.budget)}</p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/40">Spend</p>
                    </div>
                    <ArrowRight size={12} className="text-brand-magenta/50" />
                    <div>
                      <p className="font-display text-base font-bold text-emerald-600 tabular-nums">{formatCurrency(c.revenue)}</p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/40">Revenue</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 flex items-center justify-end gap-1 font-mono text-[10px] text-brand-ink/50">
                  <Percent size={10} /> {pct.toFixed(1)}% of total revenue
                </p>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   LEAF COMPONENTS (all memoized)
   ═══════════════════════════════════════════════════════════════ */

const KpiCard = memo(function KpiCard({ icon: Icon, label, value, sub, color = 'purple', delay = 0 }) {
  const numeric = typeof value === 'number';
  const displayValue = useAnimatedCount(numeric ? value : 0);
  const showValue = numeric ? displayValue : value;
  const t = KPI_THEMES[color] || KPI_THEMES.purple;

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/30 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 hover:-translate-y-1.5 animate-fade-slide-in ${t.border} ${t.shadow}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${t.iconBg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} />
        </span>
      </div>

      <div className="relative z-10 w-full">
        <p className={`truncate font-display text-2xl font-bold leading-tight tabular-nums ${t.valueColor}`}>{showValue}</p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </div>
  );
});

function useAnimatedCount(target, duration = 600) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const to = Number(target) || 0;

    // Skip animation entirely for zero/negative targets — avoids needless RAF churn
    if (to <= 0) {
      setDisplay(0);
      return undefined;
    }

    startRef.current = null;
    const tick = (now) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display.toLocaleString('en-IN');
}

const Panel = memo(function Panel({ title, subtitle, action, icon: Icon, className = '', children }) {
  return (
    <div className={`group/panel relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-white via-white to-brand-mist/40 shadow-[0_4px_16px_-8px_rgba(139,47,214,0.15)] transition-all duration-300 hover:border-brand-magenta/35 hover:shadow-[0_14px_36px_-16px_rgba(227,28,121,0.28)] ${className}`}>
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
});

const MetricTile = memo(function MetricTile({ icon: Icon, label, value, color = 'purple' }) {
  return (
    <div className={`group rounded-xl border ${METRIC_TILE_COLORS[color]} p-3 transition-all hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</p>
        <Icon size={12} className="transition-transform group-hover:scale-110" />
      </div>
      <p className="mt-1 truncate font-display text-lg font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
    </div>
  );
});

const MetricCard = memo(function MetricCard({ icon: Icon, label, value, sub, color = 'purple' }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-white to-brand-mist/40 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-magenta/40 hover:shadow-md">
      {Icon && (
        <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mist ${METRIC_CARD_COLORS[color]}`}>
          <Icon size={16} />
        </span>
      )}
      <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold tabular-nums ${METRIC_CARD_COLORS[color]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-brand-ink/60">{sub}</p>}
    </div>
  );
});

const CostCard = memo(function CostCard({ icon: Icon, label, value, formula, tone = 'purple' }) {
  const t = COST_CARD_TONES[tone] || COST_CARD_TONES.purple;
  return (
    <div className={`group relative overflow-hidden rounded-2xl border-2 ${t.border} bg-gradient-to-br from-white to-brand-mist/30 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.bg} ${t.fg}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold tabular-nums ${t.fg}`}>{value}</p>
      <p className="mt-1 font-mono text-[10px] text-brand-ink/50">{formula}</p>
    </div>
  );
});

const CostRow = memo(function CostRow({ label, value, tone = 'purple' }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-white to-brand-mist/40 px-4 py-3">
      <span className="text-sm text-brand-ink/70">{label}</span>
      <span className={`font-display text-base font-bold tabular-nums ${COST_ROW_TONES[tone]}`}>{value}</span>
    </div>
  );
});

const CustomTooltip = memo(function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-brand-magenta/30 bg-white px-3 py-2 shadow-[0_8px_24px_-8px_rgba(227,28,121,0.4)]">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-magenta">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="mt-0.5 font-display text-sm font-bold text-brand-ink">
          {typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}
          {p.name && <span className="ml-1 text-xs font-normal text-brand-ink/60">{p.name}</span>}
        </p>
      ))}
    </div>
  );
});

const EmptyState = memo(function EmptyState({ message }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Inbox size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {message || 'No performance data yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        Create campaigns with leads to see performance analytics here.
      </p>
    </div>
  );
});

const Toast = memo(function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
});