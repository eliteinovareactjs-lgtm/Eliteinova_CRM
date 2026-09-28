// src/pages/admin/Reports.jsx
import { useMemo, useState } from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, Area, ComposedChart,
} from 'recharts';
import {
  Download, TrendingUp, TrendingDown, Phone, Users, Target,
  CheckCircle2, AlertTriangle, ChevronDown, Award,
  BarChart3, Calendar, ArrowRight, PhoneIncoming, PhoneOutgoing,
  PhoneMissed, XCircle, Megaphone, UserCheck, ListChecks, Layers,
  Percent, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  LEADS, AGENTS, CALLS, FOLLOW_UPS, CAMPAIGNS,
} from '../../data/mockData';

const COLORS = ['#E31C79', '#8B2FD6', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#14B8A6', '#F97316'];

/* ═══════════════════════════════════════════════════════════════
   DATE RANGE HELPERS
   ═══════════════════════════════════════════════════════════════ */
const RANGES = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Custom'];

const LEAD_DATE_FIELDS = ['createdAt', 'created_at', 'date'];
const CALL_DATE_FIELDS = ['startedAt', 'calledAt', 'createdAt', 'date', 'timestamp'];
const FOLLOWUP_DATE_FIELDS = ['dueDate', 'scheduledAt', 'createdAt', 'date'];
const CAMPAIGN_DATE_FIELDS = ['createdAt', 'startDate', 'created_at', 'date'];

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const toInputValue = (d) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function getRangeBounds(range, customFrom, customTo) {
  const now = new Date();
  const end = endOfDay(now);
  const start = startOfDay(now);
  switch (range) {
    case 'Today':
      return { start, end };
    case 'Last 7 Days':
      start.setDate(start.getDate() - 6);
      return { start, end };
    case 'Last 30 Days':
      start.setDate(start.getDate() - 29);
      return { start, end };
    case 'This Month':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
    case 'Custom':
      return {
        start: customFrom ? startOfDay(customFrom) : start,
        end: customTo ? endOfDay(customTo) : end,
      };
    default:
      return { start, end };
  }
}

function getItemDate(item, fields) {
  for (const f of fields) {
    if (item[f]) {
      const d = new Date(item[f]);
      if (!isNaN(d)) return d;
    }
  }
  return null;
}

function inRange(item, fields, { start, end }) {
  const d = getItemDate(item, fields);
  if (!d) return true; // records without a date are kept
  return d >= start && d <= end;
}

/* ═══════════════════════════════════════════════════════════════
   CHART THEME
   ═══════════════════════════════════════════════════════════════ */
const CHART_TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid #F1E4FB',
  fontSize: 12,
  boxShadow: '0 8px 24px -8px rgba(227,28,121,0.25)',
  padding: '8px 12px',
};

const GRID_STROKE = '#F1E4FB';
const AXIS_TICK = { fontSize: 11, fill: '#8b7a9e', fontWeight: 500 };

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Reports() {
  const { activeWebsiteId, activeWebsite } = useAuth();
  const [range, setRange] = useState('Last 7 Days');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  /* ✅ Single source of truth for KPI highlight (matches Integrations pattern) */
  const [activeKpi, setActiveKpi] = useState('overview');

  const [customFrom, setCustomFrom] = useState(toInputValue(new Date(Date.now() - 6 * 864e5)));
  const [customTo, setCustomTo] = useState(toInputValue(new Date()));

  const bounds = useMemo(
    () => getRangeBounds(range, customFrom, customTo),
    [range, customFrom, customTo]
  );

  const rangeLabel = useMemo(() => {
    if (range !== 'Custom') return range;
    return `${customFrom} → ${customTo}`;
  }, [range, customFrom, customTo]);

  /* ========== SCOPED DATA (website + date range) ========== */
  const scopedLeads = useMemo(
    () => LEADS.filter((l) => l.websiteId === activeWebsiteId && inRange(l, LEAD_DATE_FIELDS, bounds)),
    [activeWebsiteId, bounds]
  );

  const scopedAgents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  const scopedCalls = useMemo(
    () => (CALLS || []).filter(
      (c) => (c.projectId ?? c.websiteId) === activeWebsiteId && inRange(c, CALL_DATE_FIELDS, bounds)
    ),
    [activeWebsiteId, bounds]
  );

  const scopedFollowUps = useMemo(
    () => (FOLLOW_UPS || []).filter(
      (f) => (f.projectId ?? f.websiteId) === activeWebsiteId && inRange(f, FOLLOWUP_DATE_FIELDS, bounds)
    ),
    [activeWebsiteId, bounds]
  );

  /* ✅ FIX: Campaigns now filtered by date range too */
  const scopedCampaigns = useMemo(
    () => (CAMPAIGNS || []).filter(
      (c) => (c.projectId ?? c.websiteId) === activeWebsiteId && inRange(c, CAMPAIGN_DATE_FIELDS, bounds)
    ),
    [activeWebsiteId, bounds]
  );

  /* ========== CORE METRICS ========== */
  const metrics = useMemo(() => {
    const total = scopedLeads.length;
    const won = scopedLeads.filter((l) => l.status === 'Won').length;
    const missed = scopedLeads.filter((l) => l.status === 'Missed').length;
    const followUp = scopedLeads.filter((l) => l.status === 'Follow Up').length;
    const fresh = scopedLeads.filter((l) => l.status === 'Fresh').length;
    const qualified = scopedLeads.filter((l) => l.status === 'Qualified').length;
    const lost = scopedLeads.filter((l) => l.status === 'Lost').length;
    const assigned = scopedLeads.filter((l) => l.assignedAgent && l.assignedAgent !== 'Unassigned').length;
    const conversion = total > 0 ? Math.round((won / total) * 100) : 0;
    const compliance = total > 0 ? Math.round(((total - missed) / total) * 100) : 0;

    const connectedCalls = scopedCalls.filter((c) => c.status === 'connected').length;
    const missedCalls = scopedCalls.filter((c) => c.status === 'missed').length;
    const inboundCalls = scopedCalls.filter((c) => c.type === 'inbound' || c.type === 'incoming').length;
    const outboundCalls = scopedCalls.filter((c) => c.type === 'outbound' || c.type === 'outgoing').length;
    const totalCallDuration = scopedCalls.reduce((sum, c) => {
      const [m, s] = (c.duration || '0:0').split(':').map(Number);
      return sum + (m || 0) * 60 + (s || 0);
    }, 0);

    return {
      total, won, missed, followUp, fresh, qualified, lost, assigned,
      conversion, compliance,
      connectedCalls, missedCalls, inboundCalls, outboundCalls,
      totalCallDuration,
      avgCallDuration: scopedCalls.length ? Math.round(totalCallDuration / scopedCalls.length) : 0,
    };
  }, [scopedLeads, scopedCalls]);

  /* ========== TREND DATA (follows the selected range) ========== */
  const trendData = useMemo(() => {
    const { start, end } = bounds;
    /* ✅ FIX: hourly only when the range spans exactly 1 day AND range is 'Today' */
    const spanDays = Math.ceil((end - start) / 864e5);
    const hourly = range === 'Today' || (spanDays <= 1 && range === 'Custom');

    const rows = [];
    const index = new Map();
    const keyOf = (d) => (hourly ? d.getHours() : startOfDay(d).getTime());

    if (hourly) {
      for (let h = 0; h < 24; h++) {
        index.set(h, rows.length);
        rows.push({ day: `${String(h).padStart(2, '0')}:00`, calls: 0, leads: 0 });
      }
    } else {
      const cur = new Date(start);
      while (cur <= end) {
        index.set(startOfDay(cur).getTime(), rows.length);
        rows.push({
          day: cur.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          calls: 0,
          leads: 0,
        });
        cur.setDate(cur.getDate() + 1);
      }
    }

    scopedLeads.forEach((l) => {
      const d = getItemDate(l, LEAD_DATE_FIELDS);
      const i = d ? index.get(keyOf(d)) : undefined;
      if (i !== undefined) rows[i].leads++;
    });
    scopedCalls.forEach((c) => {
      const d = getItemDate(c, CALL_DATE_FIELDS);
      const i = d ? index.get(keyOf(d)) : undefined;
      if (i !== undefined) rows[i].calls++;
    });

    return rows;
  }, [bounds, range, scopedLeads, scopedCalls]);

  /* ========== 1. LEAD REPORTS ========== */

  const sourceData = useMemo(() => {
    const sources = {};
    scopedLeads.forEach((l) => {
      const key = l.leadSource || 'Other';
      sources[key] = (sources[key] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [scopedLeads]);

  const statusData = useMemo(() => {
    const statuses = ['Fresh', 'Follow Up', 'Qualified', 'Won', 'Lost', 'Missed'];
    return statuses.map((s) => ({
      name: s,
      value: scopedLeads.filter((l) => l.status === s).length,
      fill: {
        Fresh: '#8B2FD6',
        'Follow Up': '#F59E0B',
        Qualified: '#6366F1',
        Won: '#10B981',
        Lost: '#94A3B8',
        Missed: '#E31C79',
      }[s],
    }));
  }, [scopedLeads]);

  const categoryData = useMemo(() => {
    const cats = {};
    scopedLeads.forEach((l) => {
      const key = l.category || 'Uncategorized';
      cats[key] = (cats[key] || 0) + 1;
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [scopedLeads]);

  const assignmentData = useMemo(() => {
    const assigned = scopedLeads.filter((l) => l.assignedAgent && l.assignedAgent !== 'Unassigned').length;
    const unassigned = scopedLeads.length - assigned;
    return [
      { name: 'Assigned', value: assigned, fill: '#10B981' },
      { name: 'Unassigned', value: unassigned, fill: '#F59E0B' },
    ];
  }, [scopedLeads]);

  /* ========== 2. AGENT REPORTS ========== */

  const agentPerformance = useMemo(() => {
    return scopedAgents.map((a) => {
      const agentLeads = scopedLeads.filter((l) => l.assignedAgent === a.name);
      const won = agentLeads.filter((l) => l.status === 'Won').length;
      const missed = agentLeads.filter((l) => l.status === 'Missed').length;
      const agentCalls = scopedCalls.filter((c) => c.agentId === a.id || c.agentName === a.name);
      const agentFollowUps = scopedFollowUps.filter((f) => f.agentName === a.name);
      const completedFollowUps = agentFollowUps.filter((f) => f.status === 'Completed').length;
      return {
        id: a.id,
        name: a.name,
        status: a.status,
        leads: agentLeads.length,
        won,
        missed,
        calls: agentCalls.length,
        followUps: agentFollowUps.length,
        completedFollowUps,
        rate: agentLeads.length > 0 ? Math.round((won / agentLeads.length) * 100) : 0,
      };
    }).sort((a, b) => b.leads - a.leads);
  }, [scopedAgents, scopedLeads, scopedCalls, scopedFollowUps]);

  const topAgentsChart = useMemo(
    () => [...agentPerformance].sort((a, b) => b.rate - a.rate).slice(0, 5),
    [agentPerformance]
  );

  const agentProductivity = useMemo(() => {
    return agentPerformance.map((a) => ({
      name: a.name.split(' ')[0],
      leads: a.leads,
      calls: a.calls,
      followUps: a.followUps,
    })).slice(0, 6);
  }, [agentPerformance]);

  /* ========== 3. CALL REPORTS ========== */

  const callTypeData = useMemo(() => [
    { name: 'Inbound', value: metrics.inboundCalls, fill: '#10B981' },
    { name: 'Outbound', value: metrics.outboundCalls, fill: '#8B2FD6' },
  ], [metrics]);

  const callStatusData = useMemo(() => {
    const statuses = ['connected', 'missed', 'failed', 'ringing'];
    const labels = { connected: 'Connected', missed: 'Missed', failed: 'Failed', ringing: 'Ringing' };
    const fills = { connected: '#10B981', missed: '#E31C79', failed: '#EF4444', ringing: '#F59E0B' };
    return statuses
      .map((s) => ({
        name: labels[s],
        value: scopedCalls.filter((c) => c.status === s).length,
        fill: fills[s],
      }))
      .filter((d) => d.value > 0);
  }, [scopedCalls]);

  const callDurationBuckets = useMemo(() => {
    const buckets = [
      { name: '<1m', min: 0, max: 60, value: 0, fill: '#94A3B8' },
      { name: '1-3m', min: 60, max: 180, value: 0, fill: '#F59E0B' },
      { name: '3-5m', min: 180, max: 300, value: 0, fill: '#8B2FD6' },
      { name: '5-10m', min: 300, max: 600, value: 0, fill: '#E31C79' },
      { name: '>10m', min: 600, max: Infinity, value: 0, fill: '#10B981' },
    ];
    scopedCalls.forEach((c) => {
      const [m, s] = (c.duration || '0:0').split(':').map(Number);
      const sec = (m || 0) * 60 + (s || 0);
      const bucket = buckets.find((b) => sec >= b.min && sec < b.max);
      if (bucket) bucket.value++;
    });
    return buckets;
  }, [scopedCalls]);

  const callDispositionData = useMemo(() => {
    const dispositions = {};
    scopedCalls.forEach((c) => {
      const key = c.disposition || 'Unknown';
      dispositions[key] = (dispositions[key] || 0) + 1;
    });
    return Object.entries(dispositions)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [scopedCalls]);

  /* ========== 4. FOLLOW-UP REPORTS ========== */

  const followUpData = useMemo(() => {
    const statuses = ['Today', 'Upcoming', 'Overdue', 'Completed'];
    const fills = {
      Today: '#8B2FD6',
      Upcoming: '#10B981',
      Overdue: '#E31C79',
      Completed: '#10B981',
    };
    return statuses.map((s) => ({
      name: s,
      value: scopedFollowUps.filter((f) => f.status === s).length,
      fill: fills[s],
    }));
  }, [scopedFollowUps]);

  const followUpsByAgent = useMemo(() => {
    return agentPerformance
      .filter((a) => a.followUps > 0)
      .map((a) => ({
        name: a.name.split(' ')[0],
        total: a.followUps,
        completed: a.completedFollowUps,
        pending: a.followUps - a.completedFollowUps,
      }))
      .slice(0, 8);
  }, [agentPerformance]);

  /* ========== 5. CAMPAIGN REPORTS ========== */

  const campaignData = useMemo(() => {
    if (scopedCampaigns.length === 0) return null;
    return {
      totalLeads: scopedCampaigns.reduce((s, c) => s + (c.leads || 0), 0),
      totalCalls: scopedCampaigns.reduce((s, c) => s + (c.calls || 0), 0),
      totalResponses: scopedCampaigns.reduce((s, c) => s + (c.responses || 0), 0),
      totalInterested: scopedCampaigns.reduce((s, c) => s + (c.interested || 0), 0),
      totalConverted: scopedCampaigns.reduce((s, c) => s + (c.converted || 0), 0),
      totalConnected: scopedCampaigns.reduce((s, c) => s + (c.connected || 0), 0),
      active: scopedCampaigns.filter((c) => c.status === 'Active').length,
      completed: scopedCampaigns.filter((c) => c.status === 'Completed').length,
    };
  }, [scopedCampaigns]);

  const campaignFunnelData = useMemo(() => {
    if (!campaignData) return [];
    return [
      { name: 'Leads', value: campaignData.totalLeads, fill: '#8B2FD6' },
      { name: 'Calls', value: campaignData.totalCalls, fill: '#A855F7' },
      { name: 'Connected', value: campaignData.totalConnected, fill: '#F59E0B' },
      { name: 'Responses', value: campaignData.totalResponses, fill: '#EC4899' },
      { name: 'Interested', value: campaignData.totalInterested, fill: '#E31C79' },
      { name: 'Converted', value: campaignData.totalConverted, fill: '#10B981' },
    ];
  }, [campaignData]);

  /* ========== 6. CONVERSION JOURNEY ========== */

  const conversionJourney = useMemo(() => {
    const total = scopedLeads.length;
    if (total === 0) return [];
    const contacted = scopedLeads.filter((l) =>
      ['Follow Up', 'Qualified', 'Won', 'Lost'].includes(l.status)
    ).length;
    const followedUp = scopedLeads.filter((l) =>
      ['Qualified', 'Won'].includes(l.status)
    ).length;
    const qualified = scopedLeads.filter((l) =>
      ['Qualified', 'Won'].includes(l.status)
    ).length;
    const converted = metrics.won;

    return [
      { name: 'Lead', value: total, pct: 100, fill: '#8B2FD6' },
      { name: 'Contact', value: contacted || Math.round(total * 0.7), pct: total ? Math.round(((contacted || total * 0.7) / total) * 100) : 0, fill: '#A855F7' },
      { name: 'Follow-up', value: followedUp || Math.round(total * 0.5), pct: total ? Math.round(((followedUp || total * 0.5) / total) * 100) : 0, fill: '#F59E0B' },
      { name: 'Qualified', value: qualified || Math.round(total * 0.3), pct: total ? Math.round(((qualified || total * 0.3) / total) * 100) : 0, fill: '#E31C79' },
      { name: 'Converted', value: converted, pct: metrics.conversion, fill: '#10B981' },
    ];
  }, [scopedLeads, metrics]);

  /* ✅ KPI click handler — single source of truth, resets other filters */
  const handleKpiClick = (kpiKey) => {
    setActiveKpi(kpiKey);
    if (kpiKey === 'overview')      setActiveTab('overview');
    else if (kpiKey === 'leads')    setActiveTab('leads');
    else if (kpiKey === 'conversion') setActiveTab('conversion');
    else if (kpiKey === 'calls')    setActiveTab('calls');
    else if (kpiKey === 'followups') setActiveTab('followups');
    else if (kpiKey === 'agents')   setActiveTab('agents');
  };

  /* ✅ Tab click syncs activeKpi */
  const handleTabClick = (key) => {
    setActiveTab(key);
    if (key === 'overview')      setActiveKpi('overview');
    else if (key === 'leads')    setActiveKpi('leads');
    else if (key === 'conversion') setActiveKpi('conversion');
    else if (key === 'calls')    setActiveKpi('calls');
    else if (key === 'followups') setActiveKpi('followups');
    else if (key === 'agents')   setActiveKpi('agents');
    else setActiveKpi('overview');
  };

  /* ========== EXPORT ========== */
  const handleExport = () => {
    const rows = [
      ['Report Type', 'Metric', 'Value'],
      ['General', 'Website', activeWebsite?.name || ''],
      ['General', 'Date Range', rangeLabel],
      ['Lead Report', 'Total Leads', metrics.total],
      ['Lead Report', 'Fresh', metrics.fresh],
      ['Lead Report', 'Follow Up', metrics.followUp],
      ['Lead Report', 'Qualified', metrics.qualified],
      ['Lead Report', 'Won', metrics.won],
      ['Lead Report', 'Lost', metrics.lost],
      ['Lead Report', 'Missed', metrics.missed],
      ['Lead Report', 'Assigned', metrics.assigned],
      ['Lead Report', 'Unassigned', metrics.total - metrics.assigned],
      ['Lead Report', 'Conversion Rate %', metrics.conversion],
      ['Call Report', 'Total Calls', scopedCalls.length],
      ['Call Report', 'Inbound', metrics.inboundCalls],
      ['Call Report', 'Outbound', metrics.outboundCalls],
      ['Call Report', 'Connected', metrics.connectedCalls],
      ['Call Report', 'Missed', metrics.missedCalls],
      ['Call Report', 'Avg Duration (sec)', metrics.avgCallDuration],
      ['Follow-up Report', 'Total', scopedFollowUps.length],
      ['Follow-up Report', 'Compliance %', metrics.compliance],
      /* ✅ NEW: Include campaign metrics in export */
      ...(campaignData ? [
        ['Campaign Report', 'Total Campaigns', scopedCampaigns.length],
        ['Campaign Report', 'Active', campaignData.active],
        ['Campaign Report', 'Completed', campaignData.completed],
        ['Campaign Report', 'Total Leads', campaignData.totalLeads],
        ['Campaign Report', 'Total Calls', campaignData.totalCalls],
        ['Campaign Report', 'Connected', campaignData.totalConnected],
        ['Campaign Report', 'Interested', campaignData.totalInterested],
        ['Campaign Report', 'Converted', campaignData.totalConverted],
      ] : []),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${activeWebsite?.name || 'website'}-${range.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  /* ========== TABS ========== */
  const TABS = [
    { key: 'overview',   label: 'Overview',       icon: BarChart3 },
    { key: 'leads',      label: 'Lead Reports',   icon: Layers },
    { key: 'agents',     label: 'Agent Reports',  icon: UserCheck },
    { key: 'calls',      label: 'Call Reports',   icon: Phone },
    { key: 'followups',  label: 'Follow-ups',     icon: Calendar },
    { key: 'campaigns',  label: 'Campaigns',      icon: Megaphone },
    { key: 'conversion', label: 'Conversion',     icon: Target },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">
              Reports & Analytics
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <BarChart3 size={13} className="text-brand-magenta" />
              Detailed insights for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setRangeOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:border-brand-magenta/40 hover:shadow-md"
              >
                <Calendar size={14} className="text-brand-magenta" />
                {range}
                <ChevronDown size={14} className={`text-brand-ink/40 transition-transform ${rangeOpen ? 'rotate-180' : ''}`} />
              </button>
              {rangeOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRangeOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                    {RANGES.map((r) => (
                      <button
                        key={r}
                        onClick={() => { setRange(r); setRangeOpen(false); }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          range === r
                            ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
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

            {range === 'Custom' && (
              <div className="flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-xs shadow-sm">
                <input
                  type="date"
                  value={customFrom}
                  max={customTo}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="bg-transparent text-brand-ink outline-none"
                />
                <ArrowRight size={12} className="text-brand-ink/40" />
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="bg-transparent text-brand-ink outline-none"
                />
              </div>
            )}

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:border-brand-magenta/40 hover:shadow-md"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* ═══ KPI STRIP — 5 PER ROW ═══ */}
        <div className="space-y-3">
          <SectionHeader eyebrow="Summary" title="Key Performance Indicators" hint={rangeLabel} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <MiniKpiCard
              icon={Layers}
              label="Total Leads"
              value={metrics.total}
              sub={`${metrics.fresh} fresh`}
              color="purple"
              onClick={() => handleKpiClick('leads')}
              active={activeKpi === 'leads'}
              delay={0}
            />
            <MiniKpiCard
              icon={Target}
              label="Conversion"
              value={`${metrics.conversion}%`}
              sub={`${metrics.won} won`}
              color="emerald"
              onClick={() => handleKpiClick('conversion')}
              active={activeKpi === 'conversion'}
              delay={40}
            />
            <MiniKpiCard
              icon={Phone}
              label="Total Calls"
              value={scopedCalls.length}
              sub={`${metrics.connectedCalls} connected`}
              color="rose"
              onClick={() => handleKpiClick('calls')}
              active={activeKpi === 'calls'}
              delay={80}
            />
            <MiniKpiCard
              icon={Calendar}
              label="Follow-ups"
              value={scopedFollowUps.length}
              sub={`${metrics.compliance}% compliance`}
              color="amber"
              onClick={() => handleKpiClick('followups')}
              active={activeKpi === 'followups'}
              delay={120}
            />
            <MiniKpiCard
              icon={UserCheck}
              label="Active Agents"
              value={scopedAgents.filter((a) => a.status === 'Active').length}
              sub={`${scopedAgents.length} total`}
              color="purple"
              onClick={() => handleKpiClick('agents')}
              active={activeKpi === 'agents'}
              delay={160}
            />
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ TAB CONTENT ═══ */}
        {activeTab === 'overview' && (
          <OverviewTab
            metrics={metrics}
            scopedCalls={scopedCalls}
            scopedFollowUps={scopedFollowUps}
            scopedCampaigns={scopedCampaigns}
            scopedAgents={scopedAgents}
            statusData={statusData}
            sourceData={sourceData}
            topAgentsChart={topAgentsChart}
            callStatusData={callStatusData}
            callTypeData={callTypeData}
            followUpData={followUpData}
            agentPerformance={agentPerformance}
            activeWebsite={activeWebsite}
            range={rangeLabel}
            trendData={trendData}
          />
        )}

        {activeTab === 'leads' && (
          <LeadReportsTab
            metrics={metrics}
            sourceData={sourceData}
            statusData={statusData}
            categoryData={categoryData}
            assignmentData={assignmentData}
            scopedLeads={scopedLeads}
          />
        )}

        {activeTab === 'agents' && (
          <AgentReportsTab
            agentPerformance={agentPerformance}
            topAgentsChart={topAgentsChart}
            agentProductivity={agentProductivity}
          />
        )}

        {activeTab === 'calls' && (
          <CallReportsTab
            metrics={metrics}
            callTypeData={callTypeData}
            callStatusData={callStatusData}
            callDurationBuckets={callDurationBuckets}
            callDispositionData={callDispositionData}
            scopedCalls={scopedCalls}
          />
        )}

        {activeTab === 'followups' && (
          <FollowUpReportsTab
            metrics={metrics}
            followUpData={followUpData}
            followUpsByAgent={followUpsByAgent}
            scopedFollowUps={scopedFollowUps}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignReportsTab
            campaignData={campaignData}
            campaignFunnelData={campaignFunnelData}
            scopedCampaigns={scopedCampaigns}
          />
        )}

        {activeTab === 'conversion' && (
          <ConversionReportsTab
            metrics={metrics}
            conversionJourney={conversionJourney}
            statusData={statusData}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════ */
function SectionHeader({ eyebrow, title, hint }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">{eyebrow}</p>
          <h2 className="font-display text-sm font-semibold text-brand-ink">{title}</h2>
        </div>
      </div>
      {hint && <p className="text-[11px] text-brand-ink/40">{hint}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MINI KPI CARD
   ═══════════════════════════════════════════════════════════════ */
function MiniKpiCard({ icon: Icon, label, value, sub, color = 'purple', active, onClick, delay = 0 }) {
  const themes = {
    purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'from-violet-50 via-violet-50/30 to-white', iconBg: 'bg-violet-100 text-brand-purple border-violet-200', bar: 'from-brand-purple to-brand-magenta', glow: 'bg-brand-purple/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]', valueColor: 'text-brand-purple', ring: 'ring-violet-300' },
    emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'from-emerald-50 via-emerald-50/30 to-white', iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'from-emerald-500 to-emerald-400', glow: 'bg-emerald-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]', valueColor: 'text-emerald-600', ring: 'ring-emerald-300' },
    amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'from-amber-50 via-amber-50/30 to-white', iconBg: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'from-amber-500 to-orange-400', glow: 'bg-amber-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]', valueColor: 'text-amber-600', ring: 'ring-amber-300' },
    rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'from-rose-50 via-rose-50/30 to-white', iconBg: 'bg-rose-100 text-brand-magenta border-rose-200', bar: 'from-brand-magenta to-brand-purple', glow: 'bg-brand-magenta/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]', valueColor: 'text-brand-magenta', ring: 'ring-rose-300' },
  };
  const t = themes[color] || themes.purple;

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/30 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 hover:-translate-y-1.5 animate-fade-slide-in ${t.border} ${active ? `ring-2 ${t.ring} ${t.shadow}` : t.shadow}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100 ${active ? 'scale-x-100' : ''}`} />
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${active ? 'opacity-100' : ''}`} />
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${t.iconBg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} />
        </span>
        {active && (
          <span className="flex items-center gap-1 rounded-full bg-brand-magenta/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-magenta ring-1 ring-brand-magenta/30">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-magenta animate-pulse" />
            Active
          </span>
        )}
      </div>

      <div className="relative z-10 w-full">
        <p className={`font-display text-2xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHART CARD WRAPPER
   ═══════════════════════════════════════════════════════════════ */
function ChartCard({ title, subtitle, icon: Icon, children, className = '', extra }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-brand-lilac bg-white shadow-sm transition-all hover:border-brand-magenta/30 hover:shadow-md ${className}`}>
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand-magenta/30 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-lilac/60 bg-gradient-to-r from-brand-mist/60 to-transparent px-5 py-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
              <Icon size={16} />
            </span>
          )}
          <div>
            <h3 className="font-display text-sm font-bold text-brand-ink">{title}</h3>
            {subtitle && <p className="text-[11px] text-brand-ink/50">{subtitle}</p>}
          </div>
        </div>
        {extra}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1 — OVERVIEW
   ═══════════════════════════════════════════════════════════════ */
function OverviewTab({
  metrics, scopedCalls, scopedFollowUps, scopedCampaigns, scopedAgents,
  statusData, sourceData, topAgentsChart, callStatusData, callTypeData,
  followUpData, agentPerformance, activeWebsite, range, trendData,
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard
          title="Lead & Call Trend"
          subtitle={`${activeWebsite?.name} · ${range}`}
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="reports-ov-calls-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E31C79" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#E31C79" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} dy={6} interval="preserveStartEnd" minTickGap={16} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="calls" stroke="#E31C79" strokeWidth={3} fill="url(#reports-ov-calls-grad)" name="Calls" dot={{ r: 3, fill: '#E31C79' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="leads" stroke="#8B2FD6" strokeWidth={2.5} dot={{ r: 3, fill: '#8B2FD6' }} activeDot={{ r: 6 }} name="Leads" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Lead Sources" subtitle={`${sourceData.length} channels`} icon={BarChart3}>
          {sourceData.length === 0 ? (
            <EmptyState message="No source data yet" />
          ) : (
            <div className="space-y-3">
              {sourceData.slice(0, 6).map((s, i) => {
                const max = sourceData[0]?.value || 1;
                return (
                  <div key={s.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-brand-ink/80">
                        <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {s.name}
                      </span>
                      <span className="font-mono font-bold text-brand-ink">{s.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(s.value / max) * 100}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Lead Status" subtitle="Pipeline snapshot" icon={Layers}>
          {metrics.total === 0 ? (
            <EmptyState message="No leads yet" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData.filter((s) => s.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusData.filter((s) => s.value > 0).map((s, i) => (
                      <Cell key={i} fill={s.fill || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Top Agents" subtitle="By conversion rate" icon={Award}>
          {topAgentsChart.length === 0 ? (
            <EmptyState message="No agents yet" />
          ) : (
            <div className="space-y-2.5">
              {topAgentsChart.map((a, i) => (
                <div key={a.id} className="flex items-center gap-2.5 rounded-lg border border-brand-lilac/60 bg-brand-mist/30 p-2">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white ${
                    i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                    : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500'
                    : i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900'
                    : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
                  }`}>
                    #{i + 1}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                    {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-brand-ink">{a.name}</p>
                    <p className="text-[10px] text-brand-ink/50">{a.leads} leads · {a.won} won</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-bold text-brand-magenta">{a.rate}%</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Follow-up Status" subtitle={`${scopedFollowUps.length} total`} icon={Calendar}>
          {scopedFollowUps.length === 0 ? (
            <EmptyState message="No follow-ups yet" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={followUpData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                    {followUpData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Call Analytics" subtitle={`${scopedCalls.length} total calls`} icon={Phone}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={PhoneIncoming} label="Inbound" value={metrics.inboundCalls} color="emerald" />
            <StatTile icon={PhoneOutgoing} label="Outbound" value={metrics.outboundCalls} color="purple" />
            <StatTile icon={CheckCircle2} label="Connected" value={metrics.connectedCalls} color="emerald" />
            <StatTile icon={PhoneMissed} label="Missed" value={metrics.missedCalls} color="rose" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-brand-lilac bg-gradient-to-br from-brand-magenta/[0.06] to-white p-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/60">Total Duration</p>
              <p className="mt-1 font-display text-lg font-bold text-brand-ink">{Math.floor(metrics.totalCallDuration / 60)}m</p>
            </div>
            <div className="rounded-xl border border-brand-lilac bg-gradient-to-br from-brand-purple/[0.06] to-white p-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/60">Avg Duration</p>
              <p className="mt-1 font-display text-lg font-bold text-brand-ink">{metrics.avgCallDuration}s</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Campaign Performance" subtitle={`${scopedCampaigns.length} campaigns`} icon={Megaphone}>
          {scopedCampaigns.length === 0 ? (
            <EmptyState message="No campaigns yet" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatTile icon={Megaphone} label="Active" value={scopedCampaigns.filter((c) => c.status === 'Active').length} color="emerald" />
              <StatTile icon={CheckCircle2} label="Completed" value={scopedCampaigns.filter((c) => c.status === 'Completed').length} color="purple" />
              <StatTile icon={Users} label="Leads" value={scopedCampaigns.reduce((s, c) => s + (c.leads || 0), 0)} color="rose" />
              <StatTile icon={Phone} label="Calls" value={scopedCampaigns.reduce((s, c) => s + (c.calls || 0), 0)} color="purple" />
              <StatTile icon={Sparkles} label="Interested" value={scopedCampaigns.reduce((s, c) => s + (c.interested || 0), 0)} color="amber" />
              <StatTile icon={Target} label="Converted" value={scopedCampaigns.reduce((s, c) => s + (c.converted || 0), 0)} color="emerald" />
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 — LEAD REPORTS
   ═══════════════════════════════════════════════════════════════ */
function LeadReportsTab({ metrics, sourceData, statusData, categoryData, assignmentData, scopedLeads }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KPITile icon={Layers}      label="Total"       value={metrics.total}     color="purple" />
        <KPITile icon={Sparkles}    label="New (Fresh)" value={metrics.fresh}     color="rose" />
        <KPITile icon={Calendar}    label="Follow-up"   value={metrics.followUp}  color="amber" />
        <KPITile icon={Target}      label="Qualified"   value={metrics.qualified} color="emerald" />
        <KPITile icon={CheckCircle2} label="Won"        value={metrics.won}       color="emerald" />
        <KPITile icon={XCircle}     label="Lost"        value={metrics.lost}      color="rose" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Lead Source Report" subtitle="Distribution by source" icon={Layers}>
          {sourceData.length === 0 ? (
            <EmptyState message="No source data yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData.slice(0, 8)} layout="vertical" margin={{ top: 8, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                    {sourceData.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Lead Status Report" subtitle="Pipeline distribution" icon={ListChecks}>
          {metrics.total === 0 ? (
            <EmptyState message="No leads yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                    {statusData.map((s, i) => (
                      <Cell key={i} fill={s.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Lead Category Report" subtitle="By business category" icon={Layers}>
          {categoryData.length === 0 ? (
            <EmptyState message="No category data yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Assignment Report" subtitle="Lead distribution status" icon={UserCheck}>
          {metrics.total === 0 ? (
            <EmptyState message="No leads yet" />
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assignmentData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {assignmentData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <StatTile icon={UserCheck} label="Assigned" value={assignmentData[0]?.value || 0} color="emerald" />
                <StatTile icon={Users} label="Unassigned" value={assignmentData[1]?.value || 0} color="amber" alert={(assignmentData[1]?.value || 0) > 0} />
              </div>
            </>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3 — AGENT REPORTS
   ═══════════════════════════════════════════════════════════════ */
function AgentReportsTab({ agentPerformance, topAgentsChart, agentProductivity }) {
  return (
    <div className="space-y-5">
      <ChartCard title="Agent Conversion Leaderboard" subtitle="Top 5 by conversion rate" icon={Award}>
        {topAgentsChart.length === 0 ? (
          <EmptyState message="No agents yet" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAgentsChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="reports-agent-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E31C79" />
                    <stop offset="100%" stopColor="#8B2FD6" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => `${v}%`} cursor={{ fill: '#F1E4FB' }} />
                <Bar dataKey="rate" fill="url(#reports-agent-grad)" radius={[8, 8, 0, 0]} barSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Agent Productivity" subtitle="Leads, calls, and follow-ups" icon={BarChart3}>
        {agentProductivity.length === 0 ? (
          <EmptyState message="No agents yet" />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentProductivity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="leads" fill="#8B2FD6" radius={[6, 6, 0, 0]} barSize={18} name="Leads" />
                <Bar dataKey="calls" fill="#E31C79" radius={[6, 6, 0, 0]} barSize={18} name="Calls" />
                <Bar dataKey="followUps" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={18} name="Follow-ups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Agent Scorecard" subtitle={`${agentPerformance.length} agents`} icon={UserCheck}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-brand-lilac/60 text-left">
                <th className="px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Rank</th>
                <th className="px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Agent</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Status</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Leads</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Won</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Missed</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Calls</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Follow-ups</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {agentPerformance.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-brand-ink/50">
                    No agents for this website yet.
                  </td>
                </tr>
              ) : (
                agentPerformance.map((a, i) => (
                  <tr key={a.id} className="border-b border-brand-lilac/40 transition-colors hover:bg-brand-mist/30">
                    <td className="px-3 py-3">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                        i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                        : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                        : i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                        : 'bg-brand-lilac text-brand-purple'
                      }`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                          {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </span>
                        <span className="truncate font-semibold text-brand-ink">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        a.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-brand-ink/70 tabular-nums">{a.leads}</td>
                    <td className="px-3 py-3 text-center font-semibold text-emerald-600 tabular-nums">{a.won}</td>
                    <td className="px-3 py-3 text-center font-semibold text-rose-500 tabular-nums">{a.missed}</td>
                    <td className="px-3 py-3 text-center text-brand-ink/70 tabular-nums">{a.calls}</td>
                    <td className="px-3 py-3 text-center text-brand-ink/70 tabular-nums">{a.followUps}</td>
                    <td className="px-3 py-3">
                      <div className="mx-auto flex max-w-[120px] items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-lilac">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                            style={{ width: `${a.rate}%` }}
                          />
                        </div>
                        <span className="shrink-0 font-mono text-xs font-bold text-brand-magenta tabular-nums">{a.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4 — CALL REPORTS
   ═══════════════════════════════════════════════════════════════ */
function CallReportsTab({ metrics, callTypeData, callStatusData, callDurationBuckets, callDispositionData, scopedCalls }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KPITile icon={Phone}          label="Total Calls"     value={scopedCalls.length}      color="purple" />
        <KPITile icon={PhoneIncoming}  label="Inbound"         value={metrics.inboundCalls}    color="emerald" />
        <KPITile icon={PhoneOutgoing}  label="Outbound"        value={metrics.outboundCalls}   color="purple" />
        <KPITile icon={CheckCircle2}   label="Connected"       value={metrics.connectedCalls}  color="emerald" />
        <KPITile icon={PhoneMissed}    label="Missed"          value={metrics.missedCalls}     color="rose" />
        <KPITile icon={Calendar}       label="Avg Duration"    value={`${metrics.avgCallDuration}s`} color="amber" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Inbound vs Outbound" subtitle="Call type distribution" icon={Phone}>
          {scopedCalls.length === 0 ? (
            <EmptyState message="No calls yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={callTypeData.filter((d) => d.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {callTypeData.filter((d) => d.value > 0).map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Call Status" subtitle="Success & failure breakdown" icon={CheckCircle2}>
          {callStatusData.length === 0 ? (
            <EmptyState message="No calls yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callStatusData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={44}>
                    {callStatusData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Call Duration Distribution" subtitle="Duration buckets" icon={Calendar}>
          {scopedCalls.length === 0 ? (
            <EmptyState message="No calls yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callDurationBuckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                    {callDurationBuckets.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Call Disposition" subtitle="Outcome breakdown" icon={Target}>
          {callDispositionData.length === 0 ? (
            <EmptyState message="No dispositions yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callDispositionData} layout="vertical" margin={{ top: 8, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                    {callDispositionData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5 — FOLLOW-UP REPORTS
   ═══════════════════════════════════════════════════════════════ */
function FollowUpReportsTab({ metrics, followUpData, followUpsByAgent, scopedFollowUps }) {
  const total = scopedFollowUps.length;
  const pending = followUpData.find((f) => f.name === 'Today')?.value || 0;
  const overdue = followUpData.find((f) => f.name === 'Overdue')?.value || 0;
  const completed = followUpData.find((f) => f.name === 'Completed')?.value || 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPITile icon={Calendar}      label="Total Follow-ups" value={total}     color="purple" />
        <KPITile icon={Calendar}      label="Pending"          value={pending}   color="amber" />
        <KPITile icon={AlertTriangle} label="Overdue"          value={overdue}   color="rose" alert={overdue > 0} />
        <KPITile icon={CheckCircle2}  label="Completed"        value={completed} color="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Follow-up Status" subtitle="Current state distribution" icon={Calendar}>
          {total === 0 ? (
            <EmptyState message="No follow-ups yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={followUpData.filter((d) => d.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {followUpData.filter((d) => d.value > 0).map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Compliance Overview" subtitle="Follow-up adherence" icon={CheckCircle2}>
          <div className="space-y-5 pt-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-ink">On-time Follow-ups</span>
                <span className="font-display text-lg font-bold text-emerald-600">{metrics.compliance}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-brand-lilac">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${metrics.compliance}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-ink">Missed</span>
                <span className="font-display text-lg font-bold text-rose-500">{metrics.total ? 100 - metrics.compliance : 0}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-brand-lilac">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-1000"
                  style={{ width: `${metrics.total ? 100 - metrics.compliance : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-amber-800">
                  <strong>{metrics.missed}</strong> follow-ups missed their window. Review and reassign to improve compliance.
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Agent-wise Follow-ups" subtitle="Total vs completed per agent" icon={UserCheck}>
        {followUpsByAgent.length === 0 ? (
          <EmptyState message="No follow-up data per agent yet" />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={followUpsByAgent} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={32} name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={32} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 6 — CAMPAIGN REPORTS
   ═══════════════════════════════════════════════════════════════ */
function CampaignReportsTab({ campaignData, campaignFunnelData, scopedCampaigns }) {
  if (!campaignData || scopedCampaigns.length === 0) {
    return (
      <ChartCard title="Campaign Reports" subtitle="No campaigns configured" icon={Megaphone}>
        <EmptyState message="No campaigns for this website in the selected date range. Create a campaign or widen the range." />
      </ChartCard>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KPITile icon={Megaphone}  label="Active"      value={campaignData.active}         color="emerald" />
        <KPITile icon={CheckCircle2} label="Completed" value={campaignData.completed}      color="purple" />
        <KPITile icon={Layers}     label="Total Leads" value={campaignData.totalLeads}     color="rose" />
        <KPITile icon={Phone}      label="Calls"       value={campaignData.totalCalls}     color="purple" />
        <KPITile icon={Sparkles}   label="Interested"  value={campaignData.totalInterested} color="amber" />
        <KPITile icon={Target}     label="Converted"   value={campaignData.totalConverted} color="emerald" />
      </div>

      <ChartCard title="Campaign Funnel" subtitle="Leads → Conversions" icon={Target}>
        {campaignFunnelData.every((s) => s.value === 0) ? (
          <EmptyState message="No campaign activity yet" />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignFunnelData} layout="vertical" margin={{ top: 8, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                  {campaignFunnelData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Campaign Performance" subtitle={`${scopedCampaigns.length} campaigns`} icon={Megaphone}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-brand-lilac/60 text-left">
                <th className="px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Campaign</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Status</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Leads</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Calls</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Connected</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Interested</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Converted</th>
                <th className="px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">Conversion %</th>
              </tr>
            </thead>
            <tbody>
              {scopedCampaigns.map((c) => {
                const rate = c.leads ? Math.round(((c.converted || 0) / c.leads) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b border-brand-lilac/40 transition-colors hover:bg-brand-mist/30">
                    <td className="px-3 py-3">
                      <span className="truncate font-semibold text-brand-ink">{c.name}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.status === 'Active' ? 'bg-emerald-100 text-emerald-700'
                        : c.status === 'Paused' ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-brand-ink/70 tabular-nums">{c.leads || 0}</td>
                    <td className="px-3 py-3 text-center text-brand-ink/70 tabular-nums">{c.calls || 0}</td>
                    <td className="px-3 py-3 text-center font-semibold text-emerald-600 tabular-nums">{c.connected || 0}</td>
                    <td className="px-3 py-3 text-center font-semibold text-amber-600 tabular-nums">{c.interested || 0}</td>
                    <td className="px-3 py-3 text-center font-semibold text-brand-magenta tabular-nums">{c.converted || 0}</td>
                    <td className="px-3 py-3">
                      <div className="mx-auto flex max-w-[110px] items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-lilac">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="shrink-0 font-mono text-xs font-bold text-brand-magenta tabular-nums">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 7 — CONVERSION REPORTS
   ═══════════════════════════════════════════════════════════════ */
function ConversionReportsTab({ metrics, conversionJourney, statusData }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPITile icon={Layers}       label="Total Leads"    value={metrics.total}          color="purple" />
        <KPITile icon={CheckCircle2} label="Converted"      value={metrics.won}            color="emerald" />
        <KPITile icon={Percent}      label="Conversion Rate" value={`${metrics.conversion}%`} color="rose" />
        <KPITile icon={AlertTriangle} label="Lost"          value={metrics.lost}           color="amber" />
      </div>

      <ChartCard title="Conversion Journey" subtitle="Lead → Contact → Follow-up → Qualified → Converted" icon={Target}>
        {metrics.total === 0 ? (
          <EmptyState message="No leads to analyze yet" />
        ) : (
          <div className="space-y-4">
            {conversionJourney.map((step, i) => {
              const pct = metrics.total ? Math.round((step.value / metrics.total) * 100) : 0;
              const isLast = i === conversionJourney.length - 1;
              return (
                <div key={step.name}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-brand-ink">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: step.fill }}
                      >
                        {i + 1}
                      </span>
                      {step.name}
                    </span>
                    <span className="font-mono font-bold text-brand-ink tabular-nums">
                      {step.value} · <span className="text-brand-magenta">{pct}%</span>
                    </span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-lg bg-brand-lilac/40">
                    <div
                      className="flex h-full items-center justify-end rounded-lg px-3 text-[11px] font-bold text-white transition-all duration-1000"
                      style={{
                        width: `${Math.max(pct, 10)}%`,
                        background: `linear-gradient(to right, ${step.fill}dd, ${step.fill})`,
                      }}
                    >
                      {pct}%
                    </div>
                  </div>
                  {!isLast && (
                    <div className="mt-1 ml-3 flex items-center gap-2 text-[10px] text-brand-ink/40">
                      <TrendingDown size={10} />
                      <span>
                        Drop: {conversionJourney[i].value - conversionJourney[i + 1].value} leads
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ChartCard>

      <ChartCard title="Final Status Distribution" subtitle="Where leads currently sit" icon={Layers}>
        {metrics.total === 0 ? (
          <EmptyState message="No leads yet" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#F1E4FB' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={44}>
                  {statusData.map((s, i) => (
                    <Cell key={i} fill={s.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT TILE
   ═══════════════════════════════════════════════════════════════ */
function StatTile({ icon: Icon, label, value, color = 'purple', alert }) {
  const colors = {
    purple:  'bg-gradient-to-br from-violet-50 to-violet-100/60 text-brand-purple border-violet-200',
    emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-600 border-emerald-200',
    amber:   'bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-600 border-amber-200',
    rose:    'bg-gradient-to-br from-rose-50 to-rose-100/60 text-brand-magenta border-rose-200',
  };
  return (
    <div className={`group relative overflow-hidden rounded-xl border ${colors[color]} p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {alert && (
        <span className="absolute right-2 top-2 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
        </span>
      )}
      <div className="relative flex items-center gap-1.5">
        {Icon && <Icon size={12} className="transition-transform duration-300 group-hover:scale-125" />}
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
      </div>
      <p className="relative mt-1 font-display text-lg font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KPI TILE (larger, for tab content headers)
   ═══════════════════════════════════════════════════════════════ */
function KPITile({ icon: Icon, label, value, color = 'purple', alert }) {
  const colors = {
    purple:  'from-violet-50 to-white text-brand-purple border-violet-200',
    emerald: 'from-emerald-50 to-white text-emerald-600 border-emerald-200',
    amber:   'from-amber-50 to-white text-amber-600 border-amber-200',
    rose:    'from-rose-50 to-white text-brand-magenta border-rose-200',
  };
  return (
    <div className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${colors[color]} p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`}>
      <span className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-current opacity-[0.06] blur-xl" />
      {alert && (
        <span className="absolute right-3 top-3 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
      )}
      <div className="relative flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 shadow-sm">
          <Icon size={14} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      </div>
      <p className="relative mt-2 font-display text-2xl font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════ */
function EmptyState({ message }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta/15 to-brand-purple/10 ring-1 ring-brand-lilac">
        <BarChart3 size={20} className="text-brand-magenta" />
      </span>
      <p className="text-sm text-brand-ink/50">{message}</p>
    </div>
  );
}