// src/pages/admin/Leads.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Phone, MessageCircle, Users, PhoneMissed, ClipboardList, X, Calendar,
  Search, Download, Upload, Play, ChevronDown, Mic, PhoneIncoming,
  PhoneOutgoing, Clock, Headphones, UserCheck, AlertCircle, CheckCircle2,
  Tag, ListFilter, Building2, User as UserIcon, Eye, MoreVertical, Trash2,
  Percent, TrendingUp, TrendingDown, Grid3x3, List, PhoneOff, MicOff,
  Volume2, VolumeX, PauseCircle, PlayCircle, FileUp, StickyNote, Plus,
  History, Edit3, UserPlus, Inbox, Users2, Send, ArrowRightLeft, UserX,
  Sparkles, Copy, Filter, ChevronRight, Zap, Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  LEADS as INITIAL_LEADS,
  AGENTS,
  CALLS,
  FOLLOW_UPS,
} from '../../data/mockData';

/* ================= CONSTANTS ================= */
const STATUS_STYLES = {
  Fresh: 'bg-violet-100 text-brand-purple',
  'Follow Up': 'bg-amber-100 text-amber-600',
  Missed: 'bg-rose-100 text-brand-magenta',
  Won: 'bg-emerald-100 text-emerald-600',
  Lost: 'bg-gray-100 text-gray-500',
  Qualified: 'bg-blue-100 text-blue-600',
};

const SOURCES = ['Website', 'Referral', 'Campaign', 'Walk-in', 'Social Media', 'Other'];
const ALL_STATUSES = ['Fresh', 'Follow Up', 'Qualified', 'Won', 'Lost', 'Missed'];

/* ============ LEAD SUB-TABS ============ */
const LEAD_TABS = [
  { key: 'all',         label: 'All Leads',   icon: List },
  { key: 'fresh',       label: 'Fresh',       icon: Sparkles },
  { key: 'assigned',    label: 'Assigned',    icon: UserCheck },
  { key: 'unassigned',  label: 'Unassigned',  icon: UserX },
  { key: 'followup',    label: 'Follow-up',   icon: Calendar },
  { key: 'won',         label: 'Won',         icon: CheckCircle2 },
  { key: 'lost',        label: 'Lost',        icon: AlertCircle },
  { key: 'missed',      label: 'Missed',      icon: PhoneMissed },
  { key: 'duplicate',   label: 'Duplicates',  icon: Copy },
];

const GROUP_VIEWS = [
  { key: 'all', label: 'Flat', icon: List },
  { key: 'source', label: 'Source', icon: Tag },
  { key: 'status', label: 'Status', icon: ListFilter },
  { key: 'agent', label: 'Agent', icon: UserCheck },
];

/* ============ SUB-TAB FILTERS ============ */
const TAB_FILTERS = {
  all:        () => true,
  fresh:      (l) => l.status === 'Fresh',
  assigned:   (l) => !!l.assignedAgent && l.assignedAgent !== 'Unassigned',
  unassigned: (l) => !l.assignedAgent || l.assignedAgent === 'Unassigned',
  followup:   (l) => l.status === 'Follow Up',
  won:        (l) => l.status === 'Won',
  lost:       (l) => l.status === 'Lost',
  missed:     (l) => l.status === 'Missed',
  duplicate:  () => true,
};

const STORAGE_PREFIX = 'leads:';

/* ============ HELPERS ============ */
let uidCounter = 0;
const uid = (prefix) =>
  `${prefix}-${Date.now()}-${++uidCounter}-${Math.random().toString(36).slice(2, 6)}`;

const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
};

export default function Leads() {
  const { activeWebsiteId, activeWebsite } = useAuth();

  /* ========== LOCAL DATA (with persistence) ========== */
  const [allLeads, setAllLeads] = useState(() =>
    loadState(
      `list:${activeWebsiteId}`,
      INITIAL_LEADS
        .filter((l) => l.websiteId === activeWebsiteId)
        .map((l) => ({
          ...l,
          status: l.status || 'Fresh',
          leadSource: l.leadSource || 'Website',
          notes: l.notes || [],
        }))
    )
  );

  /* Reload when website changes */
  useEffect(() => {
    setAllLeads(
      loadState(
        `list:${activeWebsiteId}`,
        INITIAL_LEADS
          .filter((l) => l.websiteId === activeWebsiteId)
          .map((l) => ({
            ...l,
            status: l.status || 'Fresh',
            leadSource: l.leadSource || 'Website',
            notes: l.notes || [],
          }))
      )
    );
    setSelectedIds(new Set());
    setActiveTab('all');
  }, [activeWebsiteId]);

  /* Persist to localStorage */
  useEffect(() => {
    saveState(`list:${activeWebsiteId}`, allLeads);
  }, [allLeads, activeWebsiteId]);

  /* ========== SUB-TAB ========== */
  const [activeTab, setActiveTab] = useState('all');

  /* ========== FILTERS ========== */
  const [sourceFilter, setSourceFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupView, setGroupView] = useState('all');

  /* ========== UI ========== */
  const [sourceOpen, setSourceOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  /* ========== SELECTION ========== */
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showMergeDuplicate, setShowMergeDuplicate] = useState(null);

  /* ========== DRAWERS / MODALS ========== */
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [historyLead, setHistoryLead] = useState(null);

  /* ========== ACTIONS ========== */
  const [callingLead, setCallingLead] = useState(null);
  const [followUpLead, setFollowUpLead] = useState(null);
  const [notesLead, setNotesLead] = useState(null);
  const [callLog, setCallLog] = useState([]);
  const [toast, setToast] = useState(null);

  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  /* ========== HELPERS ========== */
  const agentName = (agentId) =>
    agents.find((a) => a.id === agentId)?.name ||
    AGENTS.find((a) => a.id === agentId)?.name ||
    'Unassigned';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ========== COUNTS PER TAB ========== */
  const tabCounts = useMemo(() => {
    const counts = {};
    LEAD_TABS.forEach((t) => {
      counts[t.key] = allLeads.filter(TAB_FILTERS[t.key]).length;
    });
    return counts;
  }, [allLeads]);

  /* ========== BASE LEADS ========== */
  const baseLeads = useMemo(() => {
    let leads = allLeads.filter(TAB_FILTERS[activeTab]);
    if (sourceFilter !== 'All') leads = leads.filter((l) => l.leadSource === sourceFilter);
    if (agentFilter !== 'All') leads = leads.filter((l) => (l.assignedAgent || 'Unassigned') === agentFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      leads = leads.filter((l) => {
        const hay = `${l.name} ${l.mobile} ${l.account || ''} ${l.leadSource}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return leads;
  }, [allLeads, activeTab, sourceFilter, agentFilter, searchQuery]);

  /* ========== DUPLICATES ========== */
  const duplicatesMap = useMemo(() => {
    const byMobile = {};
    baseLeads.forEach((l) => {
      if (!byMobile[l.mobile]) byMobile[l.mobile] = [];
      byMobile[l.mobile].push(l.id);
    });
    const dupIds = new Set();
    Object.values(byMobile).forEach((ids) => {
      if (ids.length > 1) ids.forEach((id) => dupIds.add(id));
    });
    return dupIds;
  }, [baseLeads]);

  const duplicateCount = duplicatesMap.size;

  /* ========== TAB-AWARE DISPLAY ========== */
  const displayedLeads = useMemo(() => {
    if (activeTab === 'duplicate') return baseLeads.filter((l) => duplicatesMap.has(l.id));
    return baseLeads;
  }, [baseLeads, duplicatesMap, activeTab]);

  /* ========== GROUPING ========== */
  const groupedLeads = useMemo(() => {
    if (activeTab === 'duplicate') {
      const byMobile = {};
      displayedLeads.forEach((l) => {
        if (!byMobile[l.mobile]) byMobile[l.mobile] = [];
        byMobile[l.mobile].push(l);
      });
      return byMobile;
    }
    if (groupView === 'all') return { All: displayedLeads };
    const keyFn = {
      source: (l) => l.leadSource || 'Other',
      status: (l) => l.status || 'Fresh',
      agent: (l) => l.assignedAgent || 'Unassigned',
    }[groupView];

    return displayedLeads.reduce((acc, lead) => {
      const key = keyFn(lead);
      if (!acc[key]) acc[key] = [];
      acc[key].push(lead);
      return acc;
    }, {});
  }, [displayedLeads, groupView, activeTab]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = baseLeads.length;
    const followUps = baseLeads.filter((l) => l.status === 'Follow Up').length;
    const missed = baseLeads.filter((l) => l.status === 'Missed').length;
    const won = baseLeads.filter((l) => l.status === 'Won').length;
    const fresh = baseLeads.filter((l) => l.status === 'Fresh').length;
    const assigned = baseLeads.filter((l) => l.assignedAgent && l.assignedAgent !== 'Unassigned').length;
    const unassigned = total - assigned;
    const conversion = total > 0 ? Math.round((won / total) * 100) : 0;
    return { total, followUps, missed, won, fresh, assigned, unassigned, conversion };
  }, [baseLeads]);

  /* ========== ACTIONS ========== */
  const handleAssignLead = (leadId, agentId) => {
    const name = agentName(agentId);
    setAllLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, assignedAgentId: agentId, assignedAgent: name }
          : l
      )
    );
    setSelected((prev) =>
      prev && prev.id === leadId
        ? { ...prev, assignedAgentId: agentId, assignedAgent: name }
        : prev
    );
    showToast(`Lead assigned to ${name || 'Unassigned'}`);
  };

  const handleBulkAssign = (agentId) => {
    const name = agentName(agentId);
    setAllLeads((prev) =>
      prev.map((l) =>
        selectedIds.has(l.id)
          ? { ...l, assignedAgentId: agentId, assignedAgent: name }
          : l
      )
    );
    showToast(`${selectedIds.size} leads assigned to ${name}`);
    setSelectedIds(new Set());
    setShowBulkAssign(false);
  };

  const handleBulkStatus = (status) => {
    setAllLeads((prev) =>
      prev.map((l) => (selectedIds.has(l.id) ? { ...l, status } : l))
    );
    showToast(`${selectedIds.size} leads updated to ${status}`);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    setAllLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)));
    setSelectedIds(new Set());
    showToast(`${count} leads deleted`, 'error');
  };

  const handleDeleteLead = (leadId) => {
    setAllLeads((prev) => prev.filter((l) => l.id !== leadId));
    setSelectedIds((prev) => {
      if (prev.has(leadId)) {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      }
      return prev;
    });
    setConfirmDelete(null);
    setMenuOpenId(null);
    showToast('Lead deleted', 'error');
  };

  const handleToggleSelect = (leadId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === displayedLeads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(displayedLeads.map((l) => l.id)));
  };

  /* ========== MERGE DUPLICATES (keeps notes from all) ========== */
  const handleMergeDuplicates = (mobile, primaryId, mergedIds) => {
    const idsToDelete = new Set(mergedIds.filter((id) => id !== primaryId));

    setAllLeads((prev) => {
      const primary = prev.find((l) => l.id === primaryId);
      const duplicates = prev.filter((l) => idsToDelete.has(l.id));

      const allNotes = [
        ...(primary?.notes || []),
        ...duplicates.flatMap((d) => d.notes || []),
      ].sort((a, b) => (b.id || 0) - (a.id || 0));

      const merged = primary
        ? { ...primary, notes: allNotes }
        : null;

      return prev
        .filter((l) => !idsToDelete.has(l.id))
        .map((l) => (l.id === primaryId && merged ? merged : l));
    });

    setShowMergeDuplicate(null);
    showToast(`Merged ${mergedIds.length} leads into one`);
  };

  /* ========== EXPORT ========== */
  const handleExport = (scope = 'filtered') => {
    const list = scope === 'selected'
      ? allLeads.filter((l) => selectedIds.has(l.id))
      : displayedLeads;
    if (list.length === 0) {
      showToast('No leads to export', 'error');
      return;
    }
    const rows = [
      ['S.No', 'Name', 'Mobile', 'Email', 'Source', 'Account', 'Agent', 'Status', 'Follow-up'],
      ...list.map((l, i) => [
        i + 1, l.name, l.mobile, l.email || '', l.leadSource,
        l.account || '', l.assignedAgent || 'Unassigned', l.status,
        l.followUpDate || '',
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${activeWebsite?.name || 'website'}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${list.length} leads`);
  };

  /* ========== CALL HANDLERS ========== */
  const handleCallNow = (lead) => {
    setMenuOpenId(null);
    setCallingLead(lead);
  };

  const handleCallEnd = (lead, duration, disposition) => {
    const entry = {
      id: uid('call'),
      leadName: lead.name,
      phone: lead.mobile,
      duration,
      disposition,
      time: new Date().toLocaleTimeString(),
    };
    setCallLog((prev) => [entry, ...prev].slice(0, 10));

    setAllLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              status:
                disposition === 'Missed'
                  ? 'Missed'
                  : disposition === 'Connected' && l.status === 'Fresh'
                  ? 'Follow Up'
                  : l.status,
              notes: [
                ...(l.notes || []),
                {
                  id: uid('n'),
                  text: `Call ${disposition.toLowerCase()} · ${duration}`,
                  by: 'System',
                  at: new Date().toLocaleString(),
                },
              ].slice(0, 20),
            }
          : l
      )
    );

    setCallingLead(null);
    showToast(
      disposition === 'Connected'
        ? `Call connected · ${duration}`
        : `Call ${disposition.toLowerCase()} · ${duration}`,
      disposition === 'Connected' ? 'success' : 'error'
    );
  };

  /* ========== FOLLOW-UP ========== */
  const handleSetFollowUp = (lead) => {
    setMenuOpenId(null);
    setFollowUpLead(lead);
  };

  const handleSaveFollowUp = (lead, { date, time, notes }) => {
    const followUpDate = `${date}${time ? ` · ${time}` : ''}`;
    setAllLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id
          ? { ...l, followUpDate, status: 'Follow Up', followUpNotes: notes }
          : l
      )
    );
    setSelected((prev) =>
      prev && prev.id === lead.id
        ? { ...prev, followUpDate, status: 'Follow Up', followUpNotes: notes }
        : prev
    );
    setFollowUpLead(null);
    showToast(`Follow-up scheduled for ${date}${time ? ` at ${time}` : ''}`);
  };

  /* ========== NOTES ========== */
  const handleSaveNote = (lead, note) => {
    const newNote = {
      id: uid('n'),
      text: note,
      by: 'Admin',
      at: new Date().toLocaleString(),
    };
    setAllLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id
          ? { ...l, notes: [newNote, ...(l.notes || [])] }
          : l
      )
    );
    setSelected((prev) =>
      prev && prev.id === lead.id
        ? { ...prev, notes: [newNote, ...(prev.notes || [])] }
        : prev
    );
    setNotesLead(null);
    showToast('Note added');
  };

  /* ========== ADD / EDIT ========== */
  const handleAddLead = (data) => {
    const newLead = {
      id: uid('lead'),
      websiteId: activeWebsiteId,
      name: data.name,
      mobile: data.mobile,
      email: data.email || '',
      leadSource: data.leadSource,
      account: data.account || '—',
      assignedAgent: data.assignedAgent || 'Unassigned',
      assignedAgentId: data.assignedAgentId || '',
      status: 'Fresh',
      followUpDate: '',
      followUpNotes: '',
      notes: [],
    };
    setAllLeads((prev) => [newLead, ...prev]);
    setShowAddLead(false);
    showToast('Lead added');
  };

  const handleUpdateLead = (id, data) => {
    setAllLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...data } : prev));
    setEditLead(null);
    showToast('Lead updated');
  };

  /* ========== IMPORT ========== */
  const handleImportLeads = (parsedRows) => {
    const newLeads = parsedRows
      .map((row) => ({
        id: uid('lead-import'),
        name: row.name || row.Name || 'Unnamed Lead',
        mobile: String(row.mobile || row.Mobile || row.phone || '').replace(/\D/g, '').slice(0, 10),
        email: row.email || row.Email || '',
        leadSource: row.source || row.Source || 'Other',
        account: row.account || row.Account || '—',
        websiteId: activeWebsiteId,
        assignedAgent: 'Unassigned',
        assignedAgentId: '',
        status: 'Fresh',
        followUpDate: '',
        followUpNotes: '',
        notes: [],
      }))
      .filter((l) => l.name && l.mobile);

    if (newLeads.length === 0) {
      showToast('No valid rows found in CSV', 'error');
      return;
    }

    setAllLeads((prev) => [...newLeads, ...prev]);
    setShowImportModal(false);
    showToast(`Imported ${newLeads.length} lead${newLeads.length !== 1 ? 's' : ''}`);
  };

  /* ========== FILTER STATE ========== */
  const hasFilters =
    sourceFilter !== 'All' ||
    agentFilter !== 'All' ||
    searchQuery;

  const clearFilters = () => {
    setSourceFilter('All');
    setAgentFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">
              Lead Management
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Building2 size={13} className="text-brand-magenta" />
              Complete pipeline for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddLead(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
            >
              <Plus size={14} /> Add Lead
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <Upload size={14} /> Import
            </button>
            <button
              onClick={() => handleExport('filtered')}
              className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* ================= KPI STRIP — 5 PER ROW ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">
                  Lead Analytics
                </p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <AnimatedStatCard
              label="Total Leads"
              value={summary.total}
              sub={`${summary.fresh} fresh`}
              icon={Users}
              color="purple"
              trend="+12%"
              trendUp
              delay={0}
            />
            <AnimatedStatCard
              label="Assigned"
              value={summary.assigned}
              sub={`${summary.unassigned} pending`}
              icon={UserCheck}
              color="emerald"
              trend="+5"
              trendUp
              delay={40}
            />
            <AnimatedStatCard
              label="Follow-ups"
              value={summary.followUps}
              sub="Pending action"
              icon={ClipboardList}
              color="amber"
              trend="+3"
              trendUp
              delay={80}
            />
            <AnimatedStatCard
              label="Conversion"
              value={`${summary.conversion}%`}
              sub={`${summary.won} won`}
              icon={Percent}
              color="rose"
              trend="+3%"
              trendUp
              delay={120}
            />
            <AnimatedStatCard
              label="Missed Calls"
              value={summary.missed}
              sub="Need follow-up"
              icon={PhoneMissed}
              color="rose"
              trend="-2"
              trendUp={false}
              delay={160}
            />
          </div>
        </div>

        {/* ================= CALL LOG (SESSION) ================= */}
        {callLog.length > 0 && (
          <div className="card !p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
                <Headphones size={14} className="text-brand-magenta" />
                Recent Calls (this session)
              </h3>
              <button onClick={() => setCallLog([])} className="text-xs font-semibold text-rose-500 hover:underline">
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {callLog.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 bg-white p-2.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    c.disposition === 'Connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'
                  }`}>
                    {c.disposition === 'Connected' ? <PhoneOutgoing size={14} /> : <PhoneMissed size={14} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{c.leadName}</p>
                    <p className="truncate text-xs text-brand-ink/50">{c.phone}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-brand-ink">{c.duration}</p>
                    <p className="text-[10px] text-brand-ink/40">{c.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TOOLBAR ================= */}
        <div className="card !p-3">
          <div className="flex flex-wrap items-center gap-2">
            {GROUP_VIEWS.map((g) => {
              const Icon = g.icon;
              const active = groupView === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => setGroupView(g.key)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  <Icon size={12} />
                  {g.label}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2">
              {duplicateCount > 0 && (
                <button
                  onClick={() => setActiveTab('duplicate')}
                  className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-600 hover:bg-amber-100"
                >
                  <AlertCircle size={12} />
                  {duplicateCount} duplicates
                </button>
              )}
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-full border p-1.5 ${
                  viewMode === 'list'
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                    : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
                }`}
                title="List view"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-full border p-1.5 ${
                  viewMode === 'grid'
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                    : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
                }`}
                title="Grid view"
              >
                <Grid3x3 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= SEARCH + SOURCE + AGENT FILTERS ================= */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, mobile, account, source..."
              className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac"
              >
                <X size={14} className="text-brand-ink/50" />
              </button>
            )}
          </div>

          <DropdownFilter
            label="Source"
            icon={Tag}
            value={sourceFilter}
            options={['All', ...SOURCES]}
            open={sourceOpen}
            onToggle={() => {
              setSourceOpen((s) => !s);
              setAgentOpen(false);
            }}
            onChange={(v) => {
              setSourceFilter(v);
              setSourceOpen(false);
            }}
          />

          <DropdownFilter
            label="Agent"
            icon={UserCheck}
            value={agentFilter}
            options={['All', 'Unassigned', ...agents.map((a) => a.name)]}
            open={agentOpen}
            onToggle={() => {
              setAgentOpen((s) => !s);
              setSourceOpen(false);
            }}
            onChange={(v) => {
              setAgentFilter(v);
              setAgentOpen(false);
            }}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* ================= SUB-TABS ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {LEAD_TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count = tabCounts[t.key];
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
          </div>
        </div>

        {/* ================= BULK SELECT BAR ================= */}
        {displayedLeads.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-full border border-brand-lilac bg-white px-4 py-2.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink/70">
              <input
                type="checkbox"
                checked={selectedIds.size === displayedLeads.length && displayedLeads.length > 0}
                onChange={handleToggleSelectAll}
                className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
              />
              Select all
            </label>
            <span className="text-xs text-brand-ink/50">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${displayedLeads.length} leads`}
            </span>

            {selectedIds.size > 0 && (
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setShowBulkAssign(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
                >
                  <UserCheck size={12} /> Assign
                </button>
                <button
                  onClick={() => handleBulkStatus('Follow Up')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-600 hover:bg-amber-100"
                >
                  <Calendar size={12} /> Follow-up
                </button>
                <button
                  onClick={() => handleBulkStatus('Won')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-100"
                >
                  <CheckCircle2 size={12} /> Mark Won
                </button>
                <button
                  onClick={() => handleExport('selected')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
                >
                  <Download size={12} /> Export
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-100"
                >
                  <Trash2 size={12} /> Delete
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-brand-ink/50 hover:bg-brand-lilac/40"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= LEADS CONTENT ================= */}
        {displayedLeads.length === 0 ? (
          <EmptyState hasFilters={hasFilters || activeTab !== 'all'} onClear={clearFilters} tab={activeTab} />
        ) : activeTab === 'duplicate' ? (
          <div className="space-y-4">
            {Object.entries(groupedLeads).map(([mobile, group]) => (
              <div key={mobile} className="card !p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <Copy size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-ink">{group[0]?.name || 'Unknown'}</p>
                      <p className="text-xs text-brand-ink/50">{mobile} · {group.length} entries</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMergeDuplicate({ mobile, leads: group })}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-100"
                  >
                    <Sparkles size={12} /> Merge
                  </button>
                </div>
                <div className="space-y-2">
                  {group.map((lead) => (
                    <LeadItem
                      key={lead.id}
                      lead={lead}
                      viewMode="list"
                      agentName={agentName}
                      isDuplicate
                      isSelected={selectedIds.has(lead.id)}
                      onToggleSelect={() => handleToggleSelect(lead.id)}
                      onView={() => setSelected(lead)}
                      onCall={() => handleCallNow(lead)}
                      onFollowUp={() => handleSetFollowUp(lead)}
                      onEdit={() => setEditLead(lead)}
                      onHistory={() => setHistoryLead(lead)}
                      onAddNote={() => setNotesLead(lead)}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                      onAssignClick={() => {
                        setSelected(lead);
                        setMenuOpenId(null);
                      }}
                      onDelete={() => {
                        setConfirmDelete(lead);
                        setMenuOpenId(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLeads).map(([groupName, groupLeads]) => (
              <div key={groupName} className="space-y-3">
                {groupView !== 'all' && (
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-semibold text-brand-ink">{groupName}</h3>
                    <span className="rounded-full bg-brand-lilac px-2 py-0.5 text-[10px] font-bold text-brand-purple">
                      {groupLeads.length}
                    </span>
                  </div>
                )}
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
                      : 'space-y-2'
                  }
                >
                  {groupLeads.map((lead) => (
                    <LeadItem
                      key={lead.id}
                      lead={lead}
                      viewMode={viewMode}
                      agentName={agentName}
                      isDuplicate={duplicatesMap.has(lead.id)}
                      isSelected={selectedIds.has(lead.id)}
                      onToggleSelect={() => handleToggleSelect(lead.id)}
                      onView={() => setSelected(lead)}
                      onCall={() => handleCallNow(lead)}
                      onFollowUp={() => handleSetFollowUp(lead)}
                      onEdit={() => setEditLead(lead)}
                      onHistory={() => setHistoryLead(lead)}
                      onAddNote={() => setNotesLead(lead)}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                      onAssignClick={() => {
                        setSelected(lead);
                        setMenuOpenId(null);
                      }}
                      onDelete={() => {
                        setConfirmDelete(lead);
                        setMenuOpenId(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= DRAWERS / MODALS ================= */}
        {selected && (
          <LeadDrawer
            lead={selected}
            agents={agents}
            onAssign={handleAssignLead}
            onCall={() => handleCallNow(selected)}
            onFollowUp={() => handleSetFollowUp(selected)}
            onAddNote={() => setNotesLead(selected)}
            onEdit={() => {
              setEditLead(selected);
              setSelected(null);
            }}
            onHistory={() => setHistoryLead(selected)}
            onClose={() => setSelected(null)}
          />
        )}

        {showBulkAssign && (
          <BulkAssignModal
            agents={agents}
            count={selectedIds.size}
            onAssign={handleBulkAssign}
            onClose={() => setShowBulkAssign(false)}
          />
        )}

        {showImportModal && (
          <ImportModal onClose={() => setShowImportModal(false)} onImport={handleImportLeads} />
        )}

        {showAddLead && (
          <AddLeadModal agents={agents} onSave={handleAddLead} onClose={() => setShowAddLead(false)} />
        )}

        {editLead && (
          <EditLeadModal
            lead={editLead}
            agents={agents}
            onSave={handleUpdateLead}
            onClose={() => setEditLead(null)}
          />
        )}

        {historyLead && (
          <HistoryModal lead={historyLead} onClose={() => setHistoryLead(null)} />
        )}

        {notesLead && (
          <NotesModal lead={notesLead} onSave={handleSaveNote} onClose={() => setNotesLead(null)} />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title="Delete lead?"
            message={`This will permanently delete "${confirmDelete.name}" and all associated data. This action cannot be undone.`}
            confirmLabel="Delete Lead"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDeleteLead(confirmDelete.id)}
          />
        )}

        {callingLead && (
          <CallModal
            target={callingLead}
            onClose={() => setCallingLead(null)}
            onEnd={(duration, disposition) => handleCallEnd(callingLead, duration, disposition)}
          />
        )}

        {followUpLead && (
          <FollowUpModal
            lead={followUpLead}
            onClose={() => setFollowUpLead(null)}
            onSave={(data) => handleSaveFollowUp(followUpLead, data)}
          />
        )}

        {showMergeDuplicate && (
          <MergeDuplicateModal
            mobile={showMergeDuplicate.mobile}
            leads={showMergeDuplicate.leads}
            onClose={() => setShowMergeDuplicate(null)}
            onMerge={handleMergeDuplicates}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ================================================================
   ANIMATED STAT CARD
   ================================================================ */
function AnimatedStatCard({ label, value, sub, icon: Icon, color, trend, trendUp, delay = 0 }) {
  const numeric = typeof value === 'number' ? value : 0;
  const animated = useAnimatedCount(numeric);
  const display = typeof value === 'number' ? animated : value;

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
  const t = themes[color] || themes.purple;

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 animate-fade-slide-in ${t.border} ${t.shadow}`}
    >
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
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
          {display}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
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
    const to = Number(target) || 0;

    const tick = (now) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display.toLocaleString();
}

/* ================================================================
   DROPDOWN FILTER
   ================================================================ */
function DropdownFilter({ label, icon: Icon, value, options, open, onToggle, onChange }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        {label}: <span className="font-semibold text-brand-magenta">{value}</span>
        <ChevronDown size={14} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
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

/* ================================================================
   LEAD ITEM
   ================================================================ */
function LeadItem({
  lead, viewMode, agentName, isDuplicate, isSelected,
  onToggleSelect, onView, onCall, onFollowUp, onEdit, onHistory, onAddNote,
  menuOpenId, setMenuOpenId, onAssignClick, onDelete,
}) {
  if (viewMode === 'grid') {
    return (
      <div
        className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)] ${
          isDuplicate ? 'border-amber-300 hover:border-amber-400' : 'border-brand-lilac/80 hover:border-brand-magenta/50'
        }`}
      >
        <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />

        <div className="relative flex flex-col p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="mt-1 h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
            />
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-sm font-bold text-white shadow-md">
              {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <button onClick={onView} className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta">
                  {lead.name}
                </button>
                {isDuplicate && (
                  <span title="Possible duplicate" className="flex items-center text-amber-500">
                    <AlertCircle size={12} />
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-brand-ink/50">{lead.mobile}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-500'}`}>
              {lead.status}
            </span>
          </div>

          <div className="mt-3 space-y-1.5 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-2.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-brand-ink/50"><Tag size={10} /> Source</span>
              <span className="truncate font-semibold text-brand-ink">{lead.leadSource}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-brand-ink/50"><UserIcon size={10} /> Agent</span>
              <span className="truncate font-semibold text-brand-ink">{lead.assignedAgent || 'Unassigned'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-brand-ink/50"><Calendar size={10} /> Follow-up</span>
              <span className="truncate font-medium text-brand-ink">{lead.followUpDate || '—'}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button onClick={onView} className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta">
              <Eye size={12} /> View
            </button>
            <button onClick={onCall} className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110">
              <Phone size={12} /> Call
            </button>
            <button onClick={onFollowUp} className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2 text-xs font-semibold text-white shadow-card hover:brightness-110">
              <Calendar size={12} /> Follow
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
        isDuplicate ? 'border-amber-200 hover:border-amber-300' : 'border-brand-lilac/70 hover:border-brand-magenta/40'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="h-4 w-4 shrink-0 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
      />

      <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-xs font-bold text-white shadow-sm sm:flex">
        {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <button onClick={onView} className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta">
            {lead.name}
          </button>
          {isDuplicate && (
            <span title="Possible duplicate" className="shrink-0 text-amber-500">
              <AlertCircle size={12} />
            </span>
          )}
        </div>
        <p className="truncate text-xs text-brand-ink/50">{lead.mobile}</p>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="flex items-center gap-1 text-brand-ink/40"><Tag size={10} /> Source</p>
        <p className="font-semibold text-brand-ink/70">{lead.leadSource}</p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="flex items-center gap-1 text-brand-ink/40"><UserIcon size={10} /> Agent</p>
        <p className="font-semibold text-brand-ink/70">{lead.assignedAgent || 'Unassigned'}</p>
      </div>

      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-500'}`}>
        {lead.status}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button onClick={onCall} className="hidden h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100 sm:flex" title="Call">
          <Phone size={13} />
        </button>
        <button onClick={onFollowUp} className="hidden h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition-all hover:bg-amber-100 sm:flex" title="Set Follow-up">
          <Calendar size={13} />
        </button>
        <button onClick={onView} className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta sm:flex" title="View">
          <Eye size={13} />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpenId(menuOpenId === lead.id ? null : lead.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 transition-colors hover:bg-brand-lilac"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === lead.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={Eye} label="View Details" onClick={onView} />
                <MenuItem icon={Edit3} label="Edit Lead" onClick={onEdit} />
                <MenuItem icon={UserCheck} label="Assign to Agent" onClick={onAssignClick} />
                <MenuItem icon={Phone} label="Call Lead" onClick={onCall} />
                <MenuItem icon={Calendar} label="Set Follow-up" onClick={onFollowUp} />
                <MenuItem icon={StickyNote} label="Add Note" onClick={onAddNote} />
                <MenuItem icon={History} label="View History" onClick={onHistory} />
                <MenuItem
                  icon={MessageCircle}
                  label="WhatsApp"
                  onClick={() => {
                    window.open(`https://wa.me/91${lead.mobile}`, '_blank');
                    setMenuOpenId(null);
                  }}
                />
                <div className="my-1 h-px bg-brand-lilac/60" />
                <MenuItem icon={Trash2} label="Delete" danger onClick={onDelete} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MENU ITEM
   ================================================================ */
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

/* ================================================================
   EMPTY STATE
   ================================================================ */
function EmptyState({ hasFilters, onClear, tab }) {
  const messages = {
    all: 'No leads yet',
    fresh: 'No fresh leads right now',
    assigned: 'No assigned leads yet',
    unassigned: 'No unassigned leads — all caught up!',
    followup: 'No follow-ups pending',
    won: 'No won leads yet',
    lost: 'No lost leads',
    missed: 'No missed leads',
    duplicate: 'No duplicates found',
  };
  const msg = hasFilters ? 'No leads match your filters' : messages[tab] || 'No leads yet';

  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Inbox size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">{msg}</p>
      {hasFilters && (
        <button onClick={onClear} className="text-xs font-semibold text-brand-magenta hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );
}

/* ================================================================
   MERGE DUPLICATE MODAL
   ================================================================ */
function MergeDuplicateModal({ mobile, leads, onClose, onMerge }) {
  const [primaryId, setPrimaryId] = useState(leads[0]?.id);

  const handleMerge = () => {
    onMerge(mobile, primaryId, leads.map((l) => l.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Merge Duplicates</h3>
              <p className="text-xs text-brand-ink/50">{mobile} · {leads.length} entries</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          <p className="flex items-center gap-1.5 font-semibold">
            <AlertCircle size={12} /> Select the record to keep
          </p>
          <p className="mt-1 text-amber-600/90">
            The other {leads.length - 1} records will be permanently deleted.
          </p>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {leads.map((lead) => (
            <label
              key={lead.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                primaryId === lead.id
                  ? 'border-brand-magenta bg-brand-magenta/5'
                  : 'border-brand-lilac hover:border-brand-magenta/40'
              }`}
            >
              <input
                type="radio"
                checked={primaryId === lead.id}
                onChange={() => setPrimaryId(lead.id)}
                className="h-4 w-4 text-brand-magenta focus:ring-brand-magenta/30"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-ink">{lead.name}</p>
                <p className="truncate text-xs text-brand-ink/50">
                  {lead.leadSource} · {lead.status}
                </p>
                {lead.assignedAgent && (
                  <p className="truncate text-[10px] text-brand-ink/40">Agent: {lead.assignedAgent}</p>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button
            onClick={handleMerge}
            className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            Merge {leads.length} → 1
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   LEAD DRAWER
   ================================================================ */
function LeadDrawer({ lead, agents, onAssign, onCall, onFollowUp, onAddNote, onEdit, onHistory, onClose }) {
  const recordings = useMemo(
    () => [
      { id: 1, type: 'inbound', duration: '3:42', date: 'Today · 10:24 AM', agent: lead.assignedAgent || 'Unassigned', summary: 'Discussing pricing options.' },
      { id: 2, type: 'outbound', duration: '1:18', date: 'Yesterday · 4:12 PM', agent: lead.assignedAgent || 'Unassigned', summary: 'Follow-up on brochure.' },
      { id: 3, type: 'inbound', duration: '0:47', date: '3 days ago · 11:05 AM', agent: 'Missed', summary: 'Missed call — no answer.' },
    ],
    [lead]
  );

  const agentFollowUps = useMemo(
    () => (FOLLOW_UPS || []).filter((f) => f.leadId === lead.id),
    [lead.id]
  );
  const leadCalls = useMemo(
    () => (CALLS || []).filter((c) => c.leadId === lead.id),
    [lead.id]
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-brand-ink">Lead Details</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-sm font-bold text-white">
              {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{lead.name}</p>
              <p className="text-sm text-brand-ink/50">{lead.mobile}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-500'}`}>
              {lead.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Calls" value={leadCalls.length} color="purple" />
            <InfoBox label="Follow-ups" value={agentFollowUps.length} color="amber" />
            <InfoBox label="Recordings" value={recordings.length} color="emerald" />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Lead Information</h4>
            <Row label="Lead Source" value={lead.leadSource} />
            <Row label="Account" value={lead.account || '—'} />
            <Row label="Follow-up" value={lead.followUpDate || '—'} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Lead Assignment</h4>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Assigned Agent</label>
              <select
                value={lead.assignedAgentId || ''}
                onChange={(e) => onAssign(lead.id, e.target.value)}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onCall}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Phone size={16} /> Call Now
            </button>
            <button
              onClick={onFollowUp}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Calendar size={16} /> Set Follow-up
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={onEdit} className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <Edit3 size={12} /> Edit
            </button>
            <button onClick={onAddNote} className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <StickyNote size={12} /> Note
            </button>
            <button onClick={onHistory} className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
              <History size={12} /> History
            </button>
          </div>

          {lead.notes && lead.notes.length > 0 && (
            <div className="card !p-4 space-y-2">
              <h4 className="font-display text-sm font-semibold text-brand-ink">Recent Notes</h4>
              {lead.notes.slice(0, 3).map((n) => (
                <div key={n.id} className="rounded-lg border border-brand-lilac/60 bg-brand-mist/40 p-2.5">
                  <p className="text-xs text-brand-ink">{n.text}</p>
                  <p className="mt-1 text-[10px] text-brand-ink/40">
                    {n.by} • {n.at}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <Mic size={12} /> Call Recordings
              </p>
              <span className="text-xs text-brand-ink/50">{recordings.length} recordings</span>
            </div>
            <div className="space-y-2.5">
              {recordings.map((rec) => (
                <RecordingRow key={rec.id} rec={rec} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              Latest transcript snippet
            </p>
            <p className="text-sm italic leading-relaxed text-brand-ink/70">
              "Agent: Good afternoon, this is {lead.assignedAgent || 'our agent'} from Eliteinova Global. Am I speaking with {lead.name.split(' ')[0]}?
              <br />
              Customer: Yes, speaking.
              <br />
              Agent: I'm calling regarding your enquiry — do you have a moment?"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   RECORDING ROW
   ================================================================ */
function RecordingRow({ rec }) {
  const isMissed = rec.agent === 'Missed';
  return (
    <div className="rounded-xl border border-brand-lilac bg-white p-3">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isMissed ? 'bg-rose-50 text-rose-500' : rec.type === 'inbound' ? 'bg-emerald-50 text-emerald-500' : 'bg-violet-50 text-brand-purple'
        }`}>
          {isMissed ? <PhoneMissed size={16} /> : rec.type === 'inbound' ? <PhoneIncoming size={16} /> : <PhoneOutgoing size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-ink">
            {isMissed ? 'Missed call' : rec.type === 'inbound' ? 'Inbound call' : 'Outbound call'}
          </p>
          <p className="text-xs text-brand-ink/50">
            {rec.date} • Agent: {rec.agent}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-semibold text-brand-ink/60">
            <Clock size={10} /> {rec.duration}
          </span>
          {!isMissed && (
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card" title="Play recording">
              <Play size={12} fill="currentColor" />
            </button>
          )}
        </div>
      </div>
      {rec.summary && (
        <p className="mt-2 border-t border-brand-lilac/60 pt-2 text-xs text-brand-ink/60">{rec.summary}</p>
      )}
    </div>
  );
}

/* ================================================================
   CALL MODAL
   ================================================================ */
function CallModal({ target, onClose, onEnd }) {
  const [callState, setCallState] = useState('ringing');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [notes, setNotes] = useState('');

  const phone = target.mobile || '';
  const displayName = target.name;

  useEffect(() => {
    if (callState !== 'ringing') return;
    const t = setTimeout(() => setCallState('connected'), 2000);
    return () => clearTimeout(t);
  }, [callState]);

  useEffect(() => {
    if (callState !== 'connected') return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [callState]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec.toString().padStart(2, '0')}s`;
  };

  const handleHangUp = (disposition) => {
    onEnd(formatTime(seconds), disposition);
  };

  const handleNativeDial = () => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        <div className={`relative px-6 pb-8 pt-8 text-center text-white ${
          callState === 'connected'
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : callState === 'ringing'
            ? 'bg-gradient-to-br from-brand-magenta to-brand-purple'
            : 'bg-gradient-to-br from-gray-500 to-gray-600'
        }`}>
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20">
            <X size={18} />
          </button>

          <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 text-2xl font-bold">
              {displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          </div>

          <p className="text-lg font-semibold">{displayName}</p>
          <p className="text-xs text-white/70">Lead · {phone}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            {callState === 'ringing' && 'Ringing…'}
            {callState === 'connected' && `Connected · ${formatTime(seconds)}`}
          </p>
        </div>

        <div className="p-6">
          {callState === 'connected' && (
            <>
              <div className="mb-5 grid grid-cols-3 gap-3">
                <CallControl icon={muted ? MicOff : Mic} label={muted ? 'Unmute' : 'Mute'} active={muted} onClick={() => setMuted((m) => !m)} />
                <CallControl icon={speaker ? Volume2 : VolumeX} label="Speaker" active={speaker} onClick={() => setSpeaker((s) => !s)} />
                <CallControl icon={onHold ? PlayCircle : PauseCircle} label={onHold ? 'Resume' : 'Hold'} active={onHold} onClick={() => setOnHold((h) => !h)} />
              </div>

              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Call Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this call..."
                  className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                />
              </div>
            </>
          )}

          {callState === 'ringing' && (
            <p className="mb-5 text-center text-sm text-brand-ink/60">
              Connecting your call to <span className="font-semibold text-brand-ink">{displayName}</span>…
            </p>
          )}

          <button
            onClick={handleNativeDial}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <PhoneOutgoing size={14} /> Open in Phone App
          </button>

          {callState === 'ringing' ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-3 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                Cancel
              </button>
              <button
                onClick={() => handleHangUp('Missed')}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                <PhoneMissed size={16} /> Missed
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleHangUp('Connected')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <PhoneOff size={16} /> End Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CALL CONTROL
   ================================================================ */
function CallControl({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
        active ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta' : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

/* ================================================================
   FOLLOW-UP MODAL
   ================================================================ */
function FollowUpModal({ lead, onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!date) return setError('Please pick a date.');
    setError('');
    onSave({ date, time, notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Set Follow-up</h3>
              <p className="text-xs text-brand-ink/50">Schedule a follow-up for {lead.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Follow-up Date</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <StickyNote size={12} /> Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any context for this follow-up..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <p className="flex items-center gap-1.5 font-semibold">
              <AlertCircle size={12} /> Lead status will be set to "Follow Up"
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Save Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   BULK ASSIGN MODAL
   ================================================================ */
function BulkAssignModal({ agents, count, onAssign, onClose }) {
  const [selectedAgent, setSelectedAgent] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Bulk Assign</h3>
              <p className="text-xs text-brand-ink/50">Assign {count} selected lead{count !== 1 ? 's' : ''} to an agent</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Select Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option value="">Choose an agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              Cancel
            </button>
            <button
              onClick={() => selectedAgent && onAssign(selectedAgent)}
              disabled={!selectedAgent}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   ADD LEAD MODAL
   ================================================================ */
function AddLeadModal({ agents, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    leadSource: 'Website',
    account: '',
    assignedAgentId: '',
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return setError('Name is required.');
    if (!/^\d{10}$/.test(form.mobile)) return setError('Mobile must be 10 digits.');
    setError('');
    onSave({
      ...form,
      assignedAgent: agents.find((a) => a.id === form.assignedAgentId)?.name || 'Unassigned',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Plus size={18} />
            </div>
            <h3 className="font-display text-lg font-semibold text-brand-ink">Add New Lead</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Full Name *" value={form.name} onChange={(v) => set('name', v)} placeholder="e.g. Priya Sharma" />
          <Field label="Mobile *" value={form.mobile} onChange={(v) => set('mobile', v.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" />
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} placeholder="optional" />
          <SelectField label="Source" value={form.leadSource} onChange={(v) => set('leadSource', v)} options={SOURCES} />
          <Field label="Account" value={form.account} onChange={(v) => set('account', v)} placeholder="optional" />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Assign Agent</label>
            <select
              value={form.assignedAgentId}
              onChange={(e) => set('assignedAgentId', e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Add Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EDIT LEAD MODAL
   ================================================================ */
function EditLeadModal({ lead, agents, onSave, onClose }) {
  const [form, setForm] = useState({
    name: lead.name,
    mobile: lead.mobile,
    email: lead.email || '',
    leadSource: lead.leadSource,
    account: lead.account || '',
    status: lead.status,
    assignedAgentId: lead.assignedAgentId || '',
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return setError('Name is required.');
    if (!/^\d{10}$/.test(form.mobile)) return setError('Mobile must be 10 digits.');
    setError('');
    onSave(lead.id, {
      ...form,
      assignedAgent: agents.find((a) => a.id === form.assignedAgentId)?.name || 'Unassigned',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Edit3 size={18} />
            </div>
            <h3 className="font-display text-lg font-semibold text-brand-ink">Edit Lead</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Full Name *" value={form.name} onChange={(v) => set('name', v)} />
          <Field label="Mobile *" value={form.mobile} onChange={(v) => set('mobile', v.replace(/\D/g, '').slice(0, 10))} />
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} />
          <SelectField label="Source" value={form.leadSource} onChange={(v) => set('leadSource', v)} options={SOURCES} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Status" value={form.status} onChange={(v) => set('status', v)} options={ALL_STATUSES} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Agent</label>
              <select
                value={form.assignedAgentId}
                onChange={(e) => set('assignedAgentId', e.target.value)}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   HISTORY MODAL
   ================================================================ */
function HistoryModal({ lead, onClose }) {
  const events = [
    { icon: Plus, label: 'Lead created', at: '3 days ago', color: 'bg-violet-100 text-brand-purple' },
    { icon: UserCheck, label: `Assigned to ${lead.assignedAgent || 'Unassigned'}`, at: '2 days ago', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Phone, label: 'Outbound call — 1m 18s', at: 'Yesterday', color: 'bg-brand-mist text-brand-purple' },
    { icon: Calendar, label: `Follow-up set${lead.followUpDate ? ` for ${lead.followUpDate}` : ''}`, at: 'Yesterday', color: 'bg-amber-100 text-amber-600' },
    ...(lead.notes || []).map((n) => ({
      icon: StickyNote,
      label: `Note: ${n.text}`,
      at: n.at,
      color: 'bg-brand-mist text-brand-purple',
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <History size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Lead History</h3>
              <p className="text-xs text-brand-ink/50">{lead.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="relative max-h-96 space-y-1 overflow-y-auto">
          <span className="pointer-events-none absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-magenta/30 via-brand-purple/20 to-transparent" />
          {events.map((e, i) => {
            const Icon = e.icon;
            return (
              <div key={i} className="relative flex items-start gap-3 rounded-lg p-2">
                <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-2 ring-white ${e.color}`}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-brand-ink">{e.label}</p>
                  <p className="mt-0.5 text-xs text-brand-ink/40">{e.at}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   NOTES MODAL
   ================================================================ */
function NotesModal({ lead, onSave, onClose }) {
  const [text, setText] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <StickyNote size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Add Note</h3>
              <p className="text-xs text-brand-ink/50">{lead.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Write a note about this lead..."
          className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />

        {lead.notes && lead.notes.length > 0 && (
          <div className="mt-4 max-h-40 space-y-2 overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/40">Previous notes</p>
            {lead.notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-brand-lilac/60 bg-brand-mist/40 p-2.5">
                <p className="text-xs text-brand-ink">{n.text}</p>
                <p className="mt-1 text-[10px] text-brand-ink/40">{n.by} • {n.at}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button
            onClick={() => text.trim() && onSave(lead, text.trim())}
            disabled={!text.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   IMPORT MODAL
   ================================================================ */
function ImportModal({ onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = String(evt.target.result || '');
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setError('CSV file has no data rows.');
          setParsedRows([]);
        } else {
          setParsedRows(rows);
        }
      } catch {
        setError('Failed to parse CSV. Please check the file format.');
        setParsedRows([]);
      }
      setParsing(false);
    };
    reader.onerror = () => {
      setError('Could not read the file.');
      setParsing(false);
    };
    reader.readAsText(f);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Import Leads</h3>
              <p className="text-xs text-brand-ink/50">Upload a CSV file with lead data</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-lilac bg-brand-mist/40 px-4 py-8 text-center transition-colors hover:border-brand-magenta/50 hover:bg-brand-magenta/5">
            <FileUp size={24} className="text-brand-magenta" />
            <span className="text-sm font-semibold text-brand-ink">
              {file ? file.name : 'Click to upload CSV file'}
            </span>
            <span className="text-xs text-brand-ink/50">Max file size: 10MB</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>

          <div className="rounded-xl border border-brand-lilac/60 bg-brand-mist/40 p-3 text-xs text-brand-ink/60">
            <p className="font-semibold text-brand-ink/70">Expected columns (header row required):</p>
            <p className="mt-1">Name, Mobile, Email, Source, Account</p>
          </div>

          {parsing && (
            <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3.5 py-2.5 text-xs font-medium text-brand-purple">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-purple/30 border-t-brand-purple" />
              Parsing file…
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {parsedRows.length > 0 && !parsing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 size={14} />
                Ready to import {parsedRows.length} lead{parsedRows.length !== 1 ? 's' : ''}
              </div>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-brand-lilac/60">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-brand-lilac/40">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-brand-ink/70">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-brand-ink/70">Mobile</th>
                      <th className="px-3 py-2 text-left font-semibold text-brand-ink/70">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-brand-lilac/40">
                        <td className="px-3 py-1.5 text-brand-ink">{r.name || r.Name || '—'}</td>
                        <td className="px-3 py-1.5 font-mono text-brand-ink/70">
                          {r.mobile || r.Mobile || r.phone || '—'}
                        </td>
                        <td className="px-3 py-1.5 text-brand-ink/70">
                          {r.source || r.Source || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 20 && (
                <p className="text-[10px] text-brand-ink/40">Showing first 20 of {parsedRows.length} rows</p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              Cancel
            </button>
            <button
              onClick={() => parsedRows.length > 0 && onImport(parsedRows)}
              disabled={parsedRows.length === 0 || parsing}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              Import {parsedRows.length > 0 ? `(${parsedRows.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CSV PARSER
   ================================================================ */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const delimiter = headerLine.includes('\t')
    ? '\t'
    : headerLine.split(',').length >= headerLine.split(';').length
    ? ','
    : ';';

  const splitRow = (row) => {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQuotes && row[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };

  const headers = splitRow(headerLine).map((h) => h.toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    if (values.every((v) => !v)) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? '';
    });
    rows.push(obj);
  }
  return rows;
}

/* ================================================================
   CONFIRM DIALOG
   ================================================================ */
function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
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

/* ================================================================
   TOAST
   ================================================================ */
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

/* ================================================================
   SMALL HELPERS
   ================================================================ */
function InfoBox({ label, value, color = 'purple' }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/60 pb-2">
      <span className="shrink-0 text-brand-ink/50">{label}</span>
      <span className="truncate font-medium text-brand-ink">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}