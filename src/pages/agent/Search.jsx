// src/pages/agent/Search.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon, X, ChevronDown, ChevronRight, Users,
  Phone, Mail, Tag, Calendar, CalendarCheck, Flame, CheckCircle2, Clock,
  AlertCircle, Inbox, SlidersHorizontal, Sparkles,
  Building2, Layers, MapPin, IndianRupee, History,
  PhoneCall, MessageCircle, MessageSquare, StickyNote, Eye,
  Zap, ArrowRight, Star, CircleDot, UserCheck, UserX,
  Target, Hash, Copy, PhoneMissed, RotateCcw, ArrowRightLeft, BookmarkPlus,
  AlertTriangle, Link2, CalendarClock, Trash2,
  CheckSquare, Square,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS } from '../../data/mockData';

/* ================================================================
   CONSTANTS
   ================================================================ */
const SEARCH_TABS = [
  { key: 'all',       label: 'All Results',       icon: SearchIcon },
  { key: 'leads',     label: 'Leads',             icon: Target },
  { key: 'customers', label: 'Customers',         icon: Users },
  { key: 'advanced',  label: 'Advanced Search',   icon: SlidersHorizontal },
];

const SEARCH_MODES = [
  { value: 'all',        label: 'All Fields' },
  { value: 'name',       label: 'Name' },
  { value: 'phone',      label: 'Phone' },
  { value: 'email',      label: 'Email' },
  { value: 'leadId',     label: 'Lead ID' },
  { value: 'customerId', label: 'Customer ID' },
  { value: 'campaign',   label: 'Campaign' },
  { value: 'location',   label: 'Location' },
];

const SORT_OPTIONS = [
  { value: 'relevance',       label: 'Relevance' },
  { value: 'recent-assigned', label: 'Recently Assigned' },
  { value: 'recent-contact',  label: 'Recently Contacted' },
  { value: 'follow-up',       label: 'Follow-Up Date' },
  { value: 'priority',        label: 'Priority' },
  { value: 'name-asc',        label: 'Name A–Z' },
  { value: 'name-desc',       label: 'Name Z–A' },
];

const FOLLOWUP_QUICK = [
  { value: 'all',       label: 'All' },
  { value: 'today',     label: 'Today' },
  { value: 'tomorrow',  label: 'Tomorrow' },
  { value: 'overdue',   label: 'Overdue' },
  { value: 'next7',     label: 'Next 7 days' },
  { value: 'none',      label: 'No Follow-Up' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_OPTIONS          = ['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'];
const SOURCE_OPTIONS          = ['All', 'Facebook Campaign', 'Google Ads', 'Referral', 'Walk-in', 'Website', 'Inbound Call'];
const CAMPAIGN_OPTIONS        = ['All', 'Q3 Outreach', 'Diwali Promo', 'Referral Drive', 'Festive Offers'];
const PRIORITY_OPTIONS        = ['All', 'High', 'Medium', 'Low'];
const CONTACT_STATUS_OPTIONS  = ['All', 'Never Contacted', 'Contacted', 'Connected', 'No Response', 'Wrong Number'];

const EMPTY_FILTERS = {
  status: 'All',
  source: 'All',
  campaign: 'All',
  priority: 'All',
  contactStatus: 'All',
  followUpQuick: 'all',
  dateFrom: '',
  dateTo: '',
  followUpFrom: '',
  followUpTo: '',
};

const PRIORITY_STYLES = {
  High:   'border-rose-200 bg-rose-50 text-rose-600',
  Medium: 'border-amber-200 bg-amber-50 text-amber-600',
  Low:    'border-emerald-200 bg-emerald-50 text-emerald-600',
};

const STATUS_STYLES = {
  New:         'bg-blue-100 text-blue-600',
  Contacted:   'bg-violet-100 text-brand-purple',
  Qualified:   'bg-amber-100 text-amber-700',
  Proposal:    'bg-amber-100 text-amber-700',
  Negotiation: 'bg-amber-100 text-amber-700',
  Converted:   'bg-emerald-100 text-emerald-600',
  Lost:        'bg-rose-100 text-rose-500',
};

const QUICK_SEARCHES = [
  { key: 'myLeads',        label: 'My Leads',           icon: UserCheck,     tone: 'purple' },
  { key: 'todayFollowUps', label: "Today's Follow-Ups", icon: CalendarCheck, tone: 'emerald' },
  { key: 'overdue',        label: 'Overdue',            icon: AlertTriangle, tone: 'rose' },
  { key: 'highPriority',   label: 'High Priority',      icon: Flame,         tone: 'rose' },
  { key: 'newLeads',       label: 'New Leads',          icon: Sparkles,      tone: 'purple' },
  { key: 'missedCalls',    label: 'Missed Calls',       icon: PhoneMissed,   tone: 'rose' },
  { key: 'recentlyCalled', label: 'Recently Contacted', icon: PhoneCall,     tone: 'purple' },
  { key: 'converted',      label: 'Converted',          icon: CheckCircle2,  tone: 'emerald' },
];

/* ================================================================
   HELPERS
   ================================================================ */
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayYMD    = () => ymd(new Date());
const tomorrowYMD = () => ymd(new Date(Date.now() + 86400000));
const next7YMD    = () => ymd(new Date(Date.now() + 7 * 86400000));

const normalizePhone = (s) =>
  String(s || '').replace(/\D/g, '').replace(/^(91|0)/, '').slice(-10);

const timeAgo = (iso) => {
  if (!iso || iso === '—') return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

function Highlight({ text, query }) {
  const safeText = String(text ?? '');
  const safeQuery = String(query ?? '');
  if (!safeQuery || !safeText) return <>{safeText}</>;
  const idx = safeText.toLowerCase().indexOf(safeQuery.toLowerCase());
  if (idx < 0) return <>{safeText}</>;
  return (
    <>
      {safeText.slice(0, idx)}
      <mark className="rounded bg-amber-100 px-0.5 text-amber-800">
        {safeText.slice(idx, idx + safeQuery.length)}
      </mark>
      {safeText.slice(idx + safeQuery.length)}
    </>
  );
}

/* ================================================================
   DEMO DATA
   ================================================================ */
const buildSearchableRecords = (agentName, websiteId) => {
  const today       = todayYMD();
  const tomorrow    = tomorrowYMD();
  const yesterday   = ymd(new Date(Date.now() - 86400000));
  const twoDaysAgo  = ymd(new Date(Date.now() - 2 * 86400000));
  const inThreeDays = ymd(new Date(Date.now() + 3 * 86400000));

  const base = (LEADS || []).map((l, i) => {
    const status = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'][i % 7];
    const lastContactOffset = i % 4 === 0 ? null : i % 8;
    const lastContact = lastContactOffset === null
      ? null
      : new Date(Date.now() - lastContactOffset * 86400000).toISOString();

    const followUpOptions = [today, tomorrow, yesterday, inThreeDays, null, tomorrow, twoDaysAgo];
    const followUpDate = followUpOptions[i % followUpOptions.length];
    const followUpCompleted = i % 6 === 3;

    return {
      id: `lead-${i + 1}`,
      recordType: 'lead',
      name: l.name || `Lead ${i + 1}`,
      mobile: l.mobile || `98765${String(43210 + i).slice(-5)}`,
      email: l.email || `lead${i + 1}@example.com`,
      leadId: `#LG-${String(1000 + i).padStart(4, '0')}`,
      customerId: '',
      status,
      source: ['Facebook Campaign', 'Google Ads', 'Referral', 'Walk-in', 'Website', 'Inbound Call'][i % 6],
      campaign: ['Q3 Outreach', 'Diwali Promo', 'Referral Drive', 'Festive Offers'][i % 4],
      priority: ['High', 'Medium', 'Low'][i % 3],
      budget: `₹${40 + (i % 8) * 5}L – ₹${55 + (i % 8) * 5}L`,
      location: ['Coimbatore', 'Chennai', 'Bangalore', 'Hyderabad', 'Kochi'][i % 5],
      assignedDate: ymd(new Date(Date.now() - (i % 20) * 86400000)),
      followUpDate: followUpDate || '',
      followUpCompleted,
      lastContact,
      lastActivity: i % 5 === 0
        ? { type: 'call', label: 'Called', at: lastContact }
        : i % 4 === 0
        ? { type: 'note', label: 'Note added', at: lastContact }
        : lastContact
        ? { type: 'call', label: 'Contacted', at: lastContact }
        : null,
      contactStatus: lastContactOffset === null ? 'Never Contacted' : 'Contacted',
      agentName,
      projectId: websiteId,
    };
  });

  const customers = base
    .filter((r) => r.status === 'Converted')
    .map((r, i) => ({
      ...r,
      id: `cust-${i + 1}`,
      recordType: 'customer',
      customerId: `#CU-${String(2000 + i).padStart(4, '0')}`,
      leadId: '',
      convertedFromLeadId: r.leadId,
      status: 'Converted',
    }));

  return [...base, ...customers];
};

const DEFAULT_SAVED = [
  { id: 'ss-1', name: 'High Priority Leads', filters: { priority: 'High' },         query: '', mode: 'all' },
  { id: 'ss-2', name: 'Overdue Follow-Ups',  filters: { followUpQuick: 'overdue' }, query: '', mode: 'all' },
  { id: 'ss-3', name: 'Website Leads',       filters: { source: 'Website' },        query: '', mode: 'all' },
];

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function Search() {
  const { user, activeWebsiteId } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]       = useState('all');
  const [query, setQuery]               = useState('');
  const [searchMode, setSearchMode]     = useState('all');
  const [sortBy, setSortBy]             = useState('relevance');
  const [searchWithin, setSearchWithin] = useState('');
  const [quickSearch, setQuickSearch]   = useState(null);
  const [filters, setFilters]           = useState(EMPTY_FILTERS);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedRecord, setSelectedRecord]   = useState(null);
  const [showSaveSearch, setShowSaveSearch]   = useState(false);
  const [savedSearches, setSavedSearches]     = useState(DEFAULT_SAVED);
  const [recentSearches, setRecentSearches]   = useState([]);
  const [toast, setToast]                     = useState(null);
  const [selectedIds, setSelectedIds]         = useState([]);

  const [records, setRecords] = useState(() =>
    buildSearchableRecords(user?.name || 'Agent', activeWebsiteId)
  );

  useEffect(() => {
    setRecords(buildSearchableRecords(user?.name || 'Agent', activeWebsiteId));
  }, [user?.name, activeWebsiteId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ---------- QUICK SEARCH PRESETS ---------- */
  const applyQuickSearch = (key) => {
    setQuery('');
    setSearchWithin('');
    setSearchMode('all');
    setSortBy('relevance');
    setFilters(EMPTY_FILTERS);

    if (quickSearch === key) {
      setQuickSearch(null);
      return;
    }
    setQuickSearch(key);

    switch (key) {
      case 'myLeads':        break;
      case 'todayFollowUps': setFilters((f) => ({ ...f, followUpQuick: 'today' })); break;
      case 'overdue':        setFilters((f) => ({ ...f, followUpQuick: 'overdue' })); break;
      case 'highPriority':   setFilters((f) => ({ ...f, priority: 'High' })); break;
      case 'newLeads':       setFilters((f) => ({ ...f, status: 'New', contactStatus: 'Never Contacted' })); break;
      case 'missedCalls':    setFilters((f) => ({ ...f, contactStatus: 'No Response' })); break;
      case 'recentlyCalled':
        setFilters((f) => ({ ...f, contactStatus: 'Contacted' }));
        setSortBy('recent-contact');
        break;
      case 'converted':      setFilters((f) => ({ ...f, status: 'Converted' })); break;
      default: break;
    }
  };

  /* ---------- SEARCH SCORING ---------- */
  const scoredRecords = useMemo(() => {
    const q        = query.trim().toLowerCase();
    const qPhone   = normalizePhone(q);
    const within   = searchWithin.trim().toLowerCase();
    const today    = todayYMD();
    const tomorrow = tomorrowYMD();
    const next7    = next7YMD();

    const results = [];

    for (const r of records) {
      if (activeTab === 'leads'     && r.recordType !== 'lead')     continue;
      if (activeTab === 'customers' && r.recordType !== 'customer') continue;

      if (filters.status !== 'All' && r.status !== filters.status) continue;
      if (filters.source !== 'All' && r.source !== filters.source) continue;
      if (filters.campaign !== 'All' && r.campaign !== filters.campaign) continue;
      if (filters.priority !== 'All' && r.priority !== filters.priority) continue;
      if (filters.contactStatus !== 'All' && r.contactStatus !== filters.contactStatus) continue;

      if (filters.followUpQuick !== 'all') {
        const fq = filters.followUpQuick;
        if (fq === 'none') {
          if (r.followUpDate) continue;
        } else if (fq === 'today') {
          if (r.followUpDate !== today) continue;
        } else if (fq === 'tomorrow') {
          if (r.followUpDate !== tomorrow) continue;
        } else if (fq === 'overdue') {
          if (!r.followUpDate || r.followUpDate >= today) continue;
        } else if (fq === 'next7') {
          if (!r.followUpDate || r.followUpDate < today || r.followUpDate > next7) continue;
        } else if (fq === 'completed') {
          if (!r.followUpCompleted) continue;
        }
      }

      if (filters.dateFrom && r.assignedDate < filters.dateFrom) continue;
      if (filters.dateTo && r.assignedDate > filters.dateTo) continue;
      if (filters.followUpFrom && (!r.followUpDate || r.followUpDate < filters.followUpFrom)) continue;
      if (filters.followUpTo && (!r.followUpDate || r.followUpDate > filters.followUpTo)) continue;

      let score = 0;
      const matchedFields = [];
      if (q) {
        const nameMatch     = r.name.toLowerCase().includes(q);
        const phoneMatch    = qPhone.length >= 3 && normalizePhone(r.mobile).includes(qPhone);
        const emailMatch    = (r.email || '').toLowerCase().includes(q);
        const leadIdMatch   = (r.leadId || '').toLowerCase().includes(q);
        const custIdMatch   = (r.customerId || '').toLowerCase().includes(q);
        const campaignMatch = (r.campaign || '').toLowerCase().includes(q);
        const sourceMatch   = (r.source || '').toLowerCase().includes(q);
        const locationMatch = (r.location || '').toLowerCase().includes(q);

        const modeOK =
          searchMode === 'all'        ? true :
          searchMode === 'name'       ? nameMatch :
          searchMode === 'phone'      ? phoneMatch :
          searchMode === 'email'      ? emailMatch :
          searchMode === 'leadId'     ? leadIdMatch :
          searchMode === 'customerId' ? custIdMatch :
          searchMode === 'campaign'   ? campaignMatch :
          searchMode === 'location'   ? locationMatch : true;

        if (!modeOK) continue;

        if (nameMatch)     { score += 100; matchedFields.push('Name'); }
        if (phoneMatch)    { score += 90;  matchedFields.push('Phone'); }
        if (emailMatch)    { score += 80;  matchedFields.push('Email'); }
        if (leadIdMatch)   { score += 70;  matchedFields.push('Lead ID'); }
        if (custIdMatch)   { score += 70;  matchedFields.push('Customer ID'); }
        if (campaignMatch) { score += 30;  matchedFields.push('Campaign'); }
        if (sourceMatch)   { score += 20;  matchedFields.push('Source'); }
        if (locationMatch) { score += 15;  matchedFields.push('Location'); }

        if (score === 0) continue;
      }

      if (within) {
        const hay = `${r.name} ${r.mobile} ${r.email || ''} ${r.campaign || ''}`.toLowerCase();
        if (!hay.includes(within)) continue;
      }

      results.push({ ...r, _score: score, _matchedFields: matchedFields });
    }

    const priorityRank = { High: 0, Medium: 1, Low: 2 };
    results.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          if (query.trim()) return b._score - a._score;
          return 0;
        case 'recent-assigned':
          return (b.assignedDate || '').localeCompare(a.assignedDate || '');
        case 'recent-contact': {
          const av = a.lastContact || '0000';
          const bv = b.lastContact || '0000';
          return bv.localeCompare(av);
        }
        case 'follow-up': {
          const av = a.followUpDate || '9999';
          const bv = b.followUpDate || '9999';
          return av.localeCompare(bv);
        }
        case 'priority':
          return priorityRank[a.priority] - priorityRank[b.priority];
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return results;
  }, [records, query, filters, activeTab, sortBy, searchMode, searchWithin]);

  /* ---------- DUPLICATES ---------- */
  const duplicates = useMemo(() => {
    const byPhone = new Map();
    for (const r of records) {
      const key = normalizePhone(r.mobile);
      if (!key) continue;
      if (!byPhone.has(key)) byPhone.set(key, []);
      byPhone.get(key).push(r);
    }
    const dupes = new Map();
    for (const [k, list] of byPhone.entries()) {
      if (list.length > 1) dupes.set(k, list);
    }
    return dupes;
  }, [records]);

  /* ---------- RESULT SUMMARY ---------- */
  const resultSummary = useMemo(() => {
    const leads         = scoredRecords.filter((r) => r.recordType === 'lead').length;
    const customers     = scoredRecords.filter((r) => r.recordType === 'customer').length;
    const highPriority  = scoredRecords.filter((r) => r.priority === 'High').length;
    const followUpToday = scoredRecords.filter((r) => r.followUpDate === todayYMD()).length;
    return { leads, customers, highPriority, followUpToday };
  }, [scoredRecords]);

  const activeFilterCount = Object.entries(filters).filter(
    ([, v]) => v && v !== 'All' && v !== '' && v !== 'all'
  ).length;

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setQuickSearch(null);
    setSearchWithin('');
  };

  /* ---- Reset quickSearch when filters are manually changed ---- */
  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    if (quickSearch) {
      const chipFilters = (() => {
        switch (quickSearch) {
          case 'todayFollowUps': return { followUpQuick: 'today' };
          case 'overdue':        return { followUpQuick: 'overdue' };
          case 'highPriority':   return { priority: 'High' };
          case 'newLeads':       return { status: 'New', contactStatus: 'Never Contacted' };
          case 'missedCalls':    return { contactStatus: 'No Response' };
          case 'recentlyCalled': return { contactStatus: 'Contacted' };
          case 'converted':      return { status: 'Converted' };
          default:               return {};
        }
      })();
      const stillActive = Object.entries(chipFilters).every(
        ([k, v]) => filters[k] === v
      );
      if (!stillActive && Object.keys(chipFilters).length > 0) {
        setQuickSearch(null);
      }
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [filterKey]);

  /* ---- Clear bulk selection when filters/tab change ---- */
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab, scoredRecords.length]);

  /* ---------- RECENT / SAVED ---------- */
  const addRecentSearch = (q) => {
    const s = String(q || '').trim();
    if (!s) return;
    setRecentSearches((prev) => [s, ...prev.filter((x) => x !== s)].slice(0, 5));
  };

  const handleSaveSearch = (name) => {
    const entry = {
      id: `ss-${Date.now()}`,
      name: name.trim(),
      filters: { ...filters },
      query,
      mode: searchMode,
    };
    setSavedSearches((prev) => [...prev, entry]);
    setShowSaveSearch(false);
    showToast(`Saved "${entry.name}"`);
  };

  const applySavedSearch = (s) => {
    setQuery(s.query || '');
    setSearchMode(s.mode || 'all');
    setFilters({ ...EMPTY_FILTERS, ...(s.filters || {}) });
    setQuickSearch(null);
    setSearchWithin('');
    showToast(`Applied "${s.name}"`);
  };

  const deleteSaved = (id) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    showToast('Saved search removed');
  };

  /* ---------- BULK SELECTION ---------- */
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === scoredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(scoredRecords.map((r) => r.id));
    }
  };

  /* ---------- QUICK ACTIONS ---------- */
  const handleCall = (r) => {
    addRecentSearch(r.name);
    navigate('/agent/calls', { state: { dialLead: r } });
  };

  const handleWhatsApp = (r) => {
    showToast(`WhatsApp opened for ${r.name}`);
  };

  const handleFollowUp = (r) => {
    showToast(`Follow-up scheduled for ${r.name}`);
  };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-24">
        {/* ================= HEADER ================= */}
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Search</h1>
          <p className="text-sm text-brand-ink/50">
            Find leads, customers, and full contact history — fast.
          </p>
        </div>

        {/* ================= SEARCH BAR (with Saved dropdown) ================= */}
        <SearchBar
          query={query}
          setQuery={setQuery}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          activeFilterCount={activeFilterCount}
          onToggleFilters={() => setShowFilterPanel((s) => !s)}
          recentSearches={recentSearches}
          onSubmit={addRecentSearch}
          savedSearches={savedSearches}
          onPickSaved={applySavedSearch}
          onDeleteSaved={deleteSaved}
          onSaveCurrent={() => setShowSaveSearch(true)}
        />

        {/* ================= QUICK SEARCH CHIPS ================= */}
        <QuickSearches activeKey={quickSearch} onPick={applyQuickSearch} />

        {/* ================= RECENT (full width now) ================= */}
        <RecentSearches recent={recentSearches} onPick={(q) => { setQuery(q); addRecentSearch(q); }} />

        {/* ================= ADVANCED FILTER PANEL ================= */}
        {showFilterPanel && (
          <AdvancedFilterPanel
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
        )}

        {/* ================= RESULT SUMMARY ================= */}
        {scoredRecords.length > 0 && (
          <ResultSummary
            total={scoredRecords.length}
            summary={resultSummary}
            duplicateCount={duplicates.size}
          />
        )}

        {/* ================= TABS + SORT ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {SEARCH_TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count =
                t.key === 'all'       ? scoredRecords.length :
                t.key === 'leads'     ? scoredRecords.filter((r) => r.recordType === 'lead').length :
                t.key === 'customers' ? scoredRecords.filter((r) => r.recordType === 'customer').length :
                                        scoredRecords.length;
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
              <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
                Sort by:
              </span>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>

        {/* ================= SEARCH WITHIN RESULTS ================= */}
        {scoredRecords.length > 0 && (
          <div className="relative">
            <SearchIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            <input
              value={searchWithin}
              onChange={(e) => setSearchWithin(e.target.value)}
              placeholder={`Search within ${scoredRecords.length} results…`}
              className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-10 pr-10 text-xs outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
            {searchWithin && (
              <button
                onClick={() => setSearchWithin('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac"
              >
                <X size={12} className="text-brand-ink/50" />
              </button>
            )}
          </div>
        )}

        {/* ================= BULK SELECTION BAR ================= */}
        {scoredRecords.length > 0 && activeTab === 'advanced' && selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-magenta/40 bg-brand-magenta/[0.06] px-4 py-2.5">
            <span className="text-xs font-bold text-brand-magenta">
              {selectedIds.length} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  showToast(`Follow-up assigned to ${selectedIds.length} records`);
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
              >
                <Calendar size={11} /> Assign Follow-Up
              </button>
              <button
                onClick={() => {
                  showToast(`Tag added to ${selectedIds.length} records`);
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
              >
                <Tag size={11} /> Add Tag
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="ml-2 text-[11px] font-semibold text-brand-ink/50 hover:text-brand-ink"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ================= RESULTS ================= */}
        {scoredRecords.length === 0 ? (
          <EmptyState
            hasQuery={query.length > 0 || activeFilterCount > 0}
            query={query}
            onReset={resetFilters}
          />
        ) : activeTab === 'advanced' ? (
          <AdvancedResultsView
            records={scoredRecords}
            duplicates={duplicates}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onView={(r) => { addRecentSearch(r.name); setSelectedRecord(r); }}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onFollowUp={handleFollowUp}
          />
        ) : (
          <div className="space-y-2">
            {scoredRecords.map((r) => (
              <ResultRow
                key={r.id}
                record={r}
                query={query}
                isDuplicate={duplicates.has(normalizePhone(r.mobile))}
                onView={() => { addRecentSearch(r.name); setSelectedRecord(r); }}
                onCall={() => handleCall(r)}
                onWhatsApp={() => handleWhatsApp(r)}
                onFollowUp={() => handleFollowUp(r)}
              />
            ))}
          </div>
        )}

        {/* ================= DRAWERS ================= */}
        {selectedRecord && (
          <RecordDetailDrawer
            record={selectedRecord}
            allRecords={records}
            onClose={() => setSelectedRecord(null)}
            onCopyId={(id) => { navigator.clipboard?.writeText(id); showToast(`Copied ${id}`); }}
            onCall={() => handleCall(selectedRecord)}
            onWhatsApp={() => handleWhatsApp(selectedRecord)}
            onFollowUp={() => handleFollowUp(selectedRecord)}
            onViewRelated={(id) => {
              const target = records.find((r) => r.id === id);
              if (target) {
                addRecentSearch(target.name);
                setSelectedRecord(target);
              }
            }}
          />
        )}

        {showSaveSearch && (
          <SaveSearchModal
            defaultName={`Search ${savedSearches.length + 1}`}
            onClose={() => setShowSaveSearch(false)}
            onSave={handleSaveSearch}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ================================================================
   SEARCH BAR  (now includes the Saved Searches dropdown)
   ================================================================ */
function SearchBar({
  query, setQuery, searchMode, setSearchMode,
  activeFilterCount, onToggleFilters,
  recentSearches, onSubmit,
  savedSearches, onPickSaved, onDeleteSaved, onSaveCurrent,
}) {
  const [focused, setFocused]   = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const currentMode = SEARCH_MODES.find((m) => m.value === searchMode);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setModeOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-brand-lilac/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-purple hover:bg-brand-lilac"
          >
            {currentMode?.label}
            <ChevronDown size={10} />
          </button>
          {modeOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setModeOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                {SEARCH_MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => { setSearchMode(m.value); setModeOpen(false); }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                      searchMode === m.value
                        ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                        : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit(query)}
          placeholder="Search by name, phone, email, lead ID, customer ID…"
          className="w-full rounded-2xl border-2 border-brand-lilac bg-white py-4 pl-40 pr-56 text-sm outline-none transition-all focus:border-brand-magenta focus:ring-4 focus:ring-brand-magenta/15"
        />

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-full p-1 hover:bg-brand-lilac"
              title="Clear"
            >
              <X size={14} className="text-brand-ink/50" />
            </button>
          )}

          {/* ---- SAVED SEARCHES DROPDOWN ---- */}
          <div className="relative">
            <button
              onClick={() => setSavedOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                savedOpen
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-brand-lilac bg-white text-brand-ink/60 hover:border-amber-500/60 hover:text-amber-700'
              }`}
              title="Saved searches"
            >
              <Star size={12} className={savedSearches.length > 0 ? 'text-amber-600' : 'text-brand-ink/40'} />
              Saved
              {savedSearches.length > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">
                  {savedSearches.length}
                </span>
              )}
              <ChevronDown size={11} className={`text-brand-ink/40 transition-transform ${savedOpen ? 'rotate-180' : ''}`} />
            </button>

            {savedOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSavedOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-xl border border-brand-lilac bg-white shadow-panel">
                  <div className="flex items-center justify-between border-b border-brand-lilac/60 bg-gradient-to-r from-amber-50/60 to-brand-mist/40 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      <Star size={11} /> Saved Searches
                    </span>
                    <span className="text-[10px] font-semibold text-brand-ink/40">
                      {savedSearches.length}
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto p-1">
                    {savedSearches.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-brand-ink/50">
                        No saved searches yet.
                      </p>
                    ) : (
                      savedSearches.map((s) => (
                        <div
                          key={s.id}
                          className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-brand-mist/60"
                        >
                          <button
                            onClick={() => { onPickSaved(s); setSavedOpen(false); }}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs font-semibold text-brand-ink/80 hover:text-amber-700"
                          >
                            <Star size={11} className="shrink-0 text-amber-600" />
                            <span className="truncate">{s.name}</span>
                          </button>
                          <button
                            onClick={() => onDeleteSaved(s.id)}
                            className="rounded p-1 text-brand-ink/30 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                            title="Remove"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => { onSaveCurrent(); setSavedOpen(false); }}
                    className="flex w-full items-center justify-center gap-1.5 border-t border-brand-lilac/60 bg-brand-mist/30 py-2.5 text-[11px] font-bold text-amber-700 hover:bg-amber-50"
                  >
                    <BookmarkPlus size={11} /> Save current search
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onToggleFilters}
            className={`relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilterCount > 0
                ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                : 'border-brand-lilac bg-white text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta'
            }`}
          >
            <SlidersHorizontal size={12} />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-magenta px-1.5 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {focused && !query && recentSearches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
            <History size={11} /> Recent
          </span>
          {recentSearches.map((s) => (
            <button
              key={s}
              onMouseDown={() => setQuery(s)}
              className="rounded-full border border-brand-lilac bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   QUICK SEARCHES
   ================================================================ */
function QuickSearches({ activeKey, onPick }) {
  return (
    <div className="card !p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
          <Zap size={12} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
          Quick Search
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_SEARCHES.map((q) => {
          const Icon = q.icon;
          const active = activeKey === q.key;
          const tones = {
            purple:  { bg: 'bg-violet-50',  text: 'text-brand-purple',  ring: 'ring-violet-200' },
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600',   ring: 'ring-emerald-200' },
            rose:    { bg: 'bg-rose-50',    text: 'text-brand-magenta', ring: 'ring-rose-200' },
          };
          const t = tones[q.tone] || tones.purple;
          return (
            <button
              key={q.key}
              onClick={() => onPick(q.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                active
                  ? 'border-brand-magenta bg-brand-magenta text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]'
                  : 'border-brand-lilac bg-white text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-md ${
                active ? 'bg-white/25 text-white' : `${t.bg} ${t.text} ring-1 ${t.ring}`
              }`}>
                <Icon size={10} />
              </span>
              {q.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   RECENT SEARCHES  (standalone, full width)
   ================================================================ */
function RecentSearches({ recent, onPick }) {
  if (!recent || recent.length === 0) return null;

  return (
    <div className="card !p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-brand-purple">
          <History size={12} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-purple">
          Recent Searches
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {recent.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className="rounded-full border border-brand-lilac bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   RESULT SUMMARY
   ================================================================ */
function ResultSummary({ total, summary, duplicateCount }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white px-4 py-2.5">
      <span className="font-display text-sm font-bold text-brand-ink">
        <span className="text-brand-magenta">{total}</span> result{total !== 1 ? 's' : ''} found
      </span>
      <span className="h-4 w-px bg-brand-lilac" />
      <SummaryPill icon={Target}        label="Leads"            value={summary.leads}         tone="purple" />
      <SummaryPill icon={UserCheck}     label="Customers"        value={summary.customers}     tone="emerald" />
      <SummaryPill icon={Flame}         label="High Priority"    value={summary.highPriority}  tone="rose" />
      <SummaryPill icon={CalendarCheck} label="Follow-Up Today"  value={summary.followUpToday} tone="amber" />
      {duplicateCount > 0 && (
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
          <AlertTriangle size={10} /> {duplicateCount} duplicate group{duplicateCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

function SummaryPill({ icon: Icon, label, value, tone }) {
  const tones = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose:    'bg-rose-50 text-brand-magenta',
    amber:   'bg-amber-50 text-amber-700',
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`flex h-5 w-5 items-center justify-center rounded-md ${tones[tone]}`}>
        <Icon size={10} />
      </span>
      <span className="text-[11px] text-brand-ink/60">{label}:</span>
      <span className="font-display text-xs font-bold text-brand-ink">{value}</span>
    </span>
  );
}

/* ================================================================
   SORT DROPDOWN
   ================================================================ */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
      >
        <ArrowRightLeft size={11} className="text-brand-magenta" />
        <span className="text-brand-magenta">{current?.label}</span>
        <ChevronDown size={11} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                  value === o.value
                    ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                    : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================
   ADVANCED FILTER PANEL
   ================================================================ */
function AdvancedFilterPanel({ filters, setFilters, onReset }) {
  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <SlidersHorizontal size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
            Advanced Filters
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FilterField icon={CircleDot}     label="Lead Status"    value={filters.status}         options={STATUS_OPTIONS}         onChange={(v) => update('status', v)} />
        <FilterField icon={UserX}         label="Contact Status" value={filters.contactStatus}  options={CONTACT_STATUS_OPTIONS} onChange={(v) => update('contactStatus', v)} />
        <FilterField icon={Layers}        label="Source"         value={filters.source}         options={SOURCE_OPTIONS}         onChange={(v) => update('source', v)} />
        <FilterField icon={Building2}     label="Campaign"       value={filters.campaign}       options={CAMPAIGN_OPTIONS}       onChange={(v) => update('campaign', v)} />
        <FilterField icon={Flame}         label="Priority"       value={filters.priority}       options={PRIORITY_OPTIONS}       onChange={(v) => update('priority', v)} />
        <FilterField icon={CalendarClock} label="Follow-Up"      value={filters.followUpQuick}  options={FOLLOWUP_QUICK}         onChange={(v) => update('followUpQuick', v)} />

        <div className="sm:col-span-2 lg:col-span-1">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Calendar size={12} /> Assigned Date
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => update('dateFrom', e.target.value)}
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => update('dateTo', e.target.value)}
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta"
            />
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <PhoneCall size={12} /> Follow-Up Date
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.followUpFrom}
              onChange={(e) => update('followUpFrom', e.target.value)}
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta"
            />
            <input
              type="date"
              value={filters.followUpTo}
              onChange={(e) => update('followUpTo', e.target.value)}
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterField({ icon: Icon, label, value, options, onChange }) {
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
        <Icon size={12} /> {label}
      </p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-brand-lilac bg-white px-3 py-2 pr-8 text-xs outline-none focus:border-brand-magenta"
        >
          {normalized.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
      </div>
    </div>
  );
}

/* ================================================================
   NEXT ACTION HELPER
   ================================================================ */
function getNextAction(record) {
  const today = todayYMD();
  const fu = record.followUpDate;

  if (fu === today) {
    return { label: 'Follow-up today', tone: 'rose', icon: AlertTriangle };
  }
  if (fu && fu < today) {
    return { label: 'Overdue', tone: 'rose', icon: AlertTriangle };
  }
  if (fu === tomorrowYMD()) {
    return { label: 'Follow-up tomorrow', tone: 'amber', icon: CalendarClock };
  }
  if (record.contactStatus === 'Never Contacted') {
    return { label: 'Call now', tone: 'purple', icon: PhoneCall };
  }
  return { label: 'No action', tone: 'emerald', icon: CheckCircle2 };
}

/* ================================================================
   RESULT ROW
   ================================================================ */
function ResultRow({ record, query, isDuplicate, onView, onCall, onWhatsApp, onFollowUp }) {
  const isCustomer = record.recordType === 'customer';
  const idLabel    = isCustomer ? record.customerId : record.leadId;
  const action     = getNextAction(record);
  const ActionIcon = action.icon;
  const lastActivityAgo = record.lastActivity?.at ? timeAgo(record.lastActivity.at) : null;

  return (
    <div className="group relative flex w-full flex-wrap items-center gap-3 rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <button
        onClick={onView}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm transition-transform group-hover:scale-110 ${
          isCustomer
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
        }`}
      >
        {String(record.name || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('')}
      </button>

      <button onClick={onView} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-brand-ink">
            <Highlight text={record.name} query={query} />
          </p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
            isCustomer ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-brand-purple'
          }`}>
            {isCustomer ? 'Customer' : 'Lead'}
          </span>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[record.priority] || PRIORITY_STYLES.Low}`}>
            {record.priority}
          </span>
          {isDuplicate && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
              <AlertTriangle size={9} /> Possible duplicate
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-brand-ink/50">
          <span className="inline-flex items-center gap-1">
            <Phone size={10} /> <Highlight text={record.mobile} query={query} />
          </span>
          <span className="inline-flex items-center gap-1">
            <Mail size={10} /> <Highlight text={record.email} query={query} />
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-brand-purple">
            <Hash size={10} /> <Highlight text={idLabel} query={query} />
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-brand-ink/50">
          {record.campaign && (
            <span className="inline-flex items-center gap-1">
              <Layers size={9} /> {record.campaign}
            </span>
          )}
          {lastActivityAgo && (
            <span className="inline-flex items-center gap-1">
              {record.lastActivity.type === 'note' ? <StickyNote size={9} /> : <PhoneCall size={9} />}
              {record.lastActivity.label} {lastActivityAgo}
            </span>
          )}
        </div>
      </button>

      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${
        action.tone === 'rose'    ? 'bg-rose-50 text-rose-600 ring-rose-200' :
        action.tone === 'amber'   ? 'bg-amber-50 text-amber-700 ring-amber-200' :
        action.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' :
                                    'bg-violet-50 text-brand-purple ring-violet-200'
      }`}>
        <ActionIcon size={10} /> {action.label}
      </span>

      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLES[record.status] || STATUS_STYLES.New}`}>
        {record.status}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onCall}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition-transform hover:scale-105"
          title="Call"
        >
          <Phone size={13} />
        </button>
        <button
          onClick={onWhatsApp}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition-transform hover:scale-105 sm:flex"
          title="WhatsApp"
        >
          <MessageCircle size={13} />
        </button>
        <button
          onClick={onFollowUp}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition-transform hover:scale-105 sm:flex"
          title="Follow-up"
        >
          <Calendar size={13} />
        </button>
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
          title="View"
        >
          <Eye size={13} />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   ADVANCED RESULTS VIEW
   ================================================================ */
function AdvancedResultsView({
  records, duplicates,
  selectedIds, onToggleSelect, onToggleSelectAll,
  onView, onCall, onWhatsApp, onFollowUp,
}) {
  const allSelected = records.length > 0 && selectedIds.length === records.length;

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
            <tr>
              <th className="px-3 py-3">
                <button
                  onClick={onToggleSelectAll}
                  className="flex items-center justify-center"
                  title={allSelected ? 'Deselect all' : 'Select all'}
                >
                  {allSelected ? (
                    <CheckSquare size={14} className="text-brand-magenta" />
                  ) : (
                    <Square size={14} className="text-brand-ink/40" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Next Action</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Follow-Up</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-lilac/40">
            {records.map((r) => {
              const action = getNextAction(r);
              const ActionIcon = action.icon;
              const isSelected = selectedIds.includes(r.id);
              const isDuplicate = duplicates.has(normalizePhone(r.mobile));

              return (
                <tr key={r.id} className={`hover:bg-brand-mist/40 ${isSelected ? 'bg-brand-magenta/5' : ''}`}>
                  <td className="px-3 py-3">
                    <button onClick={() => onToggleSelect(r.id)} className="flex items-center justify-center">
                      {isSelected ? (
                        <CheckSquare size={14} className="text-brand-magenta" />
                      ) : (
                        <Square size={14} className="text-brand-ink/40" />
                      )}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                        r.recordType === 'customer'
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                          : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
                      }`}>
                        {String(r.name || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-brand-ink">{r.name}</span>
                        {isDuplicate && (
                          <span className="text-[9px] font-bold text-amber-600">⚠ Duplicate</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="text-brand-ink/70">{r.mobile}</p>
                    <p className="text-[10px] text-brand-ink/40">{r.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-brand-purple">
                    {r.recordType === 'customer' ? r.customerId : r.leadId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[r.status] || ''}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                      action.tone === 'rose'    ? 'bg-rose-50 text-rose-600 ring-rose-200' :
                      action.tone === 'amber'   ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                      action.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' :
                                                  'bg-violet-50 text-brand-purple ring-violet-200'
                    }`}>
                      <ActionIcon size={9} /> {action.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-ink/70">{r.source}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-ink/70">{r.campaign}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-ink/70">
                    {r.followUpDate || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onCall(r)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:scale-105"
                        title="Call"
                      >
                        <Phone size={11} />
                      </button>
                      <button
                        onClick={() => onWhatsApp(r)}
                        className="hidden h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:scale-105 sm:flex"
                        title="WhatsApp"
                      >
                        <MessageCircle size={11} />
                      </button>
                      <button
                        onClick={() => onFollowUp(r)}
                        className="hidden h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:scale-105 sm:flex"
                        title="Follow-up"
                      >
                        <Calendar size={11} />
                      </button>
                      <button
                        onClick={() => onView(r)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta"
                        title="View"
                      >
                        <Eye size={11} />
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
  );
}

/* ================================================================
   RECORD DETAIL DRAWER
   ================================================================ */
function RecordDetailDrawer({
  record, allRecords, onClose, onCopyId,
  onCall, onWhatsApp, onFollowUp, onViewRelated,
}) {
  const isCustomer = record.recordType === 'customer';
  const idLabel = isCustomer ? record.customerId : record.leadId;

  const related = useMemo(() => {
    const phone = normalizePhone(record.mobile);
    if (!phone) return null;
    return allRecords.find(
      (r) => r.id !== record.id && normalizePhone(r.mobile) === phone && r.recordType !== record.recordType
    );
  }, [allRecords, record]);

  const duplicateList = useMemo(() => {
    const phone = normalizePhone(record.mobile);
    if (!phone) return [];
    return allRecords.filter((r) => r.id !== record.id && normalizePhone(r.mobile) === phone);
  }, [allRecords, record]);

  const action = getNextAction(record);
  const ActionIcon = action.icon;

  const actions = [
    { key: 'call',     icon: Phone,         label: 'Call',       tone: 'emerald', onClick: onCall },
    { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp',   tone: 'emerald', onClick: onWhatsApp },
    { key: 'sms',      icon: MessageSquare, label: 'SMS',        tone: 'purple',  onClick: null },
    { key: 'email',    icon: Mail,          label: 'Email',      tone: 'amber',   onClick: null },
    { key: 'note',     icon: StickyNote,    label: 'Note',       tone: 'purple',  onClick: null },
    { key: 'followUp', icon: Calendar,      label: 'Follow-Up',  tone: 'amber',   onClick: onFollowUp },
  ];

  const activityTimeline = [
    { at: record.lastActivity?.at || record.lastContact, type: record.lastActivity?.type || 'call', label: record.lastActivity?.label || 'Contacted' },
    { at: new Date(Date.now() - 2 * 86400000).toISOString(), type: 'note',  label: 'Note added' },
    { at: new Date(Date.now() - 4 * 86400000).toISOString(), type: 'call',  label: 'Outbound call' },
  ].filter((t) => t.at);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
              {isCustomer ? 'Customer' : 'Lead'} · {idLabel}
            </p>
            <h3 className="truncate font-display text-lg font-semibold text-brand-ink">
              {record.name}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${
            action.tone === 'rose'    ? 'border-rose-200 bg-rose-50' :
            action.tone === 'amber'   ? 'border-amber-200 bg-amber-50' :
            action.tone === 'emerald' ? 'border-emerald-200 bg-emerald-50' :
                                        'border-violet-200 bg-violet-50'
          }`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              action.tone === 'rose'    ? 'bg-white text-rose-600' :
              action.tone === 'amber'   ? 'bg-white text-amber-700' :
              action.tone === 'emerald' ? 'bg-white text-emerald-600' :
                                          'bg-white text-brand-purple'
            }`}>
              <ActionIcon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                Next Action
              </p>
              <p className="text-sm font-bold text-brand-ink">{action.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`flex h-16 w-16 items-center justify-center rounded-full text-base font-bold text-white ${
              isCustomer
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
            }`}>
              {String(record.name || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{record.name}</p>
              <p className="text-sm text-brand-ink/60">{record.mobile}</p>
              <p className="flex items-center gap-1 text-xs text-brand-ink/50">
                <Mail size={11} /> {record.email}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[record.status] || STATUS_STYLES.New}`}>
              {record.status}
            </span>
          </div>

          {related && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                <Link2 size={11} /> Related Record
              </p>
              <button
                onClick={() => onViewRelated(related.id)}
                className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition-all hover:shadow-sm"
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                  related.recordType === 'customer'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
                }`}>
                  {String(related.name || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-brand-ink">{related.name}</p>
                  <p className="text-[10px] text-brand-ink/50">
                    {related.recordType === 'customer' ? 'Customer' : 'Lead'} ·{' '}
                    {related.recordType === 'customer' ? related.customerId : related.leadId}
                  </p>
                </div>
                <ChevronRight size={12} className="text-brand-ink/30" />
              </button>
            </div>
          )}

          {duplicateList.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <AlertTriangle size={11} /> Possible Duplicates ({duplicateList.length})
              </p>
              <div className="space-y-1.5">
                {duplicateList.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onViewRelated(d.id)}
                    className="flex w-full items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-left transition-all hover:shadow-sm"
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                      d.recordType === 'customer'
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                        : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
                    }`}>
                      {String(d.name || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-brand-ink">{d.name}</p>
                      <p className="text-[10px] text-brand-ink/50">
                        {d.recordType === 'customer' ? d.customerId : d.leadId}
                      </p>
                    </div>
                    <ChevronRight size={11} className="text-brand-ink/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-lilac bg-brand-mist/40 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
                {isCustomer ? 'Customer ID' : 'Lead ID'}
              </p>
              <p className="truncate font-mono text-xs font-bold text-brand-purple">{idLabel}</p>
            </div>
            <button
              onClick={() => onCopyId(idLabel)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
            >
              <Copy size={11} /> Copy
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {actions.map((a) => {
              const Icon = a.icon;
              const tones = {
                emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
                purple:  'bg-violet-50 text-brand-purple ring-violet-200',
                amber:   'bg-amber-50 text-amber-600 ring-amber-200',
              };
              const t = tones[a.tone];
              return (
                <button
                  key={a.key}
                  onClick={a.onClick || (() => {})}
                  className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-2.5 text-[10px] font-bold text-brand-ink transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-sm"
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${t} ring-1`}>
                    <Icon size={14} />
                  </span>
                  {a.label}
                </button>
              );
            })}
          </div>

          <div className="card !p-4 space-y-2.5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              Details
            </p>
            <Row icon={Flame}       label="Priority"  value={record.priority} />
            <Row icon={Layers}      label="Source"    value={record.source} />
            <Row icon={Building2}   label="Campaign"  value={record.campaign} />
            <Row icon={IndianRupee} label="Budget"    value={record.budget} />
            <Row icon={MapPin}      label="Location"  value={record.location} />
            <Row icon={UserX}       label="Contact"   value={record.contactStatus} />
          </div>

          <div className="card !p-4 space-y-2.5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              Timeline
            </p>
            <Row icon={Calendar} label="Assigned"     value={record.assignedDate} />
            <Row icon={Phone}    label="Last contact" value={record.lastContact ? (timeAgo(record.lastContact) || record.lastContact) : '—'} />
            <Row icon={Clock}    label="Follow-up"    value={record.followUpDate || '—'} />
          </div>

          {activityTimeline.length > 0 && (
            <div className="card !p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                Recent Activity
              </p>
              <div className="relative space-y-3">
                <span className="pointer-events-none absolute left-[7px] top-3 bottom-3 w-px bg-brand-lilac" />
                {activityTimeline.map((t, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <span className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white ${
                      t.type === 'note' ? 'bg-amber-500' : 'bg-brand-purple'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-brand-ink">{t.label}</p>
                      <p className="text-[10px] text-brand-ink/40">
                        {timeAgo(t.at) || new Date(t.at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card !p-4 space-y-2.5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              Assigned
            </p>
            <Row icon={UserCheck} label="Agent"   value={record.agentName || 'You'} />
            <Row icon={ShieldCheck_Icon} label="Project" value={record.projectId || '—'} />
          </div>
        </div>
      </div>
    </div>
  );
}

const ShieldCheck_Icon = ({ size = 12, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/40 pb-1.5 text-xs last:border-b-0">
      <span className="flex shrink-0 items-center gap-1.5 text-brand-ink/50">
        {Icon && <Icon size={11} />} {label}
      </span>
      <span className="truncate font-semibold capitalize text-brand-ink">{value || '—'}</span>
    </div>
  );
}

/* ================================================================
   SAVE SEARCH MODAL
   ================================================================ */
function SaveSearchModal({ defaultName, onClose, onSave }) {
  const [name, setName] = useState(defaultName);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <BookmarkPlus size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Save Search</h3>
              <p className="text-xs text-brand-ink/50">Reuse this filter set later</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="Name this search…"
          className="mb-4 w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EMPTY STATE
   ================================================================ */
function EmptyState({ hasQuery, query, onReset }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Inbox size={26} />
      </span>
      {hasQuery ? (
        <>
          <p className="font-display text-base font-semibold text-brand-ink">
            No matches found
          </p>
          <p className="max-w-sm text-sm text-brand-ink/50">
            {query ? (
              <>Nothing matched <span className="font-semibold text-brand-magenta">"{query}"</span>. Try removing some filters.</>
            ) : (
              <>No records match your current filters.</>
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="font-display text-base font-semibold text-brand-ink">
            Start searching
          </p>
          <p className="max-w-sm text-sm text-brand-ink/50">
            Search by name, phone, email, lead ID, or customer ID. Use quick chips above for common work lists.
          </p>
        </>
      )}
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