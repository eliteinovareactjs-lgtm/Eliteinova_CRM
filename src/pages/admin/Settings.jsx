// src/pages/admin/Settings.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  User, Shield, Building2, Bell, Palette, CreditCard, Save, Check,
  Eye, EyeOff, Phone, Mail, Users, Database, Zap, AlertTriangle,
  Plus, Trash2, Globe, Lock, MapPin, UserCog, Target, Camera,
  Monitor, Smartphone, LogOut, Activity, Key, Calendar, Filter,
  ChevronDown, X, Info, CheckCircle2, Clock, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AGENTS, LEADS } from '../../data/mockData';

const STORAGE_PREFIX = 'settings:';

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

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const formatRelative = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const DEFAULT_LOGIN_HISTORY = [
  {
    id: 'lg-1',
    device: 'Chrome on Windows',
    browser: 'Chrome',
    os: 'Windows 11',
    location: 'Chennai, IN',
    ip: '103.21.58.42',
    time: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'success',
    current: true,
  },
  {
    id: 'lg-2',
    device: 'Safari on iPhone',
    browser: 'Safari',
    os: 'iOS 17',
    location: 'Chennai, IN',
    ip: '103.21.58.43',
    time: new Date(Date.now() - 86400000).toISOString(),
    status: 'success',
    current: false,
  },
  {
    id: 'lg-3',
    device: 'Firefox on macOS',
    browser: 'Firefox',
    os: 'macOS Sonoma',
    location: 'Mumbai, IN',
    ip: '49.36.12.88',
    time: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'failed',
    current: false,
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Settings() {
  const { role, user, activeWebsite, activeWebsiteId, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const handleSave = () => {
    showToast('Settings saved successfully');
  };

  const TABS = [
    { key: 'profile',       label: 'My Profile',       icon: User },
    { key: 'security',      label: 'Security',         icon: Shield },
    { key: 'activity',      label: 'Login Activity',   icon: Activity },
    { key: 'notifications', label: 'Notifications',    icon: Bell },
    { key: 'website',       label: 'Website',          icon: Building2 },
    { key: 'team',          label: 'Team',             icon: Users },
    { key: 'appearance',    label: 'Appearance',       icon: Palette },
    { key: 'ivr',           label: 'IVR & Line',       icon: Phone },
    { key: 'billing',       label: 'Billing',          icon: CreditCard },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Settings</h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Building2 size={13} className="text-brand-magenta" />
              Preferences for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { logout?.(); }}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={14} /> Logout
            </button>
            <button
              onClick={handleSave}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {activeTab === 'profile'       && <MyProfileTab showToast={showToast} />}
            {activeTab === 'security'      && <SecurityTab showToast={showToast} />}
            {activeTab === 'activity'      && <LoginActivityTab showToast={showToast} />}
            {activeTab === 'notifications' && <NotificationsTab showToast={showToast} />}
            {activeTab === 'website'       && <WebsiteTab showToast={showToast} />}
            {activeTab === 'team'          && <TeamTab />}
            {activeTab === 'appearance'    && <AppearanceTab showToast={showToast} />}
            {activeTab === 'ivr'           && <IvrTab showToast={showToast} />}
            {activeTab === 'billing'       && <BillingTab />}
          </div>

          <div className="space-y-5">
            <InfoCard />
            <WebsiteHealthCard />
          </div>
        </div>

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1 — MY PROFILE
   ═══════════════════════════════════════════════════════════════ */
function MyProfileTab({ showToast }) {
  const { role, user, activeWebsite, activeWebsiteId } = useAuth();

  const [profile, setProfile] = useState(() =>
    loadState(`profile:${activeWebsiteId}`, {
      name: user?.name || 'Admin User',
      email: 'admin@eliteinova.com',
      phone: '+91 62047 20000',
      emergencyName: 'Supervisor',
      emergencyPhone: '+91 90000 00000',
      avatar: user?.avatar || 'AD',
    })
  );

  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);

  useEffect(() => { saveState(`profile:${activeWebsiteId}`, profile); }, [profile, activeWebsiteId]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('File must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile({ ...profile, avatar: ev.target.result });
      setAvatarPreview(ev.target.result);
      showToast('Profile photo updated');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfile({ ...profile, avatar: (user?.name || 'AD').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() });
    setAvatarPreview(null);
    showToast('Profile photo removed', 'error');
  };

  return (
    <>
      <Section title="My Profile" subtitle="Your personal admin account information.">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative">
            {avatarPreview ? (
              typeof avatarPreview === 'string' && avatarPreview.startsWith('data:') ? (
                <img src={avatarPreview} alt="avatar" className="h-20 w-20 rounded-2xl object-cover shadow-card" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-2xl font-bold text-white shadow-card">
                  {avatarPreview}
                </div>
              )
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-2xl font-bold text-white shadow-card">
                {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'AD'}
              </div>
            )}
            <label
              className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-md transition-transform hover:scale-110"
              title="Change photo"
            >
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold text-brand-ink">{profile.name}</p>
            <p className="text-sm capitalize text-brand-ink/50">
              {role} · {activeWebsite?.name}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.avatar && typeof profile.avatar === 'string' && profile.avatar.startsWith('data:') && (
                <button
                  onClick={handleRemoveAvatar}
                  className="text-[11px] font-semibold text-rose-500 hover:underline"
                >
                  Remove photo
                </button>
              )}
              <span className="text-[11px] text-brand-ink/40">PNG or JPG, max 2MB</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Full Name"
            value={profile.name}
            onChange={(v) => setProfile({ ...profile, name: v })}
          />
          <InputField
            label="Username / ID"
            value={user?.id || 'admin-001'}
            disabled
          />
          <InputField
            label="Email"
            type="email"
            value={profile.email}
            onChange={(v) => setProfile({ ...profile, email: v })}
            icon={Mail}
          />
          <InputField
            label="Phone"
            value={profile.phone}
            onChange={(v) => setProfile({ ...profile, phone: v })}
            icon={Phone}
          />
        </div>
      </Section>

      <Section title="Emergency Contact" subtitle="For critical alerts only.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Contact Name"
            value={profile.emergencyName}
            onChange={(v) => setProfile({ ...profile, emergencyName: v })}
          />
          <InputField
            label="Contact Phone"
            value={profile.emergencyPhone}
            onChange={(v) => setProfile({ ...profile, emergencyPhone: v })}
            icon={Phone}
          />
        </div>
      </Section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 — SECURITY (with working password change)
   ═══════════════════════════════════════════════════════════════ */
function SecurityTab({ showToast }) {
  const { activeWebsiteId } = useAuth();

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [twoFA, setTwoFA] = useState(() => loadState(`2fa:${activeWebsiteId}`, false));
  const [sessionTimeout, setSessionTimeout] = useState(() => loadState(`sessionTimeout:${activeWebsiteId}`, true));
  const [loginAlerts, setLoginAlerts] = useState(() => loadState(`loginAlerts:${activeWebsiteId}`, true));

  useEffect(() => { saveState(`2fa:${activeWebsiteId}`, twoFA); }, [twoFA, activeWebsiteId]);
  useEffect(() => { saveState(`sessionTimeout:${activeWebsiteId}`, sessionTimeout); }, [sessionTimeout, activeWebsiteId]);
  useEffect(() => { saveState(`loginAlerts:${activeWebsiteId}`, loginAlerts); }, [loginAlerts, activeWebsiteId]);

  /* Password strength meter */
  useEffect(() => {
    const p = passwords.next;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setPasswordStrength(score);
  }, [passwords.next]);

  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength];
  const strengthColor = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500'][passwordStrength];

  const handleChangePassword = (e) => {
    e.preventDefault();
    const next = {};
    if (!passwords.current) next.current = 'Current password is required.';
    if (!passwords.next) next.next = 'New password is required.';
    else if (passwords.next.length < 8) next.next = 'Must be at least 8 characters.';
    else if (passwords.next === passwords.current) next.next = 'New password must differ from current.';
    if (passwords.next !== passwords.confirm) next.confirm = 'Passwords do not match.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPasswords({ current: '', next: '', confirm: '' });
    showToast('Password changed successfully');
  };

  return (
    <>
      <Section title="Change Password" subtitle="Last changed 30 days ago.">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <PasswordField
              label="Current Password"
              value={passwords.current}
              show={showPass.current}
              onToggleShow={() => setShowPass((s) => ({ ...s, current: !s.current }))}
              onChange={(v) => { setPasswords({ ...passwords, current: v }); setErrors({ ...errors, current: '' }); }}
              error={errors.current}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PasswordField
                label="New Password"
                value={passwords.next}
                show={showPass.next}
                onToggleShow={() => setShowPass((s) => ({ ...s, next: !s.next }))}
                onChange={(v) => { setPasswords({ ...passwords, next: v }); setErrors({ ...errors, next: '' }); }}
                error={errors.next}
              />
              <PasswordField
                label="Confirm New Password"
                value={passwords.confirm}
                show={showPass.confirm}
                onToggleShow={() => setShowPass((s) => ({ ...s, confirm: !s.confirm }))}
                onChange={(v) => { setPasswords({ ...passwords, confirm: v }); setErrors({ ...errors, confirm: '' }); }}
                error={errors.confirm}
              />
            </div>
          </div>

          {passwords.next && (
            <div className="rounded-xl border border-brand-lilac/60 bg-brand-mist/40 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/60">Password Strength</span>
                <span className={`text-[11px] font-bold ${passwordStrength >= 4 ? 'text-emerald-600' : passwordStrength >= 2 ? 'text-amber-600' : 'text-rose-500'}`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-brand-ink/60">
                <PasswordRule ok={passwords.next.length >= 8}>At least 8 characters</PasswordRule>
                <PasswordRule ok={/[A-Z]/.test(passwords.next)}>One uppercase letter</PasswordRule>
                <PasswordRule ok={/[a-z]/.test(passwords.next)}>One lowercase letter</PasswordRule>
                <PasswordRule ok={/[0-9]/.test(passwords.next)}>One number</PasswordRule>
                <PasswordRule ok={/[^A-Za-z0-9]/.test(passwords.next)}>One special character</PasswordRule>
              </ul>
            </div>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Key size={14} /> Update Password
          </button>
        </form>
      </Section>

      <Section title="Authentication" subtitle="Extra protection for your account.">
        <ToggleRow
          label="Two-Factor Authentication (2FA)"
          desc="Require a code from your phone at login."
          value={twoFA}
          onChange={setTwoFA}
          icon={Shield}
        />
        <ToggleRow
          label="Session Timeout"
          desc="Auto logout after 30 minutes of inactivity."
          value={sessionTimeout}
          onChange={setSessionTimeout}
          icon={Lock}
        />
        <ToggleRow
          label="Login Alerts"
          desc="Email me whenever a new device signs in."
          value={loginAlerts}
          onChange={setLoginAlerts}
          icon={Mail}
        />
      </Section>
    </>
  );
}

function PasswordField({ label, value, show, onToggleShow, onChange, error }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm outline-none transition-all ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
              : 'border-brand-lilac focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15'
          }`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/40 hover:text-brand-magenta"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-500">
          <AlertTriangle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

function PasswordRule({ ok, children }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`flex h-3 w-3 items-center justify-center rounded-full ${ok ? 'bg-emerald-500' : 'bg-brand-lilac'}`}>
        {ok && <Check size={8} className="text-white" strokeWidth={4} />}
      </span>
      <span className={ok ? 'text-emerald-700' : ''}>{children}</span>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3 — LOGIN ACTIVITY
   ═══════════════════════════════════════════════════════════════ */
function LoginActivityTab({ showToast }) {
  const { activeWebsiteId } = useAuth();

  const [history, setHistory] = useState(() =>
    loadState(`loginHistory:${activeWebsiteId}`, DEFAULT_LOGIN_HISTORY)
  );
  const [filter, setFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => { saveState(`loginHistory:${activeWebsiteId}`, history); }, [history, activeWebsiteId]);

  const filtered = useMemo(() => {
    if (filter === 'All') return history;
    if (filter === 'Success') return history.filter((h) => h.status === 'success');
    if (filter === 'Failed') return history.filter((h) => h.status === 'failed');
    if (filter === 'Current') return history.filter((h) => h.current);
    return history;
  }, [history, filter]);

  const handleRevoke = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    showToast('Session revoked', 'error');
  };

  const handleRevokeAll = () => {
    setHistory((prev) => prev.filter((h) => h.current));
    showToast('All other sessions revoked', 'error');
  };

  const total = history.length;
  const failed = history.filter((h) => h.status === 'failed').length;
  const current = history.filter((h) => h.current).length;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <MiniStat icon={Activity}     label="Total Logins"  value={total}   color="purple" />
        <MiniStat icon={CheckCircle2} label="Active Now"    value={current} color="emerald" />
        <MiniStat icon={AlertTriangle} label="Failed Attempts" value={failed} color="rose" />
      </div>

      <Section
        title="Login Activity"
        subtitle="Recent account activity and login history."
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <button
              onClick={() => setFilterOpen((s) => !s)}
              className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-medium text-brand-ink hover:bg-brand-lilac/40"
            >
              <Filter size={13} className="text-brand-magenta" />
              Filter: <span className="font-semibold text-brand-magenta">{filter}</span>
              <ChevronDown size={13} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-2 w-40 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                  {['All', 'Success', 'Failed', 'Current'].map((f) => (
                    <button
                      key={f}
                      onClick={() => { setFilter(f); setFilterOpen(false); }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                        filter === f
                          ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                          : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {history.length > 1 && (
            <button
              onClick={handleRevokeAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
            >
              <LogOut size={12} /> Revoke all other sessions
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-lilac text-brand-magenta">
              <Activity size={20} />
            </span>
            <p className="text-sm text-brand-ink/50">No login activity matches your filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-brand-lilac/40 overflow-hidden rounded-xl border border-brand-lilac">
            {filtered.map((entry) => {
              const isMobile = /iphone|android|mobile/i.test(entry.device);
              const DeviceIcon = isMobile ? Smartphone : Monitor;
              const isSuccess = entry.status === 'success';
              return (
                <li key={entry.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-mist/30">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    <DeviceIcon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-ink">
                      <span className="truncate">{entry.device}</span>
                      {entry.current && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                          CURRENT
                        </span>
                      )}
                      {!isSuccess && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-600">
                          FAILED
                        </span>
                      )}
                    </p>
                    <p className="truncate text-[11px] text-brand-ink/50">
                      {entry.location} · IP {entry.ip} · {formatRelative(entry.time)}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right text-[11px] text-brand-ink/50 lg:block">
                    {formatDateTime(entry.time)}
                  </div>
                  {!entry.current && (
                    <button
                      onClick={() => handleRevoke(entry.id)}
                      className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-500 transition-all hover:bg-rose-100"
                    >
                      Revoke
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4 — NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */
function NotificationsTab({ showToast }) {
  const { activeWebsiteId } = useAuth();

  const [prefs, setPrefs] = useState(() =>
    loadState(`notifications:${activeWebsiteId}`, {
      email: true,
      sms: false,
      push: true,
      newLead: true,
      missedCall: true,
      daily: false,
      weekly: true,
      billing: true,
    })
  );

  useEffect(() => { saveState(`notifications:${activeWebsiteId}`, prefs); }, [prefs, activeWebsiteId]);

  const set = (key, value) => setPrefs({ ...prefs, [key]: value });

  return (
    <>
      <Section title="Delivery Channels" subtitle="How you receive notifications.">
        <ToggleRow
          label="Email Notifications"
          desc="Send alerts to your registered email."
          value={prefs.email}
          onChange={(v) => set('email', v)}
          icon={Mail}
        />
        <ToggleRow
          label="SMS Notifications"
          desc="Text messages for urgent alerts only."
          value={prefs.sms}
          onChange={(v) => set('sms', v)}
          icon={Phone}
        />
        <ToggleRow
          label="Push Notifications"
          desc="Browser and mobile push notifications."
          value={prefs.push}
          onChange={(v) => set('push', v)}
          icon={Bell}
        />
      </Section>

      <Section title="What to Notify" subtitle="Choose which events trigger alerts.">
        <ToggleRow
          label="New Lead Assigned"
          desc="Whenever a new lead arrives for your website."
          value={prefs.newLead}
          onChange={(v) => set('newLead', v)}
          icon={Users}
        />
        <ToggleRow
          label="Missed Call Alerts"
          desc="When an inbound call goes unanswered."
          value={prefs.missedCall}
          onChange={(v) => set('missedCall', v)}
          icon={Phone}
        />
        <ToggleRow
          label="Daily Summary"
          desc="Every evening — daily performance recap."
          value={prefs.daily}
          onChange={(v) => set('daily', v)}
          icon={Zap}
        />
        <ToggleRow
          label="Weekly Report"
          desc="Every Monday at 9 AM — team performance."
          value={prefs.weekly}
          onChange={(v) => set('weekly', v)}
          icon={Zap}
        />
        <ToggleRow
          label="Billing & Invoices"
          desc="Payment confirmations and renewals."
          value={prefs.billing}
          onChange={(v) => set('billing', v)}
          icon={CreditCard}
        />
      </Section>

      <button
        onClick={() => showToast('Notification preferences saved')}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
      >
        <Save size={14} /> Save Preferences
      </button>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5 — WEBSITE
   ═══════════════════════════════════════════════════════════════ */
function WebsiteTab({ showToast }) {
  const { activeWebsite, activeWebsiteId } = useAuth();

  const [config, setConfig] = useState(() =>
    loadState(`website:${activeWebsiteId}`, {
      autoAssign: true,
      roundRobin: true,
      autoFollowUp: false,
      startTime: '09:00',
      endTime: '19:00',
      workingDays: 'Mon – Sat',
      timezone: 'IST (UTC+5:30)',
    })
  );

  useEffect(() => { saveState(`website:${activeWebsiteId}`, config); }, [config, activeWebsiteId]);

  return (
    <>
      <Section title="Website Details" subtitle="Basic information about your website.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="Website Name" value={activeWebsite?.name || ''} disabled />
          <InputField label="Website ID"   value={activeWebsite?.id || ''} disabled />
          <InputField label="Plan"          value={activeWebsite?.plan || ''} disabled />
          <InputField label="Expires On"    value={activeWebsite?.expiresOn || ''} disabled />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-2 text-xs text-amber-700">
            <AlertTriangle size={14} className="shrink-0" />
            These details are managed by your Super Admin. Contact them to make changes.
          </p>
        </div>
      </Section>

      <Section title="Lead Automation" subtitle="Configure how leads are handled for your website.">
        <ToggleRow
          label="Auto-Assign New Leads"
          desc="Automatically assign incoming leads to agents."
          value={config.autoAssign}
          onChange={(v) => setConfig({ ...config, autoAssign: v })}
          icon={Zap}
        />
        <ToggleRow
          label="Round Robin Distribution"
          desc="Distribute leads equally among active agents."
          value={config.roundRobin}
          onChange={(v) => setConfig({ ...config, roundRobin: v })}
          icon={Users}
        />
        <ToggleRow
          label="Auto Follow-up Reminders"
          desc="Send reminders to agents 1 hour before follow-up."
          value={config.autoFollowUp}
          onChange={(v) => setConfig({ ...config, autoFollowUp: v })}
          icon={Bell}
        />
      </Section>

      <Section title="Working Hours" subtitle="Calls outside these hours go to voicemail.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Start Time"
            type="time"
            value={config.startTime}
            onChange={(v) => setConfig({ ...config, startTime: v })}
          />
          <InputField
            label="End Time"
            type="time"
            value={config.endTime}
            onChange={(v) => setConfig({ ...config, endTime: v })}
          />
          <SelectField
            label="Working Days"
            options={['Mon – Fri', 'Mon – Sat', 'All 7 Days']}
            value={config.workingDays}
            onChange={(v) => setConfig({ ...config, workingDays: v })}
          />
          <SelectField
            label="Timezone"
            options={['IST (UTC+5:30)', 'UTC', 'EST', 'PST']}
            value={config.timezone}
            onChange={(v) => setConfig({ ...config, timezone: v })}
          />
        </div>
      </Section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 6 — TEAM
   ═══════════════════════════════════════════════════════════════ */
function TeamTab() {
  const { activeWebsiteId } = useAuth();
  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  return (
    <>
      <Section title="Team Members" subtitle={`${agents.length} agents assigned to your website.`}>
        {agents.length === 0 ? (
          <div className="py-8 text-center text-sm text-brand-ink/40">
            No agents yet. Ask your Super Admin to add agents.
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-3 rounded-xl border border-brand-lilac p-3 transition-all hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-xs font-bold text-white">
                  {agent.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">{agent.name}</p>
                  <p className="truncate text-xs text-brand-ink/50">{agent.phone}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  agent.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                }`}>
                  {agent.status}
                </span>
                <button
                  className="shrink-0 rounded-lg p-2 text-brand-ink/40 hover:bg-brand-lilac"
                  title="Manage"
                >
                  <UserCog size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-2 text-xs text-amber-700">
            <AlertTriangle size={14} className="shrink-0" />
            Adding or removing agents is handled by your Super Admin.
          </p>
        </div>
      </Section>

      <Section title="Permissions" subtitle="What your team can access.">
        <div className="space-y-3 text-sm">
          {[
            { label: 'View Leads',    enabled: true },
            { label: 'Edit Leads',    enabled: true },
            { label: 'Make Calls',    enabled: true },
            { label: 'Export Data',   enabled: false },
            { label: 'Manage Team',   enabled: false },
            { label: 'Billing Access', enabled: false },
          ].map((p) => (
            <div key={p.label} className="flex items-center justify-between border-b border-brand-lilac/60 pb-2.5 last:border-0 last:pb-0">
              <span className="text-brand-ink/70">{p.label}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                p.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {p.enabled ? 'ALLOWED' : 'RESTRICTED'}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 7 — APPEARANCE
   ═══════════════════════════════════════════════════════════════ */
function AppearanceTab({ showToast }) {
  const { activeWebsiteId } = useAuth();

  const [appearance, setAppearance] = useState(() =>
    loadState(`appearance:${activeWebsiteId}`, {
      theme: 'light',
      compact: false,
      showAvatar: true,
      accentColor: 'magenta',
    })
  );

  useEffect(() => { saveState(`appearance:${activeWebsiteId}`, appearance); }, [appearance, activeWebsiteId]);

  const ACCENTS = [
    { key: 'magenta', from: 'from-brand-magenta', to: 'to-brand-purple', label: 'Magenta' },
    { key: 'purple',  from: 'from-violet-500',   to: 'to-indigo-500',   label: 'Violet' },
    { key: 'emerald', from: 'from-emerald-500',  to: 'to-teal-500',     label: 'Emerald' },
    { key: 'amber',   from: 'from-amber-500',    to: 'to-orange-500',   label: 'Amber' },
    { key: 'rose',    from: 'from-rose-500',     to: 'to-pink-500',     label: 'Rose' },
    { key: 'cyan',    from: 'from-cyan-500',     to: 'to-blue-500',     label: 'Cyan' },
  ];

  return (
    <>
      <Section title="Theme" subtitle="Choose how your dashboard looks.">
        <div className="grid grid-cols-3 gap-3">
          {['light', 'dark', 'auto'].map((t) => (
            <button
              key={t}
              onClick={() => { setAppearance({ ...appearance, theme: t }); showToast(`Theme: ${t}`); }}
              className={`rounded-xl border-2 p-4 text-center capitalize transition-all ${
                appearance.theme === t
                  ? 'border-brand-magenta bg-brand-magenta/5 ring-1 ring-brand-magenta/30'
                  : 'border-brand-lilac hover:border-brand-magenta/40'
              }`}
            >
              <div className={`mx-auto mb-2 h-12 w-16 rounded-lg ${
                t === 'light' ? 'border border-gray-200 bg-white'
                : t === 'dark' ? 'bg-gray-900'
                : 'bg-gradient-to-r from-white to-gray-900'
              }`} />
              <p className="text-sm font-semibold text-brand-ink">{t}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Accent Color" subtitle="Personalize your brand accent.">
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              onClick={() => { setAppearance({ ...appearance, accentColor: a.key }); showToast(`Accent: ${a.label}`); }}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all ${
                appearance.accentColor === a.key
                  ? 'border-brand-magenta bg-brand-magenta/5'
                  : 'border-brand-lilac hover:border-brand-magenta/40'
              }`}
            >
              <span className={`h-4 w-4 rounded-full bg-gradient-to-br ${a.from} ${a.to}`} />
              {a.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Layout" subtitle="Personalize your view.">
        <ToggleRow
          label="Compact Mode"
          desc="Reduce padding for denser data views."
          value={appearance.compact}
          onChange={(v) => setAppearance({ ...appearance, compact: v })}
          icon={Palette}
        />
        <ToggleRow
          label="Show Avatars"
          desc="Display agent avatars in tables and lists."
          value={appearance.showAvatar}
          onChange={(v) => setAppearance({ ...appearance, showAvatar: v })}
          icon={Users}
        />
      </Section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 8 — IVR & LINE
   ═══════════════════════════════════════════════════════════════ */
function IvrTab({ showToast }) {
  const { activeWebsite, activeWebsiteId } = useAuth();

  const [ivr, setIvr] = useState(() =>
    loadState(`ivr:${activeWebsiteId}`, {
      fallbackNumber: '+91 62047 20001',
      ringDuration: '30',
      maxQueueSize: '10',
      recordCalls: true,
      ivrMenu: true,
      autoGreeting: true,
      voicemail: true,
      greeting: `Thank you for calling ${activeWebsite?.name}. Please hold while we connect you to an agent.`,
    })
  );

  useEffect(() => { saveState(`ivr:${activeWebsiteId}`, ivr); }, [ivr, activeWebsiteId]);

  return (
    <>
      <Section title="IVR Configuration" subtitle="Manage your inbound call line.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Active IVR Number"
            value={activeWebsite?.ivrNumber || '+91 22 4890 1234'}
            disabled
          />
          <InputField
            label="Fallback Number"
            value={ivr.fallbackNumber}
            onChange={(v) => setIvr({ ...ivr, fallbackNumber: v })}
            icon={Phone}
          />
          <SelectField
            label="Ring Duration (seconds)"
            options={['15', '20', '30', '45', '60']}
            value={ivr.ringDuration}
            onChange={(v) => setIvr({ ...ivr, ringDuration: v })}
          />
          <SelectField
            label="Max Queue Size"
            options={['5', '10', '15', '20', 'Unlimited']}
            value={ivr.maxQueueSize}
            onChange={(v) => setIvr({ ...ivr, maxQueueSize: v })}
          />
        </div>
      </Section>

      <Section title="Call Settings" subtitle="Recording, greetings, and routing.">
        <ToggleRow
          label="Record All Calls"
          desc="Save recordings for quality and compliance."
          value={ivr.recordCalls}
          onChange={(v) => setIvr({ ...ivr, recordCalls: v })}
          icon={Phone}
        />
        <ToggleRow
          label="Enable IVR Menu"
          desc="Press 1 for sales, 2 for support, etc."
          value={ivr.ivrMenu}
          onChange={(v) => setIvr({ ...ivr, ivrMenu: v })}
          icon={Zap}
        />
        <ToggleRow
          label="Auto Greeting"
          desc="Play a welcome message before connecting."
          value={ivr.autoGreeting}
          onChange={(v) => setIvr({ ...ivr, autoGreeting: v })}
          icon={Bell}
        />
        <ToggleRow
          label="Voicemail Fallback"
          desc="Let callers leave a message if no agent answers."
          value={ivr.voicemail}
          onChange={(v) => setIvr({ ...ivr, voicemail: v })}
          icon={Phone}
        />
      </Section>

      <Section title="Greeting Message" subtitle="What callers hear first.">
        <textarea
          value={ivr.greeting}
          onChange={(e) => setIvr({ ...ivr, greeting: e.target.value })}
          rows={3}
          className="w-full rounded-xl border border-brand-lilac bg-white p-3.5 text-sm text-brand-ink outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />
        <button
          onClick={() => showToast('Greeting updated')}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
        >
          <Save size={12} /> Save Greeting
        </button>
      </Section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 9 — BILLING
   ═══════════════════════════════════════════════════════════════ */
function BillingTab() {
  const { activeWebsite } = useAuth();

  return (
    <>
      <Section title="Current Plan" subtitle="Your subscription details.">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-brand-magenta/10 to-brand-purple/10 p-4">
          <div>
            <p className="font-display text-lg font-semibold text-brand-ink">
              {activeWebsite?.plan || 'Starter'} Plan
            </p>
            <p className="text-sm text-brand-ink/50">
              Renews on {activeWebsite?.expiresOn || '—'}
            </p>
          </div>
          <div className="rounded-full bg-brand-lilac px-3 py-1 text-xs font-semibold text-brand-purple">
            Managed by Super Admin
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Agents',       value: '12 / 50' },
            { label: 'Leads/mo',     value: '2,340 / ∞' },
            { label: 'Storage',      value: '1.8 GB / 10 GB' },
            { label: 'Call Minutes', value: '4,120 / 10,000' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-brand-lilac p-3 text-center">
              <p className="text-xs text-brand-ink/50">{m.label}</p>
              <p className="mt-1 font-display text-sm font-bold text-brand-ink">{m.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recent Invoices" subtitle="Past billing history.">
        {[
          { id: 'INV-2026-011', date: '01 Nov 2026', amount: '₹24,999' },
          { id: 'INV-2026-010', date: '01 Oct 2026', amount: '₹24,999' },
          { id: 'INV-2026-009', date: '01 Sep 2026', amount: '₹24,999' },
        ].map((inv) => (
          <div key={inv.id} className="flex items-center justify-between border-b border-brand-lilac/60 py-3 last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-semibold text-brand-ink">{inv.id}</p>
              <p className="text-xs text-brand-ink/50">{inv.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-brand-ink">{inv.amount}</p>
              <button className="text-xs font-semibold text-brand-magenta hover:underline">
                Download
              </button>
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-2 text-xs text-amber-700">
            <AlertTriangle size={14} className="shrink-0" />
            Billing is managed by your Super Admin.
          </p>
        </div>
      </Section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR CARDS
   ═══════════════════════════════════════════════════════════════ */
function InfoCard() {
  const { user, role, activeWebsite } = useAuth();
  return (
    <div className="card">
      <h3 className="font-display text-sm font-semibold text-brand-ink">Account Info</h3>
      <div className="mt-4 space-y-3 text-sm">
        <Field label="Name"     value={user?.name || '—'} />
        <Field label="Role"     value={role} />
        <Field label="Website"  value={activeWebsite?.name || '—'} />
        <Field label="Plan"     value={activeWebsite?.plan || '—'} />
        <Field label="Expires"  value={activeWebsite?.expiresOn || '—'} />
      </div>
    </div>
  );
}

function WebsiteHealthCard() {
  const { activeWebsiteId } = useAuth();
  const agents = useMemo(() => AGENTS.filter((a) => a.websiteId === activeWebsiteId), [activeWebsiteId]);
  const leads = useMemo(() => LEADS.filter((l) => l.websiteId === activeWebsiteId), [activeWebsiteId]);
  const won = leads.filter((l) => l.status === 'Won').length;
  const conversion = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0;

  const items = [
    { label: 'Active Agents', value: agents.filter((a) => a.status === 'Active').length, total: agents.length },
    { label: 'Total Leads',   value: leads.length, total: null },
    { label: 'Conversion',    value: `${conversion}%`, total: null },
  ];

  return (
    <div className="card">
      <h3 className="font-display text-sm font-semibold text-brand-ink">Website Health</h3>
      <div className="mt-4 space-y-2.5">
        {items.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm">
            <span className="text-brand-ink/70">{s.label}</span>
            <span className="font-semibold text-brand-ink">
              {s.value}
              {s.total !== null && <span className="text-brand-ink/40"> / {s.total}</span>}
            </span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full rounded-lg border border-brand-lilac py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
        View Full Report
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Section({ title, subtitle, children }) {
  return (
    <div className="card space-y-4">
      <div className="border-b border-brand-lilac/60 pb-3">
        <h2 className="font-display text-base font-semibold text-brand-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-brand-ink/50">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-brand-lilac/60 pb-2.5 last:border-0 last:pb-0">
      <span className="text-sm text-brand-ink/50">{label}</span>
      <span className="truncate text-sm font-semibold text-brand-ink">{value}</span>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, disabled, icon: Icon }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full rounded-xl border bg-white py-2.5 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/30 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 ${
            disabled
              ? 'cursor-not-allowed border-brand-lilac bg-brand-lilac/30 text-brand-ink/50'
              : 'border-brand-lilac focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15'
          }`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, options = [], value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none transition-all focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-brand-lilac/60 py-3 last:border-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-lilac/50 text-brand-magenta">
            <Icon size={16} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-ink">{label}</p>
          <p className="text-xs text-brand-ink/50">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 ${
          value ? 'bg-gradient-to-r from-brand-magenta to-brand-purple' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            value ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`}
        />
      </button>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color = 'purple' }) {
  const colors = {
    purple:  'bg-violet-50 text-brand-purple',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose:    'bg-rose-50 text-brand-magenta',
    amber:   'bg-amber-50 text-amber-600',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] text-brand-ink/50">{label}</p>
        <p className="font-display text-lg font-bold text-brand-ink tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
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
        {type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}