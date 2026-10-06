// src/pages/marketing/Campaigns.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Megaphone, Plus, Play, Pause, X, Search, Filter, ChevronDown,
  MoreVertical, Eye, Pencil, Trash2, BarChart3, TrendingUp,
  TrendingDown, Users, Layers, Target, PhoneCall, Headphones,
  Percent, Check, AlertCircle, CheckCircle2, Download, Calendar,
  Clock, Repeat, Timer, Info, Save, Star, Award, Zap, ArrowRight,
  PhoneOff, MessageSquare, Copy, Briefcase, Hash, Sparkles, Radio,
  ListChecks, PhoneOutgoing, PhoneIncoming, PhoneMissed, Circle,
  XCircle, ClipboardList, UserPlus, RefreshCw, Grid3x3, List,
  MoreHorizontal, CheckSquare, Flag, Activity, Globe, DollarSign,
  Inbox, CircleDot, Flame, User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const CAMPAIGN_TYPES = [
  'Lead Generation',
  'Brand Awareness',
  'Promotion',
  'Product Launch',
  'Customer Re-engagement',
  'Festival Campaign',
  'Referral Campaign',
  'Social Media Campaign',
  'Digital Advertising Campaign',
];

const CAMPAIGN_STATUSES = ['Draft', 'Scheduled', 'Active', 'Paused', 'Completed', 'Cancelled'];

const MARKETING_CHANNELS = [
  'Google Ads', 'Meta Ads', 'Facebook', 'Instagram', 'YouTube',
  'WhatsApp', 'LinkedIn', 'Website', 'Referral', 'Offline Campaign',
  'Event', 'Promotional Campaign',
];

const STATUS_STYLES = {
  Draft:     { chip: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', icon: Pencil },
  Scheduled: { chip: 'bg-violet-100 text-brand-purple border-violet-200', dot: 'bg-violet-500', icon: Clock },
  Active:    { chip: 'bg-emerald-100 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500', icon: Zap },
  Paused:    { chip: 'bg-amber-100 text-amber-600 border-amber-200', dot: 'bg-amber-500', icon: Pause },
  Completed: { chip: 'bg-blue-100 text-blue-600 border-blue-200', dot: 'bg-blue-500', icon: CheckCircle2 },
  Cancelled: { chip: 'bg-rose-100 text-brand-magenta border-rose-200', dot: 'bg-rose-500', icon: XCircle },
};

const STORAGE_KEY = 'campaigns:marketing';
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* CSV formula-injection guard */
const csvCell = (v) => {
  let s = String(v ?? '');
  // Prefix risky leading chars so spreadsheets don't execute them
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

const loadState = (fallback) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Normalize so any legacy/partial record still renders safely
        return parsed.map((c) => ({
          ...c,
          leads: c.leads ?? 0,
          qualified: c.qualified ?? 0,
          converted: c.converted ?? 0,
          noAnswer: c.noAnswer ?? 0,
          notInterested: c.notInterested ?? 0,
          followUpsGenerated: c.followUpsGenerated ?? 0,
          targetLeads: c.targetLeads ?? 0,
          budget: c.budget ?? 0,
        }));
      }
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (value) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* ignore */ }
};

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatShortDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const formatCurrency = (n) => `$${Number(n || 0).toLocaleString('en-US')}`;

/* ═══════════════════════════════════════════════════════════════
   SEED DATA (stable IDs)
   ═══════════════════════════════════════════════════════════════ */
const SEED_CAMPAIGNS = [
  {
    id: 'camp-summer-sale-2024', name: 'Summer Sale 2024', type: 'Promotion',
    project: 'Eliteinova Matrimony', channel: 'Google Ads',
    audience: 'Age 25-40, Metro cities', startDate: '2024-06-01', endDate: '2024-06-30',
    budget: 5000, objective: 'Boost conversions during summer',
    targetLeads: 500, assignedTo: 'John Doe', status: 'Active',
    leads: 450, qualified: 120, converted: 35, noAnswer: 42, notInterested: 39, followUpsGenerated: 58,
    createdAt: new Date('2024-05-25').toISOString(),
  },
  {
    id: 'camp-google-search-crm', name: 'Google Search - CRM', type: 'Lead Generation',
    project: 'Eliteinova CRM', channel: 'Google Ads',
    audience: 'B2B SaaS buyers', startDate: '2024-06-10', endDate: '2024-07-10',
    budget: 3000, objective: 'Generate qualified B2B leads',
    targetLeads: 200, assignedTo: 'Sarah Smith', status: 'Active',
    leads: 120, qualified: 85, converted: 22, noAnswer: 12, notInterested: 15, followUpsGenerated: 19,
    createdAt: new Date('2024-06-05').toISOString(),
  },
  {
    id: 'camp-facebook-awareness', name: 'Facebook Awareness', type: 'Brand Awareness',
    project: 'Eliteinova Matrimony', channel: 'Facebook',
    audience: 'Age 22-35, All India', startDate: '2024-07-01', endDate: '2024-07-31',
    budget: 1500, objective: 'Increase brand recall',
    targetLeads: 300, assignedTo: 'Raj Patel', status: 'Scheduled',
    leads: 0, qualified: 0, converted: 0, noAnswer: 0, notInterested: 0, followUpsGenerated: 0,
    createdAt: new Date('2024-06-20').toISOString(),
  },
  {
    id: 'camp-product-launch-q3', name: 'Product Launch Q3', type: 'Product Launch',
    project: 'Eliteinova CRM', channel: 'LinkedIn',
    audience: 'Decision makers, SMB', startDate: '2024-05-15', endDate: '2024-06-15',
    budget: 8000, objective: 'Launch new analytics module',
    targetLeads: 600, assignedTo: 'Emily Chen', status: 'Completed',
    leads: 620, qualified: 210, converted: 68, noAnswer: 60, notInterested: 88, followUpsGenerated: 71,
    createdAt: new Date('2024-05-01').toISOString(),
  },
  {
    id: 'camp-diwali-festival-promo', name: 'Diwali Festival Promo', type: 'Festival Campaign',
    project: 'Eliteinova Matrimony', channel: 'Meta Ads',
    audience: 'Age 25-45, Festive shoppers', startDate: '2024-10-20', endDate: '2024-11-15',
    budget: 4500, objective: 'Festival season engagement',
    targetLeads: 400, assignedTo: 'John Doe', status: 'Draft',
    leads: 0, qualified: 0, converted: 0, noAnswer: 0, notInterested: 0, followUpsGenerated: 0,
    createdAt: new Date('2024-09-01').toISOString(),
  },
  {
    id: 'camp-referral-drive-q4', name: 'Referral Drive Q4', type: 'Referral Campaign',
    project: 'Eliteinova CRM', channel: 'Referral',
    audience: 'Existing customers', startDate: '2024-09-01', endDate: '2024-11-30',
    budget: 2500, objective: 'Drive customer referrals',
    targetLeads: 250, assignedTo: 'Sarah Smith', status: 'Paused',
    leads: 88, qualified: 34, converted: 12, noAnswer: 8, notInterested: 6, followUpsGenerated: 14,
    createdAt: new Date('2024-08-15').toISOString(),
  },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const campaignHealth = (c) => {
  const target = c.targetLeads || 0;
  const progress = target > 0 ? (c.leads / target) * 100 : 0;
  if (c.status === 'Completed') return { label: 'Completed', tone: 'slate' };
  if (c.status === 'Paused') return { label: 'Paused', tone: 'amber' };
  if (c.status === 'Cancelled') return { label: 'Cancelled', tone: 'rose' };
  if (progress >= 80) return { label: 'Near Target', tone: 'emerald' };
  if (progress >= 40) return { label: 'On Track', tone: 'emerald' };
  return { label: 'Getting Started', tone: 'slate' };
};

const HEALTH_TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  amber:   'bg-amber-50 text-amber-600 ring-amber-200',
  slate:   'bg-slate-100 text-slate-600 ring-slate-200',
  rose:    'bg-rose-50 text-rose-500 ring-rose-200',
};

/* Escape-key hook */
function useEscape(enabled, handler) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') handler(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, handler]);
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Campaigns() {
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState(() => loadState(SEED_CAMPAIGNS));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [typeOpen, setTypeOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { saveState(campaigns); }, [campaigns]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const filtered = useMemo(() => {
    let list = [...campaigns];
    if (statusFilter !== 'All') list = list.filter((c) => c.status === statusFilter);
    if (typeFilter !== 'All') list = list.filter((c) => c.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        `${c.name} ${c.channel} ${c.assignedTo} ${c.project} ${c.objective || ''}`
          .toLowerCase()
          .includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [campaigns, statusFilter, typeFilter, searchQuery]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((c) => c.status === 'Active').length;
    const paused = filtered.filter((c) => c.status === 'Paused').length;
    const totalLeads = filtered.reduce((s, c) => s + (c.leads || 0), 0);
    const totalQualified = filtered.reduce((s, c) => s + (c.qualified || 0), 0);
    const totalConverted = filtered.reduce((s, c) => s + (c.converted || 0), 0);
    const totalBudget = filtered.reduce((s, c) => s + (c.budget || 0), 0);
    const conversion = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;
    return { total, active, paused, totalLeads, totalQualified, totalConverted, totalBudget, conversion };
  }, [filtered]);

  const monitoringSummary = useMemo(() => {
    const totalNoAnswer = filtered.reduce((s, c) => s + (c.noAnswer || 0), 0);
    const totalNotInterested = filtered.reduce((s, c) => s + (c.notInterested || 0), 0);
    const totalFollowUps = filtered.reduce((s, c) => s + (c.followUpsGenerated || 0), 0);
    const totalTargets = filtered.reduce((s, c) => s + (c.targetLeads || 0), 0);
    const targetProgress = totalTargets > 0 ? Math.round((summary.totalLeads / totalTargets) * 100) : 0;
    return { totalNoAnswer, totalNotInterested, totalFollowUps, totalTargets, targetProgress };
  }, [filtered, summary.totalLeads]);

  const handleCreate = (data) => {
    const newCampaign = {
      id: uid('camp'), ...data,
      leads: 0, qualified: 0, converted: 0,
      noAnswer: 0, notInterested: 0, followUpsGenerated: 0,
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    setShowModal(false);
    showToast(`Campaign "${data.name}" created`);
  };

  const handleEdit = (id, updates) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setEditing(null);
    showToast('Campaign updated');
  };

  const handleDelete = (id) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
    showToast('Campaign deleted', 'error');
  };

  const handleDuplicate = (campaign) => {
    const copy = {
      ...campaign, id: uid('camp'), name: `${campaign.name} (Copy)`, status: 'Draft',
      leads: 0, qualified: 0, converted: 0,
      noAnswer: 0, notInterested: 0, followUpsGenerated: 0,
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [copy, ...prev]);
    setMenuOpenId(null);
    showToast('Campaign duplicated');
  };

  const handleStatusChange = (id, newStatus) => {
    const target = campaigns.find((c) => c.id === id);
    // Consistent with handleToggle: Completed is terminal unless explicitly re-activated
    if (target && target.status === 'Completed' && newStatus !== 'Completed') {
      showToast('Completed campaigns cannot be reopened. Duplicate it instead.', 'error');
      setMenuOpenId(null);
      return;
    }
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    setMenuOpenId(null);
    showToast(`Status → ${newStatus}`);
  };

  const handleToggle = (id, currentStatus) => {
    if (currentStatus === 'Completed') {
      showToast('Completed campaigns cannot be restarted.', 'error');
      setMenuOpenId(null);
      return;
    }
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    setMenuOpenId(null);
    showToast(newStatus === 'Active' ? 'Campaign resumed' : 'Campaign paused');
  };

  const handleExport = () => {
    if (filtered.length === 0) { showToast('No campaigns to export', 'error'); return; }
    const rows = [
      ['Campaign', 'Type', 'Project', 'Channel', 'Status', 'Budget', 'Leads', 'Qualified', 'Converted', 'Start', 'End', 'Assigned'],
      ...filtered.map((c) => [
        c.name, c.type, c.project, c.channel, c.status,
        c.budget, c.leads, c.qualified, c.converted, c.startDate, c.endDate, c.assignedTo,
      ]),
    ];
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-campaigns-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} campaigns`);
  };

  const hasFilters = searchQuery || statusFilter !== 'All' || typeFilter !== 'All';
  const clearFilters = () => { setSearchQuery(''); setStatusFilter('All'); setTypeFilter('All'); };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-40">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Marketing Campaigns</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Megaphone size={13} className="text-brand-magenta" />
              Create, manage, and monitor your marketing campaigns
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md"
            >
              <Download size={14} className="transition-transform group-hover:translate-y-0.5" /> Export
            </button>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <Plus size={14} className="transition-transform group-hover:rotate-90" /> Create Campaign
            </button>
          </div>
        </div>

        {/* PRIMARY KPI STRIP */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Campaign Overview</p>
              <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <KpiCard icon={Megaphone}  label="Total Campaigns" value={summary.total}          sub={`${summary.active} active · ${summary.paused} paused`} color="purple"  delay={0} />
            <KpiCard icon={Users}      label="Total Leads"     value={summary.totalLeads}     sub={`${summary.totalQualified} qualified`}                color="emerald" delay={40} />
            <KpiCard icon={Target}     label="Converted"       value={summary.totalConverted} sub={`${summary.conversion}% conversion rate`}             color="amber"   delay={80} />
            <KpiCard icon={DollarSign} label="Total Budget"    value={summary.totalBudget}    sub="Across shown campaigns"                                color="rose"    delay={120} format={(n) => `$${n.toLocaleString('en-US')}`} />
            <KpiCard icon={Star}       label="Follow-ups"      value={monitoringSummary.totalFollowUps} sub="Generated from campaigns"                    color="purple"  delay={160} />
          </div>
        </div>

        {/* SECONDARY KPI STRIP */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Campaign Monitoring</p>
              <h2 className="font-display text-sm font-semibold text-brand-ink">Performance Metrics</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <MiniStat icon={CheckCircle2} label="Qualified"       value={summary.totalQualified}              color="emerald" sub={`${summary.conversion}% conv.`} />
            <MiniStat icon={PhoneOff}     label="No Answer"       value={monitoringSummary.totalNoAnswer}     color="rose" />
            <MiniStat icon={XCircle}      label="Not Interested"  value={monitoringSummary.totalNotInterested} color="rose" />
            <MiniStat icon={Layers}       label="Follow-ups"      value={monitoringSummary.totalFollowUps}    color="purple" />
            <MiniStat icon={Target}       label="Target Progress" value={`${monitoringSummary.targetProgress}%`} color="amber" />
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by campaign name, channel, executive…"
              className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac">
                <X size={14} className="text-brand-ink/50" />
              </button>
            )}
          </div>

          <DropdownFilter
            label="Status" icon={Filter} value={statusFilter}
            options={['All', ...CAMPAIGN_STATUSES]}
            open={statusOpen}
            onToggle={() => { setStatusOpen((s) => !s); setTypeOpen(false); }}
            onChange={(v) => { setStatusFilter(v); setStatusOpen(false); }}
          />

          <DropdownFilter
            label="Type" icon={Layers} value={typeFilter}
            options={['All', ...CAMPAIGN_TYPES]}
            open={typeOpen}
            onToggle={() => { setTypeOpen((s) => !s); setStatusOpen(false); }}
            onChange={(v) => { setTypeFilter(v); setTypeOpen(false); }}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
            >
              <X size={12} /> Clear
            </button>
          )}

          <div className="flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-full p-1.5 transition-all ${viewMode === 'grid' ? 'bg-brand-magenta/10 text-brand-magenta' : 'text-brand-ink/50 hover:bg-brand-lilac/30'}`}
              title="Grid view"
            ><Grid3x3 size={14} /></button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-full p-1.5 transition-all ${viewMode === 'list' ? 'bg-brand-magenta/10 text-brand-magenta' : 'text-brand-ink/50 hover:bg-brand-lilac/30'}`}
              title="List view"
            ><List size={14} /></button>
          </div>
        </div>

        {/* CAMPAIGNS */}
        {filtered.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={() => { setEditing(null); setShowModal(true); }} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 pb-40 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c, index) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                index={index}
                total={filtered.length}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onView={() => setViewing(c)}
                onEdit={() => { setEditing(c); setShowModal(true); }}
                onToggle={() => handleToggle(c.id, c.status)}
                onMonitoring={() => setMonitoring(c)}
                onDuplicate={() => handleDuplicate(c)}
                onDelete={() => { setConfirmDelete(c); setMenuOpenId(null); }}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 pb-40">
            {filtered.map((c, index) => (
              <CampaignRow
                key={c.id}
                campaign={c}
                isLast={index === filtered.length - 1}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onView={() => setViewing(c)}
                onEdit={() => { setEditing(c); setShowModal(true); }}
                onToggle={() => handleToggle(c.id, c.status)}
                onMonitoring={() => setMonitoring(c)}
                onDuplicate={() => handleDuplicate(c)}
                onDelete={() => { setConfirmDelete(c); setMenuOpenId(null); }}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* MODALS */}
        {showModal && (
          <CampaignModal
            mode={editing ? 'edit' : 'create'}
            initial={editing}
            defaultAssignee={user?.name || ''}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSubmit={(data) => (editing ? handleEdit(editing.id, data) : handleCreate(data))}
          />
        )}

        {viewing && (
          <CampaignDetailsDrawer
            campaign={viewing}
            onClose={() => setViewing(null)}
            onEdit={() => { setEditing(viewing); setViewing(null); setShowModal(true); }}
            onMonitoring={() => { setMonitoring(viewing); setViewing(null); }}
            onToggle={() => { handleToggle(viewing.id, viewing.status); setViewing(null); }}
          />
        )}

        {monitoring && (
          <CampaignMonitoringDrawer campaign={monitoring} onClose={() => setMonitoring(null)} />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title={`Delete "${confirmDelete.name}"?`}
            message="This will permanently delete this campaign and all its data. This action cannot be undone."
            confirmLabel="Delete Campaign"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDelete(confirmDelete.id)}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KPI CARD / MINI STAT
   ═══════════════════════════════════════════════════════════════ */
function KpiCard({ icon: Icon, label, value, sub, color = 'purple', delay = 0, format }) {
  const animated = useAnimatedCount(value);
  const displayValue = format ? format(animated) : animated;
  const themes = {
    purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'from-violet-50 via-violet-50/30 to-white', iconBg: 'bg-violet-100 text-brand-purple border-violet-200', bar: 'from-brand-purple to-brand-magenta', glow: 'bg-brand-purple/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]', valueColor: 'text-brand-purple' },
    emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'from-emerald-50 via-emerald-50/30 to-white', iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'from-emerald-500 to-emerald-400', glow: 'bg-emerald-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]', valueColor: 'text-emerald-600' },
    amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'from-amber-50 via-amber-50/30 to-white', iconBg: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'from-amber-500 to-orange-400', glow: 'bg-amber-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]', valueColor: 'text-amber-600' },
    rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'from-rose-50 via-rose-50/30 to-white', iconBg: 'bg-rose-100 text-brand-magenta border-rose-200', bar: 'from-brand-magenta to-brand-purple', glow: 'bg-brand-magenta/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]', valueColor: 'text-brand-magenta' },
  };
  const t = themes[color] || themes.purple;

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
        <p className={`font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>{displayValue}</p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color = 'purple', sub }) {
  const colors = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-brand-magenta',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color] || colors.purple}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{label}</p>
        <p className="font-display text-lg font-bold text-brand-ink tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {sub && <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/40">{sub}</p>}
      </div>
    </div>
  );
}

function useAnimatedCount(target, duration = 600) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    const to = typeof target === 'number' && Number.isFinite(target) ? target : Number(target) || 0;
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

  return display;
}

/* ═══════════════════════════════════════════════════════════════
   DROPDOWN FILTER
   ═══════════════════════════════════════════════════════════════ */
function DropdownFilter({ label, icon: Icon, value, options, open, onToggle, onChange }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        {label}: <span className="font-semibold text-brand-magenta">{value}</span>
        <ChevronDown size={14} className={`text-brand-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-30 mt-2 max-h-72 w-56 overflow-y-auto no-scrollbar rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === o
                    ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INFO LINE HELPER (aligned grid)
   ═══════════════════════════════════════════════════════════════ */
function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
      <Icon size={11} className="shrink-0 text-brand-ink/50" />
      <span className="truncate text-brand-ink/50">{label}</span>
      <span className="truncate text-right font-semibold text-brand-ink" title={value}>
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN CARD (GRID) — aligned layout
   Uses viewport measurement so menus don't clip.
   ═══════════════════════════════════════════════════════════════ */
function CampaignCard({ campaign: c, menuOpenId, setMenuOpenId, onView, onEdit, onToggle, onMonitoring, onDuplicate, onDelete, onStatusChange }) {
  const st = STATUS_STYLES[c.status] || STATUS_STYLES.Draft;
  const StatusIcon = st.icon;
  const health = campaignHealth(c);
  const target = c.targetLeads || 0;
  const progress = target > 0 ? Math.min(Math.round((c.leads / target) * 100), 100) : 0;
  const cpl = c.leads ? (c.budget / c.leads) : 0;
  const conversionRate = c.leads ? Math.round((c.converted / c.leads) * 100) : 0;

  const isCompleted = c.status === 'Completed';
  const isActive = c.status === 'Active';

  const triggerRef = useRef(null);
  const [openUp, setOpenUp] = useState(false);

  const handleOpenMenu = () => {
    const isOpen = menuOpenId === c.id;
    if (isOpen) { setMenuOpenId(null); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 300); // 300px ≈ menu max height
    }
    setMenuOpenId(c.id);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-magenta/50 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 rounded-t-2xl bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative flex flex-1 flex-col p-5">
        {/* ─── HEADER ─── */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            <Megaphone size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <button
              onClick={onView}
              className="block w-full truncate text-left font-display text-base font-semibold text-brand-ink hover:text-brand-magenta"
              title={c.name}
            >
              {c.name}
            </button>
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-brand-magenta">
              {c.type}
            </p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${st.chip}`}>
            <StatusIcon size={10} className="mr-1 inline" />
            {c.status}
          </span>

          {/* Dropdown menu */}
          <div className="relative">
            <button
              ref={triggerRef}
              aria-label="Campaign actions"
              aria-expanded={menuOpenId === c.id}
              onClick={handleOpenMenu}
              className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-lilac"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpenId === c.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                <div
                  className={`absolute right-0 ${
                    openUp ? 'bottom-full mb-2' : 'top-full mt-2'
                  } z-30 max-h-72 w-52 overflow-y-auto no-scrollbar rounded-xl border border-brand-lilac bg-white p-1 shadow-panel`}
                >
                  <MenuItem icon={Eye}       label="View Details"  onClick={() => { onView(); setMenuOpenId(null); }} />
                  <MenuItem icon={Pencil}    label="Edit Campaign" onClick={() => { onEdit(); setMenuOpenId(null); }} />
                  <MenuItem icon={BarChart3} label="Monitoring"    onClick={() => { onMonitoring(); setMenuOpenId(null); }} />
                  <MenuItem icon={Copy}      label="Duplicate"     onClick={() => onDuplicate()} />

                  {!isCompleted && (
                    <MenuItem
                      icon={isActive ? Pause : Play}
                      label={isActive ? 'Pause' : 'Start'}
                      onClick={() => onToggle()}
                    />
                  )}

                  <div className="my-1 h-px bg-brand-lilac/60" />

                  <p className="px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink/40">
                    Set Status
                  </p>

                  {CAMPAIGN_STATUSES.map((s) => {
                    const cs = STATUS_STYLES[s];
                    const SIcon = cs.icon;
                    return (
                      <button
                        key={s}
                        onClick={() => onStatusChange(c.id, s)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs ${
                          c.status === s
                            ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                            : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                        }`}
                      >
                        <SIcon size={12} /> {s}
                      </button>
                    );
                  })}

                  <div className="my-1 h-px bg-brand-lilac/60" />
                  <MenuItem icon={Trash2} label="Delete" danger onClick={() => { onDelete(); setMenuOpenId(null); }} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── INFO ROWS (aligned) ─── */}
        <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
          <InfoLine icon={Calendar}   label="Duration" value={`${formatShortDate(c.startDate)} → ${formatShortDate(c.endDate)}`} />
          <InfoLine icon={Globe}      label="Channel"  value={c.channel} />
          <InfoLine icon={User}       label="Assigned" value={c.assignedTo || '—'} />
          <InfoLine icon={DollarSign} label="Budget"   value={formatCurrency(c.budget)} />
        </div>

        {/* ─── METRICS ─── */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <MiniBox label="Leads"     value={c.leads ?? 0}     tone="purple" />
          <MiniBox label="Qualified" value={c.qualified ?? 0} tone="emerald" />
          <MiniBox label="Converted" value={c.converted ?? 0} tone="rose" />
        </div>

        {/* ─── PROGRESS BARS ─── */}
        <div className="mt-3 space-y-2">
          <ProgressBar label="Target Progress" value={progress}       tone="amber" />
          <ProgressBar label="Conversion Rate" value={conversionRate} tone="emerald" />
        </div>

        {/* ─── CPL + HEALTH (aligned 2-col grid) ─── */}
        <div className="mt-3 grid grid-cols-2 items-center gap-2 rounded-xl border border-brand-lilac/60 bg-brand-mist/40 px-3 py-2">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/50">Cost Per Lead</p>
            <p className="truncate font-display text-sm font-bold text-brand-magenta">
              {cpl ? `$${cpl.toFixed(2)}` : '—'}
            </p>
          </div>
          <div className="flex justify-end">
            <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${HEALTH_TONES[health.tone]}`}>
              <CircleDot size={9} />
              {health.label}
            </span>
          </div>
        </div>

        {/* ─── ACTIONS (equal width) ─── */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={onView}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-2 py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          >
            <Eye size={12} className="shrink-0" />
            <span className="truncate">View</span>
          </button>
          <button
            onClick={onMonitoring}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-2 py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          >
            <BarChart3 size={12} className="shrink-0" />
            <span className="truncate">Monitor</span>
          </button>
          <button
            onClick={onToggle}
            disabled={isCompleted}
            className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold text-white shadow-card transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : isCompleted
                ? 'bg-gradient-to-r from-slate-400 to-slate-500'
                : 'bg-gradient-to-r from-brand-magenta to-brand-purple'
            }`}
          >
            {isActive ? <><Pause size={12} className="shrink-0" /><span className="truncate">Pause</span></> :
             isCompleted ? <><Check size={12} className="shrink-0" /><span className="truncate">Done</span></> :
             <><Play size={12} className="shrink-0" /><span className="truncate">Start</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN ROW (LIST)
   ═══════════════════════════════════════════════════════════════ */
function CampaignRow({ campaign: c, isLast, menuOpenId, setMenuOpenId, onView, onEdit, onToggle, onMonitoring, onDuplicate, onDelete, onStatusChange }) {
  const st = STATUS_STYLES[c.status] || STATUS_STYLES.Draft;
  const StatusIcon = st.icon;
  const conversionRate = c.leads ? Math.round((c.converted / c.leads) * 100) : 0;
  const isCompleted = c.status === 'Completed';
  const isActive = c.status === 'Active';

  return (
    <div className="group flex flex-wrap items-center gap-3 rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
        <Megaphone size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta"
          >
            {c.name}
          </button>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${st.chip}`}>
            {c.status}
          </span>
        </div>
        <p className="truncate text-[11px] text-brand-ink/50">
          {c.type} · {c.channel} · {c.assignedTo}
        </p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="font-mono text-[10px] uppercase text-brand-ink/40">Budget</p>
        <p className="font-semibold tabular-nums text-brand-ink">{formatCurrency(c.budget)}</p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="font-mono text-[10px] uppercase text-brand-ink/40">Leads</p>
        <p className="font-semibold tabular-nums text-brand-ink">{c.leads ?? 0} / {c.targetLeads || '—'}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="font-mono text-[10px] uppercase text-brand-ink/40">Conv.</p>
        <p className="font-semibold tabular-nums text-emerald-600">{conversionRate}%</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="View"
        >
          <Eye size={13} />
        </button>
        <button
          onClick={onMonitoring}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="Monitoring"
        >
          <BarChart3 size={13} />
        </button>
        <button
          onClick={onToggle}
          disabled={isCompleted}
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${
            isActive
              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : isCompleted
              ? 'bg-gradient-to-r from-slate-400 to-slate-500'
              : 'bg-gradient-to-r from-brand-magenta to-brand-purple'
          }`}
        >
          {isActive ? <><Pause size={11} /> Pause</> : isCompleted ? <><Check size={11} /> Done</> : <><Play size={11} /> Start</>}
        </button>

        <div className="relative">
          <button
            aria-label="Campaign actions"
            onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 transition-colors hover:bg-brand-lilac"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === c.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div
                className={`absolute right-0 ${
                  isLast ? 'bottom-full mb-2' : 'top-full mt-2'
                } z-30 max-h-72 w-52 overflow-y-auto no-scrollbar rounded-xl border border-brand-lilac bg-white p-1 shadow-panel`}
              >
                <MenuItem icon={Pencil}  label="Edit Campaign" onClick={() => { onEdit(); setMenuOpenId(null); }} />
                <MenuItem icon={Copy}    label="Duplicate"     onClick={() => onDuplicate()} />

                <div className="my-1 h-px bg-brand-lilac/60" />

                <p className="px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink/40">
                  Set Status
                </p>

                {CAMPAIGN_STATUSES.map((s) => {
                  const cs = STATUS_STYLES[s];
                  const SIcon = cs.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => onStatusChange(c.id, s)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs ${
                        c.status === s
                          ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                          : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                      }`}
                    >
                      <SIcon size={12} /> {s}
                    </button>
                  );
                })}

                <div className="my-1 h-px bg-brand-lilac/60" />
                <MenuItem icon={Trash2}  label="Delete"        danger onClick={() => { onDelete(); setMenuOpenId(null); }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MENU ITEM / MINI BOX / PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */
function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
        danger ? 'text-rose-500 hover:bg-rose-50' : 'text-brand-ink/70 hover:bg-brand-lilac/40'
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function MiniBox({ label, value, tone = 'purple' }) {
  const tones = {
    purple:  'bg-violet-50 text-brand-purple border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose:    'bg-rose-50 text-brand-magenta border-rose-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border ${tones[tone] || tones.purple} px-2 py-2.5`}>
      <p className="font-display text-base font-bold tabular-nums leading-none">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

function ProgressBar({ label, value, tone = 'purple' }) {
  const tones = {
    purple:  { bar: 'from-brand-purple to-brand-magenta', text: 'text-brand-purple' },
    emerald: { bar: 'from-emerald-500 to-emerald-400',     text: 'text-emerald-600' },
    amber:   { bar: 'from-amber-500 to-orange-400',        text: 'text-amber-600' },
    rose:    { bar: 'from-brand-magenta to-brand-purple',  text: 'text-brand-magenta' },
  };
  const t = tones[tone] || tones.purple;
  const safe = Math.min(Math.max(value, 0), 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="font-mono uppercase tracking-wider text-brand-ink/50">{label}</span>
        <span className={`font-semibold tabular-nums ${t.text}`}>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${t.bar} transition-all duration-1000`}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN MODAL
   ═══════════════════════════════════════════════════════════════ */
function CampaignModal({ mode = 'create', initial = null, defaultAssignee, onClose, onSubmit }) {
  const seed = initial || {};
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name: seed.name || '',
    type: seed.type || 'Lead Generation',
    project: seed.project || '',
    channel: seed.channel || 'Google Ads',
    audience: seed.audience || '',
    startDate: seed.startDate || new Date().toISOString().slice(0, 10),
    endDate: seed.endDate || '',
    budget: seed.budget ?? '',
    objective: seed.objective || '',
    targetLeads: seed.targetLeads ?? '',
    assignedTo: seed.assignedTo || defaultAssignee || '',
    status: seed.status || 'Draft',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEscape(true, () => { if (!submitting) onClose(); });

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const validate = () => {
    if (!form.name.trim()) return 'Campaign name is required.';
    if (!form.project.trim()) return 'Project is required.';
    if (!form.startDate) return 'Start date is required.';
    if (!form.endDate) return 'End date is required.';
    if (form.endDate < form.startDate) return 'End date must be after start date.';
    if (!form.budget || Number(form.budget) <= 0) return 'Budget must be greater than 0.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    timeoutRef.current = setTimeout(() => {
      setSubmitting(false);
      onSubmit({
        ...form,
        budget: Number(form.budget),
        targetLeads: Number(form.targetLeads) || 0,
      });
    }, 250);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit Campaign' : 'Create Campaign'}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Megaphone size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-brand-ink">
                {isEdit ? 'Edit Campaign' : 'Create Campaign'}
              </h3>
              <p className="text-[11px] text-brand-ink/50">
                {isEdit ? 'Update campaign details' : 'Configure a new marketing campaign'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          <SectionTitle icon={Info} label="Basic Information" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              inputRef={nameRef}
              label="Campaign Name *"
              value={form.name}
              onChange={(v) => { setForm({ ...form, name: v }); setError(''); }}
              placeholder="e.g. Summer Sale 2024"
              icon={Megaphone}
            />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Campaign Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                {CAMPAIGN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <ModalInput label="Project *" value={form.project} onChange={(v) => setForm({ ...form, project: v })} placeholder="e.g. Eliteinova CRM" icon={Briefcase} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Marketing Channel *</label>
              <select
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                {MARKETING_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <SectionTitle icon={Target} label="Target & Schedule" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput label="Target Audience" value={form.audience} onChange={(v) => setForm({ ...form, audience: v })} placeholder="e.g. Age 25-40, Metro cities" icon={Users} />
            <ModalInput label="Target Leads" type="number" value={form.targetLeads} onChange={(v) => setForm({ ...form, targetLeads: v })} placeholder="e.g. 500" icon={Target} />
            <ModalInput label="Start Date *" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} icon={Calendar} />
            <ModalInput label="End Date *"   type="date" value={form.endDate}   onChange={(v) => setForm({ ...form, endDate: v })}   icon={Calendar} />
          </div>

          <SectionTitle icon={DollarSign} label="Budget & Assignment" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput label="Campaign Budget (USD) *" type="number" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder="e.g. 5000" icon={DollarSign} />
            <ModalInput label="Assigned Marketing Executive" value={form.assignedTo} onChange={(v) => setForm({ ...form, assignedTo: v })} placeholder="e.g. John Doe" icon={User} />
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Campaign Objective</label>
              <textarea
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                placeholder="Briefly describe what this campaign aims to achieve..."
                rows={3}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
            </div>
          </div>

          <SectionTitle icon={Zap} label="Initial Status" />
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_STATUSES.map((s) => {
              const st = STATUS_STYLES[s];
              const StatusIcon = st.icon;
              const active = form.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? `${st.chip} ring-2 ring-brand-magenta/20`
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  <StatusIcon size={12} /> {s}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />{error}
            </div>
          )}

          <div className="flex gap-2 border-t border-brand-lilac/60 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION TITLE / MODAL INPUT
   ═══════════════════════════════════════════════════════════════ */
function SectionTitle({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 border-b border-brand-lilac/60 pb-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta/10 to-brand-purple/10 text-brand-magenta">
        {Icon ? <Icon size={12} /> : null}
      </span>
      <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/60">{label}</h4>
    </div>
  );
}

function ModalInput({ label, type = 'text', value, onChange, placeholder, icon: Icon, required, inputRef }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-magenta/60" />}
        <input
          ref={inputRef}
          type={type}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-brand-lilac bg-white py-2.5 ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15`}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN DETAILS DRAWER
   ═══════════════════════════════════════════════════════════════ */
function CampaignDetailsDrawer({ campaign: c, onClose, onEdit, onMonitoring, onToggle }) {
  const st = STATUS_STYLES[c.status] || STATUS_STYLES.Draft;
  const StatusIcon = st.icon;
  const health = campaignHealth(c);
  const conversionRate = c.leads ? Math.round((c.converted / c.leads) * 100) : 0;
  const target = c.targetLeads || 0;
  const targetProgress = target > 0 ? Math.round((c.leads / target) * 100) : 0;
  const cpl = c.leads ? (c.budget / c.leads) : 0;

  useEscape(true, onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Campaign details"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
    >
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
              <Megaphone size={18} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Campaign Details</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{c.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${st.chip}`}>
              <StatusIcon size={12} /> {c.status}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${HEALTH_TONES[health.tone]}`}>
              <CircleDot size={10} /> {health.label}
            </span>
            <span className="rounded-full bg-brand-lilac/60 px-3 py-1.5 text-xs font-bold text-brand-purple">{c.type}</span>
            <span className="rounded-full bg-brand-mist px-3 py-1.5 text-xs font-bold text-brand-ink/70">{c.channel}</span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-white p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-magenta/10 blur-3xl" />
            <div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Target Progress</p>
              <p className="mt-1 font-display text-3xl font-bold text-brand-magenta">
                {c.leads} <span className="text-lg font-medium text-brand-ink/40">/ {c.targetLeads || '—'}</span>
              </p>
              <p className="mt-1 text-xs text-brand-ink/60">{targetProgress}% of target achieved</p>
            </div>
            <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <DetailStat icon={Target}       label="Total Leads" value={c.leads ?? 0}     color="rose" />
            <DetailStat icon={CheckCircle2} label="Qualified"   value={c.qualified ?? 0} color="purple" />
            <DetailStat icon={TrendingUp}   label="Converted"   value={c.converted ?? 0} color="emerald" />
            <DetailStat icon={BarChart3}    label="Conversion"  value={`${conversionRate}%`} color="amber" />
          </div>

          <div className="card !p-5 space-y-3">
            <SectionTitle icon={Sparkles} label="Campaign Information" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow icon={Briefcase}  label="Project"           value={c.project} />
              <InfoRow icon={Globe}      label="Marketing Channel" value={c.channel} />
              <InfoRow icon={Users}      label="Target Audience"   value={c.audience || '—'} />
              <InfoRow icon={Target}     label="Objective"         value={c.objective || '—'} />
              <InfoRow icon={Calendar}   label="Start Date"        value={formatDate(c.startDate)} />
              <InfoRow icon={Calendar}   label="End Date"          value={formatDate(c.endDate)} />
              <InfoRow icon={DollarSign} label="Budget"            value={formatCurrency(c.budget)} />
              <InfoRow icon={TrendingUp} label="Cost Per Lead"     value={cpl ? `$${cpl.toFixed(2)}` : '—'} />
              <InfoRow icon={Target}     label="Target Leads"      value={c.targetLeads || '—'} />
              <InfoRow icon={User}       label="Assigned To"       value={c.assignedTo || '—'} />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Summary</p>
            <p className="mt-1.5 text-sm text-brand-ink/80">
              <strong>{c.name}</strong> is a <strong>{c.type.toLowerCase()}</strong> campaign running on{' '}
              <strong>{c.channel}</strong> for <strong>{c.project}</strong>. Currently <strong>{c.status.toLowerCase()}</strong> with{' '}
              <strong>{c.leads}</strong> leads captured, <strong>{c.qualified}</strong> qualified and{' '}
              <strong>{c.converted}</strong> converted ({conversionRate}%). Budget:{' '}
              <strong>{formatCurrency(c.budget)}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={onEdit} className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <Pencil size={13} /> Edit
            </button>
            <button onClick={onMonitoring} className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <BarChart3 size={13} /> Monitor
            </button>
            <button
              onClick={onToggle}
              disabled={c.status === 'Completed'}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                c.status === 'Active' ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-brand-magenta to-brand-purple'
              }`}
            >
              {c.status === 'Active' ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Start</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMPAIGN MONITORING DRAWER
   ═══════════════════════════════════════════════════════════════ */
function CampaignMonitoringDrawer({ campaign: c, onClose }) {
  const conversionRate = c.leads ? Math.round((c.converted / c.leads) * 100) : 0;
  const target = c.targetLeads || 0;
  const targetProgress = target > 0 ? Math.round((c.leads / target) * 100) : 0;
  const cpl = c.leads ? (c.budget / c.leads) : 0;

  const funnel = [
    { label: 'Target Leads',   value: c.targetLeads || 0, tone: 'purple' },
    { label: 'Leads Captured', value: c.leads,            tone: 'purple' },
    { label: 'Qualified',      value: c.qualified,        tone: 'emerald' },
    { label: 'Converted',      value: c.converted,        tone: 'emerald' },
  ];
  const funnelDenom = Math.max(c.targetLeads || 0, c.leads, 1);

  useEscape(true, onClose);

  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Campaign', c.name], ['Type', c.type], ['Status', c.status],
      ['Channel', c.channel], ['Project', c.project],
      ['Start', c.startDate], ['End', c.endDate], ['Budget', c.budget],
      ['Target Leads', c.targetLeads], ['Leads', c.leads], ['Qualified', c.qualified],
      ['Converted', c.converted], ['No Answer', c.noAnswer || 0],
      ['Not Interested', c.notInterested || 0], ['Follow-ups', c.followUpsGenerated || 0],
      ['CPL', cpl.toFixed(2)], ['Conversion Rate', `${conversionRate}%`], ['Target Progress', `${targetProgress}%`],
    ];
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-monitoring-${c.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Campaign monitoring"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
    >
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
              <BarChart3 size={18} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Campaign Monitoring</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{c.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-white p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-magenta/10 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Leads Captured</p>
                <p className="mt-1 font-display text-3xl font-bold text-brand-magenta">
                  {c.leads} <span className="ml-2 text-lg font-medium text-brand-ink/40">/ {c.targetLeads || '—'}</span>
                </p>
                <p className="mt-1 text-xs text-brand-ink/60">
                  {targetProgress}% of target · {Math.max(0, (c.targetLeads || 0) - c.leads)} remaining
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-md">
                <Target size={24} />
              </div>
            </div>
            <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MonitorTile icon={CheckCircle2} label="Qualified"      value={c.qualified ?? 0}              tone="emerald" subtitle={`${c.leads ? Math.round((c.qualified / c.leads) * 100) : 0}% of leads`} />
            <MonitorTile icon={Target}       label="Converted"      value={c.converted ?? 0}              tone="emerald" subtitle={`${conversionRate}% conversion`} />
            <MonitorTile icon={Star}         label="Follow-ups"     value={c.followUpsGenerated ?? 0}     tone="purple" subtitle="Generated" />
            <MonitorTile icon={PhoneOff}     label="No Answer"      value={c.noAnswer ?? 0}               tone="rose"    subtitle="Unreachable" />
            <MonitorTile icon={XCircle}      label="Not Interested" value={c.notInterested ?? 0}          tone="rose"    subtitle="Lost leads" />
            <MonitorTile icon={DollarSign}   label="Cost Per Lead"  value={cpl ? `$${cpl.toFixed(2)}` : '—'} tone="amber" subtitle={`Budget ${formatCurrency(c.budget)}`} />
          </div>

          <div className="card !p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
                <TrendingUp size={14} />
              </span>
              <div>
                <h4 className="font-display text-sm font-bold text-brand-ink">Conversion Funnel</h4>
                <p className="text-[10px] text-brand-ink/50">Lead journey through the campaign</p>
              </div>
            </div>
            <div className="space-y-3">
              {funnel.map((step) => {
                const pct = Math.min(100, Math.round((step.value / funnelDenom) * 100));
                const tones = {
                  purple:  { bar: 'from-brand-purple to-brand-magenta', text: 'text-brand-purple' },
                  emerald: { bar: 'from-emerald-500 to-emerald-400',     text: 'text-emerald-600' },
                };
                const tone = tones[step.tone];
                return (
                  <div key={step.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-brand-ink/70">{step.label}</span>
                      <span className="font-mono font-bold text-brand-ink tabular-nums">
                        {step.value.toLocaleString()} <span className={`ml-1 ${tone.text}`}>({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${tone.bar} transition-all duration-1000`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card !p-5">
            <h4 className="mb-4 font-display text-sm font-bold text-brand-ink">Rate Overview</h4>
            <div className="grid grid-cols-2 gap-3">
              <RateTile label="Conversion Rate" value={conversionRate} tone="emerald" />
              <RateTile label="Target Progress" value={targetProgress} tone="amber" />
            </div>
          </div>

          <button
            onClick={handleExportReport}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Download size={14} /> Export Monitoring Report
          </button>
        </div>
      </div>
    </div>
  );
}

function MonitorTile({ icon: Icon, label, value, tone = 'purple', subtitle }) {
  const tones = {
    purple:  { fg: 'text-brand-purple',  iconBg: 'bg-violet-100',  border: 'border-violet-200' },
    emerald: { fg: 'text-emerald-600',   iconBg: 'bg-emerald-100', border: 'border-emerald-200' },
    amber:   { fg: 'text-amber-600',     iconBg: 'bg-amber-100',   border: 'border-amber-200' },
    rose:    { fg: 'text-brand-magenta', iconBg: 'bg-rose-100',    border: 'border-rose-200' },
  };
  const t = tones[tone] || tones.purple;
  return (
    <div className={`rounded-2xl border-2 ${t.border} bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.iconBg} ${t.fg}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className={`mt-3 font-display text-2xl font-bold tabular-nums ${t.fg}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-brand-ink/75">{label}</p>
      {subtitle && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{subtitle}</p>}
    </div>
  );
}

function RateTile({ label, value, tone = 'purple' }) {
  const tones = {
    purple:  'text-brand-purple',
    emerald: 'text-emerald-600',
    amber:   'text-amber-600',
    rose:    'text-brand-magenta',
  };
  return (
    <div className="rounded-xl border border-brand-lilac bg-white p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${tones[tone]}`}>{value}%</p>
    </div>
  );
}

function DetailStat({ icon: Icon, label, value, color = 'purple' }) {
  const colors = {
    purple:  'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber:   'bg-amber-50 text-amber-600 border-amber-200',
    rose:    'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</p>
        <Icon size={12} />
      </div>
      <p className="mt-1 font-display text-lg font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-magenta">
        <Icon size={14} />
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="shrink-0 text-brand-ink/50">{label}</span>
        <span className="truncate font-semibold text-brand-ink">{value}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY / CONFIRM / TOAST
   ═══════════════════════════════════════════════════════════════ */
function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Inbox size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No campaigns match your filters' : 'No campaigns yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button onClick={onClear} className="font-semibold text-brand-magenta hover:underline">Clear all filters</button>
        ) : (
          'Create your first marketing campaign to start generating leads.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onCreate}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={16} /> Create First Campaign
        </button>
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  useEscape(true, onCancel);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
            <AlertCircle size={18} />
          </div>
          <h3 className="font-display text-base font-semibold text-brand-ink">{title}</h3>
        </div>
        <p className="mb-5 text-sm text-brand-ink/60">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}