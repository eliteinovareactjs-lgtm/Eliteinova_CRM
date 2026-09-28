// src/pages/admin/Account.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  User, Lock, Activity, Bell, LogOut, Save, Eye, EyeOff, Check,
  AlertCircle, CheckCircle2, Mail, Phone, MapPin, Camera, Upload,
  Shield, Smartphone, Monitor, Globe, Key, X, Trash2,
  Filter, ChevronDown, Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'profile',     label: 'Profile',           icon: User },
  { key: 'password',    label: 'Change Password',   icon: Lock },
  { key: 'activity',    label: 'Login Activity',    icon: Activity },
  { key: 'preferences', label: 'Preferences',       icon: Bell },
];

const STORAGE_PREFIX = 'account:';

const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed !== null && (Array.isArray(parsed) || typeof parsed === 'object')) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
};

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

const getInitials = (name) =>
  (name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const buildDefaultLoginHistory = () => [
  {
    id: 'lg-current',
    device: 'Chrome on Windows',
    browser: 'Chrome 121',
    os: 'Windows 11',
    location: 'Mumbai, India',
    ip: '103.21.58.14',
    time: new Date(Date.now() - 2 * 60000).toISOString(),
    status: 'success',
    current: true,
  },
  {
    id: 'lg-2',
    device: 'Safari on iPhone',
    browser: 'Safari 17',
    os: 'iOS 17.2',
    location: 'Pune, India',
    ip: '49.36.180.22',
    time: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: 'success',
    current: false,
  },
  {
    id: 'lg-3',
    device: 'Firefox on Mac',
    browser: 'Firefox 122',
    os: 'macOS Sonoma',
    location: 'Mumbai, India',
    ip: '103.21.58.10',
    time: new Date(Date.now() - 86400000).toISOString(),
    status: 'success',
    current: false,
  },
  {
    id: 'lg-4',
    device: 'Chrome on Android',
    browser: 'Chrome 120',
    os: 'Android 14',
    location: 'Delhi, India',
    ip: '157.34.12.5',
    time: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'failed',
    current: false,
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Account() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">
              My Account
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <User size={13} className="text-brand-magenta" />
              Manage your profile, security, and preferences
            </p>
          </div>
          <button
            onClick={logout}
            className="group inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100"
          >
            <LogOut size={14} className="transition-transform group-hover:translate-x-0.5" /> Logout
          </button>
        </div>

        {/* TABS */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
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
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT */}
        {tab === 'profile' && (
          <ProfileTab user={user} showToast={showToast} />
        )}
        {tab === 'password' && (
          <PasswordTab showToast={showToast} />
        )}
        {tab === 'activity' && (
          <ActivityTab showToast={showToast} />
        )}
        {tab === 'preferences' && (
          <PreferencesTab showToast={showToast} />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1 — PROFILE
   ═══════════════════════════════════════════════════════════════ */
function ProfileTab({ user, showToast }) {
  const [profile, setProfile] = useState(() =>
    loadState('profile', {
      name: user?.name || 'Admin User',
      email: user?.email || 'admin@eliteinova.com',
      phone: '+91 9876543210',
      role: 'Project Admin',
      location: 'Mumbai, India',
      bio: 'Managing leads and agents for Eliteinova Matrimony.',
      avatar: null,
    })
  );

  useEffect(() => { saveState('profile', profile); }, [profile]);

  /* Working avatar upload */
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('File must be under 2MB', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast('Only image files are allowed', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile({ ...profile, avatar: ev.target.result });
      showToast('Profile photo updated');
    };
    reader.onerror = () => showToast('Failed to read image file', 'error');
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfile({ ...profile, avatar: null });
    showToast('Profile photo removed');
  };

  const handleSave = () => {
    if (!profile.name.trim()) { showToast('Name is required', 'error'); return; }
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) { showToast('Enter a valid email', 'error'); return; }
    if (!/^[\d\s+\-()]+$/.test(profile.phone)) { showToast('Enter a valid phone number', 'error'); return; }
    saveState('profile', profile);
    showToast('Profile updated successfully');
  };

  const hasUploadedAvatar = profile.avatar && typeof profile.avatar === 'string' && profile.avatar.startsWith('data:');

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Avatar card */}
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Camera size={14} className="text-brand-magenta" />
          Profile Photo
        </h3>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {hasUploadedAvatar ? (
              <img
                src={profile.avatar}
                alt="avatar"
                className="h-28 w-28 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-3xl font-bold text-white shadow-lg">
                {getInitials(profile.name)}
              </div>
            )}
            <label
              className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-md transition-transform hover:scale-110"
              title="Upload photo"
            >
              <Upload size={14} />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-brand-ink">{profile.name}</p>
            <p className="text-xs text-brand-ink/50">{profile.role}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold text-brand-purple">
            <Shield size={11} /> ADMIN
          </span>
          {hasUploadedAvatar && (
            <button
              onClick={handleRemoveAvatar}
              className="text-[11px] font-semibold text-rose-500 hover:underline"
            >
              Remove photo
            </button>
          )}
          <p className="text-center text-[10px] text-brand-ink/40">
            PNG or JPG, max 2MB. Square image recommended.
          </p>
        </div>
      </div>

      {/* Personal info */}
      <div className="card !p-5 space-y-4 lg:col-span-2">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <User size={14} className="text-brand-magenta" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Full Name"
            value={profile.name}
            onChange={(v) => setProfile({ ...profile, name: v })}
          />
          <Field
            label="Email"
            value={profile.email}
            onChange={(v) => setProfile({ ...profile, email: v })}
            icon={Mail}
          />
          <Field
            label="Phone"
            value={profile.phone}
            onChange={(v) => setProfile({ ...profile, phone: v })}
            icon={Phone}
          />
          <Field
            label="Location"
            value={profile.location}
            onChange={(v) => setProfile({ ...profile, location: v })}
            icon={MapPin}
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              placeholder="Tell us a little about yourself..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Save size={14} /> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 — PASSWORD (with strength meter + rules)
   ═══════════════════════════════════════════════════════════════ */
function PasswordTab({ showToast }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState(0);

  /* Live strength calculation */
  useEffect(() => {
    const p = form.next;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setStrength(score);
  }, [form.next]);

  const strengthLabels = ['Very Weak', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500'];
  const strengthTextColors = ['text-rose-500', 'text-rose-500', 'text-amber-600', 'text-amber-600', 'text-emerald-600', 'text-emerald-600'];

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.current) next.current = 'Current password is required.';
    if (!form.next) next.next = 'New password is required.';
    else if (form.next.length < 8) next.next = 'Must be at least 8 characters.';
    else if (form.next === form.current) next.next = 'New password must differ from current.';
    else if (strength < 3) next.next = 'Password is too weak. Add uppercase, numbers, or symbols.';
    if (form.next !== form.confirm) next.confirm = 'Passwords do not match.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setForm({ current: '', next: '', confirm: '' });
    setStrength(0);
    showToast('Password changed successfully');
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="card !p-5 space-y-4 lg:col-span-2">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Lock size={14} className="text-brand-magenta" /> Change Password
        </h3>
        <form onSubmit={submit} className="space-y-4">
          <PasswordField
            label="Current Password"
            autoComplete="current-password"
            value={form.current}
            show={show.current}
            onToggle={() => setShow({ ...show, current: !show.current })}
            onChange={(v) => { setForm({ ...form, current: v }); setErrors({ ...errors, current: '' }); }}
            error={errors.current}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PasswordField
              label="New Password"
              autoComplete="new-password"
              value={form.next}
              show={show.next}
              onToggle={() => setShow({ ...show, next: !show.next })}
              onChange={(v) => { setForm({ ...form, next: v }); setErrors({ ...errors, next: '' }); }}
              error={errors.next}
            />
            <PasswordField
              label="Confirm New Password"
              autoComplete="new-password"
              value={form.confirm}
              show={show.confirm}
              onToggle={() => setShow({ ...show, confirm: !show.confirm })}
              onChange={(v) => { setForm({ ...form, confirm: v }); setErrors({ ...errors, confirm: '' }); }}
              error={errors.confirm}
            />
          </div>

          {/* Strength meter */}
          {form.next && (
            <div className="rounded-xl border border-brand-lilac/60 bg-brand-mist/40 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-ink/60">
                  Password Strength
                </span>
                <span className={`text-[11px] font-bold ${strengthTextColors[strength]}`}>
                  {strengthLabels[strength]}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-brand-lilac">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strengthColors[strength]}`}
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-brand-ink/60">
                <PasswordRule ok={form.next.length >= 8}>At least 8 characters</PasswordRule>
                <PasswordRule ok={/[A-Z]/.test(form.next)}>One uppercase letter</PasswordRule>
                <PasswordRule ok={/[a-z]/.test(form.next)}>One lowercase letter</PasswordRule>
                <PasswordRule ok={/[0-9]/.test(form.next)}>One number</PasswordRule>
                <PasswordRule ok={/[^A-Za-z0-9]/.test(form.next)}>One special character</PasswordRule>
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
      </div>

      {/* Tips */}
      <div className="card !p-5 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Shield size={14} className="text-brand-magenta" /> Password Tips
        </h3>
        <ul className="space-y-2 text-xs text-brand-ink/60">
          <li className="flex gap-2">
            <Check size={13} className="mt-0.5 shrink-0 text-emerald-500" />
            Use at least 8 characters
          </li>
          <li className="flex gap-2">
            <Check size={13} className="mt-0.5 shrink-0 text-emerald-500" />
            Mix uppercase and lowercase letters
          </li>
          <li className="flex gap-2">
            <Check size={13} className="mt-0.5 shrink-0 text-emerald-500" />
            Include at least one number
          </li>
          <li className="flex gap-2">
            <Check size={13} className="mt-0.5 shrink-0 text-emerald-500" />
            Add a special character (!@#$%)
          </li>
          <li className="flex gap-2">
            <X size={13} className="mt-0.5 shrink-0 text-rose-500" />
            Don't reuse old passwords
          </li>
          <li className="flex gap-2">
            <X size={13} className="mt-0.5 shrink-0 text-rose-500" />
            Never share your password
          </li>
        </ul>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-start gap-2 text-[11px] text-amber-700">
            <Info size={12} className="mt-0.5 shrink-0" />
            For maximum security, change your password every 90 days.
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label, value, show, onToggle, onChange, error, autoComplete = 'new-password' }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-all ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
              : 'border-brand-lilac focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-brand-ink/40 hover:bg-brand-lilac"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-500">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

function PasswordRule({ ok, children }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${ok ? 'bg-emerald-500' : 'bg-brand-lilac'}`}>
        {ok && <Check size={8} className="text-white" strokeWidth={4} />}
      </span>
      <span className={ok ? 'text-emerald-700' : ''}>{children}</span>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3 — LOGIN ACTIVITY
   ═══════════════════════════════════════════════════════════════ */
function ActivityTab({ showToast }) {
  const [history, setHistory] = useState(() =>
    loadState('loginHistory', buildDefaultLoginHistory())
  );
  const [filter, setFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => { saveState('loginHistory', history); }, [history]);

  const filtered = useMemo(() => {
    if (filter === 'All') return history;
    if (filter === 'Success') return history.filter((h) => h.status === 'success');
    if (filter === 'Failed') return history.filter((h) => h.status === 'failed');
    if (filter === 'Current') return history.filter((h) => h.current);
    return history;
  }, [history, filter]);

  const handleRevoke = (id) => {
    const entry = history.find((h) => h.id === id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    showToast(`Session on ${entry?.device} revoked`);
  };

  const handleRevokeAll = () => {
    if (!window.confirm('This will sign you out of all other devices. Continue?')) return;
    setHistory((prev) => prev.filter((h) => h.current));
    showToast('All other sessions revoked');
  };

  const stats = {
    total: history.length,
    current: history.filter((h) => h.current).length,
    failed: history.filter((h) => h.status === 'failed').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <MiniStat icon={Activity}     label="Total Logins"    value={stats.total}   color="purple" />
        <MiniStat icon={CheckCircle2} label="Active Sessions" value={stats.current} color="emerald" />
        <MiniStat icon={AlertCircle}  label="Failed Attempts" value={stats.failed}  color="rose" />
      </div>

      {/* Main card */}
      <div className="card !p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-brand-magenta" />
            <h3 className="font-display text-sm font-semibold text-brand-ink">
              Recent Login Activity
            </h3>
            <span className="text-xs text-brand-ink/40">· {filtered.length} entries</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3.5 py-1.5 text-[11px] font-medium text-brand-ink hover:bg-brand-lilac/40"
              >
                <Filter size={12} className="text-brand-magenta" />
                <span className="font-semibold text-brand-magenta">{filter}</span>
                <ChevronDown size={12} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
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

            {/* Revoke all */}
            {history.length > 1 && (
              <button
                onClick={handleRevokeAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-100"
              >
                <LogOut size={11} /> Revoke All Others
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-lilac text-brand-magenta">
              <Activity size={20} />
            </span>
            <p className="text-sm text-brand-ink/50">No login activity matches your filter.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a) => {
              const isMobile = /iphone|android|mobile/i.test(a.device);
              const DeviceIcon = isMobile ? Smartphone : Monitor;
              const isSuccess = a.status === 'success';
              const isFailed = a.status === 'failed';
              return (
                <div
                  key={a.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-3.5 transition-all ${
                    a.current
                      ? 'border-brand-magenta/40 bg-brand-magenta/5'
                      : 'border-brand-lilac/60 bg-white hover:shadow-md'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      a.current
                        ? 'bg-gradient-to-br from-brand-magenta to-brand-purple text-white'
                        : isSuccess
                        ? 'bg-brand-lilac/40 text-brand-magenta'
                        : 'bg-rose-100 text-rose-500'
                    }`}
                  >
                    <DeviceIcon size={16} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {a.device}
                      </p>
                      {a.current && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-600 ring-1 ring-emerald-200">
                          CURRENT
                        </span>
                      )}
                      {isFailed && (
                        <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-600">
                          FAILED
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-brand-ink/50">
                      {a.ip} · {a.location} · {formatRelative(a.time)}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right text-[10px] text-brand-ink/40 lg:block">
                    {formatDateTime(a.time)}
                  </div>

                  {!a.current && (
                    <button
                      onClick={() => handleRevoke(a.id)}
                      className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-500 transition-all hover:bg-rose-100"
                      title="Revoke session"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4 — PREFERENCES
   ═══════════════════════════════════════════════════════════════ */
function PreferencesTab({ showToast }) {
  const [prefs, setPrefs] = useState(() =>
    loadState('preferences', {
      emailDigest: true,
      pushNotifications: true,
      desktopAlerts: false,
      soundAlerts: true,
      weeklyReport: true,
      marketingEmails: false,
      language: 'English',
      timezone: 'Asia/Kolkata (GMT+5:30)',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12-hour',
      theme: 'Light',
      accentColor: 'magenta',
    })
  );

  useEffect(() => { saveState('preferences', prefs); }, [prefs]);

  const handleSave = () => {
    saveState('preferences', prefs);
    showToast('Preferences saved successfully');
  };

  const ACCENTS = [
    { key: 'magenta', from: 'from-brand-magenta', to: 'to-brand-purple', label: 'Magenta' },
    { key: 'violet',  from: 'from-violet-500',   to: 'to-indigo-500',   label: 'Violet' },
    { key: 'emerald', from: 'from-emerald-500',  to: 'to-teal-500',     label: 'Emerald' },
    { key: 'amber',   from: 'from-amber-500',    to: 'to-orange-500',   label: 'Amber' },
    { key: 'rose',    from: 'from-rose-500',     to: 'to-pink-500',     label: 'Rose' },
    { key: 'cyan',    from: 'from-cyan-500',     to: 'to-blue-500',     label: 'Cyan' },
  ];

  return (
    <div className="space-y-5">
      {/* Notifications */}
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Bell size={14} className="text-brand-magenta" />
          Notification Preferences
        </h3>
        <div className="space-y-3">
          <ToggleRow
            label="Email digest"
            desc="Receive daily summary of leads and activities"
            value={prefs.emailDigest}
            onChange={(v) => setPrefs({ ...prefs, emailDigest: v })}
          />
          <ToggleRow
            label="Push notifications"
            desc="Receive push notifications on your devices"
            value={prefs.pushNotifications}
            onChange={(v) => setPrefs({ ...prefs, pushNotifications: v })}
          />
          <ToggleRow
            label="Desktop alerts"
            desc="Show browser popup notifications"
            value={prefs.desktopAlerts}
            onChange={(v) => setPrefs({ ...prefs, desktopAlerts: v })}
          />
          <ToggleRow
            label="Sound alerts"
            desc="Play sound for new notifications"
            value={prefs.soundAlerts}
            onChange={(v) => setPrefs({ ...prefs, soundAlerts: v })}
          />
          <ToggleRow
            label="Weekly report"
            desc="Get team performance summary every Monday"
            value={prefs.weeklyReport}
            onChange={(v) => setPrefs({ ...prefs, weeklyReport: v })}
          />
          <ToggleRow
            label="Marketing emails"
            desc="Product updates and feature announcements"
            value={prefs.marketingEmails}
            onChange={(v) => setPrefs({ ...prefs, marketingEmails: v })}
          />
        </div>
      </div>

      {/* Regional */}
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Globe size={14} className="text-brand-magenta" />
          Regional & Display
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Language"
            value={prefs.language}
            options={['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada']}
            onChange={(v) => setPrefs({ ...prefs, language: v })}
          />
          <SelectField
            label="Timezone"
            value={prefs.timezone}
            options={[
              'Asia/Kolkata (GMT+5:30)',
              'Asia/Dubai (GMT+4:00)',
              'America/New_York (GMT-5:00)',
              'Europe/London (GMT+0:00)',
            ]}
            onChange={(v) => setPrefs({ ...prefs, timezone: v })}
          />
          <SelectField
            label="Date Format"
            value={prefs.dateFormat}
            options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']}
            onChange={(v) => setPrefs({ ...prefs, dateFormat: v })}
          />
          <SelectField
            label="Time Format"
            value={prefs.timeFormat}
            options={['12-hour', '24-hour']}
            onChange={(v) => setPrefs({ ...prefs, timeFormat: v })}
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <User size={14} className="text-brand-magenta" />
          Appearance
        </h3>

        <div>
          <label className="mb-2 block text-xs font-semibold text-brand-ink/70">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {['Light', 'Dark', 'System'].map((t) => (
              <button
                key={t}
                onClick={() => setPrefs({ ...prefs, theme: t })}
                className={`rounded-xl border-2 p-3 text-center transition-all ${
                  prefs.theme === t
                    ? 'border-brand-magenta bg-brand-magenta/5 ring-1 ring-brand-magenta/30'
                    : 'border-brand-lilac hover:border-brand-magenta/40'
                }`}
              >
                <div className={`mx-auto mb-2 h-10 w-14 rounded-lg ${
                  t === 'Light' ? 'border border-gray-200 bg-white'
                  : t === 'Dark' ? 'bg-gray-900'
                  : 'bg-gradient-to-r from-white to-gray-900'
                }`} />
                <p className="text-xs font-semibold text-brand-ink">{t}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-brand-ink/70">Accent Color</label>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => setPrefs({ ...prefs, accentColor: a.key })}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all ${
                  prefs.accentColor === a.key
                    ? 'border-brand-magenta bg-brand-magenta/5'
                    : 'border-brand-lilac hover:border-brand-magenta/40'
                }`}
              >
                <span className={`h-4 w-4 rounded-full bg-gradient-to-br ${a.from} ${a.to}`} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Save size={14} /> Save Preferences
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Field({ label, value, onChange, icon: Icon }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-brand-lilac bg-white py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15 ${
            Icon ? 'pl-10 pr-3.5' : 'px-3.5'
          }`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-brand-lilac/60 bg-white p-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-ink">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-brand-ink/50">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 ${
          value
            ? 'bg-gradient-to-r from-brand-magenta to-brand-purple'
            : 'bg-gray-300'
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

function MiniStat({ icon: Icon, label, value = 0, color = 'purple' }) {
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
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}