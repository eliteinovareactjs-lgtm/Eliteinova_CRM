// src/pages/agent/AgentDashboard.jsx
import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, CalendarCheck, AlertTriangle, PhoneCall,
  PhoneIncoming, PhoneOutgoing, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LEADS } from '../../data/mockData';

/* ============================================================
   DEMO COUNTS — replace with real API numbers later
   ============================================================ */
const DEMO = {
  todaysFollowUps: 4,
  overdueFollowUps: 2,
  todaysCalls: 12,
  connectedCalls: 8,
  pendingCalls: 5,
};

/* ============================================================
   ROUTES — where each KPI card navigates
   ============================================================ */
const ROUTES = {
  leads:       '/agent/leads',
  followUps:   '/agent/follow-ups',
  calls:       '/agent/calls',
  callRecords: '/agent/call-records',
  performance: '/agent/performance',
};

/* ============================================================
   ANIMATED COUNTER HOOK
   ============================================================ */
function useAnimatedCount(target = 0, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */
export default function AgentDashboard() {
  const { user, activeWebsiteId } = useAuth();

  const myLeads = useMemo(
    () =>
      LEADS.filter(
        (l) => l.websiteId === activeWebsiteId && l.assignedAgent === user.name
      ),
    [activeWebsiteId, user.name]
  );

  const kpi = useMemo(() => {
    const total    = myLeads.length;
    const fresh    = myLeads.filter((l) => l.status === 'Fresh').length;
    const followUp = myLeads.filter((l) => l.status === 'Follow Up').length;
    const won      = myLeads.filter((l) => l.status === 'Won').length;

    return {
      myLeads: total,
      newLeads: fresh,
      todaysFollowUps: DEMO.todaysFollowUps,
      overdueFollowUps: DEMO.overdueFollowUps,
      todaysCalls: DEMO.todaysCalls,
      connectedCalls: DEMO.connectedCalls,
      pendingCalls: DEMO.pendingCalls,
      convertedLeads: won,
    };
  }, [myLeads]);

  return (
    <div className="space-y-6">
      {/* ============ PAGE HEADER ============ */}
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-ink">
          Agent Dashboard
        </h1>
        <p className="text-sm text-brand-ink/60">
          Welcome back, {user?.name} 👋 Here's your daily snapshot.
        </p>
      </div>

      {/* ============ 8 KPI CARDS (from doc) ============ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <KPICard
          icon={Users}
          label="My Leads"
          value={kpi.myLeads}
          sub="Total assigned to you"
          color="rose"
          to={ROUTES.leads}
          delay={0}
        />
        <KPICard
          icon={UserPlus}
          label="New Leads"
          value={kpi.newLeads}
          sub="Newly assigned / uncontacted"
          color="purple"
          to={ROUTES.leads}
          delay={40}
        />
        <KPICard
          icon={CalendarCheck}
          label="Today's Follow-Ups"
          value={kpi.todaysFollowUps}
          sub="Scheduled for today"
          color="amber"
          to={ROUTES.followUps}
          delay={80}
        />
        <KPICard
          icon={AlertTriangle}
          label="Overdue Follow-Ups"
          value={kpi.overdueFollowUps}
          sub="Missed follow-ups"
          color="rose"
          to={ROUTES.followUps}
          alert={kpi.overdueFollowUps > 0}
          delay={120}
        />
        <KPICard
          icon={PhoneCall}
          label="Today's Calls"
          value={kpi.todaysCalls}
          sub="Inbound + outbound"
          color="purple"
          to={ROUTES.calls}
          delay={160}
        />
        <KPICard
          icon={PhoneIncoming}
          label="Connected Calls"
          value={kpi.connectedCalls}
          sub="Successfully connected"
          color="emerald"
          to={ROUTES.callRecords}
          delay={200}
        />
        <KPICard
          icon={PhoneOutgoing}
          label="Pending Calls"
          value={kpi.pendingCalls}
          sub="Still need to be contacted"
          color="amber"
          to={ROUTES.leads}
          delay={240}
        />
        <KPICard
          icon={CheckCircle2}
          label="Converted Leads"
          value={kpi.convertedLeads}
          sub="Converted by you"
          color="emerald"
          to={ROUTES.performance}
          delay={280}
        />
      </div>
    </div>
  );
}

/* ============================================================
   KPI CARD
   ============================================================ */
function KPICard({ icon: Icon, label, value, sub, color = 'purple', to, alert, delay = 0 }) {
  const navigate = useNavigate();
  const animated = useAnimatedCount(value);

  const themes = {
    purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'bg-violet-50', fg: 'text-brand-purple', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(139,47,214,0.55)]', bar: 'from-brand-purple to-brand-magenta' },
    emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'bg-emerald-50', fg: 'text-emerald-600', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(16,185,129,0.5)]', bar: 'from-emerald-500 to-emerald-400' },
    amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'bg-amber-50', fg: 'text-amber-600', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(245,158,11,0.5)]', bar: 'from-amber-500 to-orange-400' },
    rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'bg-rose-50', fg: 'text-brand-magenta', glow: 'hover:shadow-[0_16px_36px_-14px_rgba(227,28,121,0.55)]', bar: 'from-brand-magenta to-brand-purple' },
  };
  const t = themes[color] || themes.purple;

  return (
    <button
      type="button"
      onClick={() => to && navigate(to)}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/40 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 ease-out ${t.border} ${t.glow} hover:-translate-y-1.5 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brand-magenta/40`}
    >
      <span className={`absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />

      {alert && (
        <span className="pointer-events-none absolute right-3 top-3 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-magenta opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-magenta" />
        </span>
      )}

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${t.border} ${t.bg} ${t.fg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={16} />
        </span>
        <ChevronRight size={14} className="mt-1 -translate-x-2 text-brand-ink/30 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-brand-magenta group-hover:opacity-100" />
      </div>

      <div className="relative z-10 w-full">
        <p className="font-display text-2xl font-bold leading-tight text-brand-ink tabular-nums">
          {typeof value === 'number' ? animated.toLocaleString() : value}
        </p>
        <p className="text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </button>
  );
}