// src/pages/superadmin/Security.jsx
import { useMemo, useState } from 'react';
import {
  Shield, Key, AlertTriangle, CheckCircle2, X, Search, Plus, Save,
  Trash2, Pencil, Eye, Check, Globe, Monitor, Smartphone, Tablet,
  Laptop, MapPin, LogIn, UserCheck, FileText, Zap, Download, Users,
  User as UserIcon, TrendingUp, Info, Bell, ShieldCheck, ShieldOff,
  ShieldAlert, AlertCircle, Signal, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ============================================================
   TABS
   ============================================================ */
const TABS = [
  { key: 'roles', label: 'Roles', icon: Shield },
  { key: 'permissions', label: 'Permissions', icon: Key },
  { key: 'access', label: 'Access Control', icon: UserCheck },
  { key: 'login', label: 'Login Activity', icon: LogIn },
  { key: 'logs', label: 'Security Logs', icon: FileText },
  { key: 'sessions', label: 'Session Management', icon: Monitor },
  { key: 'devices', label: 'IP / Device Activity', icon: Globe },
];

/* ============================================================
   PERMISSIONS
   ============================================================ */
const PERMISSION_KEYS = [
  { key: 'leads', label: 'Leads', icon: Users, category: 'Operations' },
  { key: 'calls', label: 'Calls', icon: Monitor, category: 'Operations' },
  { key: 'customers', label: 'Customers', icon: UserIcon, category: 'Operations' },
  { key: 'campaigns', label: 'Campaigns', icon: Bell, category: 'Operations' },
  { key: 'reports', label: 'Reports', icon: FileText, category: 'Analytics' },
  { key: 'communication', label: 'Communication', icon: Signal, category: 'Communication' },
  { key: 'ivr', label: 'IVR', icon: Zap, category: 'Communication' },
  { key: 'settings', label: 'Settings', icon: Settings, category: 'System' },
  { key: 'integrations', label: 'Integrations', icon: Globe, category: 'System' },
  { key: 'exports', label: 'Exports', icon: Download, category: 'Analytics' },
  { key: 'billing', label: 'Billing', icon: TrendingUp, category: 'System' },
  { key: 'systemLogs', label: 'System Logs', icon: FileText, category: 'System' },
];

/* ============================================================
   DEFAULT ROLE DEFINITIONS
   ============================================================ */
const DEFAULT_ROLES = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    description: 'Full platform access across all projects',
    color: 'magenta',
    userCount: 1,
    system: true,
    permissions: PERMISSION_KEYS.reduce(
      (acc, p) => ({ ...acc, [p.key]: true }),
      {}
    ),
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Project-level management and administration',
    color: 'purple',
    userCount: 3,
    system: true,
    permissions: {
      leads: true, calls: true, customers: true, campaigns: true,
      reports: true, communication: true, ivr: true, settings: true,
      integrations: false, exports: true, billing: true, systemLogs: false,
    },
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Leads + Calls access only',
    color: 'emerald',
    userCount: 3,
    system: true,
    permissions: {
      leads: true, calls: true, customers: false, campaigns: false,
      reports: false, communication: true, ivr: false, settings: false,
      integrations: false, exports: false, billing: false, systemLogs: false,
    },
  },
];

/* ============================================================
   DEFAULT LOGIN ACTIVITY
   ============================================================ */
const DEFAULT_LOGIN_ACTIVITY = [
  { id: 'L-001', user: 'SuperAdmin', role: 'superadmin', ip: '192.168.1.45', device: 'Chrome · Windows', location: 'Chennai, IN', status: 'Success', time: '2026-09-25 10:24 AM' },
  { id: 'L-002', user: 'Admin1', role: 'admin', ip: '192.168.1.46', device: 'Chrome · Windows', location: 'Chennai, IN', status: 'Success', time: '2026-09-25 09:15 AM' },
  { id: 'L-003', user: 'Agent1', role: 'agent', ip: '192.168.1.47', device: 'Firefox · macOS', location: 'Mumbai, IN', status: 'Success', time: '2026-09-25 09:00 AM' },
  { id: 'L-004', user: 'Agent2', role: 'agent', ip: '10.0.0.99', device: 'Safari · iPhone', location: 'Delhi, IN', status: 'Failed', time: '2026-09-24 06:32 PM' },
  { id: 'L-005', user: 'Admin2', role: 'admin', ip: '192.168.1.48', device: 'Chrome · Ubuntu', location: 'Bangalore, IN', status: 'Success', time: '2026-09-24 04:10 PM' },
];

/* ============================================================
   DEFAULT SECURITY LOGS
   ============================================================ */
const DEFAULT_SECURITY_LOGS = [
  { id: 'SEC-001', level: 'info', event: 'Login successful', user: 'SuperAdmin', ip: '192.168.1.45', time: 'Today, 10:24 AM', detail: 'Chrome on Windows · Chennai, IN' },
  { id: 'SEC-002', level: 'warn', event: 'Failed login attempt', user: 'Agent2', ip: '10.0.0.99', time: 'Yesterday, 6:32 PM', detail: 'Incorrect password · 3rd attempt' },
  { id: 'SEC-003', level: 'info', event: 'Permission changed', user: 'SuperAdmin', ip: '192.168.1.45', time: 'Yesterday, 3:00 PM', detail: 'Updated role: Admin → granted Reports access' },
  { id: 'SEC-004', level: 'warn', event: 'Session expired', user: 'Agent1', ip: '192.168.1.47', time: '2 days ago', detail: 'Session timeout after 30 minutes idle' },
  { id: 'SEC-005', level: 'critical', event: 'Blocked IP attempted access', user: 'Unknown', ip: '185.220.101.5', time: '3 days ago', detail: 'IP on blocklist · Auto-blocked' },
];

/* ============================================================
   DEFAULT SESSIONS
   ============================================================ */
const DEFAULT_SESSIONS = [
  { id: 'SES-001', user: 'SuperAdmin', role: 'superadmin', device: 'Chrome · Windows', ip: '192.168.1.45', location: 'Chennai, IN', started: 'Today, 9:12 AM', lastActive: 'Just now', current: true },
  { id: 'SES-002', user: 'Admin1', role: 'admin', device: 'Chrome · Windows', ip: '192.168.1.46', location: 'Chennai, IN', started: 'Today, 9:15 AM', lastActive: '5 min ago', current: false },
  { id: 'SES-003', user: 'Agent1', role: 'agent', device: 'Firefox · macOS', ip: '192.168.1.47', location: 'Mumbai, IN', started: 'Today, 9:00 AM', lastActive: '2 min ago', current: false },
];

/* ============================================================
   DEFAULT FEATURES
   ============================================================ */
const DEFAULT_FEATURES = [
  { id: '2fa', label: 'Two-Factor Authentication', description: 'Require OTP on every login', enabled: true, required: false },
  { id: 'ipWhitelist', label: 'IP Whitelisting', description: 'Only allow access from approved IPs', enabled: false, required: false },
  { id: 'sessionTimeout', label: 'Session Timeout', description: 'Auto-logout after 30 minutes idle', enabled: true, required: true },
  { id: 'loginAlerts', label: 'Login Alerts', description: 'Email alert on new device login', enabled: true, required: false },
  { id: 'passwordPolicy', label: 'Strong Password Policy', description: 'Min 12 chars, mixed case, number, symbol', enabled: true, required: true },
  { id: 'ipBlocklist', label: 'Auto IP Blocklist', description: 'Block IPs after 5 failed attempts', enabled: true, required: false },
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function Security() {
  const { role } = useAuth();

  /* ========== STATE ========== */
  const [tab, setTab] = useState('roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [loginActivity] = useState(DEFAULT_LOGIN_ACTIVITY);
  const [securityLogs] = useState(DEFAULT_SECURITY_LOGS);
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  /* ========== MODALS ========== */
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmSessionEnd, setConfirmSessionEnd] = useState(null);

  /* ========== HELPERS ========== */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ========== FILTERED ========== */
  const filteredLogin = useMemo(() => {
    if (!searchQuery.trim()) return loginActivity;
    const q = searchQuery.toLowerCase();
    return loginActivity.filter((l) =>
      `${l.user} ${l.ip} ${l.device} ${l.location}`.toLowerCase().includes(q)
    );
  }, [loginActivity, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return securityLogs;
    const q = searchQuery.toLowerCase();
    return securityLogs.filter((l) =>
      `${l.event} ${l.user} ${l.ip} ${l.detail}`.toLowerCase().includes(q)
    );
  }, [securityLogs, searchQuery]);

  /* ========== ACTIONS ========== */
  const handleTogglePermission = (roleId, permKey) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? {
              ...r,
              permissions: {
                ...r.permissions,
                [permKey]: !r.permissions[permKey],
              },
            }
          : r
      )
    );
  };

  const handleToggleFeature = (featureId) => {
    const f = features.find((x) => x.id === featureId);
    if (!f || f.required) return;
    setFeatures((prev) =>
      prev.map((x) =>
        x.id === featureId && !x.required ? { ...x, enabled: !x.enabled } : x
      )
    );
    showToast(
      `${f.label} turned ${!f.enabled ? 'ON' : 'OFF'}`,
      !f.enabled ? 'success' : 'error'
    );
  };

  /* ========== FIXED: CREATE + EDIT ROLE ========== */
  const handleSaveRole = (roleId, data) => {
    if (roleId) {
      // EDIT existing role
      setRoles((prev) =>
        prev.map((r) => (r.id === roleId ? { ...r, ...data } : r))
      );
      showToast(`Role "${data.name}" updated`);
    } else {
      // CREATE new role
      const newRole = {
        id: 'role-' + String(Date.now()).slice(-6),
        name: data.name,
        description: data.description,
        color: data.color,
        userCount: 0,
        system: false,
        permissions: data.permissions,
      };
      setRoles((prev) => [...prev, newRole]);
      showToast(`Role "${data.name}" created`);
    }
    setEditingRole(null);
  };

  const handleDeleteRole = (roleId) => {
    const roleToDelete = roles.find((r) => r.id === roleId);
    if (roleToDelete?.system) {
      showToast('System roles cannot be deleted', 'error');
      setConfirmDelete(null);
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    setConfirmDelete(null);
    showToast(`Role "${roleToDelete?.name || ''}" deleted`, 'error');
  };

  const handleEndSession = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setConfirmSessionEnd(null);
    showToast('Session terminated', 'error');
  };

  /* ========== FIXED: EXPORT includes roles ========== */
  const handleExport = () => {
    let rows = [];
    if (tab === 'roles') {
      rows = [
        ['ID', 'Name', 'Description', 'Users', 'Type', 'Permissions'],
        ...roles.map((r) => [
          r.id,
          r.name,
          r.description,
          r.userCount,
          r.system ? 'System' : 'Custom',
          Object.values(r.permissions).filter(Boolean).length,
        ]),
      ];
    } else if (tab === 'login') {
      rows = [
        ['ID', 'User', 'Role', 'IP', 'Device', 'Location', 'Status', 'Time'],
        ...filteredLogin.map((l) => [l.id, l.user, l.role, l.ip, l.device, l.location, l.status, l.time]),
      ];
    } else if (tab === 'logs') {
      rows = [
        ['ID', 'Level', 'Event', 'User', 'IP', 'Detail', 'Time'],
        ...filteredLogs.map((l) => [l.id, l.level, l.event, l.user, l.ip, l.detail, l.time]),
      ];
    } else if (tab === 'sessions') {
      rows = [
        ['ID', 'User', 'Role', 'Device', 'IP', 'Location', 'Started', 'Last Active'],
        ...sessions.map((s) => [s.id, s.user, s.role, s.device, s.ip, s.location, s.started, s.lastActive]),
      ];
    } else if (tab === 'permissions') {
      rows = [
        ['Role', ...PERMISSION_KEYS.map((p) => p.label)],
        ...roles.map((r) => [r.name, ...PERMISSION_KEYS.map((p) => (r.permissions[p.key] ? 'Yes' : 'No'))]),
      ];
    }
    if (rows.length === 0) {
      showToast('Nothing to export on this tab', 'error');
      return;
    }
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-${tab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${tab} data`);
  };

  const canExport = ['roles', 'permissions', 'login', 'logs', 'sessions'].includes(tab);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Security &amp; Permissions
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Shield size={13} className="text-brand-purple" />
            Role-based access, sessions, and audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canExport && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
            >
              <Download size={14} /> Export
            </button>
          )}
        </div>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Active Roles"
          value={roles.length}
          sub={`${roles.reduce((s, r) => s + r.userCount, 0)} users`}
          icon={Shield}
          color="purple"
        />
        <AnimatedStatCard
          label="Enabled Features"
          value={features.filter((f) => f.enabled).length}
          sub={`of ${features.length} available`}
          icon={CheckCircle2}
          color="emerald"
        />
        <AnimatedStatCard
          label="Active Sessions"
          value={sessions.length}
          sub={`${sessions.filter((s) => s.current).length} current`}
          icon={Monitor}
          color="amber"
        />
        <AnimatedStatCard
          label="Security Alerts"
          value={securityLogs.filter((l) => l.level !== 'info').length}
          sub="Require attention"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* ================= TABS ================= */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                active
                  ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple shadow-sm'
                  : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}

        {['login', 'logs'].includes(tab) && (
          <div className="relative ml-auto">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-48 rounded-xl border border-brand-lilac bg-white py-2 pl-9 pr-8 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-brand-lilac"
              >
                <X size={12} className="text-brand-ink/50" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= TAB CONTENT ================= */}
      {tab === 'roles' && (
        <RolesTab
          roles={roles}
          onEdit={(r) => setEditingRole(r)}
          onView={(r) => setViewingRole(r)}
          onDelete={(r) => setConfirmDelete(r)}
          onCreate={() =>
            setEditingRole({
              id: '',
              name: '',
              description: '',
              color: 'purple',
              permissions: PERMISSION_KEYS.reduce((acc, p) => ({ ...acc, [p.key]: false }), {}),
              system: false,
              userCount: 0,
            })
          }
        />
      )}

      {tab === 'permissions' && (
        <PermissionsTab roles={roles} onToggle={handleTogglePermission} />
      )}

      {tab === 'access' && (
        <AccessControlTab features={features} onToggle={handleToggleFeature} />
      )}

      {tab === 'login' && (
        <LoginActivityTab
          activity={filteredLogin}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      )}

      {tab === 'logs' && (
        <SecurityLogsTab
          logs={filteredLogs}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      )}

      {tab === 'sessions' && (
        <SessionsTab sessions={sessions} onEnd={(s) => setConfirmSessionEnd(s)} />
      )}

      {tab === 'devices' && <DevicesTab />}

      {/* ================= MODALS ================= */}
      {editingRole && (
        <RoleModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSave={handleSaveRole}
        />
      )}

      {viewingRole && (
        <RoleDetailsDrawer
          role={viewingRole}
          onClose={() => setViewingRole(null)}
          onEdit={() => {
            setEditingRole(viewingRole);
            setViewingRole(null);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete role?"
          message={`This will permanently delete "${confirmDelete.name}". Users assigned to this role must be reassigned.`}
          confirmLabel="Delete Role"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteRole(confirmDelete.id)}
        />
      )}

      {confirmSessionEnd && (
        <ConfirmDialog
          title="End session?"
          message={`This will forcibly log out ${confirmSessionEnd.user} from ${confirmSessionEnd.device}.`}
          confirmLabel="End Session"
          onCancel={() => setConfirmSessionEnd(null)}
          onConfirm={() => handleEndSession(confirmSessionEnd.id)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= ROLES TAB ================= */
function RolesTab({ roles, onEdit, onView, onDelete, onCreate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-brand-ink/50">
          {roles.length} roles · {roles.reduce((s, r) => s + r.userCount, 0)} users total
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-magenta px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
        >
          <Plus size={12} /> Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => {
          const themeColors = {
            magenta: 'from-brand-magenta to-brand-purple',
            purple: 'from-brand-purple to-brand-magenta',
            emerald: 'from-emerald-500 to-emerald-600',
            amber: 'from-amber-500 to-orange-500',
            rose: 'from-rose-500 to-rose-600',
          };
          const gradient = themeColors[r.color] || themeColors.purple;
          const permCount = Object.values(r.permissions).filter(Boolean).length;
          const permPct = Math.round((permCount / PERMISSION_KEYS.length) * 100);

          return (
            <div
              key={r.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-brand-lilac/80 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-purple/50 hover:shadow-[0_20px_45px_-15px_rgba(139,47,214,0.25)]"
            >
              <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${gradient} transition-transform duration-500 group-hover:scale-x-100`} />

              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Shield size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold text-brand-ink">{r.name}</p>
                    {r.system && (
                      <span className="shrink-0 rounded-full bg-violet-100 px-1.5 py-0.5 text-[8px] font-bold text-brand-purple">
                        SYSTEM
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-brand-ink/50">{r.description}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-brand-mist p-2 text-center">
                  <p className="text-[10px] text-brand-ink/50">Users</p>
                  <p className="font-display text-lg font-bold tabular-nums text-brand-ink">
                    {r.userCount}
                  </p>
                </div>
                <div className="rounded-lg bg-brand-mist p-2 text-center">
                  <p className="text-[10px] text-brand-ink/50">Perms</p>
                  <p className="font-display text-lg font-bold tabular-nums text-brand-ink">
                    {permCount}/{PERMISSION_KEYS.length}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="text-brand-ink/50">Access level</span>
                  <span className="font-bold tabular-nums text-brand-purple">{permPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                    style={{ width: `${permPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => onView(r)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                >
                  <Eye size={12} /> View
                </button>
                <button
                  onClick={() => onEdit(r)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2 text-xs font-semibold text-brand-ink transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/40 hover:text-brand-purple"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => !r.system && onDelete(r)}
                  disabled={r.system}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all ${
                    r.system
                      ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                      : 'border-rose-200 bg-white text-rose-500 hover:bg-rose-50'
                  }`}
                >
                  <Trash2 size={12} /> {r.system ? 'Locked' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= PERMISSIONS TAB ================= */
function PermissionsTab({ roles, onToggle }) {
  return (
    <div className="space-y-4">
      <div className="card !p-4">
        <div className="mb-3 flex items-center gap-2">
          <Key size={14} className="text-brand-purple" />
          <h3 className="font-display text-sm font-semibold text-brand-ink">
            Permission Matrix
          </h3>
          <span className="text-xs text-brand-ink/40">
            · Click any cell to toggle access
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-brand-lilac">
                <th className="sticky left-0 bg-white px-4 py-3 text-left font-semibold text-brand-ink">
                  Permission
                </th>
                {roles.map((r) => (
                  <th key={r.id} className="px-4 py-3 text-center font-semibold text-brand-ink">
                    <div className="flex flex-col items-center gap-1">
                      <span>{r.name}</span>
                      <span className="text-[9px] font-normal text-brand-ink/40">
                        {r.userCount} users
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_KEYS.map((perm) => {
                const Icon = perm.icon;
                return (
                  <tr key={perm.key} className="border-b border-brand-lilac/60 hover:bg-brand-mist/40">
                    <td className="sticky left-0 bg-white px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-purple">
                          <Icon size={13} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-brand-ink">
                            {perm.label}
                          </p>
                          <p className="text-[9px] text-brand-ink/50">{perm.category}</p>
                        </div>
                      </div>
                    </td>
                    {roles.map((r) => {
                      const enabled = r.permissions[perm.key];
                      return (
                        <td key={r.id} className="px-4 py-3 text-center">
                          <button
                            onClick={() => onToggle(r.id, perm.key)}
                            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-all hover:scale-110 ${
                              enabled
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-brand-lilac bg-white hover:border-brand-purple/40'
                            }`}
                          >
                            {enabled && <Check size={13} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= ACCESS CONTROL TAB ================= */
function AccessControlTab({ features, onToggle }) {
  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-brand-purple" />
          <h3 className="font-display text-sm font-semibold text-brand-ink">
            Security Features
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.id}
              className={`flex items-start gap-3 rounded-xl border-2 bg-white p-4 transition-all ${
                f.enabled
                  ? 'border-emerald-200 hover:border-emerald-300'
                  : 'border-brand-lilac/70 hover:border-brand-purple/40'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  f.enabled
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {f.enabled ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {f.label}
                  </p>
                  {f.required && (
                    <span className="shrink-0 rounded-full bg-violet-100 px-1.5 py-0.5 text-[8px] font-bold text-brand-purple">
                      REQUIRED
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-brand-ink/50">
                  {f.description}
                </p>
              </div>
              <button
                onClick={() => onToggle(f.id)}
                disabled={f.required}
                className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  f.required ? 'cursor-not-allowed opacity-60' : ''
                } ${f.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    f.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card !p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" />
          <h3 className="font-display text-sm font-semibold text-brand-ink">
            Global Access Rules
          </h3>
        </div>
        <div className="space-y-2">
          <InfoRow label="Password minimum length" value="12 characters" />
          <InfoRow label="Session timeout" value="30 minutes" />
          <InfoRow label="Failed login attempts before lock" value="5 attempts" />
          <InfoRow label="IP blocklist" value="1,240 blocked IPs" />
          <InfoRow label="Device fingerprinting" value="Enabled" />
        </div>
      </div>
    </div>
  );
}

/* ================= LOGIN ACTIVITY TAB ================= */
function LoginActivityTab({ activity, searchQuery, onClearSearch }) {
  return (
    <div className="space-y-4">
      {activity.length === 0 ? (
        <EmptyState
          hasFilters={!!searchQuery}
          message="No login activity found"
          onClear={onClearSearch}
        />
      ) : (
        <div className="space-y-2">
          {activity.map((l) => (
            <div
              key={l.id}
              className={`flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
                l.status === 'Failed'
                  ? 'border-rose-200 hover:border-rose-300'
                  : 'border-brand-lilac/70 hover:border-brand-purple/40'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  l.status === 'Failed'
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {l.status === 'Failed' ? (
                  <ShieldAlert size={16} />
                ) : (
                  <LogIn size={16} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-ink">
                  {l.user}
                </p>
                <p className="truncate text-xs text-brand-ink/50">
                  {l.role} · {l.ip}
                </p>
              </div>

              <div className="hidden shrink-0 text-xs md:block">
                <p className="text-brand-ink/40">Device</p>
                <p className="font-semibold text-brand-ink/70">{l.device}</p>
              </div>

              <div className="hidden shrink-0 text-xs lg:block">
                <p className="text-brand-ink/40">Location</p>
                <p className="font-semibold text-brand-ink/70">{l.location}</p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  l.status === 'Success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {l.status.toUpperCase()}
              </span>

              <span className="hidden shrink-0 text-[10px] text-brand-ink/40 lg:block">
                {l.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= SECURITY LOGS TAB ================= */
function SecurityLogsTab({ logs, searchQuery, onClearSearch }) {
  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <EmptyState
          hasFilters={!!searchQuery}
          message="No security logs"
          onClear={onClearSearch}
        />
      ) : (
        <div className="space-y-2">
          {logs.map((l) => {
            const levelStyles = {
              info: 'border-violet-200 hover:border-violet-300',
              warn: 'border-amber-200 hover:border-amber-300',
              critical: 'border-rose-200 hover:border-rose-300',
            };
            const iconStyles = {
              info: 'bg-violet-50 text-brand-purple',
              warn: 'bg-amber-50 text-amber-600',
              critical: 'bg-rose-50 text-rose-500',
            };
            const Icon =
              l.level === 'critical'
                ? AlertCircle
                : l.level === 'warn'
                ? AlertTriangle
                : Info;

            return (
              <div
                key={l.id}
                className={`flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${levelStyles[l.level]}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyles[l.level]}`}
                >
                  <Icon size={16} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {l.event}
                  </p>
                  <p className="truncate text-xs text-brand-ink/50">{l.detail}</p>
                </div>

                <div className="hidden shrink-0 text-xs md:block">
                  <p className="text-brand-ink/40">User</p>
                  <p className="font-semibold text-brand-ink/70">{l.user}</p>
                </div>

                <span className="shrink-0 font-mono text-[10px] text-brand-ink/50">
                  {l.ip}
                </span>

                <span className="hidden shrink-0 text-[10px] text-brand-ink/40 lg:block">
                  {l.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================= SESSIONS TAB ================= */
function SessionsTab({ sessions, onEnd }) {
  return (
    <div className="space-y-4">
      {sessions.length === 0 ? (
        <EmptyState hasFilters={false} message="No active sessions" />
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border-2 bg-white px-3 py-3 transition-all hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-4 ${
                s.current
                  ? 'border-emerald-200 hover:border-emerald-300'
                  : 'border-brand-lilac/70 hover:border-brand-purple/40'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  s.current
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-violet-50 text-brand-purple'
                }`}
              >
                <Monitor size={16} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-ink">
                  {s.user}
                </p>
                <p className="truncate text-xs text-brand-ink/50">{s.device}</p>
              </div>

              <div className="hidden shrink-0 text-xs md:block">
                <p className="text-brand-ink/40">IP</p>
                <p className="font-mono text-[11px] font-semibold text-brand-ink/70">
                  {s.ip}
                </p>
              </div>

              <div className="hidden shrink-0 text-xs lg:block">
                <p className="text-brand-ink/40">Started</p>
                <p className="font-semibold text-brand-ink/70">{s.started}</p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  s.current
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-violet-100 text-brand-purple'
                }`}
              >
                {s.current ? 'THIS SESSION' : s.lastActive}
              </span>

              {!s.current && (
                <button
                  onClick={() => onEnd(s)}
                  className="shrink-0 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-50"
                >
                  End
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= DEVICES TAB ================= */
function DevicesTab() {
  const devices = [
    { id: 1, name: 'Chrome on Windows', icon: Laptop, users: 24, lastSeen: 'Active now', trusted: true },
    { id: 2, name: 'Firefox on macOS', icon: Laptop, users: 8, lastSeen: '5 min ago', trusted: true },
    { id: 3, name: 'Safari on iPhone', icon: Smartphone, users: 12, lastSeen: '1 hour ago', trusted: true },
    { id: 4, name: 'Chrome on Android', icon: Smartphone, users: 6, lastSeen: '3 hours ago', trusted: false },
    { id: 5, name: 'Edge on Windows', icon: Laptop, users: 3, lastSeen: 'Yesterday', trusted: true },
    { id: 6, name: 'Safari on iPad', icon: Tablet, users: 2, lastSeen: '2 days ago', trusted: false },
  ];

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-brand-purple" />
          <h3 className="font-display text-sm font-semibold text-brand-ink">
            Device Activity
          </h3>
          <span className="text-xs text-brand-ink/40">
            · {devices.length} device types in use
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {devices.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-brand-purple">
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {d.name}
                  </p>
                  <p className="truncate text-[10px] text-brand-ink/50">
                    {d.users} users · {d.lastSeen}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    d.trusted
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {d.trusted ? 'TRUSTED' : 'UNVERIFIED'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card !p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-brand-purple" />
          <h3 className="font-display text-sm font-semibold text-brand-ink">
            IP Address Activity
          </h3>
        </div>
        <div className="space-y-2">
          <InfoRow label="Total unique IPs (last 30 days)" value="142" />
          <InfoRow label="Blocked IPs" value="1,240" />
          <InfoRow label="Whitelisted IPs" value="18" />
          <InfoRow label="Suspicious IP attempts" value="7" />
        </div>
      </div>
    </div>
  );
}

/* ================= ROLE MODAL ================= */
function RoleModal({ role, onClose, onSave }) {
  const isEdit = !!role.id;
  const [form, setForm] = useState({
    name: role.name || '',
    description: role.description || '',
    color: role.color || 'purple',
    permissions:
      role.permissions ||
      PERMISSION_KEYS.reduce((acc, p) => ({ ...acc, [p.key]: false }), {}),
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Role name is required.');
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSave(role.id, form);
    }, 400);
  };

  const COLORS = ['magenta', 'purple', 'emerald', 'amber', 'rose'];
  const selectedCount = Object.values(form.permissions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">
                {isEdit ? 'Edit Role' : 'Create Role'}
              </h3>
              <p className="text-xs text-brand-ink/50">
                {isEdit ? 'Update role and permissions' : 'Define a new role'}
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
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Role Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Moderator"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What this role can do"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Color Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-9 w-9 rounded-full transition-all ${
                    form.color === c
                      ? 'ring-2 ring-brand-purple ring-offset-2'
                      : 'hover:scale-110'
                  } ${
                    c === 'magenta'
                      ? 'bg-brand-magenta'
                      : c === 'purple'
                      ? 'bg-brand-purple'
                      : c === 'emerald'
                      ? 'bg-emerald-500'
                      : c === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-brand-ink/70">
              Permissions ({selectedCount}/{PERMISSION_KEYS.length})
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSION_KEYS.map((p) => {
                const Icon = p.icon;
                const enabled = form.permissions[p.key];
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleToggle(p.key)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition-all ${
                      enabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                        enabled ? 'bg-emerald-100' : 'bg-brand-lilac/50'
                      }`}
                    >
                      <Icon size={12} />
                    </span>
                    <span className="flex-1 truncate font-semibold">{p.label}</span>
                    {enabled && <Check size={12} />}
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
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? (
                'Saving…'
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Save size={14} /> {isEdit ? 'Save Changes' : 'Create Role'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= ROLE DETAILS DRAWER ================= */
function RoleDetailsDrawer({ role, onClose, onEdit }) {
  const permCount = Object.values(role.permissions).filter(Boolean).length;

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
                {role.name}
              </h3>
              <p className="text-xs text-brand-ink/50">{role.description}</p>
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
            <InfoBox label="Users" value={role.userCount} color="purple" />
            <InfoBox
              label="Permissions"
              value={`${permCount}/${PERMISSION_KEYS.length}`}
              color="emerald"
            />
            <InfoBox
              label="Type"
              value={role.system ? 'System' : 'Custom'}
              color="amber"
            />
          </div>

          <div className="card !p-4 space-y-3">
            <h4 className="font-display text-sm font-semibold text-brand-ink">
              Permissions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSION_KEYS.map((p) => {
                const Icon = p.icon;
                const enabled = role.permissions[p.key];
                return (
                  <div
                    key={p.key}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
                      enabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Icon size={11} />
                      {p.label}
                    </span>
                    {enabled && <Check size={12} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 border-t border-brand-lilac bg-white p-5">
            <button
              onClick={onEdit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              <Pencil size={14} /> Edit Role
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
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm">
      <span className="text-brand-ink/60">{label}</span>
      <span className="truncate font-semibold text-brand-ink">{value}</span>
    </div>
  );
}

/* ================= EMPTY STATE ================= */
function EmptyState({ hasFilters, message, onClear }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
        <Shield size={22} />
      </div>
      <p className="font-display text-base font-semibold text-brand-ink">
        {hasFilters ? 'No results match your search' : message}
      </p>
      {hasFilters && onClear && (
        <button
          onClick={onClear}
          className="text-xs font-semibold text-brand-purple hover:underline"
        >
          Clear search
        </button>
      )}
    </div>
  );
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
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
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