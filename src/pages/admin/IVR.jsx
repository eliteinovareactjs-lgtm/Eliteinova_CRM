// src/pages/admin/IVR.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PhoneCall, Clock, Mic, Voicemail, Save, X, Plus, Trash2, Copy, Check,
  ChevronDown, Hash, Building2, User as UserIcon, Users, Route, Repeat,
  Waves, Headphones, AlertCircle, CheckCircle2, Settings, Volume2, Timer,
  PhoneIncoming, PhoneOutgoing, Calendar, Moon, Sun, Globe, Layers,
  PlayCircle, PauseCircle, Music, ListFilter, PhoneForwarded, DoorOpen,
  Flag, PartyPopper, Edit3, RotateCcw, Info, TrendingUp, GitBranch,
  PhoneOff, PhoneMissed, Star, Sparkles, Radio, UserCheck, Zap, Hash as HashIcon,
  PhoneOutgoing as PhoneOut, MessageSquare, Briefcase, ArrowRight, PlusCircle,
  AlertTriangle, XCircle, Copy as CopyIcon, Save as SaveIcon,
  Grid3x3, List, MoreVertical, ChevronRight, Info as InfoIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IVR_CONFIGS, AGENTS } from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'config',    label: 'Configuration',    icon: Settings },
  { key: 'numbers',   label: 'IVR Numbers',      icon: PhoneCall },
  { key: 'menu',      label: 'IVR Menu',         icon: Hash },
  { key: 'routing',   label: 'Call Routing',     icon: Route },
  { key: 'hours',     label: 'Business Hours',   icon: Clock },
  { key: 'holidays',  label: 'Holidays',         icon: Flag },
  { key: 'queue',     label: 'Call Queue',       icon: Waves },
  { key: 'afterhours', label: 'After-Hours',     icon: Moon },
  { key: 'voicemail', label: 'Voicemail',        icon: Voicemail },
  { key: 'missed',    label: 'Missed Calls',     icon: PhoneMissed },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ROUTING_STRATEGIES = ['Round Robin', 'Least Busy', 'Longest Idle', 'Skill-Based'];

const MENU_ACTIONS = ['Department', 'Agent', 'Team', 'Queue', 'Voicemail', 'Repeat Menu', 'End Call'];

const AVAILABLE_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '#'];

const DEFAULT_MENU = [
  { key: '1', action: 'Department', target: 'Sales',         label: 'Sales' },
  { key: '2', action: 'Department', target: 'Support',       label: 'Support' },
  { key: '3', action: 'Agent',      target: 'Agent1',        label: 'Direct Agent' },
  { key: '4', action: 'Queue',      target: 'General Queue', label: 'Wait in queue' },
  { key: '0', action: 'Voicemail',  target: '',              label: 'Leave a message' },
];

const DEFAULT_BUSINESS_HOURS = {
  Monday:    { open: true,  from: '09:00', to: '19:00' },
  Tuesday:   { open: true,  from: '09:00', to: '19:00' },
  Wednesday: { open: true,  from: '09:00', to: '19:00' },
  Thursday:  { open: true,  from: '09:00', to: '19:00' },
  Friday:    { open: true,  from: '09:00', to: '19:00' },
  Saturday:  { open: true,  from: '10:00', to: '14:00' },
  Sunday:    { open: false, from: '',      to: '' },
};

const DEFAULT_NUMBERS = [
  { id: 'ivr-1', number: '+91 98 7654 3210', label: 'Primary IVR', status: 'Active', assignedTo: 'All Departments' },
];

const DEFAULT_HOLIDAYS = [
  { id: 'h-1', name: 'Republic Day',  date: '2026-01-26', recurring: true },
  { id: 'h-2', name: 'Holi',          date: '2026-03-04', recurring: true },
  { id: 'h-3', name: 'Independence Day', date: '2026-08-15', recurring: true },
  { id: 'h-4', name: 'Diwali',        date: '2026-11-08', recurring: true },
  { id: 'h-5', name: 'Christmas',     date: '2026-12-25', recurring: true },
];

const DEFAULT_AFTER_HOURS = {
  enabled: true,
  message: 'Thank you for calling. Our office is currently closed. Please call back during business hours or leave a message after the beep.',
  forwardToVoicemail: true,
  forwardNumber: '',
  allowCallback: true,
};

const DEFAULT_VOICEMAIL = {
  enabled: true,
  greeting: 'Please leave your name, number, and a brief message after the beep. We will get back to you shortly.',
  maxDuration: 120,
  transcribe: true,
  notifyEmail: true,
  notificationEmail: '',
};

const DEFAULT_MISSED_CALL = {
  autoCallback: true,
  smsToCaller: true,
  smsTemplate: 'Hi! Sorry we missed your call. We will get back to you shortly.',
  assignToAgent: true,
  createFollowUp: true,
};

const STORAGE_PREFIX = 'ivr:';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
};

/* Robust phone validator: 7-15 digits, optional +, spaces, dashes, parentheses */
const isValidPhone = (val) => {
  if (!val) return false;
  const digits = String(val).replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

/* Simple email validator */
const isValidEmail = (val) => {
  if (!val) return true; // optional
  return /^\S+@\S+\.\S+$/.test(val);
};

/* Normalize a partial config into a full config with all required keys */
const buildFullConfig = (partial = {}) => ({
  welcomeMessage: partial.welcomeMessage || 'Welcome to our CRM. Please listen carefully to the following options.',
  language: partial.language || 'English',
  voice: partial.voice || 'Female',
  recording: partial.recording ?? true,
  voicemailOn: partial.voicemailOn ?? true,
  departments: partial.departments || ['Sales', 'Support', 'Billing'],
  teams: partial.teams || ['Team A', 'Team B'],
  agentRouting: partial.agentRouting || 'Round Robin',
  menuOptionsDetailed: partial.menuOptionsDetailed || DEFAULT_MENU,
  businessHoursSchedule: partial.businessHoursSchedule || DEFAULT_BUSINESS_HOURS,
  queue: {
    enabled: true,
    maxWait: 5,
    music: 'Default Hold Music',
    overflow: 'Voicemail',
    welcomeHold: 'All our agents are currently busy. Please hold. Your call will be answered in the order it was received.',
    ...(partial.queue || {}),
  },
  routingRules: partial.routingRules || [
    { id: 'rule-1', name: 'Business Hours Routing', condition: '9 AM – 7 PM',        action: 'Route to available agent' },
    { id: 'rule-2', name: 'After-Hours Routing',    condition: '7 PM – 9 AM',        action: 'Play voicemail message' },
    { id: 'rule-3', name: 'Holiday Routing',        condition: 'Public holidays',     action: 'Forward to manager line' },
    { id: 'rule-4', name: 'Overflow Routing',       condition: 'No agent available > 30s', action: 'Queue and callback' },
  ],
  ivrNumbers: partial.ivrNumbers || DEFAULT_NUMBERS,
  holidays: partial.holidays || DEFAULT_HOLIDAYS,
  afterHours: { ...DEFAULT_AFTER_HOURS, ...(partial.afterHours || {}) },
  voicemail: { ...DEFAULT_VOICEMAIL, ...(partial.voicemail || partial.voicemailConfig || {}) },
  missedCallHandling: { ...DEFAULT_MISSED_CALL, ...(partial.missedCallHandling || {}) },
});

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function IVR() {
  const { activeWebsiteId, activeWebsite } = useAuth();
  const [tab, setTab] = useState('config');
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /* ── Base config from mockData ── */
  const baseConfig = useMemo(
    () => IVR_CONFIGS.find((c) => c.projectId === activeWebsiteId) || IVR_CONFIGS[0] || {},
    [activeWebsiteId]
  );

  /* ── Full config, persisted per website ── */
  const [config, setConfig] = useState(() => buildFullConfig(baseConfig));

  /* Rebuild when activeWebsiteId or baseConfig changes */
  useEffect(() => {
    const stored = loadState(`config:${activeWebsiteId}`, null);
    const merged = buildFullConfig(stored ? { ...baseConfig, ...stored } : baseConfig);
    setConfig(merged);
    setHasUnsavedChanges(false);
    setTab('config');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebsiteId]);

  /* ── Agents for website ── */
  const agents = useMemo(
    () => AGENTS.filter((a) => a.websiteId === activeWebsiteId),
    [activeWebsiteId]
  );

  const updateConfig = (updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const handleSave = () => {
    /* Validation */
    const errors = [];
    if (config.queue?.enabled && (!config.queue.maxWait || config.queue.maxWait <= 0)) {
      errors.push('Queue max wait must be greater than 0');
    }
    if (config.voicemail?.enabled && (!config.voicemail.maxDuration || config.voicemail.maxDuration < 10)) {
      errors.push('Voicemail duration must be at least 10 seconds');
    }
    if (config.afterHours?.forwardNumber && !isValidPhone(config.afterHours.forwardNumber)) {
      errors.push('After-hours forward number is invalid');
    }
    if (config.voicemail?.notifyEmail && config.voicemail.notificationEmail && !isValidEmail(config.voicemail.notificationEmail)) {
      errors.push('Voicemail notification email is invalid');
    }
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    }

    saveState(`config:${activeWebsiteId}`, config);
    setHasUnsavedChanges(false);
    showToast(`IVR configuration saved for ${activeWebsite?.name}`);
  };

  const performReset = () => {
    localStorage.removeItem(`${STORAGE_PREFIX}config:${activeWebsiteId}`);
    const fresh = IVR_CONFIGS.find((c) => c.projectId === activeWebsiteId) || IVR_CONFIGS[0] || {};
    setConfig(buildFullConfig(fresh));
    setHasUnsavedChanges(false);
    setConfirmReset(false);
    showToast('Changes reverted', 'error');
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    showToast('Copied to clipboard');
  };

  const counts = {
    numbers: config.ivrNumbers?.length || 0,
    menu: config.menuOptionsDetailed?.length || 0,
    routing: config.routingRules?.length || 0,
    holidays: config.holidays?.length || 0,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-ink">
              IVR Management
              {hasUnsavedChanges && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                  Unsaved
                </span>
              )}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <PhoneCall size={13} className="text-brand-magenta" />
              Configure inbound call flows for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setConfirmReset(true)}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md"
            >
              <RotateCcw size={13} className="transition-transform group-hover:-rotate-90" /> Reset
            </button>
            <button
              onClick={handleSave}
              className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110 ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-brand-magenta to-brand-purple'
                  : 'bg-gradient-to-r from-slate-400 to-slate-500'
              }`}
            >
              <Save size={14} className="transition-transform group-hover:scale-110" /> Save
            </button>
          </div>
        </div>

        {/* ═══ KPI STRIP ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">IVR Overview</p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Live Snapshot</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <KpiCard icon={PhoneCall} label="Active Numbers" value={counts.numbers} sub="Configured lines" color="purple" active={tab === 'numbers'} onClick={() => setTab('numbers')} delay={0} />
            <KpiCard icon={Hash} label="Menu Keys" value={counts.menu} sub="Keypad actions" color="emerald" active={tab === 'menu'} onClick={() => setTab('menu')} delay={40} />
            <KpiCard icon={Route} label="Routing Rules" value={counts.routing} sub="Call flow rules" color="amber" active={tab === 'routing'} onClick={() => setTab('routing')} delay={80} />
            <KpiCard icon={Flag} label="Holidays" value={counts.holidays} sub="Non-working days" color="rose" active={tab === 'holidays'} onClick={() => setTab('holidays')} delay={120} />
            <KpiCard icon={Waves} label="Queue Status" value={config.queue?.enabled ? 'ON' : 'OFF'} sub={config.queue?.enabled ? `Max wait ${config.queue.maxWait}m` : 'Disabled'} color={config.queue?.enabled ? 'emerald' : 'rose'} active={tab === 'queue'} onClick={() => setTab('queue')} delay={160} />
          </div>
        </div>

        {/* ═══ TABS ═══ */}
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

        {/* ═══ TAB CONTENT ═══ */}
        {tab === 'config' && <ConfigTab config={config} onUpdate={updateConfig} />}
        {tab === 'numbers' && <NumbersTab config={config} onUpdate={updateConfig} onCopy={handleCopy} copiedId={copiedId} showToast={showToast} />}
        {tab === 'menu' && <MenuTab config={config} onUpdate={updateConfig} showToast={showToast} />}
        {tab === 'routing' && <RoutingTab config={config} onUpdate={updateConfig} agents={agents} showToast={showToast} />}
        {tab === 'hours' && <HoursTab config={config} onUpdate={updateConfig} showToast={showToast} />}
        {tab === 'holidays' && <HolidaysTab config={config} onUpdate={updateConfig} showToast={showToast} />}
        {tab === 'queue' && <QueueTab config={config} onUpdate={updateConfig} showToast={showToast} />}
        {tab === 'afterhours' && <AfterHoursTab config={config} onUpdate={updateConfig} showToast={showToast} />}
        {tab === 'voicemail' && <VoicemailTab config={config} onUpdate={updateConfig} showToast={showToast} />}
        {tab === 'missed' && <MissedCallTab config={config} onUpdate={updateConfig} showToast={showToast} />}

        {confirmReset && (
          <ConfirmDialog
            title="Reset IVR configuration?"
            message="This will revert all changes back to the default values. This action cannot be undone."
            confirmLabel="Reset Everything"
            onCancel={() => setConfirmReset(false)}
            onConfirm={performReset}
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
  const themes = {
    purple:  { border: 'border-violet-200 hover:border-violet-400', bg: 'from-violet-50 via-violet-50/30 to-white', iconBg: 'bg-violet-100 text-brand-purple border-violet-200', bar: 'from-brand-purple to-brand-magenta', glow: 'bg-brand-purple/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]', valueColor: 'text-brand-purple', ring: 'ring-violet-300' },
    emerald: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'from-emerald-50 via-emerald-50/30 to-white', iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'from-emerald-500 to-emerald-400', glow: 'bg-emerald-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]', valueColor: 'text-emerald-600', ring: 'ring-emerald-300' },
    amber:   { border: 'border-amber-200 hover:border-amber-400', bg: 'from-amber-50 via-amber-50/30 to-white', iconBg: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'from-amber-500 to-orange-400', glow: 'bg-amber-500/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]', valueColor: 'text-amber-600', ring: 'ring-amber-300' },
    rose:    { border: 'border-rose-200 hover:border-rose-400', bg: 'from-rose-50 via-rose-50/30 to-white', iconBg: 'bg-rose-100 text-brand-magenta border-rose-200', bar: 'from-brand-magenta to-brand-purple', glow: 'bg-brand-magenta/25', shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]', valueColor: 'text-brand-magenta', ring: 'ring-rose-300' },
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
      </div>

      <div className="relative z-10 w-full">
        <p className={`font-display text-2xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1 — CONFIGURATION
   ═══════════════════════════════════════════════════════════════ */
function ConfigTab({ config, onUpdate }) {
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const handlePreview = () => {
    setPreviewPlaying(true);
    setTimeout(() => setPreviewPlaying(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-5">
        <SectionHeader icon={Settings} title="General Configuration" subtitle="Basic IVR settings applied to all calls" />

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Volume2 size={11} /> Welcome Message
          </label>
          <textarea
            value={config.welcomeMessage || ''}
            onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
            rows={2}
            placeholder="Welcome to our CRM…"
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-brand-ink/40">
            Played before the menu options. Keep it under 10 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Default Language"
            icon={Globe}
            value={config.language || 'English'}
            onChange={(v) => onUpdate({ language: v })}
            options={['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam']}
          />
          <SelectField
            label="Voice"
            icon={Volume2}
            value={config.voice || 'Female'}
            onChange={(v) => onUpdate({ voice: v })}
            options={['Female', 'Male', 'Neutral']}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ToggleRow
            label="Call Recording"
            desc="Record every inbound call for quality and training."
            value={config.recording ?? true}
            onChange={(v) => onUpdate({ recording: v })}
            icon={Mic}
          />
          <ToggleRow
            label="Voicemail Fallback"
            desc="Let callers leave a message when no agent is available."
            value={config.voicemailOn ?? true}
            onChange={(v) => onUpdate({ voicemailOn: v })}
            icon={Voicemail}
          />
        </div>

        <div className="rounded-xl border border-brand-magenta/30 bg-gradient-to-br from-brand-magenta/[0.06] to-brand-purple/[0.04] p-4">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
            <PlayCircle size={12} /> Preview
          </p>
          <p className="mt-2 text-sm italic text-brand-ink/80">
            "{config.welcomeMessage || 'Welcome to our CRM.'}"
          </p>
          <button
            onClick={handlePreview}
            disabled={previewPlaying}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-magenta shadow-sm transition-all hover:bg-brand-lilac/40 disabled:opacity-60"
          >
            {previewPlaying ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-magenta/40 border-t-brand-magenta" />
                Playing…
              </>
            ) : (
              <>
                <PlayCircle size={12} /> Play Preview
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 — NUMBERS
   ═══════════════════════════════════════════════════════════════ */
function NumbersTab({ config, onUpdate, onCopy, copiedId, showToast }) {
  const numbers = config.ivrNumbers || [];
  const [newNumber, setNewNumber] = useState({ number: '', label: '', assignedTo: 'All Departments' });

  const handleAdd = () => {
    const num = newNumber.number.trim();
    if (!num) return;
    if (!isValidPhone(num)) {
      showToast('Please enter a valid phone number (7-15 digits)', 'error');
      return;
    }
    if (numbers.some((n) => n.number.replace(/\D/g, '') === num.replace(/\D/g, ''))) {
      showToast('This number is already configured', 'error');
      return;
    }
    onUpdate({
      ivrNumbers: [
        ...numbers,
        {
          id: uid('ivr'),
          number: num,
          label: newNumber.label.trim() || 'Additional IVR Line',
          status: 'Active',
          assignedTo: newNumber.assignedTo,
        },
      ],
    });
    setNewNumber({ number: '', label: '', assignedTo: 'All Departments' });
    showToast('Number added');
  };

  const updateNumber = (id, updates) => {
    onUpdate({ ivrNumbers: numbers.map((n) => (n.id === id ? { ...n, ...updates } : n)) });
  };

  const removeNumber = (id) => {
    onUpdate({ ivrNumbers: numbers.filter((n) => n.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <SectionHeader icon={PhoneCall} title="IVR Phone Numbers" subtitle="Manage inbound lines routed into this IVR" />

        {/* Add row */}
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-dashed border-brand-magenta/40 bg-brand-magenta/[0.03] p-3 sm:grid-cols-12 sm:items-center">
          <div className="sm:col-span-5">
            <input
              value={newNumber.number}
              onChange={(e) => setNewNumber({ ...newNumber, number: e.target.value })}
              placeholder="+91 98 7654 3210"
              className="w-full rounded-lg border border-brand-lilac bg-white px-3 py-2 font-mono text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>
          <div className="sm:col-span-4">
            <input
              value={newNumber.label}
              onChange={(e) => setNewNumber({ ...newNumber, label: e.target.value })}
              placeholder="Label (e.g. Support Line)"
              className="w-full rounded-lg border border-brand-lilac bg-white px-3 py-2 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={newNumber.assignedTo}
              onChange={(e) => setNewNumber({ ...newNumber, assignedTo: e.target.value })}
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option>All Departments</option>
              <option>Sales</option>
              <option>Support</option>
              <option>Billing</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <button
              onClick={handleAdd}
              disabled={!newNumber.number.trim()}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>

        {/* List */}
        {numbers.length === 0 ? (
          <p className="py-6 text-center text-xs text-brand-ink/40">No IVR numbers configured yet.</p>
        ) : (
          <ul className="space-y-2">
            {numbers.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
                  <PhoneCall size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <input
                    value={n.label}
                    onChange={(e) => updateNumber(n.id, { label: e.target.value })}
                    className="w-full border-0 bg-transparent p-0 font-display text-sm font-semibold text-brand-ink outline-none"
                  />
                  <p className="mt-0.5 font-mono text-xs text-brand-ink/60">{n.number}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-lilac/60 px-2.5 py-1 text-[10px] font-bold text-brand-purple">
                  {n.assignedTo}
                </span>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  n.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {n.status}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => updateNumber(n.id, { status: n.status === 'Active' ? 'Paused' : 'Active' })}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                      n.status === 'Active' ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                    title={n.status === 'Active' ? 'Pause' : 'Activate'}
                  >
                    {n.status === 'Active' ? <PauseCircle size={13} /> : <PlayCircle size={13} />}
                  </button>
                  <button
                    onClick={() => onCopy(n.id, n.number)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/40 hover:text-brand-magenta"
                    title="Copy number"
                  >
                    {copiedId === n.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={() => removeNumber(n.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3 — MENU
   ═══════════════════════════════════════════════════════════════ */
function MenuTab({ config, onUpdate, showToast }) {
  const menu = config.menuOptionsDetailed || [];
  const usedKeys = menu.map((m) => m.key);
  const availableKeys = AVAILABLE_KEYS.filter((k) => !usedKeys.includes(k));

  const addOption = () => {
    if (availableKeys.length === 0) {
      showToast('All keypad keys (0-9, *, #) are already used', 'error');
      return;
    }
    const nextKey = availableKeys[0];
    onUpdate({
      menuOptionsDetailed: [
        ...menu,
        { key: nextKey, action: 'Department', target: 'Sales', label: 'New Option' },
      ],
    });
  };

  const updateOption = (idx, updates) => {
    /* Prevent duplicate keys */
    if (updates.key) {
      const newKey = String(updates.key).slice(0, 1);
      const duplicateIdx = menu.findIndex((m, i) => i !== idx && m.key === newKey);
      if (duplicateIdx !== -1) {
        showToast(`Key "${newKey}" is already used by another option`, 'error');
        return;
      }
      updates = { ...updates, key: newKey };
    }
    const next = [...menu];
    next[idx] = { ...next[idx], ...updates };
    onUpdate({ menuOptionsDetailed: next });
  };

  const removeOption = (idx) => {
    onUpdate({ menuOptionsDetailed: menu.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader icon={Hash} title="IVR Menu & Keypad Options" subtitle="What happens when each key is pressed" />
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-lilac/60 px-2.5 py-1 text-[10px] font-bold text-brand-purple">
              {usedKeys.length} / {AVAILABLE_KEYS.length} keys used
            </span>
            <button
              onClick={addOption}
              disabled={availableKeys.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-3.5 py-2 text-[11px] font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              <Plus size={12} /> Add Key
            </button>
          </div>
        </div>

        {menu.length === 0 ? (
          <p className="py-6 text-center text-xs text-brand-ink/40">No menu options yet. Click "Add Key" to create one.</p>
        ) : (
          <div className="space-y-2">
            {menu.map((opt, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-2 rounded-xl border border-brand-lilac bg-white p-3 sm:grid-cols-12 sm:items-center">
                <div className="sm:col-span-1">
                  <select
                    value={opt.key}
                    onChange={(e) => updateOption(idx, { key: e.target.value })}
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2 py-2 text-center font-mono text-base font-bold outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                  >
                    {/* Include current key even if it's the only occurrence */}
                    <option value={opt.key}>{opt.key}</option>
                    {AVAILABLE_KEYS.filter((k) => k !== opt.key && !usedKeys.includes(k)).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={opt.action}
                    onChange={(e) => updateOption(idx, { action: e.target.value })}
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                  >
                    {MENU_ACTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <input
                    value={opt.target}
                    onChange={(e) => updateOption(idx, { target: e.target.value })}
                    placeholder="Target (e.g. Sales)"
                    disabled={opt.action === 'Repeat Menu' || opt.action === 'End Call' || opt.action === 'Voicemail'}
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    value={opt.label}
                    onChange={(e) => updateOption(idx, { label: e.target.value })}
                    placeholder="Label (e.g. Press 1 for Sales)"
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                  />
                </div>
                <div className="flex justify-end sm:col-span-1">
                  <button
                    onClick={() => removeOption(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      {menu.length > 0 && (
        <div className="card !p-5">
          <SectionHeader icon={PlayCircle} title="Menu Preview" subtitle="How callers will see the keypad options" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {menu.map((opt) => (
              <div key={opt.key} className="group flex flex-col items-center gap-2 rounded-2xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-white p-3 transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple font-mono text-xl font-bold text-white shadow-md transition-transform group-hover:scale-110">
                  {opt.key}
                </span>
                <p className="line-clamp-2 text-center text-[11px] font-semibold text-brand-ink">
                  {opt.label || opt.target || opt.action}
                </p>
                <span className="rounded-full bg-brand-lilac/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-purple">
                  {opt.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4 — ROUTING
   ═══════════════════════════════════════════════════════════════ */
function RoutingTab({ config, onUpdate, agents, showToast }) {
  const rules = config.routingRules || [];

  const addRule = () => {
    onUpdate({
      routingRules: [
        ...rules,
        { id: uid('rule'), name: 'New Routing Rule', condition: '', action: 'Route to available agent' },
      ],
    });
  };

  const updateRule = (id, updates) => {
    onUpdate({ routingRules: rules.map((r) => (r.id === id ? { ...r, ...updates } : r)) });
  };

  const removeRule = (id) => {
    onUpdate({ routingRules: rules.filter((r) => r.id !== id) });
  };

  const departments = config.departments || [];
  const teams = config.teams || [];
  const [newDept, setNewDept] = useState('');
  const [newTeam, setNewTeam] = useState('');

  const addDept = () => {
    const d = newDept.trim();
    if (!d) return;
    if (departments.includes(d)) {
      showToast('Department already exists', 'error');
      return;
    }
    onUpdate({ departments: [...departments, d] });
    setNewDept('');
  };

  const removeDept = (d) => onUpdate({ departments: departments.filter((x) => x !== d) });

  const addTeam = () => {
    const t = newTeam.trim();
    if (!t) return;
    if (teams.includes(t)) {
      showToast('Team already exists', 'error');
      return;
    }
    onUpdate({ teams: [...teams, t] });
    setNewTeam('');
  };

  const removeTeam = (t) => onUpdate({ teams: teams.filter((x) => x !== t) });

  return (
    <div className="space-y-4">
      {/* Routing Rules */}
      <div className="card !p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader icon={Route} title="Call Routing Rules" subtitle="If-then logic for incoming calls" />
          <button
            onClick={addRule}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-3.5 py-2 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add Rule
          </button>
        </div>

        {rules.length === 0 ? (
          <p className="py-6 text-center text-xs text-brand-ink/40">No rules yet. Click "Add Rule" to start.</p>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="grid grid-cols-1 gap-2 rounded-xl border border-brand-lilac bg-white p-3 sm:grid-cols-12 sm:items-center">
                <div className="sm:col-span-4">
                  <input
                    value={r.name}
                    onChange={(e) => updateRule(r.id, { name: e.target.value })}
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs font-semibold outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    value={r.condition}
                    onChange={(e) => updateRule(r.id, { condition: e.target.value })}
                    placeholder="Condition (e.g. 9 AM – 7 PM)"
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                  />
                </div>
                <div className="sm:col-span-4">
                  <select
                    value={r.action}
                    onChange={(e) => updateRule(r.id, { action: e.target.value })}
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                  >
                    <option>Route to available agent</option>
                    <option>Route to department</option>
                    <option>Route to team</option>
                    <option>Route to queue</option>
                    <option>Play voicemail message</option>
                    <option>Forward to manager line</option>
                    <option>Queue and callback</option>
                    <option>End call</option>
                  </select>
                </div>
                <div className="flex justify-end sm:col-span-1">
                  <button
                    onClick={() => removeRule(r.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Routing Strategy */}
      <div className="card !p-5 space-y-4">
        <SectionHeader icon={UserIcon} title="Agent Routing Strategy" subtitle="How calls are distributed among available agents" />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {ROUTING_STRATEGIES.map((strategy) => {
            const active = config.agentRouting === strategy;
            return (
              <button
                key={strategy}
                onClick={() => onUpdate({ agentRouting: strategy })}
                className={`rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-all ${
                  active
                    ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:border-brand-magenta/40 hover:bg-brand-magenta/5'
                }`}
              >
                {strategy}
              </button>
            );
          })}
        </div>
      </div>

      {/* Departments */}
      <div className="card !p-5 space-y-4">
        <SectionHeader icon={Building2} title="Departments" subtitle="Route calls to different business units" />
        {departments.length === 0 ? (
          <p className="text-xs text-brand-ink/40">No departments yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <span key={d} className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink">
                <Building2 size={11} className="text-brand-magenta" />
                {d}
                <button onClick={() => removeDept(d)} className="rounded-full p-0.5 text-rose-500 hover:bg-rose-50">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDept()}
            placeholder="Add department (e.g. Sales)"
            className="flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <button
            onClick={addDept}
            disabled={!newDept.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3.5 py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Teams */}
      <div className="card !p-5 space-y-4">
        <SectionHeader icon={Users} title="Teams / Groups" subtitle="Route calls to specific teams" />
        {teams.length === 0 ? (
          <p className="text-xs text-brand-ink/40">No teams yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teams.map((t) => (
              <span key={t} className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink">
                <Users size={11} className="text-brand-purple" />
                {t}
                <button onClick={() => removeTeam(t)} className="rounded-full p-0.5 text-rose-500 hover:bg-rose-50">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newTeam}
            onChange={(e) => setNewTeam(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTeam()}
            placeholder="Add team (e.g. Mumbai Team)"
            className="flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <button
            onClick={addTeam}
            disabled={!newTeam.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3.5 py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5 — HOURS
   ═══════════════════════════════════════════════════════════════ */
function HoursTab({ config, onUpdate, showToast }) {
  const schedule = config.businessHoursSchedule || {};

  const updateDay = (day, updates) => {
    onUpdate({
      businessHoursSchedule: {
        ...schedule,
        [day]: { ...schedule[day], ...updates },
      },
    });
  };

  const copyToWeekdays = (sourceDay) => {
    const src = schedule[sourceDay];
    if (!src) return;
    const next = { ...schedule };
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach((d) => {
      next[d] = { ...src };
    });
    onUpdate({ businessHoursSchedule: next });
    showToast(`Copied ${sourceDay} hours to weekdays`);
  };

  const copyToAllDays = (sourceDay) => {
    const src = schedule[sourceDay];
    if (!src) return;
    const next = {};
    DAYS.forEach((d) => { next[d] = { ...src }; });
    onUpdate({ businessHoursSchedule: next });
    showToast(`Copied ${sourceDay} hours to all days`);
  };

  return (
    <div className="card !p-5 space-y-4">
      <SectionHeader
        icon={Clock}
        title="Business Hours"
        subtitle="Calls outside these hours follow the After-Hours routing"
      />

      <div className="space-y-2">
        {DAYS.map((day) => {
          const d = schedule[day] || { open: false, from: '', to: '' };
          return (
            <div key={day} className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
              <span className="flex w-28 items-center gap-2 text-sm font-semibold text-brand-ink">
                {day === 'Saturday' || day === 'Sunday' ? (
                  <Moon size={12} className="text-brand-ink/40" />
                ) : (
                  <Sun size={12} className="text-amber-500" />
                )}
                {day}
              </span>

              <button
                onClick={() => updateDay(day, { open: !d.open })}
                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${d.open ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${d.open ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>

              {d.open ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={d.from}
                    onChange={(e) => updateDay(day, { from: e.target.value })}
                    className="rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                  />
                  <span className="text-xs text-brand-ink/50">to</span>
                  <input
                    type="time"
                    value={d.to}
                    onChange={(e) => updateDay(day, { to: e.target.value })}
                    className="rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
                  />
                </div>
              ) : (
                <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-500">Closed</span>
              )}

              {d.open && (
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => copyToWeekdays(day)}
                    className="rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[10px] font-semibold text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:text-brand-magenta"
                    title="Copy to all weekdays"
                  >
                    → Weekdays
                  </button>
                  <button
                    onClick={() => copyToAllDays(day)}
                    className="rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[10px] font-semibold text-brand-ink/60 transition-all hover:border-brand-magenta/40 hover:text-brand-magenta"
                    title="Copy to all days"
                  >
                    → All
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 6 — HOLIDAYS
   ═══════════════════════════════════════════════════════════════ */
function HolidaysTab({ config, onUpdate, showToast }) {
  const holidays = config.holidays || [];
  const [form, setForm] = useState({ name: '', date: '', recurring: true });

  const handleAdd = () => {
    const name = form.name.trim();
    if (!name || !form.date) return;

    /* Reject past dates only if not recurring */
    if (!form.recurring) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(form.date) < today) {
        showToast('Please choose a future date', 'error');
        return;
      }
    }

    onUpdate({
      holidays: [
        ...holidays,
        { id: uid('h'), name, date: form.date, recurring: form.recurring },
      ].sort((a, b) => a.date.localeCompare(b.date)),
    });
    setForm({ name: '', date: '', recurring: true });
    showToast('Holiday added');
  };

  const updateHoliday = (id, updates) => {
    onUpdate({ holidays: holidays.map((h) => (h.id === id ? { ...h, ...updates } : h)) });
  };

  const removeHoliday = (id) => onUpdate({ holidays: holidays.filter((h) => h.id !== id) });

  const formatDate = (d) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <SectionHeader icon={Flag} title="Holiday Calendar" subtitle="Calls on these dates follow Holiday routing" />

        {/* Add row */}
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-dashed border-brand-magenta/40 bg-brand-magenta/[0.03] p-3 sm:grid-cols-12 sm:items-center">
          <div className="sm:col-span-5">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Holiday name (e.g. Diwali)"
              className="w-full rounded-lg border border-brand-lilac bg-white px-3 py-2 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>
          <div className="sm:col-span-3">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-lg border border-brand-lilac bg-white px-3 py-2 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink/70">
              <input
                type="checkbox"
                checked={form.recurring}
                onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
              />
              Repeats yearly
            </label>
          </div>
          <div className="sm:col-span-1">
            <button
              onClick={handleAdd}
              disabled={!form.name.trim() || !form.date}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110 disabled:opacity-60"
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>

        {holidays.length === 0 ? (
          <p className="py-6 text-center text-xs text-brand-ink/40">No holidays yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {holidays.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
                  <Flag size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <input
                    value={h.name}
                    onChange={(e) => updateHoliday(h.id, { name: e.target.value })}
                    className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-brand-ink outline-none"
                  />
                  <p className="mt-0.5 text-[11px] text-brand-ink/60">{formatDate(h.date)}</p>
                </div>
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-[10px] font-semibold text-brand-ink/70">
                  <input
                    type="checkbox"
                    checked={h.recurring}
                    onChange={(e) => updateHoliday(h.id, { recurring: e.target.checked })}
                    className="h-3 w-3 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
                  />
                  Yearly
                </label>
                <button
                  onClick={() => removeHoliday(h.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 7 — QUEUE
   ═══════════════════════════════════════════════════════════════ */
function QueueTab({ config, onUpdate, showToast }) {
  const queue = config.queue || {};

  const setMaxWait = (val) => {
    const n = Number(val);
    if (isNaN(n)) return;
    /* Clamp 1–60 */
    const clamped = Math.max(1, Math.min(60, n));
    onUpdate({ queue: { ...queue, maxWait: clamped } });
  };

  return (
    <div className="card !p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader icon={Waves} title="Call Queue" subtitle="When all agents are busy, callers wait in a queue" />
        <button
          onClick={() => onUpdate({ queue: { ...queue, enabled: !queue.enabled } })}
          className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${queue.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${queue.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {queue.enabled ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                <Timer size={11} /> Max Wait Time (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={queue.maxWait ?? 5}
                onChange={(e) => setMaxWait(e.target.value)}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
              <p className="mt-1 text-[10px] text-brand-ink/50">Between 1 and 60 minutes</p>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                <Music size={11} /> Hold Music
              </label>
              <select
                value={queue.music || 'Default Hold Music'}
                onChange={(e) => onUpdate({ queue: { ...queue, music: e.target.value } })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              >
                <option>Default Hold Music</option>
                <option>Soft Instrumental</option>
                <option>Custom (upload)</option>
                <option>Silent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <PhoneForwarded size={11} /> Overflow Action (after max wait)
            </label>
            <select
              value={queue.overflow || 'Voicemail'}
              onChange={(e) => onUpdate({ queue: { ...queue, overflow: e.target.value } })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            >
              <option>Voicemail</option>
              <option>Forward to Manager</option>
              <option>End Call</option>
              <option>Continue Queue</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <MessageSquare size={11} /> Hold Message
            </label>
            <textarea
              value={queue.welcomeHold || ''}
              onChange={(e) => onUpdate({ queue: { ...queue, welcomeHold: e.target.value } })}
              rows={2}
              placeholder="Played while the caller is waiting in the queue…"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            <p className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={12} /> Callers will hear this while waiting
            </p>
            <p className="mt-1 italic">
              "{queue.welcomeHold || 'All our agents are currently busy. Please hold. Your call will be answered in the order it was received.'}"
            </p>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <p className="flex items-center gap-1.5 font-semibold">
            <AlertCircle size={12} /> Queue is disabled
          </p>
          <p className="mt-1">
            When all agents are busy, calls will be sent directly to the After-Hours / Voicemail flow instead of queuing.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 8 — AFTER-HOURS
   ═══════════════════════════════════════════════════════════════ */
function AfterHoursTab({ config, onUpdate, showToast }) {
  const afterHours = config.afterHours || {};
  const set = (updates) => onUpdate({ afterHours: { ...afterHours, ...updates } });

  const handleForwardNumberBlur = () => {
    if (afterHours.forwardNumber && !isValidPhone(afterHours.forwardNumber)) {
      showToast('Forward number looks invalid', 'error');
    }
  };

  return (
    <div className="card !p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader icon={Moon} title="After-Hours Message" subtitle="Played when calling outside business hours" />
        <button
          onClick={() => set({ enabled: !afterHours.enabled })}
          className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${afterHours.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${afterHours.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {afterHours.enabled ? (
        <>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <Volume2 size={11} /> After-Hours Message
            </label>
            <textarea
              value={afterHours.message || ''}
              onChange={(e) => set({ message: e.target.value })}
              rows={3}
              placeholder="Thank you for calling. Our office is currently closed…"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
            <p className="mt-1 text-[10px] text-brand-ink/50">
              Keep it friendly and brief. Callers will hear this before the next step.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ToggleRow
              label="Forward to Voicemail"
              desc="Let callers leave a message after the after-hours greeting."
              value={afterHours.forwardToVoicemail}
              onChange={(v) => set({ forwardToVoicemail: v })}
              icon={Voicemail}
            />
            <ToggleRow
              label="Allow Callback Request"
              desc="Caller can request a callback instead of leaving voicemail."
              value={afterHours.allowCallback}
              onChange={(v) => set({ allowCallback: v })}
              icon={Repeat}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <PhoneForwarded size={11} /> Alternative Forward Number (optional)
            </label>
            <input
              value={afterHours.forwardNumber || ''}
              onChange={(e) => set({ forwardNumber: e.target.value })}
              onBlur={handleForwardNumberBlur}
              placeholder="+91 98765 43210"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:ring-2 ${
                afterHours.forwardNumber && !isValidPhone(afterHours.forwardNumber)
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/15'
                  : 'border-brand-lilac focus:border-brand-magenta focus:ring-brand-magenta/15'
              }`}
            />
            <p className="mt-1 text-[10px] text-brand-ink/50">
              If set, calls will forward here instead of going to voicemail.
            </p>
          </div>

          <div className="rounded-xl border border-brand-magenta/30 bg-gradient-to-br from-brand-magenta/[0.06] to-brand-purple/[0.04] p-4">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
              <PlayCircle size={12} /> Preview
            </p>
            <p className="mt-2 text-sm italic text-brand-ink/80">
              "{afterHours.message || 'Thank you for calling.'}"
            </p>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <p className="flex items-center gap-1.5 font-semibold">
            <AlertCircle size={12} /> After-Hours routing disabled
          </p>
          <p className="mt-1">
            Calls received outside business hours will ring agents' phones until answered or missed.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 9 — VOICEMAIL
   ═══════════════════════════════════════════════════════════════ */
function VoicemailTab({ config, onUpdate, showToast }) {
  const vm = config.voicemail || {};
  const set = (updates) => onUpdate({ voicemail: { ...vm, ...updates } });

  const setMaxDuration = (val) => {
    const n = Number(val);
    if (isNaN(n)) return;
    set({ maxDuration: Math.max(10, Math.min(600, n)) });
  };

  const handleEmailBlur = () => {
    if (vm.notifyEmail && vm.notificationEmail && !isValidEmail(vm.notificationEmail)) {
      showToast('Please enter a valid email address', 'error');
    }
  };

  return (
    <div className="card !p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader icon={Voicemail} title="Voicemail Configuration" subtitle="Greeting, duration, and notifications" />
        <button
          onClick={() => set({ enabled: !vm.enabled })}
          className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${vm.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${vm.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {vm.enabled ? (
        <>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <Volume2 size={11} /> Voicemail Greeting
            </label>
            <textarea
              value={vm.greeting || ''}
              onChange={(e) => set({ greeting: e.target.value })}
              rows={3}
              placeholder="Please leave your name, number, and a brief message after the beep…"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                <Timer size={11} /> Max Duration (seconds)
              </label>
              <input
                type="number"
                min={10}
                max={600}
                value={vm.maxDuration || 120}
                onChange={(e) => setMaxDuration(e.target.value)}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
              />
              <p className="mt-1 text-[10px] text-brand-ink/50">
                Between 10 and 600 seconds. Recommended: 120s
              </p>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                <HashIcon size={11} /> Press # to End Early
              </label>
              <div className="flex h-[42px] items-center rounded-xl border border-brand-lilac bg-white px-3.5">
                <span className="text-xs text-brand-ink/70">
                  Enabled — callers can press <strong className="text-brand-magenta">#</strong> to finish
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ToggleRow
              label="Auto-Transcribe"
              desc="Convert voicemail messages to text automatically."
              value={vm.transcribe}
              onChange={(v) => set({ transcribe: v })}
              icon={Sparkles}
            />
            <ToggleRow
              label="Email Notifications"
              desc="Send new voicemail alerts to the admin email."
              value={vm.notifyEmail}
              onChange={(v) => set({ notifyEmail: v })}
              icon={MessageSquare}
            />
          </div>

          {vm.notifyEmail && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                <MessageSquare size={11} /> Notification Email
              </label>
              <input
                type="email"
                value={vm.notificationEmail || ''}
                onChange={(e) => set({ notificationEmail: e.target.value })}
                onBlur={handleEmailBlur}
                placeholder="admin@example.com"
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 ${
                  vm.notificationEmail && !isValidEmail(vm.notificationEmail)
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/15'
                    : 'border-brand-lilac focus:border-brand-magenta focus:ring-brand-magenta/15'
                }`}
              />
              {vm.notificationEmail && !isValidEmail(vm.notificationEmail) && (
                <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-rose-500">
                  <AlertCircle size={10} /> Please enter a valid email
                </p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-brand-magenta/30 bg-gradient-to-br from-brand-magenta/[0.06] to-brand-purple/[0.04] p-4">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-brand-magenta">
              <PlayCircle size={12} /> Preview
            </p>
            <p className="mt-2 text-sm italic text-brand-ink/80">
              "{vm.greeting || 'Please leave your message after the beep.'}"
            </p>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <p className="flex items-center gap-1.5 font-semibold">
            <AlertCircle size={12} /> Voicemail disabled
          </p>
          <p className="mt-1">
            Callers will not be able to leave messages. Missed calls will still trigger SMS notifications.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 10 — MISSED CALL HANDLING
   ═══════════════════════════════════════════════════════════════ */
function MissedCallTab({ config, onUpdate, showToast }) {
  const mc = config.missedCallHandling || {};
  const set = (updates) => onUpdate({ missedCallHandling: { ...mc, ...updates } });

  /* Count SMS characters with placeholder expansion estimate */
  const rawLength = (mc.smsTemplate || '').length;
  const placeholderCount = (mc.smsTemplate || '').match(/\{name\}/g)?.length || 0;
  const estimatedLength = rawLength + placeholderCount * 8; // "John Doe" ≈ 8 chars
  const isOverLimit = estimatedLength > 160;

  return (
    <div className="card !p-5 space-y-4">
      <SectionHeader
        icon={PhoneMissed}
        title="Missed Call Handling"
        subtitle="Automate follow-ups when a caller hangs up without connecting"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ToggleRow
          label="Auto Create Callback"
          desc="Automatically schedule a callback for the next available slot."
          value={mc.autoCallback}
          onChange={(v) => set({ autoCallback: v })}
          icon={Repeat}
        />
        <ToggleRow
          label="Assign to Agent"
          desc="Auto-assign the missed call to the next available agent."
          value={mc.assignToAgent}
          onChange={(v) => set({ assignToAgent: v })}
          icon={UserCheck}
        />
        <ToggleRow
          label="Create Follow-Up"
          desc="Add a follow-up task in the Follow-Ups module."
          value={mc.createFollowUp}
          onChange={(v) => set({ createFollowUp: v })}
          icon={Calendar}
        />
        <ToggleRow
          label="Send SMS to Caller"
          desc="Send a friendly message to the caller so they know we tried."
          value={mc.smsToCaller}
          onChange={(v) => set({ smsToCaller: v })}
          icon={MessageSquare}
        />
      </div>

      {mc.smsToCaller && (
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <MessageSquare size={11} /> SMS Template
          </label>
          <textarea
            value={mc.smsTemplate || ''}
            onChange={(e) => set({ smsTemplate: e.target.value })}
            rows={2}
            placeholder="Hi! Sorry we missed your call. We will get back to you shortly."
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 ${
              isOverLimit
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/15'
                : 'border-brand-lilac focus:border-brand-magenta focus:ring-brand-magenta/15'
            }`}
          />
          <p className="mt-1 text-[10px] text-brand-ink/50">
            Use <strong className="text-brand-magenta">{`{name}`}</strong> to insert the caller's name.
          </p>
          <p className={`mt-1 font-mono text-[10px] ${isOverLimit ? 'font-bold text-rose-500' : 'text-brand-ink/40'}`}>
            {estimatedLength} / 160 chars {isOverLimit && '— will be split into multiple SMS'}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <CheckCircle2 size={12} /> Active Automations
        </p>
        <ul className="mt-2 space-y-1 text-xs text-emerald-700">
          {mc.autoCallback && <li>✓ Callback scheduled within 5 minutes of missed call</li>}
          {mc.assignToAgent && <li>✓ Assigned to next available agent automatically</li>}
          {mc.createFollowUp && <li>✓ Follow-up task created in Follow-Ups module</li>}
          {mc.smsToCaller && <li>✓ SMS sent to caller within 1 minute</li>}
          {!mc.autoCallback && !mc.assignToAgent && !mc.createFollowUp && !mc.smsToCaller && (
            <li className="italic opacity-70">No automations active — calls will just be logged.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-sm font-bold text-brand-ink">{title}</h3>
        {subtitle && <p className="text-[11px] text-brand-ink/50">{subtitle}</p>}
      </div>
    </div>
  );
}

function SelectField({ label, icon: Icon, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
        {Icon && <Icon size={11} />} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
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
    <div className="flex items-start justify-between gap-3 rounded-xl border border-brand-lilac bg-white px-4 py-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-magenta">
            <Icon size={15} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-ink">{label}</p>
          {desc && <p className="mt-0.5 text-[11px] text-brand-ink/50">{desc}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${value ? 'bg-emerald-500' : 'bg-gray-300'}`}
      >
        <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
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

function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
        type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      }`}>
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}