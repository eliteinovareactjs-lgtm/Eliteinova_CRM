// src/pages/agent/Account.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Building2, Briefcase, Calendar, Hash, Shield,
  CheckCircle2, XCircle, Clock, Flame, Award, TrendingUp, ChevronRight,
  ChevronDown, Settings, Bell, Lock, Eye, EyeOff, LogOut, Smartphone,
  Globe, CalendarClock, Timer, Activity, Star, Sparkles, AlertCircle,
  Edit3, Camera, X, Check, Users, PhoneCall, CalendarCheck, MessageCircle,
  MessageSquare, FileAudio, Target, Layers, Info, Save, Key,
  Fingerprint, MapPin, Trophy, Coffee, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ================================================================
   CONSTANTS
   ================================================================ */
const STATUS_OPTIONS = [
  { key: 'online',  label: 'Online',   tone: 'emerald', icon: CheckCircle2 },
  { key: 'break',   label: 'Break',    tone: 'amber',   icon: Coffee },
  { key: 'lunch',   label: 'Lunch',    tone: 'amber',   icon: Sun },
  { key: 'meeting', label: 'Meeting',  tone: 'purple',  icon: Users },
  { key: 'training',label: 'Training', tone: 'purple',  icon: Sparkles },
  { key: 'offline', label: 'Offline',  tone: 'slate',   icon: Moon },
];

const NOTIFICATION_DEFAULTS = [
  { key: 'followup',    label: 'Follow-up reminders',    desc: 'Before follow-ups are due',    default: true },
  { key: 'overdue',     label: 'Overdue follow-ups',     desc: 'When follow-ups pass due time', default: true },
  { key: 'missed',      label: 'Missed calls',           desc: 'Missed incoming calls',        default: true },
  { key: 'newLead',     label: 'New lead assigned',      desc: 'When a lead is assigned',      default: true },
  { key: 'campaign',    label: 'Campaign assignments',   desc: 'New campaign allocations',     default: true },
  { key: 'task',        label: 'Task reminders',         desc: 'Pending task reminders',       default: true },
  { key: 'messages',    label: 'Customer messages',      desc: 'WhatsApp, SMS and Email',      default: true },
  { key: 'milestones',  label: 'Performance milestones', desc: 'Achievements and personal bests', default: false },
];

const REMINDER_TIMINGS = [
  { value: '5',   label: '5 min' },
  { value: '15',  label: '15 min' },
  { value: '30',  label: '30 min' },
  { value: '60',  label: '1 hour' },
];

const PERMISSIONS = [
  { label: 'My Leads',         allowed: true,  icon: User },
  { label: 'Make Calls',       allowed: true,  icon: PhoneCall },
  { label: 'Call Recordings',  allowed: true,  icon: FileAudio },
  { label: 'Follow-ups',       allowed: true,  icon: CalendarCheck },
  { label: 'Add Notes',        allowed: true,  icon: MessageSquare },
  { label: 'SMS',              allowed: true,  icon: MessageSquare },
  { label: 'WhatsApp',         allowed: true,  icon: MessageCircle },
  { label: 'Email',            allowed: true,  icon: Mail },
  { label: 'Campaigns',        allowed: true,  icon: Layers },
  { label: 'Export Leads',     allowed: false, icon: TrendingUp },
  { label: 'Delete Leads',     allowed: false, icon: XCircle },
  { label: 'Manage Agents',    allowed: false, icon: Users },
  { label: 'IVR Management',   allowed: false, icon: Phone },
  { label: 'Project Settings', allowed: false, icon: Settings },
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const TIME_FORMATS = ['12 Hour', '24 Hour'];

const TODAY_ACTIVITY = {
  login: '09:12 AM',
  activeTime: '05h 42m',
  breakTime: '00h 38m',
  sessions: 2,
  device: 'Chrome • Windows',
};

const ACTIVITY_SUMMARY = [
  { label: 'Leads',      value: 148, icon: Users,         tone: 'purple'  },
  { label: 'Calls',      value: 264, icon: PhoneCall,     tone: 'purple'  },
  { label: 'Connected',  value: 186, icon: CheckCircle2,  tone: 'emerald' },
  { label: 'Follow-Ups', value: 96,  icon: CalendarCheck, tone: 'emerald' },
  { label: 'Converted',  value: 18,  icon: Award,         tone: 'amber'   },
];

const ACHIEVEMENTS = [
  { icon: Flame,     label: '4 Day Streak',    tone: 'amber'   },
  { icon: PhoneCall, label: '250+ Calls',      tone: 'purple'  },
  { icon: Target,    label: '15+ Conversions', tone: 'emerald' },
  { icon: Star,      label: '90%+ Follow-ups', tone: 'emerald' },
];

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function Account() {
  const { user, role, activeWebsite, logout } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('online');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [toast, setToast] = useState(null);

  const toastTimer = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.name || 'Arun Kumar',
    email: user?.email || 'arun.kumar@example.com',
    mobile: user?.mobile || '+91 98765 43210',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12 Hour',
  });

  const [notifications, setNotifications] = useState(() =>
    Object.fromEntries(NOTIFICATION_DEFAULTS.map((n) => [n.key, n.default]))
  );
  const [reminderTiming, setReminderTiming] = useState('15');

  const org = useMemo(() => ({
    agentId: 'AGT-0018',
    role: role || 'Telecalling Agent',
    project: activeWebsite?.name || 'Eliteinova Properties',
    department: 'Sales',
    joined: '12 Aug 2026',
    lastLogin: 'Today, 09:12 AM',
    lastPasswordChange: '18 Sep 2026',
  }), [role, activeWebsite]);

  /* Cleanup toast timer on unmount */
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (msg, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const handleSaveProfile = (data) => {
    setProfile((p) => ({ ...p, ...data }));
    setShowEditProfile(false);
    showToast('Profile updated');
  };

  const handleSaveContact = (data) => {
    setProfile((p) => ({ ...p, ...data }));
    setShowEditContact(false);
    showToast('Contact updated');
  };

  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
      navigate('/login');
    } else {
      showToast('Logout unavailable', 'error');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-5 px-3 py-4 pb-24">
        {/* ================= HEADER + PROFILE ================= */}
        <ProfileHeader
          profile={profile}
          org={org}
          status={status}
          setStatus={setStatus}
          showStatusDropdown={showStatusDropdown}
          setShowStatusDropdown={setShowStatusDropdown}
          onEdit={() => setShowEditProfile(true)}
          activity={TODAY_ACTIVITY}
        />

        {/* ================= KPI STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ACTIVITY_SUMMARY.map((a) => {
            const Icon = a.icon;
            const tones = {
              purple:  { bg: 'bg-violet-50', text: 'text-brand-purple' },
              emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
              amber:   { bg: 'bg-amber-50',   text: 'text-amber-600' },
            };
            const t = tones[a.tone];
            return (
              <div
                key={a.label}
                className="flex items-center gap-3 rounded-2xl border border-brand-lilac bg-white px-4 py-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.bg} ${t.text}`}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className={`font-display text-xl font-bold leading-none tabular-nums ${t.text}`}>
                    {a.value}
                  </p>
                  <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
                    {a.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* COLUMN 1 — Notifications */}
          <NotificationsCard
            notifications={notifications}
            setNotifications={setNotifications}
            reminderTiming={reminderTiming}
            setReminderTiming={setReminderTiming}
            onSave={() => showToast('Preferences saved')}
          />

          {/* COLUMN 2 — Security + Contact */}
          <div className="space-y-5">
            <SecurityCard
              sessions={TODAY_ACTIVITY.sessions}
              onManage={() => setShowSecurityModal(true)}
              onViewSessions={() => setShowSessionsModal(true)}
            />
            <ContactCard
              profile={profile}
              org={org}
              onEdit={() => setShowEditContact(true)}
            />
          </div>

          {/* COLUMN 3 — Permissions + Preferences */}
          <div className="space-y-5">
            <PermissionsCard
              permissions={PERMISSIONS}
              onViewAll={() => setShowPermissionsModal(true)}
            />
            <PreferencesCard
              profile={profile}
              setProfile={setProfile}
              onSave={() => showToast('Preferences saved')}
            />
          </div>
        </div>

        {/* ================= ACHIEVEMENTS BAR ================= */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-lilac bg-white px-5 py-4 shadow-sm">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-700">
            <Trophy size={13} /> Achievements
          </span>
          <div className="flex flex-wrap gap-2">
            {ACHIEVEMENTS.map((a) => {
              const Icon = a.icon;
              const tones = {
                purple:  'bg-violet-50 text-brand-purple',
                emerald: 'bg-emerald-50 text-emerald-600',
                amber:   'bg-amber-50 text-amber-600',
              };
              return (
                <span
                  key={a.label}
                  className={`inline-flex items-center gap-1.5 rounded-full ${tones[a.tone]} px-3 py-1.5 text-[11px] font-bold`}
                >
                  <Icon size={11} /> {a.label}
                </span>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/agent/performance')}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-[11px] font-bold text-white shadow-card hover:brightness-110"
          >
            View Performance <ChevronRight size={11} />
          </button>
        </div>

        {/* ================= SESSION BAR ================= */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-lilac bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <SessionInfo icon={Clock}      label="Login"  value={TODAY_ACTIVITY.login} />
            <SessionInfo icon={Smartphone} label="Device" value={TODAY_ACTIVITY.device} />
            <SessionInfo icon={Activity}   label="Active" value={TODAY_ACTIVITY.activeTime} />
          </div>
          <div className="ml-auto flex flex-wrap gap-2.5">
            <button
              onClick={() => showToast('Logged out from other sessions')}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-xs font-bold text-brand-ink transition-all hover:border-brand-magenta/40 hover:text-brand-magenta"
            >
              <LogOut size={13} /> Logout Others
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-brand-magenta px-4 py-2.5 text-xs font-bold text-white shadow-card transition-transform hover:scale-105"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showEditContact && (
        <EditContactModal
          profile={profile}
          onClose={() => setShowEditContact(false)}
          onSave={handleSaveContact}
        />
      )}

      {showSecurityModal && (
        <SecurityModal
          onClose={() => setShowSecurityModal(false)}
          onSave={() => { setShowSecurityModal(false); showToast('Security updated'); }}
        />
      )}

      {showPermissionsModal && (
        <PermissionsModal
          permissions={PERMISSIONS}
          onClose={() => setShowPermissionsModal(false)}
        />
      )}

      {showSessionsModal && (
        <SessionsModal
          sessions={TODAY_ACTIVITY.sessions}
          onClose={() => setShowSessionsModal(false)}
          onLogoutAll={() => { setShowSessionsModal(false); showToast('Other sessions logged out'); }}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================================================================
   PROFILE HEADER
   ================================================================ */
function ProfileHeader({
  profile, org, status, setStatus,
  showStatusDropdown, setShowStatusDropdown, onEdit, activity,
}) {
  const currentStatus = STATUS_OPTIONS.find((s) => s.key === status) || STATUS_OPTIONS[0];
  const StatusIcon = currentStatus.icon;

  const toneMap = {
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
    rose:    'bg-rose-50 text-brand-magenta ring-rose-200',
    amber:   'bg-amber-50 text-amber-700 ring-amber-200',
    purple:  'bg-violet-50 text-brand-purple ring-violet-200',
    slate:   'bg-slate-50 text-slate-600 ring-slate-200',
  };

  const initials = profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="relative rounded-2xl border border-brand-lilac bg-gradient-to-r from-white via-white to-brand-lilac/20 shadow-[0_8px_24px_-12px_rgba(227,28,121,0.2)]">
      {/* Decorative background elements - contained here to prevent clipping the dropdown */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <span className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-magenta/10 blur-3xl" />
        <span className="absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-brand-purple/10 blur-3xl" />
      </div>

      <div className="relative flex flex-wrap items-center gap-5 p-5 sm:p-6">
        {/* Avatar */}
        <div className="relative">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-purple text-2xl font-bold text-white shadow-[0_10px_30px_-10px_rgba(227,28,121,0.5)]">
            {initials}
          </span>
          <button
            onClick={onEdit}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-magenta shadow-md ring-1 ring-brand-lilac transition-transform hover:scale-110"
            title="Change photo"
          >
            <Camera size={12} />
          </button>
        </div>

        {/* Info */}
        <div className="relative min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold text-brand-ink">{profile.name}</h2>

            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown((s) => !s)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${toneMap[currentStatus.tone]}`}
              >
                <StatusIcon size={11} />
                {currentStatus.label}
                <ChevronDown size={11} />
              </button>

              {showStatusDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                  <div className="absolute left-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                    {STATUS_OPTIONS.map((s) => {
                      const Icon = s.icon;
                      const active = status === s.key;
                      return (
                        <button
                          key={s.key}
                          onClick={() => { setStatus(s.key); setShowStatusDropdown(false); }}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                            active
                              ? 'bg-brand-magenta/10 font-semibold text-brand-magenta'
                              : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                          }`}
                        >
                          <Icon size={12} />
                          {s.label}
                          {active && <Check size={11} className="ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="mt-1 text-sm font-medium text-brand-ink/60">
            {org.role} · {org.project}
          </p>

          <div className="mt-3.5 flex flex-wrap gap-2">
            <InfoChip icon={Hash}      label={org.agentId} />
            <InfoChip icon={Briefcase} label={org.department} />
            <InfoChip icon={Calendar}  label={`Joined ${org.joined}`} />
            <InfoChip icon={Clock}     label={`${activity.activeTime} active`} />
            <InfoChip icon={Timer}     label={`${activity.breakTime} break`} />
          </div>
        </div>

        <button
          onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-xs font-bold text-white shadow-card transition-transform hover:scale-105"
        >
          <Edit3 size={13} /> Edit Profile
        </button>
      </div>
    </div>
  );
}

function InfoChip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-ink/70">
      <Icon size={11} className="text-brand-magenta" />
      <span className="font-mono">{label}</span>
    </span>
  );
}

function SessionInfo({ icon: Icon, label, value }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-ink/60">
      <Icon size={13} className="text-brand-magenta" />
      <span className="text-brand-ink/40">{label}:</span>
      <span className="font-mono text-brand-ink">{value}</span>
    </span>
  );
}

/* ================================================================
   NOTIFICATIONS CARD
   ================================================================ */
function NotificationsCard({
  notifications, setNotifications,
  reminderTiming, setReminderTiming, onSave,
}) {
  const toggle = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
          <Bell size={14} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-brand-magenta">
          Notifications
        </p>
        <span className="ml-auto rounded-full bg-brand-lilac/60 px-2.5 py-1 text-[10px] font-bold text-brand-purple">
          {Object.values(notifications).filter(Boolean).length} on
        </span>
      </div>

      <div className="space-y-2">
        {NOTIFICATION_DEFAULTS.map((n) => (
          <div
            key={n.key}
            className="flex items-center gap-3 rounded-xl border border-brand-lilac/50 bg-white px-3.5 py-2.5 transition-colors hover:border-brand-lilac"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-brand-ink">{n.label}</p>
              <p className="truncate text-[10px] text-brand-ink/45">{n.desc}</p>
            </div>
            <ToggleSwitch
              checked={notifications[n.key]}
              onChange={() => toggle(n.key)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-brand-lilac/60 bg-brand-mist/40 p-3.5">
        <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
          <CalendarClock size={12} /> Follow-up reminder timing
        </p>
        <div className="flex flex-wrap gap-1.5">
          {REMINDER_TIMINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReminderTiming(r.value)}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-all ${
                reminderTiming === r.value
                  ? 'border-brand-magenta bg-brand-magenta text-white'
                  : 'border-brand-lilac bg-white text-brand-ink/70 hover:border-brand-magenta/40 hover:text-brand-magenta'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-xs font-bold text-white shadow-card transition-transform hover:scale-[1.01]"
      >
        <Save size={13} /> Save Preferences
      </button>
    </div>
  );
}

/* Toggle switch with proper a11y */
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-magenta/30 ${
        checked ? 'bg-gradient-to-r from-brand-magenta to-brand-purple' : 'bg-brand-lilac'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
          checked ? 'translate-x-[19px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

/* ================================================================
   SECURITY CARD
   ================================================================ */
function SecurityCard({ sessions, onManage, onViewSessions }) {
  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-brand-magenta text-white shadow-card">
          <Lock size={14} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-rose-600">
          Security
        </p>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
          <Check size={10} /> 2FA On
        </span>
      </div>

      <div className="space-y-2.5">
        <SecurityRow
          icon={Key}
          label="Password"
          value="Last changed 18 Sep 2026"
          action="Change"
          onClick={onManage}
        />
        <SecurityRow
          icon={Fingerprint}
          label="Two-Factor Auth"
          value="Enabled"
          tone="emerald"
          action="Manage"
          onClick={onManage}
        />
        <SecurityRow
          icon={Smartphone}
          label="Login Sessions"
          value={`${sessions} active sessions`}
          action="View"
          onClick={onViewSessions}
        />
      </div>
    </div>
  );
}

function SecurityRow({ icon: Icon, label, value, tone, action, onClick }) {
  const valueTones = {
    emerald: 'text-emerald-600',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-lilac/50 bg-white px-3.5 py-3 transition-colors hover:border-brand-lilac">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-brand-ink">{label}</p>
        <p className={`truncate text-[10px] ${tone ? valueTones[tone] : 'text-brand-ink/50'}`}>
          {value}
        </p>
      </div>
      <button
        onClick={onClick}
        className="shrink-0 rounded-lg border border-brand-lilac bg-white px-3 py-1.5 text-[10px] font-bold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
      >
        {action}
      </button>
    </div>
  );
}

/* ================================================================
   CONTACT CARD
   ================================================================ */
function ContactCard({ profile, org, onEdit }) {
  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card">
          <User size={14} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-brand-purple">
          Contact
        </p>
        <button
          onClick={onEdit}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[10px] font-bold text-brand-ink hover:border-brand-magenta/40 hover:text-brand-magenta"
        >
          <Edit3 size={10} /> Edit
        </button>
      </div>

      <div className="space-y-2.5">
        <ContactRow icon={Mail}      label="Email"   value={profile.email} />
        <ContactRow icon={Phone}     label="Phone"   value={profile.mobile} />
        <ContactRow icon={Building2} label="Project" value={org.project} />
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-lilac/50 bg-white px-3.5 py-3 transition-colors hover:border-brand-lilac">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">{label}</p>
        <p className="truncate text-xs font-semibold text-brand-ink">{value}</p>
      </div>
    </div>
  );
}

/* ================================================================
   PERMISSIONS CARD
   ================================================================ */
function PermissionsCard({ permissions, onViewAll }) {
  const preview = permissions.slice(0, 5);
  const allowedCount = permissions.filter((p) => p.allowed).length;

  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card">
          <Shield size={14} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-brand-purple">
          My Access
        </p>
        <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
          {allowedCount} allowed
        </span>
      </div>

      <div className="space-y-2">
        {preview.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.label}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                p.allowed
                  ? 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-300'
                  : 'border-brand-lilac/50 bg-brand-mist/40 hover:border-brand-lilac'
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                p.allowed
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-brand-lilac/60 text-brand-ink/40'
              }`}>
                <Icon size={12} />
              </span>
              <span className={`flex-1 truncate text-xs font-semibold ${
                p.allowed ? 'text-brand-ink' : 'text-brand-ink/50'
              }`}>
                {p.label}
              </span>
              {p.allowed ? (
                <Check size={13} className="shrink-0 text-emerald-600" />
              ) : (
                <X size={13} className="shrink-0 text-slate-400" />
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onViewAll}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-lilac bg-white py-2.5 text-xs font-bold text-brand-ink transition-all hover:border-brand-magenta/40 hover:text-brand-magenta"
      >
        <Eye size={12} /> View All ({permissions.length})
      </button>
    </div>
  );
}

/* ================================================================
   PREFERENCES CARD
   ================================================================ */
function PreferencesCard({ profile, setProfile, onSave }) {
  return (
    <div className="card !p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-card">
          <Settings size={14} />
        </span>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-brand-magenta">
          Preferences
        </p>
      </div>

      <div className="space-y-3">
        <SelectRow
          icon={Globe}
          label="Language"
          value={profile.language}
          options={LANGUAGES}
          onChange={(v) => setProfile((p) => ({ ...p, language: v }))}
        />
        <SelectRow
          icon={Calendar}
          label="Date Format"
          value={profile.dateFormat}
          options={DATE_FORMATS}
          onChange={(v) => setProfile((p) => ({ ...p, dateFormat: v }))}
        />
        <SelectRow
          icon={Clock}
          label="Time Format"
          value={profile.timeFormat}
          options={TIME_FORMATS}
          onChange={(v) => setProfile((p) => ({ ...p, timeFormat: v }))}
        />
      </div>

      <button
        onClick={onSave}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-xs font-bold text-white shadow-card transition-transform hover:scale-[1.01]"
      >
        <Save size={13} /> Save Preferences
      </button>
    </div>
  );
}

function SelectRow({ icon: Icon, label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
        <Icon size={14} />
      </span>
      <p className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
        {label}
      </p>
      <div className="relative flex-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-brand-lilac bg-white px-3 py-2 pr-8 text-xs font-semibold text-brand-ink outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
      </div>
    </div>
  );
}

/* ================================================================
   MODALS
   ================================================================ */
function EditProfileModal({ profile, onClose, onSave }) {
  const [name, setName] = useState(profile.name);

  return (
    <ModalShell onClose={onClose} title="Edit Profile" icon={Edit3}>
      <Input label="Full Name" value={name} onChange={setName} placeholder="Enter your full name" />

      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
          Cancel
        </button>
        <button
          onClick={() => name.trim() && onSave({ name: name.trim() })}
          disabled={!name.trim()}
          className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </ModalShell>
  );
}

function EditContactModal({ profile, onClose, onSave }) {
  const [email, setEmail] = useState(profile.email);
  const [mobile, setMobile] = useState(profile.mobile);

  return (
    <ModalShell onClose={onClose} title="Edit Contact" icon={User}>
      <div className="space-y-3">
        <Input label="Email" value={email} onChange={setEmail} placeholder="name@example.com" />
        <Input label="Mobile" value={mobile} onChange={setMobile} placeholder="+91 XXXXX XXXXX" />
      </div>

      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
          Cancel
        </button>
        <button
          onClick={() => email.trim() && mobile.trim() && onSave({ email: email.trim(), mobile: mobile.trim() })}
          disabled={!email.trim() || !mobile.trim()}
          className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </ModalShell>
  );
}

function SecurityModal({ onClose, onSave }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [twoFA, setTwoFA] = useState(true);

  const canSave = current.length > 0 && newPass.length >= 6 && newPass === confirm;

  return (
    <ModalShell onClose={onClose} title="Security Settings" icon={Lock}>
      <div className="space-y-3">
        <PasswordField label="Current Password" value={current} onChange={setCurrent} show={show1} toggle={() => setShow1((s) => !s)} autoComplete="current-password" />
        <PasswordField label="New Password"     value={newPass} onChange={setNewPass} show={show2} toggle={() => setShow2((s) => !s)} autoComplete="new-password" />
        <PasswordField label="Confirm Password" value={confirm} onChange={setConfirm} show={show3} toggle={() => setShow3((s) => !s)} autoComplete="new-password" />

        {newPass && confirm && newPass !== confirm && (
          <p className="text-[11px] font-semibold text-rose-500">Passwords do not match</p>
        )}

        <div className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-ink">Two-Factor Auth</p>
            <p className="text-[10px] text-brand-ink/50">{twoFA ? 'Enabled' : 'Disabled'}</p>
          </div>
          <ToggleSwitch checked={twoFA} onChange={() => setTwoFA((v) => !v)} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40">
          Cancel
        </button>
        <button
          onClick={() => canSave && onSave({ current, newPass, twoFA })}
          disabled={!canSave}
          className="flex-1 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-50"
        >
          Update
        </button>
      </div>
    </ModalShell>
  );
}

function PasswordField({ label, value, onChange, show, toggle, autoComplete = 'off' }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-brand-ink/40 hover:bg-brand-lilac/40"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function PermissionsModal({ permissions, onClose }) {
  return (
    <ModalShell onClose={onClose} title="My Permissions" icon={Shield}>
      <div className="space-y-1.5">
        {permissions.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.label}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${
                p.allowed
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-brand-lilac/60 bg-brand-mist/40'
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                p.allowed
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-brand-lilac/60 text-brand-ink/40'
              }`}>
                <Icon size={12} />
              </span>
              <span className={`flex-1 text-xs font-semibold ${p.allowed ? 'text-brand-ink' : 'text-brand-ink/50'}`}>
                {p.label}
              </span>
              {p.allowed ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                  <Check size={9} /> Allowed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                  <X size={9} /> Restricted
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3">
        <p className="flex items-start gap-2 text-[11px] text-brand-ink/70">
          <Info size={12} className="mt-0.5 shrink-0 text-brand-purple" />
          <span>Restricted permissions are managed by your administrator.</span>
        </p>
      </div>
    </ModalShell>
  );
}

function SessionsModal({ sessions, onClose, onLogoutAll }) {
  const mockSessions = [
    { device: 'Chrome • Windows', location: 'Coimbatore, IN', last: 'Active now', current: true },
    { device: 'Safari • iPhone',  location: 'Coimbatore, IN', last: '1 hour ago', current: false },
  ];

  const visible = mockSessions.slice(0, Math.max(1, Number(sessions) || 1));

  return (
    <ModalShell onClose={onClose} title="Active Sessions" icon={Smartphone}>
      <div className="space-y-2">
        {visible.map((s) => (
          <div key={s.device} className="flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
              <Smartphone size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-brand-ink">{s.device}</p>
              <p className="flex items-center gap-1 text-[10px] text-brand-ink/50">
                <MapPin size={9} /> {s.location} · {s.last}
              </p>
            </div>
            {s.current && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                Current
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onLogoutAll}
        className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
      >
        <LogOut size={14} /> Logout All Other Devices
      </button>
    </ModalShell>
  );
}

/* ================================================================
   SHARED COMPONENTS
   ================================================================ */
function ModalShell({ title, icon: Icon, onClose, children }) {
  /* Close on Escape key */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white">
              {Icon ? <Icon size={18} /> : <Sparkles size={18} />}
            </div>
            <h3 className="font-display text-lg font-semibold text-brand-ink">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
      />
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2"
    >
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}