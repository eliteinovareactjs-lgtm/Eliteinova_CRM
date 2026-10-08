// src/pages/marketing/SocialMedia.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, Filter, ChevronDown, Eye, Pencil,
  Trash2, Copy, AlertCircle, CheckCircle2, X, Users,
  Clock, Zap, Target, TrendingUp, Calendar, Globe,
  Inbox, Download, Grid3x3, List,
  Activity, Megaphone, Share2, BarChart3, Heart,
  MessageSquare, Radio,
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

const YoutubeIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
  </svg>
);

const LinkedinIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3v9zM6.5 8.3a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM19 19h-3v-4.7c0-1.1-.4-1.9-1.4-1.9-.8 0-1.2.5-1.4 1-.1.2-.1.5-.1.7V19h-3v-9h3v1.3a3 3 0 0 1 2.7-1.5c2 0 3.4 1.3 3.4 4.1V19z"/>
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
const PLATFORMS = ['Facebook', 'Instagram', 'YouTube', 'LinkedIn', 'WhatsApp'];

const PLATFORM_ICONS = {
  Facebook:  FacebookIcon,
  Instagram: InstagramIcon,
  YouTube:   YoutubeIcon,
  LinkedIn:  LinkedinIcon,
  WhatsApp:  WhatsappIcon,
};

const PLATFORM_THEMES = {
  Facebook:  { fg: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',   ring: 'ring-blue-200'   },
  Instagram: { fg: 'text-pink-600',    bg: 'bg-pink-50',    border: 'border-pink-200',   ring: 'ring-pink-200'   },
  YouTube:   { fg: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',    ring: 'ring-red-200'    },
  LinkedIn:  { fg: 'text-sky-700',     bg: 'bg-sky-50',     border: 'border-sky-200',    ring: 'ring-sky-200'    },
  WhatsApp:  { fg: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-200' },
};

const POST_STATUSES = ['Active', 'Boosted', 'Paused', 'Archived'];

const STATUS_STYLES = {
  Active:   { chip: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: Zap },
  Boosted:  { chip: 'bg-violet-100 text-brand-purple border-violet-200', icon: TrendingUp },
  Paused:   { chip: 'bg-amber-100 text-amber-600 border-amber-200', icon: Clock },
  Archived: { chip: 'bg-slate-100 text-slate-600 border-slate-200', icon: Inbox },
};

const STORAGE_KEY = 'social:marketing';
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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

/* ═══════════════════════════════════════════════════════════════
   SEED DATA
   ═══════════════════════════════════════════════════════════════ */
const SEED_POSTS = [
  { id: uid('post'), platform: 'Facebook',  campaign: 'Summer Sale 2024',    post: 'Summer Sale Carousel',       leads: 45, qualified: 12, converted: 4, engagement: 4.5,  enquiries: 18, status: 'Boosted',  createdAt: new Date('2024-06-01').toISOString() },
  { id: uid('post'), platform: 'Facebook',  campaign: 'Brand Awareness',     post: 'Testimonial Video',          leads: 38, qualified: 10, converted: 3, engagement: 4.2,  enquiries: 15, status: 'Active',   createdAt: new Date('2024-06-05').toISOString() },
  { id: uid('post'), platform: 'Instagram', campaign: 'Reel Campaign',       post: 'Reel - Product Demo',        leads: 32, qualified: 8,  converted: 2, engagement: 5.2,  enquiries: 12, status: 'Boosted',  createdAt: new Date('2024-06-03').toISOString() },
  { id: uid('post'), platform: 'Instagram', campaign: 'Festival Promo',      post: 'Diwali Special Story',       leads: 28, qualified: 7,  converted: 2, engagement: 6.1,  enquiries: 10, status: 'Active',   createdAt: new Date('2024-06-07').toISOString() },
  { id: uid('post'), platform: 'YouTube',   campaign: 'Product Demo',        post: 'Full Demo Walkthrough',      leads: 40, qualified: 15, converted: 6, engagement: 2.1,  enquiries: 20, status: 'Active',   createdAt: new Date('2024-06-02').toISOString() },
  { id: uid('post'), platform: 'LinkedIn',  campaign: 'B2B Outreach',        post: 'Case Study Article',         leads: 60, qualified: 25, converted: 8, engagement: 3.8,  enquiries: 22, status: 'Boosted',  createdAt: new Date('2024-06-04').toISOString() },
  { id: uid('post'), platform: 'WhatsApp',  campaign: 'Broadcast',           post: 'Promo Broadcast Message',    leads: 150, qualified: 40, converted: 12, engagement: 12,  enquiries: 55, status: 'Active',   createdAt: new Date('2024-06-06').toISOString() },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function SocialMedia() {
  const { user: _user } = useAuth();

  const [posts, setPosts] = useState(() => loadState(SEED_POSTS));
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [platformOpen, setPlatformOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toastTimerRef = useRef(null);

  useEffect(() => { saveState(posts); }, [posts]);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2400);
  };

  /* ── TABS ── */
  const TABS = [
    { key: 'all',             label: 'All Platforms',   icon: Share2 },
    { key: 'Facebook',        label: 'Facebook',        icon: FacebookIcon },
    { key: 'Instagram',       label: 'Instagram',       icon: InstagramIcon },
    { key: 'YouTube',         label: 'YouTube',         icon: YoutubeIcon },
    { key: 'LinkedIn',        label: 'LinkedIn',        icon: LinkedinIcon },
    { key: 'WhatsApp',        label: 'WhatsApp',        icon: WhatsappIcon },
    { key: 'social-leads',    label: 'Social Leads',    icon: Users },
  ];

  const tabCounts = useMemo(() => {
    const map = { all: posts.length, 'social-leads': posts.length };
    PLATFORMS.forEach((p) => {
      map[p] = posts.filter((x) => x.platform === p).length;
    });
    return map;
  }, [posts]);

  /* ── FILTERED ── */
  const filtered = useMemo(() => {
    let list = [...posts];

    if (activeTab !== 'all' && activeTab !== 'social-leads') {
      list = list.filter((p) => p.platform === activeTab);
    }
    if (platformFilter !== 'All') list = list.filter((p) => p.platform === platformFilter);
    if (statusFilter !== 'All') list = list.filter((p) => p.status === statusFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        `${p.platform} ${p.campaign} ${p.post}`
          .toLowerCase()
          .includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [posts, activeTab, platformFilter, statusFilter, searchQuery]);

  /* ── SUMMARY ── */
  const summary = useMemo(() => {
    const totalLeads      = posts.reduce((s, p) => s + (p.leads || 0), 0);
    const totalQualified  = posts.reduce((s, p) => s + (p.qualified || 0), 0);
    const totalConverted  = posts.reduce((s, p) => s + (p.converted || 0), 0);
    const avgEngagement   = posts.length > 0
      ? (posts.reduce((s, p) => s + (p.engagement || 0), 0) / posts.length)
      : 0;
    return {
      total: posts.length,
      totalLeads, totalQualified, totalConverted, avgEngagement,
    };
  }, [posts]);

  /* ── PER-PLATFORM STATS ── */
  const platformStats = useMemo(() => {
    return PLATFORMS.map((p) => {
      const list = posts.filter((x) => x.platform === p);
      const leads     = list.reduce((s, x) => s + (x.leads || 0), 0);
      const qualified = list.reduce((s, x) => s + (x.qualified || 0), 0);
      const converted = list.reduce((s, x) => s + (x.converted || 0), 0);
      const engagement = list.length > 0
        ? (list.reduce((s, x) => s + (x.engagement || 0), 0) / list.length)
        : 0;
      return { platform: p, leads, qualified, converted, engagement, postCount: list.length };
    });
  }, [posts]);

  /* ── HANDLERS ── */
  const handleCreate = (data) => {
    const newPost = {
      id: uid('post'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setShowModal(false);
    showToast(`Post "${data.post}" added`);
  };

  const handleEdit = (id, updates) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    setEditing(null);
    setShowModal(false);
    showToast('Post updated');
  };

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
    if (viewing?.id === id) setViewing(null);
    showToast('Post deleted', 'error');
  };

  const handleDuplicate = (post) => {
    const copy = {
      ...post,
      id: uid('post'),
      post: `${post.post} (Copy)`,
      leads: 0, qualified: 0, converted: 0, enquiries: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [copy, ...prev]);
    showToast('Post duplicated');
  };

  const handleStatusChange = (id, newStatus) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    setViewing((v) => (v && v.id === id ? { ...v, status: newStatus } : v));
    showToast(`Status → ${newStatus}`);
  };

  const handleConnect = (platform) => {
    showToast(`${platform} auto-capture enabled`);
  };

  const handleExport = () => {
    if (filtered.length === 0) { showToast('No posts to export', 'error'); return; }
    const rows = [
      ['Platform', 'Campaign', 'Post/Content', 'Leads', 'Engagement %', 'Enquiries', 'Qualified', 'Converted', 'Status', 'Created'],
      ...filtered.map((p) => [
        p.platform, p.campaign, p.post, p.leads, p.engagement, p.enquiries, p.qualified, p.converted, p.status, p.createdAt,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-media-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} posts`);
  };

  const hasFilters = Boolean(searchQuery) || platformFilter !== 'All' || statusFilter !== 'All' || (activeTab !== 'all' && activeTab !== 'social-leads');
  const clearFilters = () => {
    setSearchQuery('');
    setPlatformFilter('All');
    setStatusFilter('All');
    setActiveTab('all');
  };

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (post) => { setEditing(post); setShowModal(true); };
  const openView = (post) => setViewing(post);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-40">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Social Media</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Globe size={13} className="text-brand-magenta" />
              Track leads generated across social platforms
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
              onClick={openCreate}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <Plus size={14} className="transition-transform group-hover:rotate-90" /> Add Post
            </button>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Social Overview</p>
              <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <KpiCard icon={Share2}       label="Platforms"    value={PLATFORMS.length}         sub="Connected channels" color="purple"  delay={0} />
            <KpiCard icon={Users}        label="Social Leads" value={summary.totalLeads}       sub="Across platforms"   color="emerald" delay={40} />
            <KpiCard icon={CheckCircle2} label="Qualified"    value={summary.totalQualified}   sub="Ready to convert"   color="purple"  delay={80} />
            <KpiCard icon={Target}       label="Converted"    value={summary.totalConverted}   sub="Won from social"    color="emerald" delay={120} />
            <KpiCard icon={Heart}        label="Avg. Engagement" value={`${summary.avgEngagement.toFixed(1)}%`} sub="Across posts" color="rose" delay={160} />
          </div>
        </div>

        {/* PLATFORM CARDS */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Platform Performance</p>
              <h2 className="font-display text-sm font-semibold text-brand-ink">By Channel</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            {platformStats.map((stat, i) => {
              const Icon = PLATFORM_ICONS[stat.platform];
              const theme = PLATFORM_THEMES[stat.platform];
              return (
                <button
                  key={stat.platform}
                  onClick={() => setActiveTab(stat.platform)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/30 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 hover:-translate-y-1.5 animate-fade-slide-in ${theme.border} hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.35)]`}
                >
                  <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-magenta/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 flex w-full items-start justify-between gap-2">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.bg} ${theme.fg} ${theme.border} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon size={18} />
                    </span>
                    <span className="rounded-full bg-brand-mist px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink/60">
                      {stat.postCount} posts
                    </span>
                  </div>

                  <div className="relative z-10 w-full">
                    <p className="font-display text-sm font-bold text-brand-ink">{stat.platform}</p>
                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                      <div>
                        <p className={`font-display text-base font-bold tabular-nums ${theme.fg}`}>{stat.leads}</p>
                        <p className="font-mono text-[8px] uppercase tracking-wider text-brand-ink/40">Leads</p>
                      </div>
                      <div>
                        <p className="font-display text-base font-bold tabular-nums text-brand-purple">{stat.qualified}</p>
                        <p className="font-mono text-[8px] uppercase tracking-wider text-brand-ink/40">Qual.</p>
                      </div>
                      <div>
                        <p className="font-display text-base font-bold tabular-nums text-emerald-600">{stat.converted}</p>
                        <p className="font-mono text-[8px] uppercase tracking-wider text-brand-ink/40">Conv.</p>
                      </div>
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                      <Heart size={9} /> {stat.engagement.toFixed(1)}% engagement
                    </p>
                  </div>
                </button>
              );
            })}
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
              placeholder="Search by platform, campaign, post…"
              className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac">
                <X size={14} className="text-brand-ink/50" />
              </button>
            )}
          </div>

          <DropdownFilter
            label="Platform" icon={Globe} value={platformFilter}
            options={['All', ...PLATFORMS]}
            open={platformOpen}
            onToggle={() => { setPlatformOpen((s) => !s); setStatusOpen(false); }}
            onChange={(v) => { setPlatformFilter(v); setPlatformOpen(false); }}
          />

          <DropdownFilter
            label="Status" icon={Filter} value={statusFilter}
            options={['All', ...POST_STATUSES]}
            open={statusOpen}
            onToggle={() => { setStatusOpen((s) => !s); setPlatformOpen(false); }}
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
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={openCreate} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 pb-40 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onView={() => openView(p)}
                onEdit={() => openEdit(p)}
              />
            ))}
          </div>
        ) : (
          /* ── PERFECT LIST VIEW ── */
          <div className="card !p-0 overflow-hidden">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[10px] font-bold uppercase tracking-wider text-brand-ink/60">
                <tr>
                  <th className="w-[16%] px-3 py-3">Platform</th>
                  <th className="w-[18%] px-3 py-3">Campaign</th>
                  <th className="w-[9%] px-3 py-3 text-right">Leads</th>
                  <th className="w-[11%] px-3 py-3">Engagement</th>
                  <th className="w-[10%] px-3 py-3 text-right">Enquiries</th>
                  <th className="w-[10%] px-3 py-3 text-right">Qualified</th>
                  <th className="w-[10%] px-3 py-3 text-right">Conversions</th>
                  <th className="w-[16%] px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-lilac/40">
                {filtered.map((p) => {
                  const PlatformIcon = PLATFORM_ICONS[p.platform] || Globe;
                  const theme = PLATFORM_THEMES[p.platform] || {};
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-brand-mist/30">
                      {/* Platform */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${theme.bg} ${theme.fg} ${theme.border}`}>
                            <PlatformIcon size={12} />
                          </span>
                          <div className="min-w-0">
                            <button
                              onClick={() => openView(p)}
                              className="block truncate text-left text-xs font-semibold text-brand-ink hover:text-brand-magenta"
                              title={p.platform}
                            >
                              {p.platform}
                            </button>
                            <p className="truncate font-mono text-[9px] text-brand-ink/50">
                              {formatShortDate(p.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Campaign */}
                      <td className="px-3 py-3">
                        <p className="truncate text-xs text-brand-ink/70" title={p.campaign}>{p.campaign}</p>
                      </td>

                      {/* Leads */}
                      <td className="px-3 py-3 text-right text-xs font-semibold tabular-nums">{p.leads}</td>

                      {/* Engagement */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <Heart size={10} /> {p.engagement}%
                        </span>
                      </td>

                      {/* Enquiries */}
                      <td className="px-3 py-3 text-right text-xs tabular-nums">{p.enquiries}</td>

                      {/* Qualified */}
                      <td className="px-3 py-3 text-right text-xs tabular-nums text-brand-purple font-medium">{p.qualified}</td>

                      {/* Conversions */}
                      <td className="px-3 py-3 text-right text-xs tabular-nums text-emerald-600 font-medium">{p.converted}</td>

                      {/* Actions - Centered */}
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openView(p)}
                            className="flex h-7 items-center gap-1 rounded-lg border border-brand-lilac bg-white px-2 text-[10px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
                            title="View details"
                          >
                            <Eye size={11} /> View
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="flex h-7 items-center gap-1 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-2 text-[10px] font-semibold text-white shadow-card transition-all hover:brightness-110"
                            title="Edit post"
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
          <PostModal
            mode={editing ? 'edit' : 'create'}
            initial={editing}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSubmit={(data) => (editing ? handleEdit(editing.id, data) : handleCreate(data))}
          />
        )}

        {viewing && (
          <PostDetailDrawer
            post={viewing}
            onClose={() => setViewing(null)}
            onEdit={() => { const p = viewing; setViewing(null); openEdit(p); }}
            onDuplicate={() => { handleDuplicate(viewing); setViewing(null); }}
            onStatusChange={(s) => handleStatusChange(viewing.id, s)}
            onConnect={handleConnect}
            onDelete={() => { const p = viewing; setViewing(null); setConfirmDelete(p); }}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title={`Delete "${confirmDelete.post}"?`}
            message="This will permanently delete this post. This action cannot be undone."
            confirmLabel="Delete Post"
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
function KpiCard({ icon: Icon, label, value, sub, color = 'purple', delay = 0 }) {
  const numeric = typeof value === 'number';
  const displayValue = useAnimatedCount(numeric ? value : 0);
  const showValue = numeric ? displayValue : value;

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
        <p className={`truncate font-display text-2xl font-bold leading-tight tabular-nums ${t.valueColor}`}>{showValue}</p>
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
    const to = Number(target) || 0;
    if (to <= 0) { setDisplay(0); return undefined; }
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

/* ═══════════════════════════════════════════════════════════════
   DROPDOWN FILTER
   ═══════════════════════════════════════════════════════════════ */
function DropdownFilter({ label, icon: Icon, value, options, open, onToggle, onChange }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        {label}: <span className="max-w-[100px] truncate font-semibold text-brand-magenta">{value}</span>
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
   POST CARD (GRID)
   ═══════════════════════════════════════════════════════════════ */
function PostCard({ post: p, onView, onEdit }) {
  const st = STATUS_STYLES[p.status] || STATUS_STYLES.Active;
  const StatusIcon = st.icon;
  const PlatformIcon = PLATFORM_ICONS[p.platform] || Globe;
  const theme = PLATFORM_THEMES[p.platform] || {};
  const conversionRate = p.leads ? Math.round((p.converted / p.leads) * 100) : 0;

  return (
    <div className="group relative flex flex-col rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-magenta/50 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 rounded-t-2xl bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 ${theme.bg} ${theme.fg} ${theme.border} shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <PlatformIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold text-brand-ink">{p.platform}</p>
            <button
              onClick={onView}
              className="block w-full truncate text-left text-[11px] font-semibold text-brand-magenta hover:underline"
              title={p.post}
            >
              {p.post}
            </button>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${st.chip}`}>
            <StatusIcon size={10} className="mr-1 inline" />
            {p.status}
          </span>
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Megaphone size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Campaign</span>
            <span className="truncate text-right font-semibold text-brand-ink">{p.campaign}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Heart size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Engagement</span>
            <span className="truncate text-right font-semibold text-emerald-600">{p.engagement}%</span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <MessageSquare size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Enquiries</span>
            <span className="truncate text-right font-semibold text-brand-ink">{p.enquiries}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Calendar size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Published</span>
            <span className="truncate text-right font-semibold text-brand-ink">{formatShortDate(p.createdAt)}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <MiniBox label="Leads"     value={p.leads}     tone="purple" />
          <MiniBox label="Qualified" value={p.qualified} tone="emerald" />
          <MiniBox label="Converted" value={p.converted} tone="rose" />
        </div>

        <div className="mt-3">
          <ProgressBar label="Conversion Rate" value={conversionRate} tone="emerald" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onView}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-2 py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          >
            <Eye size={12} className="shrink-0" />
            <span className="truncate">View</span>
          </button>
          <button
            onClick={onEdit}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-2 py-2 text-xs font-semibold text-white shadow-card transition-all hover:brightness-110"
          >
            <Pencil size={12} className="shrink-0" />
            <span className="truncate">Edit</span>
          </button>
        </div>
      </div>
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
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
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
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="font-mono uppercase tracking-wider text-brand-ink/50">{label}</span>
        <span className={`font-semibold tabular-nums ${t.text}`}>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${t.bar} transition-all duration-1000`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   POST MODAL (Create/Edit)
   ═══════════════════════════════════════════════════════════════ */
function PostModal({ mode = 'create', initial = null, onClose, onSubmit }) {
  const seed = initial || {};
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    platform: seed.platform || 'Facebook',
    campaign: seed.campaign || '',
    post: seed.post || '',
    status: seed.status || 'Active',
    leads: seed.leads || 0,
    qualified: seed.qualified || 0,
    converted: seed.converted || 0,
    engagement: seed.engagement || 0,
    enquiries: seed.enquiries || 0,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const postRef = useRef(null);
  const submitTimerRef = useRef(null);

  useEffect(() => { postRef.current?.focus(); }, []);
  useEffect(() => () => { if (submitTimerRef.current) clearTimeout(submitTimerRef.current); }, []);

  const validate = () => {
    if (!form.post.trim()) return 'Post/content title is required.';
    if (!form.campaign.trim()) return 'Campaign is required.';
    if (Number(form.engagement) < 0 || Number(form.engagement) > 100) return 'Engagement must be between 0 and 100.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    submitTimerRef.current = setTimeout(() => {
      setSubmitting(false);
      onSubmit({
        ...form,
        leads: Number(form.leads) || 0,
        qualified: Number(form.qualified) || 0,
        converted: Number(form.converted) || 0,
        enquiries: Number(form.enquiries) || 0,
        engagement: Number(form.engagement) || 0,
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Globe size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-brand-ink">
                {isEdit ? 'Edit Post' : 'Add New Post'}
              </h3>
              <p className="text-[11px] text-brand-ink/50">
                {isEdit ? 'Update post details' : 'Track a new social post'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          <SectionTitle icon={Globe} label="Platform & Campaign" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Platform *</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <ModalInput
              label="Campaign *"
              value={form.campaign}
              onChange={(v) => { setForm({ ...form, campaign: v }); setError(''); }}
              placeholder="e.g. Summer Sale 2024"
              icon={Megaphone}
            />
            <div className="md:col-span-2">
              <ModalInput
                inputRef={postRef}
                label="Post / Content *"
                value={form.post}
                onChange={(v) => { setForm({ ...form, post: v }); setError(''); }}
                placeholder="e.g. Summer Sale Carousel"
                icon={MessageSquare}
              />
            </div>
          </div>

          <SectionTitle icon={BarChart3} label="Performance Metrics" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <ModalInput label="Leads Generated" type="number" value={form.leads} onChange={(v) => setForm({ ...form, leads: v })} placeholder="0" icon={Users} />
            <ModalInput label="Qualified Leads" type="number" value={form.qualified} onChange={(v) => setForm({ ...form, qualified: v })} placeholder="0" icon={CheckCircle2} />
            <ModalInput label="Conversions" type="number" value={form.converted} onChange={(v) => setForm({ ...form, converted: v })} placeholder="0" icon={Target} />
            <ModalInput label="Enquiries" type="number" value={form.enquiries} onChange={(v) => setForm({ ...form, enquiries: v })} placeholder="0" icon={MessageSquare} />
            <ModalInput label="Engagement (%)" type="number" value={form.engagement} onChange={(v) => setForm({ ...form, engagement: v })} placeholder="0" icon={Heart} />
          </div>

          <SectionTitle icon={Zap} label="Status" />
          <div className="flex flex-wrap gap-2">
            {POST_STATUSES.map((s) => {
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
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Post'}
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
   POST DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════ */
function PostDetailDrawer({ post: p, onClose, onEdit, onDuplicate, onStatusChange, onConnect, onDelete }) {
  const st = STATUS_STYLES[p.status] || STATUS_STYLES.Active;
  const StatusIcon = st.icon;
  const PlatformIcon = PLATFORM_ICONS[p.platform] || Globe;
  const theme = PLATFORM_THEMES[p.platform] || {};
  const conversionRate = p.leads ? Math.round((p.converted / p.leads) * 100) : 0;
  const qualifiedRate  = p.leads ? Math.round((p.qualified / p.leads) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 ${theme.bg} ${theme.fg} ${theme.border} shadow-sm`}>
              <PlatformIcon size={18} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">{p.platform}</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{p.post}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${st.chip}`}>
              <StatusIcon size={12} /> {p.status}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${theme.bg} ${theme.fg} ${theme.border}`}>
              <PlatformIcon size={12} /> {p.platform}
            </span>
            {p.campaign && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mist px-3 py-1.5 text-xs font-bold text-brand-ink/70">
                <Megaphone size={12} /> {p.campaign}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <DetailStat icon={Users}        label="Total Leads" value={p.leads}     color="rose" />
            <DetailStat icon={CheckCircle2} label="Qualified"   value={p.qualified} color="purple" />
            <DetailStat icon={Target}       label="Converted"   value={p.converted} color="emerald" />
            <DetailStat icon={Heart}        label="Engagement"  value={`${p.engagement}%`} color="amber" />
          </div>

          <div className="card !p-5 space-y-3">
            <SectionTitle icon={Activity} label="Post Information" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow icon={Globe}         label="Platform"     value={p.platform} />
              <InfoRow icon={Megaphone}     label="Campaign"     value={p.campaign} />
              <InfoRow icon={MessageSquare} label="Post/Content" value={p.post} />
              <InfoRow icon={MessageSquare} label="Enquiries"    value={p.enquiries} />
              <InfoRow icon={Calendar}      label="Published"    value={formatDate(p.createdAt)} />
              <InfoRow icon={Activity}      label="Status"       value={p.status} />
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
            <SectionTitle icon={Zap} label="Change Status" />
            <div className="mt-3 flex flex-wrap gap-2">
              {POST_STATUSES.map((stt) => {
                const cs = STATUS_STYLES[stt];
                const SIcon = cs.icon;
                const active = p.status === stt;
                return (
                  <button
                    key={stt}
                    onClick={() => onStatusChange(stt)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? `${cs.chip} ring-2 ring-brand-magenta/20`
                        : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                    }`}
                  >
                    <SIcon size={12} /> {stt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card !p-5">
            <SectionTitle icon={Radio} label="Actions" />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Pencil size={12} /> Edit Post
              </button>
              <button
                onClick={onDuplicate}
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-brand-purple hover:bg-violet-100"
              >
                <Copy size={12} /> Duplicate
              </button>
              <button
                onClick={() => onConnect(p.platform)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
              >
                <Radio size={12} /> Connect {p.platform}
              </button>
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Close
          </button>
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
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
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
        {hasFilters ? 'No posts match your filters' : 'No social posts yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button onClick={onClear} className="font-semibold text-brand-magenta hover:underline">Clear all filters</button>
        ) : (
          'Add your first social post to start tracking.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onCreate}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={16} /> Add First Post
        </button>
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
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
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}