// src/pages/marketing/LeadGeneration.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, Filter, ChevronDown, MoreVertical, Eye, Pencil,
  Trash2, Check, AlertCircle, CheckCircle2, XCircle, X,
  Users, Sparkles, Clock, Zap, Target, TrendingUp, TrendingDown,
  Calendar, Globe, MapPin, Mail, Phone, Briefcase, Tag, Hash,
  UserPlus, Layers, Flame, Inbox, Download, Grid3x3, List,
  ArrowRight, Activity, User, DollarSign, Star, MessageSquare,
  Megaphone, MousePointerClick, Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   INLINE BRAND ICONS (lucide-react does NOT ship these)
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

const WhatsappIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.5 3.5A10.5 10.5 0 0 0 3.3 16.3L2 22l5.9-1.5a10.5 10.5 0 0 0 12.6-17zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-3.5.9.9-3.4-.2-.3A8 8 0 1 1 12 20zm4.5-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.1-.3.2-.5 0s-1-.4-1.9-1.2c-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.1-.3 0-.5s-.6-1.3-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.5 1.1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3z"/>
  </svg>
);

const LinkedinIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3v9zM6.5 8.3a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM19 19h-3v-4.7c0-1.1-.4-1.9-1.4-1.9-.8 0-1.2.5-1.4 1-.1.2-.1.5-.1.7V19h-3v-9h3v1.3a3 3 0 0 1 2.7-1.5c2 0 3.4 1.3 3.4 4.1V19z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const LEAD_SOURCES = [
  'Website', 'Landing Page', 'Google Ads', 'Meta Ads', 'Facebook',
  'Instagram', 'YouTube', 'WhatsApp', 'LinkedIn', 'Referral',
  'Offline Campaign', 'Event', 'Promotional Campaign',
];

const LEAD_STATUSES = ['New', 'Pending', 'Qualified', 'Converted', 'Lost'];

const STATUS_STYLES = {
  New:       { chip: 'bg-blue-100 text-blue-600 border-blue-200',    icon: Sparkles },
  Pending:   { chip: 'bg-amber-100 text-amber-600 border-amber-200', icon: Clock },
  Qualified: { chip: 'bg-violet-100 text-brand-purple border-violet-200', icon: CheckCircle2 },
  Converted: { chip: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: Target },
  Lost:      { chip: 'bg-rose-100 text-brand-magenta border-rose-200', icon: XCircle },
};

const PRIORITIES = ['High', 'Medium', 'Low'];

const PRIORITY_STYLES = {
  High:   'bg-rose-50 text-rose-600 border-rose-200',
  Medium: 'bg-amber-50 text-amber-600 border-amber-200',
  Low:    'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const SOURCE_ICONS = {
  'Website':              Globe,
  'Landing Page':         MousePointerClick,
  'Google Ads':           Target,
  'Meta Ads':             Megaphone,
  'Facebook':             FacebookIcon,
  'Instagram':            InstagramIcon,
  'YouTube':              YoutubeIcon,
  'WhatsApp':             WhatsappIcon,
  'LinkedIn':             LinkedinIcon,
  'Referral':             Users,
  'Offline Campaign':     MapPin,
  'Event':                Star,
  'Promotional Campaign': Megaphone,
};

const STORAGE_KEY = 'leads:marketing';
const LEAD_COUNTER_KEY = 'leads:marketing:counter';
const LEAD_COUNTER_BASE = 1034; // seeds end at L-1034; next is L-1035

/* CSV formula-injection guard */
const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

/* Local-timezone YYYY-MM-DD (fixes IST users seeing "yesterday") */
const todayISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset(); // minutes west of UTC
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const normalizeDateKey = (val) => {
  if (!val) return '';
  const s = String(val);
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  // Convert timestamp → local date string
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

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

/* Stable, monotonic lead ID generation (safe across deletes) */
const peekCounter = () => {
  try {
    const raw = localStorage.getItem(LEAD_COUNTER_KEY);
    const n = Number(raw);
    if (Number.isFinite(n) && n >= LEAD_COUNTER_BASE) return n;
  } catch { /* ignore */ }
  return LEAD_COUNTER_BASE;
};

const nextLeadId = () => {
  const cur = peekCounter();
  const next = cur + 1;
  try { localStorage.setItem(LEAD_COUNTER_KEY, String(next)); } catch { /* ignore */ }
  return `L-${next}`;
};

/* Ensure counter is at least as high as any existing lead ID (first-run safety) */
const syncCounterWithLeads = (leads) => {
  try {
    const maxExisting = leads.reduce((max, l) => {
      const m = /^L-(\d+)$/.exec(l.id || '');
      const n = m ? Number(m[1]) : 0;
      return n > max ? n : max;
    }, LEAD_COUNTER_BASE);
    const current = peekCounter();
    if (maxExisting > current) {
      localStorage.setItem(LEAD_COUNTER_KEY, String(maxExisting));
    }
  } catch { /* ignore */ }
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
const SEED_LEADS = [
  { id: 'L-1023', name: 'John Doe',      mobile: '9876543210', email: 'john@example.com',   source: 'Google Ads',       campaign: 'Search - CRM',     project: 'Eliteinova CRM',       city: 'Mumbai',    status: 'New',       priority: 'High',   notes: 'Downloaded pricing sheet.',  createdAt: todayISO(),   assignedTo: 'John Doe' },
  { id: 'L-1024', name: 'Sarah Smith',   mobile: '9876543211', email: 'sarah@example.com',  source: 'Meta Ads',         campaign: 'Summer Sale',      project: 'Eliteinova Matrimony', city: 'Pune',      status: 'Qualified', priority: 'Medium', notes: 'Interested in premium plan.', createdAt: todayISO(),   assignedTo: 'Sarah Smith' },
  { id: 'L-1025', name: 'Raj Patel',     mobile: '9876543212', email: 'raj@example.com',    source: 'Website',          campaign: 'Organic',          project: 'Eliteinova CRM',       city: 'Bengaluru', status: 'Converted', priority: 'High',   notes: 'Converted via demo call.',    createdAt: '2024-06-14', assignedTo: 'Raj Patel' },
  { id: 'L-1026', name: 'Emily Chen',    mobile: '9876543213', email: 'emily@example.com',  source: 'WhatsApp',         campaign: 'Broadcast',        project: 'Eliteinova Matrimony', city: 'Delhi',     status: 'Lost',      priority: 'Low',    notes: 'Chose competitor.',           createdAt: '2024-06-13', assignedTo: 'Emily Chen' },
  { id: 'L-1027', name: 'Arjun Mehta',   mobile: '9876543214', email: 'arjun@example.com',  source: 'LinkedIn',         campaign: 'B2B Outreach',     project: 'Eliteinova CRM',       city: 'Hyderabad', status: 'Pending',   priority: 'Medium', notes: 'Awaiting call back.',         createdAt: '2024-06-12', assignedTo: 'John Doe' },
  { id: 'L-1028', name: 'Priya Sharma',  mobile: '9876543215', email: 'priya@example.com',  source: 'Instagram',        campaign: 'Reel Campaign',    project: 'Eliteinova Matrimony', city: 'Chennai',   status: 'New',       priority: 'High',   notes: 'DM enquiry.',                 createdAt: todayISO(),   assignedTo: 'Sarah Smith' },
  { id: 'L-1029', name: 'Ravi Kumar',    mobile: '9876543216', email: 'ravi@example.com',   source: 'Referral',         campaign: 'Partner Drive',    project: 'Eliteinova CRM',       city: 'Kolkata',   status: 'Qualified', priority: 'High',   notes: 'Warm referral.',              createdAt: '2024-06-11', assignedTo: 'Raj Patel' },
  { id: 'L-1030', name: 'Neha Singh',    mobile: '9876543217', email: 'neha@example.com',   source: 'Facebook',         campaign: 'Brand Awareness',  project: 'Eliteinova Matrimony', city: 'Jaipur',    status: 'Pending',   priority: 'Medium', notes: 'Requested callback.',         createdAt: '2024-06-10', assignedTo: 'John Doe' },
  { id: 'L-1031', name: 'Vikram Rao',    mobile: '9876543218', email: 'vikram@example.com', source: 'YouTube',          campaign: 'Product Demo',     project: 'Eliteinova CRM',       city: 'Noida',     status: 'New',       priority: 'Low',    notes: 'Watched full demo.',          createdAt: '2024-06-09', assignedTo: 'Sarah Smith' },
  { id: 'L-1032', name: 'Ananya Iyer',   mobile: '9876543219', email: 'ananya@example.com', source: 'Landing Page',     campaign: 'Free Trial',       project: 'Eliteinova CRM',       city: 'Ahmedabad', status: 'Converted', priority: 'High',   notes: 'Signed up for annual plan.',  createdAt: '2024-06-08', assignedTo: 'Emily Chen' },
  { id: 'L-1033', name: 'Karan Malhotra',mobile: '9876543220', email: 'karan@example.com',  source: 'Offline Campaign', campaign: 'Mumbai Expo',      project: 'Eliteinova Matrimony', city: 'Mumbai',    status: 'Pending',   priority: 'Medium', notes: 'Met at expo booth.',          createdAt: '2024-06-07', assignedTo: 'Raj Patel' },
  { id: 'L-1034', name: 'Divya Nair',    mobile: '9876543221', email: 'divya@example.com',  source: 'Event',            campaign: 'Matrimony Meetup', project: 'Eliteinova Matrimony', city: 'Kochi',     status: 'Qualified', priority: 'High',   notes: 'Attended meetup.',            createdAt: '2024-06-06', assignedTo: 'Sarah Smith' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function LeadGeneration() {
  const { user } = useAuth();

  const [leads, setLeads] = useState(() => loadState(SEED_LEADS));
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { saveState(leads); }, [leads]);

  /* Keep ID counter ahead of any existing lead (first-run / legacy safety) */
  useEffect(() => { syncCounterWithLeads(leads); }, [leads]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const tabCounts = useMemo(() => {
    const today = todayISO();
    return {
      all:       leads.length,
      today:     leads.filter((l) => normalizeDateKey(l.createdAt) === today).length,
      new:       leads.filter((l) => l.status === 'New').length,
      pending:   leads.filter((l) => l.status === 'Pending').length,
      qualified: leads.filter((l) => l.status === 'Qualified').length,
      converted: leads.filter((l) => l.status === 'Converted').length,
      lost:      leads.filter((l) => l.status === 'Lost').length,
    };
  }, [leads]);

  const TABS = [
    { key: 'all',       label: 'All Marketing Leads', icon: Users },
    { key: 'today',     label: "Today's Leads",       icon: Sparkles },
    { key: 'new',       label: 'New Leads',           icon: Zap },
    { key: 'pending',   label: 'Pending Leads',       icon: Clock },
    { key: 'qualified', label: 'Qualified Leads',     icon: CheckCircle2 },
    { key: 'converted', label: 'Converted Leads',     icon: Target },
    { key: 'lost',      label: 'Lost Leads',          icon: XCircle },
  ];

  const campaignOptions = useMemo(() => {
    const set = new Set(leads.map((l) => l.campaign).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [leads]);

  /* Reset campaignFilter if the option disappears */
  useEffect(() => {
    if (campaignFilter !== 'All' && !campaignOptions.includes(campaignFilter)) {
      setCampaignFilter('All');
    }
  }, [campaignOptions, campaignFilter]);

  const filtered = useMemo(() => {
    let list = [...leads];
    const today = todayISO();

    if (activeTab === 'today') list = list.filter((l) => normalizeDateKey(l.createdAt) === today);
    else if (activeTab === 'new') list = list.filter((l) => l.status === 'New');
    else if (activeTab === 'pending') list = list.filter((l) => l.status === 'Pending');
    else if (activeTab === 'qualified') list = list.filter((l) => l.status === 'Qualified');
    else if (activeTab === 'converted') list = list.filter((l) => l.status === 'Converted');
    else if (activeTab === 'lost') list = list.filter((l) => l.status === 'Lost');

    if (sourceFilter !== 'All') list = list.filter((l) => l.source === sourceFilter);
    if (statusFilter !== 'All') list = list.filter((l) => l.status === statusFilter);
    if (campaignFilter !== 'All') list = list.filter((l) => l.campaign === campaignFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) =>
        `${l.name} ${l.id} ${l.mobile} ${l.email} ${l.city} ${l.source} ${l.campaign}`
          .toLowerCase()
          .includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [leads, activeTab, sourceFilter, statusFilter, campaignFilter, searchQuery]);

  const summary = useMemo(() => ({
    total:     leads.length,
    newLeads:  leads.filter((l) => l.status === 'New').length,
    qualified: leads.filter((l) => l.status === 'Qualified').length,
    converted: leads.filter((l) => l.status === 'Converted').length,
    lost:      leads.filter((l) => l.status === 'Lost').length,
  }), [leads]);

  const handleCreate = (data) => {
    const newLead = {
      ...data,
      id: nextLeadId(),
      createdAt: todayISO(),
      status: data.status || 'New',
    };
    setLeads((prev) => [newLead, ...prev]);
    setShowModal(false);
    showToast(`Lead "${data.name}" added`);
  };

  const handleEdit = (id, updates) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    setEditing(null);
    showToast('Lead updated');
  };

  const handleDelete = (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
    showToast('Lead deleted', 'error');
  };

  const handleStatusChange = (id, newStatus) => {
    const target = leads.find((l) => l.id === id);
    if (target && target.status === newStatus) {
      setMenuOpenId(null);
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    setMenuOpenId(null);
    showToast(`Status → ${newStatus}`);
  };

  const handleExport = () => {
    if (filtered.length === 0) { showToast('No leads to export', 'error'); return; }
    const rows = [
      ['ID', 'Name', 'Mobile', 'Email', 'City', 'Source', 'Campaign', 'Project', 'Status', 'Priority', 'Assigned', 'Created', 'Notes'],
      ...filtered.map((l) => [
        l.id, l.name, l.mobile, l.email, l.city, l.source, l.campaign,
        l.project, l.status, l.priority, l.assignedTo, l.createdAt, l.notes || '',
      ]),
    ];
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} leads`);
  };

  const hasFilters = searchQuery || sourceFilter !== 'All' || statusFilter !== 'All' || campaignFilter !== 'All';
  const clearFilters = () => {
    setSearchQuery('');
    setSourceFilter('All');
    setStatusFilter('All');
    setCampaignFilter('All');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-40">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Marketing Leads</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Target size={13} className="text-brand-magenta" />
              Capture, track, and qualify leads from all marketing channels
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
              <Plus size={14} className="transition-transform group-hover:rotate-90" /> Add Lead
            </button>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Lead Overview</p>
              <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <KpiCard icon={Users}        label="Total Leads" value={summary.total}     sub="All marketing"    color="purple"  delay={0} />
            <KpiCard icon={Sparkles}     label="New Leads"   value={summary.newLeads}  sub="Captured"         color="emerald" delay={40} />
            <KpiCard icon={CheckCircle2} label="Qualified"   value={summary.qualified} sub="Ready to convert" color="purple"  delay={80} />
            <KpiCard icon={Target}       label="Converted"   value={summary.converted} sub="Won"              color="emerald" delay={120} />
            <KpiCard icon={XCircle}      label="Lost"        value={summary.lost}      sub="Not converted"    color="rose"    delay={160} />
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
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'
                    }`}
                  >
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
              placeholder="Search by name, mobile, email, source…"
              className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac">
                <X size={14} className="text-brand-ink/50" />
              </button>
            )}
          </div>

          <DropdownFilter
            label="Source" icon={Globe} value={sourceFilter}
            options={['All', ...LEAD_SOURCES]}
            open={sourceOpen}
            onToggle={() => { setSourceOpen((s) => !s); setStatusOpen(false); setCampaignOpen(false); }}
            onChange={(v) => { setSourceFilter(v); setSourceOpen(false); }}
          />

          <DropdownFilter
            label="Status" icon={Filter} value={statusFilter}
            options={['All', ...LEAD_STATUSES]}
            open={statusOpen}
            onToggle={() => { setStatusOpen((s) => !s); setSourceOpen(false); setCampaignOpen(false); }}
            onChange={(v) => { setStatusFilter(v); setStatusOpen(false); }}
          />

          <DropdownFilter
            label="Campaign" icon={Megaphone} value={campaignFilter}
            options={campaignOptions}
            open={campaignOpen}
            onToggle={() => { setCampaignOpen((s) => !s); setSourceOpen(false); setStatusOpen(false); }}
            onChange={(v) => { setCampaignFilter(v); setCampaignOpen(false); }}
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
            {filtered.map((l) => (
              <LeadCard
                key={l.id}
                lead={l}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onView={() => setViewing(l)}
                onEdit={() => { setEditing(l); setShowModal(true); }}
                onDelete={() => { setConfirmDelete(l); setMenuOpenId(null); }}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 pb-40">
            {filtered.map((l) => (
              <LeadRow
                key={l.id}
                lead={l}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onView={() => setViewing(l)}
                onEdit={() => { setEditing(l); setShowModal(true); }}
                onDelete={() => { setConfirmDelete(l); setMenuOpenId(null); }}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* MODALS */}
        {showModal && (
          <LeadModal
            mode={editing ? 'edit' : 'create'}
            initial={editing}
            defaultAssignee={user?.name || ''}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSubmit={(data) => (editing ? handleEdit(editing.id, data) : handleCreate(data))}
          />
        )}

        {viewing && (
          <LeadDetailDrawer
            lead={viewing}
            onClose={() => setViewing(null)}
            onEdit={() => { setEditing(viewing); setViewing(null); setShowModal(true); }}
            onStatusChange={(s) => { handleStatusChange(viewing.id, s); setViewing(null); }}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title={`Delete "${confirmDelete.name}"?`}
            message="This will permanently delete this lead. This action cannot be undone."
            confirmLabel="Delete Lead"
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
  const displayValue = useAnimatedCount(value);
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

  return display.toLocaleString();
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
   LEAD CARD (GRID)
   Uses viewport measurement so menu doesn't clip.
   ═══════════════════════════════════════════════════════════════ */
function LeadCard({ lead: l, menuOpenId, setMenuOpenId, onView, onEdit, onDelete, onStatusChange }) {
  const st = STATUS_STYLES[l.status] || STATUS_STYLES.New;
  const StatusIcon = st.icon;
  const SourceIcon = SOURCE_ICONS[l.source] || Globe;

  const triggerRef = useRef(null);
  const [openUp, setOpenUp] = useState(false);

  const handleOpenMenu = () => {
    const isOpen = menuOpenId === l.id;
    if (isOpen) { setMenuOpenId(null); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 300);
    }
    setMenuOpenId(l.id);
  };

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
              title={l.name}
            >
              {l.name}
            </button>
            <p className="truncate text-[11px] font-mono text-brand-ink/50">{l.id}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${st.chip}`}>
            <StatusIcon size={10} className="mr-1 inline" />
            {l.status}
          </span>

          <div className="relative">
            <button
              ref={triggerRef}
              onClick={handleOpenMenu}
              aria-label="Lead actions"
              aria-expanded={menuOpenId === l.id}
              className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-lilac"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpenId === l.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                <div className={`absolute right-0 ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'} z-30 max-h-72 w-52 overflow-y-auto no-scrollbar rounded-xl border border-brand-lilac bg-white p-1 shadow-panel`}>
                  <MenuItem icon={Eye}     label="View Details" onClick={() => { onView(); setMenuOpenId(null); }} />
                  <MenuItem icon={Pencil}  label="Edit Lead"    onClick={() => { onEdit(); setMenuOpenId(null); }} />
                  <div className="my-1 h-px bg-brand-lilac/60" />
                  <p className="px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink/40">
                    Set Status
                  </p>
                  {LEAD_STATUSES.map((s) => {
                    const cs = STATUS_STYLES[s];
                    const SIcon = cs.icon;
                    return (
                      <button
                        key={s}
                        onClick={() => onStatusChange(l.id, s)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs ${
                          l.status === s ? 'bg-brand-magenta/10 font-semibold text-brand-magenta' : 'text-brand-ink/70 hover:bg-brand-lilac/40'
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

        <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Phone size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Mobile</span>
            <span className="truncate text-right font-semibold text-brand-ink">{l.mobile}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Mail size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Email</span>
            <span className="truncate text-right font-semibold text-brand-ink" title={l.email}>{l.email}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Globe size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Source</span>
            <span className="truncate text-right font-semibold text-brand-ink">{l.source}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Megaphone size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Campaign</span>
            <span className="truncate text-right font-semibold text-brand-ink">{l.campaign}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 items-center gap-2 rounded-xl border border-brand-lilac/60 bg-brand-mist/40 px-3 py-2">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/50">Created</p>
            <p className="truncate font-display text-sm font-bold text-brand-ink">{formatShortDate(l.createdAt)}</p>
          </div>
          <div className="flex justify-end">
            <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[l.priority] || PRIORITY_STYLES.Medium}`}>
              <Flame size={9} /> {l.priority}
            </span>
          </div>
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

/* ═══════════════════════════════════════════════════════════════
   LEAD ROW (LIST)
   ═══════════════════════════════════════════════════════════════ */
function LeadRow({ lead: l, menuOpenId, setMenuOpenId, onView, onEdit, onDelete, onStatusChange }) {
  const st = STATUS_STYLES[l.status] || STATUS_STYLES.New;
  const StatusIcon = st.icon;
  const SourceIcon = SOURCE_ICONS[l.source] || Globe;

  const triggerRef = useRef(null);
  const [openUp, setOpenUp] = useState(false);

  const handleOpenMenu = () => {
    const isOpen = menuOpenId === l.id;
    if (isOpen) { setMenuOpenId(null); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 300);
    }
    setMenuOpenId(l.id);
  };

  return (
    <div className="group flex flex-wrap items-center gap-3 rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
        <SourceIcon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta"
          >
            {l.name}
          </button>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${st.chip}`}>
            <StatusIcon size={9} className="mr-0.5 inline" /> {l.status}
          </span>
        </div>
        <p className="truncate text-[11px] text-brand-ink/50">
          <span className="font-mono">{l.id}</span> · {l.mobile} · {l.source}
        </p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="font-mono text-[10px] uppercase text-brand-ink/40">Campaign</p>
        <p className="truncate font-semibold text-brand-ink">{l.campaign}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="font-mono text-[10px] uppercase text-brand-ink/40">City</p>
        <p className="font-semibold text-brand-ink">{l.city}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="font-mono text-[10px] uppercase text-brand-ink/40">Assigned</p>
        <p className="truncate font-semibold text-brand-ink">{l.assignedTo || '—'}</p>
      </div>

      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${PRIORITY_STYLES[l.priority] || PRIORITY_STYLES.Medium}`}>
        {l.priority}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="View"
        ><Eye size={13} /></button>
        <button
          onClick={onEdit}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-2.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
        >
          <Pencil size={11} /> Edit
        </button>

        <div className="relative">
          <button
            ref={triggerRef}
            onClick={handleOpenMenu}
            aria-label="Lead actions"
            aria-expanded={menuOpenId === l.id}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 transition-colors hover:bg-brand-lilac"
          ><MoreVertical size={14} /></button>
          {menuOpenId === l.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className={`absolute right-0 ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'} z-30 max-h-72 w-52 overflow-y-auto no-scrollbar rounded-xl border border-brand-lilac bg-white p-1 shadow-panel`}>
                <MenuItem icon={Eye}    label="View Details" onClick={() => { onView(); setMenuOpenId(null); }} />
                <MenuItem icon={Pencil} label="Edit Lead"    onClick={() => { onEdit(); setMenuOpenId(null); }} />
                <div className="my-1 h-px bg-brand-lilac/60" />
                <p className="px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink/40">
                  Set Status
                </p>
                {LEAD_STATUSES.map((s) => {
                  const cs = STATUS_STYLES[s];
                  const SIcon = cs.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => onStatusChange(l.id, s)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs ${
                        l.status === s ? 'bg-brand-magenta/10 font-semibold text-brand-magenta' : 'text-brand-ink/70 hover:bg-brand-lilac/40'
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MENU ITEM
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

/* ═══════════════════════════════════════════════════════════════
   LEAD MODAL (Create/Edit)
   ═══════════════════════════════════════════════════════════════ */
function LeadModal({ mode = 'create', initial = null, defaultAssignee, onClose, onSubmit }) {
  const seed = initial || {};
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name: seed.name || '',
    mobile: seed.mobile || '',
    email: seed.email || '',
    city: seed.city || '',
    source: seed.source || 'Website',
    campaign: seed.campaign || '',
    project: seed.project || '',
    status: seed.status || 'New',
    priority: seed.priority || 'Medium',
    assignedTo: seed.assignedTo || defaultAssignee || '',
    notes: seed.notes || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEscape(true, () => { if (!submitting) onClose(); });

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^\d{10}$/.test(form.mobile.trim())) return 'Mobile must be exactly 10 digits.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email.';
    if (!form.source) return 'Source is required.';
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
      onSubmit(form);
    }, 250);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit Lead' : 'Add New Lead'}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <UserPlus size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-brand-ink">
                {isEdit ? 'Edit Lead' : 'Add New Lead'}
              </h3>
              <p className="text-[11px] text-brand-ink/50">
                {isEdit ? 'Update lead information' : 'Capture a new marketing lead'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          <SectionTitle icon={User} label="Contact Information" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              inputRef={nameRef}
              label="Full Name *"
              value={form.name}
              onChange={(v) => { setForm({ ...form, name: v }); setError(''); }}
              placeholder="e.g. John Doe"
              icon={User}
            />
            <ModalInput
              label="Mobile *"
              value={form.mobile}
              onChange={(v) => setForm({ ...form, mobile: v.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10-digit number"
              icon={Phone}
            />
            <ModalInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="e.g. john@example.com"
              icon={Mail}
            />
            <ModalInput
              label="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              placeholder="e.g. Mumbai"
              icon={MapPin}
            />
          </div>

          <SectionTitle icon={Target} label="Lead Source & Campaign" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Lead Source *</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <ModalInput
              label="Campaign"
              value={form.campaign}
              onChange={(v) => setForm({ ...form, campaign: v })}
              placeholder="e.g. Summer Sale 2024"
              icon={Megaphone}
            />
            <ModalInput
              label="Project"
              value={form.project}
              onChange={(v) => setForm({ ...form, project: v })}
              placeholder="e.g. Eliteinova CRM"
              icon={Briefcase}
            />
            <ModalInput
              label="Assigned To"
              value={form.assignedTo}
              onChange={(v) => setForm({ ...form, assignedTo: v })}
              placeholder="e.g. Sarah Smith"
              icon={UserPlus}
            />
          </div>

          <SectionTitle icon={Sparkles} label="Status & Priority" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Status</label>
              <div className="flex flex-wrap gap-2">
                {LEAD_STATUSES.map((s) => {
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
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Priority</label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => {
                  const active = form.priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? `${PRIORITY_STYLES[p]} ring-2 ring-brand-magenta/20`
                          : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                      }`}
                    >
                      <Flame size={12} /> {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <SectionTitle icon={MessageSquare} label="Notes" />
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Add any context about this lead..."
            rows={3}
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />

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
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Lead'}
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
   LEAD DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════ */
function LeadDetailDrawer({ lead: l, onClose, onEdit, onStatusChange }) {
  const st = STATUS_STYLES[l.status] || STATUS_STYLES.New;
  const StatusIcon = st.icon;
  const SourceIcon = SOURCE_ICONS[l.source] || Globe;

  useEscape(true, onClose);

  const initials = (l.name || '')
    .split(' ')
    .map((n) => n[0] || '')
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lead details"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
    >
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
              <SourceIcon size={18} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">{l.id}</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{l.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${st.chip}`}>
              <StatusIcon size={12} /> {l.status}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${PRIORITY_STYLES[l.priority] || PRIORITY_STYLES.Medium}`}>
              <Flame size={12} /> {l.priority} Priority
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lilac/60 px-3 py-1.5 text-xs font-bold text-brand-purple">
              <Globe size={12} /> {l.source}
            </span>
            {l.campaign && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mist px-3 py-1.5 text-xs font-bold text-brand-ink/70">
                <Megaphone size={12} /> {l.campaign}
              </span>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-white p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-magenta/10 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-xl font-bold text-white shadow-md">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-brand-ink">{l.name}</p>
                <p className="font-mono text-[11px] text-brand-ink/50">{l.id}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-brand-ink/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={11} className="text-brand-magenta" /> {l.mobile}
                  </span>
                  {l.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={11} className="text-brand-magenta" /> {l.email}
                    </span>
                  )}
                  {l.city && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={11} className="text-brand-magenta" /> {l.city}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card !p-5 space-y-3">
            <SectionTitle icon={Briefcase} label="Lead Information" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow icon={Globe}     label="Source"      value={l.source} />
              <InfoRow icon={Megaphone} label="Campaign"    value={l.campaign || '—'} />
              <InfoRow icon={Briefcase} label="Project"     value={l.project || '—'} />
              <InfoRow icon={UserPlus}  label="Assigned To" value={l.assignedTo || '—'} />
              <InfoRow icon={Calendar}  label="Created"     value={formatDate(l.createdAt)} />
              <InfoRow icon={Sparkles}  label="Status"      value={l.status} />
              <InfoRow icon={Flame}     label="Priority"    value={l.priority} />
            </div>
          </div>

          {l.notes && (
            <div className="card !p-5">
              <SectionTitle icon={MessageSquare} label="Notes" />
              <p className="mt-3 whitespace-pre-line rounded-xl border border-brand-lilac/60 bg-brand-mist/40 p-3 text-sm text-brand-ink/80">
                {l.notes}
              </p>
            </div>
          )}

          <div className="card !p-5">
            <SectionTitle icon={Activity} label="Change Status" />
            <div className="mt-3 flex flex-wrap gap-2">
              {LEAD_STATUSES.map((s) => {
                const cs = STATUS_STYLES[s];
                const SIcon = cs.icon;
                const active = l.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => { if (!active) onStatusChange(s); }}
                    disabled={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? `${cs.chip} ring-2 ring-brand-magenta/20 cursor-default`
                        : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                    }`}
                  >
                    <SIcon size={12} /> {s}
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
              <Pencil size={13} /> Edit Lead
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
        {hasFilters ? 'No leads match your filters' : 'No leads yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button onClick={onClear} className="font-semibold text-brand-magenta hover:underline">Clear all filters</button>
        ) : (
          'Add your first marketing lead to start tracking.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onCreate}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={16} /> Add First Lead
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