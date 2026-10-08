// src/pages/marketing/LeadHandover.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, Filter, ChevronDown, Eye, Pencil,
  Trash2, AlertCircle, CheckCircle2, XCircle, X, Users,
  Sparkles, Clock, Zap, Target, Calendar, Globe, MapPin,
  Briefcase, Flame, Inbox, Download, Grid3x3, List,
  Activity, Star, Megaphone, Send, FileWarning, UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const HANDOVER_TABS = [
  { key: 'ready',    label: 'Ready for Assignment', icon: Clock },
  { key: 'assigned', label: 'Assigned Leads',        icon: Users },
  { key: 'pending',  label: 'Pending Handover',      icon: Send },
  { key: 'accepted', label: 'Accepted Leads',        icon: CheckCircle2 },
  { key: 'history',  label: 'Handover History',      icon: Activity },
];

const HANDOVER_STATUSES = [
  'New', 'Under Review', 'Ready for Handover', 'Submitted',
  'Accepted', 'Rejected', 'Duplicate', 'Invalid',
];

const STATUS_STYLES = {
  'New':                { chip: 'bg-blue-100 text-blue-600 border-blue-200',           icon: Sparkles },
  'Under Review':       { chip: 'bg-violet-100 text-brand-purple border-violet-200',   icon: Eye },
  'Ready for Handover': { chip: 'bg-amber-100 text-amber-600 border-amber-200',        icon: Clock },
  'Submitted':          { chip: 'bg-indigo-100 text-indigo-600 border-indigo-200',     icon: Send },
  'Accepted':           { chip: 'bg-emerald-100 text-emerald-600 border-emerald-200',  icon: CheckCircle2 },
  'Rejected':           { chip: 'bg-rose-100 text-brand-magenta border-rose-200',      icon: XCircle },
  'Duplicate':          { chip: 'bg-orange-100 text-orange-600 border-orange-200',     icon: FileWarning },
  'Invalid':            { chip: 'bg-slate-100 text-slate-600 border-slate-200',        icon: XCircle },
};

const LEAD_SOURCES = [
  'Website', 'Landing Page', 'Google Ads', 'Meta Ads', 'Facebook',
  'Instagram', 'YouTube', 'WhatsApp', 'LinkedIn', 'Referral',
  'Offline Campaign', 'Event', 'Promotional Campaign',
];

const MANAGERS = ['Ravi Sharma', 'Anita Desai', 'Kiran Rao', 'Priya Menon'];

const STORAGE_KEY = 'handover:marketing';

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

const today = () => new Date().toISOString().slice(0, 10);

const initialsOf = (name) =>
  (name || '')
    .split(' ')
    .map((n) => n[0] || '')
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

/* ═══════════════════════════════════════════════════════════════
   SEED DATA
   ═══════════════════════════════════════════════════════════════ */
const SEED_LEADS = [
  { id: 'L-1023', name: 'John Doe', mobile: '9876543210', email: 'john@example.com',
    source: 'Google Ads', campaign: 'Summer Sale 2024', project: 'Eliteinova Matrimony',
    city: 'Mumbai', status: 'Ready for Handover', priority: 'High', handoverTo: '', notes: 'Downloaded pricing sheet.',
    submittedAt: null, acceptedAt: null, lastUpdateAt: '2024-06-15',
    history: [{ at: '2024-06-15', action: 'Created', by: 'System' }] },
  { id: 'L-1024', name: 'Sarah Smith', mobile: '9876543211', email: 'sarah@example.com',
    source: 'Meta Ads', campaign: 'Summer Sale 2024', project: 'Eliteinova Matrimony',
    city: 'Pune', status: 'Submitted', priority: 'Medium', handoverTo: 'Ravi Sharma', notes: 'Interested in premium plan.',
    submittedAt: '2024-06-15', acceptedAt: null, lastUpdateAt: '2024-06-15',
    history: [{ at: '2024-06-15', action: 'Submitted', by: 'Marketing Exec' }] },
  { id: 'L-1025', name: 'Raj Patel', mobile: '9876543212', email: 'raj@example.com',
    source: 'Website', campaign: 'Organic', project: 'Eliteinova CRM',
    city: 'Bengaluru', status: 'Accepted', priority: 'High', handoverTo: 'Anita Desai', notes: 'Converted via demo call.',
    submittedAt: '2024-06-14', acceptedAt: '2024-06-14', lastUpdateAt: '2024-06-14',
    history: [{ at: '2024-06-14', action: 'Submitted', by: 'Marketing Exec' }, { at: '2024-06-14', action: 'Accepted', by: 'Anita Desai' }] },
  { id: 'L-1026', name: 'Emily Chen', mobile: '9876543213', email: 'emily@example.com',
    source: 'WhatsApp', campaign: 'Broadcast', project: 'Eliteinova Matrimony',
    city: 'Delhi', status: 'Rejected', priority: 'Low', handoverTo: 'Kiran Rao', notes: 'Duplicate entry detected.',
    submittedAt: '2024-06-13', acceptedAt: null, lastUpdateAt: '2024-06-14',
    history: [{ at: '2024-06-13', action: 'Submitted', by: 'Marketing Exec' }, { at: '2024-06-14', action: 'Rejected', by: 'Kiran Rao' }] },
  { id: 'L-1027', name: 'Arjun Mehta', mobile: '9876543214', email: 'arjun@example.com',
    source: 'LinkedIn', campaign: 'B2B Outreach', project: 'Eliteinova CRM',
    city: 'Hyderabad', status: 'Under Review', priority: 'Medium', handoverTo: '', notes: 'Awaiting call back.',
    submittedAt: null, acceptedAt: null, lastUpdateAt: '2024-06-12',
    history: [{ at: '2024-06-12', action: 'Created', by: 'System' }] },
  { id: 'L-1028', name: 'Priya Sharma', mobile: '9876543215', email: 'priya@example.com',
    source: 'Instagram', campaign: 'Reel Campaign', project: 'Eliteinova Matrimony',
    city: 'Chennai', status: 'Ready for Handover', priority: 'High', handoverTo: '', notes: 'DM enquiry.',
    submittedAt: null, acceptedAt: null, lastUpdateAt: '2024-06-15',
    history: [{ at: '2024-06-15', action: 'Created', by: 'System' }] },
  { id: 'L-1029', name: 'Ravi Kumar', mobile: '9876543216', email: 'ravi@example.com',
    source: 'Referral', campaign: 'Partner Drive', project: 'Eliteinova CRM',
    city: 'Kolkata', status: 'Accepted', priority: 'High', handoverTo: 'Priya Menon', notes: 'Warm referral.',
    submittedAt: '2024-06-11', acceptedAt: '2024-06-11', lastUpdateAt: '2024-06-11',
    history: [{ at: '2024-06-11', action: 'Submitted', by: 'Marketing Exec' }, { at: '2024-06-11', action: 'Accepted', by: 'Priya Menon' }] },
  { id: 'L-1030', name: 'Neha Singh', mobile: '9876543217', email: 'neha@example.com',
    source: 'Facebook', campaign: 'Brand Awareness', project: 'Eliteinova Matrimony',
    city: 'Jaipur', status: 'Duplicate', priority: 'Low', handoverTo: 'Kiran Rao', notes: 'Same number as L-1023.',
    submittedAt: '2024-06-10', acceptedAt: null, lastUpdateAt: '2024-06-10',
    history: [{ at: '2024-06-10', action: 'Submitted', by: 'Marketing Exec' }, { at: '2024-06-10', action: 'Marked Duplicate', by: 'Kiran Rao' }] },
  { id: 'L-1031', name: 'Vikram Rao', mobile: '9876543218', email: 'vikram@example.com',
    source: 'YouTube', campaign: 'Product Demo', project: 'Eliteinova CRM',
    city: 'Noida', status: 'New', priority: 'Low', handoverTo: '', notes: 'Watched full demo.',
    submittedAt: null, acceptedAt: null, lastUpdateAt: '2024-06-09',
    history: [{ at: '2024-06-09', action: 'Created', by: 'System' }] },
  { id: 'L-1032', name: 'Ananya Iyer', mobile: '9876543219', email: 'ananya@example.com',
    source: 'Landing Page', campaign: 'Free Trial', project: 'Eliteinova CRM',
    city: 'Ahmedabad', status: 'Submitted', priority: 'High', handoverTo: 'Ravi Sharma', notes: 'Signed up for annual plan.',
    submittedAt: '2024-06-08', acceptedAt: null, lastUpdateAt: '2024-06-08',
    history: [{ at: '2024-06-08', action: 'Submitted', by: 'Marketing Exec' }] },
  { id: 'L-1033', name: 'Karan Malhotra', mobile: '9876543220', email: 'karan@example.com',
    source: 'Offline Campaign', campaign: 'Mumbai Expo', project: 'Eliteinova Matrimony',
    city: 'Mumbai', status: 'Invalid', priority: 'Medium', handoverTo: 'Anita Desai', notes: 'Wrong number.',
    submittedAt: '2024-06-07', acceptedAt: null, lastUpdateAt: '2024-06-07',
    history: [{ at: '2024-06-07', action: 'Submitted', by: 'Marketing Exec' }, { at: '2024-06-07', action: 'Marked Invalid', by: 'Anita Desai' }] },
  { id: 'L-1034', name: 'Divya Nair', mobile: '9876543221', email: 'divya@example.com',
    source: 'Event', campaign: 'Matrimony Meetup', project: 'Eliteinova Matrimony',
    city: 'Kochi', status: 'Accepted', priority: 'High', handoverTo: 'Priya Menon', notes: 'Attended meetup.',
    submittedAt: '2024-06-06', acceptedAt: '2024-06-06', lastUpdateAt: '2024-06-06',
    history: [{ at: '2024-06-06', action: 'Submitted', by: 'Marketing Exec' }, { at: '2024-06-06', action: 'Accepted', by: 'Priya Menon' }] },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function LeadHandover() {
  const { user } = useAuth();

  const [leads, setLeads] = useState(() => loadState(SEED_LEADS));
  const [activeTab, setActiveTab] = useState('ready');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toastTimerRef = useRef(null);
  const editingIdRef = useRef(null);
  const viewingIdRef = useRef(null);

  useEffect(() => { saveState(leads); }, [leads]);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2400);
  }, []);

  /* ── Keep editing/viewing in sync with latest leads state ── */
  useEffect(() => {
    if (editingIdRef.current) {
      const fresh = leads.find((l) => l.id === editingIdRef.current);
      if (fresh) {
        setEditing((prev) => (prev && prev === fresh ? prev : fresh));
      }
    }
    if (viewingIdRef.current) {
      const fresh = leads.find((l) => l.id === viewingIdRef.current);
      if (fresh) {
        setViewing((prev) => (prev && prev === fresh ? prev : fresh));
      }
    }
  }, [leads]);

  /* ── TAB FILTERS ── */
  const tabFiltered = useMemo(() => {
    let list = [...leads];

    if (activeTab === 'ready') {
      list = list.filter((l) => ['Ready for Handover', 'Under Review', 'New'].includes(l.status));
    } else if (activeTab === 'assigned') {
      list = list.filter((l) => l.handoverTo && ['Submitted', 'Accepted', 'Rejected'].includes(l.status));
    } else if (activeTab === 'pending') {
      list = list.filter((l) => l.status === 'Submitted');
    } else if (activeTab === 'accepted') {
      list = list.filter((l) => l.status === 'Accepted');
    } else if (activeTab === 'history') {
      list = list.filter((l) => l.history && l.history.length > 1);
    }

    if (statusFilter !== 'All') list = list.filter((l) => l.status === statusFilter);
    if (sourceFilter !== 'All') list = list.filter((l) => l.source === sourceFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) =>
        `${l.name} ${l.id} ${l.mobile} ${l.email} ${l.source} ${l.campaign}`
          .toLowerCase()
          .includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.lastUpdateAt) - new Date(a.lastUpdateAt));
  }, [leads, activeTab, statusFilter, sourceFilter, searchQuery]);

  /* ── SUMMARY — computed from ALL leads ── */
  const summary = useMemo(() => ({
    total:    leads.length,
    ready:    leads.filter((l) => l.status === 'Ready for Handover').length,
    pending:  leads.filter((l) => l.status === 'Submitted').length,
    accepted: leads.filter((l) => l.status === 'Accepted').length,
    rejected: leads.filter((l) => l.status === 'Rejected').length,
  }), [leads]);

  const tabCounts = useMemo(() => ({
    ready:    leads.filter((l) => ['Ready for Handover', 'Under Review', 'New'].includes(l.status)).length,
    assigned: leads.filter((l) => l.handoverTo && ['Submitted', 'Accepted', 'Rejected'].includes(l.status)).length,
    pending:  leads.filter((l) => l.status === 'Submitted').length,
    accepted: leads.filter((l) => l.status === 'Accepted').length,
    history:  leads.filter((l) => l.history && l.history.length > 1).length,
  }), [leads]);

  /* ── ID GENERATION — monotonic, collision-safe ── */
  const nextLeadId = useCallback((existing) => {
    const maxNum = existing.reduce((m, l) => {
      const n = parseInt(String(l.id).replace(/^L-/, ''), 10);
      return Number.isFinite(n) && n > m ? n : m;
    }, 1034);
    return `L-${maxNum + 1}`;
  }, []);

  /* ── HANDLERS ── */
  const handleCreate = useCallback((data) => {
    setLeads((prev) => {
      const newLead = {
        ...data,
        id: nextLeadId(prev),
        status: data.status || 'New',
        submittedAt: null,
        acceptedAt: null,
        lastUpdateAt: today(),
        history: [{ at: today(), action: 'Created', by: user?.name || 'Marketing Exec' }],
      };
      return [newLead, ...prev];
    });
    setShowModal(false);
    setEditing(null);
    editingIdRef.current = null;
    showToast(`Lead "${data.name}" added`);
  }, [nextLeadId, showToast, user]);

  const handleEdit = useCallback((id, updates) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates, lastUpdateAt: today() } : l)));
    setEditing(null);
    setShowModal(false);
    editingIdRef.current = null;
    showToast('Lead updated');
  }, [showToast]);

  const handleDelete = useCallback((id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setConfirmDelete(null);
    if (editingIdRef.current === id) { setEditing(null); editingIdRef.current = null; }
    if (viewingIdRef.current === id) { setViewing(null); viewingIdRef.current = null; }
    showToast('Lead deleted', 'error');
  }, [showToast]);

  const handleStatusChange = useCallback((id, newStatus) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const now = today();
        const newHistory = [
          ...(l.history || []),
          { at: now, action: `Status → ${newStatus}`, by: user?.name || 'Marketing Exec' },
        ];
        return {
          ...l,
          status: newStatus,
          submittedAt: newStatus === 'Submitted' ? now : l.submittedAt,
          acceptedAt: newStatus === 'Accepted' ? now : l.acceptedAt,
          lastUpdateAt: now,
          history: newHistory,
        };
      })
    );
    showToast(`Status → ${newStatus}`);
  }, [showToast, user]);

  const handleSubmitToManager = useCallback((id, handoverTo) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const now = today();
        return {
          ...l,
          status: 'Submitted',
          handoverTo: handoverTo || l.handoverTo || MANAGERS[0],
          submittedAt: now,
          lastUpdateAt: now,
          history: [...(l.history || []), { at: now, action: 'Submitted to Manager', by: user?.name || 'Marketing Exec' }],
        };
      })
    );
    showToast('Submitted to Manager');
  }, [showToast, user]);

  const handleAccept = useCallback((id) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const now = today();
        return {
          ...l,
          status: 'Accepted',
          acceptedAt: now,
          lastUpdateAt: now,
          history: [...(l.history || []), { at: now, action: 'Accepted', by: user?.name || 'Marketing Exec' }],
        };
      })
    );
    showToast('Lead accepted');
  }, [showToast, user]);

  const handleReject = useCallback((id) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const now = today();
        return {
          ...l,
          status: 'Rejected',
          lastUpdateAt: now,
          history: [...(l.history || []), { at: now, action: 'Rejected', by: user?.name || 'Marketing Exec' }],
        };
      })
    );
    showToast('Lead rejected', 'error');
  }, [showToast, user]);

  const handleExport = useCallback(() => {
    if (tabFiltered.length === 0) { showToast('No leads to export', 'error'); return; }
    const rows = [
      ['ID', 'Name', 'Mobile', 'Email', 'Source', 'Campaign', 'Status', 'Handover To', 'Submitted At', 'Accepted At'],
      ...tabFiltered.map((l) => [
        l.id, l.name, l.mobile, l.email, l.source, l.campaign,
        l.status, l.handoverTo || '', l.submittedAt || '', l.acceptedAt || '',
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-handover-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${tabFiltered.length} leads`);
  }, [tabFiltered, showToast]);

  const hasFilters = Boolean(searchQuery) || statusFilter !== 'All' || sourceFilter !== 'All';
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('All');
    setSourceFilter('All');
  }, []);

  /* ── Modal / drawer open helpers ── */
  const openCreate = useCallback(() => {
    setEditing(null);
    editingIdRef.current = null;
    setShowModal(true);
  }, []);

  const openEdit = useCallback((lead) => {
    setEditing(lead);
    editingIdRef.current = lead.id;
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditing(null);
    editingIdRef.current = null;
  }, []);

  const openView = useCallback((lead) => {
    setViewing(lead);
    viewingIdRef.current = lead.id;
  }, []);

  const closeView = useCallback(() => {
    setViewing(null);
    viewingIdRef.current = null;
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-40">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Lead Handover</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Users size={13} className="text-brand-magenta" />
              Move validated leads into the CRM sales pipeline
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
              <Plus size={14} className="transition-transform group-hover:rotate-90" /> Add Lead
            </button>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Handover Overview</p>
              <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <KpiCard icon={Users}        label="Total"     value={summary.total}    sub="All handover leads"   color="purple"  delay={0} />
            <KpiCard icon={Clock}        label="Ready"     value={summary.ready}    sub="Awaiting submission"  color="amber"   delay={40} />
            <KpiCard icon={Send}         label="Pending"   value={summary.pending}  sub="Submitted to manager" color="purple"  delay={80} />
            <KpiCard icon={CheckCircle2} label="Accepted"  value={summary.accepted} sub="Moved to pipeline"    color="emerald" delay={120} />
            <KpiCard icon={XCircle}      label="Rejected"  value={summary.rejected} sub="Not accepted"         color="rose"    delay={160} />
          </div>
        </div>

        {/* TABS */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {HANDOVER_TABS.map((t) => {
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
            label="Status" icon={Filter} value={statusFilter}
            options={['All', ...HANDOVER_STATUSES]}
            open={statusOpen}
            onToggle={() => { setStatusOpen((s) => !s); setSourceOpen(false); }}
            onChange={(v) => { setStatusFilter(v); setStatusOpen(false); }}
          />

          <DropdownFilter
            label="Source" icon={Globe} value={sourceFilter}
            options={['All', ...LEAD_SOURCES]}
            open={sourceOpen}
            onToggle={() => { setSourceOpen((s) => !s); setStatusOpen(false); }}
            onChange={(v) => { setSourceFilter(v); setSourceOpen(false); }}
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
            Showing: <span className="text-brand-magenta">{tabFiltered.length}</span>
          </span>

          <div className="flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-full p-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'border border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                  : 'text-brand-ink/50 hover:bg-brand-lilac/30'
              }`}
              title="Grid view"
            >
              <Grid3x3 size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-full p-1.5 transition-all ${
                viewMode === 'list'
                  ? 'border border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                  : 'text-brand-ink/50 hover:bg-brand-lilac/30'
              }`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {tabFiltered.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={openCreate} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 pb-40 md:grid-cols-2 xl:grid-cols-3">
            {tabFiltered.map((l) => (
              <LeadCard
                key={l.id}
                lead={l}
                onView={() => openView(l)}
                onEdit={() => openEdit(l)}
              />
            ))}
          </div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[11px] font-bold uppercase tracking-wider text-brand-ink/60">
                  <tr>
                    <th className="px-5 py-3">Lead</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Handover To</th>
                    <th className="px-5 py-3">Submitted</th>
                    <th className="px-5 py-3">Accepted</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-lilac/40">
                  {tabFiltered.map((l) => {
                    const st = STATUS_STYLES[l.status] || STATUS_STYLES.New;
                    const StatusIcon = st.icon;
                    return (
                      <tr key={l.id} className="transition-colors hover:bg-brand-mist/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white text-[10px] font-bold">
                              {initialsOf(l.name)}
                            </span>
                            <div className="min-w-0">
                              <button onClick={() => openView(l)} className="block truncate text-left font-semibold text-brand-ink hover:text-brand-magenta">
                                {l.name}
                              </button>
                              <p className="truncate font-mono text-[10px] text-brand-ink/50">{l.id} · {l.mobile}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-brand-ink/70">{l.source}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${st.chip}`}>
                            <StatusIcon size={10} />
                            {l.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-brand-ink/70">{l.handoverTo || '—'}</td>
                        <td className="px-5 py-3 font-mono text-[11px] text-brand-ink/60">{l.submittedAt ? formatShortDate(l.submittedAt) : '—'}</td>
                        <td className="px-5 py-3 font-mono text-[11px] text-brand-ink/60">{l.acceptedAt ? formatShortDate(l.acceptedAt) : '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openView(l)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
                              title="View details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => openEdit(l)}
                              className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-2.5 text-[11px] font-semibold text-white shadow-card transition-all hover:brightness-110"
                              title="Edit lead"
                            >
                              <Pencil size={11} /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODALS */}
        {showModal && (
          <LeadModal
            mode={editing ? 'edit' : 'create'}
            initial={editing}
            defaultHandoverTo={MANAGERS[0]}
            managers={MANAGERS}
            onClose={closeModal}
            onSubmit={(data) => (editing ? handleEdit(editing.id, data) : handleCreate(data))}
            onDelete={editing ? () => { setShowModal(false); setConfirmDelete(editing); } : null}
            onSubmitToManager={editing ? (manager) => {
              handleSubmitToManager(editing.id, manager);
              closeModal();
            } : null}
            onAccept={editing ? () => {
              handleAccept(editing.id);
              closeModal();
            } : null}
            onReject={editing ? () => {
              handleReject(editing.id);
              closeModal();
            } : null}
          />
        )}

        {viewing && (
          <LeadDetailDrawer
            lead={viewing}
            onClose={closeView}
            onEdit={() => { const lead = viewing; closeView(); openEdit(lead); }}
            onSubmit={() => { handleSubmitToManager(viewing.id, viewing.handoverTo); }}
            onAccept={() => { handleAccept(viewing.id); }}
            onReject={() => { handleReject(viewing.id); }}
            onStatusChange={(s) => handleStatusChange(viewing.id, s)}
            onDelete={() => { const lead = viewing; closeView(); setConfirmDelete(lead); }}
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
        {label}: <span className="max-w-[140px] truncate font-semibold text-brand-magenta">{value}</span>
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
   LEAD CARD (GRID) - FIXED FOR NAME AND BADGE
   ═══════════════════════════════════════════════════════════════ */
function LeadCard({ lead: l, onView, onEdit }) {
  const st = STATUS_STYLES[l.status] || STATUS_STYLES.New;
  const StatusIcon = st.icon;

  // Helper to get short status text for badge
  const getShortStatus = (status) => {
    if (status === 'Ready for Handover') return 'Ready';
    if (status === 'Under Review') return 'Review';
    return status;
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-magenta/50 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 rounded-t-2xl bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative flex flex-1 flex-col p-5">
        {/* Header Section - Fixed Alignment */}
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white text-sm font-bold shadow-md">
            {initialsOf(l.name)}
          </span>
          
          {/* Name Container - Allowing wrapping */}
          <div className="min-w-0 flex-1 pr-1">
            <button
              onClick={onView}
              className="block w-full text-left font-display text-base font-semibold text-brand-ink hover:text-brand-magenta leading-tight whitespace-normal break-words"
              title={l.name}
            >
              {l.name}
            </button>
            <p className="truncate text-[11px] font-mono text-brand-ink/50 mt-0.5">{l.id}</p>
          </div>

          {/* Badge - Made smaller and fixed */}
          <span 
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${st.chip}`}
            title={l.status}
          >
            <StatusIcon size={9} className="mr-1 inline" />
            {getShortStatus(l.status)}
          </span>
        </div>

        {/* Info Grid */}
        <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
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
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <UserCheck size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Handover To</span>
            <span className="truncate text-right font-semibold text-brand-ink">{l.handoverTo || '—'}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Calendar size={11} className="shrink-0 text-brand-ink/50" />
            <span className="truncate text-brand-ink/50">Updated</span>
            <span className="truncate text-right font-semibold text-brand-ink">{formatShortDate(l.lastUpdateAt)}</span>
          </div>
        </div>

        {/* Priority & Project Row */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-lilac/60 bg-brand-mist/40 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/50">Priority</p>
            <p className={`truncate font-display text-sm font-bold ${
              l.priority === 'High' ? 'text-brand-magenta' : l.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {l.priority}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-mist px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-brand-ink/60 max-w-[120px] truncate">
            {l.project}
          </span>
        </div>

        {/* Buttons */}
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
   LEAD MODAL (Create / Edit + All Actions)
   ═══════════════════════════════════════════════════════════════ */
function LeadModal({
  mode = 'create', initial = null, defaultHandoverTo, managers,
  onClose, onSubmit, onDelete, onSubmitToManager, onAccept, onReject,
}) {
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
    handoverTo: seed.handoverTo || defaultHandoverTo || '',
    notes: seed.notes || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);
  const submitTimerRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);
  useEffect(() => () => { if (submitTimerRef.current) clearTimeout(submitTimerRef.current); }, []);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^\d{10}$/.test(form.mobile.trim())) return 'Mobile must be exactly 10 digits.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email.';
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
      onSubmit(form);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Users size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-brand-ink">
                {isEdit ? 'Edit Handover Lead' : 'Add New Lead for Handover'}
              </h3>
              <p className="text-[11px] text-brand-ink/50">
                {isEdit ? 'Update lead details or perform an action' : 'Capture a lead ready to handover'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          <SectionTitle icon={Users} label="Contact Information" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ModalInput
              inputRef={nameRef}
              label="Full Name *"
              value={form.name}
              onChange={(v) => { setForm({ ...form, name: v }); setError(''); }}
              placeholder="e.g. John Doe"
              icon={Users}
            />
            <ModalInput
              label="Mobile *"
              value={form.mobile}
              onChange={(v) => setForm({ ...form, mobile: v.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10-digit number"
              icon={Zap}
            />
            <ModalInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="e.g. john@example.com"
              icon={Star}
            />
            <ModalInput
              label="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              placeholder="e.g. Mumbai"
              icon={MapPin}
            />
          </div>

          <SectionTitle icon={Megaphone} label="Source & Campaign" />
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
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Handover To (Manager)</label>
              <select
                value={form.handoverTo}
                onChange={(e) => setForm({ ...form, handoverTo: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                <option value="">— Not Assigned —</option>
                {managers.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <SectionTitle icon={Sparkles} label="Status & Priority" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Status</label>
              <div className="flex flex-wrap gap-2">
                {HANDOVER_STATUSES.map((s) => {
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
                {['High', 'Medium', 'Low'].map((p) => {
                  const active = form.priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-2 ring-brand-magenta/20'
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

          <SectionTitle icon={Activity} label="Notes" />
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

          {isEdit && (
            <div className="space-y-2 rounded-xl border border-brand-lilac/60 bg-brand-mist/40 p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/60">
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {form.status !== 'Submitted' && form.status !== 'Accepted' && (
                  <button
                    type="button"
                    onClick={() => onSubmitToManager?.(form.handoverTo)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                  >
                    <Send size={12} /> Submit to Manager
                  </button>
                )}
                {form.status === 'Submitted' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onAccept?.()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                    >
                      <CheckCircle2 size={12} /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject?.()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
                >
                  <Trash2 size={12} /> Delete Lead
                </button>
              </div>
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
function LeadDetailDrawer({ lead: l, onClose, onEdit, onSubmit, onAccept, onReject, onStatusChange, onDelete }) {
  const st = STATUS_STYLES[l.status] || STATUS_STYLES.New;
  const StatusIcon = st.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white text-sm font-bold shadow-sm">
              {initialsOf(l.name)}
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">{l.id}</p>
              <h3 className="font-display text-base font-bold text-brand-ink">{l.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${st.chip}`}>
              <StatusIcon size={12} /> {l.status}
            </span>
            {l.handoverTo && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lilac/60 px-3 py-1.5 text-xs font-bold text-brand-purple">
                <UserCheck size={12} /> {l.handoverTo}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
              l.priority === 'High' ? 'border-rose-200 bg-rose-50 text-brand-magenta' :
              l.priority === 'Medium' ? 'border-amber-200 bg-amber-50 text-amber-600' :
              'border-emerald-200 bg-emerald-50 text-emerald-600'
            }`}>
              <Flame size={12} /> {l.priority} Priority
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-white p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-magenta/10 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-xl font-bold text-white shadow-md">
                {initialsOf(l.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-brand-ink">{l.name}</p>
                <p className="font-mono text-[11px] text-brand-ink/50">{l.id}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-brand-ink/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Zap size={11} className="text-brand-magenta" /> {l.mobile}
                  </span>
                  {l.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Star size={11} className="text-brand-magenta" /> {l.email}
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
            <SectionTitle icon={Send} label="Handover Details" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow icon={Globe}        label="Source"       value={l.source} />
              <InfoRow icon={Megaphone}    label="Campaign"     value={l.campaign} />
              <InfoRow icon={Briefcase}    label="Project"      value={l.project} />
              <InfoRow icon={UserCheck}    label="Handover To"  value={l.handoverTo || '—'} />
              <InfoRow icon={Calendar}     label="Submitted"    value={l.submittedAt ? formatDate(l.submittedAt) : '—'} />
              <InfoRow icon={CheckCircle2} label="Accepted"     value={l.acceptedAt ? formatDate(l.acceptedAt) : '—'} />
            </div>
          </div>

          {l.notes && (
            <div className="card !p-5">
              <SectionTitle icon={Activity} label="Notes" />
              <p className="mt-3 whitespace-pre-line rounded-xl border border-brand-lilac/60 bg-brand-mist/40 p-3 text-sm text-brand-ink/80">
                {l.notes}
              </p>
            </div>
          )}

          {l.history && l.history.length > 0 && (
            <div className="card !p-5">
              <SectionTitle icon={Activity} label="Handover History" />
              <div className="relative mt-3 space-y-3">
                <span className="pointer-events-none absolute left-[7px] top-3 bottom-3 w-px bg-brand-lilac" />
                {l.history.map((h, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <span className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple ring-4 ring-white" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brand-ink">{h.action}</p>
                      <p className="text-[10px] text-brand-ink/40">
                        {formatDate(h.at)} · {h.by}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card !p-5">
            <SectionTitle icon={Sparkles} label="Change Status" />
            <div className="mt-3 flex flex-wrap gap-2">
              {HANDOVER_STATUSES.map((stt) => {
                const cs = STATUS_STYLES[stt];
                const SIcon = cs.icon;
                const active = l.status === stt;
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
            <SectionTitle icon={Target} label="Actions" />
            <div className="mt-3 flex flex-wrap gap-2">
              {l.status !== 'Submitted' && l.status !== 'Accepted' && (
                <button
                  onClick={onSubmit}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                >
                  <Send size={12} /> Submit to Manager
                </button>
              )}
              {l.status === 'Submitted' && (
                <>
                  <button
                    onClick={onAccept}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                  >
                    <CheckCircle2 size={12} /> Accept
                  </button>
                  <button
                    onClick={onReject}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </>
              )}
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Pencil size={12} /> Edit Lead
              </button>
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
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
        {hasFilters ? 'No leads match your filters' : 'No leads in this tab yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button onClick={onClear} className="font-semibold text-brand-magenta hover:underline">Clear all filters</button>
        ) : (
          'Add a lead to start the handover process.'
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