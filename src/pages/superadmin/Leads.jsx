// src/pages/superadmin/Leads.jsx
import { useMemo, useRef, useState, useEffect } from 'react';
import {
  Phone, MessageCircle, Users, PhoneMissed, ClipboardList, X, Calendar,
  Globe, Search, Filter, Download, Play, ChevronDown, Mic, PhoneIncoming,
  PhoneOutgoing, Clock, Headphones, Upload, Copy, UserCheck, AlertCircle,
  Check, Layers, Tag, ListFilter, Building2, User as UserIcon, Eye,
  MoreVertical, Trash2, Target, TrendingUp, TrendingDown, Percent,
  Award, BarChart3, FileText, UserPlus, Grid3x3, List, MicOff, Volume2,
  VolumeX, PauseCircle, PlayCircle, PhoneOff, CheckCircle2, FileUp,
  StickyNote,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  LEADS as INITIAL_LEADS,
  AGENTS,
  WEBSITES,
  ADMINS,
  CALLS,
  FOLLOW_UPS,
} from '../../data/mockData';

const STATUS_STYLES = {
  Fresh: 'bg-violet-100 text-brand-purple',
  'Follow Up': 'bg-amber-100 text-amber-600',
  Missed: 'bg-rose-100 text-brand-magenta',
  Won: 'bg-emerald-100 text-emerald-600',
  Lost: 'bg-gray-100 text-gray-500',
  Qualified: 'bg-blue-100 text-blue-600',
};

const SOURCES = ['Website', 'Referral', 'Campaign', 'Walk-in', 'Social Media', 'Other'];
const CATEGORIES = ['Matrimony', 'Property', 'Insurance', 'Education', 'Healthcare', 'Other'];
const ALL_STATUSES = ['Fresh', 'Follow Up', 'Qualified', 'Won', 'Lost', 'Missed'];
const GROUP_VIEWS = [
  { key: 'all', label: 'All Leads', icon: List },
  { key: 'project', label: 'Project-wise', icon: Building2 },
  { key: 'source', label: 'Source-wise', icon: Tag },
  { key: 'category', label: 'Category-wise', icon: ClipboardList },
  { key: 'status', label: 'Status-wise', icon: ListFilter },
];

export default function Leads() {
  const { role, activeWebsiteId } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  /* ========== LOCAL DATA ========== */
  const [allLeads, setAllLeads] = useState(
    INITIAL_LEADS.map((l) => ({
      ...l,
      status: l.status || 'Fresh',
      category: l.category || 'Other',
      leadSource: l.leadSource || 'Website',
    }))
  );

  /* ========== FILTERS ========== */
  const [statusFilter, setStatusFilter] = useState('All');
  const [websiteFilter, setWebsiteFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupView, setGroupView] = useState('all');

  /* ========== UI STATE ========== */
  const [websiteOpen, setWebsiteOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  /* ========== SELECTION ========== */
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  /* ========== DRAWERS / MODALS ========== */
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* ========== CALL & FOLLOW-UP STATE ========== */
  const [callingLead, setCallingLead] = useState(null);
  const [followUpLead, setFollowUpLead] = useState(null);
  const [callLog, setCallLog] = useState([]);
  const [toast, setToast] = useState(null);

  /* ========== AGENTS (for assignment) ========== */
  const agents = useMemo(
    () =>
      AGENTS.filter((a) =>
        isSuperAdmin ? true : a.websiteId === activeWebsiteId
      ),
    [isSuperAdmin, activeWebsiteId]
  );

  /* ========== HELPERS ========== */
  const websiteName = (id) =>
    WEBSITES.find((w) => w.id === id)?.name || id;

  const agentName = (agentId) =>
    AGENTS.find((a) => a.id === agentId)?.name || 'Unassigned';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ========== BASE LEADS ========== */
  const baseLeads = useMemo(() => {
    let leads = isSuperAdmin
      ? websiteFilter === 'All'
        ? allLeads
        : allLeads.filter((l) => l.websiteId === websiteFilter)
      : allLeads.filter((l) => l.websiteId === activeWebsiteId);

    if (statusFilter !== 'All')
      leads = leads.filter((l) => l.status === statusFilter);
    if (sourceFilter !== 'All')
      leads = leads.filter((l) => l.leadSource === sourceFilter);
    if (categoryFilter !== 'All')
      leads = leads.filter((l) => l.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      leads = leads.filter((l) => {
        const hay = `${l.name} ${l.mobile} ${l.account || ''} ${l.leadSource} ${l.category}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return leads;
  }, [
    allLeads, isSuperAdmin, activeWebsiteId, websiteFilter,
    statusFilter, sourceFilter, categoryFilter, searchQuery,
  ]);

  /* ========== GROUPING ========== */
  const groupedLeads = useMemo(() => {
    if (groupView === 'all') return { All: baseLeads };
    const keyFn = {
      project: (l) => websiteName(l.websiteId),
      source: (l) => l.leadSource || 'Other',
      category: (l) => l.category || 'Other',
      status: (l) => l.status || 'Fresh',
    }[groupView];

    return baseLeads.reduce((acc, lead) => {
      const key = keyFn(lead);
      if (!acc[key]) acc[key] = [];
      acc[key].push(lead);
      return acc;
    }, {});
  }, [baseLeads, groupView]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = baseLeads.length;
    const followUps = baseLeads.filter((l) => l.status === 'Follow Up').length;
    const missed = baseLeads.filter((l) => l.status === 'Missed').length;
    const won = baseLeads.filter((l) => l.status === 'Won').length;
    const fresh = baseLeads.filter((l) => l.status === 'Fresh').length;
    const conversion = total > 0 ? Math.round((won / total) * 100) : 0;
    return { total, followUps, missed, won, fresh, conversion };
  }, [baseLeads]);

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

  /* ========== ACTIONS ========== */
  const handleAssignLead = (leadId, agentId) => {
    setAllLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, assignedAgentId: agentId, assignedAgent: agentName(agentId) }
          : l
      )
    );
    setSelected((prev) =>
      prev && prev.id === leadId
        ? { ...prev, assignedAgentId: agentId, assignedAgent: agentName(agentId) }
        : prev
    );
    showToast(`Lead assigned to ${agentName(agentId) || 'Unassigned'}`);
  };

  const handleBulkAssign = (agentId) => {
    setAllLeads((prev) =>
      prev.map((l) =>
        selectedIds.has(l.id)
          ? { ...l, assignedAgentId: agentId, assignedAgent: agentName(agentId) }
          : l
      )
    );
    showToast(`${selectedIds.size} leads assigned to ${agentName(agentId)}`);
    setSelectedIds(new Set());
    setShowBulkAssign(false);
  };

  const handleDeleteLead = (leadId) => {
    setAllLeads((prev) => prev.filter((l) => l.id !== leadId));
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
    if (selectedIds.size === baseLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(baseLeads.map((l) => l.id)));
    }
  };

  const handleExport = () => {
    if (baseLeads.length === 0) {
      showToast('No leads to export', 'error');
      return;
    }
    const rows = [
      ['ID', 'Name', 'Mobile', 'Website', 'Source', 'Category', 'Agent', 'Status', 'Follow-up'],
      ...baseLeads.map((l) => [
        l.id, l.name, l.mobile, websiteName(l.websiteId),
        l.leadSource, l.category, l.assignedAgent || 'Unassigned',
        l.status, l.followUpDate || '',
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${baseLeads.length} leads`);
  };

  /* ========== CALL HANDLERS (WORKING) ========== */
  const handleCallNow = (lead) => {
    setMenuOpenId(null);
    setCallingLead(lead);
  };

  const handleCallEnd = (lead, duration, disposition) => {
    const entry = {
      id: Date.now(),
      leadName: lead.name,
      phone: lead.mobile,
      duration,
      disposition,
      time: new Date().toLocaleTimeString(),
    };
    setCallLog((prev) => [entry, ...prev].slice(0, 10));

    // Update lead status based on disposition
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

  /* ========== FOLLOW-UP HANDLERS (WORKING) ========== */
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

  /* ========== IMPORT HANDLER (WORKING) ========== */
  const handleImportLeads = (parsedRows) => {
    const newLeads = parsedRows.map((row, idx) => ({
      id: `lead-import-${Date.now()}-${idx}`,
      name: row.name || row.Name || 'Unnamed Lead',
      mobile: String(row.mobile || row.Mobile || row.phone || '').replace(/\D/g, '').slice(0, 10),
      email: row.email || row.Email || '',
      leadSource: row.source || row.Source || 'Other',
      category: row.category || row.Category || 'Other',
      account: row.account || row.Account || '—',
      websiteId: row.project || row.Project || activeWebsiteId || WEBSITES[0].id,
      assignedAgent: 'Unassigned',
      assignedAgentId: '',
      status: 'Fresh',
      followUpDate: '',
    })).filter((l) => l.name && l.mobile);

    if (newLeads.length === 0) {
      showToast('No valid rows found in CSV', 'error');
      return;
    }

    setAllLeads((prev) => [...newLeads, ...prev]);
    setShowImportModal(false);
    showToast(`Imported ${newLeads.length} lead${newLeads.length !== 1 ? 's' : ''}`);
  };

  const hasFilters =
    statusFilter !== 'All' ||
    sourceFilter !== 'All' ||
    categoryFilter !== 'All' ||
    websiteFilter !== 'All' ||
    searchQuery;

  const clearFilters = () => {
    setStatusFilter('All');
    setSourceFilter('All');
    setCategoryFilter('All');
    setWebsiteFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Leads
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            {isSuperAdmin ? (
              <>
                <Globe size={13} className="text-brand-purple" />
                Central lead management across every project.
              </>
            ) : (
              'All leads captured across sources for this website.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <Download size={14} /> Export
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkAssign(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
            >
              <UserCheck size={14} /> Assign ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total Leads"
          value={summary.total}
          sub={`${summary.fresh} fresh leads`}
          icon={Users}
          color="purple"
          trend="+12%"
          trendUp
        />
        <AnimatedStatCard
          label="Follow-ups"
          value={summary.followUps}
          sub="Pending action"
          icon={ClipboardList}
          color="amber"
          trend="+5"
          trendUp
        />
        <AnimatedStatCard
          label="Missed"
          value={summary.missed}
          sub="Require attention"
          icon={PhoneMissed}
          color="rose"
          trend="-2"
          trendUp={false}
        />
        <AnimatedStatCard
          label="Conversion"
          value={`${summary.conversion}%`}
          sub={`${summary.won} won leads`}
          icon={Percent}
          color="emerald"
          trend="+3%"
          trendUp
        />
      </div>

      {/* ================= CALL LOG (SESSION) ================= */}
      {callLog.length > 0 && (
        <div className="card !p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
              <Headphones size={14} className="text-brand-purple" />
              Recent Calls (this session)
            </h3>
            <button
              onClick={() => setCallLog([])}
              className="text-xs font-semibold text-rose-500 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {callLog.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 bg-white p-2.5"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    c.disposition === 'Connected'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-500'
                  }`}
                >
                  {c.disposition === 'Connected' ? (
                    <PhoneOutgoing size={14} />
                  ) : (
                    <PhoneMissed size={14} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {c.leadName}
                  </p>
                  <p className="truncate text-xs text-brand-ink/50">{c.phone}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-brand-ink">
                    {c.duration}
                  </p>
                  <p className="text-[10px] text-brand-ink/40">{c.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= GROUP VIEWS ================= */}
      <div className="card !p-3">
        <div className="flex flex-wrap items-center gap-2">
          {GROUP_VIEWS.map((g) => {
            const Icon = g.icon;
            const active = groupView === g.key;
            return (
              <button
                key={g.key}
                onClick={() => setGroupView(g.key)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                  active
                    ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple shadow-sm'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                <Icon size={13} />
                {g.label}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            {duplicateCount > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-600">
                <AlertCircle size={12} />
                {duplicateCount} potential duplicates
              </span>
            )}
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg border p-1.5 ${
                viewMode === 'list'
                  ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                  : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
              }`}
              title="List view"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg border p-1.5 ${
                viewMode === 'grid'
                  ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                  : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
              }`}
              title="Grid view"
            >
              <Grid3x3 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, account, source..."
            className="w-full rounded-xl border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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

        {isSuperAdmin && (
          <DropdownFilter
            label="Project"
            icon={Building2}
            value={websiteFilter === 'All' ? 'All' : websiteName(websiteFilter)}
            options={['All', ...WEBSITES.map((w) => w.id)]}
            displayOptions={['All Projects', ...WEBSITES.map((w) => w.name)]}
            open={websiteOpen}
            onToggle={() => {
              setWebsiteOpen((s) => !s);
              setSourceOpen(false);
              setCategoryOpen(false);
            }}
            onChange={(v) => {
              setWebsiteFilter(v);
              setWebsiteOpen(false);
            }}
          />
        )}

        <DropdownFilter
          label="Source"
          icon={Tag}
          value={sourceFilter}
          options={['All', ...SOURCES]}
          open={sourceOpen}
          onToggle={() => {
            setSourceOpen((s) => !s);
            setWebsiteOpen(false);
            setCategoryOpen(false);
          }}
          onChange={(v) => {
            setSourceFilter(v);
            setSourceOpen(false);
          }}
        />

        <DropdownFilter
          label="Category"
          icon={ClipboardList}
          value={categoryFilter}
          options={['All', ...CATEGORIES]}
          open={categoryOpen}
          onToggle={() => {
            setCategoryOpen((s) => !s);
            setWebsiteOpen(false);
            setSourceOpen(false);
          }}
          onChange={(v) => {
            setCategoryFilter(v);
            setCategoryOpen(false);
          }}
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ================= STATUS CHIPS ================= */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', ...ALL_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              statusFilter === s
                ? 'border-transparent bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card'
                : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/40'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ================= BULK SELECT BAR ================= */}
      {baseLeads.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white px-4 py-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink/70">
            <input
              type="checkbox"
              checked={selectedIds.size === baseLeads.length && baseLeads.length > 0}
              onChange={handleToggleSelectAll}
              className="h-4 w-4 rounded border-brand-lilac text-brand-purple focus:ring-brand-purple/30"
            />
            Select all
          </label>
          <span className="text-xs text-brand-ink/50">
            {selectedIds.size} selected
          </span>
          {selectedIds.size > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowBulkAssign(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-magenta px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
              >
                <UserCheck size={12} /> Bulk Assign
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="rounded-lg border border-brand-lilac px-3 py-1.5 text-[11px] font-semibold text-brand-ink/60 hover:bg-brand-lilac/40"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= GROUPED LEADS ================= */}
      {baseLeads.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLeads).map(([groupName, groupLeads]) => (
            <div key={groupName} className="space-y-3">
              {groupView !== 'all' && (
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-brand-ink">
                    {groupName}
                  </h3>
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
                    isSuperAdmin={isSuperAdmin}
                    websiteName={websiteName}
                    agentName={agentName}
                    isDuplicate={duplicatesMap.has(lead.id)}
                    isSelected={selectedIds.has(lead.id)}
                    onToggleSelect={() => handleToggleSelect(lead.id)}
                    onView={() => setSelected(lead)}
                    onCall={() => handleCallNow(lead)}
                    onFollowUp={() => handleSetFollowUp(lead)}
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
          isSuperAdmin={isSuperAdmin}
          websiteName={websiteName(selected.websiteId)}
          agents={agents}
          onAssign={handleAssignLead}
          onCall={() => handleCallNow(selected)}
          onFollowUp={() => handleSetFollowUp(selected)}
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
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportLeads}
        />
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

      {/* ================= WORKING CALL MODAL ================= */}
      {callingLead && (
        <CallModal
          target={callingLead}
          onClose={() => setCallingLead(null)}
          onEnd={(duration, disposition) =>
            handleCallEnd(callingLead, duration, disposition)
          }
        />
      )}

      {/* ================= WORKING FOLLOW-UP MODAL ================= */}
      {followUpLead && (
        <FollowUpModal
          lead={followUpLead}
          onClose={() => setFollowUpLead(null)}
          onSave={(data) => handleSaveFollowUp(followUpLead, data)}
        />
      )}

      {/* ================= TOAST ================= */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
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
    <div
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 ${t.border} ${t.shadow}`}
    >
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} />
          </span>
          {trend && (
            <span
              className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                trendUp
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-rose-200 bg-rose-50 text-rose-500'
              }`}
            >
              {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trend}
            </span>
          )}
        </div>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight ${t.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
      </div>
    </div>
  );
}

/* ================= DROPDOWN FILTER ================= */
function DropdownFilter({ label, icon: Icon, value, options, displayOptions, open, onToggle, onChange }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-purple" />}
        {label}: <span className="text-brand-purple">{value}</span>
        <ChevronDown size={14} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o, i) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === o
                    ? 'bg-brand-lilac font-semibold text-brand-purple'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
              >
                {displayOptions ? displayOptions[i] : o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= LEAD ITEM ================= */
function LeadItem({
  lead, viewMode, isSuperAdmin, websiteName, agentName, isDuplicate, isSelected,
  onToggleSelect, onView, onCall, onFollowUp, menuOpenId, setMenuOpenId,
  onAssignClick, onDelete,
}) {
  if (viewMode === 'grid') {
    return (
      <div
        className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)] ${
          isDuplicate ? 'border-amber-300 hover:border-amber-400' : 'border-brand-lilac/80 hover:border-brand-purple/50'
        }`}
      >
        <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-purple to-brand-magenta transition-transform duration-500 group-hover:scale-x-100" />

        <div className="relative flex flex-col p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="mt-1 h-4 w-4 rounded border-brand-lilac text-brand-purple focus:ring-brand-purple/30"
            />
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white shadow-md">
              {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <button onClick={onView} className="truncate text-sm font-semibold text-brand-ink hover:text-brand-purple">
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
            {isSuperAdmin && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-brand-ink/50"><Building2 size={10} /> Project</span>
                <span className="truncate font-semibold text-brand-ink">{websiteName(lead.websiteId)}</span>
              </div>
            )}
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
            <button onClick={onView} className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple">
              <Eye size={12} /> View
            </button>
            <button onClick={onCall} className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110">
              <Phone size={12} /> Call
            </button>
            <button onClick={onFollowUp} className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2 text-xs font-semibold text-white shadow-card hover:brightness-110">
              <Calendar size={12} /> Follow
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===== LIST VIEW ===== */
  return (
    <div
      className={`group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
        isDuplicate ? 'border-amber-200 hover:border-amber-300' : 'border-brand-lilac/70 hover:border-brand-purple/40'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="h-4 w-4 shrink-0 rounded border-brand-lilac text-brand-purple focus:ring-brand-purple/30"
      />

      <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-xs font-bold text-white shadow-sm sm:flex">
        {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <button onClick={onView} className="truncate text-sm font-semibold text-brand-ink hover:text-brand-purple">
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

      {isSuperAdmin && (
        <div className="hidden shrink-0 text-xs md:block">
          <p className="flex items-center gap-1 text-brand-ink/40"><Building2 size={10} /> Project</p>
          <p className="font-semibold text-brand-ink/70">{websiteName(lead.websiteId)}</p>
        </div>
      )}

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
        <button
          onClick={onCall}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100 sm:flex"
          title="Call"
        >
          <Phone size={13} />
        </button>
        <button
          onClick={onFollowUp}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition-all hover:bg-amber-100 sm:flex"
          title="Set Follow-up"
        >
          <Calendar size={13} />
        </button>
        <button
          onClick={onView}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple sm:flex"
          title="View"
        >
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
              <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={Eye} label="View Details" onClick={onView} />
                <MenuItem icon={UserCheck} label="Assign to Agent" onClick={onAssignClick} />
                <MenuItem icon={Phone} label="Call Lead" onClick={onCall} />
                <MenuItem icon={Calendar} label="Set Follow-up" onClick={onFollowUp} />
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

/* ================= MENU ITEM ================= */
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

/* ================= EMPTY STATE ================= */
function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <Users size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No leads match your filters' : 'No leads yet'}
      </p>
      {hasFilters && (
        <button onClick={onClear} className="text-xs font-semibold text-brand-purple hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );
}

/* ================= LEAD DRAWER ================= */
function LeadDrawer({ lead, isSuperAdmin, websiteName, agents, onAssign, onCall, onFollowUp, onClose }) {
  const recordings = useMemo(
    () => [
      { id: 1, type: 'inbound', duration: '3:42', date: 'Today · 10:24 AM', agent: lead.assignedAgent || 'Unassigned', summary: 'Discussing pricing options.' },
      { id: 2, type: 'outbound', duration: '1:18', date: 'Yesterday · 4:12 PM', agent: lead.assignedAgent || 'Unassigned', summary: 'Follow-up on brochure.' },
      { id: 3, type: 'inbound', duration: '0:47', date: '3 days ago · 11:05 AM', agent: 'Missed', summary: 'Missed call — no answer.' },
    ],
    [lead]
  );

  const agentFollowUps = FOLLOW_UPS.filter((f) => f.leadId === lead.id);
  const leadCalls = CALLS.filter((c) => c.leadId === lead.id);

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
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
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

          {isSuperAdmin && (
            <div className="rounded-xl bg-brand-mist p-3">
              <p className="flex items-center gap-1.5 text-xs text-brand-ink/50">
                <Globe size={12} className="text-brand-purple" /> Website
              </p>
              <p className="mt-0.5 font-semibold text-brand-ink">{websiteName}</p>
            </div>
          )}

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Lead Information</h4>
            <Row label="Lead Source" value={lead.leadSource} />
            <Row label="Category" value={lead.category} />
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
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Calendar size={16} /> Set Follow-up
            </button>
          </div>

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
            <p className="text-sm leading-relaxed text-brand-ink/70 italic">
              "Agent: Good afternoon, this is {lead.assignedAgent || 'our agent'} from {websiteName}. Am I speaking with {lead.name.split(' ')[0]}?
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

/* ================= RECORDING ROW ================= */
function RecordingRow({ rec }) {
  const isMissed = rec.agent === 'Missed';
  return (
    <div className="rounded-xl border border-brand-lilac bg-white p-3">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isMissed ? 'bg-rose-50 text-rose-500' : rec.type === 'inbound' ? 'bg-emerald-50 text-emerald-500' : 'bg-violet-50 text-brand-purple'}`}>
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
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card" title="Play recording">
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

/* ================= WORKING CALL MODAL ================= */
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
        <div
          className={`relative px-6 pb-8 pt-8 text-center text-white ${
            callState === 'connected'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : callState === 'ringing'
              ? 'bg-gradient-to-br from-brand-purple to-brand-magenta'
              : 'bg-gradient-to-br from-gray-500 to-gray-600'
          }`}
        >
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
            {callState === 'ended' && 'Call Ended'}
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
                  className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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

          {callState !== 'ended' ? (
            <button
              onClick={() => handleHangUp('Connected')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <PhoneOff size={16} /> End Call
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-xs font-semibold text-brand-ink/60">Save disposition</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleHangUp('Connected')} className="rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100">
                  Connected
                </button>
                <button onClick={() => handleHangUp('Missed')} className="rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-100">
                  Missed
                </button>
                <button onClick={() => handleHangUp('Voicemail')} className="rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-100">
                  Voicemail
                </button>
                <button onClick={() => handleHangUp('Busy')} className="rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
                  Busy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= CALL CONTROL ================= */
function CallControl({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
        active ? 'border-brand-purple bg-brand-lilac/50 text-brand-purple' : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

/* ================= WORKING FOLLOW-UP MODAL ================= */
function FollowUpModal({ lead, onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!date) {
      setError('Please pick a date.');
      return;
    }
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
              <p className="text-xs text-brand-ink/50">
                Schedule a follow-up for {lead.name}
              </p>
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
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Save Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= BULK ASSIGN MODAL ================= */
function BulkAssignModal({ agents, count, onAssign, onClose }) {
  const [selectedAgent, setSelectedAgent] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Bulk Assign</h3>
              <p className="text-xs text-brand-ink/50">
                Assign {count} selected lead{count !== 1 ? 's' : ''} to an agent
              </p>
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
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= WORKING IMPORT MODAL ================= */
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

  const handleImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
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
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-lilac bg-brand-mist/40 px-4 py-8 text-center transition-colors hover:border-brand-purple/50 hover:bg-brand-lilac/20">
            <FileUp size={24} className="text-brand-purple" />
            <span className="text-sm font-semibold text-brand-ink">
              {file ? file.name : 'Click to upload CSV file'}
            </span>
            <span className="text-xs text-brand-ink/50">Max file size: 10MB</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>

          <div className="rounded-xl border border-brand-lilac/60 bg-brand-mist/40 p-3 text-xs text-brand-ink/60">
            <p className="font-semibold text-brand-ink/70">Expected columns (header row required):</p>
            <p className="mt-1">Name, Mobile, Email, Source, Category, Project</p>
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
                <p className="text-[10px] text-brand-ink/40">
                  Showing first 20 of {parsedRows.length} rows
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={parsedRows.length === 0 || parsing}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              Import {parsedRows.length > 0 ? `(${parsedRows.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= CSV PARSER (simple) ================= */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Detect delimiter (comma or semicolon)
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

/* ================= CONFIRM DIALOG ================= */
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

/* ================= TOAST ================= */
function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2">
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
          type === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-600'
            : 'border-emerald-200 bg-emerald-50 text-emerald-600'
        }`}
      >
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}

/* ================= INFO HELPERS ================= */
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