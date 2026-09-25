// src/pages/superadmin/Logs.jsx
import { useMemo, useState } from 'react';
import {
  FileText, Search, X, Eye, Download, ChevronDown,
  Activity, UserCog, Users, Server, Phone, AlertTriangle, Shield,
  Clock, Globe, Monitor, MapPin,
  AlertCircle, CheckCircle2, Copy, Check,
  Layers, ListFilter, User as UserIcon, Tag,
} from 'lucide-react';
import { PROJECTS } from '../../data/mockData';

/* ============================================================
   TABS — every sub-item from the doc
   ============================================================ */
const TABS = [
  { key: 'all', label: 'All Logs', icon: ListFilter },
  { key: 'activity', label: 'Activity Logs', icon: Activity },
  { key: 'admin', label: 'Admin Logs', icon: UserCog },
  { key: 'agent', label: 'Agent Logs', icon: Users },
  { key: 'api', label: 'API Logs', icon: Server },
  { key: 'call', label: 'Call Logs', icon: Phone },
  { key: 'error', label: 'Error Logs', icon: AlertTriangle },
  { key: 'audit', label: 'Audit Trail', icon: Shield },
];

/* ============================================================
   DEFAULT LOG DATA
   ============================================================ */
const DEFAULT_LOGS = [
  // Activity
  { id: 'LOG-001', type: 'activity', at: '2026-09-25 10:24 AM', user: 'Admin1', role: 'admin', projectId: 'matrimony', action: 'Lead created', target: 'Lead #5', ip: '192.168.1.46', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: '—', newValue: 'Fresh lead created', detail: 'Added new lead via web form.' },
  { id: 'LOG-002', type: 'activity', at: '2026-09-25 10:10 AM', user: 'Agent1', role: 'agent', projectId: 'matrimony', action: 'Call logged', target: 'Call #C-002', ip: '192.168.1.47', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: '—', newValue: '3m 42s · Interested', detail: 'Outbound call to Kavitha M.' },
  { id: 'LOG-003', type: 'activity', at: '2026-09-25 09:55 AM', user: 'SuperAdmin', role: 'superadmin', projectId: null, action: 'Project created', target: 'Insurance CRM', ip: '192.168.1.45', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: '—', newValue: 'Trial project', detail: 'New project provisioned.' },

  // Admin
  { id: 'LOG-004', type: 'admin', at: '2026-09-24 06:30 PM', user: 'Admin2', role: 'admin', projectId: 'property', action: 'Campaign started', target: 'CMP-002', ip: '192.168.1.48', device: 'Chrome · Ubuntu', location: 'Bangalore, IN', result: 'success', previousValue: 'Draft', newValue: 'Active', detail: 'Started property lead boost campaign.' },
  { id: 'LOG-005', type: 'admin', at: '2026-09-24 04:12 PM', user: 'Admin1', role: 'admin', projectId: 'matrimony', action: 'Permission granted', target: 'Agent2', ip: '192.168.1.46', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: 'No export access', newValue: 'Export access granted', detail: 'Granted report export to agent.' },
  { id: 'LOG-006', type: 'admin', at: '2026-09-24 02:05 PM', user: 'Admin3', role: 'admin', projectId: 'insurance', action: 'Settings updated', target: 'IVR Configuration', ip: '192.168.1.49', device: 'Safari · macOS', location: 'Mumbai, IN', result: 'success', previousValue: 'Business hours 09:00-18:00', newValue: 'Business hours 08:00-20:00', detail: 'Extended IVR business hours.' },

  // Agent
  { id: 'LOG-007', type: 'agent', at: '2026-09-25 10:15 AM', user: 'Agent1', role: 'agent', projectId: 'matrimony', action: 'Lead status updated', target: 'Lead #LG-0042', ip: '192.168.1.47', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: 'Follow Up', newValue: 'Qualified', detail: 'Moved lead to qualified stage.' },
  { id: 'LOG-008', type: 'agent', at: '2026-09-25 09:45 AM', user: 'Agent2', role: 'agent', projectId: 'matrimony', action: 'Follow-up scheduled', target: 'Lead #LG-0039', ip: '192.168.1.50', device: 'Firefox · macOS', location: 'Mumbai, IN', result: 'success', previousValue: '—', newValue: 'Scheduled for Oct 25, 11:00 AM', detail: 'Set follow-up reminder.' },
  { id: 'LOG-009', type: 'agent', at: '2026-09-25 09:15 AM', user: 'Agent3', role: 'agent', projectId: 'property', action: 'Missed call', target: 'Call #C-014', ip: '192.168.1.51', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'failed', previousValue: '—', newValue: 'No answer', detail: 'Attempted call, no response.' },

  // API
  { id: 'LOG-010', type: 'api', at: '2026-09-25 10:20 AM', user: 'System', role: 'system', projectId: null, action: 'API request', target: '/api/leads', ip: '—', device: '—', location: '—', result: 'success', previousValue: '—', newValue: 'HTTP 200', detail: 'GET /api/leads — 24ms · 45 records.' },
  { id: 'LOG-011', type: 'api', at: '2026-09-25 10:18 AM', user: 'System', role: 'system', projectId: null, action: 'API request', target: '/api/calls', ip: '—', device: '—', location: '—', result: 'success', previousValue: '—', newValue: 'HTTP 200', detail: 'POST /api/calls — 112ms · call logged.' },
  { id: 'LOG-012', type: 'api', at: '2026-09-25 10:12 AM', user: 'System', role: 'system', projectId: null, action: 'API error', target: '/api/integrations/twilio', ip: '—', device: '—', location: '—', result: 'failed', previousValue: '—', newValue: 'HTTP 401', detail: 'Unauthorized — invalid API key.' },

  // Call
  { id: 'LOG-013', type: 'call', at: '2026-09-25 10:24 AM', user: 'Agent1', role: 'agent', projectId: 'matrimony', action: 'Inbound call', target: '+91 98765 43210', ip: '192.168.1.47', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: '—', newValue: 'Connected · 3m 42s', detail: 'Inbound from Venu Gopal.' },
  { id: 'LOG-014', type: 'call', at: '2026-09-25 09:45 AM', user: 'Agent1', role: 'agent', projectId: 'matrimony', action: 'Outbound call', target: '+91 98765 43211', ip: '192.168.1.47', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: '—', newValue: 'Connected · 1m 18s', detail: 'Follow-up with Kavitha M.' },
  { id: 'LOG-015', type: 'call', at: '2026-09-25 09:30 AM', user: 'Agent2', role: 'agent', projectId: 'matrimony', action: 'Missed call', target: '+91 98765 43212', ip: '192.168.1.50', device: 'Firefox · macOS', location: 'Mumbai, IN', result: 'failed', previousValue: '—', newValue: 'Missed · 0m 00s', detail: 'No answer from Ramesh K.' },

  // Error
  { id: 'LOG-016', type: 'error', at: '2026-09-25 10:12 AM', user: 'System', role: 'system', projectId: null, action: 'Integration failed', target: 'Twilio SMS', ip: '—', device: '—', location: '—', result: 'failed', previousValue: 'Connected', newValue: 'Disconnected', detail: 'API key expired — integration disconnected.' },
  { id: 'LOG-017', type: 'error', at: '2026-09-25 09:50 AM', user: 'Agent2', role: 'agent', projectId: 'matrimony', action: 'Login failed', target: 'Agent2 account', ip: '10.0.0.99', device: 'Safari · iPhone', location: 'Delhi, IN', result: 'failed', previousValue: '—', newValue: 'Incorrect password', detail: '3rd failed login attempt.' },
  { id: 'LOG-018', type: 'error', at: '2026-09-24 08:15 PM', user: 'System', role: 'system', projectId: 'property', action: 'Campaign error', target: 'CMP-002', ip: '—', device: '—', location: '—', result: 'failed', previousValue: 'Active', newValue: 'Paused', detail: 'Auto-paused: agent capacity reached.' },

  // Audit Trail
  { id: 'LOG-019', type: 'audit', at: '2026-09-24 03:00 PM', user: 'SuperAdmin', role: 'superadmin', projectId: null, action: 'Role changed', target: 'Admin role', ip: '192.168.1.45', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: 'Reports: No', newValue: 'Reports: Yes', detail: 'Granted Reports permission to Admin role.' },
  { id: 'LOG-020', type: 'audit', at: '2026-09-24 02:30 PM', user: 'SuperAdmin', role: 'superadmin', projectId: null, action: 'Project settings changed', target: 'Insurance CRM', ip: '192.168.1.45', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: 'Trial', newValue: 'Active', detail: 'Activated project and updated plan.' },
  { id: 'LOG-021', type: 'audit', at: '2026-09-24 11:00 AM', user: 'SuperAdmin', role: 'superadmin', projectId: null, action: 'API config updated', target: 'SendGrid SMTP', ip: '192.168.1.45', device: 'Chrome · Windows', location: 'Chennai, IN', result: 'success', previousValue: 'Disconnected', newValue: 'Connected', detail: 'Configured SMTP credentials.' },
];

/* ============================================================
   HELPERS
   ============================================================ */
const parseTime = (str) => {
  // Converts "2026-09-25 10:24 AM" → timestamp number
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 0;
  let [, y, mo, d, h, mi, ampm] = m;
  h = Number(h);
  if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
  return new Date(Number(y), Number(mo) - 1, Number(d), h, Number(mi)).getTime();
};

const projectName = (id) =>
  id ? PROJECTS.find((p) => p.id === id)?.name || id : '—';

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function Logs() {
  /* ========== STATE ========== */
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');
  const [roleOpen, setRoleOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [viewingLog, setViewingLog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);

  /* ========== HELPERS ========== */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    showToast('Log copied to clipboard');
  };

  /* ========== FILTERED ========== */
  const filtered = useMemo(() => {
    let rows = [...DEFAULT_LOGS];

    if (tab !== 'all') rows = rows.filter((l) => l.type === tab);
    if (roleFilter !== 'All') rows = rows.filter((l) => l.role === roleFilter);
    if (projectFilter !== 'All') rows = rows.filter((l) => l.projectId === projectFilter);
    if (resultFilter !== 'All') rows = rows.filter((l) => l.result === resultFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((l) =>
        `${l.user} ${l.action} ${l.target} ${l.role} ${l.detail} ${l.ip}`
          .toLowerCase()
          .includes(q)
      );
    }

    // Sort newest first using proper timestamp parsing
    return rows.sort((a, b) => parseTime(b.at) - parseTime(a.at));
  }, [tab, searchQuery, roleFilter, projectFilter, resultFilter]);

  /* ========== SUMMARY ========== */
  const summary = useMemo(() => {
    const total = DEFAULT_LOGS.length;
    const success = DEFAULT_LOGS.filter((l) => l.result === 'success').length;
    const failed = DEFAULT_LOGS.filter((l) => l.result === 'failed').length;
    const today = DEFAULT_LOGS.filter((l) => String(l.at).startsWith('2026-09-25')).length;
    return { total, success, failed, today };
  }, []);

  /* ========== EXPORT ========== */
  const handleExport = () => {
    if (filtered.length === 0) {
      showToast('No logs to export', 'error');
      return;
    }
    const rows = [
      ['Report', `System Logs — ${TABS.find((t) => t.key === tab)?.label}`],
      ['Generated', new Date().toISOString()],
      ['Total Records', filtered.length],
      [],
      ['ID', 'Timestamp', 'Type', 'User', 'Role', 'Project', 'Action', 'Target', 'IP', 'Device', 'Location', 'Result', 'Previous', 'New', 'Detail'],
      ...filtered.map((l) => [
        l.id, l.at, l.type, l.user, l.role,
        projectName(l.projectId), l.action, l.target, l.ip, l.device,
        l.location, l.result, l.previousValue, l.newValue, l.detail,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${tab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} logs`);
  };

  const hasFilters =
    !!searchQuery ||
    roleFilter !== 'All' ||
    projectFilter !== 'All' ||
    resultFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setProjectFilter('All');
    setResultFilter('All');
  };

  const handleTabChange = (key) => {
    setTab(key);
    setSearchQuery('');
    setRoleFilter('All');
    setProjectFilter('All');
    setResultFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            System Logs
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <FileText size={13} className="text-brand-purple" />
            Complete audit trail of platform activity.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
        >
          <Download size={14} /> Export
        </button>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard label="Total Logs" value={summary.total} sub="All categories" icon={FileText} color="purple" />
        <AnimatedStatCard label="Today" value={summary.today} sub="Logged in last 24h" icon={Clock} color="emerald" />
        <AnimatedStatCard label="Success" value={summary.success} sub="Completed actions" icon={CheckCircle2} color="amber" />
        <AnimatedStatCard label="Failed" value={summary.failed} sub="Require attention" icon={AlertTriangle} color="rose" />
      </div>

      {/* ================= TABS ================= */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          const count =
            key === 'all'
              ? DEFAULT_LOGS.length
              : DEFAULT_LOGS.filter((l) => l.type === key).length;
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                active
                  ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple shadow-sm'
                  : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
              }`}
            >
              <Icon size={13} />
              {label}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  active ? 'bg-brand-purple text-white' : 'bg-brand-lilac text-brand-purple'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
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
            placeholder="Search by user, action, target, IP..."
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
          label="Role"
          icon={UserIcon}
          value={roleFilter}
          options={['All', 'superadmin', 'admin', 'agent', 'system']}
          displayOptions={['All Roles', 'Super Admin', 'Admin', 'Agent', 'System']}
          open={roleOpen}
          onToggle={() => {
            setRoleOpen((s) => !s);
            setProjectOpen(false);
            setResultOpen(false);
          }}
          onChange={(v) => {
            setRoleFilter(v);
            setRoleOpen(false);
          }}
        />

        <DropdownFilter
          label="Project"
          icon={Layers}
          value={projectFilter === 'All' ? 'All' : projectName(projectFilter)}
          options={['All', ...PROJECTS.map((p) => p.id)]}
          displayOptions={['All Projects', ...PROJECTS.map((p) => p.name)]}
          open={projectOpen}
          onToggle={() => {
            setProjectOpen((s) => !s);
            setRoleOpen(false);
            setResultOpen(false);
          }}
          onChange={(v) => {
            setProjectFilter(v);
            setProjectOpen(false);
          }}
        />

        <DropdownFilter
          label="Result"
          icon={CheckCircle2}
          value={resultFilter}
          options={['All', 'success', 'failed']}
          displayOptions={['All Results', 'Success', 'Failed']}
          open={resultOpen}
          onToggle={() => {
            setResultOpen((s) => !s);
            setRoleOpen(false);
            setProjectOpen(false);
          }}
          onChange={(v) => {
            setResultFilter(v);
            setResultOpen(false);
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

      {/* ========== RESULTS COUNT ========== */}
      {filtered.length > 0 && (
        <p className="text-xs text-brand-ink/50">
          Showing <span className="font-semibold text-brand-ink">{filtered.length}</span> of{' '}
          <span className="font-semibold text-brand-ink">{DEFAULT_LOGS.length}</span> logs
          {hasFilters && ' (filtered)'}
        </p>
      )}

      {/* ================= LOGS LIST ================= */}
      {filtered.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => (
            <LogRow
              key={log.id}
              log={log}
              projectName={projectName}
              onView={() => setViewingLog(log)}
              onCopy={() =>
                handleCopy(
                  log.id,
                  `${log.at} · ${log.user} · ${log.action} · ${log.target}`
                )
              }
              copied={copiedId === log.id}
            />
          ))}
        </div>
      )}

      {/* ================= DETAIL DRAWER ================= */}
      {viewingLog && (
        <LogDetailsDrawer
          log={viewingLog}
          projectName={projectName}
          onClose={() => setViewingLog(null)}
          onCopy={(text) => {
            navigator.clipboard?.writeText(text);
            showToast('Log copied to clipboard');
          }}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= LOG ROW ================= */
function LogRow({ log, projectName, onView, onCopy, copied }) {
  const isFailed = log.result === 'failed';

  const typeColors = {
    activity: 'bg-violet-50 text-brand-purple',
    admin: 'bg-rose-50 text-brand-magenta',
    agent: 'bg-emerald-50 text-emerald-600',
    api: 'bg-blue-50 text-blue-600',
    call: 'bg-amber-50 text-amber-600',
    error: 'bg-rose-50 text-rose-500',
    audit: 'bg-violet-50 text-brand-purple',
  };

  const typeIcons = {
    activity: Activity,
    admin: UserCog,
    agent: Users,
    api: Server,
    call: Phone,
    error: AlertTriangle,
    audit: Shield,
  };

  const Icon = typeIcons[log.type] || Activity;
  const iconBg = typeColors[log.type] || typeColors.activity;

  return (
    <div
      className={`group flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
        isFailed
          ? 'border-rose-200 hover:border-rose-300'
          : 'border-brand-lilac/70 hover:border-brand-purple/40'
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-brand-ink">{log.action}</p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
              isFailed ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            {log.result.toUpperCase()}
          </span>
        </div>
        <p className="truncate text-xs text-brand-ink/50">{log.detail}</p>
      </div>

      <div className="hidden shrink-0 text-xs md:block">
        <p className="text-brand-ink/40">User</p>
        <p className="font-semibold text-brand-ink/70">{log.user}</p>
      </div>

      <span className="hidden shrink-0 rounded-full bg-brand-lilac px-2.5 py-1 text-[10px] font-bold capitalize text-brand-purple md:inline-block">
        {log.role}
      </span>

      <div className="hidden shrink-0 text-xs lg:block">
        <p className="text-brand-ink/40">Project</p>
        <p className="font-semibold text-brand-ink/70">{projectName(log.projectId)}</p>
      </div>

      <span className="hidden shrink-0 text-[10px] text-brand-ink/40 lg:block">
        {log.at}
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={onCopy}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple sm:flex"
          title="Copy log entry"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        </button>
        <button
          onClick={onView}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 text-[11px] font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
        >
          <Eye size={12} /> View
        </button>
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

/* ================= LOG DETAILS DRAWER ================= */
function LogDetailsDrawer({ log, projectName, onClose, onCopy }) {
  const Icon =
    log.type === 'admin'
      ? UserCog
      : log.type === 'agent'
      ? Users
      : log.type === 'api'
      ? Server
      : log.type === 'call'
      ? Phone
      : log.type === 'error'
      ? AlertTriangle
      : log.type === 'audit'
      ? Shield
      : Activity;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Icon size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">{log.action}</h3>
              <p className="text-xs text-brand-ink/50">{log.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Type" value={log.type.charAt(0).toUpperCase() + log.type.slice(1)} color="purple" />
            <InfoBox label="Result" value={log.result === 'success' ? 'Success' : 'Failed'} color={log.result === 'success' ? 'emerald' : 'rose'} />
            <InfoBox label="Role" value={log.role} color="amber" />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Audit Information</h4>
            <InfoRow icon={UserIcon} label="User" value={log.user} />
            <InfoRow icon={Shield} label="Role" value={log.role} />
            <InfoRow icon={Layers} label="Project" value={projectName(log.projectId)} />
            <InfoRow icon={Activity} label="Action" value={log.action} />
            <InfoRow icon={Tag} label="Target" value={log.target} />
            <InfoRow icon={Clock} label="Timestamp" value={log.at} />
            <InfoRow icon={Globe} label="IP Address" value={log.ip} />
            <InfoRow icon={Monitor} label="Device" value={log.device} />
            <InfoRow icon={MapPin} label="Location" value={log.location} />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Change Details</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-600/70">Previous Value</p>
                <p className="mt-1 break-words text-sm font-semibold text-rose-700">{log.previousValue}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600/70">New Value</p>
                <p className="mt-1 break-words text-sm font-semibold text-emerald-700">{log.newValue}</p>
              </div>
            </div>
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">Activity Result</h4>
            <div className="rounded-xl border border-brand-lilac bg-brand-mist/40 p-4">
              <p className="text-sm leading-relaxed text-brand-ink/80">{log.detail}</p>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <button
              onClick={() => onCopy(`${log.at} · ${log.user} · ${log.action} · ${log.target}`)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Copy size={14} /> Copy Log Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ANIMATED STAT CARD ================= */
function AnimatedStatCard({ label, value, sub, icon: Icon, color }) {
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
    <div className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 ${t.border} ${t.shadow}`}>
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} />
        </span>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
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
      <p className="mt-1 truncate text-sm font-bold capitalize tabular-nums">{value}</p>
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
        <span className="shrink-0 text-brand-ink/50">{label}</span>
        <span className="truncate font-semibold text-brand-ink">{value}</span>
      </div>
    </div>
  );
}

/* ================= EMPTY STATE ================= */
function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <FileText size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No logs match your filters' : 'No logs yet'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-xs font-semibold text-brand-purple hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

/* ================= TOAST ================= */
function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
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