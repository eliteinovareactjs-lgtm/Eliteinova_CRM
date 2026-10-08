// src/pages/marketing/LeadSources.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, Filter, ChevronDown, Eye, Pencil,
  Trash2, Copy, AlertCircle, CheckCircle2, XCircle, X, Users,
  Sparkles, Clock, Zap, Target, TrendingUp, TrendingDown, Calendar,
  Globe, MapPin, Briefcase, Tag, Hash, UserPlus, Layers, Flame,
  Inbox, Download, Grid3x3, List, ArrowRight, Activity, DollarSign,
  Star, Megaphone, MousePointerClick, MessageSquare, BarChart3,
  Share2, CircleDot, Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   INLINE BRAND ICONS
   ═══════════════════════════════════════════════════════════════ */
const FacebookIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/>
  </svg>
);

const InstagramIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const WhatsappIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.5 3.5A10.5 10.5 0 0 0 3.3 16.3L2 22l5.9-1.5a10.5 10.5 0 0 0 12.6-17zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-3.5.9.9-3.4-.2-.3A8 8 0 1 1 12 20z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const SOURCE_CATEGORIES = [
  'Website',
  'Google Ads',
  'Meta Ads',
  'WhatsApp',
  'Social Media',
  'Referral',
  'Campaign',
  'Other Sources',
];

const SOURCE_STATUSES = ['Active', 'Paused', 'Completed', 'Draft'];

const STATUS_STYLES = {
  Active:    { chip: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: Zap },
  Paused:    { chip: 'bg-amber-100 text-amber-600 border-amber-200', icon: Clock },
  Completed: { chip: 'bg-violet-100 text-brand-purple border-violet-200', icon: CheckCircle2 },
  Draft:     { chip: 'bg-slate-100 text-slate-600 border-slate-200', icon: Pencil },
};

const CATEGORY_ICONS = {
  'Website':              Globe,
  'Google Ads':           Target,
  'Meta Ads':             FacebookIcon,
  'WhatsApp':             WhatsappIcon,
  'Social Media':         InstagramIcon,
  'Referral':             Users,
  'Campaign':             Megaphone,
  'Other Sources':        Share2,
};

const SOURCE_TYPES = [
  'Google Ads', 'Meta Ads', 'Facebook', 'Instagram', 'WhatsApp',
  'Website', 'Landing Page', 'YouTube', 'LinkedIn', 'Referral',
  'Event', 'Offline Campaign', 'Other',
];

const STORAGE_KEY = 'sources:marketing';
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* CSV formula-injection guard */
const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

/* Local-timezone today (YYYY-MM-DD) */
const todayISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

/* Normalize legacy/partial records */
const normalizeSource = (s) => ({
  ...s,
  leads: s.leads ?? 0,
  qualified: s.qualified ?? 0,
  converted: s.converted ?? 0,
  budget: s.budget ?? 0,
  cpl: s.cpl ?? 0,
  status: s.status || 'Active',
  category: s.category || 'Other Sources',
  sourceType: s.sourceType || s.category || 'Other',
  campaign: s.campaign || '',
  landingPage: s.landingPage || '',
  lastSync: s.lastSync || s.createdAt || new Date().toISOString(),
  createdAt: s.createdAt || new Date().toISOString(),
});

const loadState = (fallback) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeSource);
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (value) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* ignore */ }
};

const formatCurrency = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
   SEED DATA
   ═══════════════════════════════════════════════════════════════ */
const SEED_SOURCES = [
  { id: 'src-google-ads',  source: 'Google Ads',  category: 'Google Ads',    campaign: 'Search - CRM',    landingPage: '/landing/crm-trial',  leads: 450, qualified: 120, converted: 35, cpl: 15.50, budget: 6975, status: 'Active',    sourceType: 'Google Ads',       createdAt: new Date('2024-05-01').toISOString(), lastSync: new Date('2024-06-20T10:00:00Z').toISOString() },
  { id: 'src-meta-ads',    source: 'Meta Ads',    category: 'Meta Ads',      campaign: 'Summer Sale',     landingPage: '/landing/summer-sale', leads: 320, qualified: 85,  converted: 22, cpl: 8.20,  budget: 2624, status: 'Active',    sourceType: 'Meta Ads',         createdAt: new Date('2024-05-15').toISOString(), lastSync: new Date('2024-06-20T10:00:00Z').toISOString() },
  { id: 'src-website',     source: 'Website',     category: 'Website',       campaign: 'Organic',         landingPage: '/',                    leads: 210, qualified: 65,  converted: 18, cpl: 0,     budget: 0,    status: 'Active',    sourceType: 'Website',          createdAt: new Date('2024-04-20').toISOString(), lastSync: new Date('2024-06-20T10:00:00Z').toISOString() },
  { id: 'src-whatsapp',    source: 'WhatsApp',    category: 'WhatsApp',      campaign: 'Broadcast',       landingPage: '/landing/whatsapp',    leads: 150, qualified: 40,  converted: 12, cpl: 2.10,  budget: 315,  status: 'Active',    sourceType: 'WhatsApp',         createdAt: new Date('2024-06-01').toISOString(), lastSync: new Date('2024-06-20T10:00:00Z').toISOString() },
  { id: 'src-referral',    source: 'Referral',    category: 'Referral',      campaign: 'Partner Program', landingPage: '/refer',               leads: 85,  qualified: 30,  converted: 10, cpl: 5.00,  budget: 425,  status: 'Active',    sourceType: 'Referral',         createdAt: new Date('2024-04-10').toISOString(), lastSync: new Date('2024-06-20T10:00:00Z').toISOString() },
  { id: 'src-linkedin',    source: 'LinkedIn',    category: 'Social Media',  campaign: 'B2B Outreach',    landingPage: '/landing/b2b',         leads: 60,  qualified: 25,  converted: 8,  cpl: 22.00, budget: 1320, status: 'Paused',    sourceType: 'LinkedIn',         createdAt: new Date('2024-05-25').toISOString(), lastSync: new Date('2024-06-20T10:00:00Z').toISOString() },
  { id: 'src-facebook',    source: 'Facebook',    category: 'Social Media',  campaign: 'Brand Awareness', landingPage: '/landing/brand',       leads: 120, qualified: 30,  converted: 6,  cpl: 4.20,  budget: 504,  status: 'Active',    sourceType: 'Facebook',         createdAt: new Date('2024-06-05').toISOString(), lastSync: new Date('2024-06-20T10:00:00Z').toISOString() },
  { id: 'src-instagram',   source: 'Instagram',   category: 'Social Media',  campaign: 'Reel Campaign',   landingPage: '/landing/reel',        leads: 95,  qualified: 28,  converted: 5,  cpl: 6.80,  budget: 646,  status: 'Active',    sourceType: 'Instagram',        createdAt: new Date('2024-06-10').toISOString(), lastSync: new Date('2024-06-20T10:00:00Z').toISOString() },
  { id: 'src-mumbai-expo', source: 'Mumbai Expo', category: 'Other Sources', campaign: 'Offline Expo',    landingPage: '—',                    leads: 45,  qualified: 12,  converted: 4,  cpl: 45.00, budget: 2025, status: 'Completed', sourceType: 'Offline Campaign', createdAt: new Date('2024-03-01').toISOString(), lastSync: new Date('2024-06-20T10:00:00Z').toISOString() },
].map(normalizeSource);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function LeadSources() {
  const { user } = useAuth();

  const [sources, setSources] = useState(() => loadState(SEED_SOURCES));
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toastTimerRef = useRef(null);

  useEffect(() => { saveState(sources); }, [sources]);
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2400);
  };

  /* ── TABS ── */
  const TABS = [
    { key: 'all',             label: 'All Sources',    icon: Share2 },
    { key: 'Website',         label: 'Website',        icon: Globe },
    { key: 'Google Ads',      label: 'Google Ads',     icon: Target },
    { key: 'Meta Ads',        label: 'Meta Ads',       icon: FacebookIcon },
    { key: 'WhatsApp',        label: 'WhatsApp',       icon: WhatsappIcon },
    { key: 'Social Media',    label: 'Social Media',   icon: InstagramIcon },
    { key: 'Referral',        label: 'Referral',       icon: Users },
    { key: 'Campaign',        label: 'Campaign',       icon: Megaphone },
    { key: 'Other Sources',   label: 'Other Sources',  icon: Layers },
  ];

  const tabCounts = useMemo(() => {
    const map = { all: sources.length };
    SOURCE_CATEGORIES.forEach((cat) => {
      map[cat] = sources.filter((s) => s.category === cat).length;
    });
    return map;
  }, [sources]);

  /* ── FILTERED ── */
  const filtered = useMemo(() => {
    let list = [...sources];

    if (activeTab !== 'all') list = list.filter((s) => s.category === activeTab);
    if (categoryFilter !== 'All') list = list.filter((s) => s.category === categoryFilter);
    if (statusFilter !== 'All') list = list.filter((s) => s.status === statusFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) =>
        `${s.source} ${s.category} ${s.campaign} ${s.landingPage}`
          .toLowerCase()
          .includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sources, activeTab, categoryFilter, statusFilter, searchQuery]);

  /* ── SUMMARY (always from ALL sources — KPIs stay stable) ── */
  const summary = useMemo(() => {
    const totalLeads     = sources.reduce((sum, s) => sum + (s.leads || 0), 0);
    const totalQualified = sources.reduce((sum, s) => sum + (s.qualified || 0), 0);
    const totalConverted = sources.reduce((sum, s) => sum + (s.converted || 0), 0);
    const totalBudget    = sources.reduce((sum, s) => sum + (s.budget || 0), 0);
    const avgCPL = totalLeads > 0
      ? sources.reduce((sum, s) => sum + (s.cpl || 0) * (s.leads || 0), 0) / totalLeads
      : 0;
    return {
      total: sources.length,
      totalLeads, totalQualified, totalConverted, totalBudget, avgCPL,
    };
  }, [sources]);

  /* ── HANDLERS ── */
  const handleCreate = (data) => {
    const newSource = normalizeSource({
      id: uid('src'),
      leads: 0,
      qualified: 0,
      converted: 0,
      budget: 0,
      cpl: 0,
      status: 'Active',
      ...data,
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setSources((prev) => [newSource, ...prev]);
    setShowModal(false);
    showToast(`Source "${data.source}" added`);
  };

  const handleEdit = (id, updates) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    setEditing(null);
    showToast('Source updated');
  };

  const handleDelete = (id) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setConfirmDelete(null);
    showToast('Source deleted', 'error');
  };

  const handleDuplicate = (source) => {
    const copy = normalizeSource({
      ...source,
      id: uid('src'),
      source: `${source.source} (Copy)`,
      leads: 0, qualified: 0, converted: 0,
      status: 'Draft',
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setSources((prev) => [copy, ...prev]);
    showToast('Source duplicated');
  };

  const handleStatusChange = (id, newStatus) => {
    const target = sources.find((s) => s.id === id);
    if (target && target.status === newStatus) return;
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
    showToast(`Status → ${newStatus}`);
  };

  const handleExport = () => {
    if (filtered.length === 0) { showToast('No sources to export', 'error'); return; }
    const rows = [
      ['Source', 'Category', 'Source Type', 'Campaign', 'Landing Page', 'Leads', 'Qualified', 'Converted', 'CPL', 'Budget', 'Status'],
      ...filtered.map((s) => [
        s.source, s.category, s.sourceType, s.campaign, s.landingPage,
        s.leads, s.qualified, s.converted, s.cpl, s.budget, s.status,
      ]),
    ];
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-sources-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} sources`);
  };

  const hasFilters = !!searchQuery || categoryFilter !== 'All' || statusFilter !== 'All';
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setActiveTab('all');
  };

  const openView = (s) => setViewing(s);
  const openEdit = (s) => { setEditing(s); setShowModal(true); };
  const openDelete = (s) => setConfirmDelete(s);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-40">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Lead Sources</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Share2 size={13} className="text-brand-magenta" />
              Understand where your leads are coming from
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
              <Plus size={14} className="transition-transform group-hover:rotate-90" /> Add Source
            </button>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Source Overview</p>
              <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <KpiCard icon={Share2}       label="Total Sources" value={summary.total}           sub="Channels tracked"   color="purple"  delay={0} />
            <KpiCard icon={Users}        label="Total Leads"   value={summary.totalLeads}      sub="Across all sources" color="emerald" delay={40} />
            <KpiCard icon={CheckCircle2} label="Qualified"     value={summary.totalQualified}  sub="Ready to convert"   color="purple"  delay={80} />
            <KpiCard icon={Target}       label="Converted"     value={summary.totalConverted}  sub="Won from sources"   color="emerald" delay={120} />
            <KpiCard icon={DollarSign}   label="Avg. CPL"      value={summary.avgCPL}          sub="Blended average"    color="amber"   delay={160} format={(n) => `$${Number(n).toFixed(2)}`} />
          </div>
        </div>

        {/* TABS */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count = tabCounts[t.key] ?? 0;
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
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-full border p-1.5 transition-all ${viewMode === 'grid' ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta' : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'}`}
                title="Grid view"
              ><Grid3x3 size={14} /></button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-full border p-1.5 transition-all ${viewMode === 'list' ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta' : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'}`}
                title="List view"
              ><List size={14} /></button>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by source, campaign, landing page…"
              className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac">
                <X size={14} className="text-brand-ink/50" />
              </button>
            )}
          </div>

          <DropdownFilter
            label="Category" icon={Layers} value={categoryFilter}
            options={['All', ...SOURCE_CATEGORIES]}
            open={categoryOpen}
            onToggle={() => { setCategoryOpen((s) => !s); setStatusOpen(false); }}
            onChange={(v) => { setCategoryFilter(v); setCategoryOpen(false); }}
          />

          <DropdownFilter
            label="Status" icon={Filter} value={statusFilter}
            options={['All', ...SOURCE_STATUSES]}
            open={statusOpen}
            onToggle={() => { setStatusOpen((s) => !s); setCategoryOpen(false); }}
            onChange={(v) => { setStatusFilter(v); setStatusOpen(false); }}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
            >
              <X size={12} /> Clear
            </button>
          )}

          <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
            <Filter size={14} className="text-brand-magenta" />
            Showing: <span className="text-brand-magenta">{filtered.length}</span>
          </span>
        </div>

        {/* CONTENT */}
        {filtered.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={() => { setEditing(null); setShowModal(true); }} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 pb-40 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <SourceCard
                key={s.id}
                source={s}
                onView={() => openView(s)}
                onEdit={() => openEdit(s)}
                onDelete={() => openDelete(s)}
              />
            ))}
          </div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[10px] font-bold uppercase tracking-wider text-brand-ink/60">
                <tr>
                  <th className="w-[16%] px-3 py-3">Source</th>
                  <th className="w-[16%] px-3 py-3">Campaign</th>
                  <th className="w-[14%] px-3 py-3">Landing Page</th>
                  <th className="w-[9%] px-3 py-3 text-right">Leads</th>
                  <th className="w-[9%] px-3 py-3 text-right">Qualified</th>
                  <th className="w-[9%] px-3 py-3 text-right">Converted</th>
                  <th className="w-[9%] px-3 py-3 text-right">CPL</th>
                  <th className="w-[13%] px-3 py-3 text-center">Status</th>
                  <th className="w-[14%] px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-lilac/40">
                {filtered.map((s) => {
                  const st = STATUS_STYLES[s.status] || STATUS_STYLES.Draft;
                  const StatusIcon = st.icon;
                  const SourceIcon = CATEGORY_ICONS[s.category] || Share2;
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-brand-mist/30">
                      {/* Source */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
                            <SourceIcon size={12} />
                          </span>
                          <div className="min-w-0">
                            <button onClick={() => openView(s)} className="block truncate text-left text-xs font-semibold text-brand-ink hover:text-brand-magenta" title={s.source}>
                              {s.source}
                            </button>
                            <p className="truncate font-mono text-[9px] text-brand-ink/50">{s.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Campaign */}
                      <td className="px-3 py-3">
                        <p className="truncate text-xs text-brand-ink/70" title={s.campaign}>{s.campaign}</p>
                      </td>

                      {/* Landing Page */}
                      <td className="px-3 py-3">
                        <p className="truncate font-mono text-[11px] text-brand-ink/50" title={s.landingPage}>{s.landingPage}</p>
                      </td>

                      {/* Leads */}
                      <td className="px-3 py-3 text-right text-xs font-semibold tabular-nums">{s.leads}</td>

                      {/* Qualified */}
                      <td className="px-3 py-3 text-right text-xs tabular-nums text-brand-purple font-medium">{s.qualified}</td>

                      {/* Converted */}
                      <td className="px-3 py-3 text-right text-xs tabular-nums text-emerald-600 font-medium">{s.converted}</td>

                      {/* CPL */}
                      <td className="px-3 py-3 text-right text-xs tabular-nums text-brand-magenta font-medium">
                        {s.cpl ? `$${s.cpl.toFixed(2)}` : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${st.chip}`}>
                            <StatusIcon size={10} />
                            {s.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openView(s)}
                            className="flex h-7 items-center gap-1 rounded-lg border border-brand-lilac bg-white px-2 text-[10px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
                            title="View details"
                          >
                            <Eye size={11} /> View
                          </button>
                          <button
                            onClick={() => openEdit(s)}
                            className="flex h-7 items-center gap-1 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-2 text-[10px] font-semibold text-white shadow-card transition-all hover:brightness-110"
                            title="Edit source"
                          >
                            <Pencil size={10} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MODALS */}
        {showModal && (
          <SourceModal
            mode={editing ? 'edit' : 'create'}
            initial={editing}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSubmit={(data) => (editing ? handleEdit(editing.id, data) : handleCreate(data))}
          />
        )}

        {viewing && (
          <SourceDetailDrawer
            source={viewing}
            onClose={() => setViewing(null)}
            onEdit={() => { setEditing(viewing); setViewing(null); setShowModal(true); }}
            onStatusChange={(s) => { handleStatusChange(viewing.id, s); setViewing(null); }}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title={`Delete "${confirmDelete.source}"?`}
            message="This will permanently delete this source. This action cannot be undone."
            confirmLabel="Delete Source"
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
   KPI CARD
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
        <p className={`truncate font-display text-2xl font-bold leading-tight tabular-nums ${t.valueColor}`}>{displayValue}</p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
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
  const triggerRef = useRef(null);
  const [openUp, setOpenUp] = useState(false);

  const handleToggle = () => {
    if (!open) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUp(spaceBelow < 320);
      }
    }
    onToggle();
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={handleToggle}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        {label}: <span className="max-w-[100px] truncate font-semibold text-brand-magenta">{value}</span>
        <ChevronDown size={14} className={`text-brand-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className={`absolute right-0 ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'} z-30 max-h-72 w-56 overflow-y-auto no-scrollbar rounded-xl border border-brand-lilac bg-white p-1 shadow-panel`}>
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
   SOURCE CARD (GRID) — View + Edit + Delete visible
   ═══════════════════════════════════════════════════════════════ */
function SourceCard({ source: s, onView, onEdit, onDelete }) {
  const st = STATUS_STYLES[s.status] || STATUS_STYLES.Draft;
  const StatusIcon = st.icon;
  const SourceIcon = CATEGORY_ICONS[s.category] || Share2;
  const conversionRate = s.leads ? Math.round((s.converted / s.leads) * 100) : 0;
  const qualifiedRate  = s.leads ? Math.round((s.qualified / s.leads) * 100) : 0;

  return (
    <div className="group relative flex flex-col rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-magenta/50 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 rounded-t-2xl bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            <SourceIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <button
              onClick={onView}
              className="block w-full truncate text-left font-display text-base font-semibold text-brand-ink hover:text-brand-magenta"
              title={s.source}
            >
              {s.source}
            </button>
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-brand-magenta">
              {s.category}
            </p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${st.chip}`}>
            <StatusIcon size={10} className="mr-1 inline" />
            {s.status}
          </span>
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Megaphone size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Campaign</span>
            <span className="truncate text-right font-semibold text-brand-ink">{s.campaign}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <MousePointerClick size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Landing</span>
            <span className="truncate text-right font-mono text-[11px] font-semibold text-brand-ink" title={s.landingPage}>
              {s.landingPage}
            </span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <DollarSign size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">CPL</span>
            <span className="truncate text-right font-semibold text-brand-magenta">
              {s.cpl ? `$${s.cpl.toFixed(2)}` : '—'}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <MiniBox label="Leads"     value={s.leads ?? 0}     tone="purple" />
          <MiniBox label="Qualified" value={s.qualified ?? 0} tone="emerald" />
          <MiniBox label="Converted" value={s.converted ?? 0} tone="rose" />
        </div>

        <div className="mt-3 space-y-2">
          <ProgressBar label="Qualified Rate"  value={qualifiedRate}  tone="purple" />
          <ProgressBar label="Conversion Rate" value={conversionRate} tone="emerald" />
        </div>

        {/* Actions: View + Edit + Delete */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={onView}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-2 py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
            title="View details"
          >
            <Eye size={12} className="shrink-0" />
            <span className="truncate">View</span>
          </button>
          <button
            onClick={onEdit}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-2 py-2 text-xs font-semibold text-white shadow-card transition-all hover:brightness-110"
            title="Edit source"
          >
            <Pencil size={12} className="shrink-0" />
            <span className="truncate">Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-100"
            title="Delete source"
          >
            <Trash2 size={12} className="shrink-0" />
            <span className="truncate">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROW ACTIONS (for table) — View + Edit + Delete visible
   ═══════════════════════════════════════════════════════════════ */
function RowActions({ onView, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={onView}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
        title="View details"
      >
        <Eye size={12} /> View
      </button>
      <button
        onClick={onEdit}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-2.5 text-[11px] font-semibold text-white shadow-card transition-all hover:brightness-110"
        title="Edit source"
      >
        <Pencil size={12} /> Edit
      </button>
      <button
        onClick={onDelete}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-semibold text-rose-500 transition-all hover:bg-rose-100"
        title="Delete source"
      >
        <Trash2 size={12} /> Delete
      </button>
    </div>
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
   SOURCE MODAL (Create/Edit)
   ═══════════════════════════════════════════════════════════════ */
function SourceModal({ mode = 'create', initial = null, onClose, onSubmit }) {
  const seed = initial || {};
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    source: seed.source || '',
    category: seed.category || 'Google Ads',
    sourceType: seed.sourceType || 'Google Ads',
    campaign: seed.campaign || '',
    landingPage: seed.landingPage || '',
    status: seed.status || 'Active',
    cpl: seed.cpl ?? '',
    budget: seed.budget ?? '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const sourceRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => { sourceRef.current?.focus(); }, []);
  useEscape(true, () => { if (!submitting) onClose(); });
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const validate = () => {
    if (!form.source.trim()) return 'Source name is required.';
    if (!form.category) return 'Category is required.';
    if (!form.campaign.trim()) return 'Campaign is required.';
    if (form.cpl !== '' && Number(form.cpl) < 0) return 'CPL cannot be negative.';
    if (form.budget !== '' && Number(form.budget) < 0) return 'Budget cannot be negative.';
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
        cpl: Number(form.cpl) || 0,
        budget: Number(form.budget) || 0,
      });
    }, 250);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit Source' : 'Add New Source'}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Share2 size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-brand-ink">
                {isEdit ? 'Edit Source' : 'Add New Source'}
              </h3>
              <p className="text-[11px] text-brand-ink/50">
                {isEdit ? 'Update source details' : 'Register a new marketing source'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          <SectionTitle icon={Share2} label="Source Information" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              inputRef={sourceRef}
              label="Source Name *"
              value={form.source}
              onChange={(v) => { setForm({ ...form, source: v }); setError(''); }}
              placeholder="e.g. Google Ads"
              icon={Share2}
            />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                {SOURCE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Source Type</label>
              <select
                value={form.sourceType}
                onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <ModalInput
              label="Campaign *"
              value={form.campaign}
              onChange={(v) => setForm({ ...form, campaign: v })}
              placeholder="e.g. Search - CRM"
              icon={Megaphone}
            />
            <div className="md:col-span-2">
              <ModalInput
                label="Landing Page"
                value={form.landingPage}
                onChange={(v) => setForm({ ...form, landingPage: v })}
                placeholder="e.g. /landing/crm-trial"
                icon={MousePointerClick}
              />
            </div>
          </div>

          <SectionTitle icon={DollarSign} label="Cost Metrics" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              label="Cost Per Lead (USD)"
              type="number"
              value={form.cpl}
              onChange={(v) => setForm({ ...form, cpl: v })}
              placeholder="e.g. 15.50"
              icon={DollarSign}
            />
            <ModalInput
              label="Budget (USD)"
              type="number"
              value={form.budget}
              onChange={(v) => setForm({ ...form, budget: v })}
              placeholder="e.g. 5000"
              icon={Target}
            />
          </div>

          <SectionTitle icon={Zap} label="Status" />
          <div className="flex flex-wrap gap-2">
            {SOURCE_STATUSES.map((s) => {
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
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
   SOURCE DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════ */
function SourceDetailDrawer({ source: s, onClose, onEdit, onStatusChange }) {
  const st = STATUS_STYLES[s.status] || STATUS_STYLES.Draft;
  const StatusIcon = st.icon;
  const SourceIcon = CATEGORY_ICONS[s.category] || Share2;
  const conversionRate = s.leads ? Math.round((s.converted / s.leads) * 100) : 0;
  const qualifiedRate  = s.leads ? Math.round((s.qualified / s.leads) * 100) : 0;

  useEscape(true, onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Source details"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
    >
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
              <SourceIcon size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">{s.category}</p>
              <h3 className="truncate font-display text-base font-bold text-brand-ink">{s.source}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${st.chip}`}>
              <StatusIcon size={12} /> {s.status}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lilac/60 px-3 py-1.5 text-xs font-bold text-brand-purple">
              <Layers size={12} /> {s.category}
            </span>
            {s.sourceType && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mist px-3 py-1.5 text-xs font-bold text-brand-ink/70">
                <Tag size={12} /> {s.sourceType}
              </span>
            )}
            {s.campaign && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mist px-3 py-1.5 text-xs font-bold text-brand-ink/70">
                <Megaphone size={12} /> {s.campaign}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <DetailStat icon={Users}        label="Total Leads" value={s.leads ?? 0}     color="rose" />
            <DetailStat icon={CheckCircle2} label="Qualified"   value={s.qualified ?? 0} color="purple" />
            <DetailStat icon={Target}       label="Converted"   value={s.converted ?? 0} color="emerald" />
            <DetailStat icon={DollarSign}   label="CPL"         value={s.cpl ? `$${s.cpl.toFixed(2)}` : '—'} color="amber" />
          </div>

          <div className="card !p-5 space-y-3">
            <SectionTitle icon={Briefcase} label="Source Information" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow icon={Share2}            label="Source"        value={s.source} />
              <InfoRow icon={Layers}            label="Category"      value={s.category} />
              <InfoRow icon={Tag}               label="Source Type"   value={s.sourceType || '—'} />
              <InfoRow icon={Megaphone}         label="Campaign"      value={s.campaign || '—'} />
              <InfoRow icon={MousePointerClick} label="Landing Page"  value={s.landingPage || '—'} />
              <InfoRow icon={DollarSign}        label="Budget"        value={s.budget ? formatCurrency(s.budget) : '—'} />
              <InfoRow icon={Calendar}          label="Created"       value={formatDate(s.createdAt)} />
              <InfoRow icon={Clock}             label="Last Sync"     value={formatDate(s.lastSync)} />
            </div>
          </div>

          <div className="card !p-5">
            <SectionTitle icon={BarChart3} label="Rate Overview" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <RateTile label="Qualified Rate"  value={qualifiedRate}  tone="purple" />
              <RateTile label="Conversion Rate" value={conversionRate} tone="emerald" />
            </div>
          </div>

          <div className="card !p-5">
            <SectionTitle icon={Activity} label="Change Status" />
            <div className="mt-3 flex flex-wrap gap-2">
              {SOURCE_STATUSES.map((stt) => {
                const cs = STATUS_STYLES[stt];
                const SIcon = cs.icon;
                const active = s.status === stt;
                return (
                  <button
                    key={stt}
                    onClick={() => { if (!active) onStatusChange(stt); }}
                    disabled={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? `${cs.chip} ring-2 ring-brand-magenta/20 cursor-default`
                        : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                    }`}
                  >
                    <SIcon size={12} /> {stt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110"
            >
              <Pencil size={13} /> Edit Source
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Close
            </button>
          </div>
        </div>
      </div>
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
      <p className="mt-1 truncate font-display text-lg font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
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
        {hasFilters ? 'No sources match your filters' : 'No sources yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button onClick={onClear} className="font-semibold text-brand-magenta hover:underline">Clear all filters</button>
        ) : (
          'Add your first lead source to start tracking.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onCreate}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={16} /> Add First Source
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