// src/pages/admin/Account.jsx
import { useState } from 'react';
import {
  User, Lock, Activity, Bell, LogOut, Save, Eye, EyeOff, Check,
  AlertCircle, CheckCircle2, Mail, Phone, MapPin, Camera, Upload,
  Shield, Smartphone, Monitor, Globe, Clock, Key, X, Plus, Trash2,
  Calendar, Fingerprint,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'password', label: 'Password', icon: Lock },
  { key: 'activity', label: 'Login Activity', icon: Activity },
  { key: 'preferences', label: 'Preferences', icon: Bell },
];

export default function Account() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            My Account
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <User size={13} className="text-brand-purple" />
            Manage your profile, security, and preferences
          </p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-lilac bg-white p-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
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
      </div>

      {tab === 'profile' && (
        <ProfileTab user={user} onSave={() => showToast('Profile updated')} />
      )}
      {tab === 'password' && (
        <PasswordTab onSave={() => showToast('Password changed')} />
      )}
      {tab === 'activity' && <ActivityTab />}
      {tab === 'preferences' && (
        <PreferencesTab onSave={() => showToast('Preferences saved')} />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= PROFILE TAB ================= */
function ProfileTab({ user, onSave }) {
  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@eliteinova.com',
    phone: '+91 9876543210',
    role: 'Project Admin',
    location: 'Mumbai, India',
    bio: 'Managing leads and agents for Eliteinova Matrimony.',
    avatar: null,
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Avatar */}
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Camera size={14} className="text-brand-purple" />
          Profile Photo
        </h3>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-3xl font-bold text-white shadow-lg">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:bg-brand-lilac">
              <Upload size={14} className="text-brand-purple" />
            </button>
          </div>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-brand-ink">
              {profile.name}
            </p>
            <p className="text-xs text-brand-ink/50">{profile.role}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold text-brand-purple">
            <Shield size={11} /> ADMIN
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="card !p-5 space-y-4 lg:col-span-2">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <User size={14} className="text-brand-purple" />
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
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
              rows={3}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Save size={14} /> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= PASSWORD TAB ================= */
function PasswordTab({ onSave }) {
  const [form, setForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!form.current || !form.next || !form.confirm) {
      setError('All fields are required.');
      return;
    }
    if (form.next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (form.next !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setForm({ current: '', next: '', confirm: '' });
    onSave();
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="card !p-5 space-y-4 lg:col-span-2">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Lock size={14} className="text-brand-purple" />
          Change Password
        </h3>
        <form onSubmit={submit} className="space-y-4">
          <PasswordField
            label="Current Password"
            value={form.current}
            show={show.current}
            onToggle={() => setShow({ ...show, current: !show.current })}
            onChange={(v) => setForm({ ...form, current: v })}
          />
          <PasswordField
            label="New Password"
            value={form.next}
            show={show.next}
            onToggle={() => setShow({ ...show, next: !show.next })}
            onChange={(v) => setForm({ ...form, next: v })}
          />
          <PasswordField
            label="Confirm New Password"
            value={form.confirm}
            show={show.confirm}
            onToggle={() => setShow({ ...show, confirm: !show.confirm })}
            onChange={(v) => setForm({ ...form, confirm: v })}
          />

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
          >
            <Key size={14} /> Update Password
          </button>
        </form>
      </div>

      <div className="card !p-5 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Shield size={14} className="text-brand-purple" />
          Password Tips
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
        </ul>
      </div>
    </div>
  );
}

/* ================= ACTIVITY TAB ================= */
function ActivityTab() {
  const [activities] = useState([
    {
      id: 1,
      device: 'Chrome on Windows',
      ip: '103.21.58.14',
      location: 'Mumbai, India',
      time: 'Just now',
      current: true,
      icon: Monitor,
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      ip: '49.36.180.22',
      location: 'Pune, India',
      time: '2 hours ago',
      current: false,
      icon: Smartphone,
    },
    {
      id: 3,
      device: 'Firefox on Mac',
      ip: '103.21.58.10',
      location: 'Mumbai, India',
      time: 'Yesterday, 6:40 PM',
      current: false,
      icon: Monitor,
    },
    {
      id: 4,
      device: 'Chrome on Android',
      ip: '157.34.12.5',
      location: 'Delhi, India',
      time: '3 days ago',
      current: false,
      icon: Smartphone,
    },
  ]);

  return (
    <div className="card !p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-brand-purple" />
          <h3 className="font-display text-sm font-semibold text-brand-ink">
            Recent Login Activity
          </h3>
        </div>
        <button className="rounded-lg border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-50">
          Logout All Other Sessions
        </button>
      </div>

      <div className="space-y-2">
        {activities.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all ${
                a.current
                  ? 'border-brand-purple/40 bg-brand-lilac/10'
                  : 'border-brand-lilac/60 bg-white'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  a.current
                    ? 'bg-gradient-to-br from-brand-purple to-brand-magenta text-white'
                    : 'bg-brand-lilac/40 text-brand-purple'
                }`}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {a.device}
                  </p>
                  {a.current && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-brand-ink/50">
                  {a.ip} · {a.location}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] text-brand-ink/40">{a.time}</p>
              </div>
              {!a.current && (
                <button className="shrink-0 rounded-lg p-2 text-rose-500 hover:bg-rose-50">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= PREFERENCES TAB ================= */
function PreferencesTab({ onSave }) {
  const [prefs, setPrefs] = useState({
    emailDigest: true,
    pushNotifications: true,
    desktopAlerts: false,
    soundAlerts: true,
    language: 'English',
    timezone: 'Asia/Kolkata (GMT+5:30)',
    dateFormat: 'DD/MM/YYYY',
    theme: 'Light',
  });

  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Bell size={14} className="text-brand-purple" />
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
        </div>
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Globe size={14} className="text-brand-purple" />
          Regional & Display
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Language"
            value={prefs.language}
            options={['English', 'Hindi', 'Marathi', 'Tamil']}
            onChange={(v) => setPrefs({ ...prefs, language: v })}
          />
          <SelectField
            label="Timezone"
            value={prefs.timezone}
            options={[
              'Asia/Kolkata (GMT+5:30)',
              'Asia/Dubai (GMT+4:00)',
              'America/New_York (GMT-5:00)',
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
            label="Theme"
            value={prefs.theme}
            options={['Light', 'Dark', 'System']}
            onChange={(v) => setPrefs({ ...prefs, theme: v })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Save size={14} /> Save Preferences
        </button>
      </div>
    </div>
  );
}

/* ================= SHARED COMPONENTS ================= */
function Field({ label, value, onChange, icon: Icon }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40"
          />
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-brand-lilac bg-white py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15 ${
            Icon ? 'pl-10 pr-3.5' : 'px-3.5'
          }`}
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40"
        />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-brand-lilac bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-brand-ink/40 hover:bg-brand-lilac"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          value
            ? 'bg-gradient-to-r from-brand-purple to-brand-magenta'
            : 'bg-brand-lilac'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
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
        {type === 'error' ? (
          <AlertCircle size={16} />
        ) : (
          <CheckCircle2 size={16} />
        )}
        {message}
      </div>
    </div>
  );
}