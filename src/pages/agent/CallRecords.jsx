// src/pages/agent/CallRecords.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneCall,
  Clock, User, Mic, MicOff, Play, Pause, X,
  ChevronDown, ChevronRight, ChevronUp, Volume2, VolumeX,
  PauseCircle, PlayCircle, ArrowRightLeft, PhoneOff, FileAudio,
  Download, Calendar, StickyNote, CheckCircle2, AlertCircle,
  ListFilter, Inbox, History, Tag, UserPlus, UserCheck,
  Sparkles, Zap, AlertTriangle, Timer, Flame, MessageCircle,
  Building2, MapPin, Layers, MessageSquare,
  Radio, CircleDot,
  ClipboardList, Target, Repeat, Eye, Edit3, Ban,
  ArrowUpRight, Users, CheckSquare, Square, RotateCcw,
  SlidersHorizontal, CalendarClock, Sun, CheckCheck, XCircle,
  Send, IndianRupee, ExternalLink, Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS } from '../../data/mockData';

/* ================================================================
   CONSTANTS
   ================================================================ */
const TABS = [
  { key: 'all',      label: 'All Calls', icon: PhoneCall },
  { key: 'inbound',  label: 'Inbound',   icon: PhoneIncoming },
  { key: 'outbound', label: 'Outbound',  icon: PhoneOutgoing },
];

const DISPOSITIONS = [
  'Connected', 'No Answer', 'Busy', 'Call Back', 'Interested',
  'Not Interested', 'Wrong Number', 'Converted', 'Follow-Up Required',
  'Customer Requested Information', 'Other',
];

const PRIMARY_DISPOSITIONS = [
  { key: 'Connected',      tone: 'emerald' },
  { key: 'Interested',     tone: 'rose' },
  { key: 'Call Back',      tone: 'amber' },
  { key: 'No Answer',      tone: 'slate' },
  { key: 'Converted',      tone: 'emerald' },
  { key: 'Not Interested', tone: 'slate' },
];

const CALL_PURPOSES = [
  'New Enquiry', 'Follow-Up', 'Callback', 'Pricing', 'Product Enquiry',
  'Site Visit', 'Payment', 'Document', 'Support', 'Renewal',
  'Campaign Call', 'Other',
];

const RETRY_PRESETS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour',     value: 60 },
  { label: 'Later today', value: 180 },
  { label: 'Tomorrow',   value: 24 * 60 },
  { label: 'Next week',  value: 7 * 24 * 60 },
];

const DATE_RANGES = [
  { value: 'all',      label: 'All time' },
  { value: 'today',    label: 'Today' },
  { value: 'yesterday',label: 'Yesterday' },
  { value: 'week',     label: 'Last 7 days' },
  { value: 'month',    label: 'Last 30 days' },
  { value: 'custom',   label: 'Custom range' },
];

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest First' },
  { value: 'oldest',      label: 'Oldest First' },
  { value: 'longest',     label: 'Longest Call' },
  { value: 'shortest',    label: 'Shortest Call' },
  { value: 'missed-first',label: 'Missed First' },
  { value: 'callback',    label: 'Callback Due' },
  { value: 'interested',  label: 'Interested First' },
  { value: 'converted',   label: 'Converted First' },
];

const CAMPAIGN_OPTIONS  = ['All', 'Q3 Outreach', 'Diwali Promo', 'Referral Drive', 'Festive Offers'];
const PRIORITY_OPTIONS  = ['All', 'High', 'Medium', 'Low'];
const STATUS_FILTER_OPTIONS = ['All', 'connected', 'missed', 'failed', 'ringing'];
const CALL_TYPE_OPTIONS = ['All', 'inbound', 'outbound'];

const STATUS_STYLES = {
  connected: 'bg-emerald-100 text-emerald-600',
  ringing:   'bg-amber-100 text-amber-600',
  missed:    'bg-rose-100 text-rose-500',
  failed:    'bg-slate-100 text-slate-500',
};

const PRIORITY_PILL_STYLES = {
  High:   'bg-rose-100 text-rose-600',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-emerald-100 text-emerald-700',
};

/* ================================================================
   HELPERS
   ================================================================ */
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayYMD = () => ymd(new Date());
const yesterdayYMD = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return ymd(d);
};
const weekAgoYMD = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return ymd(d);
};
const monthAgoYMD = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return ymd(d);
};

const parseDuration = (s) => {
  if (!s || s === '0:00') return 0;
  const [m, sec] = String(s).split(':').map(Number);
  if (!Number.isFinite(m) && !Number.isFinite(sec)) return 0;
  return (Number.isFinite(m) ? m : 0) * 60 + (Number.isFinite(sec) ? sec : 0);
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ${min % 60}m ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const inDateRange = (iso, range) => {
  if (!iso || range === 'all') return true;
  const day = ymd(new Date(iso));
  if (range === 'today')     return day === todayYMD();
  if (range === 'yesterday') return day === yesterdayYMD();
  if (range === 'week')      return day >= weekAgoYMD();
  if (range === 'month')     return day >= monthAgoYMD();
  return true;
};

const getNextContactState = (record) => {
  if (!record.followUpDate) return { state: 'none', label: 'No follow-up', tone: 'slate' };
  const datePart = record.followUpDate.split(' · ')[0];
  const timePart = record.followUpDate.split(' · ')[1] || '10:00';
  const target = new Date(`${datePart}T${timePart}:00`);
  const diffMin = Math.round((target.getTime() - Date.now()) / 60000);

  if (diffMin < -1) return { state: 'overdue', label: `${Math.abs(diffMin)}m overdue`, tone: 'rose' };
  if (diffMin <= 60) return { state: 'due-soon', label: `In ${diffMin}m`, tone: 'amber' };
  if (diffMin < 24 * 60) return { state: 'today', label: `Today · ${timePart}`, tone: 'emerald' };
  return { state: 'future', label: record.followUpDate, tone: 'purple' };
};

/* ================================================================
   NEXT ACTION HELPER
   ================================================================ */
function getNextAction(record) {
  if (record.status === 'missed' && record.type === 'inbound') {
    return {
      label: 'Call Back', tone: 'rose', icon: PhoneCall,
      reason: `Missed incoming call from ${record.customer}.`,
      primary: 'Call Now',
    };
  }
  if (record.status === 'missed') {
    return {
      label: 'Retry', tone: 'rose', icon: Repeat,
      reason: `Missed outbound call. ${record.retryCount || 0} previous attempts.`,
      primary: 'Retry',
    };
  }
  if (record.outcome === 'No Answer' || record.outcome === 'Busy') {
    const count = record.retryCount || 0;
    return {
      label: 'Retry', tone: 'amber', icon: Repeat,
      reason: count >= 2
        ? `Customer not reached after ${count} attempts.`
        : `Previous attempt was ${record.outcome.toLowerCase()}.`,
      primary: 'Retry',
    };
  }
  if (record.outcome === 'Interested') {
    return {
      label: 'Schedule Follow-Up', tone: 'rose', icon: Calendar,
      reason: `Customer is interested — schedule next contact.`,
      primary: 'Schedule',
    };
  }
  if (record.outcome === 'Call Back') {
    return {
      label: 'Schedule Callback', tone: 'amber', icon: CalendarClock,
      reason: `Customer requested a callback.`,
      primary: 'Schedule',
    };
  }
  if (record.outcome === 'Follow-Up Required') {
    return {
      label: 'Follow-Up Due', tone: 'amber', icon: CalendarClock,
      reason: `Follow-up was flagged during this call.`,
      primary: 'Follow Up',
    };
  }
  if (record.outcome === 'Customer Requested Information') {
    return {
      label: 'Send Information', tone: 'purple', icon: Send,
      reason: `Customer requested additional information.`,
      primary: 'Send',
    };
  }
  if (record.outcome === 'Converted') {
    return {
      label: 'View Customer', tone: 'emerald', icon: UserCheck,
      reason: `Deal closed — view the customer profile.`,
      primary: 'View',
    };
  }
  if (record.outcome === 'Not Interested') {
    return {
      label: 'Close Lead', tone: 'slate', icon: XCircle,
      reason: `Customer is not interested in the offer.`,
      primary: 'Close',
    };
  }
  if (record.outcome === 'Wrong Number') {
    return {
      label: 'Update Contact', tone: 'slate', icon: Edit3,
      reason: `Number is incorrect — update contact info.`,
      primary: 'Update',
    };
  }
  return { label: 'View Details', tone: 'purple', icon: Eye, reason: '', primary: '—' };
}

const NEXT_ACTION_TONES = {
  rose:    'bg-rose-50 text-rose-600 ring-rose-200',
  amber:   'bg-amber-50 text-amber-700 ring-amber-200',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  purple:  'bg-violet-50 text-brand-purple ring-violet-200',
  slate:   'bg-slate-50 text-slate-600 ring-slate-200',
};

/* ================================================================
   DEMO DATA
   ================================================================ */
const buildDemoCallRecords = (agentName, websiteId) => {
  const now = Date.now();
  const minsAgo = (m) => new Date(now - m * 60000).toISOString();

  return [
    {
      id: 'cr-1', agentName, projectId: websiteId,
      customer: 'Rahul Kumar', mobile: '9876543210',
      type: 'outbound', status: 'connected',
      duration: '4:32', outcome: 'Interested',
      notes: 'Wants 2BHK, budget 45-55L, prefers weekend calls.',
      campaign: 'Q3 Outreach', priority: 'High',
      source: 'Facebook Campaign',
      at: minsAgo(12),
      recording: true,
      retryCount: 0,
      leadId: 'LD-1024', leadStage: 'Hot',
      budget: '₹45-55L', location: 'Bangalore',
      purpose: 'Pricing',
      preferredContact: '10 AM – 12 PM · Weekdays',
      structuredNotes: {
        need: '2BHK apartment',
        budget: '₹45-55L',
        requirement: 'Weekend site visit',
        concern: 'Price sensitivity',
        nextAction: 'Schedule follow-up',
      },
    },
    {
      id: 'cr-2', agentName, projectId: websiteId,
      customer: 'Priya Sharma', mobile: '9876543211',
      type: 'inbound', status: 'connected',
      duration: '2:15', outcome: 'Connected',
      notes: 'Asked about pricing on 3BHK.',
      campaign: 'Diwali Promo', priority: 'Medium',
      source: 'Inbound Call',
      at: minsAgo(48),
      recording: true,
      retryCount: 0,
      leadId: 'LD-1025', leadStage: 'Warm',
      budget: '₹65L', location: 'Mumbai',
      purpose: 'Product Enquiry',
      preferredContact: '2 PM – 5 PM',
    },
    {
      id: 'cr-3', agentName, projectId: websiteId,
      customer: 'Arun Mehta', mobile: '9876543212',
      type: 'outbound', status: 'missed',
      duration: '0:00', outcome: 'No Answer',
      notes: '',
      campaign: 'Referral Drive', priority: 'Low',
      source: 'Referral',
      at: minsAgo(95),
      recording: false,
      retryCount: 2,
      leadId: 'LD-1026', leadStage: 'Cold',
      budget: '₹30L', location: 'Pune',
      purpose: 'Follow-Up',
      retryHistory: [
        { at: minsAgo(95), outcome: 'No Answer' },
        { at: minsAgo(180), outcome: 'No Answer' },
      ],
    },
    {
      id: 'cr-4', agentName, projectId: websiteId,
      customer: 'Meena Raj', mobile: '9876543213',
      type: 'inbound', status: 'missed',
      duration: '0:00', outcome: 'Missed',
      notes: 'Called from mobile.',
      campaign: 'Festive Offers', priority: 'Medium',
      source: 'Inbound Call',
      at: minsAgo(180),
      recording: false,
      retryCount: 0,
      leadId: 'LD-1027', leadStage: 'Warm',
      purpose: 'New Enquiry',
    },
    {
      id: 'cr-5', agentName, projectId: websiteId,
      customer: 'Suresh Iyer', mobile: '9876543214',
      type: 'outbound', status: 'connected',
      duration: '6:08', outcome: 'Converted',
      notes: 'Booked unit A-302. Advance payment received.',
      campaign: 'Festive Offers', priority: 'High',
      source: 'Walk-in',
      at: minsAgo(320),
      recording: true,
      retryCount: 0,
      leadId: 'LD-1028', leadStage: 'Converted',
      budget: '₹80L', location: 'Hyderabad',
      purpose: 'Payment',
      followUpDate: `${ymd(new Date(now + 86400000))} · 11:00`,
      followUpNotes: 'Confirm documentation',
    },
    {
      id: 'cr-6', agentName, projectId: websiteId,
      customer: 'Divya Nair', mobile: '9876543215',
      type: 'inbound', status: 'connected',
      duration: '1:42', outcome: 'Follow-Up Required',
      notes: 'Wants brochure sent to email.',
      campaign: 'Q3 Outreach', priority: 'Medium',
      source: 'Website',
      at: minsAgo(400),
      recording: true,
      retryCount: 0,
      leadId: 'LD-1029', leadStage: 'Warm',
      budget: '₹40L', location: 'Chennai',
      purpose: 'Document',
      followUpDate: `${todayYMD()} · 17:30`,
    },
    {
      id: 'cr-7', agentName, projectId: websiteId,
      customer: 'Vikram Singh', mobile: '9876543216',
      type: 'outbound', status: 'connected',
      duration: '3:20', outcome: 'Not Interested',
      notes: 'Budget mismatch.',
      campaign: 'Q3 Outreach', priority: 'Low',
      source: 'Google Ads',
      at: minsAgo(520),
      recording: true,
      retryCount: 0,
      leadId: 'LD-1030', leadStage: 'Cold',
      budget: '₹20L', location: 'Delhi',
      purpose: 'Pricing',
    },
    {
      id: 'cr-8', agentName, projectId: websiteId,
      customer: 'Anita Rao', mobile: '9876543217',
      type: 'inbound', status: 'missed',
      duration: '0:00', outcome: 'Missed',
      notes: '',
      campaign: 'Diwali Promo', priority: 'Medium',
      source: 'Inbound Call',
      at: minsAgo(600),
      recording: false,
      retryCount: 0,
      leadId: 'LD-1031', leadStage: 'Warm',
      purpose: 'New Enquiry',
    },
    {
      id: 'cr-9', agentName, projectId: websiteId,
      customer: 'Karan Patel', mobile: '9876543218',
      type: 'outbound', status: 'connected',
      duration: '5:10', outcome: 'Customer Requested Information',
      notes: 'Requested price sheet and floor plans.',
      campaign: 'Q3 Outreach', priority: 'High',
      source: 'Website',
      at: minsAgo(720),
      recording: true,
      retryCount: 0,
      leadId: 'LD-1032', leadStage: 'Hot',
      budget: '₹55L', location: 'Ahmedabad',
      purpose: 'Document',
    },
  ];
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function CallRecords() {
  const { user, activeWebsiteId } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchWithin, setSearchWithin] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [dispositionFilter, setDispositionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: 'All',
    type: 'All',
    campaign: 'All',
    priority: 'All',
    durationMin: '',
    dateFrom: '',
    dateTo: '',
  });

  const [selectedRecord, setSelectedRecord]     = useState(null);
  const [inCall, setInCall]                     = useState(null);
  const [showDisposition, setShowDisposition]   = useState(null);
  const [showIncomingCall, setShowIncomingCall] = useState(null);
  const [showNewLead, setShowNewLead]           = useState(null);
  const [showFollowUp, setShowFollowUp]         = useState(null);
  const [showRetry, setShowRetry]               = useState(null);
  const [toast, setToast]                       = useState(null);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [selectedIds, setSelectedIds]           = useState([]);

  const toastTimer = useRef(null);

  const [records, setRecords] = useState(() =>
    buildDemoCallRecords(user?.name || 'Agent', activeWebsiteId)
  );

  useEffect(() => {
    setRecords(buildDemoCallRecords(user?.name || 'Agent', activeWebsiteId));
  }, [user?.name, activeWebsiteId]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (msg, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  /* ---------- SUMMARY ---------- */
  const summary = useMemo(() => {
    const total = records.length;
    const inbound = records.filter((r) => r.type === 'inbound').length;
    const outbound = records.filter((r) => r.type === 'outbound').length;
    const missed = records.filter((r) => r.status === 'missed').length;
    const connected = records.filter((r) => r.status === 'connected').length;
    const interested = records.filter((r) => r.outcome === 'Interested').length;
    const converted = records.filter((r) => r.outcome === 'Converted').length;
    const talkSeconds = records.reduce((s, r) => s + parseDuration(r.duration), 0);
    const avgSeconds = connected > 0 ? Math.round(talkSeconds / connected) : 0;

    return {
      total, inbound, outbound, missed, connected, interested, converted,
      callbacks: missed,
      talkTime: `${Math.floor(talkSeconds / 3600)}h ${Math.floor((talkSeconds % 3600) / 60)}m`,
      avgDuration: `${Math.floor(avgSeconds / 60)}:${String(avgSeconds % 60).padStart(2, '0')}`,
      connectionRate: total > 0 ? Math.round((connected / total) * 100) : 0,
    };
  }, [records]);

  /* ---------- NEEDS ATTENTION ---------- */
  const needsAttention = useMemo(() => {
    const missed = records.filter((r) => r.status === 'missed').length;
    const callbacks = records.filter((r) => r.outcome === 'Call Back' || r.outcome === 'Follow-Up Required').length;
    const interested = records.filter((r) => r.outcome === 'Interested').length;
    const noAnswer = records.filter((r) => r.outcome === 'No Answer').length;
    const infoRequested = records.filter((r) => r.outcome === 'Customer Requested Information').length;
    const failed = records.filter((r) => r.status === 'failed').length;
    const converted = records.filter((r) => r.outcome === 'Converted').length;
    return [
      { key: 'missed',      label: 'Missed Calls',        count: missed,        tone: 'rose',    icon: PhoneMissed },
      { key: 'callbacks',   label: 'Callbacks Due',       count: callbacks,     tone: 'amber',   icon: CalendarClock },
      { key: 'interested',  label: 'Interested Leads',    count: interested,    tone: 'emerald', icon: Flame },
      { key: 'noanswer',    label: 'No Answer Retries',   count: noAnswer,      tone: 'slate',   icon: Repeat },
      { key: 'inforequest', label: 'Info Requested',      count: infoRequested, tone: 'purple',  icon: Send },
      { key: 'failed',      label: 'Failed Calls',        count: failed,        tone: 'rose',    icon: XCircle },
      { key: 'converted',   label: 'Converted',           count: converted,     tone: 'emerald', icon: CheckCheck },
    ];
  }, [records]);

  /* ---------- FILTERED ---------- */
  const filteredRecords = useMemo(() => {
    let list = records;

    if (activeTab === 'inbound')  list = list.filter((r) => r.type === 'inbound');
    if (activeTab === 'outbound') list = list.filter((r) => r.type === 'outbound');

    if (quickFilter === 'today')      list = list.filter((r) => inDateRange(r.at, 'today'));
    if (quickFilter === 'connected')  list = list.filter((r) => r.status === 'connected');
    if (quickFilter === 'missed')     list = list.filter((r) => r.status === 'missed');
    if (quickFilter === 'callback')   list = list.filter((r) => r.outcome === 'Call Back' || r.outcome === 'Follow-Up Required');
    if (quickFilter === 'interested') list = list.filter((r) => r.outcome === 'Interested');
    if (quickFilter === 'converted')  list = list.filter((r) => r.outcome === 'Converted');
    if (quickFilter === 'noanswer')   list = list.filter((r) => r.outcome === 'No Answer');
    if (quickFilter === 'inforequest')list = list.filter((r) => r.outcome === 'Customer Requested Information');
    if (quickFilter === 'failed')     list = list.filter((r) => r.status === 'failed');
    if (quickFilter === 'callbacks')  list = list.filter((r) => r.outcome === 'Call Back' || r.outcome === 'Follow-Up Required');

    if (dateRange !== 'all' && dateRange !== 'custom') {
      list = list.filter((r) => inDateRange(r.at, dateRange));
    }
    if (dateRange === 'custom') {
      if (advancedFilters.dateFrom) {
        const fromISO = `${advancedFilters.dateFrom}T00:00:00`;
        list = list.filter((r) => new Date(r.at) >= new Date(fromISO));
      }
      if (advancedFilters.dateTo) {
        const toISO = `${advancedFilters.dateTo}T23:59:59`;
        list = list.filter((r) => new Date(r.at) <= new Date(toISO));
      }
    }

    if (dispositionFilter !== 'all') {
      list = list.filter((r) => r.outcome === dispositionFilter);
    }

    if (advancedFilters.status !== 'All') {
      list = list.filter((r) => r.status === advancedFilters.status);
    }
    if (advancedFilters.type !== 'All') {
      list = list.filter((r) => r.type === advancedFilters.type);
    }
    if (advancedFilters.campaign !== 'All') {
      list = list.filter((r) => r.campaign === advancedFilters.campaign);
    }
    if (advancedFilters.priority !== 'All') {
      list = list.filter((r) => r.priority === advancedFilters.priority);
    }
    if (advancedFilters.durationMin) {
      const min = parseInt(advancedFilters.durationMin, 10);
      if (Number.isFinite(min) && min > 0) {
        const minSec = min * 60;
        list = list.filter((r) => parseDuration(r.duration) >= minSec);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) =>
        `${r.customer} ${r.mobile} ${r.outcome || ''} ${r.notes || ''} ${r.campaign || ''} ${r.leadId || ''}`
          .toLowerCase()
          .includes(q)
      );
    }

    if (searchWithin.trim()) {
      const q = searchWithin.toLowerCase();
      list = list.filter((r) =>
        `${r.customer} ${r.mobile} ${r.outcome || ''}`.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'newest':      return new Date(b.at) - new Date(a.at);
        case 'oldest':      return new Date(a.at) - new Date(b.at);
        case 'longest':     return parseDuration(b.duration) - parseDuration(a.duration);
        case 'shortest':    return parseDuration(a.duration) - parseDuration(b.duration);
        case 'missed-first':return (a.status === 'missed' ? 0 : 1) - (b.status === 'missed' ? 0 : 1);
        case 'callback':    return (a.outcome === 'Call Back' ? 0 : 1) - (b.outcome === 'Call Back' ? 0 : 1);
        case 'interested':  return (a.outcome === 'Interested' ? 0 : 1) - (b.outcome === 'Interested' ? 0 : 1);
        case 'converted':   return (a.outcome === 'Converted' ? 0 : 1) - (b.outcome === 'Converted' ? 0 : 1);
        default:            return 0;
      }
    });

    return sorted;
  }, [records, activeTab, quickFilter, dateRange, advancedFilters, dispositionFilter, searchQuery, searchWithin, sortBy]);

  const activeAdvancedFilterCount = Object.entries(advancedFilters).filter(
    ([, v]) => v && v !== 'All' && v !== ''
  ).length;

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      status: 'All',
      type: 'All',
      campaign: 'All',
      priority: 'All',
      durationMin: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  /* ---------- CALL HANDLERS ---------- */
  const handleStartCall = (target) => {
    const mobile = target.mobile || target.phone;
    if (!mobile) {
      showToast('No phone number available', 'error');
      return;
    }
    setInCall({
      name: target.name || target.customer || 'Unknown',
      mobile,
      leadId: target.leadId || target.id,
      direction: 'outbound',
      context: {
        priority: target.priority || '—',
        campaign: target.campaign || '—',
        source: target.source || '—',
        lastContact: target.at ? formatDateTime(target.at) : '—',
        lastOutcome: target.outcome || '—',
        previousCalls: records.filter(
          (r) => r.customer === (target.customer || target.name)
        ).length,
      },
      startedAt: Date.now(),
    });
  };

  const handleCallEnd = (payload) => {
    if (!inCall) return;
    const entry = {
      id: `cr-${Date.now()}`,
      agentName: user?.name,
      projectId: activeWebsiteId,
      customer: inCall.name,
      mobile: inCall.mobile,
      type: payload.direction === 'incoming' ? 'inbound' : 'outbound',
      status:
        payload.disposition === 'No Answer' || payload.disposition === 'Missed'
          ? 'missed'
          : 'connected',
      duration: payload.duration,
      outcome: payload.disposition || 'Connected',
      notes: payload.notes,
      at: new Date().toISOString(),
      recording: payload.recording,
      retryCount: 0,
      purpose: payload.purpose,
    };
    setRecords((prev) => [entry, ...prev]);
    setInCall(null);
    setShowDisposition(entry);
  };

  const handleSaveDisposition = (record, disposition, notes, scheduleFollowUp, structuredNotes, purpose) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, outcome: disposition, notes, structuredNotes, purpose: purpose || r.purpose }
          : r
      )
    );
    setShowDisposition(null);
    if (scheduleFollowUp) {
      showToast('Disposition saved — schedule follow-up');
      setShowFollowUp(record);
    } else {
      showToast('Call disposition saved');
    }
  };

  const handleSaveFollowUp = (record, { date, time, notes }) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, followUpDate: `${date} · ${time}`, followUpNotes: notes }
          : r
      )
    );
    setShowFollowUp(null);
    showToast(`Follow-up scheduled for ${date} at ${time}`);
  };

  const handleRetry = (record, minutes) => {
    const due = new Date(Date.now() + minutes * 60000);
    const dateStr = ymd(due);
    const timeStr = `${String(due.getHours()).padStart(2, '0')}:${String(due.getMinutes()).padStart(2, '0')}`;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              followUpDate: `${dateStr} · ${timeStr}`,
              followUpNotes: `Auto-retry scheduled after ${r.outcome}`,
              retryCount: (r.retryCount || 0) + 1,
              retryHistory: [
                ...(r.retryHistory || []),
                { at: new Date().toISOString(), outcome: 'Scheduled retry' },
              ],
            }
          : r
      )
    );
    setShowRetry(null);
    showToast(`Retry scheduled in ${minutes} min`);
  };

  /* ---------- INBOUND SIMULATION ---------- */
  const simulateIncomingCall = () => {
    const existingLeads = (LEADS || []).filter((l) => l && l.name && l.mobile).slice(0, 3);
    const isExisting = Math.random() > 0.5 && existingLeads.length > 0;

    if (isExisting) {
      const lead = existingLeads[Math.floor(Math.random() * existingLeads.length)];
      setShowIncomingCall({
        customer: lead.name,
        mobile: lead.mobile,
        isExisting: true,
        priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
        leadStage: ['Hot', 'Warm', 'Cold'][Math.floor(Math.random() * 3)],
        campaign: 'Q3 Outreach',
        previousCalls: 2 + Math.floor(Math.random() * 3),
        lastOutcome: 'Interested',
      });
    } else {
      setShowIncomingCall({
        customer: 'Unknown Caller',
        mobile: '999' + Math.floor(1000000 + Math.random() * 9000000),
        isExisting: false,
      });
    }
  };

  const handleIncomingAccept = (call) => {
    setShowIncomingCall(null);
    if (!call.isExisting) {
      setShowNewLead(call);
      return;
    }
    setInCall({
      name: call.customer,
      mobile: call.mobile,
      direction: 'incoming',
      context: {
        priority: call.priority,
        leadStage: call.leadStage,
        campaign: call.campaign,
        lastContact: 'Yesterday',
        previousCalls: call.previousCalls,
        lastOutcome: call.lastOutcome,
      },
      startedAt: Date.now(),
    });
  };

  const handleIncomingReject = () => {
    if (!showIncomingCall) return;
    const call = showIncomingCall;
    setShowIncomingCall(null);
    setRecords((prev) => [
      {
        id: `cr-${Date.now()}`,
        agentName: user?.name,
        projectId: activeWebsiteId,
        customer: call.customer,
        mobile: call.mobile,
        type: 'inbound',
        status: 'missed',
        duration: '0:00',
        outcome: 'Missed',
        notes: 'Rejected incoming call',
        at: new Date().toISOString(),
      },
      ...prev,
    ]);
    showToast('Incoming call rejected', 'error');
  };

  const handleCreateNewLead = (data) => {
    const entry = {
      id: `cr-${Date.now()}`,
      agentName: user?.name,
      projectId: activeWebsiteId,
      customer: data.name,
      mobile: data.mobile,
      type: 'inbound',
      status: 'connected',
      duration: '0:00',
      outcome: 'Connected',
      notes: data.notes || `New lead created from incoming call. Source: ${data.source}`,
      campaign: data.campaign,
      priority: data.priority || 'Medium',
      at: new Date().toISOString(),
    };
    setRecords((prev) => [entry, ...prev]);
    setShowNewLead(null);

    setInCall({
      name: data.name,
      mobile: data.mobile,
      direction: 'incoming',
      context: {
        priority: data.priority || 'Medium',
        campaign: data.campaign,
        source: data.source,
        lastContact: '—',
        previousCalls: 0,
        lastOutcome: '—',
      },
      startedAt: Date.now(),
    });
    showToast(`New lead created: ${data.name}`);
  };

  const handleNewLeadCancel = () => {
    const call = showNewLead;
    setShowNewLead(null);
    if (!call) return;
    setRecords((prev) => [
      {
        id: `cr-${Date.now()}`,
        agentName: user?.name,
        projectId: activeWebsiteId,
        customer: call.customer || 'Unknown Caller',
        mobile: call.mobile,
        type: 'inbound',
        status: 'missed',
        duration: '0:00',
        outcome: 'Missed',
        notes: 'New lead creation cancelled',
        at: new Date().toISOString(),
      },
      ...prev,
    ]);
    showToast('Call missed — lead not created', 'error');
  };

  /* ---------- QUICK FILTER HANDLER ---------- */
  const pickQuickFilter = (key) => {
    if (key === 'missed') {
      setActiveTab('all');
      setQuickFilter('missed');
      return;
    }
    setQuickFilter(key);
  };

  /* ---------- BULK ACTIONS ---------- */
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab, quickFilter, dateRange, dispositionFilter, advancedFilters, searchQuery, searchWithin]);

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1 pb-24">
        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Call Records</h1>
            <p className="text-sm text-brand-ink/50">
              Every inbound, outbound and missed call — with full context and next actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={simulateIncomingCall}
              className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
            >
              <Radio size={13} /> Simulate Incoming
            </button>
            <button
              onClick={() =>
                handleStartCall({
                  customer: 'Quick Dial',
                  mobile: '',
                  direction: 'outbound',
                })
              }
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
            >
              <PhoneCall size={13} /> Click-to-Call
            </button>
          </div>
        </div>

        {/* ================= KPI STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard label="All Calls"  value={summary.total}     sub="Lifetime records"        icon={PhoneCall}     color="purple"  delay={0} />
          <AnimatedStatCard label="Connected"  value={summary.connected} sub={`${summary.connectionRate}% rate`} icon={CheckCircle2} color="emerald" delay={40} />
          <AnimatedStatCard label="Missed"     value={summary.missed}    sub="Needs callback"          icon={PhoneMissed}   color="rose"    delay={80} />
          <AnimatedStatCard label="Callbacks"  value={summary.callbacks} sub="Due today"               icon={CalendarClock} color="amber"   delay={120} />
          <AnimatedStatCard label="Converted"  value={summary.converted} sub="Won via calls"           icon={CheckCheck}    color="emerald" delay={160} />
        </div>

        {/* ================= MISSED CALL RECOVERY ================= */}
        <MissedCallRecovery
          records={records}
          onCall={(r) => handleStartCall({ ...r, direction: 'outbound' })}
          onRetry={(r) => setShowRetry(r)}
          onFollowUp={(r) => setShowFollowUp(r)}
          onView={(r) => setSelectedRecord(r)}
        />

        {/* ================= UNIFIED FILTER PANEL ================= */}
        <UnifiedFilterPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          summary={summary}
          needsAttention={needsAttention}
          pickQuickFilter={pickQuickFilter}
        />

        {/* ================= SEARCH + FILTERS ================= */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, mobile, lead ID, outcome…"
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
            label="Date"
            icon={Calendar}
            value={dateRange}
            options={DATE_RANGES}
            onChange={setDateRange}
          />

          <DropdownFilter
            label="Disposition"
            icon={Tag}
            value={dispositionFilter}
            options={[
              { value: 'all', label: 'All dispositions' },
              ...DISPOSITIONS.map((d) => ({ value: d, label: d })),
            ]}
            onChange={setDispositionFilter}
          />

          <DropdownFilter
            label="Sort"
            icon={ArrowUpRight}
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={setSortBy}
          />

          <button
            onClick={() => setShowAdvancedFilters((s) => !s)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-sm font-semibold transition-all ${
              activeAdvancedFilterCount > 0
                ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                : 'border-brand-lilac bg-white text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeAdvancedFilterCount > 0 && (
              <span className="rounded-full bg-brand-magenta px-1.5 text-[10px] font-bold text-white">
                {activeAdvancedFilterCount}
              </span>
            )}
          </button>

          <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
            <ListFilter size={14} className="text-brand-magenta" />
            Showing: <span className="text-brand-magenta">{filteredRecords.length}</span>
          </span>
        </div>

        {/* ================= ADVANCED FILTER PANEL ================= */}
        {showAdvancedFilters && (
          <AdvancedFiltersPanel
            filters={advancedFilters}
            setFilters={setAdvancedFilters}
            onReset={resetAdvancedFilters}
          />
        )}

        {/* ================= SEARCH WITHIN RESULTS ================= */}
        {filteredRecords.length > 0 && (
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40" size={14} />
            <input
              value={searchWithin}
              onChange={(e) => setSearchWithin(e.target.value)}
              placeholder={`Search within ${filteredRecords.length} results…`}
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

        {/* ================= BULK BAR ================= */}
        {filteredRecords.length > 0 && selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-magenta/40 bg-brand-magenta/[0.06] px-4 py-2.5">
            <button
              onClick={toggleSelectAll}
              className="text-xs font-bold text-brand-magenta hover:underline"
            >
              {selectedIds.length} selected {selectedIds.length === filteredRecords.length ? '· Unselect all' : '· Select all'}
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  showToast(`Follow-up assigned to ${selectedIds.length} calls`);
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
              >
                <Calendar size={11} /> Assign Follow-Up
              </button>
              <button
                onClick={() => {
                  showToast(`Tag added to ${selectedIds.length} calls`);
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
              >
                <Tag size={11} /> Add Tag
              </button>
              <button
                onClick={() => {
                  showToast(`Priority updated for ${selectedIds.length} calls`);
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
              >
                <Flame size={11} /> Change Priority
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

        {/* ================= RECORDS LIST ================= */}
        {filteredRecords.length === 0 ? (
          <EmptyState
            tab={activeTab}
            onReset={() => {
              setSearchQuery('');
              setSearchWithin('');
              setQuickFilter('all');
              setDateRange('all');
              setDispositionFilter('all');
              resetAdvancedFilters();
            }}
          />
        ) : (
          <div className="space-y-2">
            {filteredRecords.map((record) => (
              <CallRecordRow
                key={record.id}
                record={record}
                selected={selectedIds.includes(record.id)}
                expanded={expandedCustomer === record.customer}
                onToggleSelect={() => toggleSelect(record.id)}
                onToggleExpand={() =>
                  setExpandedCustomer(
                    expandedCustomer === record.customer ? null : record.customer
                  )
                }
                siblingRecords={records.filter(
                  (r) => r.customer === record.customer && r.id !== record.id
                )}
                onView={() => setSelectedRecord(record)}
                onCall={() => handleStartCall({ ...record, direction: 'outbound' })}
                onFollowUp={() => setShowFollowUp(record)}
                onRetry={() => setShowRetry(record)}
                onViewLead={() => {
                  showToast(`Opening lead profile for ${record.customer}`);
                  navigate('/agent/leads', { state: { leadName: record.customer } });
                }}
              />
            ))}
          </div>
        )}

        {/* ================= DRAWERS / MODALS ================= */}
        {selectedRecord && (
          <CallRecordDrawer
            record={selectedRecord}
            siblingRecords={records.filter(
              (r) => r.customer === selectedRecord.customer && r.id !== selectedRecord.id
            )}
            onClose={() => setSelectedRecord(null)}
            onCall={() => {
              handleStartCall({
                customer: selectedRecord.customer,
                mobile: selectedRecord.mobile,
                direction: 'outbound',
              });
              setSelectedRecord(null);
            }}
            onFollowUp={() => {
              setShowFollowUp(selectedRecord);
              setSelectedRecord(null);
            }}
            onRetry={() => {
              setShowRetry(selectedRecord);
              setSelectedRecord(null);
            }}
            onViewLead={() => {
              showToast(`Opening lead profile for ${selectedRecord.customer}`);
              setSelectedRecord(null);
              navigate('/agent/leads', { state: { leadName: selectedRecord.customer } });
            }}
          />
        )}

        {showIncomingCall && (
          <IncomingCallModal
            call={showIncomingCall}
            onAccept={() => handleIncomingAccept(showIncomingCall)}
            onReject={handleIncomingReject}
          />
        )}

        {showNewLead && (
          <NewLeadModal
            incomingCall={showNewLead}
            onClose={handleNewLeadCancel}
            onCreate={handleCreateNewLead}
          />
        )}

        {inCall && (
          <CallModal
            target={inCall}
            onClose={() => setInCall(null)}
            onEnd={handleCallEnd}
          />
        )}

        {showDisposition && (
          <DispositionModal
            record={showDisposition}
            onClose={() => setShowDisposition(null)}
            onSave={handleSaveDisposition}
          />
        )}

        {showFollowUp && (
          <FollowUpModal
            record={showFollowUp}
            onClose={() => setShowFollowUp(null)}
            onSave={handleSaveFollowUp}
          />
        )}

        {showRetry && (
          <RetryModal
            record={showRetry}
            onClose={() => setShowRetry(null)}
            onSave={handleRetry}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ================================================================
   Local Search icon wrapper (saves importing `Search` twice)
   ================================================================ */
function SearchIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* ================================================================
   UNIFIED FILTER PANEL
   ================================================================ */
function UnifiedFilterPanel({
  activeTab, setActiveTab,
  quickFilter, setQuickFilter,
  summary, needsAttention,
  pickQuickFilter,
}) {
  const views = [
    ...TABS.map((t) => ({
      ...t,
      kind: 'tab',
      count:
        t.key === 'all'      ? summary.total :
        t.key === 'inbound'  ? summary.inbound :
        t.key === 'outbound' ? summary.outbound :
                               0,
    })),
    { key: 'today',     label: 'Today',     icon: Sun,          kind: 'quick' },
    { key: 'connected', label: 'Connected', icon: CheckCircle2, kind: 'quick' },
  ];

  const toneMap = {
    purple:  { bg: 'bg-violet-50',  text: 'text-brand-purple',  ring: 'ring-violet-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600',   ring: 'ring-emerald-200' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',      ring: 'ring-rose-200' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',     ring: 'ring-amber-200' },
    slate:   { bg: 'bg-slate-50',   text: 'text-slate-600',     ring: 'ring-slate-200' },
  };

  const activeAttentionItems = needsAttention.filter((i) => i.count > 0);

  return (
    <div className="card !p-4">
      {/* VIEWS */}
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-brand-lilac/60 pb-3">
        <span className="mr-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-magenta">
          <ListFilter size={11} />
          Views
        </span>

        {views.map((v) => {
          const Icon = v.icon;
          const isTab = v.kind === 'tab';
          const active = isTab
            ? activeTab === v.key && (v.key !== 'all' || quickFilter === 'all')
            : quickFilter === v.key;
          return (
            <button
              key={v.key}
              onClick={() => {
                if (isTab) {
                  setActiveTab(v.key);
                  setQuickFilter('all');
                } else {
                  pickQuickFilter(v.key);
                }
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]'
                  : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
              }`}
            >
              <Icon size={12} />
              {v.label}
              {typeof v.count === 'number' && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'
                  }`}
                >
                  {v.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* NEEDS ATTENTION */}
      {activeAttentionItems.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-600">
            <Zap size={11} />
            Needs Attention
          </p>
          <div
            className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeAttentionItems.map((item) => {
              const Icon = item.icon;
              const t = toneMap[item.tone] || toneMap.slate;
              const active = quickFilter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => pickQuickFilter(item.key)}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta text-white shadow-[0_3px_10px_-3px_rgba(227,28,121,0.5)]'
                      : 'border-brand-lilac bg-white text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ring-1 ${
                      active ? 'bg-white/25 text-white ring-white/30' : `${t.bg} ${t.text} ${t.ring}`
                    }`}
                  >
                    <Icon size={9} />
                  </span>
                  {item.label}
                  <span
                    className={`rounded-full px-1.5 text-[9px] font-bold ${
                      active ? 'bg-white/25 text-white' : `${t.bg} ${t.text}`
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MISSED CALL RECOVERY
   ================================================================ */
function MissedCallRecovery({ records, onCall, onRetry, onView }) {
  const recoveryItems = useMemo(() => {
    return records
      .filter(
        (r) => r.status === 'missed' || r.outcome === 'No Answer' || r.outcome === 'Busy'
      )
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 4);
  }, [records]);

  if (recoveryItems.length === 0) return null;

  return (
    <div className="card !p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-brand-magenta text-white shadow-card">
            <PhoneMissed size={12} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">
            Missed Call Recovery
          </p>
        </div>
        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-600">
          {recoveryItems.length} need action
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {recoveryItems.map((r) => {
          const elapsed = timeAgo(r.at);
          const isRecent = Date.now() - new Date(r.at).getTime() < 30 * 60000;
          return (
            <div
              key={r.id}
              className={`flex items-center gap-3 rounded-xl border-2 bg-white p-3 transition-all hover:shadow-sm ${
                isRecent ? 'border-rose-300' : 'border-brand-lilac/70'
              }`}
            >
              <button
                onClick={() => onView(r)}
                aria-label={`View ${r.customer}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-brand-magenta text-[11px] font-bold text-white shadow-sm"
              >
                {r.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-ink">{r.customer}</p>
                <p className="truncate text-[11px] text-brand-ink/60">
                  {r.status === 'missed' ? `Missed ${elapsed}` : `${r.outcome} · ${elapsed}`}
                  {r.retryCount >= 2 ? ` · ${r.retryCount} attempts` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onCall(r)}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 px-2.5 text-[11px] font-bold text-white shadow-card hover:scale-105"
                >
                  <Phone size={11} /> Call
                </button>
                <button
                  onClick={() => onRetry(r)}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100"
                  title="Schedule retry"
                >
                  <Clock size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   CALL RECORD ROW
   ================================================================ */
function CallRecordRow({
  record, selected, expanded, siblingRecords,
  onToggleSelect, onToggleExpand,
  onView, onCall, onFollowUp, onRetry, onViewLead,
}) {
  const isMissed = record.status === 'missed';
  const isInbound = record.type === 'inbound';
  const Icon = isMissed ? PhoneMissed : isInbound ? PhoneIncoming : PhoneOutgoing;
  const iconTone = isMissed
    ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200'
    : isInbound
    ? 'bg-emerald-50 text-emerald-500 ring-1 ring-emerald-200'
    : 'bg-violet-50 text-brand-purple ring-1 ring-violet-200';

  const action = getNextAction(record);
  const ActionIcon = action.icon;
  const actionTone = NEXT_ACTION_TONES[action.tone] || NEXT_ACTION_TONES.purple;

  const nextContact = getNextContactState(record);
  const nextContactTone =
    nextContact.state === 'overdue'
      ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
      : nextContact.state === 'due-soon'
      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      : nextContact.state === 'today'
      ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
      : nextContact.state === 'future'
      ? 'bg-violet-50 text-brand-purple ring-1 ring-violet-200'
      : null;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border-2 bg-white transition-all hover:shadow-md ${
        isMissed ? 'border-rose-200/70' : 'border-brand-lilac/70 hover:border-brand-magenta/40'
      } ${selected ? 'ring-2 ring-brand-magenta/30' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select ${record.customer}`}
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-brand-lilac accent-brand-magenta"
        />

        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-brand-ink">{record.customer}</p>
            {record.priority && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                  PRIORITY_PILL_STYLES[record.priority] || 'bg-brand-mist text-brand-ink/60'
                }`}
              >
                {record.priority}
              </span>
            )}
            {record.leadId && record.leadId !== '—' && (
              <span className="hidden shrink-0 rounded-full bg-brand-mist px-2 py-0.5 text-[9px] font-mono font-semibold text-brand-ink/60 sm:inline-block">
                {record.leadId}
              </span>
            )}
            {isMissed && (
              <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-500 ring-1 ring-rose-200">
                Missed {timeAgo(record.at)}
              </span>
            )}
            {!isMissed && (
              <span className="shrink-0 rounded-full bg-brand-mist px-2 py-0.5 text-[9px] font-semibold text-brand-ink/50">
                {timeAgo(record.at)}
              </span>
            )}
            {nextContactTone && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${nextContactTone}`}>
                <CalendarClock size={9} className="inline" /> {nextContact.label}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-brand-ink/50">
            {record.mobile}
            {record.campaign ? ` · ${record.campaign}` : ''}
            {record.purpose ? ` · ${record.purpose}` : ''}
          </p>
        </div>

        <div className="hidden shrink-0 text-xs lg:block">
          <p className="flex items-center gap-1 text-brand-ink/40">
            <Clock size={10} /> Duration
          </p>
          <p className="font-mono font-semibold text-brand-ink/70">{record.duration}</p>
        </div>

        <div className="hidden shrink-0 text-xs md:block">
          <p className="flex items-center gap-1 text-brand-ink/40">
            <Tag size={10} /> Outcome
          </p>
          <p className="font-semibold text-brand-ink/70">{record.outcome || '—'}</p>
        </div>

        <span
          title={action.reason}
          className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 sm:inline-flex ${actionTone}`}
        >
          <ActionIcon size={10} /> {action.label}
        </span>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
            STATUS_STYLES[record.status] || STATUS_STYLES.failed
          }`}
        >
          {record.status}
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onViewLead}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta sm:flex"
            title="View Lead"
          >
            <Users size={13} />
          </button>
          <button
            onClick={onView}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
            title="View call"
          >
            <Eye size={13} />
          </button>
          {(isMissed || record.outcome === 'No Answer' || record.outcome === 'Busy') && (
            <button
              onClick={onRetry}
              className="hidden h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-[11px] font-semibold text-amber-700 transition-all hover:bg-amber-100 sm:flex"
              title="Schedule retry"
            >
              <Clock size={12} />
            </button>
          )}
          {(isMissed || record.outcome === 'No Answer' || record.outcome === 'Call Back') && (
            <button
              onClick={onFollowUp}
              className="hidden h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta sm:flex"
              title="Schedule callback"
            >
              <Calendar size={12} />
            </button>
          )}
          <button
            onClick={onCall}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 px-2.5 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
            title="Call"
          >
            <PhoneCall size={12} /> Call
          </button>
          {siblingRecords.length > 0 && (
            <button
              onClick={onToggleExpand}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
              title={`${siblingRecords.length + 1} calls from this customer`}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      {expanded && siblingRecords.length > 0 && (
        <div className="border-t border-brand-lilac/50 bg-brand-mist/30 px-4 py-3">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-magenta">
            <History size={11} /> Call History · {siblingRecords.length + 1} calls
          </p>
          <div className="space-y-1.5">
            {[record, ...siblingRecords]
              .sort((a, b) => new Date(b.at) - new Date(a.at))
              .map((r) => {
                const RIcon =
                  r.status === 'missed'
                    ? PhoneMissed
                    : r.type === 'inbound'
                    ? PhoneIncoming
                    : PhoneOutgoing;
                return (
                  <div
                    key={r.id}
                    className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        r.status === 'missed'
                          ? 'bg-rose-50 text-rose-500'
                          : r.type === 'inbound'
                          ? 'bg-emerald-50 text-emerald-500'
                          : 'bg-violet-50 text-brand-purple'
                      }`}
                    >
                      <RIcon size={11} />
                    </span>
                    <span className="w-20 shrink-0 font-mono text-[10px] text-brand-ink/50">
                      {new Date(r.at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="flex-1 truncate font-semibold text-brand-ink">
                      {r.outcome || '—'}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-brand-ink/60">
                      {r.duration}
                    </span>
                    <button
                      onClick={onView}
                      className="shrink-0 rounded-md border border-brand-lilac bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-ink/60 hover:border-brand-magenta/40 hover:text-brand-magenta"
                    >
                      View
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   RETRY MODAL
   ================================================================ */
function RetryModal({ record, onClose, onSave }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Schedule Retry</h3>
              <p className="text-xs text-brand-ink/50">{record.customer}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {record.retryCount >= 2 && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              <AlertTriangle size={10} /> High retry count
            </p>
            <p className="text-[11px] text-amber-800">
              Already tried {record.retryCount} times. Consider a different time or channel.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {RETRY_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onSave(record, p.value)}
              className="flex w-full items-center justify-between rounded-xl border border-brand-lilac bg-white px-4 py-3 text-sm font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
            >
              <span>{p.label}</span>
              <ChevronRight size={14} className="text-brand-ink/30" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   INCOMING CALL MODAL
   ================================================================ */
function IncomingCallModal({ call, onAccept, onReject }) {
  /* Auto-reject after 30 seconds */
  useEffect(() => {
    const t = setTimeout(onReject, 30000);
    return () => clearTimeout(t);
  }, [onReject]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onReject();
      if (e.key === 'Enter') onAccept();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onAccept, onReject]);

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-panel"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative bg-gradient-to-br from-brand-magenta to-brand-purple px-6 pb-6 pt-6 text-center text-white">
          <div className="mb-2 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Incoming Call
          </div>

          <div className="relative mx-auto mb-4 mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 text-2xl font-bold">
              {call.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          </div>

          <p className="text-lg font-semibold">{call.customer}</p>
          <p className="text-xs text-white/70">+91 {call.mobile}</p>

          {call.isExisting ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
              {call.priority && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 font-bold">
                  {call.priority}
                </span>
              )}
              {call.campaign && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 font-semibold">
                  {call.campaign}
                </span>
              )}
              <span className="rounded-full bg-white/20 px-2 py-0.5 font-semibold">
                {call.previousCalls} previous calls
              </span>
            </div>
          ) : (
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-white/80">
              New caller · not in CRM
            </p>
          )}
        </div>

        {call.isExisting && (
          <div className="border-b border-brand-lilac/60 bg-brand-mist/40 px-6 py-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-magenta">
              <Sparkles size={11} /> Customer Snapshot
            </p>
            <div className="space-y-1.5">
              <SnapshotRow icon={Flame}     label="Priority"     value={call.priority} />
              <SnapshotRow icon={Layers}    label="Campaign"     value={call.campaign} />
              <SnapshotRow icon={History}   label="Last outcome" value={call.lastOutcome} />
              <SnapshotRow icon={PhoneCall} label="Total calls"  value={String(call.previousCalls)} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 p-6">
          <button
            onClick={onReject}
            className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-rose-200 bg-rose-50 py-3 text-rose-600 hover:bg-rose-100"
          >
            <PhoneMissed size={22} />
            <span className="text-xs font-bold">Reject</span>
          </button>
          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 py-3 text-white shadow-card hover:brightness-110"
          >
            <Phone size={22} />
            <span className="text-xs font-bold">Answer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SnapshotRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="flex items-center gap-1.5 text-brand-ink/50">
        <Icon size={11} /> {label}
      </span>
      <span className="font-semibold text-brand-ink">{value || '—'}</span>
    </div>
  );
}

/* ================================================================
   NEW LEAD MODAL
   ================================================================ */
function NewLeadModal({ incomingCall, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [source, setSource] = useState('Inbound Call');
  const [campaign, setCampaign] = useState('Q3 Outreach');
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSave = name.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[76] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Create New Lead</h3>
              <p className="text-xs text-brand-ink/50">Unknown caller · +91 {incomingCall.mobile}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Customer Name *" value={name} onChange={setName} placeholder="e.g. Rahul Kumar" />

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Source"
              value={source}
              onChange={setSource}
              options={['Inbound Call', 'Referral', 'Website', 'Walk-in', 'Other']}
            />
            <SelectField
              label="Campaign"
              value={campaign}
              onChange={setCampaign}
              options={['Q3 Outreach', 'Diwali Promo', 'Referral Drive', 'Festive Offers']}
            />
          </div>

          <SelectField
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={['High', 'Medium', 'Low']}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Initial Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What did the customer want?"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              disabled={!canSave}
              onClick={() =>
                onCreate({
                  name: name.trim(),
                  mobile: incomingCall.mobile,
                  source,
                  campaign,
                  priority,
                  notes,
                })
              }
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save & Answer
            </button>
          </div>
        </div>
      </div>
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
  const [recording, setRecording] = useState(true);
  const [notes, setNotes] = useState('');
  const [purpose, setPurpose] = useState('');

  const name = target.name || target.customer || 'Unknown';
  const phone = target.mobile || target.phone || '';
  const ctx = target.context || {};

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (callState !== 'ringing') return;
    const t = setTimeout(() => setCallState('connected'), 1800);
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
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    onEnd({
      duration: formatTime(seconds),
      notes,
      recording,
      purpose,
      direction: target.direction || 'outgoing',
    });
  };

  const isIncoming = target.direction === 'incoming';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-panel"
        role="dialog"
        aria-modal="true"
      >
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="md:col-span-3">
            <div
              className={`relative px-6 pb-6 pt-6 text-center text-white ${
                callState === 'connected'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 truncate text-white/80">
                  {isIncoming ? <PhoneIncoming size={11} /> : <PhoneOutgoing size={11} />}
                  {isIncoming ? 'Incoming call' : 'Outgoing call'}
                </span>
                {recording && callState === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    REC
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="relative mx-auto mb-3 mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30 text-xl font-bold">
                  {name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
              </div>

              <p className="text-lg font-semibold">{name}</p>
              <p className="text-xs text-white/70">{phone}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                {callState === 'ringing' ? 'Ringing…' : `Connected · ${formatTime(seconds)}`}
              </p>
            </div>

            <div className="p-5">
              {callState === 'connected' && (
                <div className="mb-4 grid grid-cols-5 gap-2">
                  <CallControl icon={muted ? MicOff : Mic} label={muted ? 'Unmute' : 'Mute'} active={muted} onClick={() => setMuted((m) => !m)} />
                  <CallControl icon={speaker ? Volume2 : VolumeX} label="Speaker" active={speaker} onClick={() => setSpeaker((s) => !s)} />
                  <CallControl icon={onHold ? PlayCircle : PauseCircle} label={onHold ? 'Resume' : 'Hold'} active={onHold} onClick={() => setOnHold((h) => !h)} />
                  <CallControl icon={ArrowRightLeft} label="Transfer" active={false} onClick={() => {}} />
                  <CallControl icon={recording ? Pause : Play} label={recording ? 'Pause' : 'Record'} active={recording} onClick={() => setRecording((r) => !r)} />
                </div>
              )}

              {callState === 'connected' && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Call Purpose</label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                    >
                      <option value="">— Select purpose —</option>
                      {CALL_PURPOSES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Call Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Quick notes about this call…"
                      className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                    />
                  </div>
                </div>
              )}

              {callState === 'ringing' ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-xl border border-brand-lilac bg-white py-3 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={endCall}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
                  >
                    <PhoneMissed size={16} /> End
                  </button>
                </div>
              ) : (
                <button
                  onClick={endCall}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
                >
                  <PhoneOff size={16} /> End Call · {formatTime(seconds)}
                </button>
              )}
            </div>
          </div>

          <aside className="border-l border-brand-lilac/60 bg-brand-mist/30 p-5 md:col-span-2">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-magenta">
              <Sparkles size={11} /> Lead Context
            </p>

            <div className="space-y-2.5">
              <ContextRow icon={Flame}     label="Priority"     value={ctx.priority || '—'} />
              <ContextRow icon={Layers}    label="Campaign"     value={ctx.campaign || '—'} />
              <ContextRow icon={Building2} label="Source"       value={ctx.source || '—'} />
              <ContextRow icon={PhoneCall} label="Prev. calls"  value={String(ctx.previousCalls ?? 0)} />
              <ContextRow icon={History}   label="Last outcome" value={ctx.lastOutcome || '—'} />
              <ContextRow icon={Clock}     label="Last contact" value={ctx.lastContact || '—'} />
            </div>

            <div className="mt-5 rounded-xl border border-brand-lilac bg-white p-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                Quick Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['🔥 High Priority', '💰 Price Concern', '🏠 Interest', '📅 Callback', '📄 Brochure'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNotes((n) => (n ? `${n}\n` : '') + t)}
                    className="rounded-full border border-brand-lilac bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ContextRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/40 pb-1.5 text-xs last:border-b-0">
      <span className="flex shrink-0 items-center gap-1.5 text-brand-ink/50">
        <Icon size={11} /> {label}
      </span>
      <span className="truncate font-semibold text-brand-ink">{value}</span>
    </div>
  );
}

function CallControl({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 transition-all ${
        active
          ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
          : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
      }`}
    >
      <Icon size={16} />
      <span className="text-[9px] font-semibold">{label}</span>
    </button>
  );
}

/* ================================================================
   DISPOSITION MODAL
   ================================================================ */
function DispositionModal({ record, onClose, onSave }) {
  const [disposition, setDisposition] = useState(record.outcome || 'Connected');
  const [notes, setNotes] = useState(record.notes || '');
  const [purpose, setPurpose] = useState(record.purpose || '');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [structuredNotes, setStructuredNotes] = useState({
    need: record.structuredNotes?.need || '',
    budget: record.structuredNotes?.budget || '',
    requirement: record.structuredNotes?.requirement || '',
    concern: record.structuredNotes?.concern || '',
    nextAction: record.structuredNotes?.nextAction || '',
  });

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isNotInterested = disposition === 'Not Interested';
  const isCallback = disposition === 'Call Back' || disposition === 'Follow-Up Required';
  const isNoAnswer = disposition === 'No Answer' || disposition === 'Busy';
  const isInterested = disposition === 'Interested';
  const autoSchedule = isCallback || isNoAnswer;

  const setStructured = (k, v) => setStructuredNotes((s) => ({ ...s, [k]: v }));

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Call Disposition</h3>
              <p className="text-xs text-brand-ink/50">
                {record.customer} · {record.duration}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">What happened?</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRIMARY_DISPOSITIONS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDisposition(d.key)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                    disposition === d.key
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta shadow-sm'
                      : 'border-brand-lilac bg-white text-brand-ink/70 hover:bg-brand-lilac/30'
                  }`}
                >
                  {d.key}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <Target size={12} /> Call Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option value="">— Select purpose —</option>
              {CALL_PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {isInterested && (
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-emerald-700">
                <Sparkles size={11} /> Customer Requirements
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Need (e.g. 2BHK)"
                  value={structuredNotes.need}
                  onChange={(e) => setStructured('need', e.target.value)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
                />
                <input
                  type="text"
                  placeholder="Budget (e.g. ₹45-55L)"
                  value={structuredNotes.budget}
                  onChange={(e) => setStructured('budget', e.target.value)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
                />
                <input
                  type="text"
                  placeholder="Requirement (e.g. weekend visit)"
                  value={structuredNotes.requirement}
                  onChange={(e) => setStructured('requirement', e.target.value)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
                />
                <input
                  type="text"
                  placeholder="Concern (e.g. price)"
                  value={structuredNotes.concern}
                  onChange={(e) => setStructured('concern', e.target.value)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
                />
              </div>
            </div>
          )}

          {isCallback && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-amber-700">
                <CalendarClock size={12} /> Schedule the callback
              </p>
              <p className="text-[11px] text-amber-800">
                This call will be added to your follow-up queue. Pick a date and time when you save.
              </p>
            </div>
          )}

          {isNoAnswer && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-brand-ink/60">
                <Repeat size={12} /> Quick retry
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setScheduleFollowUp(true)}
                  className="rounded-lg border border-brand-lilac bg-white px-2 py-1.5 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
                >
                  Retry 15m
                </button>
                <button
                  onClick={() => setScheduleFollowUp(true)}
                  className="rounded-lg border border-brand-lilac bg-white px-2 py-1.5 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
                >
                  Retry 1h
                </button>
                <button
                  onClick={() => setScheduleFollowUp(true)}
                  className="rounded-lg border border-brand-lilac bg-white px-2 py-1.5 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
                >
                  Tomorrow
                </button>
              </div>
            </div>
          )}

          {isNotInterested && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase text-amber-700">
                <Ban size={12} /> This lead will be closed
              </p>
              <p className="text-[11px] text-amber-800">
                The lead will be removed from active campaigns. You can reopen it later if needed.
              </p>
            </div>
          )}

          <details className="rounded-xl border border-brand-lilac bg-brand-mist/30">
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-brand-ink/70">
              More options
            </summary>
            <div className="grid grid-cols-2 gap-2 border-t border-brand-lilac/60 p-3 sm:grid-cols-3">
              {DISPOSITIONS.filter((d) => !PRIMARY_DISPOSITIONS.find((p) => p.key === d)).map((d) => (
                <button
                  key={d}
                  onClick={() => setDisposition(d)}
                  className={`rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-all ${
                    disposition === d
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac bg-white text-brand-ink/70 hover:bg-brand-lilac/30'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </details>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <StickyNote size={12} /> Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add context for this call…"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <label
            className={`flex cursor-pointer items-center gap-2 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3 text-sm text-brand-ink/70 ${
              autoSchedule ? 'cursor-not-allowed opacity-90' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={scheduleFollowUp || autoSchedule}
              disabled={autoSchedule}
              onChange={(e) => setScheduleFollowUp(e.target.checked)}
              className="h-4 w-4 rounded border-brand-lilac accent-brand-magenta"
            />
            <Calendar size={14} className="text-amber-600" />
            Schedule a follow-up
            {autoSchedule && (
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Auto-enabled
              </span>
            )}
          </label>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onSave(
                  record,
                  disposition,
                  notes,
                  scheduleFollowUp || autoSchedule,
                  structuredNotes,
                  purpose
                )
              }
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Save Disposition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   FOLLOW-UP MODAL
   ================================================================ */
function FollowUpModal({ record, onClose, onSave }) {
  const today = todayYMD();
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Schedule Follow-up</h3>
              <p className="text-xs text-brand-ink/50">{record.customer}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Date</label>
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
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Context for the follow-up…"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(record, { date, time, notes })}
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
   CALL RECORD DRAWER
   ================================================================ */
function CallRecordDrawer({ record, siblingRecords, onClose, onCall, onFollowUp, onRetry, onViewLead }) {
  const isMissed = record.status === 'missed';
  const isInbound = record.type === 'inbound';
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const action = getNextAction(record);
  const ActionIcon = action.icon;
  const nextContact = getNextContactState(record);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);

  const timeline = useMemo(() => {
    const items = [
      {
        id: 'now',
        type: isInbound ? 'inbound-call' : 'outbound-call',
        when: record.at,
        duration: record.duration,
        outcome: record.outcome,
        current: true,
      },
    ];
    siblingRecords.forEach((r) => {
      items.push({
        id: r.id,
        type: r.type === 'inbound' ? 'inbound-call' : 'outbound-call',
        when: r.at,
        duration: r.duration,
        outcome: r.outcome,
      });
    });
    if (record.notes) {
      items.push({
        id: 'note-1',
        type: 'note',
        when: record.at,
        text: record.notes,
      });
    }
    if (record.followUpDate) {
      items.push({
        id: 'fu-1',
        type: 'follow-up',
        when: record.followUpDate,
        text: record.followUpNotes,
      });
    }
    return items.sort((a, b) => {
      const ta = new Date(a.when).getTime() || 0;
      const tb = new Date(b.when).getTime() || 0;
      return tb - ta;
    });
  }, [record, siblingRecords, isInbound]);

  const retryHistory = record.retryHistory || [];
  const allCallsFromCustomer = [record, ...siblingRecords];

  const nextContactTone =
    nextContact.state === 'overdue'
      ? 'border-rose-200 bg-rose-50 text-rose-600'
      : nextContact.state === 'due-soon'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : nextContact.state === 'today'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
      : nextContact.state === 'future'
      ? 'border-violet-200 bg-violet-50 text-brand-purple'
      : 'border-brand-lilac bg-brand-mist/40 text-brand-ink/60';

  const drawerTabs = [
    { key: 'overview',  label: 'Overview',  icon: Info },
    { key: 'timeline',  label: 'Timeline',  icon: History },
    { key: 'recording', label: 'Recording', icon: FileAudio },
    { key: 'customer',  label: 'Customer',  icon: User },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 border-b border-brand-lilac bg-white">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
                {isInbound ? 'Inbound' : 'Outbound'} Call · {timeAgo(record.at)}
              </p>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Call Details</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto px-5 pb-3">
            {drawerTabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-card'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={11} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${
              action.tone === 'rose'
                ? 'border-rose-200 bg-rose-50'
                : action.tone === 'amber'
                ? 'border-amber-200 bg-amber-50'
                : action.tone === 'emerald'
                ? 'border-emerald-200 bg-emerald-50'
                : action.tone === 'slate'
                ? 'border-slate-200 bg-slate-50'
                : 'border-violet-200 bg-violet-50'
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ${
                action.tone === 'rose'
                  ? 'text-rose-600'
                  : action.tone === 'amber'
                  ? 'text-amber-700'
                  : action.tone === 'emerald'
                  ? 'text-emerald-600'
                  : action.tone === 'slate'
                  ? 'text-slate-600'
                  : 'text-brand-purple'
              }`}
            >
              <ActionIcon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">Next Action</p>
              <p className="text-sm font-bold text-brand-ink">{action.label}</p>
              {action.reason && (
                <p className="mt-0.5 text-[11px] text-brand-ink/60">{action.reason}</p>
              )}
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white ${
                    isInbound
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                      : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
                  }`}
                >
                  {record.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-ink">{record.customer}</p>
                  <p className="text-sm text-brand-ink/50">{record.mobile}</p>
                  {record.leadId && (
                    <p className="font-mono text-[10px] text-brand-ink/40">{record.leadId}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLES[record.status] || STATUS_STYLES.failed
                  }`}
                >
                  {record.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoBox label="Duration" value={record.duration} />
                <InfoBox label="Type"     value={isInbound ? 'Inbound' : 'Outbound'} />
                <InfoBox label="Outcome"  value={record.outcome || '—'} />
                <InfoBox label="Agent"    value="You" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                    <Clock size={10} className="inline" /> Last Contact
                  </p>
                  <p className="text-xs font-semibold text-brand-ink">{formatDateTime(record.at)}</p>
                </div>
                <div className={`rounded-xl border-2 p-3 ${nextContactTone}`}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    <CalendarClock size={10} className="inline" /> Next Contact
                  </p>
                  <p className="text-xs font-bold">{nextContact.label}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <DrawerAction icon={Phone}    label="Call"      tone="emerald" onClick={onCall} />
                <DrawerAction icon={Calendar} label="Follow-Up" tone="amber"   onClick={onFollowUp} />
                <DrawerAction icon={Clock}    label="Retry"     tone="rose"    onClick={onRetry} />
                <DrawerAction icon={Users}    label="View Lead" tone="purple"  onClick={onViewLead} />
              </div>

              <div className="card !space-y-2.5 !p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                  Call Summary
                </p>
                <Row icon={Flame}     label="Priority"    value={record.priority || '—'} />
                <Row icon={Target}    label="Purpose"     value={record.purpose || '—'} />
                <Row icon={Building2} label="Campaign"    value={record.campaign || '—'} />
                <Row icon={Layers}    label="Source"      value={record.source || '—'} />
                <Row icon={PhoneCall} label="Total calls" value={String(allCallsFromCustomer.length)} />
              </div>

              {retryHistory.length > 0 && (
                <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink/60">
                    <Repeat size={11} /> Retry History · {retryHistory.length} attempts
                  </p>
                  <div className="space-y-1.5">
                    {retryHistory.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[11px]"
                      >
                        <span className="text-brand-ink/60">Attempt {i + 1}</span>
                        <span className="font-mono text-brand-ink/60">{formatDateTime(r.at)}</span>
                        <span className="font-semibold text-brand-ink">{r.outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {record.structuredNotes && Object.values(record.structuredNotes).some(Boolean) && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    <Sparkles size={11} /> Structured Notes
                  </p>
                  <div className="space-y-1.5">
                    {record.structuredNotes.need && (
                      <Row icon={Target} label="Need" value={record.structuredNotes.need} />
                    )}
                    {record.structuredNotes.budget && (
                      <Row icon={IndianRupee} label="Budget" value={record.structuredNotes.budget} />
                    )}
                    {record.structuredNotes.requirement && (
                      <Row icon={Calendar} label="Requirement" value={record.structuredNotes.requirement} />
                    )}
                    {record.structuredNotes.concern && (
                      <Row icon={AlertCircle} label="Concern" value={record.structuredNotes.concern} />
                    )}
                  </div>
                </div>
              )}

              {record.notes && (
                <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                    Call Notes
                  </p>
                  <p className="whitespace-pre-line text-sm text-brand-ink/80">{record.notes}</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'timeline' && (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <History size={12} /> Customer Timeline
              </p>
              <div className="relative space-y-3">
                <span className="pointer-events-none absolute bottom-4 left-[15px] top-4 w-px bg-brand-lilac" />
                {timeline.map((t) => (
                  <TimelineItem key={t.id} item={t} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recording' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <FileAudio size={11} /> Call Recording
              </p>
              {record.recording ? (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying((p) => !p)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                    </button>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-amber-100">
                      <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple" />
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-amber-700">
                      02:14 / {record.duration}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => setPlaySpeed(s)}
                          className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                            playSpeed === s
                              ? 'bg-brand-magenta text-white'
                              : 'bg-white text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                    <button className="flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
                      <Download size={11} /> Download
                    </button>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-amber-200 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      Key Moments
                    </p>
                    <button className="flex w-full items-center gap-3 rounded-lg bg-white px-3 py-2 text-left text-[11px] hover:bg-amber-100">
                      <span className="font-mono text-amber-700">00:42</span>
                      <span className="text-brand-ink/70">Customer discusses budget</span>
                    </button>
                    <button className="flex w-full items-center gap-3 rounded-lg bg-white px-3 py-2 text-left text-[11px] hover:bg-amber-100">
                      <span className="font-mono text-amber-700">01:35</span>
                      <span className="text-brand-ink/70">Asked for brochure</span>
                    </button>
                    <button className="flex w-full items-center gap-3 rounded-lg bg-white px-3 py-2 text-left text-[11px] hover:bg-amber-100">
                      <span className="font-mono text-amber-700">03:10</span>
                      <span className="text-brand-ink/70">Requested callback</span>
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-[11px] italic text-amber-800">
                  🎧 No recording available for this call.
                </p>
              )}
            </div>
          )}

          {activeTab === 'customer' && (
            <>
              <div className="card !space-y-2.5 !p-4">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-magenta">
                  <Sparkles size={11} /> Lead Context
                </p>
                <Row icon={User}        label="Lead ID"          value={record.leadId || '—'} />
                <Row icon={Flame}       label="Lead stage"       value={record.leadStage || '—'} />
                <Row icon={Target}      label="Priority"         value={record.priority || '—'} />
                <Row icon={Building2}   label="Campaign"         value={record.campaign || '—'} />
                <Row icon={Layers}      label="Source"           value={record.source || '—'} />
                <Row icon={IndianRupee} label="Budget"           value={record.budget || '—'} />
                <Row icon={MapPin}      label="Location"         value={record.location || '—'} />
                {record.preferredContact && (
                  <Row icon={Clock} label="Preferred contact" value={record.preferredContact} />
                )}
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                  Quick Actions
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <QuickAction icon={Phone}         label="Call" />
                  <QuickAction icon={MessageCircle} label="WhatsApp" />
                  <QuickAction icon={MessageSquare} label="SMS" />
                  <QuickAction icon={ExternalLink}  label="View Lead" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ item }) {
  const tone = (() => {
    if (item.type === 'inbound-call')  return { ring: 'bg-emerald-100 text-emerald-600', Icon: PhoneIncoming };
    if (item.type === 'outbound-call') return { ring: 'bg-violet-100 text-brand-purple', Icon: PhoneOutgoing };
    if (item.type === 'note')          return { ring: 'bg-amber-100 text-amber-700',     Icon: StickyNote };
    if (item.type === 'follow-up')     return { ring: 'bg-amber-100 text-amber-700',     Icon: Calendar };
    return { ring: 'bg-slate-100 text-slate-500', Icon: Phone };
  })();
  const Icon = tone.Icon;

  return (
    <div className="relative flex items-start gap-3">
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${tone.ring}`}
      >
        <Icon size={12} />
      </span>
      <div className="min-w-0 flex-1 rounded-xl border border-brand-lilac/60 bg-white p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold capitalize text-brand-ink">
            {item.type === 'inbound-call'
              ? 'Inbound call'
              : item.type === 'outbound-call'
              ? 'Outbound call'
              : item.type === 'note'
              ? 'Note added'
              : item.type === 'follow-up'
              ? 'Follow-up scheduled'
              : 'Activity'}
            {item.current && (
              <span className="ml-1 rounded-full bg-brand-magenta/10 px-1.5 py-0.5 text-[9px] font-bold text-brand-magenta">
                Current
              </span>
            )}
          </p>
          {item.duration && (
            <span className="font-mono text-[10px] text-brand-ink/50">{item.duration}</span>
          )}
        </div>
        {item.outcome && <p className="mt-0.5 text-[11px] text-brand-ink/60">{item.outcome}</p>}
        {item.text && <p className="mt-0.5 text-[11px] text-brand-ink/60">{item.text}</p>}
        <p className="mt-0.5 text-[10px] text-brand-ink/40">{formatDateTime(item.when)}</p>
      </div>
    </div>
  );
}

function DrawerAction({ icon: Icon, label, tone, onClick }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
    purple:  'bg-violet-50 text-brand-purple ring-violet-200',
    amber:   'bg-amber-50 text-amber-700 ring-amber-200',
    rose:    'bg-rose-50 text-rose-600 ring-rose-200',
  };
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-2.5 text-[10px] font-bold text-brand-ink transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-sm"
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]} ring-1`}>
        <Icon size={14} />
      </span>
      {label}
    </button>
  );
}

function QuickAction({ icon: Icon, label }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white p-2 text-center transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40">
      <Icon size={14} className="text-brand-magenta" />
      <span className="text-[10px] font-semibold text-brand-ink/70">{label}</span>
    </button>
  );
}

/* ================================================================
   SMALL PARTS
   ================================================================ */
function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/40 pb-1.5 text-xs last:border-b-0">
      <span className="flex shrink-0 items-center gap-1.5 text-brand-ink/50">
        <Icon size={11} /> {label}
      </span>
      <span className="truncate font-semibold text-brand-ink">{value}</span>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-brand-mist p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold capitalize text-brand-ink">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <input
        type={type}
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

/* ================================================================
   EMPTY STATE
   ================================================================ */
function EmptyState({ tab, onReset }) {
  const messages = {
    all:      'No call records found',
    inbound:  'No inbound calls found',
    outbound: 'No outbound calls found',
    missed:   'No missed calls — nice!',
  };
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Inbox size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {messages[tab] || 'Nothing to show'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        Try clearing filters or adjusting your search.
      </p>
      <button
        onClick={onReset}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta"
      >
        <RotateCcw size={12} /> Clear all filters
      </button>
    </div>
  );
}

/* ================================================================
   DROPDOWN FILTER
   ================================================================ */
function DropdownFilter({ label, icon: Icon, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const normalized = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );
  const current = normalized.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        <span className="text-brand-ink/60">{label}:</span>
        <span className="font-semibold capitalize text-brand-magenta">
          {current?.label ?? value}
        </span>
        <ChevronDown size={14} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-56 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {normalized.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
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
   ADVANCED FILTERS PANEL
   ================================================================ */
function AdvancedFiltersPanel({ filters, setFilters, onReset }) {
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
        <FilterField
          icon={CircleDot}
          label="Status"
          value={filters.status}
          options={STATUS_FILTER_OPTIONS}
          onChange={(v) => update('status', v)}
        />
        <FilterField
          icon={Phone}
          label="Call Type"
          value={filters.type}
          options={CALL_TYPE_OPTIONS}
          onChange={(v) => update('type', v)}
        />
        <FilterField
          icon={Building2}
          label="Campaign"
          value={filters.campaign}
          options={CAMPAIGN_OPTIONS}
          onChange={(v) => update('campaign', v)}
        />
        <FilterField
          icon={Flame}
          label="Priority"
          value={filters.priority}
          options={PRIORITY_OPTIONS}
          onChange={(v) => update('priority', v)}
        />
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Timer size={12} /> Min Duration (minutes)
          </p>
          <input
            type="number"
            min="0"
            value={filters.durationMin}
            onChange={(e) => update('durationMin', e.target.value)}
            placeholder="e.g. 2"
            className="w-full rounded-lg border border-brand-lilac bg-white px-3 py-2 text-xs outline-none focus:border-brand-magenta"
          />
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Calendar size={12} /> Custom Date Range
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
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-ink/40"
        />
      </div>
    </div>
  );
}

/* ================================================================
   ANIMATED STAT CARD
   ================================================================ */
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

function AnimatedStatCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
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
      className={`group animate-fade-slide-in relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 ${t.border} ${t.shadow}`}
    >
      <span
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`}
      />
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}
          >
            <Icon size={18} />
          </span>
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

/* ================================================================
   TOAST
   ================================================================ */
function Toast({ message, type }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2"
    >
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