// src/pages/admin/Agents.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Phone, Users2, Search, Filter, MoreVertical, Mail,
  CheckCircle2, Pause, X, Trash2, AlertCircle, TrendingUp,
  Target, Activity, Clock, Award, UserPlus, UserMinus, Users,
  Briefcase, MapPin, Megaphone, Layers, UserCog, RefreshCw,
  ArrowRight, ArrowRightLeft, LogIn, LogOut, Circle, Play,
  BarChart3, PhoneCall, Calendar, Eye, Pencil, Save, Shield,
  Grid3x3, List, Crown, Star, Zap, Hash, Copy, Building2,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Hash as HashIcon,
  FileText, StickyNote, Percent,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AGENTS as INITIAL_AGENTS,
  LEADS,
  CALLS,
  FOLLOW_UPS,
} from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'agents',      label: 'All Agents',       icon: Users2 },
  { key: 'groups',      label: 'Groups',           icon: Users },
  { key: 'availability',label: 'Availability',     icon: Activity },
  { key: 'activity',    label: 'Agent Activity',   icon: Zap },
  { key: 'performance', label: 'Performance',      icon: TrendingUp },
  { key: 'allocation',  label: 'Lead Allocation',  icon: Target },
];

const STATUS_STYLES = {
  Active:  { chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Active' },
  Break:   { chip: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   label: 'Break' },
  Offline: { chip: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400',   label: 'Offline' },
};

const GROUP_TYPES = [
  'Department',
  'Location',
  'Campaign',
  'Business function',
  'Product/service',
  'Experience level',
];

const STORAGE_PREFIX = 'agents:';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) || typeof parsed === 'object') return parsed;
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
};

const initials = (name) =>
  (name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const formatDate = (val) => {
  if (!val) return '—';
  const d = typeof val === 'number' ? new Date(val) : new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (val) => {
  if (!val) return '—';
  const d = typeof val === 'number' ? new Date(val) : new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Agents() {
  const { activeWebsiteId, activeWebsite } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('agents');
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [viewingAgent, setViewingAgent] = useState(null); // ✨ for detail drawer

  const [allAgents, setAllAgents] = useState(() =>
    loadState(`list:${activeWebsiteId}`, INITIAL_AGENTS.filter((a) => a.websiteId === activeWebsiteId))
  );
  const [groups, setGroups] = useState(() =>
    loadState(`groups:${activeWebsiteId}`, [])
  );
  const [activityLog, setActivityLog] = useState(() =>
    loadState(`activity:${activeWebsiteId}`, [])
  );
  const [assignments, setAssignments] = useState(() =>
    loadState(`assignments:${activeWebsiteId}`, [])
  );

  useEffect(() => {
    setAllAgents(loadState(`list:${activeWebsiteId}`, INITIAL_AGENTS.filter((a) => a.websiteId === activeWebsiteId)));
    setGroups(loadState(`groups:${activeWebsiteId}`, []));
    setActivityLog(loadState(`activity:${activeWebsiteId}`, []));
    setAssignments(loadState(`assignments:${activeWebsiteId}`, []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebsiteId]);

  useEffect(() => { saveState(`list:${activeWebsiteId}`, allAgents); }, [allAgents, activeWebsiteId]);
  useEffect(() => { saveState(`groups:${activeWebsiteId}`, groups); }, [groups, activeWebsiteId]);
  useEffect(() => { saveState(`activity:${activeWebsiteId}`, activityLog); }, [activityLog, activeWebsiteId]);
  useEffect(() => { saveState(`assignments:${activeWebsiteId}`, assignments); }, [assignments, activeWebsiteId]);

  const websiteAgents = useMemo(
    () => allAgents.filter((a) => a.websiteId === activeWebsiteId),
    [allAgents, activeWebsiteId]
  );
  const websiteLeads = useMemo(
    () => LEADS.filter((l) => l.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  /* ── Agents CRUD ── */
  const handleAdd = (data) => {
    const newAgent = {
      id: uid('agent'),
      websiteId: activeWebsiteId,
      ...data,
      leadsAssigned: 0,
      callsToday: 0,
      joinedAt: Date.now(),
    };
    setAllAgents((p) => [...p, newAgent]);
    logActivity(newAgent, 'login', 'Employee created & logged in');
    showToast(`${data.name} added`);
    setShowAddAgent(false);
  };

  const handleEdit = (id, updates) => {
    setAllAgents((p) => p.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    showToast('Employee updated');
  };

  const handleDelete = (id, name) => {
    setConfirmDelete({
      kind: 'agent',
      id,
      name,
      message: `This will permanently remove "${name}". Any leads assigned to them will become unassigned.`,
    });
  };

  const performDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.kind === 'agent') {
      setAllAgents((p) => p.filter((a) => a.id !== confirmDelete.id));
      showToast(`"${confirmDelete.name}" removed`, 'error');
    } else if (confirmDelete.kind === 'group') {
      setGroups((p) => p.filter((g) => g.id !== confirmDelete.id));
      showToast(`"${confirmDelete.name}" group removed`, 'error');
    }
    setConfirmDelete(null);
  };

  const handleSetStatus = (id, newStatus) => {
    const agent = websiteAgents.find((a) => a.id === id);
    setAllAgents((p) => p.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    if (agent) {
      logActivity(
        agent,
        newStatus === 'Active' ? 'login' : newStatus === 'Break' ? 'break' : 'logout',
        `Status changed to ${newStatus}`
      );
    }
    showToast(`${agent?.name} → ${newStatus}`);
  };

  const logActivity = (agent, type, detail) => {
    setActivityLog((p) => [
      {
        id: uid('log'),
        agentId: agent.id,
        agentName: agent.name,
        type,
        detail,
        at: new Date().toISOString(),
      },
      ...p,
    ].slice(0, 200));
  };

  /* ── Groups ── */
  const handleAddGroup = (group) => {
    setGroups((p) => [...p, { id: uid('grp'), ...group }]);
    showToast(`Group "${group.name}" created`);
  };
  const handleUpdateGroup = (id, updates) => {
    setGroups((p) => p.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    showToast('Group updated');
  };

  /* ── Assign / Reassign ── */
  const handleAssignLeads = (agentId, leadIds) => {
    const agent = websiteAgents.find((a) => a.id === agentId);
    if (!agent) return;
    const now = Date.now();
    const newAssignments = leadIds.map((leadId) => ({
      id: uid('asg'),
      agentId,
      agentName: agent.name,
      leadId,
      at: now,
      action: 'assign',
    }));
    setAssignments((p) => [...newAssignments, ...p]);
    setAllAgents((p) =>
      p.map((a) =>
        a.id === agentId ? { ...a, leadsAssigned: (a.leadsAssigned || 0) + leadIds.length } : a
      )
    );
    logActivity(agent, 'assign', `Assigned ${leadIds.length} leads`);
    showToast(`${leadIds.length} leads assigned to ${agent.name}`);
  };

  const handleReassignLeads = (fromAgentId, toAgentId, leadIds) => {
    const from = websiteAgents.find((a) => a.id === fromAgentId);
    const to = websiteAgents.find((a) => a.id === toAgentId);
    if (!from || !to) return;
    setAssignments((p) => [
      ...leadIds.map((leadId) => ({
        id: uid('asg'),
        agentId: toAgentId,
        agentName: to.name,
        leadId,
        at: Date.now(),
        action: 'reassign',
        fromAgentId,
        fromAgentName: from.name,
      })),
      ...p,
    ]);
    setAllAgents((p) =>
      p.map((a) => {
        if (a.id === fromAgentId) return { ...a, leadsAssigned: Math.max(0, (a.leadsAssigned || 0) - leadIds.length) };
        if (a.id === toAgentId) return { ...a, leadsAssigned: (a.leadsAssigned || 0) + leadIds.length };
        return a;
      })
    );
    logActivity(from, 'reassign', `Moved ${leadIds.length} leads to ${to.name}`);
    showToast(`${leadIds.length} leads reassigned to ${to.name}`);
  };

  const counts = {
    agents: websiteAgents.length,
    groups: groups.length,
    active: websiteAgents.filter((a) => a.status === 'Active').length,
    onBreak: websiteAgents.filter((a) => a.status === 'Break').length,
    offline: websiteAgents.filter((a) => a.status === 'Offline').length,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Agents & Employees</h1>
            <p className="text-sm text-brand-ink/50">
              Manage your CRM team for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>
          <button
            onClick={() => setShowAddAgent(true)}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            <Plus size={14} className="transition-transform group-hover:rotate-90" /> Add Employee
          </button>
        </div>

        {/* ═══ KPI STRIP ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Team Overview</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
            <p className="text-[11px] text-brand-ink/40">Click a card to switch tab</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <KpiCard icon={Users2}   label="Total Employees" value={counts.agents}  sub="All team members"  color="purple" active={tab === 'agents'}       onClick={() => setTab('agents')}       delay={0} />
            <KpiCard icon={Users}    label="Groups"          value={counts.groups}  sub="Organized groups"  color="cyan"   active={tab === 'groups'}       onClick={() => setTab('groups')}       delay={40} />
            <KpiCard icon={Activity} label="Active Now"      value={counts.active}  sub="Available"         color="emerald" active={tab === 'availability'} onClick={() => setTab('availability')} delay={80} />
            <KpiCard icon={Zap}      label="Activity Logs"   value={activityLog.length} sub="Recent events"  color="amber"  active={tab === 'activity'}     onClick={() => setTab('activity')}     delay={120} />
            <KpiCard icon={Target}   label="Assignments"     value={assignments.length} sub="All time"      color="rose"   active={tab === 'allocation'}   onClick={() => setTab('allocation')}   delay={160} />
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              const countMap = {
                agents: counts.agents,
                groups: counts.groups,
                availability: counts.active + counts.onBreak,
                activity: activityLog.length,
                performance: counts.agents,
                allocation: counts.agents,
              };
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'}`}>
                    {countMap[key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ TAB CONTENT ═══ */}
        {tab === 'agents' && (
          <AgentsListTab
            agents={websiteAgents}
            websiteLeads={websiteLeads}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetStatus={handleSetStatus}
            onView={(agent) => setViewingAgent(agent)}
            onViewLeads={(name) => navigate('/admin/leads', { state: { filterAgent: name } })}
            groups={groups}
          />
        )}

        {tab === 'groups' && (
          <GroupsTab
            groups={groups}
            agents={websiteAgents}
            onAdd={handleAddGroup}
            onUpdate={handleUpdateGroup}
            onDelete={(g) => setConfirmDelete({
              kind: 'group', id: g.id, name: g.name,
              message: `This will remove the group "${g.name}". Agents stay assigned.`,
            })}
          />
        )}

        {tab === 'availability' && (
          <AvailabilityTab
            agents={websiteAgents}
            onSetStatus={handleSetStatus}
            onView={(agent) => setViewingAgent(agent)}
          />
        )}

        {tab === 'activity' && (
          <ActivityTab
            activityLog={activityLog}
            agents={websiteAgents}
            onClear={() => {
              setActivityLog([]);
              showToast('Activity cleared');
            }}
          />
        )}

        {tab === 'performance' && (
          <PerformanceTab
            agents={websiteAgents}
            websiteLeads={websiteLeads}
            websiteId={activeWebsiteId}
            onView={(agent) => setViewingAgent(agent)}
          />
        )}

        {tab === 'allocation' && (
          <AllocationTab
            agents={websiteAgents}
            websiteLeads={websiteLeads}
            assignments={assignments}
            onAssign={handleAssignLeads}
            onReassign={handleReassignLeads}
            onView={(agent) => setViewingAgent(agent)}
          />
        )}

        {/* ═══ MODALS / DRAWERS ═══ */}
        {showAddAgent && (
          <AgentModal
            mode="add"
            onClose={() => setShowAddAgent(false)}
            onSubmit={handleAdd}
          />
        )}

        {/* ✨ NEW: Full agent detail drawer */}
        {viewingAgent && (
          <AgentDetailDrawer
            agent={viewingAgent}
            groups={groups}
            websiteLeads={websiteLeads}
            activityLog={activityLog}
            assignments={assignments}
            onClose={() => setViewingAgent(null)}
            onEdit={() => {
              // Switch drawer off, open edit modal by passing through the tab's onEdit
              const agent = viewingAgent;
              setViewingAgent(null);
              // pass to AgentsListTab via a shared state — we use a small trick: set tab to agents then set editing via a ref
              setPendingEditAgent(agent);
            }}
            onDelete={() => {
              const agent = viewingAgent;
              setViewingAgent(null);
              handleDelete(agent.id, agent.name);
            }}
            onSetStatus={(status) => {
              handleSetStatus(viewingAgent.id, status);
              setViewingAgent((prev) => (prev ? { ...prev, status } : prev));
            }}
            onViewLeads={() => {
              const name = viewingAgent.name;
              setViewingAgent(null);
              navigate('/admin/leads', { state: { filterAgent: name } });
            }}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title={`Remove ${confirmDelete.kind}?`}
            message={confirmDelete.message}
            confirmLabel={`Remove ${confirmDelete.kind}`}
            onCancel={() => setConfirmDelete(null)}
            onConfirm={performDelete}
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
function KpiCard({ icon: Icon, label, value, sub, color = 'purple', active, onClick, delay = 0 }) {
  const displayValue = useAnimatedCount(value);
  const themes = {
    purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'from-violet-50 via-violet-50/30 to-white', iconBg: 'bg-violet-100 text-brand-purple border-violet-200', bar: 'from-brand-purple to-brand-magenta', glow: 'bg-brand-purple/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]', valueColor: 'text-brand-purple', ring: 'ring-violet-300' },
    emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'from-emerald-50 via-emerald-50/30 to-white', iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'from-emerald-500 to-emerald-400', glow: 'bg-emerald-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]', valueColor: 'text-emerald-600', ring: 'ring-emerald-300' },
    amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'from-amber-50 via-amber-50/30 to-white', iconBg: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'from-amber-500 to-orange-400', glow: 'bg-amber-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]', valueColor: 'text-amber-600', ring: 'ring-amber-300' },
    rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'from-rose-50 via-rose-50/30 to-white', iconBg: 'bg-rose-100 text-brand-magenta border-rose-200', bar: 'from-brand-magenta to-brand-purple', glow: 'bg-brand-magenta/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]', valueColor: 'text-brand-magenta', ring: 'ring-rose-300' },
    cyan:    { border: 'border-cyan-200 hover:border-cyan-400', bg: 'from-cyan-50 via-cyan-50/30 to-white', iconBg: 'bg-cyan-100 text-cyan-600 border-cyan-200', bar: 'from-cyan-500 to-blue-400', glow: 'bg-cyan-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(6,182,212,0.4)]', valueColor: 'text-cyan-600', ring: 'ring-cyan-300' },
  };
  const t = themes[color];

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/30 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 hover:-translate-y-1.5 animate-fade-slide-in ${t.border} ${active ? `ring-2 ${t.ring} ${t.shadow}` : t.shadow}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100 ${active ? 'scale-x-100' : ''}`} />
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${active ? 'opacity-100' : ''}`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${active ? 'opacity-100' : ''}`} />
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${t.iconBg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} />
        </span>
        {active && (
          <span className="flex items-center gap-1 rounded-full bg-brand-magenta/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-magenta ring-1 ring-brand-magenta/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-magenta opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-magenta" />
            </span>
            Active
          </span>
        )}
      </div>

      <div className="relative z-10 w-full">
        <p className={`font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>{displayValue}</p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </button>
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
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display.toLocaleString();
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1 — AGENTS LIST
   ═══════════════════════════════════════════════════════════════ */
function AgentsListTab({ agents, websiteLeads, onAdd, onEdit, onDelete, onSetStatus, onView, onViewLeads, groups }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${a.name} ${a.phone} ${a.email || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [agents, statusFilter, search]);

  const handleSubmit = (data) => {
    if (editingAgent) {
      onEdit(editingAgent.id, data);
      setEditingAgent(null);
    } else {
      onAdd(data);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full rounded-full border border-brand-lilac bg-white py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-lilac">
              <X size={14} className="text-brand-ink/50" />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setStatusOpen((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
          >
            <Filter size={14} className="text-brand-magenta" />
            Status: <span className="font-semibold text-brand-magenta">{statusFilter}</span>
          </button>
          {statusOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                {['All', 'Active', 'Break', 'Offline'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setStatusOpen(false); }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${statusFilter === s ? 'bg-brand-magenta/10 font-semibold text-brand-magenta' : 'text-brand-ink/70 hover:bg-brand-lilac/40'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-full border border-brand-lilac bg-white p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-full p-1.5 ${viewMode === 'grid' ? 'bg-brand-magenta/10 text-brand-magenta' : 'text-brand-ink/50 hover:bg-brand-lilac/30'}`}
          ><Grid3x3 size={14} /></button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-full p-1.5 ${viewMode === 'list' ? 'bg-brand-magenta/10 text-brand-magenta' : 'text-brand-ink/50 hover:bg-brand-lilac/30'}`}
          ><List size={14} /></button>
        </div>

        <button
          onClick={() => { setEditingAgent(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={14} /> Add Employee
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          onAdd={() => { setEditingAgent(null); setShowModal(true); }}
          hasFilters={!!search || statusFilter !== 'All'}
          onClear={() => { setSearch(''); setStatusFilter('All'); }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              websiteLeads={websiteLeads}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              onView={() => onView(agent)}
              onEdit={() => { setEditingAgent(agent); setShowModal(true); setMenuOpenId(null); }}
              onDelete={() => { onDelete(agent.id, agent.name); setMenuOpenId(null); }}
              onSetStatus={(s) => { onSetStatus(agent.id, s); setMenuOpenId(null); }}
              onViewLeads={() => onViewLeads(agent.name)}
              groups={groups}
            />
          ))}
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <ul className="divide-y divide-brand-lilac/40">
            {filtered.map((agent) => (
              <AgentRow
                key={agent.id}
                agent={agent}
                websiteLeads={websiteLeads}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onView={() => onView(agent)}
                onEdit={() => { setEditingAgent(agent); setShowModal(true); setMenuOpenId(null); }}
                onDelete={() => { onDelete(agent.id, agent.name); setMenuOpenId(null); }}
                onSetStatus={(s) => { onSetStatus(agent.id, s); setMenuOpenId(null); }}
                onViewLeads={() => onViewLeads(agent.name)}
              />
            ))}
          </ul>
        </div>
      )}

      {showModal && (
        <AgentModal
          mode={editingAgent ? 'edit' : 'add'}
          initial={editingAgent || {}}
          onClose={() => { setShowModal(false); setEditingAgent(null); }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ═══ AGENT CARD (GRID) ═══ */
function AgentCard({ agent, websiteLeads, menuOpenId, setMenuOpenId, onView, onEdit, onDelete, onSetStatus, onViewLeads, groups }) {
  const stats = useMemo(() => {
    const agentLeads = websiteLeads.filter((l) => l.assignedAgent === agent.name);
    const won = agentLeads.filter((l) => l.status === 'Won').length;
    return {
      leads: agentLeads.length,
      won,
      conversion: agentLeads.length ? Math.round((won / agentLeads.length) * 100) : 0,
    };
  }, [websiteLeads, agent.name]);

  const agentGroups = groups.filter((g) => g.memberIds?.includes(agent.id));
  const style = STATUS_STYLES[agent.status] || STATUS_STYLES.Offline;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-lilac bg-white p-4 shadow-[0_1px_3px_rgba(139,47,214,0.04)] transition-all hover:-translate-y-1 hover:border-brand-magenta/40 hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.35)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-magenta/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start gap-3">
        <button
          onClick={onView}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-sm font-bold text-white shadow-md transition-transform hover:scale-110"
          title="View details"
        >
          {initials(agent.name)}
        </button>
        <div className="min-w-0 flex-1">
          <button onClick={onView} className="block truncate text-left font-semibold text-brand-ink hover:text-brand-magenta">
            {agent.name}
          </button>
          <p className="truncate text-xs text-brand-ink/50">{agent.phone}</p>
          {agent.email && <p className="truncate text-xs text-brand-ink/40">{agent.email}</p>}
        </div>

        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${style.chip}`}>
          <span className="inline-flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {agent.status}
          </span>
        </span>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpenId(menuOpenId === agent.id ? null : agent.id)}
            className="rounded-lg p-1.5 text-brand-ink/40 hover:bg-brand-lilac"
            title="Change status"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === agent.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={CheckCircle2}  label="Set Active"  onClick={() => onSetStatus('Active')} />
                <MenuItem icon={Pause}         label="Set Break"   onClick={() => onSetStatus('Break')} />
                <MenuItem icon={LogOut}        label="Set Offline" onClick={() => onSetStatus('Offline')} />
              </div>
            </>
          )}
        </div>
      </div>

      {agentGroups.length > 0 && (
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          {agentGroups.map((g) => (
            <span key={g.id} className="rounded-full bg-brand-lilac/60 px-2 py-0.5 text-[10px] font-bold text-brand-purple">
              {g.name}
            </span>
          ))}
        </div>
      )}

      <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
        <StatBox label="Leads" value={stats.leads} tone="purple" />
        <StatBox label="Won" value={stats.won} tone="emerald" />
        <StatBox label="Conv." value={`${stats.conversion}%`} tone="rose" />
      </div>

      <div className="relative mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
            style={{ width: `${stats.conversion}%` }}
          />
        </div>
      </div>

      {/* ✨ Actions — Call, Leads, View, Edit, Delete all directly visible */}
      <div className="relative mt-4 flex gap-1.5">
        <button
          onClick={() => { window.location.href = `tel:${agent.phone}`; }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
          title="Call employee"
        >
          <Phone size={12} /> Call
        </button>
        <button
          onClick={onView}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="View details"
        >
          <Eye size={12} /> View
        </button>
        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-violet-50 hover:text-brand-purple"
          title="Edit employee"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 transition-all hover:border-rose-400 hover:bg-rose-100"
          title="Remove employee"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ═══ AGENT ROW (LIST) ═══ */
function AgentRow({ agent, websiteLeads, menuOpenId, setMenuOpenId, onView, onEdit, onDelete, onSetStatus, onViewLeads }) {
  const stats = useMemo(() => {
    const agentLeads = websiteLeads.filter((l) => l.assignedAgent === agent.name);
    const won = agentLeads.filter((l) => l.status === 'Won').length;
    return {
      leads: agentLeads.length,
      won,
      conversion: agentLeads.length ? Math.round((won / agentLeads.length) * 100) : 0,
    };
  }, [websiteLeads, agent.name]);

  const style = STATUS_STYLES[agent.status] || STATUS_STYLES.Offline;

  return (
    <li className="group flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
      <button
        onClick={onView}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-xs font-bold text-white transition-transform hover:scale-110"
        title="View details"
      >
        {initials(agent.name)}
      </button>
      <div className="min-w-0 flex-1">
        <button onClick={onView} className="block truncate text-left text-sm font-semibold text-brand-ink hover:text-brand-magenta">
          {agent.name}
        </button>
        <p className="truncate text-[11px] text-brand-ink/50">{agent.phone}</p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="text-brand-ink/40">Leads</p>
        <p className="font-semibold text-brand-ink">{stats.leads}</p>
      </div>
      <div className="hidden shrink-0 text-xs md:block">
        <p className="text-brand-ink/40">Won</p>
        <p className="font-semibold text-emerald-600">{stats.won}</p>
      </div>
      <div className="hidden shrink-0 text-xs md:block">
        <p className="text-brand-ink/40">Conv.</p>
        <p className="font-semibold text-brand-magenta">{stats.conversion}%</p>
      </div>

      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${style.chip}`}>
        <span className="inline-flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {agent.status}
        </span>
      </span>

      {/* ✨ Visible action buttons on every row */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
          title="View details"
        >
          <Eye size={12} /> View
        </button>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-brand-purple transition-all hover:bg-violet-100"
          title="Edit Employee"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-500 transition-all hover:bg-rose-100"
          title="Remove Employee"
        >
          <Trash2 size={12} /> Remove
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpenId(menuOpenId === agent.id ? null : agent.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/40 hover:bg-brand-lilac"
            title="Change status"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpenId === agent.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                <MenuItem icon={CheckCircle2} label="Set Active"  onClick={() => onSetStatus('Active')} />
                <MenuItem icon={Pause}        label="Set Break"   onClick={() => onSetStatus('Break')} />
                <MenuItem icon={LogOut}       label="Set Offline" onClick={() => onSetStatus('Offline')} />
              </div>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ✨ NEW: FULL AGENT DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════ */
function AgentDetailDrawer({ agent, groups, websiteLeads, activityLog, assignments, onClose, onEdit, onDelete, onSetStatus, onViewLeads }) {
  const style = STATUS_STYLES[agent.status] || STATUS_STYLES.Offline;

  /* Compute all metrics for this agent */
  const metrics = useMemo(() => {
    const agentLeads = websiteLeads.filter((l) => l.assignedAgent === agent.name);
    const won = agentLeads.filter((l) => l.status === 'Won').length;
    const fresh = agentLeads.filter((l) => l.status === 'Fresh').length;
    const followUp = agentLeads.filter((l) => l.status === 'Follow Up').length;
    const missed = agentLeads.filter((l) => l.status === 'Missed').length;
    const lost = agentLeads.filter((l) => l.status === 'Lost').length;
    const conversion = agentLeads.length ? Math.round((won / agentLeads.length) * 100) : 0;

    const calls = (CALLS || []).filter((c) => c.agentId === agent.id);
    const inbound = calls.filter((c) => c.type === 'inbound').length;
    const outbound = calls.filter((c) => c.type === 'outbound').length;
    const connected = calls.filter((c) => c.status === 'connected').length;
    const missedCalls = calls.filter((c) => c.status === 'missed').length;
    const totalDuration = calls.reduce((sum, c) => {
      const [m, s] = (c.duration || '0:0').split(':').map(Number);
      return sum + m * 60 + s;
    }, 0);

    const followUps = (FOLLOW_UPS || []).filter((f) => f.agentName === agent.name);
    const completedFollowUps = followUps.filter((f) => f.status === 'Completed').length;
    const pendingFollowUps = followUps.filter((f) => f.status === 'Today' || f.status === 'Overdue').length;

    return {
      leads: agentLeads.length,
      won, fresh, followUp, missed, lost, conversion,
      calls: calls.length,
      inbound, outbound, connected, missedCalls,
      totalDurationMin: Math.floor(totalDuration / 60),
      followUps: followUps.length,
      completedFollowUps, pendingFollowUps,
      agentLeads,
      recentLeads: [...agentLeads].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5),
    };
  }, [agent, websiteLeads]);

  /* Groups this agent belongs to */
  const agentGroups = useMemo(
    () => groups.filter((g) => g.memberIds?.includes(agent.id)),
    [groups, agent.id]
  );

  /* This agent's activity */
  const agentActivity = useMemo(
    () => activityLog.filter((log) => log.agentId === agent.id).slice(0, 10),
    [activityLog, agent.id]
  );

  /* Assignment history for this agent */
  const agentAssignments = useMemo(
    () => assignments.filter((a) => a.agentId === agent.id).slice(0, 10),
    [assignments, agent.id]
  );

  const activityIcon = {
    login:   { icon: LogIn,  color: 'bg-emerald-100 text-emerald-600' },
    logout:  { icon: LogOut, color: 'bg-slate-100 text-slate-600' },
    break:   { icon: Pause,  color: 'bg-amber-100 text-amber-600' },
    assign:  { icon: UserPlus, color: 'bg-violet-100 text-brand-purple' },
    reassign:{ icon: ArrowRightLeft, color: 'bg-cyan-100 text-cyan-600' },
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-panel animate-slide-in-right">
        {/* ═══ Header ═══ */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-lilac bg-gradient-to-r from-brand-mist/60 to-white px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              <UserCog size={16} />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">Employee Details</p>
              <h2 className="font-display text-base font-bold text-brand-ink">{agent.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* ═══ Profile card ═══ */}
          <div className="relative overflow-hidden rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/40 to-white p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-magenta/10 blur-3xl" />

            <div className="relative flex flex-wrap items-start gap-4">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-2xl font-bold text-white shadow-md">
                {initials(agent.name)}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-bold text-brand-ink">{agent.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${style.chip}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {agent.status}
                  </span>
                  {agentGroups.map((g) => (
                    <span key={g.id} className="rounded-full bg-brand-lilac/70 px-2.5 py-1 text-[11px] font-bold text-brand-purple">
                      {g.name}
                    </span>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-brand-ink/70">
                    <Phone size={14} className="shrink-0 text-brand-magenta" />
                    <span className="truncate font-medium">{agent.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-ink/70">
                    <Mail size={14} className="shrink-0 text-brand-magenta" />
                    <span className="truncate font-medium">{agent.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-ink/70">
                    <Calendar size={14} className="shrink-0 text-brand-magenta" />
                    <span className="font-medium">Joined {formatDate(agent.joinedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-ink/70">
                    <HashIcon size={14} className="shrink-0 text-brand-magenta" />
                    <span className="truncate font-mono text-xs">{agent.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="relative mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => { window.location.href = `tel:${agent.phone}`; }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Phone size={13} /> Call
              </button>
              <button
                onClick={onViewLeads}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
              >
                <Users2 size={13} /> View Leads
              </button>
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-brand-purple hover:bg-violet-100"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>

          {/* ═══ Status switcher ═══ */}
          <div className="card !p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Change Status</p>
            <div className="flex gap-2">
              {['Active', 'Break', 'Offline'].map((s) => {
                const active = agent.status === s;
                const st = STATUS_STYLES[s];
                return (
                  <button
                    key={s}
                    onClick={() => onSetStatus(s)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                        : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ Lead pipeline metrics ═══ */}
          <div className="card !p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-brand-magenta">
                  <Target size={14} />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-brand-ink">Lead Pipeline</h3>
                  <p className="text-[10px] text-brand-ink/50">All leads assigned to {agent.name.split(' ')[0]}</p>
                </div>
              </div>
              <span className="font-display text-2xl font-bold text-brand-magenta">{metrics.conversion}%</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <DetailStat label="Total Leads"  value={metrics.leads}    tone="purple"  icon={Users2} />
              <DetailStat label="Won"          value={metrics.won}      tone="emerald" icon={Award} />
              <DetailStat label="Fresh"        value={metrics.fresh}    tone="amber"   icon={SparklesIcon} />
              <DetailStat label="Follow-up"    value={metrics.followUp} tone="purple"  icon={Calendar} />
              <DetailStat label="Missed"       value={metrics.missed}   tone="rose"    icon={PhoneMissed} />
              <DetailStat label="Lost"         value={metrics.lost}     tone="rose"    icon={X} />
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-brand-ink/60">Conversion progress</span>
                <span className="font-mono font-bold text-brand-magenta">{metrics.conversion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                  style={{ width: `${metrics.conversion}%` }}
                />
              </div>
            </div>
          </div>

          {/* ═══ Calls metrics ═══ */}
          <div className="card !p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
                  <Phone size={14} />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-brand-ink">Calling Activity</h3>
                  <p className="text-[10px] text-brand-ink/50">{metrics.calls} calls logged</p>
                </div>
              </div>
              <span className="font-mono text-xs text-brand-ink/50">{metrics.totalDurationMin}m total</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <DetailStat label="Total"     value={metrics.calls}       tone="purple"  icon={Phone} />
              <DetailStat label="Inbound"   value={metrics.inbound}     tone="emerald" icon={PhoneIncoming} />
              <DetailStat label="Outbound"  value={metrics.outbound}    tone="purple"  icon={PhoneOutgoing} />
              <DetailStat label="Connected" value={metrics.connected}   tone="emerald" icon={CheckCircle2} />
              <DetailStat label="Missed"    value={metrics.missedCalls} tone="rose"    icon={PhoneMissed} />
            </div>
          </div>

          {/* ═══ Follow-ups ═══ */}
          <div className="card !p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Calendar size={14} />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-brand-ink">Follow-ups</h3>
                  <p className="text-[10px] text-brand-ink/50">{metrics.followUps} follow-ups tracked</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <DetailStat label="Total"     value={metrics.followUps}         tone="purple"  icon={Calendar} />
              <DetailStat label="Completed" value={metrics.completedFollowUps} tone="emerald" icon={CheckCircle2} />
              <DetailStat label="Pending"   value={metrics.pendingFollowUps}   tone="rose"    icon={Clock} />
            </div>
          </div>

          {/* ═══ Assigned groups ═══ */}
          {agentGroups.length > 0 && (
            <div className="card !p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                  <Users size={14} />
                </span>
                <h3 className="font-display text-sm font-bold text-brand-ink">Groups</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {agentGroups.map((g) => (
                  <div key={g.id} className="flex items-center gap-2 rounded-xl border border-brand-lilac bg-brand-mist/30 px-3 py-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[9px] font-bold text-white">
                      {initials(g.name)}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-brand-ink">{g.name}</p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-brand-magenta">{g.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Recent leads ═══ */}
          {metrics.recentLeads.length > 0 && (
            <div className="card !p-0 overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-brand-magenta">
                    <Users2 size={14} />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold text-brand-ink">Recent Leads</h3>
                    <p className="text-[10px] text-brand-ink/50">Latest 5 assigned leads</p>
                  </div>
                </div>
                <button
                  onClick={onViewLeads}
                  className="group inline-flex items-center gap-1 text-[11px] font-semibold text-brand-magenta hover:underline"
                >
                  View all <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <ul className="divide-y divide-brand-lilac/40">
                {metrics.recentLeads.map((lead) => {
                  const leadStyle = {
                    Fresh: 'bg-violet-100 text-brand-purple',
                    'Follow Up': 'bg-amber-100 text-amber-600',
                    Missed: 'bg-rose-100 text-brand-magenta',
                    Won: 'bg-emerald-100 text-emerald-600',
                    Lost: 'bg-gray-100 text-gray-500',
                    Qualified: 'bg-blue-100 text-blue-600',
                  }[lead.status] || 'bg-slate-100 text-slate-500';

                  return (
                    <li key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-brand-mist/30">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                        {initials(lead.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-ink">{lead.name}</p>
                        <p className="truncate text-[11px] text-brand-ink/50">{lead.mobile}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${leadStyle}`}>
                        {lead.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* ═══ Activity timeline ═══ */}
          {agentActivity.length > 0 && (
            <div className="card !p-0 overflow-hidden">
              <div className="border-b border-brand-lilac/60 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Activity size={14} />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold text-brand-ink">Recent Activity</h3>
                    <p className="text-[10px] text-brand-ink/50">Last 10 events</p>
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-brand-lilac/40">
                {agentActivity.map((log) => {
                  const meta = activityIcon[log.type] || activityIcon.login;
                  const Icon = meta.icon;
                  return (
                    <li key={log.id} className="flex items-center gap-3 px-5 py-3">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                        <Icon size={13} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-brand-ink">{log.detail}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-brand-ink/40">{formatDateTime(log.at)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* ═══ Assignment history ═══ */}
          {agentAssignments.length > 0 && (
            <div className="card !p-0 overflow-hidden">
              <div className="border-b border-brand-lilac/60 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                    <ArrowRightLeft size={14} />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold text-brand-ink">Assignment History</h3>
                    <p className="text-[10px] text-brand-ink/50">Recent lead movements</p>
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-brand-lilac/40">
                {agentAssignments.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.action === 'reassign' ? 'bg-cyan-100 text-cyan-600' : 'bg-violet-100 text-brand-purple'}`}>
                      {a.action === 'reassign' ? <ArrowRightLeft size={13} /> : <UserPlus size={13} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-brand-ink">
                        {a.action === 'reassign' ? `Received from ${a.fromAgentName}` : 'Assigned new lead'}
                      </p>
                      <p className="font-mono text-[10px] text-brand-ink/40">{formatDateTime(a.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ═══ Footer summary ═══ */}
          <div className="rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">Summary</p>
            <p className="mt-1.5 text-sm text-brand-ink/80">
              <strong>{agent.name}</strong> is currently <strong>{agent.status.toLowerCase()}</strong> with{' '}
              <strong>{metrics.leads}</strong> leads assigned, <strong>{metrics.won}</strong> won, and a{' '}
              <strong>{metrics.conversion}%</strong> conversion rate. Over {metrics.calls} calls and{' '}
              {metrics.followUps} follow-ups recorded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Detail stat tile (used in drawer) ── */
function DetailStat({ label, value, tone = 'purple', icon: Icon }) {
  const tones = {
    purple:  { fg: 'text-brand-purple',  bg: 'bg-violet-50',  border: 'border-violet-100' },
    emerald: { fg: 'text-emerald-600',   bg: 'bg-emerald-50', border: 'border-emerald-100' },
    amber:   { fg: 'text-amber-600',     bg: 'bg-amber-50',   border: 'border-amber-100' },
    rose:    { fg: 'text-brand-magenta', bg: 'bg-rose-50',    border: 'border-rose-100' },
  };
  const t = tones[tone];
  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} p-3`}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</p>
        {Icon && <Icon size={12} className={t.fg} />}
      </div>
      <p className={`mt-1 font-display text-lg font-bold ${t.fg} tabular-nums`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

/* Placeholder icon (Sparkles already imported as SparklesIcon needed) */
function SparklesIcon(props) {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 — GROUPS
   ═══════════════════════════════════════════════════════════════ */
function GroupsTab({ groups, agents, onAdd, onUpdate, onDelete }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [filterType, setFilterType] = useState('All');

  const filtered = useMemo(
    () => (filterType === 'All' ? groups : groups.filter((g) => g.type === filterType)),
    [groups, filterType]
  );

  const handleSubmit = (data) => {
    if (editingGroup) onUpdate(editingGroup.id, data);
    else onAdd(data);
    setShowCreate(false);
    setEditingGroup(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', ...GROUP_TYPES].map((t) => {
            const active = filterType === t;
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => { setEditingGroup(null); setShowCreate(true); }}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={14} /> Create Group
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
            <Users size={22} />
          </span>
          <p className="font-display text-base font-semibold text-brand-ink">
            {groups.length === 0 ? 'No groups yet' : `No ${filterType} groups`}
          </p>
          <p className="max-w-sm text-sm text-brand-ink/50">
            Organize employees into groups by department, location, campaign, or business function.
          </p>
          <button
            onClick={() => { setEditingGroup(null); setShowCreate(true); }}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card"
          >
            <Plus size={16} /> Create First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((group) => {
            const members = agents.filter((a) => group.memberIds?.includes(a.id));
            return (
              <GroupCard
                key={group.id}
                group={group}
                members={members}
                onEdit={() => { setEditingGroup(group); setShowCreate(true); }}
                onDelete={() => onDelete(group)}
              />
            );
          })}
        </div>
      )}

      {showCreate && (
        <GroupModal
          mode={editingGroup ? 'edit' : 'add'}
          initial={editingGroup || {}}
          agents={agents}
          onClose={() => { setShowCreate(false); setEditingGroup(null); }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function GroupCard({ group, members, onEdit, onDelete }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-lilac bg-white p-4 shadow-[0_1px_3px_rgba(139,47,214,0.04)] transition-all hover:-translate-y-1 hover:border-brand-magenta/40 hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.35)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-magenta to-brand-purple transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
            <Users size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-brand-ink">{group.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-brand-magenta">{group.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/60 hover:bg-brand-lilac hover:text-brand-purple">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {group.description && (
        <p className="relative mt-3 line-clamp-2 text-xs text-brand-ink/60">{group.description}</p>
      )}

      <div className="relative mt-4 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </p>
        {members.length > 0 && (
          <div className="flex -space-x-1.5">
            {members.slice(0, 4).map((m) => (
              <span key={m.id} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-magenta to-brand-purple text-[9px] font-bold text-white shadow-sm">
                {initials(m.name)}
              </span>
            ))}
            {members.length > 4 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-lilac text-[9px] font-bold text-brand-purple">
                +{members.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3 — AVAILABILITY
   ═══════════════════════════════════════════════════════════════ */
function AvailabilityTab({ agents, onSetStatus, onView }) {
  const grouped = {
    Active: agents.filter((a) => a.status === 'Active'),
    Break: agents.filter((a) => a.status === 'Break'),
    Offline: agents.filter((a) => a.status === 'Offline'),
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {(['Active', 'Break', 'Offline']).map((status) => {
        const style = STATUS_STYLES[status];
        const list = grouped[status];
        return (
          <div key={status} className="card !p-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${style.chip}`}>
                  {status === 'Active' && <CheckCircle2 size={16} />}
                  {status === 'Break' && <Pause size={16} />}
                  {status === 'Offline' && <LogOut size={16} />}
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-brand-ink">{status}</h3>
                  <p className="text-[11px] text-brand-ink/50">
                    {list.length} employee{list.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {list.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-brand-ink/40">
                No employees {status.toLowerCase()}
              </div>
            ) : (
              <ul className="divide-y divide-brand-lilac/40">
                {list.map((agent) => (
                  <li key={agent.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                    <button
                      onClick={() => onView(agent)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white transition-transform hover:scale-110"
                      title="View details"
                    >
                      {initials(agent.name)}
                    </button>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => onView(agent)} className="block truncate text-left text-sm font-semibold text-brand-ink hover:text-brand-magenta">
                        {agent.name}
                      </button>
                      <p className="truncate text-[11px] text-brand-ink/50">{agent.phone}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {status !== 'Active' && (
                        <button
                          onClick={() => onSetStatus(agent.id, 'Active')}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          title="Set Active"
                        >
                          <CheckCircle2 size={12} />
                        </button>
                      )}
                      {status !== 'Break' && (
                        <button
                          onClick={() => onSetStatus(agent.id, 'Break')}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                          title="Set Break"
                        >
                          <Pause size={12} />
                        </button>
                      )}
                      {status !== 'Offline' && (
                        <button
                          onClick={() => onSetStatus(agent.id, 'Offline')}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          title="Set Offline"
                        >
                          <LogOut size={12} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4 — ACTIVITY LOG
   ═══════════════════════════════════════════════════════════════ */
function ActivityTab({ activityLog, agents, onClear }) {
  const [typeFilter, setTypeFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');

  const filtered = useMemo(() => {
    return activityLog.filter((log) => {
      if (typeFilter !== 'All' && log.type !== typeFilter) return false;
      if (agentFilter !== 'All' && log.agentId !== agentFilter) return false;
      return true;
    });
  }, [activityLog, typeFilter, agentFilter]);

  const activityIcon = {
    login:   { icon: LogIn,  color: 'bg-emerald-100 text-emerald-600', label: 'Login' },
    logout:  { icon: LogOut, color: 'bg-slate-100 text-slate-600',     label: 'Logout' },
    break:   { icon: Pause,  color: 'bg-amber-100 text-amber-600',     label: 'Break' },
    assign:  { icon: UserPlus, color: 'bg-violet-100 text-brand-purple', label: 'Assign' },
    reassign:{ icon: ArrowRightLeft, color: 'bg-cyan-100 text-cyan-600', label: 'Reassign' },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'login', 'logout', 'break', 'assign', 'reassign'].map((t) => {
            const active = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  active
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="rounded-full border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        >
          <option value="All">All employees</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {activityLog.length > 0 && (
          <button
            onClick={onClear}
            className="ml-auto rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
          >
            Clear log
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
            <Activity size={22} />
          </span>
          <p className="font-display text-base font-semibold text-brand-ink">No activity yet</p>
          <p className="max-w-sm text-sm text-brand-ink/50">
            Login, break, assignment, and status changes will appear here.
          </p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="border-b border-brand-lilac/60 px-5 py-4">
            <h3 className="font-display text-sm font-bold text-brand-ink">Activity Timeline</h3>
            <p className="text-[11px] text-brand-ink/50">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ul className="divide-y divide-brand-lilac/40">
            {filtered.slice(0, 100).map((log) => {
              const meta = activityIcon[log.type] || activityIcon.login;
              const Icon = meta.icon;
              return (
                <li key={log.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                    <Icon size={14} />
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[10px] font-bold text-white">
                    {initials(log.agentName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{log.agentName}</p>
                    <p className="truncate text-[11px] text-brand-ink/60">{log.detail}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span className="hidden shrink-0 font-mono text-[10px] text-brand-ink/40 sm:block">
                    {formatDateTime(log.at)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5 — PERFORMANCE
   ═══════════════════════════════════════════════════════════════ */
function PerformanceTab({ agents, websiteLeads, websiteId, onView }) {
  const [sortBy, setSortBy] = useState('conversion');

  const data = useMemo(() => {
    return agents.map((agent) => {
      const agentLeads = websiteLeads.filter((l) => l.assignedAgent === agent.name);
      const won = agentLeads.filter((l) => l.status === 'Won').length;
      const calls = (CALLS || []).filter((c) => c.agentId === agent.id).length;
      const followUps = (FOLLOW_UPS || []).filter((f) => f.agentName === agent.name).length;
      return {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        leads: agentLeads.length,
        won,
        calls,
        followUps,
        conversion: agentLeads.length ? Math.round((won / agentLeads.length) * 100) : 0,
        agent,
      };
    });
  }, [agents, websiteLeads]);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => b[sortBy] - a[sortBy]);
    return copy;
  }, [data, sortBy]);

  const maxLeads = Math.max(...data.map((d) => d.leads), 1);
  const totalLeads = data.reduce((s, d) => s + d.leads, 0);
  const totalWon = data.reduce((s, d) => s + d.won, 0);

  return (
    <div className="space-y-4">
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award size={16} />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-brand-ink">Top Performers</h3>
              <p className="text-[11px] text-brand-ink/50">Ranked by {sortBy}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { key: 'leads',      label: 'Leads' },
              { key: 'won',        label: 'Won' },
              { key: 'conversion', label: 'Conv.%' },
              { key: 'calls',      label: 'Calls' },
            ].map((s) => {
              const active = sortBy === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-brand-ink/40">No employees to rank</div>
        ) : (
          <ul className="divide-y divide-brand-lilac/40">
            {sorted.map((a, i) => {
              const rankIcon = i === 0 ? Crown : i === 1 ? Star : i === 2 ? Award : null;
              const RankIcon = rankIcon;
              return (
                <li key={a.id} className="group flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm ${
                    i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                    : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500'
                    : i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900'
                    : 'bg-gradient-to-br from-brand-magenta to-brand-purple'
                  }`}>
                    {RankIcon ? <RankIcon size={14} /> : `#${i + 1}`}
                  </span>
                  <button
                    onClick={() => onView(a.agent)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-xs font-bold text-white shadow-sm transition-transform hover:scale-110"
                    title="View details"
                  >
                    {initials(a.name)}
                  </button>
                  <div className="min-w-0 flex-1">
                    <button onClick={() => onView(a.agent)} className="block truncate text-left text-sm font-semibold text-brand-ink hover:text-brand-magenta">
                      {a.name}
                    </button>
                    <p className="truncate text-[11px] text-brand-ink/50">
                      {a.leads} leads · {a.won} won · {a.calls} calls
                    </p>
                  </div>

                  <div className="hidden md:flex md:w-32 md:items-center md:gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-lilac">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                        style={{ width: `${(a.leads / maxLeads) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 text-center">
                    <div>
                      <p className="font-mono text-[10px] uppercase text-brand-ink/40">Leads</p>
                      <p className="font-display text-sm font-bold text-brand-ink">{a.leads}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase text-brand-ink/40">Won</p>
                      <p className="font-display text-sm font-bold text-emerald-600">{a.won}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase text-brand-ink/40">Conv.</p>
                      <p className="font-display text-sm font-bold text-brand-magenta">{a.conversion}%</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onView(a.agent)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-ink hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
                  >
                    <Eye size={12} /> View
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat icon={Target}     label="Total Leads Assigned" value={totalLeads}  color="purple" />
        <MiniStat icon={Award}      label="Total Won"            value={totalWon}    color="emerald" />
        <MiniStat icon={TrendingUp} label="Overall Conversion"   value={`${totalLeads ? Math.round((totalWon / totalLeads) * 100) : 0}%`} color="rose" />
        <MiniStat icon={Users}      label="Active Employees"     value={agents.filter((a) => a.status === 'Active').length} color="amber" />
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color = 'purple' }) {
  const colors = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-brand-magenta',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] text-brand-ink/50">{label}</p>
        <p className="font-display text-lg font-bold text-brand-ink tabular-nums">{value}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 6 — LEAD ALLOCATION
   ═══════════════════════════════════════════════════════════════ */
function AllocationTab({ agents, websiteLeads, assignments, onAssign, onReassign, onView }) {
  const [assignModal, setAssignModal] = useState(null);
  const [reassignModal, setReassignModal] = useState(null);

  const unassignedLeads = websiteLeads.filter((l) => !l.assignedAgent || l.assignedAgent === 'Unassigned');

  const agentsWithLeads = useMemo(() => {
    return agents.map((agent) => ({
      ...agent,
      leads: websiteLeads.filter((l) => l.assignedAgent === agent.name),
    })).sort((a, b) => b.leads.length - a.leads.length);
  }, [agents, websiteLeads]);

  const maxLeads = Math.max(...agentsWithLeads.map((a) => a.leads.length), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <ActionTile
          icon={UserPlus}
          title="Assign Leads"
          subtitle={`${unassignedLeads.length} unassigned`}
          color="rose"
          disabled={unassignedLeads.length === 0}
          onClick={() => setAssignModal({ agentId: null })}
        />
        <ActionTile
          icon={ArrowRightLeft}
          title="Reassign Leads"
          subtitle="Move between employees"
          color="purple"
          disabled={agentsWithLeads.length < 2}
          onClick={() => setReassignModal({ fromAgentId: agentsWithLeads[0]?.id })}
        />
        <ActionTile
          icon={BarChart3}
          title="Allocation History"
          subtitle={`${assignments.length} events`}
          color="emerald"
          onClick={() => {}}
        />
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-brand-magenta">
              <Target size={16} />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-brand-ink">Lead Distribution</h3>
              <p className="text-[11px] text-brand-ink/50">How many leads each employee holds</p>
            </div>
          </div>
          <span className="rounded-full bg-brand-lilac/60 px-3 py-1 text-[10px] font-bold text-brand-purple">
            {agents.length} employee{agents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {agentsWithLeads.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-brand-ink/40">No employees yet</div>
        ) : (
          <ul className="divide-y divide-brand-lilac/40">
            {agentsWithLeads.map((agent) => (
              <li key={agent.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                <button
                  onClick={() => onView(agent)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-xs font-bold text-white shadow-sm transition-transform hover:scale-110"
                  title="View details"
                >
                  {initials(agent.name)}
                </button>
                <div className="min-w-0 flex-1">
                  <button onClick={() => onView(agent)} className="block truncate text-left text-sm font-semibold text-brand-ink hover:text-brand-magenta">
                    {agent.name}
                  </button>
                  <p className="truncate text-[11px] text-brand-ink/50">
                    {agent.leads.length} lead{agent.leads.length !== 1 ? 's' : ''} · {agent.status}
                  </p>
                </div>

                <div className="hidden flex-1 sm:block">
                  <div className="h-2 overflow-hidden rounded-full bg-brand-lilac">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple transition-all duration-1000"
                      style={{ width: `${(agent.leads.length / maxLeads) * 100}%` }}
                    />
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-brand-lilac px-3 py-1 text-xs font-bold text-brand-purple tabular-nums">
                  {agent.leads.length}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => onView(agent)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-magenta/40 hover:bg-brand-magenta/5 hover:text-brand-magenta"
                    title="View details"
                  >
                    <Eye size={11} /> View
                  </button>
                  <button
                    onClick={() => setAssignModal({ agentId: agent.id })}
                    disabled={unassignedLeads.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 transition-all hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Assign more leads"
                  >
                    <UserPlus size={11} /> Assign
                  </button>
                  <button
                    onClick={() => setReassignModal({ fromAgentId: agent.id })}
                    disabled={agent.leads.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-brand-purple transition-all hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Reassign leads away"
                  >
                    <ArrowRightLeft size={11} /> Reassign
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {assignModal && (
        <AssignLeadsModal
          agents={agents}
          unassignedLeads={unassignedLeads}
          preselectedAgentId={assignModal.agentId}
          onClose={() => setAssignModal(null)}
          onSubmit={(agentId, leadIds) => {
            onAssign(agentId, leadIds);
            setAssignModal(null);
          }}
        />
      )}

      {reassignModal && (
        <ReassignLeadsModal
          agents={agents}
          websiteLeads={websiteLeads}
          preselectedFromAgentId={reassignModal.fromAgentId}
          onClose={() => setReassignModal(null)}
          onSubmit={(fromId, toId, leadIds) => {
            onReassign(fromId, toId, leadIds);
            setReassignModal(null);
          }}
        />
      )}
    </div>
  );
}

function ActionTile({ icon: Icon, title, subtitle, color = 'purple', onClick, disabled }) {
  const colors = {
    rose:    { fg: 'text-brand-magenta', bg: 'bg-rose-50', border: 'border-rose-200 hover:border-rose-400', shadow: 'hover:shadow-[0_12px_28px_-12px_rgba(227,28,121,0.4)]' },
    purple:  { fg: 'text-brand-purple',  bg: 'bg-violet-50', border: 'border-violet-200 hover:border-violet-400', shadow: 'hover:shadow-[0_12px_28px_-12px_rgba(139,47,214,0.4)]' },
    emerald: { fg: 'text-emerald-600',   bg: 'bg-emerald-50', border: 'border-emerald-200 hover:border-emerald-400', shadow: 'hover:shadow-[0_12px_28px_-12px_rgba(16,185,129,0.4)]' },
  };
  const c = colors[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${c.border} ${c.shadow}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.fg} transition-transform group-hover:scale-110 group-hover:rotate-6`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-brand-ink">{title}</p>
        <p className="truncate font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{subtitle}</p>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ASSIGN LEADS MODAL
   ═══════════════════════════════════════════════════════════════ */
function AssignLeadsModal({ agents, unassignedLeads, preselectedAgentId, onClose, onSubmit }) {
  const [agentId, setAgentId] = useState(preselectedAgentId || agents[0]?.id || '');
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return unassignedLeads;
    const q = search.toLowerCase();
    return unassignedLeads.filter((l) =>
      `${l.name} ${l.mobile}`.toLowerCase().includes(q)
    );
  }, [unassignedLeads, search]);

  const toggle = (id) => {
    setSelected((p) => {
      const next = new Set(p);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredLeads.length) setSelected(new Set());
    else setSelected(new Set(filteredLeads.map((l) => l.id)));
  };

  const handleSubmit = () => {
    if (!agentId || selected.size === 0) return;
    onSubmit(agentId, Array.from(selected));
  };

  return (
    <ModalShell title="Assign Leads" subtitle={`${unassignedLeads.length} unassigned leads`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Assign to Employee</label>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.status})</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full rounded-xl border border-brand-lilac bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        {filteredLeads.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-ink/50">No unassigned leads match your search</div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg bg-brand-mist/40 px-3 py-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink/70">
                <input
                  type="checkbox"
                  checked={selected.size === filteredLeads.length && filteredLeads.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
                />
                Select all ({filteredLeads.length})
              </label>
              <span className="text-[11px] font-semibold text-brand-magenta">{selected.size} selected</span>
            </div>

            <ul className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-brand-lilac/60 p-1">
              {filteredLeads.slice(0, 100).map((lead) => (
                <li key={lead.id}>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors ${selected.has(lead.id) ? 'bg-brand-magenta/5' : 'hover:bg-brand-mist/40'}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggle(lead.id)}
                      className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">{lead.name}</p>
                      <p className="truncate text-[11px] text-brand-ink/50">{lead.mobile}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-lilac/60 px-2 py-0.5 text-[10px] font-bold text-brand-purple">
                      {lead.leadSource}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!agentId || selected.size === 0}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
          >
            Assign {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REASSIGN LEADS MODAL
   ═══════════════════════════════════════════════════════════════ */
function ReassignLeadsModal({ agents, websiteLeads, preselectedFromAgentId, onClose, onSubmit }) {
  const [fromId, setFromId] = useState(preselectedFromAgentId || agents[0]?.id || '');
  const [toId, setToId] = useState('');
  const [selected, setSelected] = useState(new Set());

  const fromAgent = agents.find((a) => a.id === fromId);
  const fromLeads = useMemo(
    () => (fromAgent ? websiteLeads.filter((l) => l.assignedAgent === fromAgent.name) : []),
    [fromAgent, websiteLeads]
  );

  useEffect(() => { setSelected(new Set()); setToId(''); }, [fromId]);

  const toggle = (id) => {
    setSelected((p) => {
      const next = new Set(p);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!fromId || !toId || toId === fromId || selected.size === 0) return;
    onSubmit(fromId, toId, Array.from(selected));
  };

  const otherAgents = agents.filter((a) => a.id !== fromId);

  return (
    <ModalShell title="Reassign Leads" subtitle="Move leads between employees" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">From Employee</label>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">To Employee</label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option value="">Choose employee…</option>
              {otherAgents.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.status})</option>
              ))}
            </select>
          </div>
        </div>

        {fromLeads.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-ink/50">
            {fromAgent?.name} has no leads assigned
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg bg-brand-mist/40 px-3 py-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink/70">
                <input
                  type="checkbox"
                  checked={selected.size === fromLeads.length && fromLeads.length > 0}
                  onChange={() => {
                    if (selected.size === fromLeads.length) setSelected(new Set());
                    else setSelected(new Set(fromLeads.map((l) => l.id)));
                  }}
                  className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
                />
                Select all ({fromLeads.length})
              </label>
              <span className="text-[11px] font-semibold text-brand-magenta">{selected.size} selected</span>
            </div>

            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-brand-lilac/60 p-1">
              {fromLeads.slice(0, 100).map((lead) => (
                <li key={lead.id}>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors ${selected.has(lead.id) ? 'bg-brand-magenta/5' : 'hover:bg-brand-mist/40'}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggle(lead.id)}
                      className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">{lead.name}</p>
                      <p className="truncate text-[11px] text-brand-ink/50">{lead.mobile}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${lead.status === 'Won' ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-lilac/60 text-brand-purple'}`}>
                      {lead.status}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!toId || toId === fromId || selected.size === 0}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
          >
            Reassign {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GROUP MODAL
   ═══════════════════════════════════════════════════════════════ */
function GroupModal({ mode = 'add', initial = {}, agents, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    type: initial.type || 'Department',
    description: initial.description || '',
    memberIds: initial.memberIds || [],
  });
  const [error, setError] = useState('');

  const toggleMember = (id) => {
    setForm((f) => {
      const has = f.memberIds.includes(id);
      return { ...f, memberIds: has ? f.memberIds.filter((x) => x !== id) : [...f.memberIds, id] };
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    onSubmit({
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      memberIds: form.memberIds,
    });
  };

  return (
    <ModalShell
      title={mode === 'add' ? 'Create Group' : 'Edit Group'}
      subtitle="Organize employees by any criteria"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Group Name</label>
          <input
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(''); }}
            placeholder="e.g. Mumbai Team, Night Shift, Diwali Campaign"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Group Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          >
            {GROUP_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            placeholder="Short description of this group's purpose"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
            Members ({form.memberIds.length})
          </label>
          {agents.length === 0 ? (
            <p className="rounded-lg bg-brand-mist/40 px-3 py-2 text-xs text-brand-ink/50">No employees available</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-brand-lilac/60 p-1">
              {agents.map((a) => {
                const checked = form.memberIds.includes(a.id);
                return (
                  <li key={a.id}>
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors ${checked ? 'bg-brand-magenta/5' : 'hover:bg-brand-mist/40'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(a.id)}
                        className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
                      />
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-[9px] font-bold text-white">
                        {initials(a.name)}
                      </span>
                      <span className="truncate text-sm font-medium text-brand-ink">{a.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            {mode === 'add' ? 'Create Group' : 'Save Changes'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AGENT MODAL
   ═══════════════════════════════════════════════════════════════ */
function AgentModal({ mode = 'add', initial = {}, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    email: initial.email || '',
    status: initial.status || 'Active',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^[0-9]{10}$/.test(form.phone.trim())) return 'Phone must be exactly 10 digits.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        status: form.status,
      });
    }, 300);
  };

  return (
    <ModalShell
      title={mode === 'add' ? 'Add New Employee' : 'Edit Employee'}
      subtitle={mode === 'add' ? 'Add a new team member' : 'Update employee details'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ModalInput
          label="Full Name"
          value={form.name}
          onChange={(v) => { setForm({ ...form, name: v }); setError(''); }}
          placeholder="e.g. Ravi Kumar"
          icon={UserCog}
          required
        />

        <ModalInput
          label="Phone Number"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) })}
          placeholder="10-digit mobile number"
          icon={Phone}
          required
        />

        <ModalInput
          label="Email (optional)"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="agent@example.com"
          icon={Mail}
        />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Initial Status</label>
          <div className="flex gap-2">
            {['Active', 'Break', 'Offline'].map((s) => {
              const active = form.status === s;
              const style = STATUS_STYLES[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                      : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {s}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving…
              </span>
            ) : mode === 'add' ? 'Add Employee' : 'Save Changes'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function ModalShell({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-panel">
        <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-6 py-4">
          <div>
            <h3 className="font-display text-base font-bold text-brand-ink">{title}</h3>
            {subtitle && <p className="text-[11px] text-brand-ink/50">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalInput({ label, type = 'text', value, onChange, placeholder, icon: Icon, required }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-magenta/60" />
        )}
        <input
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

function StatBox({ label, value, tone = 'purple' }) {
  const tones = {
    purple:  'text-brand-purple',
    emerald: 'text-emerald-600',
    rose:    'text-brand-magenta',
  };
  return (
    <div className="rounded-xl bg-brand-mist p-2.5">
      <p className={`font-display text-base font-bold tabular-nums ${tones[tone]}`}>{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-brand-ink/50">{label}</p>
    </div>
  );
}

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

function EmptyState({ onAdd, hasFilters, onClear }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-magenta">
        <Users2 size={22} />
      </span>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No employees match your filters' : 'No employees yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button onClick={onClear} className="font-semibold text-brand-magenta hover:underline">
            Clear all filters
          </button>
        ) : (
          'Add your first calling employee to start assigning leads.'
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onAdd}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card"
        >
          <Plus size={16} /> Add First Employee
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
        type === 'error'
          ? 'border-rose-200 bg-rose-50 text-rose-600'
          : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}