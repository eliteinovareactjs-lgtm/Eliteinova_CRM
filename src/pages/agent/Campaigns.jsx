// src/pages/agent/Campaigns.jsx
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  Megaphone, Users, Phone, PhoneCall, PhoneIncoming, PhoneMissed,
  CheckCircle2, AlertCircle, X, Search, ChevronDown, ChevronRight,
  StickyNote, ListFilter, Inbox, Tag, TrendingUp, Flame, Ban,
  List, Grid3x3, Calendar, Play, Pause, PhoneOff, Mic, MicOff,
  Volume2, VolumeX, PauseCircle, PlayCircle, History, Target, Award,
  Clock, Briefcase, User, Zap, TrendingDown, PhoneForwarded,
  Radio, CircleDot, Sparkles, ChevronUp, Layers, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS } from '../../data/mockData';

/* ================================================================
   CONSTANTS
   ================================================================ */
const TABS = [
  { key: 'campaigns', label: 'My Campaigns',     icon: Megaphone },
  { key: 'leads',     label: 'Campaign Leads',   icon: Users },
  { key: 'pending',   label: 'Pending Calls',    icon: PhoneCall, live: true },
  { key: 'history',   label: 'Campaign History', icon: History },
];

const DISPOSITIONS = [
  'Connected', 'No Answer', 'Busy', 'Call Back', 'Interested',
  'Not Interested', 'Wrong Number', 'Converted', 'Follow-Up Required',
  'Customer Requested Information', 'Other',
];

const PRIORITY_FILTER_OPTIONS = [
  { value: 'All',    label: 'All Priorities' },
  { value: 'High',   label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low',    label: 'Low' },
];

const PRIORITY_STYLES = {
  High:   'border-rose-200 bg-rose-50 text-rose-600',
  Medium: 'border-amber-200 bg-amber-50 text-amber-600',
  Low:    'border-emerald-200 bg-emerald-50 text-emerald-600',
};

const CAMPAIGN_STATUS_STYLES = {
  Active:    'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Paused:    'bg-amber-100 text-amber-700 ring-amber-200',
  Completed: 'bg-slate-200 text-slate-700 ring-slate-300',
  Draft:     'bg-blue-100 text-blue-700 ring-blue-200',
};

const CONNECTED_DISPOSITIONS = ['Connected', 'Interested', 'Converted', 'Follow-Up Required'];

const campaignHealth = (c) => {
  if (c.pendingCalls === 0 && c.converted > 0) return { label: 'Completed', tone: 'slate' };
  if (c.pendingCalls === 0) return { label: 'Idle', tone: 'slate' };
  if (c.followUpRequired > c.pendingCalls) return { label: 'Follow-ups Due', tone: 'amber' };
  return { label: 'On Track', tone: 'emerald' };
};

const HEALTH_TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  amber:   'bg-amber-50 text-amber-600 ring-amber-200',
  slate:   'bg-slate-100 text-slate-600 ring-slate-200',
};

/* ================================================================
   DATE HELPERS — used to compute "today's" focus
   ================================================================ */
const toISODate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const TODAY_ISO = () => toISODate(new Date());

const addDaysISO = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toISODate(dt);
};

const formatDateLabel = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

/* ================================================================
   DEMO DATA
   ================================================================ */
const buildDemoCampaigns = (agentName, websiteId) => [
  {
    id: 'cmp-1', name: 'Q3 Outreach', status: 'Active', agentName, websiteId,
    startDate: '2026-09-01', endDate: '2026-09-30',
    totalLeads: 320, pendingCalls: 87, callsCompleted: 233, connected: 178,
    noAnswer: 42, interested: 63, notInterested: 39, followUpRequired: 58, converted: 21,
    description: 'Outbound lead qualification for Q3 pipeline.',
  },
  {
    id: 'cmp-2', name: 'Diwali Promo', status: 'Active', agentName, websiteId,
    startDate: '2026-09-20', endDate: '2026-10-20',
    totalLeads: 210, pendingCalls: 132, callsCompleted: 78, connected: 61,
    noAnswer: 12, interested: 24, notInterested: 15, followUpRequired: 19, converted: 6,
    description: 'Festive offer promotion to warm leads.',
  },
  {
    id: 'cmp-3', name: 'Referral Drive', status: 'Paused', agentName, websiteId,
    startDate: '2026-08-15', endDate: '2026-09-15',
    totalLeads: 145, pendingCalls: 18, callsCompleted: 127, connected: 101,
    noAnswer: 20, interested: 44, notInterested: 22, followUpRequired: 31, converted: 14,
    description: 'Referral-focused outbound campaign.',
  },
  {
    id: 'cmp-4', name: 'Festive Offers', status: 'Completed', agentName, websiteId,
    startDate: '2026-07-01', endDate: '2026-08-30',
    totalLeads: 400, pendingCalls: 0, callsCompleted: 400, connected: 318,
    noAnswer: 60, interested: 142, notInterested: 88, followUpRequired: 71, converted: 53,
    description: 'Completed seasonal campaign.',
  },
];

/* Each generated lead gets a followUpDate relative to TODAY.
   This is what makes the "Today" strip meaningful — some leads
   are due today, some overdue, some in the future, most none. */
const buildDemoCampaignLeads = (agentName, websiteId) => {
  const campaigns = buildDemoCampaigns(agentName, websiteId);
  const today = TODAY_ISO();

  const outcomes = [
    { status: 'pending',   outcome: '—',              disposition: '' },
    { status: 'pending',   outcome: '—',              disposition: '' },
    { status: 'pending',   outcome: '—',              disposition: '' },
    { status: 'pending',   outcome: '—',              disposition: '' },
    { status: 'completed', outcome: 'Interested',     disposition: 'Interested' },
    { status: 'completed', outcome: 'No Answer',      disposition: 'No Answer' },
    { status: 'followup',  outcome: 'Call Back',      disposition: 'Call Back' },
    { status: 'completed', outcome: 'Not Interested', disposition: 'Not Interested' },
  ];

  // Spread follow-ups across the week so the demo shows overdue + today + future
  const followUpOffsets = [-3, -1, 0, 0, 1, 3, 7];

  const PER_CAMPAIGN = 12;

  return Array.from({ length: campaigns.length * PER_CAMPAIGN }, (_, i) => {
    const campaign = campaigns[Math.floor(i / PER_CAMPAIGN)];
    const entry = outcomes[i % outcomes.length];
    const lead = LEADS[i % LEADS.length];

    // Only some pending / followup leads get a follow-up date — that's realistic
    const hasFollowUp = (entry.status === 'pending' || entry.status === 'followup') && (i % 3 === 0);
    const followUpDate = hasFollowUp
      ? addDaysISO(today, followUpOffsets[i % followUpOffsets.length])
      : null;

    return {
      id: `cl-${i + 1}`,
      campaignId: campaign.id,
      campaignName: campaign.name,
      agentName, websiteId,
      leadId: lead?.id,
      name: lead?.name || `Lead ${i + 1}`,
      mobile: lead?.mobile || `98765${String(43210 + i).slice(-5)}`,
      email: lead?.email || '',
      leadSource: lead?.leadSource || 'Campaign',
      priority: ['High', 'Medium', 'Low'][i % 3],
      status: entry.status,
      outcome: entry.outcome,
      disposition: entry.disposition,
      lastContact: entry.status === 'pending' ? '—' : 'Yesterday · 10:30',
      attempts: entry.status === 'pending' ? 0 : 1 + (i % 3),
      followUpDate,                     // ⬅️ TODAY — ISO date or null
      assignedDate: addDaysISO(today, -(i % 10)),  // ⬅️ TODAY — when it landed in my queue
    };
  });
};

const countCampaignStats = (leads, campaignId) => {
  const list = leads.filter((l) => l.campaignId === campaignId);
  return {
    pending:       list.filter((l) => l.status === 'pending').length,
    completed:     list.filter((l) => l.status === 'completed').length,
    followup:      list.filter((l) => l.status === 'followup').length,
    interested:    list.filter((l) => l.disposition === 'Interested').length,
    converted:     list.filter((l) => l.disposition === 'Converted').length,
    connected:     list.filter((l) => CONNECTED_DISPOSITIONS.includes(l.disposition)).length,
    notInterested: list.filter((l) => l.disposition === 'Not Interested').length,
    noAnswer:      list.filter((l) => l.disposition === 'No Answer').length,
  };
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function Campaigns() {
  const { user, activeWebsiteId } = useAuth();

  const [activeTab, setActiveTab] = useState('campaigns');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [toast, setToast] = useState(null);

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [detailLead, setDetailLead] = useState(null);

  const [callingLead, setCallingLead] = useState(null);
  const [callMinimized, setCallMinimized] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [dispositionLead, setDispositionLead] = useState(null);
  const [showNote, setShowNote] = useState(null);
  const [callQueue, setCallQueue] = useState(null);
  const [queueIndex, setQueueIndex] = useState(0);

  const [recentlyCalled, setRecentlyCalled] = useState([]);

  /* ⬅️ TODAY — the reference date for the strip.
     Computed once on mount. (In production you'd re-derive when the
     page regains focus, or refresh at midnight — see note below.) */
  const [todayISO] = useState(TODAY_ISO);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const [campaignBaselines] = useState(() =>
    buildDemoCampaigns(user?.name || 'Agent', activeWebsiteId)
  );

  const [leads, setLeads] = useState(() =>
    buildDemoCampaignLeads(user?.name || 'Agent', activeWebsiteId)
  );

  const baselineSnapshot = useRef({});

  useEffect(() => {
    const fresh = buildDemoCampaignLeads(user?.name || 'Agent', activeWebsiteId);
    setLeads(fresh);

    const snap = {};
    for (const base of campaignBaselines) {
      snap[base.id] = countCampaignStats(fresh, base.id);
    }
    baselineSnapshot.current = snap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, activeWebsiteId]);

  const campaigns = useMemo(() => {
    return campaignBaselines.map((base) => {
      const live = countCampaignStats(leads, base.id);
      const snap = baselineSnapshot.current[base.id] || {
        pending: 0, completed: 0, followup: 0,
        interested: 0, converted: 0, connected: 0,
        notInterested: 0, noAnswer: 0,
      };

      const dPending       = live.pending       - snap.pending;
      const dCompleted     = live.completed     - snap.completed;
      const dFollowup      = live.followup      - snap.followup;
      const dInterested    = live.interested    - snap.interested;
      const dConverted     = live.converted     - snap.converted;
      const dConnected     = live.connected     - snap.connected;
      const dNotInterested = live.notInterested - snap.notInterested;
      const dNoAnswer      = live.noAnswer      - snap.noAnswer;

      return {
        ...base,
        pendingCalls:     Math.max(0, base.pendingCalls     + dPending),
        callsCompleted:   Math.max(0, base.callsCompleted   + dCompleted + dFollowup),
        connected:        Math.max(0, base.connected        + dConnected),
        converted:        Math.max(0, base.converted        + dConverted),
        interested:       Math.max(0, base.interested       + dInterested),
        notInterested:    Math.max(0, base.notInterested    + dNotInterested),
        noAnswer:         Math.max(0, base.noAnswer         + dNoAnswer),
        followUpRequired: Math.max(0, base.followUpRequired + dFollowup),
      };
    });
  }, [campaignBaselines, leads]);

  /* ⬅️ TODAY — this is the important block.
     Everything the strip shows is derived here, scoped to todayISO. */
  const todayFocus = useMemo(() => {
    const isOpen = (l) => l.status === 'pending' || l.status === 'followup';

    // 1. Pending calls — leads still open
    const pendingLeads = leads.filter((l) => isOpen(l));

    // 2. High priority — subset of pending
    const highPriority = pendingLeads.filter((l) => l.priority === 'High');

    // 3. Follow-ups due today OR overdue
    //    A follow-up is "due" if its date <= today.
    //    A follow-up is "overdue" if its date < today.
    const followUpsDueToday = pendingLeads.filter(
      (l) => l.followUpDate && l.followUpDate <= todayISO
    );
    const overdue = pendingLeads.filter(
      (l) => l.followUpDate && l.followUpDate < todayISO
    );

    // 4. Next lead to call — priority order, then follow-up-date order
    const order = { High: 0, Medium: 1, Low: 2 };
    const nextLead = [...pendingLeads].sort((a, b) => {
      const pa = order[a.priority] - order[b.priority];
      if (pa !== 0) return pa;
      const fa = a.followUpDate || '9999-12-31';
      const fb = b.followUpDate || '9999-12-31';
      return fa.localeCompare(fb);
    })[0];

    // 5. When this summary was last recomputed (helps trust the numbers)
    const generatedAt = new Date();

    return {
      pendingCount: pendingLeads.length,
      highPriorityCount: highPriority.length,
      followUpsDueCount: followUpsDueToday.length,
      overdueCount: overdue.length,
      nextLead,
      generatedAt,
      dateLabel: new Date(todayISO).toLocaleDateString(undefined, {
        weekday: 'short', day: 'numeric', month: 'short',
      }),
    };
  }, [leads, todayISO]);

  const summary = useMemo(() => {
    const totalLeads    = campaigns.reduce((s, c) => s + c.totalLeads, 0);
    const pendingCalls  = campaigns.reduce((s, c) => s + c.pendingCalls, 0);
    const connected     = campaigns.reduce((s, c) => s + c.connected, 0);
    const converted     = campaigns.reduce((s, c) => s + c.converted, 0);
    const followUpsDue  = campaigns.reduce((s, c) => s + c.followUpRequired, 0);
    const highPriority  = leads.filter((l) => l.status === 'pending' && l.priority === 'High').length;

    return {
      activeCampaigns: campaigns.filter((c) => c.status === 'Active').length,
      totalCampaigns: campaigns.length,
      totalLeads, pendingCalls, connected, converted,
      followUpsDue, highPriority,
    };
  }, [campaigns, leads]);

  const filteredLeads = useMemo(() => {
    let list = leads;
    if (activeTab === 'pending') {
      list = list.filter((l) => l.status === 'pending');
    } else if (activeTab === 'history') {
      list = list.filter((l) => l.status === 'completed' || l.status === 'followup');
    }
    if (campaignFilter !== 'All') list = list.filter((l) => l.campaignId === campaignFilter);
    if (statusFilter !== 'All') list = list.filter((l) => l.status === statusFilter);
    if (priorityFilter !== 'All') list = list.filter((l) => l.priority === priorityFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) =>
        `${l.name} ${l.mobile} ${l.campaignName} ${l.outcome}`.toLowerCase().includes(q)
      );
    }
    const order = { High: 0, Medium: 1, Low: 2 };
    return [...list].sort((a, b) => order[a.priority] - order[b.priority]);
  }, [leads, activeTab, campaignFilter, statusFilter, priorityFilter, searchQuery]);

  const updateLead = useCallback((id, patch) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l))), []);

  const pushRecentlyCalled = (lead, disposition) => {
    const toneMap = {
      Interested:  'rose',
      Converted:   'emerald',
      'Call Back': 'amber',
      'No Answer': 'slate',
      'Not Interested': 'slate',
      'Wrong Number': 'slate',
      Busy:        'slate',
      Skipped:     'slate',
    };
    setRecentlyCalled((prev) => [
      {
        id: `rc-${Date.now()}`,
        name: lead.name,
        outcome: disposition,
        ago: 'Just now',
        tone: toneMap[disposition] || 'slate',
        campaignName: lead.campaignName,
      },
      ...prev.slice(0, 5),
    ]);
  };

  /* ═══════════════════════════════════════════════════════════════
     CALLING FLOW
     ═══════════════════════════════════════════════════════════════ */

  const openCall = (lead) => {
    setCallingLead(lead);
    setCallMinimized(false);
    setCallNotes('');
  };

  const startQueue = (pendingLeads) => {
    if (!pendingLeads || pendingLeads.length === 0) {
      showToast('No pending leads', 'error');
      return;
    }
    setCallQueue(pendingLeads);
    setQueueIndex(0);
    openCall(pendingLeads[0]);
  };

  const handleStartCampaignQueue = (campaign) => {
    const pending = leads
      .filter((l) => l.campaignId === campaign.id && l.status === 'pending')
      .sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.priority] - { High: 0, Medium: 1, Low: 2 }[b.priority]));
    if (pending.length === 0) {
      showToast('No pending leads in this campaign', 'error');
      return;
    }
    startQueue(pending);
  };

  /* ⬅️ TODAY — the strip's Start Calling uses todayFocus.nextLead order */
  const handleStartFocusQueue = () => {
    const isOpen = (l) => l.status === 'pending' || l.status === 'followup';
    const order = { High: 0, Medium: 1, Low: 2 };

    const queue = [...leads]
      .filter(isOpen)
      .sort((a, b) => {
        const pa = order[a.priority] - order[b.priority];
        if (pa !== 0) return pa;
        const fa = a.followUpDate || '9999-12-31';
        const fb = b.followUpDate || '9999-12-31';
        return fa.localeCompare(fb);
      });

    if (queue.length === 0) {
      showToast('No pending calls — nice!', 'error');
      return;
    }
    startQueue(queue);
  };

  const handleCallEnd = ({ notes = '' } = {}) => {
    if (!callingLead) return;
    const leadToDisposition = callingLead;
    setCallNotes(notes);
    setCallingLead(null);
    setCallMinimized(false);
    setDispositionLead(leadToDisposition);
  };

  const handleCallCancel = () => {
    setCallingLead(null);
    setCallMinimized(false);
    setCallNotes('');
    setCallQueue(null);
    setQueueIndex(0);
  };

  const handleSaveDisposition = (lead, disposition, notes, scheduleFollowUp) => {
    // ⬅️ TODAY — if user asked for follow-up, set the date to tomorrow.
    //    In a real CRM this would come from a date picker.
    const nextFollowUpDate = scheduleFollowUp
      ? addDaysISO(todayISO, 1)
      : null;

    updateLead(lead.id, {
      status: scheduleFollowUp ? 'followup' : 'completed',
      outcome: disposition,
      disposition,
      notes: notes
        ? (lead.notes ? `${lead.notes}\n${notes}` : notes)
        : lead.notes,
      lastContact: new Date().toLocaleString(),
      attempts: (lead.attempts || 0) + 1,
      followUpDate: nextFollowUpDate,
    });

    pushRecentlyCalled(lead, disposition);
    setDispositionLead(null);
    setCallNotes('');

    if (!callQueue) {
      showToast('Disposition saved');
      return;
    }

    const nextIndex = queueIndex + 1;
    if (nextIndex < callQueue.length) {
      const nextLead = callQueue[nextIndex];
      setQueueIndex(nextIndex);
      setCallingLead(nextLead);
      setCallMinimized(false);
      setCallNotes('');
      showToast(`Next lead · ${nextLead.name}`);
    } else {
      setCallQueue(null);
      setQueueIndex(0);
      showToast('Campaign queue complete 🎉');
    }
  };

  const handleSkipQueue = () => {
    if (!callingLead) return;

    updateLead(callingLead.id, {
      status: 'completed',
      outcome: 'Skipped',
      disposition: 'Skipped',
      lastContact: new Date().toLocaleString(),
      attempts: (callingLead.attempts || 0) + 1,
    });
    pushRecentlyCalled(callingLead, 'Skipped');

    if (!callQueue) {
      setCallingLead(null);
      setCallMinimized(false);
      setCallNotes('');
      return;
    }

    const nextIndex = queueIndex + 1;
    if (nextIndex < callQueue.length) {
      const nextLead = callQueue[nextIndex];
      setQueueIndex(nextIndex);
      setCallingLead(nextLead);
      setCallMinimized(false);
      setCallNotes('');
      showToast(`Next lead · ${nextLead.name}`);
    } else {
      setCallQueue(null);
      setQueueIndex(0);
      setCallingLead(null);
      setCallMinimized(false);
      showToast('Campaign queue complete 🎉');
    }
  };

  const handleSaveNote = (lead, note) => {
    updateLead(lead.id, { notes: (lead.notes ? `${lead.notes}\n` : '') + note });
    setShowNote(null);
    showToast('Note saved');
  };

  const handleMarkNotInterested = (lead) => {
    updateLead(lead.id, {
      status: 'completed',
      outcome: 'Not Interested',
      disposition: 'Not Interested',
      lastContact: new Date().toLocaleString(),
      attempts: (lead.attempts || 0) + 1,
      followUpDate: null,
    });
    pushRecentlyCalled(lead, 'Not Interested');
    showToast(`${lead.name} marked Not Interested`, 'error');
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">
              Campaign Workspace
            </h1>
            <p className="text-sm text-brand-ink/50">
              Manage campaigns, prioritize leads, and keep your calling queue moving.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {callQueue ? (
              <div className="flex items-center gap-3 rounded-full border border-brand-magenta/30 bg-gradient-to-r from-brand-magenta/[0.10] to-brand-purple/[0.10] px-4 py-2 text-xs font-semibold text-brand-magenta">
                <span className="flex items-center gap-1.5">
                  <PhoneCall size={13} />
                  Calling Queue
                  <span className="ml-0.5 rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] text-brand-magenta">
                    {String(queueIndex + 1).padStart(2, '0')} / {String(callQueue.length).padStart(2, '0')}
                  </span>
                </span>
                <button
                  onClick={() => { setCallQueue(null); setQueueIndex(0); setCallingLead(null); setCallMinimized(false); setCallNotes(''); }}
                  className="rounded-full p-0.5 hover:bg-brand-magenta/20"
                  title="Stop queue"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Calling Ready
              </span>
            )}
          </div>
        </div>

        {/* ================= TODAY'S CALLING FOCUS ================= */}
        <TodayFocusStrip
          focus={todayFocus}
          onStart={handleStartFocusQueue}
        />

        {/* ================= KPI STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard label="Campaigns"   value={summary.totalCampaigns}  sub={`${summary.activeCampaigns} active`} icon={Megaphone}     color="purple"  delay={0} />
          <AnimatedStatCard label="Total Leads" value={summary.totalLeads}      sub="In campaigns"                        icon={Users}         color="purple"  delay={40} />
          <AnimatedStatCard label="Pending"     value={summary.pendingCalls}    sub="To be called"                        icon={PhoneCall}     color="amber"   delay={80} />
          <AnimatedStatCard label="Connected"   value={summary.connected}       sub="Calls connected"                     icon={PhoneIncoming} color="emerald" delay={120} />
          <AnimatedStatCard label="Converted"   value={summary.converted}       sub="Won from campaigns"                  icon={Award}         color="emerald" delay={160} />
        </div>

        {/* ================= TABS + VIEW TOGGLE ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              const count =
                t.key === 'campaigns' ? campaigns.length :
                t.key === 'leads'     ? leads.length :
                t.key === 'pending'   ? leads.filter((l) => l.status === 'pending').length :
                                        leads.filter((l) => l.status === 'completed' || l.status === 'followup').length;
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
                  {t.live && !active && count > 0 && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                    </span>
                  )}
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

            {activeTab !== 'campaigns' && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-full border p-1.5 transition-all ${
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
                  className={`rounded-full border p-1.5 transition-all ${
                    viewMode === 'grid'
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/30'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= TAB CONTENT ================= */}
        {activeTab === 'campaigns' ? (
          campaigns.length === 0 ? (
            <EmptyState tab="campaigns" />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {campaigns.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    onView={() => setSelectedCampaign(c)}
                    onStartQueue={() => handleStartCampaignQueue(c)}
                  />
                ))}
              </div>

              <RecentlyCalledStrip items={recentlyCalled} />
            </>
          )
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, mobile, campaign, outcome..."
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
                label="Campaign"
                icon={Megaphone}
                value={campaignFilter}
                options={['All', ...campaigns.map((c) => ({ value: c.id, label: c.name }))]}
                onChange={setCampaignFilter}
              />

              <DropdownFilter
                label="Priority"
                icon={Flame}
                value={priorityFilter}
                options={PRIORITY_FILTER_OPTIONS}
                onChange={setPriorityFilter}
              />

              {(activeTab === 'history' || activeTab === 'leads') && (
                <DropdownFilter
                  label="Status"
                  icon={ListFilter}
                  value={statusFilter}
                  options={['All', 'pending', 'completed', 'followup']}
                  onChange={setStatusFilter}
                />
              )}

              <span className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink">
                <ListFilter size={14} className="text-brand-magenta" />
                Showing: <span className="text-brand-magenta">{filteredLeads.length}</span>
              </span>
            </div>

            {filteredLeads.length === 0 ? (
              <EmptyState tab={activeTab} onSwitchTab={setActiveTab} />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredLeads.map((lead) => (
                  <CampaignLeadCard
                    key={lead.id}
                    lead={lead}
                    todayISO={todayISO}
                    onCall={() => openCall(lead)}
                    onView={() => setDetailLead(lead)}
                    onNote={() => setShowNote(lead)}
                    onNotInterested={() => handleMarkNotInterested(lead)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLeads.map((lead) => (
                  <CampaignLeadRow
                    key={lead.id}
                    lead={lead}
                    todayISO={todayISO}
                    onCall={() => openCall(lead)}
                    onView={() => setDetailLead(lead)}
                    onNote={() => setShowNote(lead)}
                    onNotInterested={() => handleMarkNotInterested(lead)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ================= DRAWERS / MODALS ================= */}
        {selectedCampaign && (
          <CampaignDrawer
            campaign={selectedCampaign}
            leads={leads.filter((l) => l.campaignId === selectedCampaign.id)}
            todayISO={todayISO}
            onClose={() => setSelectedCampaign(null)}
            onStartQueue={() => { handleStartCampaignQueue(selectedCampaign); setSelectedCampaign(null); }}
            onCallLead={(lead) => { openCall(lead); setSelectedCampaign(null); }}
            onViewLead={(lead) => { setDetailLead(lead); setSelectedCampaign(null); }}
          />
        )}

        {detailLead && (
          <LeadDetailDrawer
            lead={detailLead}
            campaign={campaigns.find((c) => c.id === detailLead.campaignId)}
            todayISO={todayISO}
            onClose={() => setDetailLead(null)}
            onCall={() => { openCall(detailLead); setDetailLead(null); }}
            onNote={() => { setShowNote(detailLead); setDetailLead(null); }}
            onNotInterested={() => { handleMarkNotInterested(detailLead); setDetailLead(null); }}
          />
        )}

        {callingLead && !callMinimized && (
          <CallModal
            target={callingLead}
            inQueue={!!callQueue}
            queueIndex={queueIndex}
            queueSize={callQueue?.length || 0}
            nextLead={callQueue?.[queueIndex + 1]}
            onSkip={handleSkipQueue}
            onMinimize={() => setCallMinimized(true)}
            onClose={handleCallCancel}
            onEnd={handleCallEnd}
          />
        )}

        {callingLead && callMinimized && (
          <MiniCallDock
            target={callingLead}
            queueIndex={queueIndex}
            queueSize={callQueue?.length || 0}
            onExpand={() => setCallMinimized(false)}
            onEnd={handleCallCancel}
          />
        )}

        {dispositionLead && (
          <DispositionModal
            lead={dispositionLead}
            initialNotes={callNotes}
            onClose={() => { setDispositionLead(null); setCallNotes(''); }}
            onSave={handleSaveDisposition}
          />
        )}

        {showNote && (
          <NoteModal
            lead={showNote}
            onClose={() => setShowNote(null)}
            onSave={handleSaveNote}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ================================================================
   TODAY'S CALLING FOCUS STRIP — now truly date-aware
   ================================================================ */
function TodayFocusStrip({ focus, onStart }) {
  const priorityStyle = focus.nextLead ? PRIORITY_STYLES[focus.nextLead.priority] : '';
  const followUpLabel = focus.followUpsDueCount > 0
    ? 'Follow-ups Due'
    : 'Follow-ups Due';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-r from-white via-white to-brand-lilac/20 shadow-[0_8px_24px_-12px_rgba(227,28,121,0.2)]">
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-magenta/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-brand-purple/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {/* Label + date */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
              <Zap size={14} />
              <span className="absolute inset-0 -z-10 animate-ping rounded-lg bg-brand-magenta/30" />
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
              Today's Calling Focus
            </p>
            <span className="hidden h-3 w-px bg-brand-lilac sm:block" />
            <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-ink/40 sm:inline">
              {focus.dateLabel}
            </span>
          </div>

          {/* Numbers — all derived from todayFocus */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <FocusStat value={focus.pendingCount} label="Pending Calls" tone="purple" icon={PhoneCall} />
            <span className="hidden h-8 w-px bg-brand-lilac sm:block" />
            <FocusStat value={focus.highPriorityCount} label="High Priority" tone="rose" icon={Flame} />
            <span className="hidden h-8 w-px bg-brand-lilac sm:block" />
            <FocusStat
              value={focus.followUpsDueCount}
              label={followUpLabel}
              tone="amber"
              icon={Calendar}
              badge={focus.overdueCount > 0 ? `${focus.overdueCount} overdue` : null}
            />
          </div>

          {/* Next lead */}
          {focus.nextLead ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-brand-ink/60">
              <span className="font-semibold uppercase tracking-wider text-brand-ink/40">
                Next Lead:
              </span>
              <span className="font-display text-sm font-bold text-brand-ink">
                {focus.nextLead.name}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${priorityStyle}`}>
                {focus.nextLead.priority}
              </span>
              <span className="text-brand-ink/40">·</span>
              <span>{focus.nextLead.campaignName}</span>
              {focus.nextLead.followUpDate && focus.nextLead.followUpDate <= todayISOSafe() && (
                <>
                  <span className="text-brand-ink/40">·</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                    <Clock size={10} />
                    {focus.nextLead.followUpDate < todayISOSafe()
                      ? `Overdue since ${formatDateLabel(focus.nextLead.followUpDate)}`
                      : 'Follow-up due today'}
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-brand-ink/50">No pending leads right now 🎉</p>
          )}
        </div>

        <button
          onClick={onStart}
          disabled={focus.pendingCount === 0}
          className="group/btn relative inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-14px_rgba(227,28,121,0.7)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <PhoneCall size={16} className="transition-transform group-hover/btn:rotate-12" />
          Start Calling
          {focus.pendingCount > 0 && (
            <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
              {focus.pendingCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/* Tiny helper so the component doesn't need to import TODAY_ISO */
function todayISOSafe() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function FocusStat({ value, label, tone = 'purple', icon: Icon, badge }) {
  const tones = {
    purple: 'text-brand-purple',
    rose:   'text-brand-magenta',
    amber:  'text-amber-600',
    emerald:'text-emerald-600',
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-mist ${tones[tone]}`}>
        <Icon size={14} />
      </span>
      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <p className={`font-display text-xl font-bold tabular-nums ${tones[tone]}`}>{value}</p>
          {badge && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
              <AlertTriangle size={9} /> {badge}
            </span>
          )}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
      </div>
    </div>
  );
}

/* ================================================================
   RECENTLY CALLED STRIP
   ================================================================ */
function RecentlyCalledStrip({ items }) {
  const tones = {
    rose:    'bg-rose-50 text-brand-magenta ring-rose-200',
    slate:   'bg-slate-50 text-slate-600 ring-slate-200',
    amber:   'bg-amber-50 text-amber-600 ring-amber-200',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  };

  if (!items || items.length === 0) {
    return (
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-lilac/60 bg-gradient-to-r from-brand-magenta/[0.05] to-brand-purple/[0.05] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-brand-purple">
              <History size={14} />
            </span>
            <h3 className="font-display text-sm font-semibold text-brand-ink">Recently Called</h3>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
            This session
          </span>
        </div>
        <div className="px-5 py-6 text-center">
          <p className="text-sm text-brand-ink/50">
            No calls made yet in this session. Start calling to see your activity here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-brand-lilac/60 bg-gradient-to-r from-brand-magenta/[0.05] to-brand-purple/[0.05] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-brand-purple">
            <History size={14} />
          </span>
          <h3 className="font-display text-sm font-semibold text-brand-ink">Recently Called</h3>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
          Last {items.length} calls
        </span>
      </div>

      <div className="divide-y divide-brand-lilac/50">
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/40">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
              {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-ink">{c.name}</p>
              <p className="truncate text-[11px] text-brand-ink/50">
                {c.campaignName ? `${c.campaignName} · ` : ''}{c.ago}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${tones[c.tone] || tones.slate}`}>
              {c.outcome}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   CAMPAIGN CARD — Option B layout
   ================================================================ */
function CampaignCard({ campaign, onView, onStartQueue }) {
  const c = campaign;
  const progress = c.totalLeads > 0 ? Math.round((c.callsCompleted / c.totalLeads) * 100) : 0;
  const health = campaignHealth(c);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-lilac bg-white shadow-[0_4px_16px_-8px_rgba(139,47,214,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-magenta/40 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)]">
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
              <Megaphone size={18} />
            </span>
            <div className="min-w-0">
              <button
                onClick={onView}
                className="block truncate text-left font-display text-base font-bold text-brand-ink hover:text-brand-magenta"
              >
                {c.name}
              </button>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-brand-ink/50">
                <Calendar size={10} />
                {c.startDate} → {c.endDate}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${
                CAMPAIGN_STATUS_STYLES[c.status] || ''
              }`}
            >
              {c.status}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${HEALTH_TONES[health.tone]}`}>
              <CircleDot size={8} /> {health.label}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-brand-lilac/50 py-3">
          <HeroMetric label="Pending"   value={c.pendingCalls} color="amber" />
          <HeroMetric label="Connected" value={c.connected}    color="emerald" />
          <HeroMetric label="Converted" value={c.converted}    color="purple" />
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold uppercase tracking-wide text-brand-ink/50">
              {progress}% completed
            </span>
            <span className="font-mono font-bold text-brand-ink">
              {c.callsCompleted} / {c.totalLeads}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {c.pendingCalls > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
              <Flame size={10} /> {c.pendingCalls} to call
            </span>
          )}
          {c.followUpRequired > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600">
              <Calendar size={10} /> {c.followUpRequired} follow-ups
            </span>
          )}
        </div>

        {/* Option B — secondary Call button + Details side by side */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onStartQueue}
            disabled={c.pendingCalls === 0}
            className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-brand-magenta/30 bg-brand-magenta/[0.04] py-2.5 text-xs font-bold text-brand-magenta transition-all hover:border-brand-magenta hover:bg-brand-magenta/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PhoneCall size={13} />
            {c.pendingCalls > 0 ? `Call ${c.pendingCalls}` : 'No Pending'}
          </button>
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-magenta/40 hover:bg-brand-lilac/40"
          >
            <Target size={13} /> Details
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value, color = 'purple' }) {
  const colors = {
    purple:  'text-brand-purple',
    emerald: 'text-emerald-600',
    amber:   'text-amber-600',
    rose:    'text-brand-magenta',
  };
  return (
    <div className="text-center">
      <p className={`font-display text-2xl font-bold leading-tight tabular-nums ${colors[color]}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-ink/50">
        {label}
      </p>
    </div>
  );
}

/* ================================================================
   Follow-up badge helper — used in cards/rows/drawers
   ================================================================ */
function FollowUpBadge({ date, todayISO }) {
  if (!date) return null;
  const isToday = date === todayISO;
  const isOverdue = date < todayISO;

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600">
        <AlertTriangle size={9} /> Overdue · {formatDateLabel(date)}
      </span>
    );
  }
  if (isToday) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
        <Clock size={9} /> Follow-up today
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600">
      <Calendar size={9} /> {formatDateLabel(date)}
    </span>
  );
}

/* ================================================================
   CAMPAIGN LEAD ROW
   ================================================================ */
function CampaignLeadRow({ lead, todayISO, onCall, onView }) {
  const isPending = lead.status === 'pending';

  return (
    <div className="group relative flex flex-wrap items-center gap-3 rounded-xl border-2 border-brand-lilac/70 bg-white px-3 py-3 transition-all hover:border-brand-magenta/40 hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white shadow-sm">
        {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta"
          >
            {lead.name}
          </button>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[lead.priority]}`}>
            {lead.priority}
          </span>
          <FollowUpBadge date={lead.followUpDate} todayISO={todayISO} />
        </div>
        <p className="truncate text-xs text-brand-ink/50">
          {lead.mobile} · {lead.campaignName}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {isPending ? (
          <button
            onClick={onCall}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 px-3 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
            title="Call now"
          >
            <Phone size={12} /> Call
          </button>
        ) : (
          <button
            onClick={onCall}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[11px] font-semibold text-emerald-600 transition-all hover:bg-emerald-100"
            title="Call again"
          >
            <Phone size={12} /> Recall
          </button>
        )}

        <button
          onClick={onView}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta sm:flex"
          title="View details"
        >
          <User size={13} />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   CAMPAIGN LEAD CARD
   ================================================================ */
function CampaignLeadCard({ lead, todayISO, onCall, onView }) {
  const isPending = lead.status === 'pending';
  const statusStyle =
    lead.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
    lead.status === 'followup'  ? 'bg-amber-100 text-amber-700' :
                                   'bg-blue-100 text-blue-600';

  return (
    <div className="group relative flex flex-col rounded-2xl border-2 border-brand-lilac/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-magenta/50 hover:shadow-[0_20px_45px_-15px_rgba(227,28,121,0.25)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-2xl">
        <span className="block h-full w-full origin-left scale-x-0 bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />
      </span>

      <div className="relative flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white shadow-sm">
            {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </span>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${statusStyle}`}>
            {lead.status}
          </span>
        </div>

        <button
          onClick={onView}
          className="mt-3 truncate text-left font-display text-sm font-bold text-brand-ink hover:text-brand-magenta"
        >
          {lead.name}
        </button>
        <p className="truncate text-[11px] text-brand-ink/50">{lead.mobile}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[lead.priority]}`}>
            {lead.priority} Priority
          </span>
          <span className="truncate rounded-full bg-brand-mist px-2 py-0.5 text-[9px] font-semibold text-brand-ink/60">
            {lead.campaignName}
          </span>
          <FollowUpBadge date={lead.followUpDate} todayISO={todayISO} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-2.5 text-[10px]">
          <div>
            <p className="font-semibold uppercase tracking-wide text-brand-ink/40">Attempts</p>
            <p className="font-display text-sm font-bold text-brand-ink">{lead.attempts}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-brand-ink/40">Last Contact</p>
            <p className="truncate text-xs font-medium text-brand-ink">
              {lead.lastContact && lead.lastContact !== '—' ? 'Yesterday' : 'Never'}
            </p>
          </div>
        </div>

        <button
          onClick={onCall}
          className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white shadow-card hover:brightness-110 ${
            isPending
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-r from-brand-magenta to-brand-purple'
          }`}
        >
          <Phone size={14} /> {isPending ? 'Call Now' : 'Call Again'}
        </button>

        <button
          onClick={onView}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
        >
          <User size={12} /> Details
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   CAMPAIGN DRAWER
   ================================================================ */
function CampaignDrawer({ campaign, leads, todayISO, onClose, onStartQueue, onCallLead, onViewLead }) {
  const c = campaign;
  const progress = c.totalLeads > 0 ? Math.round((c.callsCompleted / c.totalLeads) * 100) : 0;
  const pendingLeads = leads.filter((l) => l.status === 'pending');
  const recentClosed = leads
    .filter((l) => l.status === 'completed' || l.status === 'followup')
    .slice(0, 5);
  const health = campaignHealth(c);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
              Campaign
            </p>
            <h3 className="font-display text-lg font-semibold text-brand-ink">{c.name}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
              <Megaphone size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{c.name}</p>
              <p className="text-xs text-brand-ink/50">
                {c.startDate} → {c.endDate}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${CAMPAIGN_STATUS_STYLES[c.status] || ''}`}>
                {c.status}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${HEALTH_TONES[health.tone]}`}>
                <CircleDot size={8} /> {health.label}
              </span>
            </div>
          </div>

          {c.description && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3 text-sm text-brand-ink/70">
              {c.description}
            </div>
          )}

          <div className="card !p-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-ink/70">Overall Progress</span>
              <span className="font-mono font-bold text-brand-ink">
                {c.callsCompleted} / {c.totalLeads} · {progress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="card !p-4">
            <h4 className="mb-3 font-display text-sm font-semibold text-brand-ink">Campaign Metrics</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <MetricRow label="Total Leads"        value={c.totalLeads}       icon={Users}         tone="purple" />
              <MetricRow label="Pending Calls"      value={c.pendingCalls}     icon={PhoneCall}     tone="amber" />
              <MetricRow label="Calls Completed"    value={c.callsCompleted}   icon={CheckCircle2}  tone="emerald" />
              <MetricRow label="Connected"          value={c.connected}        icon={PhoneIncoming} tone="emerald" />
              <MetricRow label="No Answer"          value={c.noAnswer}         icon={PhoneMissed}   tone="slate" />
              <MetricRow label="Interested"         value={c.interested}       icon={Flame}         tone="rose" />
              <MetricRow label="Not Interested"     value={c.notInterested}    icon={Ban}           tone="slate" />
              <MetricRow label="Follow-Up Required" value={c.followUpRequired} icon={Calendar}      tone="amber" />
              <MetricRow label="Converted"          value={c.converted}        icon={Award}         tone="emerald" />
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                Pending Leads ({pendingLeads.length})
              </h4>
              {pendingLeads.length > 0 && (
                <button
                  onClick={onStartQueue}
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
                >
                  <PhoneCall size={11} /> Call All
                </button>
              )}
            </div>

            {pendingLeads.length === 0 ? (
              <p className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3 text-center text-xs text-brand-ink/50">
                No pending leads left in this campaign 🎉
              </p>
            ) : (
              <div className="space-y-2.5">
                {pendingLeads.map((l) => (
                  <CampaignLeadDetailCard
                    key={l.id}
                    lead={l}
                    todayISO={todayISO}
                    onView={() => onViewLead(l)}
                    onCall={() => onCallLead(l)}
                  />
                ))}
              </div>
            )}
          </div>

          {recentClosed.length > 0 && (
            <div>
              <h4 className="mb-3 font-display text-sm font-semibold text-brand-ink">
                Recent Activity
              </h4>
              <div className="space-y-2">
                {recentClosed.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onViewLead(l)}
                    className="flex w-full items-center gap-3 rounded-xl border border-brand-lilac/70 bg-white p-3 text-left transition-all hover:border-brand-magenta/40 hover:shadow-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                      {l.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">{l.name}</p>
                      <p className="truncate text-[11px] text-brand-ink/50">
                        {l.mobile} · {l.outcome}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {l.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CAMPAIGN LEAD DETAIL CARD (drawer)
   ================================================================ */
function CampaignLeadDetailCard({ lead, todayISO, onView, onCall }) {
  const l = lead;
  const leadRef = LEADS.find((x) => x.mobile === l.mobile);
  const leadId = leadRef?.id ? `#LG-${String(leadRef.id).padStart(4, '0')}` : '—';

  return (
    <div className="group relative flex flex-col gap-2 rounded-xl border border-brand-lilac/70 bg-white p-3 transition-all hover:border-brand-magenta/40 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white shadow-sm">
          {l.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onView}
              className="truncate text-sm font-semibold text-brand-ink hover:text-brand-magenta"
            >
              {l.name}
            </button>
            <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[l.priority] || ''}`}>
              {l.priority}
            </span>
            <FollowUpBadge date={l.followUpDate} todayISO={todayISO} />
          </div>
          <p className="truncate font-mono text-[10px] font-semibold text-brand-purple">
            {leadId}
          </p>
        </div>
        <button
          onClick={onCall}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 px-3 text-[11px] font-semibold text-white shadow-card transition-transform hover:scale-105"
        >
          <Phone size={12} /> Call
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
        <DetailChip icon={Phone}     label={l.mobile} />
        {l.email && <DetailChip icon={Tag} label={l.email} truncate />}
        <DetailChip icon={Megaphone} label={l.campaignName} truncate />
        <DetailChip icon={Tag}       label={l.leadSource} />
      </div>

      <div className="flex items-center justify-between border-t border-brand-lilac/50 pt-2">
        <div className="flex items-center gap-3 text-[10px] text-brand-ink/60">
          <span>
            Attempts: <span className="font-bold text-brand-ink">{l.attempts}</span>
          </span>
          {l.lastContact && l.lastContact !== '—' && (
            <>
              <span className="text-brand-ink/20">•</span>
              <span>Last: {l.lastContact}</span>
            </>
          )}
        </div>
        <button
          onClick={onView}
          className="text-[10px] font-semibold text-brand-magenta hover:underline"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

function DetailChip({ icon: Icon, label, truncate }) {
  return (
    <span className="inline-flex items-center gap-1 truncate text-brand-ink/60">
      <Icon size={10} className="shrink-0 text-brand-ink/40" />
      <span className={truncate ? 'truncate' : ''}>{label}</span>
    </span>
  );
}

/* ================================================================
   LEAD DETAIL DRAWER
   ================================================================ */
function LeadDetailDrawer({ lead, campaign, todayISO, onClose, onCall, onNote, onNotInterested }) {
  const l = lead;
  const c = campaign;
  const leadRef = LEADS.find((x) => x.mobile === l.mobile);

  const leadId      = leadRef?.id ? `#LG-${String(leadRef.id).padStart(4, '0')}` : '—';
  const email       = leadRef?.email || '—';
  const source      = leadRef?.leadSource || l.leadSource || '—';
  const category    = leadRef?.category || '—';
  const assigned    = l.assignedDate || leadRef?.assignedDate || '—';
  const lastOutcome = leadRef?.lastOutcome || l.outcome || '—';

  const isPending = l.status === 'pending';
  const isClosed  = l.status === 'completed' || l.status === 'followup';

  const statusStyle =
    l.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
    l.status === 'followup'  ? 'bg-amber-100 text-amber-700' :
                               'bg-blue-100 text-blue-600';

  const timeline = [
    { at: `Assigned ${assigned !== '—' ? formatDateLabel(assigned) : 'today'}`,
      label: 'Lead assigned to you', tone: 'purple' },
    { at: l.lastContact && l.lastContact !== '—' ? l.lastContact : 'Not yet called',
      label: `Last outcome: ${lastOutcome}`, tone: 'emerald' },
    ...(l.followUpDate
      ? [{
          at: formatDateLabel(l.followUpDate),
          label: l.followUpDate < todayISO
            ? 'Follow-up overdue'
            : l.followUpDate === todayISO
              ? 'Follow-up due today'
              : 'Follow-up scheduled',
          tone: l.followUpDate < todayISO ? 'rose' : 'amber',
        }]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-[55] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
              {leadId} · Campaign Lead
            </p>
            <h3 className="font-display text-lg font-semibold text-brand-ink">Customer Details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-sm font-bold text-white">
              {l.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-ink">{l.name}</p>
              <p className="text-sm text-brand-ink/50">{l.mobile}</p>
              {email !== '—' && (
                <p className="flex items-center gap-1 text-xs text-brand-ink/50">
                  <Tag size={11} /> {email}
                </p>
              )}
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle}`}>
              {l.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${PRIORITY_STYLES[l.priority] || ''}`}>
              <Flame size={11} /> {l.priority} Priority
            </span>
            <FollowUpBadge date={l.followUpDate} todayISO={todayISO} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Campaign Details</h4>
            <Row icon={Megaphone}    label="Campaign"        value={c?.name || l.campaignName || '—'} />
            <Row icon={Calendar}     label="Campaign Range"  value={c ? `${c.startDate} → ${c.endDate}` : '—'} />
            <Row icon={ListFilter}   label="Campaign Status" value={c?.status || '—'} />
            <Row icon={PhoneCall}    label="Attempts"        value={l.attempts} />
            <Row icon={Clock}        label="Last Contact"    value={l.lastContact || '—'} />
            <Row icon={CheckCircle2} label="Outcome"         value={l.outcome || '—'} />
            <Row icon={Calendar}     label="Follow-up Date"  value={l.followUpDate ? formatDateLabel(l.followUpDate) : '—'} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Customer Information</h4>
            <Row icon={Tag}          label="Lead ID"           value={leadId} />
            <Row icon={Megaphone}    label="Lead Source"       value={source} />
            <Row icon={Briefcase}    label="Category"          value={category} />
            <Row icon={Calendar}     label="Assigned Date"     value={assigned !== '—' ? formatDateLabel(assigned) : '—'} />
          </div>

          <div className="card !p-4">
            <h4 className="mb-3 font-display text-sm font-semibold text-brand-ink">Call Timeline</h4>
            <div className="relative space-y-3">
              <span className="pointer-events-none absolute left-[7px] top-3 bottom-3 w-px bg-brand-lilac" />
              {timeline.map((t, i) => (
                <div key={i} className="relative flex items-start gap-3">
                  <span className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white ${
                    t.tone === 'emerald' ? 'bg-emerald-500' :
                    t.tone === 'amber'   ? 'bg-amber-500' :
                    t.tone === 'rose'    ? 'bg-rose-500' :
                    t.tone === 'purple'  ? 'bg-brand-purple' :
                                            'bg-slate-400'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-ink">{t.label}</p>
                    <p className="text-[10px] text-brand-ink/40">{t.at}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {l.notes && (
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                Notes
              </p>
              <p className="whitespace-pre-line text-sm text-brand-ink/80">{l.notes}</p>
            </div>
          )}

          {isPending && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onCall}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
                >
                  <Phone size={16} /> Call Now
                </button>
                <button
                  onClick={onNote}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
                >
                  <StickyNote size={16} /> Add Note
                </button>
              </div>

              <button
                onClick={onNotInterested}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-100"
              >
                <Ban size={12} /> Mark as Not Interested
              </button>
            </>
          )}

          {isClosed && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onCall}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-100"
              >
                <Phone size={16} /> Call Again
              </button>
              <button
                onClick={onNote}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <StickyNote size={16} /> Add Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   METRIC ROW
   ================================================================ */
function MetricRow({ label, value, icon: Icon, tone = 'purple' }) {
  const tones = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-rose-500',
    slate:   'bg-slate-50 text-slate-600',
  };
  return (
    <div className="flex items-center justify-between rounded-lg border border-brand-lilac/60 bg-white px-3 py-2">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/60">
        <span className={`flex h-5 w-5 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon size={11} />
        </span>
        {label}
      </span>
      <span className="font-display text-base font-bold text-brand-ink">{value}</span>
    </div>
  );
}

/* ================================================================
   INFO ROW
   ================================================================ */
function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/60 pb-2">
      <span className="flex shrink-0 items-center gap-1.5 text-brand-ink/50">
        {Icon && <Icon size={12} />}
        {label}
      </span>
      <span className="truncate font-medium capitalize text-brand-ink">{value}</span>
    </div>
  );
}

/* ================================================================
   CALL MODAL
   ================================================================ */
function CallModal({ target, inQueue, queueIndex, queueSize, nextLead, onSkip, onMinimize, onClose, onEnd }) {
  const [callState, setCallState] = useState('ringing');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [recording, setRecording] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (callState !== 'ringing') return;
    const t = setTimeout(() => setCallState('connected'), 1500);
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
    onEnd({ notes, duration: formatTime(seconds) });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        <div
          className={`relative px-6 pb-6 pt-6 text-white ${
            callState === 'connected'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
            <span className="truncate text-white/80">{target.campaignName}</span>
            {inQueue && (
              <span className="rounded-full bg-white/25 px-2 py-0.5">
                {String(queueIndex + 1).padStart(2, '0')} / {String(queueSize).padStart(2, '0')}
              </span>
            )}
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-1">
            <button
              onClick={onMinimize}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/20"
              title="Minimize"
            >
              <ChevronDown size={18} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/20"
              title="Cancel call"
            >
              <X size={18} />
            </button>
          </div>

          {recording && callState === 'connected' && (
            <div className="absolute left-4 top-14 flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2.5 py-1 text-[10px] font-bold">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              REC
            </div>
          )}

          <div className="relative mx-auto mb-3 mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 text-2xl font-bold">
              {target.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          </div>

          <p className="text-center text-lg font-semibold">{target.name}</p>
          <p className="text-center text-xs text-white/70">{target.mobile}</p>

          <div className="mt-3 flex flex-col items-center gap-1">
            <p className="font-display text-3xl font-bold tabular-nums">
              {callState === 'ringing' ? '--:--' : formatTime(seconds)}
            </p>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
              <span className={`h-1.5 w-1.5 rounded-full ${callState === 'ringing' ? 'bg-amber-300 animate-pulse' : 'bg-white'}`} />
              {callState === 'ringing' ? 'Ringing' : 'Connected'}
            </p>
          </div>
        </div>

        <div className="p-6">
          {callState === 'connected' && (
            <div className="mb-5 grid grid-cols-4 gap-2">
              <CallControl icon={muted ? MicOff : Mic} label={muted ? 'Unmute' : 'Mute'} active={muted} onClick={() => setMuted((m) => !m)} />
              <CallControl icon={onHold ? PlayCircle : PauseCircle} label={onHold ? 'Resume' : 'Hold'} active={onHold} onClick={() => setOnHold((h) => !h)} />
              <CallControl icon={speaker ? Volume2 : VolumeX} label="Speaker" active={speaker} onClick={() => setSpeaker((s) => !s)} />
              <CallControl icon={PhoneForwarded} label="Transfer" active={false} onClick={() => {}} />
            </div>
          )}

          {callState === 'connected' && (
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Call Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Notes about this call..."
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
            </div>
          )}

          {callState === 'ringing' ? (
            <div className="grid grid-cols-2 gap-2">
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
                <PhoneMissed size={16} /> Missed
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={endCall}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                <PhoneOff size={16} /> End Call · {formatTime(seconds)}
              </button>
              {inQueue && (
                <button
                  onClick={onSkip}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
                >
                  <ChevronRight size={14} /> Skip to Next Lead
                </button>
              )}
            </div>
          )}

          {inQueue && nextLead && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3 text-xs">
              <span className="font-semibold uppercase tracking-wider text-brand-ink/40">
                Next:
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[9px] font-bold text-white">
                {nextLead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
              <span className="truncate font-semibold text-brand-ink">{nextLead.name}</span>
              <ChevronRight size={14} className="ml-auto text-brand-ink/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CallControl({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
        active
          ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
          : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

/* ================================================================
   MINI CALL DOCK
   ================================================================ */
function MiniCallDock({ target, queueIndex, queueSize, onExpand, onEnd }) {
  return (
    <div className="fixed bottom-6 right-6 z-[55] w-72 overflow-hidden rounded-2xl border border-brand-lilac bg-white shadow-panel">
      <div className="flex items-center gap-3 bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-3 text-white">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/25 text-xs font-bold">
          <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
          {target.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">{target.name}</p>
          <p className="flex items-center gap-1.5 text-[10px] text-white/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Active Call
          </p>
        </div>
        {queueSize > 0 && (
          <span className="shrink-0 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
            {queueIndex + 1}/{queueSize}
          </span>
        )}
      </div>

      <div className="flex gap-2 p-3">
        <button
          onClick={onExpand}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
        >
          <ChevronUp size={12} /> Open Call
        </button>
        <button
          onClick={onEnd}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
        >
          <PhoneOff size={12} /> End
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   DISPOSITION MODAL
   ================================================================ */
function DispositionModal({ lead, initialNotes = '', onClose, onSave }) {
  const [disposition, setDisposition] = useState('Connected');
  const [notes, setNotes] = useState(initialNotes);
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <ListFilter size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Call Disposition</h3>
              <p className="text-xs text-brand-ink/50">{lead.name} · {lead.campaignName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Disposition</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DISPOSITIONS.map((d) => (
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
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <StickyNote size={12} /> Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add context..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-ink/70">
            <input
              type="checkbox"
              checked={scheduleFollowUp}
              onChange={(e) => setScheduleFollowUp(e.target.checked)}
              className="h-4 w-4 rounded border-brand-lilac accent-brand-magenta"
            />
            Schedule a follow-up (tomorrow)
          </label>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(lead, disposition, notes, scheduleFollowUp)}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Save & Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   NOTE MODAL
   ================================================================ */
function NoteModal({ lead, onClose, onSave }) {
  const [text, setText] = useState('');
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
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
          rows={4}
          placeholder="Add context for this lead..."
          className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />

        {lead.notes && (
          <div className="mt-4 max-h-40 overflow-y-auto">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              Previous notes
            </p>
            <p className="whitespace-pre-line rounded-lg border border-brand-lilac/60 bg-brand-mist/40 p-2.5 text-xs text-brand-ink/70">
              {lead.notes}
            </p>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
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
   EMPTY STATE
   ================================================================ */
function EmptyState({ tab, onSwitchTab }) {
  if (tab === 'pending') {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
          <CheckCircle2 size={28} />
        </span>
        <p className="font-display text-base font-semibold text-brand-ink">All caught up! 🎉</p>
        <p className="max-w-xs text-sm text-brand-ink/50">
          There are no pending calls in this campaign.
        </p>
        <button
          onClick={() => onSwitchTab?.('history')}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
        >
          <History size={12} /> View Campaign History
        </button>
      </div>
    );
  }
  if (tab === 'history') {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-violet-50 text-brand-purple ring-1 ring-violet-200">
          <Sparkles size={28} />
        </span>
        <p className="font-display text-base font-semibold text-brand-ink">No history yet</p>
        <p className="max-w-xs text-sm text-brand-ink/50">
          Calls you complete will appear here.
        </p>
      </div>
    );
  }
  const messages = {
    campaigns: 'No campaigns assigned to you yet',
    leads:     'No campaign leads yet',
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
        Campaigns are assigned by your administrator. Records appear here as you work through them.
      </p>
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

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        {Icon && <Icon size={14} className="text-brand-magenta" />}
        <span className="text-brand-ink/60">{label}:</span>
        <span className="font-semibold capitalize text-brand-magenta">{current?.label ?? value}</span>
        <ChevronDown size={14} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-48 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {normalized.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
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