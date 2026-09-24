// src/pages/superadmin/Agents.jsx
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Phone, Users2, Search, Filter, Globe, MoreVertical,
  CheckCircle2, Pause, X, Trash2, TrendingUp, Mail, AlertCircle,
  Eye, Pencil, Shield, ShieldBan, ShieldCheck, Key, Clock, Activity,
  UserCog, Building2, Briefcase, Award, Target, LogIn, Calendar,
  BarChart3, Layers, Check, PhoneCall, PhoneIncoming, PhoneOutgoing,
  MessageSquare, FileText, UserPlus, UserMinus, Lock, Unlock,
  Star, Zap, MapPin, CreditCard, Download, Upload, Copy, TrendingDown,
  PhoneMissed, Voicemail, Timer, Percent, Headphones, User as UserIcon,
  Mic, MicOff, Volume2, VolumeX, PauseCircle, PlayCircle, PhoneOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AGENTS as INITIAL_AGENTS,
  PROJECTS,
  ADMINS,
  LEADS,
  CALLS,
  FOLLOW_UPS,
  statsForProject,
} from '../../data/mockData';

const STATUSES = ['Active', 'Break', 'Offline', 'Blocked'];
const PERMISSION_KEYS = [
  { key: 'viewLeads', label: 'View Leads' },
  { key: 'editLeads', label: 'Edit Leads' },
  { key: 'assignLeads', label: 'Assign Leads' },
  { key: 'deleteLeads', label: 'Delete Leads' },
  { key: 'makeCalls', label: 'Make Calls' },
  { key: 'recordCalls', label: 'Record Calls' },
  { key: 'sendSms', label: 'Send SMS' },
  { key: 'sendWhatsapp', label: 'Send WhatsApp' },
  { key: 'sendEmail', label: 'Send Email' },
  { key: 'viewReports', label: 'View Reports' },
  { key: 'exportData', label: 'Export Data' },
  { key: 'manageFollowUps', label: 'Manage Follow-ups' },
];

const DEFAULT_PERMISSIONS = {
  viewLeads: true,
  editLeads: true,
  assignLeads: false,
  deleteLeads: false,
  makeCalls: true,
  recordCalls: true,
  sendSms: true,
  sendWhatsapp: true,
  sendEmail: true,
  viewReports: true,
  exportData: false,
  manageFollowUps: true,
};

export default function Agents() {
  const { role, activeWebsiteId, activeWebsite } = useAuth();
  const navigate = useNavigate();

  /* ========== LOCAL STATE ========== */
  const [allAgents, setAllAgents] = useState(
    INITIAL_AGENTS.map((a) => ({
      ...a,
      email: a.email || `agent${a.id}@eliteinova.com`,
      permissions: a.permissions || { ...DEFAULT_PERMISSIONS },
      team: a.team || 'General',
      joinedOn: a.joinedOn || '2024-01-15',
      lastLogin: a.lastLogin || 'Today, 9:12 AM',
      avgCallDuration: a.avgCallDuration || '4m 12s',
      conversionRate: a.conversionRate || 12,
      blocked: a.status === 'Blocked',
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  /* ========== MODALS / DRAWERS ========== */
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [viewingAgent, setViewingAgent] = useState(null);
  const [viewingActivityFor, setViewingActivityFor] = useState(null);
  const [viewingLeadsFor, setViewingLeadsFor] = useState(null);
  const [viewingPermissionsFor, setViewingPermissionsFor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBlock, setConfirmBlock] = useState(null);

  /* ========== CALL STATE (WORKING CALL) ========== */
  const [callingAgent, setCallingAgent] = useState(null);
  const [callingLead, setCallingLead] = useState(null);
  const [callLog, setCallLog] = useState([]);

  /* ========== SCOPED AGENTS (per active website) ========== */
  const websiteAgents = useMemo(
    () => allAgents.filter((a) => a.websiteId === activeWebsiteId),
    [allAgents, activeWebsiteId]
  );

  /* ========== TEAMS ========== */
  const teams = useMemo(() => {
    const set = new Set(websiteAgents.map((a) => a.team || 'General'));
    return ['All', ...Array.from(set)];
  }, [websiteAgents]);

  /* ========== APPLY FILTERS ========== */
  const filteredAgents = useMemo(() => {
    return websiteAgents.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (teamFilter !== 'All' && (a.team || 'General') !== teamFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${a.name} ${a.phone} ${a.email || ''} ${a.team || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [websiteAgents, statusFilter, teamFilter, searchQuery]);

  /* ========== SUMMARY STATS ========== */
  const stats = useMemo(() => {
    const total = websiteAgents.length;
    const active = websiteAgents.filter((a) => a.status === 'Active').length;
    const onBreak = websiteAgents.filter((a) => a.status === 'Break').length;
    const blocked = websiteAgents.filter((a) => a.status === 'Blocked').length;
    const totalLeads = websiteAgents.reduce((s, a) => s + (a.leadsAssigned || 0), 0);
    const totalCalls = websiteAgents.reduce((s, a) => s + (a.callsToday || 0), 0);
    const avgConversion =
      websiteAgents.length > 0
        ? Math.round(
            websiteAgents.reduce((s, a) => s + (a.conversionRate || 0), 0) /
              websiteAgents.length
          )
        : 0;
    return { total, active, onBreak, blocked, totalLeads, totalCalls, avgConversion };
  }, [websiteAgents]);

  /* ========== ADD AGENT ========== */
  const handleAddAgent = (newAgentData) => {
    const newAgent = {
      id: Date.now(),
      name: newAgentData.name,
      phone: newAgentData.phone,
      email: newAgentData.email,
      status: newAgentData.status || 'Active',
      team: newAgentData.team || 'General',
      leadsAssigned: 0,
      callsToday: 0,
      websiteId: activeWebsiteId,
      permissions: { ...DEFAULT_PERMISSIONS },
      joinedOn: new Date().toISOString().slice(0, 10),
      lastLogin: 'Never',
      avgCallDuration: '0m 0s',
      conversionRate: 0,
      blocked: false,
    };
    setAllAgents((prev) => [...prev, newAgent]);
    setShowAddModal(false);
  };

  /* ========== EDIT AGENT ========== */
  const handleEditAgent = (agentId, updates) => {
    setAllAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, ...updates } : a))
    );
    setEditingAgent(null);
  };

  /* ========== DELETE AGENT ========== */
  const handleDeleteAgent = (id) => {
    setAllAgents((prev) => prev.filter((a) => a.id !== id));
    setConfirmDelete(null);
    setMenuOpenId(null);
  };

  /* ========== TOGGLE STATUS ========== */
  const handleSetStatus = (agentId, newStatus) => {
    setAllAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, status: newStatus, blocked: newStatus === 'Blocked' }
          : a
      )
    );
    setMenuOpenId(null);
  };

  /* ========== BLOCK / UNBLOCK ========== */
  const handleToggleBlock = (agentId, currentStatus) => {
    const newStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
    setAllAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, status: newStatus, blocked: newStatus === 'Blocked' }
          : a
      )
    );
    setConfirmBlock(null);
    setMenuOpenId(null);
  };

  /* ========== UPDATE PERMISSIONS ========== */
  const handleUpdatePermissions = (agentId, permissions) => {
    setAllAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, permissions } : a))
    );
    setViewingPermissionsFor(null);
  };

  /* ========== RESET PASSWORD ========== */
  const handleResetPassword = (agent) => {
    alert(`Password reset link sent to ${agent.email}`);
    setMenuOpenId(null);
  };

  /* ========== WORKING CALL HANDLERS ========== */
  const handleCallAgent = (agent) => {
    if (agent.status === 'Blocked') {
      alert(`Cannot call ${agent.name} — this agent is blocked.`);
      return;
    }
    setMenuOpenId(null);
    setCallingAgent(agent);
  };

  const handleCallLead = (lead) => {
    setCallingLead(lead);
  };

  const logCall = (target, targetType, duration, disposition) => {
    const entry = {
      id: Date.now(),
      target: target.name,
      phone: target.phone || target.mobile,
      targetType,
      duration,
      disposition,
      time: new Date().toLocaleTimeString(),
    };
    setCallLog((prev) => [entry, ...prev].slice(0, 20));

    // bump agent call count if calling an agent
    if (targetType === 'agent') {
      setAllAgents((prev) =>
        prev.map((a) =>
          a.id === target.id
            ? { ...a, callsToday: (a.callsToday || 0) + 1 }
            : a
        )
      );
    }
    setCallingAgent(null);
    setCallingLead(null);
  };

  const hasActiveFilters =
    statusFilter !== 'All' || teamFilter !== 'All' || searchQuery;

  const clearFilters = () => {
    setStatusFilter('All');
    setTeamFilter('All');
    setSearchQuery('');
  };

  const pageTitle = role === 'superadmin' ? 'Network Agents' : 'Agents';

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            {pageTitle}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            {role === 'superadmin' ? (
              <>
                <Globe size={13} className="text-brand-purple" />
                Agents for{' '}
                <span className="font-semibold text-brand-purple">
                  {activeWebsite?.name || '—'}
                </span>
              </>
            ) : (
              'Manage calling agents for your website.'
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
        >
          <Plus size={16} className="transition-transform group-hover:rotate-90 duration-300" />
          Add Agent
        </button>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total Agents"
          value={stats.total}
          sub={`${stats.active} currently active`}
          icon={Users2}
          color="purple"
          trend="+5%"
          trendUp
        />
        <AnimatedStatCard
          label="Active"
          value={stats.active}
          sub={`of ${stats.total} agents`}
          icon={Activity}
          color="emerald"
          trend="+8%"
          trendUp
        />
        <AnimatedStatCard
          label="On Break"
          value={stats.onBreak}
          sub="Temporarily away"
          icon={Pause}
          color="amber"
          trend="+2"
          trendUp
        />
        <AnimatedStatCard
          label="Blocked"
          value={stats.blocked}
          sub="Require attention"
          icon={ShieldBan}
          color="rose"
          trend="-1"
          trendUp={false}
        />
      </div>

      {/* ================= SECONDARY STATS ================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniStatCard
          label="Leads Assigned"
          value={stats.totalLeads}
          icon={Layers}
          color="purple"
        />
        <MiniStatCard
          label="Calls Today"
          value={stats.totalCalls}
          icon={PhoneCall}
          color="emerald"
        />
        <MiniStatCard
          label="Avg Conversion"
          value={`${stats.avgConversion}%`}
          icon={Percent}
          color="amber"
        />
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
            placeholder="Search by name, phone, email, or team..."
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

        <DropdownFilter
          label="Status"
          icon={Filter}
          value={statusFilter}
          options={['All', ...STATUSES]}
          open={statusOpen}
          onToggle={() => {
            setStatusOpen((s) => !s);
            setTeamOpen(false);
          }}
          onChange={(v) => {
            setStatusFilter(v);
            setStatusOpen(false);
          }}
        />

        <DropdownFilter
          label="Team"
          icon={Users2}
          value={teamFilter}
          options={teams}
          open={teamOpen}
          onToggle={() => {
            setTeamOpen((s) => !s);
            setStatusOpen(false);
          }}
          onChange={(v) => {
            setTeamFilter(v);
            setTeamOpen(false);
          }}
        />

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ================= RECENT CALLS LOG (from working calls) ================= */}
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
                    {c.target}{' '}
                    <span className="text-xs font-normal text-brand-ink/40">
                      · {c.targetType}
                    </span>
                  </p>
                  <p className="truncate text-xs text-brand-ink/50">
                    {c.phone}
                  </p>
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

      {/* ================= AGENTS GRID ================= */}
      {filteredAgents.length === 0 ? (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClear={clearFilters}
          onAdd={() => setShowAddModal(true)}
          websiteName={activeWebsite?.name}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent) => {
            const isBlocked = agent.status === 'Blocked';
            const agentLeads = LEADS.filter((l) => l.assignedAgentId === agent.id);
            const agentCalls = CALLS.filter((c) => c.agentId === agent.id);
            const agentFollowUps = FOLLOW_UPS.filter((f) => f.agentId === agent.id);

            return (
              <div
                key={agent.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)] ${
                  isBlocked
                    ? 'border-rose-200 hover:border-rose-300'
                    : 'border-brand-lilac/80 hover:border-brand-purple/50'
                }`}
              >
                <span
                  className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${
                    isBlocked
                      ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                      : 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                  }`}
                />
                <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-purple/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex flex-col p-5">
                  {/* Row 1 */}
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                        isBlocked
                          ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                          : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
                      }`}
                    >
                      {agent.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-brand-ink">
                        {agent.name}
                      </p>
                      <p className="truncate text-xs text-brand-ink/50">
                        {agent.phone}
                      </p>
                      <p className="truncate text-xs text-brand-ink/40">
                        {agent.email}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        agent.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : agent.status === 'Break'
                          ? 'bg-amber-100 text-amber-600'
                          : agent.status === 'Blocked'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {agent.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === agent.id ? null : agent.id)
                      }
                      className="shrink-0 rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-lilac"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {menuOpenId === agent.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpenId(null)}
                        />
                        <div className="absolute right-3 top-14 z-20 w-52 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel animate-dropdown">
                          <MenuItem
                            icon={Eye}
                            label="View Profile"
                            onClick={() => {
                              setViewingAgent(agent);
                              setMenuOpenId(null);
                            }}
                          />
                          <MenuItem
                            icon={Pencil}
                            label="Edit Details"
                            onClick={() => {
                              setEditingAgent(agent);
                              setMenuOpenId(null);
                            }}
                          />
                          {/* WORKING CALL IN MENU */}
                          <MenuItem
                            icon={PhoneCall}
                            label="Call Agent"
                            onClick={() => handleCallAgent(agent)}
                          />
                          <MenuItem
                            icon={Shield}
                            label="Permissions"
                            onClick={() => {
                              setViewingPermissionsFor(agent);
                              setMenuOpenId(null);
                            }}
                          />
                          <MenuItem
                            icon={Layers}
                            label="View Leads"
                            onClick={() => {
                              setViewingLeadsFor(agent);
                              setMenuOpenId(null);
                            }}
                          />
                          <MenuItem
                            icon={Clock}
                            label="Activity Log"
                            onClick={() => {
                              setViewingActivityFor(agent);
                              setMenuOpenId(null);
                            }}
                          />
                          <MenuItem
                            icon={Key}
                            label="Reset Password"
                            onClick={() => handleResetPassword(agent)}
                          />
                          <MenuItem
                            icon={agent.status === 'Active' ? Pause : CheckCircle2}
                            label={agent.status === 'Active' ? 'Set Break' : 'Set Active'}
                            onClick={() =>
                              handleSetStatus(
                                agent.id,
                                agent.status === 'Active' ? 'Break' : 'Active'
                              )
                            }
                          />
                          <MenuItem
                            icon={isBlocked ? ShieldCheck : ShieldBan}
                            label={isBlocked ? 'Unblock' : 'Block'}
                            onClick={() => {
                              setConfirmBlock(agent);
                              setMenuOpenId(null);
                            }}
                          />
                          <div className="my-1 h-px bg-brand-lilac/60" />
                          <MenuItem
                            icon={Trash2}
                            label="Remove"
                            danger
                            onClick={() => {
                              setConfirmDelete(agent);
                              setMenuOpenId(null);
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Row 2: Team + Project */}
                  <div className="mt-4 space-y-2 rounded-xl border border-brand-lilac/60 bg-gradient-to-br from-brand-mist/80 to-brand-mist/40 p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-brand-ink/50">
                        <Users2 size={11} /> Team
                      </span>
                      <span className="truncate font-semibold text-brand-ink">
                        {agent.team || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-brand-ink/50">
                        <Building2 size={11} /> Project
                      </span>
                      <span className="truncate font-semibold text-brand-ink">
                        {PROJECTS.find((p) => p.id === agent.websiteId)?.name ||
                          'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-brand-ink/50">
                        <LogIn size={11} /> Last Login
                      </span>
                      <span className="truncate font-medium text-brand-ink">
                        {agent.lastLogin}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Metrics */}
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <MetricPill label="Leads" value={agent.leadsAssigned} color="purple" />
                    <MetricPill label="Calls" value={agent.callsToday} color="emerald" />
                    <MetricPill label="Follow" value={agentFollowUps.length} color="amber" />
                    <MetricPill
                      label="Conv%"
                      value={`${agent.conversionRate}%`}
                      color="rose"
                    />
                  </div>

                  {/* Row 4: Action buttons */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setViewingAgent(agent)}
                      className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                    >
                      <Eye size={13} className="transition-transform group-hover/btn:scale-110" />
                      View
                    </button>
                    <button
                      onClick={() => setEditingAgent(agent)}
                      className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                    >
                      <Pencil size={13} className="transition-transform group-hover/btn:scale-110" />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(agent)}
                      className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white py-2.5 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-50"
                    >
                      <Trash2 size={13} className="transition-transform group-hover/btn:scale-110" />
                      Delete
                    </button>
                  </div>

                  {/* Row 5: Permissions + Leads */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setViewingPermissionsFor(agent)}
                      className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                    >
                      <Shield size={13} className="transition-transform group-hover/btn:scale-110" />
                      Permissions
                    </button>
                    <button
                      onClick={() => setViewingLeadsFor(agent)}
                      className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                    >
                      <Layers size={13} className="transition-transform group-hover/btn:scale-110" />
                      Leads ({agentLeads.length})
                    </button>
                  </div>

                  {/* Row 6: Activity + WORKING CALL */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setViewingActivityFor(agent)}
                      className="group/btn flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                    >
                      <Activity size={13} className="transition-transform group-hover/btn:scale-110" />
                      Activity
                    </button>
                    <button
                      onClick={() => handleCallAgent(agent)}
                      disabled={isBlocked}
                      className={`group/btn flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                        isBlocked
                          ? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
                          : 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
                      }`}
                    >
                      <PhoneCall size={13} className="transition-transform group-hover/btn:scale-110" />
                      {isBlocked ? 'Blocked' : 'Call'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODALS / DRAWERS ================= */}
      {showAddModal && (
        <AgentModal
          mode="add"
          teams={teams.filter((t) => t !== 'All')}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddAgent}
        />
      )}

      {editingAgent && (
        <AgentModal
          mode="edit"
          initial={editingAgent}
          teams={teams.filter((t) => t !== 'All')}
          onClose={() => setEditingAgent(null)}
          onSubmit={(data) => handleEditAgent(editingAgent.id, data)}
        />
      )}

      {viewingAgent && (
        <AgentDetailsDrawer
          agent={viewingAgent}
          onClose={() => setViewingAgent(null)}
          onEdit={() => {
            setEditingAgent(viewingAgent);
            setViewingAgent(null);
          }}
          onPermissions={() => {
            setViewingPermissionsFor(viewingAgent);
            setViewingAgent(null);
          }}
          onActivity={() => {
            setViewingActivityFor(viewingAgent);
            setViewingAgent(null);
          }}
          onLeads={() => {
            setViewingLeadsFor(viewingAgent);
            setViewingAgent(null);
          }}
          onCall={() => {
            handleCallAgent(viewingAgent);
            setViewingAgent(null);
          }}
          onToggleBlock={() => {
            setConfirmBlock(viewingAgent);
            setViewingAgent(null);
          }}
        />
      )}

      {viewingActivityFor && (
        <ActivityDrawer
          agent={viewingActivityFor}
          onClose={() => setViewingActivityFor(null)}
        />
      )}

      {viewingLeadsFor && (
        <LeadsDrawer
          agent={viewingLeadsFor}
          onClose={() => setViewingLeadsFor(null)}
          onCallLead={handleCallLead}
        />
      )}

      {viewingPermissionsFor && (
        <PermissionsDrawer
          agent={viewingPermissionsFor}
          onClose={() => setViewingPermissionsFor(null)}
          onSave={(perms) =>
            handleUpdatePermissions(viewingPermissionsFor.id, perms)
          }
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Remove agent?"
          message={`This will permanently remove "${confirmDelete.name}" from the platform. This action cannot be undone.`}
          confirmLabel="Remove Agent"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteAgent(confirmDelete.id)}
        />
      )}

      {confirmBlock && (
        <ConfirmDialog
          title={confirmBlock.status === 'Blocked' ? 'Unblock agent?' : 'Block agent?'}
          message={
            confirmBlock.status === 'Blocked'
              ? `This will restore "${confirmBlock.name}" to Active status.`
              : `This will block "${confirmBlock.name}" from accessing the platform. They won't be able to log in or make calls.`
          }
          confirmLabel={confirmBlock.status === 'Blocked' ? 'Unblock' : 'Block'}
          danger={confirmBlock.status !== 'Blocked'}
          onCancel={() => setConfirmBlock(null)}
          onConfirm={() =>
            handleToggleBlock(confirmBlock.id, confirmBlock.status)
          }
        />
      )}

      {/* ================= WORKING CALL MODAL ================= */}
      {callingAgent && (
        <CallModal
          target={callingAgent}
          targetType="agent"
          onClose={() => setCallingAgent(null)}
          onEnd={(duration, disposition) =>
            logCall(callingAgent, 'agent', duration, disposition)
          }
        />
      )}

      {callingLead && (
        <CallModal
          target={callingLead}
          targetType="lead"
          onClose={() => setCallingLead(null)}
          onEnd={(duration, disposition) =>
            logCall(callingLead, 'lead', duration, disposition)
          }
        />
      )}
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
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
          >
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

/* ================= MINI STAT CARD ================= */
function MiniStatCard({ label, value, icon: Icon, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/60">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
          {label}
        </p>
        <p className="font-display text-xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}

/* ================= METRIC PILL ================= */
function MetricPill({ label, value, color }) {
  const colors = {
    purple: 'bg-violet-50 text-brand-purple border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-brand-magenta border-rose-200',
  };
  return (
    <div
      className={`rounded-lg border p-2 transition-transform duration-300 hover:scale-105 ${colors[color]}`}
    >
      <p className="truncate font-display text-xs font-bold">{value}</p>
      <p className="text-[9px] font-semibold uppercase opacity-70">{label}</p>
    </div>
  );
}

/* ================= MENU ITEM ================= */
function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
        danger
          ? 'text-rose-500 hover:bg-rose-50'
          : 'text-brand-ink/70 hover:bg-brand-lilac/40'
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

/* ================= DROPDOWN FILTER ================= */
function DropdownFilter({ label, icon: Icon, value, options, open, onToggle, onChange }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
      >
        <Icon size={14} className="text-brand-purple" />
        {label}: <span className="text-brand-purple">{value}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  value === o
                    ? 'bg-brand-lilac font-semibold text-brand-purple'
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

/* ================= EMPTY STATE ================= */
function EmptyState({ hasFilters, onClear, onAdd, websiteName }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <Users2 size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No agents match your filters' : 'No agents yet'}
      </p>
      <p className="max-w-sm text-sm text-brand-ink/50">
        {hasFilters ? (
          <button
            onClick={onClear}
            className="font-semibold text-brand-purple hover:underline"
          >
            Clear all filters
          </button>
        ) : (
          <>
            Add your first calling agent for{' '}
            <span className="font-semibold text-brand-ink">
              {websiteName || 'this website'}
            </span>{' '}
            to start assigning leads.
          </>
        )}
      </p>
      {!hasFilters && (
        <button
          onClick={onAdd}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card"
        >
          <Plus size={16} /> Add First Agent
        </button>
      )}
    </div>
  );
}

/* ================= WORKING CALL MODAL ================= */
function CallModal({ target, targetType, onClose, onEnd }) {
  const [callState, setCallState] = useState('ringing'); // ringing | connected | ended
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [notes, setNotes] = useState('');

  const phone = target.phone || target.mobile || '';
  const displayName = target.name;

  /* Ringing → Connected after 2s */
  useEffect(() => {
    if (callState !== 'ringing') return;
    const t = setTimeout(() => setCallState('connected'), 2000);
    return () => clearTimeout(t);
  }, [callState]);

  /* Timer while connected */
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

  /* Launch native dialer as a real click-to-call */
  const handleNativeDial = () => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-panel">
        {/* Header gradient */}
        <div
          className={`relative px-6 pb-8 pt-8 text-center text-white ${
            callState === 'connected'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : callState === 'ringing'
              ? 'bg-gradient-to-br from-brand-purple to-brand-magenta'
              : 'bg-gradient-to-br from-gray-500 to-gray-600'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/20"
          >
            <X size={18} />
          </button>

          <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 text-2xl font-bold">
              {displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          </div>

          <p className="text-lg font-semibold">{displayName}</p>
          <p className="text-xs text-white/70">
            {targetType === 'agent' ? 'Agent' : 'Lead'} · {phone}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            {callState === 'ringing' && 'Ringing…'}
            {callState === 'connected' && `Connected · ${formatTime(seconds)}`}
            {callState === 'ended' && 'Call Ended'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {callState === 'connected' && (
            <>
              {/* Call controls */}
              <div className="mb-5 grid grid-cols-3 gap-3">
                <CallControl
                  icon={muted ? MicOff : Mic}
                  label={muted ? 'Unmute' : 'Mute'}
                  active={muted}
                  onClick={() => setMuted((m) => !m)}
                />
                <CallControl
                  icon={speaker ? Volume2 : VolumeX}
                  label={speaker ? 'Speaker' : 'Speaker'}
                  active={speaker}
                  onClick={() => setSpeaker((s) => !s)}
                />
                <CallControl
                  icon={onHold ? PlayCircle : PauseCircle}
                  label={onHold ? 'Resume' : 'Hold'}
                  active={onHold}
                  onClick={() => setOnHold((h) => !h)}
                />
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                  Call Notes
                </label>
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
              Connecting your call to{' '}
              <span className="font-semibold text-brand-ink">{displayName}</span>
              …
            </p>
          )}

          {/* Native dial option */}
          <button
            onClick={handleNativeDial}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <PhoneOutgoing size={14} /> Open in Phone App
          </button>

          {/* Hang up / disposition */}
          {callState !== 'ended' ? (
            <button
              onClick={() => handleHangUp('Connected')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <PhoneOff size={16} /> End Call
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-xs font-semibold text-brand-ink/60">
                Save disposition
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleHangUp('Connected')}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                >
                  Connected
                </button>
                <button
                  onClick={() => handleHangUp('Missed')}
                  className="rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-100"
                >
                  Missed
                </button>
                <button
                  onClick={() => handleHangUp('Voicemail')}
                  className="rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-100"
                >
                  Voicemail
                </button>
                <button
                  onClick={() => handleHangUp('Busy')}
                  className="rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
                >
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

/* ================= CALL CONTROL BUTTON ================= */
function CallControl({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
        active
          ? 'border-brand-purple bg-brand-lilac/50 text-brand-purple'
          : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

/* ================= AGENT DETAILS DRAWER ================= */
function AgentDetailsDrawer({
  agent,
  onClose,
  onEdit,
  onPermissions,
  onActivity,
  onLeads,
  onCall,
  onToggleBlock,
}) {
  const isBlocked = agent.status === 'Blocked';
  const project = PROJECTS.find((p) => p.id === agent.websiteId);
  const agentLeads = LEADS.filter((l) => l.assignedAgentId === agent.id);
  const agentCalls = CALLS.filter((c) => c.agentId === agent.id);
  const agentFollowUps = FOLLOW_UPS.filter((f) => f.agentId === agent.id);
  const connectedCalls = agentCalls.filter((c) => c.status === 'Connected').length;
  const missedCalls = agentCalls.filter((c) => c.status === 'Missed').length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                isBlocked
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                  : 'bg-gradient-to-br from-brand-purple to-brand-magenta'
              }`}
            >
              <span className="text-sm font-bold">
                {agent.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {agent.name}
              </h3>
              <p className="text-xs text-brand-ink/50">{agent.phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox
              label="Status"
              value={agent.status}
              color={
                agent.status === 'Active'
                  ? 'emerald'
                  : agent.status === 'Break'
                  ? 'amber'
                  : agent.status === 'Blocked'
                  ? 'rose'
                  : 'purple'
              }
            />
            <InfoBox label="Team" value={agent.team || 'General'} color="purple" />
            <InfoBox
              label="Project"
              value={project?.code || '—'}
              color="purple"
            />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Contact Information
            </h4>
            <InfoRow icon={Phone} label="Phone" value={agent.phone} />
            <InfoRow icon={Mail} label="Email" value={agent.email || '—'} />
            <InfoRow icon={Calendar} label="Joined On" value={agent.joinedOn} />
            <InfoRow icon={LogIn} label="Last Login" value={agent.lastLogin} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Performance Overview
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <UsageStat
                icon={Layers}
                label="Leads Assigned"
                value={agent.leadsAssigned}
                max={100}
                used={agent.leadsAssigned}
              />
              <UsageStat
                icon={PhoneCall}
                label="Calls Today"
                value={agent.callsToday}
                max={50}
                used={agent.callsToday}
              />
              <UsageStat
                icon={PhoneIncoming}
                label="Connected Calls"
                value={connectedCalls}
                max={50}
                used={connectedCalls}
              />
              <UsageStat
                icon={PhoneMissed}
                label="Missed Calls"
                value={missedCalls}
                max={20}
                used={missedCalls}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <InfoBox label="Avg Duration" value={agent.avgCallDuration} color="purple" />
              <InfoBox label="Conversion" value={`${agent.conversionRate}%`} color="emerald" />
              <InfoBox label="Follow-ups" value={agentFollowUps.length} color="amber" />
            </div>
          </div>

          <div className="card !p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                Assigned Leads
              </h4>
              <button
                onClick={onLeads}
                className="text-xs font-semibold text-brand-purple hover:underline"
              >
                View All
              </button>
            </div>
            {agentLeads.length === 0 ? (
              <p className="py-3 text-center text-xs text-brand-ink/40">
                No leads assigned to this agent yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {agentLeads.slice(0, 3).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 rounded-lg border border-brand-lilac/60 p-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-lilac text-[10px] font-bold text-brand-purple">
                      {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {lead.name}
                      </p>
                      <p className="truncate text-xs text-brand-ink/50">
                        {lead.mobile}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        lead.status === 'Won'
                          ? 'bg-emerald-100 text-emerald-600'
                          : lead.status === 'Missed'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card !p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-brand-ink">
                Permissions
              </h4>
              <button
                onClick={onPermissions}
                className="text-xs font-semibold text-brand-purple hover:underline"
              >
                Manage
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSION_KEYS.slice(0, 6).map((p) => {
                const enabled = agent.permissions?.[p.key];
                return (
                  <div
                    key={p.key}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                      enabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <span className="font-medium">{p.label}</span>
                    {enabled && <Check size={12} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac py-2.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={onCall}
                disabled={isBlocked}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold ${
                  isBlocked
                    ? 'cursor-not-allowed border-gray-200 text-gray-400'
                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <PhoneCall size={14} /> Call
              </button>
              <button
                onClick={onToggleBlock}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold ${
                  isBlocked
                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    : 'border-rose-200 text-rose-500 hover:bg-rose-50'
                }`}
              >
                {isBlocked ? (
                  <>
                    <ShieldCheck size={14} /> Unblock
                  </>
                ) : (
                  <>
                    <ShieldBan size={14} /> Block
                  </>
                )}
              </button>
              <button
                onClick={onActivity}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110"
              >
                <Activity size={14} /> Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ACTIVITY DRAWER ================= */
function ActivityDrawer({ agent, onClose }) {
  const activities = [
    { id: 1, action: 'Logged in', detail: 'From Chennai, IN · Chrome on Windows', time: 'Today, 9:12 AM', color: 'emerald' },
    { id: 2, action: 'Called lead', detail: 'Lead #LG-0042 — Duration 3m 24s', time: 'Today, 9:45 AM', color: 'purple' },
    { id: 3, action: 'Updated lead status', detail: 'Lead #LG-0039 — Follow Up → Qualified', time: 'Today, 10:15 AM', color: 'amber' },
    { id: 4, action: 'Sent WhatsApp', detail: 'To lead #LG-0042', time: 'Today, 10:20 AM', color: 'emerald' },
    { id: 5, action: 'Created follow-up', detail: 'For lead #LG-0042 on Oct 25', time: 'Today, 10:22 AM', color: 'purple' },
    { id: 6, action: 'Missed call', detail: 'Inbound from +91 98XXX 12345', time: 'Yesterday, 4:32 PM', color: 'rose' },
    { id: 7, action: 'Logged in', detail: 'From Chennai, IN · Safari on iPhone', time: 'Yesterday, 8:45 AM', color: 'emerald' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
              {agent.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Activity Log
              </h3>
              <p className="text-xs text-brand-ink/50">
                {agent.name} · {agent.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Total Logins" value="24" color="purple" />
            <InfoBox label="Actions (30d)" value={activities.length} color="emerald" />
            <InfoBox label="Last Active" value="Today" color="amber" />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
              Recent Activity
            </p>

            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-brand-lilac" />
              <div className="space-y-3">
                {activities.map((a) => {
                  const colors = {
                    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
                    purple: 'bg-violet-100 text-brand-purple border-violet-200',
                    amber: 'bg-amber-100 text-amber-600 border-amber-200',
                    rose: 'bg-rose-100 text-rose-500 border-rose-200',
                  };
                  return (
                    <div key={a.id} className="relative flex items-start gap-3">
                      <span
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${colors[a.color]}`}
                      >
                        <Activity size={12} />
                      </span>
                      <div className="min-w-0 flex-1 rounded-xl border border-brand-lilac/60 bg-white p-3">
                        <p className="text-sm font-semibold text-brand-ink">
                          {a.action}
                        </p>
                        <p className="mt-0.5 text-xs text-brand-ink/60">
                          {a.detail}
                        </p>
                        <p className="mt-1 text-[10px] text-brand-ink/40">
                          {a.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= LEADS DRAWER ================= */
function LeadsDrawer({ agent, onClose, onCallLead }) {
  const agentLeads = LEADS.filter((l) => l.assignedAgentId === agent.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Layers size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Assigned Leads
              </h3>
              <p className="text-xs text-brand-ink/50">
                {agentLeads.length} leads for {agent.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Total" value={agentLeads.length} color="purple" />
            <InfoBox
              label="Qualified"
              value={agentLeads.filter((l) => l.status === 'Qualified').length}
              color="emerald"
            />
            <InfoBox
              label="Won"
              value={agentLeads.filter((l) => l.status === 'Won').length}
              color="amber"
            />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
              Lead Details
            </p>
            {agentLeads.length === 0 ? (
              <p className="py-6 text-center text-xs text-brand-ink/40">
                No leads assigned to this agent yet.
              </p>
            ) : (
              <div className="space-y-3">
                {agentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-brand-lilac/60 bg-white p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-lilac text-xs font-bold text-brand-purple">
                        {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-ink">
                          {lead.name}
                        </p>
                        <p className="truncate text-xs text-brand-ink/50">
                          {lead.mobile}
                        </p>
                        <p className="truncate text-xs text-brand-ink/40">
                          {lead.email || '—'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          lead.status === 'Won'
                            ? 'bg-emerald-100 text-emerald-600'
                            : lead.status === 'Missed'
                            ? 'bg-rose-100 text-rose-600'
                            : lead.status === 'Qualified'
                            ? 'bg-violet-100 text-brand-purple'
                            : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                      <div className="rounded-lg bg-brand-mist p-2">
                        <p className="text-brand-ink/50">Source</p>
                        <p className="font-semibold text-brand-ink">
                          {lead.source || 'Direct'}
                        </p>
                      </div>
                      <div className="rounded-lg bg-brand-mist p-2">
                        <p className="text-brand-ink/50">Category</p>
                        <p className="font-semibold text-brand-ink">
                          {lead.category || 'General'}
                        </p>
                      </div>
                      <div className="rounded-lg bg-brand-mist p-2">
                        <p className="text-brand-ink/50">Calls</p>
                        <p className="font-semibold text-brand-ink">
                          {CALLS.filter((c) => c.leadId === lead.id).length}
                        </p>
                      </div>
                    </div>
                    {/* Call lead button (working) */}
                    <button
                      onClick={() => onCallLead(lead)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
                    >
                      <PhoneCall size={13} /> Call Lead
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= PERMISSIONS DRAWER ================= */
function PermissionsDrawer({ agent, onClose, onSave }) {
  const [perms, setPerms] = useState(
    agent.permissions || { ...DEFAULT_PERMISSIONS }
  );

  const toggle = (key) => {
    setPerms((p) => ({ ...p, [key]: !p[key] }));
  };

  const enableAll = () => {
    const all = {};
    PERMISSION_KEYS.forEach((p) => (all[p.key] = true));
    setPerms(all);
  };

  const disableAll = () => {
    const none = {};
    PERMISSION_KEYS.forEach((p) => (none[p.key] = false));
    setPerms(none);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Shield size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                Permissions
              </h3>
              <p className="text-xs text-brand-ink/50">
                Control what {agent.name} can access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex gap-2">
            <button
              onClick={enableAll}
              className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
            >
              Enable All
            </button>
            <button
              onClick={disableAll}
              className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-100"
            >
              Disable All
            </button>
          </div>

          <div className="space-y-2">
            {PERMISSION_KEYS.map((p) => {
              const enabled = perms[p.key];
              return (
                <button
                  key={p.key}
                  onClick={() => toggle(p.key)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
                    enabled
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        enabled ? 'bg-emerald-100' : 'bg-brand-lilac/50'
                      }`}
                    >
                      {enabled ? <Unlock size={14} /> : <Lock size={14} />}
                    </span>
                    <span className="font-semibold">{p.label}</span>
                  </span>
                  <span
                    className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
                      enabled ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(perms)}
                className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
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
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-purple">
        <Icon size={14} />
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="text-brand-ink/50">{label}</span>
        <span className="truncate font-semibold text-brand-ink">{value}</span>
      </div>
    </div>
  );
}

function UsageStat({ icon: Icon, label, value, used, max }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div className="rounded-xl border border-brand-lilac/70 p-3">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-purple">
          <Icon size={14} />
        </span>
        <span className="font-display text-lg font-bold text-brand-ink">
          {value}
        </span>
      </div>
      <p className="mt-1.5 text-[10px] text-brand-ink/50">{label}</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-brand-lilac">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-magenta"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ================= AGENT MODAL (add / edit) ================= */
function AgentModal({ mode = 'add', initial = {}, teams = [], onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    email: initial.email || '',
    status: initial.status || 'Active',
    team: initial.team || 'General',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^[0-9]{10}$/.test(form.phone.trim()))
      return 'Phone must be exactly 10 digits.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      return 'Please enter a valid email.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        status: form.status,
        team: form.team,
      });
    }, 300);
  };

  const teamOptions = Array.from(new Set(['General', ...teams]));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Users2 size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {mode === 'add' ? 'Add New Agent' : 'Edit Agent'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {mode === 'add'
                  ? 'Fill in the agent details below.'
                  : 'Update the agent information.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ModalInput
            label="Full Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g. Ravi Kumar"
            icon={UserIcon}
            required
          />

          <ModalInput
            label="Phone Number"
            value={form.phone}
            onChange={(v) =>
              setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) })
            }
            placeholder="10-digit mobile number"
            icon={Phone}
            required
          />

          <ModalInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="agent@example.com"
            icon={Mail}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Team
            </label>
            <select
              value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              {teamOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Status
            </label>
            <div className="flex gap-2">
              {['Active', 'Break', 'Offline'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    form.status === s
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {s}
                </button>
              ))}
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
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving…
                </span>
              ) : mode === 'add' ? (
                'Add Agent'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= MODAL INPUT ================= */
function ModalInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  required,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-purple/60"
          />
        )}
        <input
          type={type}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-brand-lilac bg-white py-2.5 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15`}
        />
      </div>
    </div>
  );
}

/* ================= CONFIRM DIALOG ================= */
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger = true,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              danger ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            <AlertCircle size={18} />
          </div>
          <h3 className="font-display text-base font-semibold text-brand-ink">
            {title}
          </h3>
        </div>
        <p className="mb-5 text-sm text-brand-ink/60">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white ${
              danger
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}