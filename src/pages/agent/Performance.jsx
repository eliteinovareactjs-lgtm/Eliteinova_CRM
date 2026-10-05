// src/pages/agent/Performance.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Target, PhoneCall, PhoneIncoming, PhoneMissed,
  Users, UserCheck, UserPlus, CheckCircle2, Clock, Flame, Award,
  Calendar, CalendarCheck, BarChart3, Activity, Zap,
  Sparkles, AlertTriangle, Trophy, Timer, Percent,
  PhoneOutgoing, ChevronDown, ChevronRight, Repeat, Info, Star,
  ArrowRight, ArrowUpRight, ArrowDownRight, Filter,
  Eye, Crown, Medal, Rocket, Brain,
  Lightbulb, Layers, ArrowRightLeft, Gauge, Hash, MapPin,
  TrendingUp as TrendingUpIcon, ArrowDown, ArrowUp, Download,
  Sun, Sunrise, Sunset, Coffee, ChevronUp, BookOpen, UserX,
  Radio, Fingerprint, CalendarClock, CircleDot, ChevronLeft, X,
  FileAudio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ================================================================
   CONSTANTS
   ================================================================ */
const RANGE_OPTIONS = [
  { value: 'today',  label: 'Today' },
  { value: 'week',   label: 'Last 7 days' },
  { value: 'month',  label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
  { value: 'all',    label: 'All time' },
];

const TABS = [
  { key: 'overview',   label: 'Overview',              icon: BarChart3 },
  { key: 'leads',      label: 'Lead Performance',      icon: Users },
  { key: 'calls',      label: 'Call Performance',      icon: PhoneCall },
  { key: 'followups',  label: 'Follow-Up Performance', icon: CalendarCheck },
  { key: 'conversion', label: 'Conversion Performance', icon: Award },
  { key: 'daily',      label: 'Daily Activity',        icon: Activity },
];

/* ================================================================
   DEMO DATA — scoped to the current agent only
   ================================================================ */
const buildDemoPerformance = (agentName) => ({
  agentName,

  targets: {
    calls:        300,
    connected:    200,
    followUps:    100,
    conversions:   20,
    revenue:   '₹1.5 Cr',
  },

  goals: {
    calls:       { current: 264, target: 300 },
    followUps:   { current:  96, target: 100 },
    conversions: { current:  18, target:  20 },
  },

  streak: { days: 4, label: 'Call target streak' },
  productiveHours: { today: 6.5, week: 38 },

  leads: {
    assigned:   148,
    contacted:  112,
    untouched:   36,
    newToday:     9,
    byStatus: [
      { label: 'New',         value: 36, tone: 'blue' },
      { label: 'Contacted',   value: 42, tone: 'violet' },
      { label: 'Qualified',   value: 28, tone: 'amber' },
      { label: 'Proposal',    value: 18, tone: 'amber' },
      { label: 'Negotiation', value: 12, tone: 'amber' },
      { label: 'Converted',   value: 18, tone: 'emerald' },
      { label: 'Lost',        value:  4, tone: 'rose' },
    ],
  },

  funnel: [
    { stage: 'Assigned',    value: 148 },
    { stage: 'Contacted',   value: 112 },
    { stage: 'Connected',   value:  86 },
    { stage: 'Interested',  value:  42 },
    { stage: 'Follow-Up',   value:  28 },
    { stage: 'Converted',   value:  18 },
  ],

  calls: {
    made:          264,
    connected:     186,
    missed:         32,
    incoming:       46,
    outgoing:      218,
    avgDuration:   '4:12',
    totalTalkTime: '18h 36m',
    connectionRate: 70,
    missedRate:     12,
    callsPerHour:   8.4,
    connectedPerHour: 5.9,
    callsPerConversion: 14.7,
    bestHour:      '10 AM – 11 AM',
    firstCallRate: 64,
    repeatRate:    22,
    dailyBreakdown: [22, 34, 28, 41, 35, 52, 52],
    hourlyRate: [
      { hour: '08', rate: 42 },
      { hour: '09', rate: 58 },
      { hour: '10', rate: 78 },
      { hour: '11', rate: 74 },
      { hour: '12', rate: 55 },
      { hour: '13', rate: 38 },
      { hour: '14', rate: 62 },
      { hour: '15', rate: 66 },
      { hour: '16', rate: 58 },
      { hour: '17', rate: 44 },
    ],
  },

  callOutcomes: [
    { label: 'Interested',         value: 42, tone: 'rose' },
    { label: 'Follow-Up Required', value: 28, tone: 'amber' },
    { label: 'Not Interested',     value: 18, tone: 'slate' },
    { label: 'Call Back Later',    value: 16, tone: 'amber' },
    { label: 'No Response',        value: 36, tone: 'slate' },
    { label: 'Wrong Number',       value:  7, tone: 'slate' },
    { label: 'Converted',          value: 18, tone: 'emerald' },
  ],

  followUps: {
    completed: 96,
    pending:   28,
    overdue:   12,
    today:      8,
    upcoming:  16,
    completedToday: 5,
    rescheduled:    4,
    completionRate: 77,
    onTimeRate:     89,
    avgPerLead:     1.4,
    avgDelayHours:  3.2,
    conversions:    14,
    byOutcome: [
      { label: 'Completed', value: 96, tone: 'emerald' },
      { label: 'Pending',   value: 28, tone: 'amber' },
      { label: 'Overdue',   value: 12, tone: 'rose' },
    ],
  },

  conversion: {
    interested: 42,
    converted:  18,
    conversionRate: 12.2,
    interestedToConverted: 42.8,
    avgCycleDays:  9,
    topCampaign:  'Q3 Outreach',
    revenue:      '₹1.24 Cr',
    revenueTarget:'₹1.50 Cr',
    revenueAchieved: 82.7,
    avgRevenue:   '₹6.9 L',
    byMonth: [
      { label: 'Jul', value: 3 },
      { label: 'Aug', value: 5 },
      { label: 'Sep', value: 4 },
      { label: 'Oct', value: 6 },
    ],
    bySource: [
      { label: 'Q3 Outreach', value: 8, leads: 48, calls: 92, connected: 64, interested: 18, rate: 16.7 },
      { label: 'Website',     value: 5, leads: 36, calls: 71, connected: 49, interested: 12, rate: 13.9 },
      { label: 'Facebook',    value: 3, leads: 28, calls: 54, connected: 38, interested:  7, rate: 10.7 },
      { label: 'Referral',    value: 2, leads: 21, calls: 39, connected: 27, interested:  5, rate:  9.5 },
    ],
  },

  leadAging: {
    sameDay:  82,
    oneTwoDay: 12,
    threeSeven: 5,
    sevenPlus: 1,
    firstContactAvg: '18 minutes',
    slaAchievement: 92,
  },

  daily: [
    { day: 'Mon', calls: 22, followUps: 12, conversions: 1 },
    { day: 'Tue', calls: 34, followUps: 15, conversions: 2 },
    { day: 'Wed', calls: 28, followUps: 14, conversions: 0 },
    { day: 'Thu', calls: 41, followUps: 18, conversions: 3 },
    { day: 'Fri', calls: 35, followUps: 16, conversions: 1 },
    { day: 'Sat', calls: 52, followUps: 11, conversions: 2 },
    { day: 'Sun', calls: 52, followUps: 10, conversions: 1 },
  ],

  previous: {
    callsMade: 221,
    connected: 158,
    converted: 14,
    leadsAssigned: 132,
    followUpsCompleted: 84,
    connectionRate: 68,
    conversionRate: 11.4,
    avgCallDuration: '3:54',
    revenue: '₹0.98 Cr',
  },

  personalBests: {
    highestCallsDay:     52,
    highestCallsDayLabel:'Saturday',
    highestConversions:   4,
    highestConversionsLabel: 'Best day',
    bestConnectionRate:  78,
    longestStreak:        7,
    bestFollowUpCompletion: 100,
  },

  milestones: [
    { label: '100 Leads Contacted',  achieved: true,  current: 112, target: 100 },
    { label: '250 Calls Completed',  achieved: true,  current: 264, target: 250 },
    { label: '15 Conversions',       achieved: true,  current: 18,  target: 15  },
    { label: '20 Conversions',       achieved: false, current: 18,  target: 20  },
    { label: '₹1.5 Cr Revenue',      achieved: false, current: 124, target: 150 },
  ],

  personalRecords: {
    bestDay: { day: 'Saturday', calls: 52, followUps: 11, conversions: 2 },
    bestHour: '10 AM',
    longestStreak: 7,
  },
});

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function Performance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [range, setRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showExport, setShowExport] = useState(false);

  const perf = useMemo(
    () => buildDemoPerformance(user?.name || 'Agent'),
    [user?.name]
  );

  /* -------- TREND HELPERS -------- */
  const trend = (current, previous) => {
    if (!previous) return { pct: 0, dir: 'up' };
    const pct = ((current - previous) / previous) * 100;
    return { pct: Math.round(Math.abs(pct) * 10) / 10, dir: pct >= 0 ? 'up' : 'down' };
  };

  const callTrend     = trend(perf.calls.made,        perf.previous.callsMade);
  const connectTrend  = trend(perf.calls.connected,   perf.previous.connected);
  const convertTrend  = trend(perf.conversion.converted, perf.previous.converted);
  const leadTrend     = trend(perf.leads.assigned,    perf.previous.leadsAssigned);
  const followUpTrend = trend(perf.followUps.completed, perf.previous.followUpsCompleted);

  /* -------- COMPUTED: funnel drop-off -------- */
  const funnelDropOffs = useMemo(() => {
    const list = [];
    for (let i = 0; i < perf.funnel.length - 1; i++) {
      const from = perf.funnel[i];
      const to = perf.funnel[i + 1];
      const rate = from.value > 0 ? Math.round((to.value / from.value) * 100) : 0;
      list.push({
        from: from.stage,
        to: to.stage,
        rate,
        drop: 100 - rate,
        tone: rate >= 70 ? 'emerald' : rate >= 50 ? 'amber' : 'rose',
      });
    }
    return list;
  }, [perf.funnel]);

  const worstDropOff = useMemo(
    () => funnelDropOffs.reduce((a, b) => (a.drop > b.drop ? a : b), funnelDropOffs[0]),
    [funnelDropOffs]
  );

  /* -------- COMPUTED: action items -------- */
  const actions = [
    {
      key: 'untouched',
      count: perf.leads.untouched,
      label: 'leads have not been contacted',
      hint: 'Contact them today',
      icon: AlertTriangle,
      tone: 'rose',
      to: '/agent/leads?filter=untouched',
    },
    {
      key: 'overdue',
      count: perf.followUps.overdue,
      label: 'follow-ups are overdue',
      hint: 'Complete overdue follow-ups',
      icon: Clock,
      tone: 'amber',
      to: '/agent/follow-ups?filter=overdue',
    },
    {
      key: 'missed',
      count: perf.calls.missed,
      label: 'calls were missed',
      hint: 'Review missed calls',
      icon: PhoneMissed,
      tone: 'rose',
      to: '/agent/calls?filter=missed',
    },
    {
      key: 'interested',
      count: perf.conversion.interested - perf.conversion.converted,
      label: 'interested leads without conversion',
      hint: 'Schedule follow-ups',
      icon: Flame,
      tone: 'amber',
      to: '/agent/leads?filter=interested',
    },
  ];

  /* -------- COMPUTED: targets table -------- */
  const targetRows = [
    { key: 'calls',       label: 'Calls',        target: perf.targets.calls,       actual: perf.calls.made,             tone: 'purple' },
    { key: 'connected',   label: 'Connected',    target: perf.targets.connected,   actual: perf.calls.connected,        tone: 'emerald' },
    { key: 'followUps',   label: 'Follow-Ups',   target: perf.targets.followUps,   actual: perf.followUps.completed,    tone: 'emerald' },
    { key: 'conversions', label: 'Conversions',  target: perf.targets.conversions, actual: perf.conversion.converted,   tone: 'amber' },
  ];

  /* -------- COMPUTED: score breakdown -------- */
  const scoreBreakdown = useMemo(() => {
    const callsScore = Math.min(100, Math.round((perf.calls.made / perf.targets.calls) * 100));
    const connectScore = Math.min(100, Math.round((perf.calls.connected / perf.targets.connected) * 100));
    const followUpScore = Math.min(100, Math.round((perf.followUps.completed / perf.targets.followUps) * 100));
    const convScore = Math.min(100, Math.round((perf.conversion.converted / perf.targets.conversions) * 100));

    return {
      calls: callsScore,
      connected: connectScore,
      followUps: followUpScore,
      conversions: convScore,
      total: Math.round((callsScore * 0.2) + (connectScore * 0.25) + (followUpScore * 0.25) + (convScore * 0.3)),
    };
  }, [perf]);

  /* -------- COMPUTED: insights -------- */
  const insights = useMemo(() => {
    const list = [];

    const areas = [
      { label: 'connection rate',       rate: perf.calls.connectionRate },
      { label: 'follow-up completion',  rate: perf.followUps.completionRate },
      { label: 'conversion',            rate: Math.min(100, perf.conversion.conversionRate * 4) },
    ];
    const strongest = areas.reduce((a, b) => (a.rate > b.rate ? a : b));
    list.push({
      tone: 'emerald', icon: Trophy,
      text: `You're strongest at ${strongest.label} (${strongest.rate}%).`,
    });

    if (connectTrend.dir === 'up') {
      list.push({
        tone: 'emerald', icon: TrendingUp,
        text: `Connection rate improved by ${connectTrend.pct}% compared to last period.`,
      });
    }

    if (perf.leads.untouched > 0) {
      list.push({
        tone: 'rose', icon: AlertTriangle,
        text: `${perf.leads.untouched} untouched leads are still waiting for a first call.`,
      });
    }

    const callsRemaining = perf.targets.calls - perf.calls.made;
    if (callsRemaining > 0) {
      list.push({
        tone: 'amber', icon: Target,
        text: `${callsRemaining} more calls to reach your weekly target.`,
      });
    }

    if (worstDropOff) {
      list.push({
        tone: 'purple', icon: TrendingDown,
        text: `Biggest funnel drop-off: ${worstDropOff.from} → ${worstDropOff.to} (${worstDropOff.drop}%).`,
      });
    }

    list.push({
      tone: 'emerald', icon: Crown,
      text: `Best calling day was ${perf.personalBests.highestCallsDayLabel} with ${perf.personalBests.highestCallsDay} calls.`,
    });

    return list;
  }, [perf, connectTrend, worstDropOff]);

  /* -------- BEST DAY -------- */
  const bestDay = useMemo(() => {
    const best = [...perf.daily].reduce((a, b) => (a.calls > b.calls ? a : b));
    const bestConv = [...perf.daily].reduce((a, b) => (a.conversions > b.conversions ? a : b));
    const bestFU = [...perf.daily].reduce((a, b) => (a.followUps > b.followUps ? a : b));
    return { best, bestConv, bestFU };
  }, [perf.daily]);

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
            <h1 className="font-display text-xl font-semibold text-brand-ink">My Performance</h1>
            <p className="text-sm text-brand-ink/50">
              Your personal workload, activity, and progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowExport(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3.5 py-1.5 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:bg-brand-lilac/40 hover:text-brand-magenta"
            >
              <Download size={12} /> Export Report
            </button>
            <RangeDropdown
              value={range}
              onChange={setRange}
              customFrom={customFrom}
              customTo={customTo}
              setCustomFrom={setCustomFrom}
              setCustomTo={setCustomTo}
            />
          </div>
        </div>

        {/* ================= KPI STRIP (MOVED TO TOP) ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatedStatCard
            label="Leads Assigned"
            value={perf.leads.assigned}
            sub={`${perf.leads.contacted} contacted`}
            icon={Users}
            color="purple"
            trend={`${leadTrend.dir === 'up' ? '+' : '-'}${leadTrend.pct}%`}
            trendUp={leadTrend.dir === 'up'}
            delay={0}
            onClick={() => navigate('/agent/leads')}
          />
          <AnimatedStatCard
            label="Calls Made"
            value={perf.calls.made}
            sub={`${perf.calls.connectionRate}% connected`}
            icon={PhoneCall}
            color="purple"
            trend={`${callTrend.dir === 'up' ? '+' : '-'}${callTrend.pct}%`}
            trendUp={callTrend.dir === 'up'}
            delay={40}
            onClick={() => navigate('/agent/calls')}
          />
          <AnimatedStatCard
            label="Follow-Ups Done"
            value={perf.followUps.completed}
            sub={`${perf.followUps.completionRate}% completion`}
            icon={CalendarCheck}
            color="emerald"
            trend={`${followUpTrend.dir === 'up' ? '+' : '-'}${followUpTrend.pct}%`}
            trendUp={followUpTrend.dir === 'up'}
            delay={80}
            onClick={() => navigate('/agent/follow-ups')}
          />
          <AnimatedStatCard
            label="Interested"
            value={perf.conversion.interested}
            sub="Active interest"
            icon={Flame}
            color="rose"
            delay={120}
            onClick={() => navigate('/agent/leads?filter=interested')}
          />
          <AnimatedStatCard
            label="Converted"
            value={perf.conversion.converted}
            sub={`${perf.conversion.conversionRate}% rate`}
            icon={Award}
            color="emerald"
            trend={`${convertTrend.dir === 'up' ? '+' : '-'}${convertTrend.pct}%`}
            trendUp={convertTrend.dir === 'up'}
            delay={160}
            onClick={() => navigate('/agent/leads?filter=converted')}
          />
        </div>

        {/* ================= HERO SCORECARD ================= */}
        <ScorecardHero
          perf={perf}
          range={range}
          connectTrend={connectTrend}
          convertTrend={convertTrend}
          scoreBreakdown={scoreBreakdown}
        />

        {/* ================= PERFORMANCE ALERTS ================= */}
        <PerformanceAlerts actions={actions} onNavigate={navigate} />

        {/* ================= TARGET vs ACTUAL ================= */}
        <TargetCard rows={targetRows} />

        {/* ================= PERSONAL GOALS + STREAK ================= */}
        <GoalsAndStreakRow goals={perf.goals} streak={perf.streak} />

        {/* ================= TABS ================= */}
        <div className="card !p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
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
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= TAB CONTENT ================= */}
        {activeTab === 'overview'   && (
          <OverviewTab
            perf={perf}
            funnelDropOffs={funnelDropOffs}
            worstDropOff={worstDropOff}
            insights={insights}
            bestDay={bestDay}
            onNavigate={navigate}
          />
        )}
        {activeTab === 'leads'      && <LeadTab       perf={perf} onNavigate={navigate} />}
        {activeTab === 'calls'      && <CallTab       perf={perf} onNavigate={navigate} />}
        {activeTab === 'followups'  && <FollowUpTab   perf={perf} onNavigate={navigate} />}
        {activeTab === 'conversion' && <ConversionTab perf={perf} onNavigate={navigate} />}
        {activeTab === 'daily'      && <DailyTab      perf={perf} bestDay={bestDay} />}

        {/* ================= EXPORT MODAL ================= */}
        {showExport && (
          <ExportModal
            perf={perf}
            range={range}
            onClose={() => setShowExport(false)}
            onExported={(format) => {
              setShowExport(false);
              console.log(`Exporting as ${format}...`);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ================================================================
   RANGE DROPDOWN
   ================================================================ */
function RangeDropdown({ value, onChange, customFrom, customTo, setCustomFrom, setCustomTo }) {
  const [open, setOpen] = useState(false);
  const current = RANGE_OPTIONS.find((o) => o.value === value);
  const showCustom = value === 'custom';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3.5 py-1.5 text-[11px] font-semibold text-brand-ink hover:bg-brand-lilac/40"
      >
        <Calendar size={12} className="text-brand-magenta" />
        <span className="text-brand-ink/60">Range:</span>
        <span className="text-brand-magenta">{current?.label}</span>
        <ChevronDown size={12} className="text-brand-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {RANGE_OPTIONS.map((o) => (
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
            {showCustom && (
              <div className="mt-1 space-y-2 border-t border-brand-lilac/60 p-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full rounded-lg border border-brand-lilac bg-white px-2 py-1.5 text-[11px] outline-none focus:border-brand-magenta"
                />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full rounded-lg border border-brand-lilac bg-white px-2 py-1.5 text-[11px] outline-none focus:border-brand-magenta"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="w-full rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple py-1.5 text-[11px] font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================
   HERO SCORECARD — with visible breakdown
   ================================================================ */
function ScorecardHero({ perf, range, connectTrend, convertTrend, scoreBreakdown }) {
  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === range)?.label || 'This period';
  const score = scoreBreakdown.total;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-r from-white via-white to-brand-lilac/20 shadow-[0_8px_24px_-12px_rgba(227,28,121,0.2)]">
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-magenta/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-brand-purple/10 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-6 p-5 lg:grid-cols-3">
        {/* SCORE */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
              <Trophy size={14} />
              <span className="absolute inset-0 -z-10 animate-ping rounded-lg bg-brand-magenta/30" />
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
              Your Score · {rangeLabel}
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="font-display text-6xl font-bold leading-none tabular-nums text-brand-purple">
              {score}
            </p>
            <p className="text-sm font-bold text-brand-ink/40">/100</p>
          </div>

          <div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] font-semibold text-emerald-600">
              ↑ {connectTrend.pct}% vs previous period
            </p>
          </div>
        </div>

        {/* BREAKDOWN */}
        <div className="lg:col-span-2">
          <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">
            <Gauge size={11} /> Score Breakdown
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ScoreBreakdownItem label="Calls"       value={scoreBreakdown.calls}       tone="purple" />
            <ScoreBreakdownItem label="Connection"  value={scoreBreakdown.connected}   tone="emerald" />
            <ScoreBreakdownItem label="Follow-Ups"  value={scoreBreakdown.followUps}   tone="emerald" />
            <ScoreBreakdownItem label="Conversion"  value={scoreBreakdown.conversions} tone="amber" />
          </div>

          {/* Why did score change */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600 ring-1 ring-emerald-200">
              <ArrowUp size={9} /> +4% connection rate
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600 ring-1 ring-emerald-200">
              <ArrowUp size={9} /> +2% follow-ups
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-500 ring-1 ring-rose-200">
              <ArrowDown size={9} /> -1% conversion
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Mini Metrics */}
      <div className="relative flex flex-wrap gap-3 border-t border-brand-lilac/60 bg-white/40 p-4">
        <MiniMetric label="Talk time" value={perf.calls.totalTalkTime} icon={Timer} />
        <MiniMetric label="Avg call"  value={perf.calls.avgDuration}   icon={Clock} />
        <MiniMetric label="Revenue"   value={perf.conversion.revenue}  icon={Star} />
        <MiniMetric label="Avg deal"  value={perf.conversion.avgRevenue} icon={Target} />
      </div>
    </div>
  );
}

function ScoreBreakdownItem({ label, value, tone }) {
  const tones = {
    purple:  { bg: 'bg-violet-50', text: 'text-brand-purple', bar: 'from-brand-purple to-brand-magenta' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'from-emerald-500 to-teal-400' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   bar: 'from-amber-500 to-orange-400' },
  };
  const t = tones[tone];
  return (
    <div className={`rounded-xl ${t.bg} p-3`}>
      <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
      <p className={`font-display text-2xl font-bold tabular-nums ${t.text}`}>{value}%</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${t.bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-brand-lilac bg-white px-3 py-2.5">
      <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-brand-ink/40">
        <Icon size={9} /> {label}
      </p>
      <p className="mt-0.5 font-display text-sm font-bold text-brand-ink">{value}</p>
    </div>
  );
}

/* ================================================================
   PERFORMANCE ALERTS
   ================================================================ */
function PerformanceAlerts({ actions, onNavigate }) {
  const visible = actions.filter((a) => a.count > 0);

  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <Zap size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
            Performance Alerts
          </p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
          {visible.length} items
        </span>
      </div>

      <div className="space-y-2.5">
        {actions.map((a) => {
          const Icon = a.icon;
          const tones = {
            rose:    'bg-rose-50 text-rose-500 ring-rose-200',
            amber:   'bg-amber-50 text-amber-600 ring-amber-200',
            emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
          };
          const t = tones[a.tone];
          const isZero = a.count === 0;

          return (
            <div
              key={a.key}
              className={`flex flex-wrap items-center gap-3 rounded-xl border-2 bg-white px-3 py-2.5 transition-all ${
                isZero ? 'border-emerald-200' : 'border-rose-200/70'
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${t}`}>
                <Icon size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-ink">
                  <span className={isZero ? 'text-emerald-600' : 'text-rose-500'}>{a.count}</span>{' '}
                  {a.label}
                </p>
                <p className="text-[11px] text-brand-ink/50">→ {a.hint}</p>
              </div>
              {!isZero && (
                <button
                  onClick={() => onNavigate(a.to)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple px-3 py-1.5 text-[11px] font-bold text-white shadow-card transition-transform hover:scale-105"
                >
                  View <ArrowRight size={11} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   TARGET vs ACTUAL — with remaining
   ================================================================ */
function TargetCard({ rows }) {
  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <Target size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
            Target Achievement
          </p>
        </div>
        <span className="rounded-full bg-brand-lilac/60 px-2.5 py-0.5 text-[10px] font-bold text-brand-purple">
          This period
        </span>
      </div>

      <div className="space-y-4">
        {rows.map((r) => {
          const pct = r.target > 0 ? Math.min(150, Math.round((r.actual / r.target) * 100)) : 0;
          const visual = Math.min(100, pct);
          const remaining = Math.max(0, r.target - r.actual);
          const tones = {
            purple:  { bar: 'from-brand-purple to-brand-magenta', text: 'text-brand-purple' },
            emerald: { bar: 'from-emerald-500 to-teal-400',       text: 'text-emerald-600' },
            amber:   { bar: 'from-amber-500 to-orange-400',       text: 'text-amber-600' },
          };
          const t = tones[r.tone];
          const isOver = pct >= 100;
          const isWarn = pct < 75;

          return (
            <div key={r.key}>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-brand-ink/70">{r.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${t.text}`}>
                    {r.actual} <span className="text-brand-ink/30">/ {r.target}</span>
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isOver ? 'bg-emerald-100 text-emerald-600' :
                    isWarn ? 'bg-rose-100 text-rose-500' :
                             'bg-amber-100 text-amber-700'
                  }`}>
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-brand-lilac/50">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${t.bar} transition-all duration-700`}
                  style={{ width: `${visual}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-brand-ink/50">
                {remaining > 0
                  ? <span className="text-brand-magenta">{remaining} more needed to reach target</span>
                  : <span className="text-emerald-600">Target achieved ✓</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   PERSONAL GOALS + STREAK
   ================================================================ */
function GoalsAndStreakRow({ goals, streak }) {
  const goalRows = [
    { key: 'calls',       label: 'Calls',        ...goals.calls,       tone: 'purple' },
    { key: 'followUps',   label: 'Follow-Ups',   ...goals.followUps,   tone: 'emerald' },
    { key: 'conversions', label: 'Conversions',  ...goals.conversions, tone: 'amber' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="card !p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
              <Target size={13} />
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
              My Goals
            </p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
            Weekly targets
          </span>
        </div>

        <div className="space-y-4">
          {goalRows.map((g) => {
            const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
            const visual = Math.min(100, pct);
            const tones = {
              purple:  'from-brand-purple to-brand-magenta',
              emerald: 'from-emerald-500 to-teal-400',
              amber:   'from-amber-500 to-orange-400',
            };
            const remaining = Math.max(0, g.target - g.current);

            return (
              <div key={g.key}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-ink/70">{g.label}</span>
                  <span className="font-mono font-bold text-brand-ink">
                    {g.current} <span className="text-brand-ink/30">/ {g.target}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand-lilac/50">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${tones[g.tone]} transition-all duration-700`}
                    style={{ width: `${visual}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-brand-ink/50">
                  {pct}% ·{' '}
                  {remaining > 0 ? (
                    <span className="font-semibold text-brand-magenta">
                      {remaining} more to reach your target
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-600">Target achieved ✓</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-amber-50 to-white p-5">
        <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-card">
              <Flame size={13} />
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
              Current Streak
            </p>
          </div>

          <p className="font-display text-5xl font-bold leading-none tabular-nums text-amber-600">
            {streak.days}
          </p>
          <p className="mt-1 text-xs font-semibold text-brand-ink/60">
            consecutive days
          </p>
          <p className="mt-3 rounded-xl border border-amber-200 bg-white p-2.5 text-[11px] text-amber-800">
            🔥 {streak.label} — you've completed your daily target for{' '}
            <b>{streak.days}</b> days in a row.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB — OVERVIEW
   ================================================================ */
function OverviewTab({
  perf,
  funnelDropOffs,
  worstDropOff,
  insights,
  bestDay,
  onNavigate,
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FunnelCard funnel={perf.funnel} />
        <DropOffCard dropOffs={funnelDropOffs} worst={worstDropOff} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WeeklyChartCard
          title="Calls per day"
          subtitle="Last 7 days"
          values={perf.calls.dailyBreakdown}
          tone="purple"
          total={perf.calls.made}
        />
        <WeeklyChartCard
          title="Follow-ups completed"
          subtitle="Last 7 days"
          values={perf.daily.map((d) => d.followUps)}
          tone="emerald"
          total={perf.followUps.completed}
        />
        <WeeklyChartCard
          title="Conversions"
          subtitle="Last 7 days"
          values={perf.daily.map((d) => d.conversions * 4)}
          tone="amber"
          total={perf.conversion.converted}
          format={(v) => Math.round(v / 4)}
        />
      </div>

      <PreviousComparisonCard perf={perf} />

      <PersonalBestsCard bests={perf.personalBests} />

      <InsightsCard insights={insights} />

      <MilestonesCard milestones={perf.milestones} />

      <BestDayCard bestDay={bestDay} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <QuickNumber
          label="Untouched leads"
          value={perf.leads.untouched}
          icon={AlertTriangle}
          tone="rose"
          onClick={() => onNavigate('/agent/leads?filter=untouched')}
        />
        <QuickNumber
          label="Missed calls"
          value={perf.calls.missed}
          icon={PhoneMissed}
          tone="rose"
          onClick={() => onNavigate('/agent/calls?filter=missed')}
        />
        <QuickNumber
          label="Overdue follow-ups"
          value={perf.followUps.overdue}
          icon={Clock}
          tone="rose"
          onClick={() => onNavigate('/agent/follow-ups?filter=overdue')}
        />
        <QuickNumber
          label="Avg cycle"
          value={`${perf.conversion.avgCycleDays}d`}
          icon={Repeat}
          tone="purple"
        />
      </div>
    </div>
  );
}

/* ================================================================
   PERSONAL BESTS
   ================================================================ */
function PersonalBestsCard({ bests }) {
  const items = [
    { label: 'Highest Calls in a Day',  value: `${bests.highestCallsDay}`,        sub: bests.highestCallsDayLabel, icon: PhoneCall,     tone: 'purple' },
    { label: 'Highest Conversions',     value: `${bests.highestConversions}`,     sub: bests.highestConversionsLabel, icon: Award,       tone: 'emerald' },
    { label: 'Best Connection Rate',    value: `${bests.bestConnectionRate}%`,    sub: 'All time',                 icon: Percent,       tone: 'emerald' },
    { label: 'Longest Streak',          value: `${bests.longestStreak} days`,     sub: 'Consecutive',              icon: Flame,         tone: 'amber' },
    { label: 'Best Follow-Up Rate',     value: `${bests.bestFollowUpCompletion}%`,sub: 'Completion',               icon: CheckCircle2,  tone: 'emerald' },
  ];

  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-card">
          <Crown size={13} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Personal Bests
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const tones = {
            purple:  { bg: 'bg-violet-50', text: 'text-brand-purple' },
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
            amber:   { bg: 'bg-amber-50',   text: 'text-amber-600' },
          };
          const t = tones[item.tone];
          return (
            <div key={item.label} className="flex flex-col items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3 text-center">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.bg} ${t.text}`}>
                <Icon size={16} />
              </span>
              <p className={`font-display text-lg font-bold tabular-nums ${t.text}`}>{item.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/60">{item.label}</p>
              <p className="text-[9px] text-brand-ink/40">{item.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   MILESTONES
   ================================================================ */
function MilestonesCard({ milestones }) {
  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
          <Medal size={13} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
          Milestones
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {milestones.map((m) => {
          const pct = m.target > 0 ? Math.min(100, Math.round((m.current / m.target) * 100)) : 0;
          const remaining = Math.max(0, m.target - m.current);
          return (
            <div
              key={m.label}
              className={`flex items-center gap-3 rounded-xl border-2 bg-white p-3 ${
                m.achieved ? 'border-emerald-200' : 'border-brand-lilac/70'
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                m.achieved ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-mist text-brand-ink/40'
              }`}>
                {m.achieved ? <CheckCircle2 size={16} /> : <CircleDot size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold ${m.achieved ? 'text-emerald-600' : 'text-brand-ink'}`}>
                  {m.label}
                </p>
                <p className="text-[10px] text-brand-ink/50">
                  {m.current} / {m.target} {m.achieved ? '· Achieved ✓' : `· ${remaining} to go`}
                </p>
                {!m.achieved && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-brand-lilac/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   FUNNEL CARD
   ================================================================ */
function FunnelCard({ funnel }) {
  const max = funnel[0]?.value || 1;

  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <Layers size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
            Performance Funnel
          </p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
          Lead → Conversion
        </span>
      </div>

      <div className="space-y-2">
        {funnel.map((s) => {
          const pct = Math.round((s.value / max) * 100);
          const width = Math.max(20, pct);
          return (
            <div key={s.stage} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-[11px] font-semibold text-brand-ink/70">
                {s.stage}
              </span>
              <div className="relative h-9 flex-1 overflow-hidden rounded-lg bg-brand-lilac/30">
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-3 transition-all duration-700"
                  style={{ width: `${width}%` }}
                >
                  <span className="font-display text-sm font-bold text-white">{s.value}</span>
                </div>
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-[10px] font-bold text-brand-ink/50">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   DROP-OFF CARD
   ================================================================ */
function DropOffCard({ dropOffs, worst }) {
  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <TrendingDown size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
            Where Am I Losing Leads?
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {dropOffs.map((d, i) => {
          const tones = {
            emerald: 'bg-emerald-100 text-emerald-600',
            amber:   'bg-amber-100 text-amber-700',
            rose:    'bg-rose-100 text-rose-500',
          };
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-[11px] font-semibold text-brand-ink/70">
                {d.from} → {d.to}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-lilac/50">
                <div
                  className={`h-full rounded-full ${
                    d.tone === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                    d.tone === 'amber'   ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                                           'bg-gradient-to-r from-rose-500 to-rose-400'
                  } transition-all duration-700`}
                  style={{ width: `${d.rate}%` }}
                />
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tones[d.tone]}`}>
                {d.rate}%
              </span>
            </div>
          );
        })}
      </div>

      {worst && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
            <AlertTriangle size={10} /> Biggest Drop-off
          </p>
          <p className="text-xs text-rose-800">
            <b>{worst.from} → {worst.to}</b> loses <b>{worst.drop}%</b> of leads. Focus here to improve conversion.
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   PREVIOUS PERIOD COMPARISON
   ================================================================ */
function PreviousComparisonCard({ perf }) {
  const rows = [
    { label: 'Calls',       current: perf.calls.made,             previous: perf.previous.callsMade },
    { label: 'Connected',   current: perf.calls.connected,        previous: perf.previous.connected },
    { label: 'Follow-ups',  current: perf.followUps.completed,    previous: perf.previous.followUpsCompleted },
    { label: 'Conversions', current: perf.conversion.converted,   previous: perf.previous.converted },
    { label: 'Leads',       current: perf.leads.assigned,         previous: perf.previous.leadsAssigned },
  ];

  const convGrowth = rows.find((r) => r.label === 'Conversions');
  const convPct = convGrowth.previous > 0 ? ((convGrowth.current - convGrowth.previous) / convGrowth.previous) * 100 : 0;
  const callsGrowth = rows.find((r) => r.label === 'Calls');
  const callsPct = callsGrowth.previous > 0 ? ((callsGrowth.current - callsGrowth.previous) / callsGrowth.previous) * 100 : 0;

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-brand-lilac/60 bg-gradient-to-r from-brand-magenta/[0.05] to-brand-purple/[0.05] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-brand-purple">
            <ArrowRightLeft size={14} />
          </span>
          <h3 className="font-display text-sm font-semibold text-brand-ink">vs Previous Period</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
            <tr>
              <th className="px-5 py-3">Metric</th>
              <th className="px-5 py-3">This Period</th>
              <th className="px-5 py-3">Previous</th>
              <th className="px-5 py-3 text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-lilac/40">
            {rows.map((r) => {
              const pct = r.previous > 0
                ? Math.round(((r.current - r.previous) / r.previous) * 1000) / 10
                : 0;
              const up = pct >= 0;
              return (
                <tr key={r.label} className="hover:bg-brand-mist/40">
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-brand-ink">{r.label}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-display font-bold text-brand-ink">{r.current}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-brand-ink/60">{r.previous}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      up ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'
                    }`}>
                      {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {up ? '+' : ''}{pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-brand-lilac/60 bg-brand-mist/30 px-5 py-3">
        <p className="flex items-start gap-2 text-xs text-brand-ink/70">
          <Lightbulb size={12} className="mt-0.5 shrink-0 text-amber-500" />
          {convPct > callsPct
            ? <span>Your <b className="text-emerald-600">conversion growth ({convPct.toFixed(1)}%)</b> is outpacing your call-volume growth ({callsPct.toFixed(1)}%). You're getting better at converting — keep it up.</span>
            : <span>Your <b className="text-amber-600">call volume grew {callsPct.toFixed(1)}%</b> while conversions grew {convPct.toFixed(1)}%. Focus on follow-up discipline to lift conversion.</span>}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   INSIGHTS CARD
   ================================================================ */
function InsightsCard({ insights }) {
  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
          <Lightbulb size={13} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
          Personal Insights
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {insights.map((i, idx) => {
          const Icon = i.icon;
          const tones = {
            emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
            rose:    'bg-rose-50 text-rose-500 ring-rose-200',
            amber:   'bg-amber-50 text-amber-600 ring-amber-200',
            purple:  'bg-violet-50 text-brand-purple ring-violet-200',
          };
          return (
            <div key={idx} className="flex items-start gap-3 rounded-xl border border-brand-lilac bg-white p-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${tones[i.tone]}`}>
                <Icon size={13} />
              </span>
              <p className="text-xs text-brand-ink/80">{i.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   BEST DAY
   ================================================================ */
function BestDayCard({ bestDay }) {
  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-card">
          <Crown size={13} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Best Day
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <BestMetric label="Most Calls"       day={bestDay.best.day}     value={bestDay.best.calls}       icon={PhoneCall}     tone="purple" />
        <BestMetric label="Most Conversions" day={bestDay.bestConv.day} value={bestDay.bestConv.conversions} icon={Award}    tone="emerald" />
        <BestMetric label="Best Follow-Up"   day={bestDay.bestFU.day}   value={bestDay.bestFU.followUps}  icon={CalendarCheck} tone="amber" />
      </div>
    </div>
  );
}

function BestMetric({ label, day, value, icon: Icon, tone }) {
  const tones = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
        <p className="truncate font-display text-sm font-bold text-brand-ink">
          {day} — {value}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   WEEKLY CHART CARD
   ================================================================ */
function WeeklyChartCard({ title, subtitle, values, tone, total, format = (v) => v }) {
  const max = Math.max(...values, 1);
  const tones = {
    purple:  { bar: 'from-brand-purple to-brand-magenta', text: 'text-brand-purple', bg: 'bg-violet-50' },
    emerald: { bar: 'from-emerald-500 to-emerald-400',    text: 'text-emerald-600', bg: 'bg-emerald-50' },
    amber:   { bar: 'from-amber-500 to-orange-400',       text: 'text-amber-600',   bg: 'bg-amber-50' },
  };
  const t = tones[tone];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="card !p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-display text-sm font-semibold text-brand-ink">{title}</p>
          <p className="text-[10px] text-brand-ink/50">{subtitle}</p>
        </div>
        <span className={`rounded-full ${t.bg} px-2 py-0.5 text-[10px] font-bold ${t.text}`}>
          {total}
        </span>
      </div>

      <div className="flex h-24 items-end gap-1.5">
        {values.map((v, i) => {
          const h = Math.max(6, Math.round((v / max) * 100));
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
              <span className="absolute -top-5 rounded-md bg-brand-ink px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {format(v)}
              </span>
              <div
                className={`w-full rounded-t-md bg-gradient-to-t ${t.bar} transition-all duration-500 hover:brightness-110`}
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] font-semibold uppercase tracking-wide text-brand-ink/40">
        {days.map((d) => (
          <span key={d} className="flex-1 text-center">{d}</span>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   BAR BREAKDOWN CARD
   ================================================================ */
function BarBreakdownCard({ title, rows }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  const barTones = {
    blue:    'from-blue-500 to-blue-400',
    violet:  'from-brand-purple to-brand-magenta',
    amber:   'from-amber-500 to-orange-400',
    emerald: 'from-emerald-500 to-teal-400',
    rose:    'from-rose-500 to-rose-400',
    slate:   'from-slate-400 to-slate-500',
  };
  const pillTones = {
    blue:    'bg-blue-100 text-blue-600',
    violet:  'bg-violet-100 text-brand-purple',
    amber:   'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-600',
    rose:    'bg-rose-100 text-rose-500',
    slate:   'bg-slate-100 text-slate-600',
  };

  return (
    <div className="card !p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-brand-ink">{title}</p>
        <span className="text-[10px] font-bold uppercase tracking-wide text-brand-ink/40">{total} total</span>
      </div>

      <div className="space-y-2.5">
        {rows.map((r) => {
          const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
          return (
            <div key={r.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-[11px] font-semibold text-brand-ink/70">{r.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-lilac/50">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barTones[r.tone] || barTones.violet} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${pillTones[r.tone] || pillTones.violet}`}>
                {r.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickNumber({ label, value, icon: Icon, tone = 'purple', onClick }) {
  const tones = {
    purple: 'bg-violet-50 text-brand-purple',
    rose:   'bg-rose-50 text-rose-500',
    emerald:'bg-emerald-50 text-emerald-600',
    amber:  'bg-amber-50 text-amber-600',
  };
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`card !p-3 text-left ${onClick ? 'transition-all hover:-translate-y-0.5 hover:shadow-md' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
          <p className="font-display text-lg font-bold text-brand-ink">{value}</p>
        </div>
        {onClick && <ChevronRight size={14} className="text-brand-ink/30" />}
      </div>
    </Tag>
  );
}

/* ================================================================
   TAB — LEAD PERFORMANCE
   ================================================================ */
function LeadTab({ perf, onNavigate }) {
  const { leads, leadAging } = perf;
  const contactRate = leads.assigned > 0 ? Math.round((leads.contacted / leads.assigned) * 100) : 0;

  const agingRows = [
    { label: 'Same Day',    value: leadAging.sameDay,    tone: 'emerald' },
    { label: '1–2 Days',    value: leadAging.oneTwoDay,  tone: 'amber' },
    { label: '3–7 Days',    value: leadAging.threeSeven, tone: 'amber' },
    { label: '7+ Days',     value: leadAging.sevenPlus,  tone: 'rose' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatBig label="Leads Assigned"  value={leads.assigned}  icon={UserPlus}      color="purple" sub={`${leads.newToday} new today`} />
        <StatBig label="Leads Contacted" value={leads.contacted} icon={UserCheck}     color="emerald" sub={`${contactRate}% contact rate`} />
        <StatBig
          label="Untouched"
          value={leads.untouched}
          icon={AlertTriangle}
          color="rose"
          sub="Click to filter →"
          onClick={() => onNavigate('/agent/leads?filter=untouched')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarBreakdownCard title="Lead pipeline" rows={leads.byStatus} />

        <div className="card !p-5">
          <p className="mb-3 font-display text-sm font-semibold text-brand-ink">Contact Progress</p>

          <div className="space-y-4">
            <ProgressRow label="Contacted" value={leads.contacted} total={leads.assigned} tone="emerald" />
            <ProgressRow label="Untouched" value={leads.untouched} total={leads.assigned} tone="rose" />
            <ProgressRow
              label="Converted"
              value={leads.byStatus.find((s) => s.label === 'Converted')?.value || 0}
              total={leads.assigned}
              tone="purple"
            />
          </div>

          <div className="mt-5 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">
              <Info size={10} /> Tip
            </p>
            <p className="text-xs text-brand-ink/70">
              You have <b className="text-rose-500">{leads.untouched} untouched leads</b>. Reaching out
              to even 20% more could boost your score.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarBreakdownCard title="Lead Aging" rows={agingRows} />

        <div className="card !p-5">
          <p className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold text-brand-ink">
            <Timer size={13} className="text-brand-purple" /> Response Performance
          </p>

          <div className="grid grid-cols-2 gap-3">
            <QualityMetric label="First Contact Avg" value={leadAging.firstContactAvg} icon={Clock}         tone="purple" />
            <QualityMetric label="SLA Achievement"   value={`${leadAging.slaAchievement}%`} icon={CheckCircle2} tone="emerald" />
          </div>

          <div className="mt-4 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">
              <Lightbulb size={10} /> Insight
            </p>
            <p className="text-xs text-brand-ink/70">
              You respond to <b>{leadAging.sameDay}%</b> of new leads on the same day. Your average first contact is{' '}
              <b className="text-brand-purple">{leadAging.firstContactAvg}</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB — CALL PERFORMANCE
   ================================================================ */
function CallTab({ perf, onNavigate }) {
  const { calls } = perf;
  const missedRate = calls.made > 0 ? Math.round((calls.missed / calls.made) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatBig label="Calls Made" value={calls.made}      icon={PhoneCall}     color="purple"  sub={`${calls.totalTalkTime} talk time`} onClick={() => onNavigate('/agent/calls')} />
        <StatBig label="Connected"  value={calls.connected} icon={PhoneIncoming} color="emerald" sub={`${calls.connectionRate}% connection`} onClick={() => onNavigate('/agent/calls?filter=connected')} />
        <StatBig label="Outgoing"   value={calls.outgoing}  icon={PhoneOutgoing} color="purple"  sub="Agent-initiated" />
        <StatBig label="Missed"     value={calls.missed}    icon={PhoneMissed}   color="rose"    sub={`${missedRate}% of calls`} onClick={() => onNavigate('/agent/calls?filter=missed')} />
      </div>

      <div className="card !p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <Gauge size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
            Call Quality Metrics
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <QualityMetric label="Calls / Hour"     value={calls.callsPerHour}         icon={PhoneCall}     tone="purple" />
          <QualityMetric label="Connected / Hour" value={calls.connectedPerHour}     icon={PhoneIncoming} tone="emerald" />
          <QualityMetric label="Connection Rate"  value={`${calls.connectionRate}%`} icon={Percent}       tone="emerald" />
          <QualityMetric label="Missed Rate"      value={`${calls.missedRate}%`}     icon={PhoneMissed}   tone="rose" />
          <QualityMetric label="Calls / Conv."    value={calls.callsPerConversion}   icon={Target}        tone="purple" />
          <QualityMetric label="Best Hour"        value={calls.bestHour}             icon={Flame}         tone="amber" wide />
        </div>
      </div>

      <div className="card !p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-card">
              <Sunrise size={13} />
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
              Your Best Calling Hours
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
            Peak: {calls.bestHour}
          </span>
        </div>

        <div className="flex h-32 items-end gap-1">
          {calls.hourlyRate.map((h) => {
            const isBest = calls.bestHour.startsWith(h.hour) || parseInt(h.hour) === 10;
            return (
              <div key={h.hour} className="group relative flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-brand-ink/50">{h.rate}%</span>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 hover:brightness-110 ${
                    isBest
                      ? 'bg-gradient-to-t from-amber-500 to-orange-400'
                      : 'bg-gradient-to-t from-brand-purple to-brand-magenta'
                  }`}
                  style={{ height: `${h.rate}%` }}
                />
                <span className={`text-[9px] font-semibold uppercase ${isBest ? 'text-amber-700' : 'text-brand-ink/40'}`}>
                  {h.hour}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-start gap-2 text-xs text-amber-800">
            <Lightbulb size={12} className="mt-0.5 shrink-0 text-amber-600" />
            <span>Your highest connection rate occurs between <b>10 AM – 11 AM</b>. Consider scheduling more outbound calls during this window.</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarBreakdownCard title="Call Outcome Analysis" rows={perf.callOutcomes} />

        <div className="card !p-5">
          <p className="mb-4 font-display text-sm font-semibold text-brand-ink">Call Breakdown</p>

          <div className="space-y-4">
            <ProgressRow label="Connected" value={calls.connected} total={calls.made} tone="emerald" />
            <ProgressRow label="Missed"    value={calls.missed}    total={calls.made} tone="rose" />
            <ProgressRow label="Outgoing"  value={calls.outgoing}  total={calls.made} tone="purple" />
            <ProgressRow label="Incoming"  value={calls.incoming}  total={calls.made} tone="amber" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <SmallStat label="Avg Call"      value={calls.avgDuration}          icon={Clock}         tone="purple" />
            <SmallStat label="Talk Time"     value={calls.totalTalkTime}        icon={Timer}         tone="emerald" />
            <SmallStat label="1st-Call Rate" value={`${calls.firstCallRate}%`}  icon={PhoneOutgoing} tone="purple" />
            <SmallStat label="Repeat Rate"   value={`${calls.repeatRate}%`}     icon={Repeat}        tone="amber" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QualityMetric({ label, value, icon: Icon, tone, wide }) {
  const tones = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-rose-500',
  };
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border border-brand-lilac bg-white p-3 ${wide ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
        <p className="truncate font-display text-sm font-bold text-brand-ink">{value}</p>
      </div>
    </div>
  );
}

/* ================================================================
   TAB — FOLLOW-UP PERFORMANCE
   ================================================================ */
function FollowUpTab({ perf, onNavigate }) {
  const { followUps } = perf;
  const total = followUps.completed + followUps.pending + followUps.overdue;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatBig label="Completed" value={followUps.completed} icon={CheckCircle2}  color="emerald" sub={`${followUps.completionRate}% rate`} onClick={() => onNavigate('/agent/follow-ups?filter=completed')} />
        <StatBig label="Pending"   value={followUps.pending}   icon={Clock}         color="amber"   sub="Waiting your action" />
        <StatBig
          label="Overdue"
          value={followUps.overdue}
          icon={AlertTriangle}
          color="rose"
          sub="Click to filter →"
          onClick={() => onNavigate('/agent/follow-ups?filter=overdue')}
        />
        <StatBig label="Today"     value={followUps.today}     icon={Calendar}      color="purple"  sub={`${followUps.upcoming} upcoming`} />
      </div>

      <div className="card !p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <Gauge size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
            Follow-Up Efficiency
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <QualityMetric label="Completion Rate" value={`${followUps.completionRate}%`} icon={Percent}       tone="emerald" />
          <QualityMetric label="On-time Rate"    value={`${followUps.onTimeRate}%`}     icon={CheckCircle2} tone="emerald" />
          <QualityMetric label="Avg / Lead"      value={followUps.avgPerLead}           icon={Repeat}       tone="purple" />
          <QualityMetric label="Avg Delay"       value={`${followUps.avgDelayHours}h`}  icon={Clock}        tone="amber" />
          <QualityMetric label="Completed Today" value={followUps.completedToday}       icon={CalendarCheck} tone="emerald" />
          <QualityMetric label="Rescheduled"     value={followUps.rescheduled}          icon={Repeat}       tone="purple" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarBreakdownCard title="Follow-up status" rows={followUps.byOutcome} />

        <div className="card !p-5">
          <p className="mb-3 font-display text-sm font-semibold text-brand-ink">Completion Progress</p>

          <div className="space-y-4">
            <ProgressRow label="Completed" value={followUps.completed} total={total} tone="emerald" />
            <ProgressRow label="Pending"   value={followUps.pending}   total={total} tone="amber" />
            <ProgressRow label="Overdue"   value={followUps.overdue}   total={total} tone="rose" />
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
              <AlertTriangle size={10} /> Attention
            </p>
            <p className="text-xs text-amber-800">
              <b>{followUps.overdue} overdue follow-ups</b> — clear them to boost your score.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <SmallStat label="Follow-Up → Conversion" value={`${followUps.conversions} conversions`} icon={Award}   tone="emerald" />
            <SmallStat label="Avg per Lead"           value={followUps.avgPerLead}                   icon={Repeat}  tone="purple" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB — CONVERSION PERFORMANCE
   ================================================================ */
function ConversionTab({ perf, onNavigate }) {
  const { conversion } = perf;
  const remaining = 100 - conversion.revenueAchieved;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatBig label="Interested"       value={conversion.interested}          icon={Flame}   color="rose"    sub="Active pipeline" onClick={() => onNavigate('/agent/leads?filter=interested')} />
        <StatBig label="Converted"        value={conversion.converted}           icon={Award}   color="emerald" sub="Won deals" onClick={() => onNavigate('/agent/leads?filter=converted')} />
        <StatBig label="Conversion Rate"  value={`${conversion.conversionRate}%`} icon={Percent} color="purple" sub="Deals / leads" />
        <StatBig label="Avg Cycle"        value={`${conversion.avgCycleDays}d`}   icon={Repeat}  color="amber"   sub="First call → conversion" />
      </div>

      <div className="card !p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
            <Gauge size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
            Conversion Quality
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QualityMetric label="Interested → Converted" value={`${conversion.interestedToConverted}%`} icon={ArrowRight} tone="emerald" />
          <QualityMetric label="Overall Rate"           value={`${conversion.conversionRate}%`}         icon={Percent}    tone="purple" />
          <QualityMetric label="Revenue"                value={conversion.revenue}                     icon={Star}       tone="amber" />
          <QualityMetric label="Avg per Deal"           value={conversion.avgRevenue}                  icon={Target}     tone="emerald" />
        </div>
      </div>

      <div className="card !p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-card">
            <Star size={13} />
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            Revenue Performance
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SmallStat label="Revenue"    value={conversion.revenue}        icon={Star}     tone="emerald" />
          <SmallStat label="Target"     value={conversion.revenueTarget}  icon={Target}   tone="purple" />
          <SmallStat label="Avg / Deal" value={conversion.avgRevenue}     icon={Award}    tone="amber" />
          <SmallStat label="Achieved"   value={`${conversion.revenueAchieved}%`} icon={Percent} tone="emerald" />
        </div>

        <div className="mt-4">
          <div className="h-2.5 overflow-hidden rounded-full bg-brand-lilac/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
              style={{ width: `${conversion.revenueAchieved}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] font-semibold text-brand-ink/60">
            {remaining > 0
              ? <span>₹{Math.round((remaining / 100) * 150)}L remaining to reach revenue target.</span>
              : <span className="text-emerald-600">Revenue target achieved ✓</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card !p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-brand-ink">Conversions by month</p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              +{conversion.byMonth.reduce((s, m) => s + m.value, 0)} total
            </span>
          </div>

          <div className="flex h-36 items-end gap-3">
            {conversion.byMonth.map((m) => {
              const max = Math.max(...conversion.byMonth.map((x) => x.value), 1);
              const h = Math.max(10, Math.round((m.value / max) * 100));
              return (
                <div key={m.label} className="group relative flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-brand-ink/60">{m.value}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand-magenta to-brand-purple transition-all duration-500 hover:brightness-110"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card !p-5">
          <p className="mb-3 font-display text-sm font-semibold text-brand-ink">Highlights</p>

          <div className="space-y-3">
            <HighlightRow icon={Trophy}   label="Top campaign"    value={conversion.topCampaign}             tone="purple" />
            <HighlightRow icon={Star}     label="Revenue"         value={conversion.revenue}                 tone="emerald" />
            <HighlightRow icon={Activity} label="Avg cycle"       value={`${conversion.avgCycleDays} days`}  tone="amber" />
            <HighlightRow icon={Target}   label="Conversion rate" value={`${conversion.conversionRate}%`}    tone="rose" />
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-lilac/60 bg-gradient-to-r from-brand-magenta/[0.05] to-brand-purple/[0.05] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-brand-purple">
              <Layers size={14} />
            </span>
            <h3 className="font-display text-sm font-semibold text-brand-ink">Campaign Performance</h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
            <Trophy size={10} /> Best: {conversion.topCampaign}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Leads</th>
                <th className="px-5 py-3">Calls</th>
                <th className="px-5 py-3">Connected</th>
                <th className="px-5 py-3">Interested</th>
                <th className="px-5 py-3 text-right">Converted</th>
                <th className="px-5 py-3 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lilac/40">
              {conversion.bySource.map((s) => (
                <tr key={s.label} className="hover:bg-brand-mist/40">
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-brand-ink">{s.label}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-brand-ink/70">{s.leads}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-brand-ink/70">{s.calls}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-brand-ink/70">{s.connected}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-brand-ink/70">{s.interested}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      <Award size={10} /> {s.value}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <span className="font-mono text-[11px] font-bold text-brand-purple">{s.rate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB — DAILY ACTIVITY
   ================================================================ */
function DailyTab({ perf, bestDay }) {
  const days = perf.daily;
  const maxActivity = Math.max(...days.map((x) => x.calls + x.followUps + x.conversions * 3), 1);

  const heatTone = (v, max) => {
    const pct = max > 0 ? v / max : 0;
    if (pct >= 0.75) return 'bg-emerald-500';
    if (pct >= 0.5)  return 'bg-emerald-400';
    if (pct >= 0.25) return 'bg-amber-300';
    if (pct > 0)     return 'bg-rose-300';
    return 'bg-slate-200';
  };

  const callsMax     = Math.max(...days.map((d) => d.calls), 1);
  const followUpsMax = Math.max(...days.map((d) => d.followUps), 1);
  const convMax      = Math.max(...days.map((d) => d.conversions), 1);

  return (
    <div className="space-y-5">
      <div className="card !p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
              <Activity size={13} />
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-magenta">
              Activity Heatmap
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
            <span>Low</span>
            <span className="h-3 w-3 rounded bg-rose-300" />
            <span className="h-3 w-3 rounded bg-amber-300" />
            <span className="h-3 w-3 rounded bg-emerald-400" />
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span>High</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-8 gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
              <span></span>
              {days.map((d) => (
                <span key={d.day} className="text-center">{d.day}</span>
              ))}
            </div>

            {[
              { label: 'Calls',       key: 'calls',       max: callsMax },
              { label: 'Follow-Ups',  key: 'followUps',   max: followUpsMax },
              { label: 'Conversions', key: 'conversions', max: convMax },
            ].map((row) => (
              <div key={row.key} className="mt-1.5 grid grid-cols-8 items-center gap-1.5">
                <span className="text-[11px] font-semibold text-brand-ink/60">{row.label}</span>
                {days.map((d) => (
                  <div
                    key={d.day}
                    className={`group relative h-8 rounded-lg ${heatTone(d[row.key], row.max)} transition-all hover:scale-105`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90">
                      {d[row.key]}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-lilac/60 bg-gradient-to-r from-brand-magenta/[0.05] to-brand-purple/[0.05] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-brand-purple">
              <Activity size={14} />
            </span>
            <h3 className="font-display text-sm font-semibold text-brand-ink">Last 7 days</h3>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">
            Your activity
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-5 py-3">Day</th>
                <th className="px-5 py-3">Calls</th>
                <th className="px-5 py-3">Follow-Ups</th>
                <th className="px-5 py-3">Conversions</th>
                <th className="px-5 py-3 text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lilac/40">
              {days.map((d) => {
                const totalActivity = d.calls + d.followUps + d.conversions * 3;
                const pct = Math.round((totalActivity / maxActivity) * 100);
                return (
                  <tr key={d.day} className="hover:bg-brand-mist/40">
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="font-display text-sm font-bold text-brand-ink">{d.day}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-brand-purple">
                        <PhoneCall size={10} /> {d.calls}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                        <CalendarCheck size={10} /> {d.followUps}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                        <Award size={10} /> {d.conversions}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <div className="ml-auto flex items-center justify-end gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-brand-lilac/50">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-mono text-[10px] font-bold text-brand-ink/60">
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <BestDayCard bestDay={bestDay} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBig label="Total Calls"       value={perf.calls.made}            icon={PhoneCall}     color="purple"  sub="This week" />
        <StatBig label="Total Follow-Ups"  value={perf.followUps.completed}   icon={CalendarCheck} color="emerald" sub="This week" />
        <StatBig label="Total Conversions" value={perf.conversion.converted}  icon={Award}         color="amber"   sub="This week" />
      </div>
    </div>
  );
}

/* ================================================================
   EXPORT MODAL
   ================================================================ */
function ExportModal({ perf, range, onClose, onExported }) {
  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === range)?.label || 'This period';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <Download size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Export Report</h3>
              <p className="text-xs text-brand-ink/50">{rangeLabel} · {perf.agentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink/50">
            <Info size={10} /> Report includes
          </p>
          <ul className="space-y-1 text-[11px] text-brand-ink/70">
            <li>✓ Leads, Calls, Follow-Ups, Conversions</li>
            <li>✓ Target vs Actual progress</li>
            <li>✓ Daily activity breakdown</li>
            <li>✓ Campaign performance</li>
            <li>✓ Personal insights</li>
          </ul>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onExported('pdf')}
            className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-3 text-[11px] font-bold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
          >
            <Eye size={16} className="text-brand-magenta" />
            PDF Report
          </button>
          <button
            onClick={() => onExported('csv')}
            className="flex flex-col items-center gap-1 rounded-xl border border-brand-lilac bg-white py-3 text-[11px] font-bold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
          >
            <FileAudio size={16} className="text-brand-magenta" />
            CSV / Excel
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   REUSABLE CARDS
   ================================================================ */
function StatBig({ label, value, icon: Icon, color = 'purple', sub, onClick }) {
  const themes = {
    purple:  { border: 'border-violet-200',  bg: 'from-violet-50 to-white', iconBg: 'bg-violet-100 text-brand-purple', bar: 'from-brand-purple to-brand-magenta', valueColor: 'text-brand-purple' },
    emerald: { border: 'border-emerald-200', bg: 'from-emerald-50 to-white', iconBg: 'bg-emerald-100 text-emerald-600', bar: 'from-emerald-500 to-emerald-400',     valueColor: 'text-emerald-600' },
    amber:   { border: 'border-amber-200',   bg: 'from-amber-50 to-white',   iconBg: 'bg-amber-100 text-amber-600',     bar: 'from-amber-500 to-orange-400',         valueColor: 'text-amber-600' },
    rose:    { border: 'border-rose-200',    bg: 'from-rose-50 to-white',    iconBg: 'bg-rose-100 text-brand-magenta',  bar: 'from-brand-magenta to-brand-purple',   valueColor: 'text-brand-magenta' },
  };
  const t = themes[color] || themes.purple;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${t.bg} p-5 text-left transition-all hover:-translate-y-1 hover:shadow-md ${t.border} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />

      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">{label}</p>
          <p className={`mt-1 font-display text-3xl font-bold leading-none tabular-nums ${t.valueColor}`}>
            {value}
          </p>
          {sub && <p className="mt-1 text-[10px] text-brand-ink/50">{sub}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.iconBg}`}>
          <Icon size={18} />
        </span>
      </div>

      {onClick && (
        <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-brand-magenta opacity-0 transition-opacity group-hover:opacity-100">
          <ChevronRight size={12} />
        </span>
      )}
    </Tag>
  );
}

function ProgressRow({ label, value, total, tone = 'purple' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const bars = {
    purple:  'from-brand-purple to-brand-magenta',
    emerald: 'from-emerald-500 to-teal-400',
    amber:   'from-amber-500 to-orange-400',
    rose:    'from-rose-500 to-rose-400',
  };
  const textColors = {
    purple:  'text-brand-purple',
    emerald: 'text-emerald-600',
    amber:   'text-amber-600',
    rose:    'text-rose-500',
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-brand-ink/70">{label}</span>
        <span className={`font-mono font-bold ${textColors[tone]}`}>
          {value} <span className="text-brand-ink/30">/ {total}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-brand-lilac/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bars[tone]} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-brand-ink/40">{pct}%</p>
    </div>
  );
}

function SmallStat({ label, value, icon: Icon, tone = 'purple' }) {
  const tones = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-rose-500',
  };
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-brand-lilac bg-white p-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
        <p className="font-display text-sm font-bold text-brand-ink">{value}</p>
      </div>
    </div>
  );
}

function HighlightRow({ icon: Icon, label, value, tone = 'purple' }) {
  const tones = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-rose-500',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
        <p className="truncate font-display text-sm font-bold text-brand-ink">{value}</p>
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

function AnimatedStatCard({ label, value, sub, icon: Icon, color, trend, trendUp, delay = 0, onClick }) {
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
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition-all duration-500 hover:-translate-y-1 animate-fade-slide-in ${t.border} ${t.shadow} ${onClick ? 'cursor-pointer' : ''}`}
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

      {onClick && (
        <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-brand-magenta opacity-0 transition-opacity group-hover:opacity-100">
          <ChevronRight size={12} />
        </span>
      )}
    </Tag>
  );
}