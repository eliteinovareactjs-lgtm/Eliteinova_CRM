// src/pages/superadmin/IVR.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  PhoneCall, Clock, Mic, Voicemail, Save, X, Plus, Trash2, Copy, Check,
  ChevronDown, Hash, Building2, User as UserIcon, Users, Route, Repeat,
  Waves, Headphones, AlertCircle, CheckCircle2, Settings, Volume2, Timer,
  PhoneIncoming, PhoneOutgoing, Calendar, Moon, Sun, Globe, Layers,
  PlayCircle, PauseCircle, Music, ListFilter, PhoneForwarded, DoorOpen,
  Flag, PartyPopper, Edit3, RotateCcw, Info, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IVR_CONFIGS, PROJECTS, AGENTS, DEPARTMENTS } from '../../data/mockData';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_MENU = [
  { key: '1', action: 'Department', target: 'Sales', label: 'Sales' },
  { key: '2', action: 'Department', target: 'Support', label: 'Support' },
  { key: '3', action: 'Agent', target: 'Ravi Kumar', label: 'Direct Agent' },
  { key: '4', action: 'Queue', target: 'General Queue', label: 'Wait in queue' },
  { key: '0', action: 'Voicemail', target: '', label: 'Leave a message' },
];

const DEFAULT_BUSINESS_HOURS = {
  Monday: { open: true, from: '09:00', to: '18:00' },
  Tuesday: { open: true, from: '09:00', to: '18:00' },
  Wednesday: { open: true, from: '09:00', to: '18:00' },
  Thursday: { open: true, from: '09:00', to: '18:00' },
  Friday: { open: true, from: '09:00', to: '18:00' },
  Saturday: { open: true, from: '10:00', to: '14:00' },
  Sunday: { open: false, from: '', to: '' },
};

const DEFAULT_HOLIDAYS = [
  { id: 1, name: 'New Year', date: '2025-01-01', routing: 'Voicemail' },
  { id: 2, name: 'Diwali', date: '2025-10-20', routing: 'Voicemail' },
  { id: 3, name: 'Christmas', date: '2025-12-25', routing: 'Forward to Manager' },
];

const TABS = [
  { key: 'numbers', label: 'IVR Numbers', icon: PhoneCall },
  { key: 'config', label: 'Configuration', icon: Settings },
  { key: 'menu', label: 'Menu & Keypad', icon: Hash },
  { key: 'routing', label: 'Call Routing', icon: Route },
  { key: 'departments', label: 'Departments', icon: Building2 },
  { key: 'hours', label: 'Business Hours', icon: Clock },
  { key: 'queue', label: 'Call Queue', icon: Waves },
  { key: 'voicemail', label: 'Voicemail', icon: Voicemail },
  { key: 'afterhours', label: 'After-Hours', icon: Moon },
  { key: 'holidays', label: 'Holiday Routing', icon: PartyPopper },
  { key: 'recording', label: 'Recording', icon: Mic },
];

export default function IVR() {
  const { role, activeWebsiteId } = useAuth();
  const isSuperAdmin = role === 'superadmin';

  /* ========== SELECTED PROJECT ========== */
  const [selectedProjectId, setSelectedProjectId] = useState(
    activeWebsiteId || IVR_CONFIGS[0]?.projectId
  );
  const [projectOpen, setProjectOpen] = useState(false);
  const [tab, setTab] = useState('config');
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  /* ========== LOAD + EDIT STATE ========== */
  // Build a local editable version of every IVR config
  const [configs, setConfigs] = useState(() =>
    IVR_CONFIGS.reduce((acc, c) => {
      acc[c.projectId] = {
        ...c,
        menuOptionsDetailed: c.menuOptionsDetailed || DEFAULT_MENU,
        businessHoursSchedule: c.businessHoursSchedule || DEFAULT_BUSINESS_HOURS,
        departments: c.departments || ['Sales', 'Support', 'Billing'],
        agentRouting: c.agentRouting || 'Round Robin',
        queue: c.queue || {
          enabled: true,
          maxWait: 5,
          music: 'Default Hold Music',
          overflow: 'Voicemail',
        },
        voicemailConfig: c.voicemailConfig || {
          enabled: c.voicemail ?? true,
          greeting: 'Please leave your message after the beep.',
          maxLength: 120,
        },
        afterHours: c.afterHours || {
          message: 'Our office is currently closed. Please call back during business hours.',
          target: 'Voicemail',
        },
        holidays: c.holidays || DEFAULT_HOLIDAYS,
        recordingConfig: c.recordingConfig || {
          enabled: c.recording ?? true,
          announce: true,
          retention: 90,
        },
        welcomeMessage: c.welcomeMessage || 'Welcome to our CRM. Your call is important to us.',
      };
      return acc;
    }, {})
  );

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const projectName = (id) =>
    PROJECTS.find((p) => p.id === id)?.name || id;

  const currentConfig = configs[selectedProjectId];

  const updateConfig = (updates) => {
    setConfigs((prev) => ({
      ...prev,
      [selectedProjectId]: { ...prev[selectedProjectId], ...updates },
    }));
  };

  const handleSave = () => {
    showToast(`IVR configuration saved for ${projectName(selectedProjectId)}`);
  };

  const handleReset = () => {
    const original = IVR_CONFIGS.find((c) => c.projectId === selectedProjectId);
    if (!original) return;
    setConfigs((prev) => ({
      ...prev,
      [selectedProjectId]: {
        ...original,
        menuOptionsDetailed: DEFAULT_MENU,
        businessHoursSchedule: DEFAULT_BUSINESS_HOURS,
        departments: ['Sales', 'Support', 'Billing'],
        agentRouting: 'Round Robin',
        queue: { enabled: true, maxWait: 5, music: 'Default Hold Music', overflow: 'Voicemail' },
        voicemailConfig: { enabled: true, greeting: 'Please leave your message after the beep.', maxLength: 120 },
        afterHours: { message: 'Our office is currently closed. Please call back during business hours.', target: 'Voicemail' },
        holidays: DEFAULT_HOLIDAYS,
        recordingConfig: { enabled: true, announce: true, retention: 90 },
      },
    }));
    showToast('Changes reverted', 'error');
  };

  if (!currentConfig) {
    return (
      <div className="card py-16 text-center text-sm text-brand-ink/50">
        No IVR configuration available.
      </div>
    );
  }

  /* ========== SUMMARY STATS ========== */
  const summary = useMemo(() => {
    const totalConfigs = Object.keys(configs).length;
    const withVoicemail = Object.values(configs).filter(
      (c) => c.voicemailConfig?.enabled
    ).length;
    const withRecording = Object.values(configs).filter(
      (c) => c.recordingConfig?.enabled
    ).length;
    const withQueue = Object.values(configs).filter(
      (c) => c.queue?.enabled
    ).length;
    return { totalConfigs, withVoicemail, withRecording, withQueue };
  }, [configs]);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            IVR Management
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <PhoneCall size={13} className="text-brand-purple" />
            Configure inbound call flows, menus, and routing per project.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </div>

      {/* ================= SUMMARY STAT CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AnimatedStatCard
          label="Total IVRs"
          value={summary.totalConfigs}
          sub="Configured projects"
          icon={PhoneCall}
          color="purple"
        />
        <AnimatedStatCard
          label="With Voicemail"
          value={summary.withVoicemail}
          sub="Voicemail enabled"
          icon={Voicemail}
          color="emerald"
        />
        <AnimatedStatCard
          label="With Recording"
          value={summary.withRecording}
          sub="Call recording on"
          icon={Mic}
          color="amber"
        />
        <AnimatedStatCard
          label="With Queue"
          value={summary.withQueue}
          sub="Call queue active"
          icon={Waves}
          color="rose"
        />
      </div>

      {/* ================= PROJECT SELECTOR + TABS ================= */}
      <div className="card !p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setProjectOpen((s) => !s)}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-lilac/40"
            >
              <Building2 size={14} className="text-brand-purple" />
              Project:{' '}
              <span className="text-brand-purple">
                {projectName(selectedProjectId)}
              </span>
              <ChevronDown size={14} className="text-brand-ink/40" />
            </button>
            {projectOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProjectOpen(false)}
                />
                <div className="absolute left-0 top-full z-20 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-brand-lilac bg-white p-1 shadow-panel">
                  {IVR_CONFIGS.map((c) => (
                    <button
                      key={c.projectId}
                      onClick={() => {
                        setSelectedProjectId(c.projectId);
                        setProjectOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selectedProjectId === c.projectId
                          ? 'bg-brand-lilac font-semibold text-brand-purple'
                          : 'text-brand-ink/70 hover:bg-brand-lilac/40'
                      }`}
                    >
                      {projectName(c.projectId)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2">
            <PhoneCall size={14} className="text-brand-purple" />
            <span className="font-mono text-sm font-semibold text-brand-ink">
              {currentConfig.ivrNumber}
            </span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(currentConfig.ivrNumber);
                setCopiedId('ivr');
                setTimeout(() => setCopiedId(null), 1500);
              }}
              className="rounded-lg p-1 text-brand-ink/40 hover:bg-brand-lilac"
            >
              {copiedId === 'ivr' ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                  active
                    ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple shadow-sm'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {tab === 'numbers' && (
        <NumbersTab
          config={currentConfig}
          projectName={projectName}
          onUpdate={updateConfig}
          onCopy={(text) => {
            navigator.clipboard?.writeText(text);
            setCopiedId(text);
            setTimeout(() => setCopiedId(null), 1500);
          }}
          copiedId={copiedId}
        />
      )}

      {tab === 'config' && (
        <ConfigTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {tab === 'menu' && (
        <MenuTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {tab === 'routing' && (
        <RoutingTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {tab === 'departments' && (
        <DepartmentsTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {tab === 'hours' && (
        <BusinessHoursTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {tab === 'queue' && (
        <QueueTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {tab === 'voicemail' && (
        <VoicemailTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {tab === 'afterhours' && (
        <AfterHoursTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {tab === 'holidays' && (
        <HolidaysTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {tab === 'recording' && (
        <RecordingTab
          config={currentConfig}
          onUpdate={updateConfig}
        />
      )}

      {/* ================= TOAST ================= */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= NUMBERS TAB ================= */
function NumbersTab({ config, projectName, onUpdate, onCopy, copiedId }) {
  const numbers = config.numbers || [
    { id: 'PN-001', number: config.ivrNumber, type: 'Inbound', provider: 'Twilio', status: 'Active' },
    { id: 'PN-002', number: '+91 44 4567 8910', type: 'Outbound', provider: 'Exotel', status: 'Active' },
  ];

  return (
    <div className="space-y-4">
      <div className="card !p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <PhoneCall size={14} className="text-brand-purple" />
            IVR Phone Numbers
          </h3>
          <span className="text-xs text-brand-ink/50">{numbers.length} numbers</span>
        </div>
        <div className="space-y-2">
          {numbers.map((n) => (
            <div
              key={n.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-brand-purple">
                {n.type === 'Inbound' ? (
                  <PhoneIncoming size={14} />
                ) : (
                  <PhoneOutgoing size={14} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-semibold text-brand-ink">
                  {n.number}
                </p>
                <p className="truncate text-[10px] text-brand-ink/50">
                  {n.type} · {n.provider}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  n.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {n.status}
              </span>
              <button
                onClick={() => onCopy(n.number)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-lilac text-brand-ink/50 hover:bg-brand-lilac/40"
              >
                {copiedId === n.number ? (
                  <Check size={12} className="text-emerald-500" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= CONFIG TAB ================= */
function ConfigTab({ config, onUpdate }) {
  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Settings size={14} className="text-brand-purple" />
          General IVR Configuration
        </h3>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Volume2 size={11} /> Welcome Message
          </label>
          <input
            value={config.welcomeMessage}
            onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
            placeholder="Welcome to our CRM..."
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
          <p className="mt-1 text-[10px] text-brand-ink/40">
            Played before the menu options. Keep it under 10 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <Globe size={11} /> Default Language
            </label>
            <select
              value={config.language || 'English'}
              onChange={(e) => onUpdate({ language: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Telugu</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <Volume2 size={11} /> Voice
            </label>
            <select
              value={config.voice || 'Female'}
              onChange={(e) => onUpdate({ voice: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              <option>Female</option>
              <option>Male</option>
              <option>Neutral</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple">
            <Info size={12} /> Preview: "{config.welcomeMessage}"
          </p>
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-purple shadow-sm hover:bg-brand-lilac/40">
            <PlayCircle size={12} /> Play Preview
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MENU TAB ================= */
function MenuTab({ config, onUpdate }) {
  const menu = config.menuOptionsDetailed || [];

  const addOption = () => {
    const usedKeys = menu.map((m) => m.key);
    const nextKey =
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].find(
        (k) => !usedKeys.includes(k)
      ) || String(menu.length + 1);
    onUpdate({
      menuOptionsDetailed: [
        ...menu,
        { key: nextKey, action: 'Department', target: 'Sales', label: 'New Option' },
      ],
    });
  };

  const updateOption = (idx, updates) => {
    const next = [...menu];
    next[idx] = { ...next[idx], ...updates };
    onUpdate({ menuOptionsDetailed: next });
  };

  const removeOption = (idx) => {
    onUpdate({ menuOptionsDetailed: menu.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <Hash size={14} className="text-brand-purple" />
            IVR Menu & Keypad Options
          </h3>
          <button
            onClick={addOption}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-magenta px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add Key
          </button>
        </div>

        {menu.length === 0 ? (
          <p className="py-4 text-center text-xs text-brand-ink/40">
            No menu options. Click "Add Key" to add one.
          </p>
        ) : (
          <div className="space-y-2">
            {menu.map((opt, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-2 rounded-xl border border-brand-lilac bg-white p-3 sm:grid-cols-12 sm:items-center"
              >
                <div className="sm:col-span-1">
                  <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50 sm:hidden">
                    Key
                  </label>
                  <input
                    value={opt.key}
                    onChange={(e) =>
                      updateOption(idx, {
                        key: e.target.value.slice(0, 1),
                      })
                    }
                    maxLength={1}
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2 py-1.5 text-center font-mono text-sm font-bold outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50 sm:hidden">
                    Action
                  </label>
                  <select
                    value={opt.action}
                    onChange={(e) =>
                      updateOption(idx, { action: e.target.value })
                    }
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                  >
                    <option>Department</option>
                    <option>Agent</option>
                    <option>Queue</option>
                    <option>Voicemail</option>
                    <option>Repeat Menu</option>
                    <option>End Call</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50 sm:hidden">
                    Target
                  </label>
                  <input
                    value={opt.target}
                    onChange={(e) =>
                      updateOption(idx, { target: e.target.value })
                    }
                    placeholder="e.g. Sales"
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50 sm:hidden">
                    Label
                  </label>
                  <input
                    value={opt.label}
                    onChange={(e) =>
                      updateOption(idx, { label: e.target.value })
                    }
                    placeholder="e.g. Press 1 for Sales"
                    className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
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

      {/* Visual preview */}
      <div className="card !p-4">
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <PhoneCall size={14} className="text-brand-purple" />
          IVR Menu Preview
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {menu.map((opt) => (
            <div
              key={opt.key}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-brand-lilac bg-gradient-to-br from-brand-mist/60 to-brand-mist/30 p-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta font-mono text-lg font-bold text-white shadow-card">
                {opt.key}
              </span>
              <p className="line-clamp-2 text-center text-[10px] font-semibold text-brand-ink">
                {opt.label || opt.target || opt.action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= ROUTING TAB ================= */
function RoutingTab({ config, onUpdate }) {
  const rules = config.routingRules || [
    { id: 1, name: 'Business Hours Routing', condition: '9 AM – 6 PM', action: 'Route to available agent' },
    { id: 2, name: 'After-Hours Routing', condition: '6 PM – 9 AM', action: 'Play voicemail message' },
    { id: 3, name: 'Holiday Routing', condition: 'Public holidays', action: 'Forward to manager line' },
    { id: 4, name: 'Overflow Routing', condition: 'No agent available > 30s', action: 'Queue and callback' },
  ];

  const addRule = () => {
    const next = [
      ...rules,
      {
        id: Date.now(),
        name: 'New Routing Rule',
        condition: '',
        action: 'Route to available agent',
      },
    ];
    onUpdate({ routingRules: next });
  };

  const updateRule = (id, updates) => {
    onUpdate({
      routingRules: rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    });
  };

  const removeRule = (id) => {
    onUpdate({ routingRules: rules.filter((r) => r.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <Route size={14} className="text-brand-purple" />
            Call Routing Rules
          </h3>
          <button
            onClick={addRule}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-magenta px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add Rule
          </button>
        </div>

        <div className="space-y-2">
          {rules.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-1 gap-2 rounded-xl border border-brand-lilac bg-white p-3 sm:grid-cols-12 sm:items-center"
            >
              <div className="sm:col-span-4">
                <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50 sm:hidden">
                  Rule Name
                </label>
                <input
                  value={r.name}
                  onChange={(e) => updateRule(r.id, { name: e.target.value })}
                  className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50 sm:hidden">
                  When
                </label>
                <input
                  value={r.condition}
                  onChange={(e) =>
                    updateRule(r.id, { condition: e.target.value })
                  }
                  placeholder="Condition"
                  className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50 sm:hidden">
                  Then
                </label>
                <select
                  value={r.action}
                  onChange={(e) =>
                    updateRule(r.id, { action: e.target.value })
                  }
                  className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                >
                  <option>Route to available agent</option>
                  <option>Play voicemail message</option>
                  <option>Forward to manager line</option>
                  <option>Queue and callback</option>
                  <option>End call</option>
                </select>
              </div>
              <div className="sm:col-span-1 flex justify-end">
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
      </div>

      {/* Agent Routing Strategy */}
      <div className="card !p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <UserIcon size={14} className="text-brand-purple" />
          Agent Routing Strategy
        </h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {['Round Robin', 'Least Busy', 'Longest Idle', 'Skill-Based'].map(
            (strategy) => (
              <button
                key={strategy}
                onClick={() => onUpdate({ agentRouting: strategy })}
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                  config.agentRouting === strategy
                    ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                    : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                }`}
              >
                {strategy}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= DEPARTMENTS TAB ================= */
function DepartmentsTab({ config, onUpdate }) {
  const depts = config.departments || [];
  const [newDept, setNewDept] = useState('');

  const addDept = () => {
    if (!newDept.trim()) return;
    onUpdate({ departments: [...depts, newDept.trim()] });
    setNewDept('');
  };

  const removeDept = (name) => {
    onUpdate({ departments: depts.filter((d) => d !== name) });
  };

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Building2 size={14} className="text-brand-purple" />
          Departments
        </h3>
        <p className="text-xs text-brand-ink/50">
          Departments that can be targeted from IVR menu options.
        </p>

        <div className="flex items-center gap-2">
          <input
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDept()}
            placeholder="e.g. Sales, Support, Billing"
            className="flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
          <button
            onClick={addDept}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {depts.length === 0 ? (
            <p className="col-span-2 py-4 text-center text-xs text-brand-ink/40">
              No departments yet. Add one above.
            </p>
          ) : (
            depts.map((d) => (
              <div
                key={d}
                className="flex items-center justify-between rounded-xl border border-brand-lilac bg-white px-3 py-2.5"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                  <Building2 size={13} className="text-brand-purple" />
                  {d}
                </span>
                <button
                  onClick={() => removeDept(d)}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= BUSINESS HOURS TAB ================= */
function BusinessHoursTab({ config, onUpdate }) {
  const schedule = config.businessHoursSchedule || {};

  const updateDay = (day, updates) => {
    onUpdate({
      businessHoursSchedule: {
        ...schedule,
        [day]: { ...schedule[day], ...updates },
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Clock size={14} className="text-brand-purple" />
          Business Hours
        </h3>
        <p className="text-xs text-brand-ink/50">
          Calls outside these hours follow the After-Hours routing.
        </p>

        <div className="space-y-2">
          {DAYS.map((day) => {
            const d = schedule[day] || {
              open: false,
              from: '',
              to: '',
            };
            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
              >
                <span className="flex w-24 items-center gap-1.5 text-sm font-semibold text-brand-ink">
                  {day === 'Saturday' || day === 'Sunday' ? (
                    <Moon size={12} className="text-brand-ink/40" />
                  ) : (
                    <Sun size={12} className="text-amber-500" />
                  )}
                  {day}
                </span>

                <button
                  onClick={() => updateDay(day, { open: !d.open })}
                  className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                    d.open ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      d.open ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                {d.open ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={d.from}
                      onChange={(e) => updateDay(day, { from: e.target.value })}
                      className="rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                    />
                    <span className="text-xs text-brand-ink/50">to</span>
                    <input
                      type="time"
                      value={d.to}
                      onChange={(e) => updateDay(day, { to: e.target.value })}
                      className="rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-rose-500">
                    Closed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================= QUEUE TAB ================= */
function QueueTab({ config, onUpdate }) {
  const queue = config.queue || {};

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <Waves size={14} className="text-brand-purple" />
            Call Queue
          </h3>
          <button
            onClick={() => onUpdate({ queue: { ...queue, enabled: !queue.enabled } })}
            className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
              queue.enabled ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                queue.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {queue.enabled && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                  <Timer size={11} /> Max Wait Time (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  value={queue.maxWait || 5}
                  onChange={(e) =>
                    onUpdate({
                      queue: { ...queue, maxWait: Number(e.target.value) },
                    })
                  }
                  className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                  <Music size={11} /> Hold Music
                </label>
                <select
                  value={queue.music || 'Default Hold Music'}
                  onChange={(e) =>
                    onUpdate({ queue: { ...queue, music: e.target.value } })
                  }
                  className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
                <PhoneForwarded size={11} /> Overflow Action
              </label>
              <select
                value={queue.overflow || 'Voicemail'}
                onChange={(e) =>
                  onUpdate({ queue: { ...queue, overflow: e.target.value } })
                }
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              >
                <option>Voicemail</option>
                <option>Forward to Manager</option>
                <option>End Call</option>
                <option>Continue Queue</option>
              </select>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
              <p className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={12} /> Callers will hear the message below while waiting
              </p>
              <p className="mt-1 italic">
                "All our agents are currently busy. Please hold. Your call will be answered in the order it was received."
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= VOICEMAIL TAB ================= */
function VoicemailTab({ config, onUpdate }) {
  const vm = config.voicemailConfig || {};

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <Voicemail size={14} className="text-brand-purple" />
            Voicemail Fallback
          </h3>
          <button
            onClick={() =>
              onUpdate({
                voicemailConfig: { ...vm, enabled: !vm.enabled },
              })
            }
            className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
              vm.enabled ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                vm.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {vm.enabled && (
          <>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                <Volume2 size={11} /> Voicemail Greeting
              </label>
              <input
                value={vm.greeting || ''}
                onChange={(e) =>
                  onUpdate({
                    voicemailConfig: { ...vm, greeting: e.target.value },
                  })
                }
                placeholder="Please leave your message after the beep."
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
                <Timer size={11} /> Max Message Length (seconds)
              </label>
              <input
                type="number"
                min={10}
                value={vm.maxLength || 120}
                onChange={(e) =>
                  onUpdate({
                    voicemailConfig: {
                      ...vm,
                      maxLength: Number(e.target.value),
                    },
                  })
                }
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple">
                <Info size={12} /> Recording will play after: "{vm.greeting}"
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= AFTER-HOURS TAB ================= */
function AfterHoursTab({ config, onUpdate }) {
  const ah = config.afterHours || {};

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Moon size={14} className="text-brand-purple" />
          After-Hours Settings
        </h3>
        <p className="text-xs text-brand-ink/50">
          Applied to calls received outside the configured Business Hours.
        </p>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Volume2 size={11} /> After-Hours Message
          </label>
          <textarea
            value={ah.message || ''}
            onChange={(e) =>
              onUpdate({ afterHours: { ...ah, message: e.target.value } })
            }
            rows={3}
            placeholder="Our office is currently closed..."
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <PhoneForwarded size={11} /> Route To
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {['Voicemail', 'Forward to Manager', 'Night Team', 'End Call'].map(
              (target) => (
                <button
                  key={target}
                  onClick={() =>
                    onUpdate({ afterHours: { ...ah, target } })
                  }
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    ah.target === target
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {target}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HOLIDAYS TAB ================= */
function HolidaysTab({ config, onUpdate }) {
  const holidays = config.holidays || [];
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    routing: 'Voicemail',
  });

  const addHoliday = () => {
    if (!newHoliday.name.trim() || !newHoliday.date) return;
    onUpdate({
      holidays: [
        ...holidays,
        { ...newHoliday, id: Date.now(), name: newHoliday.name.trim() },
      ],
    });
    setNewHoliday({ name: '', date: '', routing: 'Voicemail' });
  };

  const removeHoliday = (id) => {
    onUpdate({ holidays: holidays.filter((h) => h.id !== id) });
  };

  const updateRouting = (id, routing) => {
    onUpdate({
      holidays: holidays.map((h) => (h.id === id ? { ...h, routing } : h)),
    });
  };

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <PartyPopper size={14} className="text-brand-purple" />
          Holiday Routing
        </h3>
        <p className="text-xs text-brand-ink/50">
          Special routing applied on specific dates.
        </p>

        {/* Add new */}
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-brand-lilac bg-white p-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-4">
            <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50">
              Holiday Name
            </label>
            <input
              value={newHoliday.name}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, name: e.target.value })
              }
              placeholder="e.g. Diwali"
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50">
              Date
            </label>
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, date: e.target.value })
              }
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1 block text-[10px] font-semibold text-brand-ink/50">
              Routing
            </label>
            <select
              value={newHoliday.routing}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, routing: e.target.value })
              }
              className="w-full rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              <option>Voicemail</option>
              <option>Forward to Manager</option>
              <option>End Call</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              onClick={addHoliday}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-magenta px-3 py-1.5 text-[11px] font-semibold text-white shadow-card hover:brightness-110"
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {holidays.length === 0 ? (
            <p className="py-4 text-center text-xs text-brand-ink/40">
              No holidays configured yet.
            </p>
          ) : (
            holidays.map((h) => (
              <div
                key={h.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <PartyPopper size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {h.name}
                  </p>
                  <p className="truncate text-[10px] text-brand-ink/50">
                    {h.date}
                  </p>
                </div>
                <select
                  value={h.routing}
                  onChange={(e) => updateRouting(h.id, e.target.value)}
                  className="rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                >
                  <option>Voicemail</option>
                  <option>Forward to Manager</option>
                  <option>End Call</option>
                </select>
                <button
                  onClick={() => removeHoliday(h.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= RECORDING TAB ================= */
function RecordingTab({ config, onUpdate }) {
  const rec = config.recordingConfig || {};

  return (
    <div className="space-y-4">
      <div className="card !p-4 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Mic size={14} className="text-brand-purple" />
          Call Recording
        </h3>

        <ToggleRow
          label="Enable call recording"
          sub="All inbound calls on this IVR will be recorded."
          enabled={!!rec.enabled}
          onChange={() => onUpdate({ recordingConfig: { ...rec, enabled: !rec.enabled } })}
        />

        <ToggleRow
          label="Announce recording to caller"
          sub="Plays a short beep or message before recording begins."
          enabled={!!rec.announce}
          onChange={() => onUpdate({ recordingConfig: { ...rec, announce: !rec.announce } })}
        />

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <Timer size={11} /> Retention (days)
          </label>
          <input
            type="number"
            min={7}
            value={rec.retention || 90}
            onChange={(e) =>
              onUpdate({
                recordingConfig: {
                  ...rec,
                  retention: Number(e.target.value),
                },
              })
            }
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
          <p className="mt-1 text-[10px] text-brand-ink/40">
            Recordings older than this will be automatically deleted.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          <p className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 size={12} /> Recordings are stored securely and accessible from the Call Details page
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE: ToggleRow ================= */
function ToggleRow({ label, sub, enabled, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-brand-lilac bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-ink">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-brand-ink/50">{sub}</p>}
      </div>
      <button
        onClick={onChange}
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          enabled ? 'bg-emerald-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
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
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
        >
          <Icon size={18} />
        </span>
        <p className={`mt-3 font-display text-3xl font-bold leading-tight ${t.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/70">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-brand-ink/40">{sub}</p>}
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