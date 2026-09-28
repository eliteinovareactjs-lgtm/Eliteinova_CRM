// src/pages/admin/ProjectSettings.jsx
import { useState } from 'react';
import {
  Building2, Globe, Clock, Bell, Phone, Shield, Save,
  AlertCircle, CheckCircle2, Info, Users, Layers, ListFilter,
  GitBranch, Database, MessageSquare, Upload, Palette,
  Mail, Calendar, Zap, Lock, Plus, Trash2,
  Settings as SettingsIcon, FileText, Smartphone,
  Hash, ArrowRight, GripVertical, Target, Globe2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'profile',       label: 'Project Profile',  icon: Building2 },
  { key: 'business',      label: 'Business Hours',   icon: Clock },
  { key: 'leads',         label: 'Lead Settings',    icon: Target },
  { key: 'status',        label: 'Status Settings',  icon: ListFilter },
  { key: 'category',      label: 'Categories',       icon: Layers },
  { key: 'source',        label: 'Sources',          icon: Globe2 },
  { key: 'custom',        label: 'Custom Fields',    icon: Hash },
  { key: 'workflow',      label: 'Workflow',         icon: GitBranch },
  { key: 'notifications', label: 'Notifications',    icon: Bell },
  { key: 'calling',       label: 'Calling',          icon: Phone },
  { key: 'communication', label: 'Communication',    icon: MessageSquare },
  { key: 'permissions',   label: 'Permissions',      icon: Shield },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const uid = () => Math.random().toString(36).slice(2, 9);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function ProjectSettings() {
  const { activeWebsite, activeWebsiteId } = useAuth();
  const [tab, setTab] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ========== PROFILE ========== */
  const [profile, setProfile] = useState({
    name: activeWebsite?.name || 'Eliteinova Matrimony',
    legalName: 'Eliteinova Matrimony Pvt. Ltd.',
    email: 'support@eliteinova.com',
    phone: '+91 9876543210',
    website: 'https://eliteinova.com',
    address: '123 Business Park, Mumbai, MH 400001',
    timezone: 'Asia/Kolkata (GMT+5:30)',
    currency: 'INR (₹)',
    language: 'English',
    logo: null,
  });

  /* ========== BUSINESS HOURS + HOLIDAYS ========== */
  const [hours, setHours] = useState(
    DAYS.map((d) => ({
      day: d,
      enabled: d !== 'Sunday',
      from: '09:00',
      to: '18:00',
    }))
  );

  const [holidays, setHolidays] = useState([
    { id: uid(), name: 'Diwali', date: '2026-11-08', recurring: true },
    { id: uid(), name: 'Holi', date: '2026-03-14', recurring: true },
    { id: uid(), name: 'Independence Day', date: '2026-08-15', recurring: true },
  ]);

  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', recurring: true });

  const addHoliday = () => {
    if (!newHoliday.name.trim() || !newHoliday.date) {
      showToast('Holiday name and date are required', 'error');
      return;
    }
    setHolidays((prev) => [...prev, { id: uid(), ...newHoliday }]);
    setNewHoliday({ name: '', date: '', recurring: true });
    showToast('Holiday added');
  };

  const removeHoliday = (id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    showToast('Holiday removed', 'error');
  };

  /* ========== LEAD SETTINGS ========== */
  const [leadSettings, setLeadSettings] = useState({
    requirePhone: true,
    requireEmail: false,
    autoAssign: true,
    autoFollowUpHours: 24,
    staleThresholdDays: 7,
    allowDuplicate: false,
    maxLeadsPerAgent: 50,
    defaultPriority: 'Medium',
  });

  /* ========== STATUS SETTINGS ========== */
  const [statuses, setStatuses] = useState([
    { id: 'fresh',      name: 'Fresh',      color: 'violet',  isFinal: false },
    { id: 'followup',   name: 'Follow Up',  color: 'amber',   isFinal: false },
    { id: 'qualified',  name: 'Qualified',  color: 'indigo',  isFinal: false },
    { id: 'won',        name: 'Won',        color: 'emerald', isFinal: true  },
    { id: 'lost',       name: 'Lost',       color: 'slate',   isFinal: true  },
    { id: 'missed',     name: 'Missed',     color: 'rose',    isFinal: false },
  ]);
  const [newStatus, setNewStatus] = useState({ name: '', color: 'violet', isFinal: false });

  const addStatus = () => {
    if (!newStatus.name.trim()) { showToast('Status name required', 'error'); return; }
    if (statuses.some((s) => s.name.toLowerCase() === newStatus.name.toLowerCase())) {
      showToast('Status already exists', 'error');
      return;
    }
    setStatuses((prev) => [...prev, { id: uid(), ...newStatus }]);
    setNewStatus({ name: '', color: 'violet', isFinal: false });
    showToast('Status added');
  };

  const removeStatus = (id) => {
    const s = statuses.find((x) => x.id === id);
    setStatuses((prev) => prev.filter((x) => x.id !== id));
    showToast(`Status "${s?.name}" removed`, 'error');
  };

  /* ========== CATEGORIES ========== */
  const [categories, setCategories] = useState([
    { id: uid(), name: 'Premium', desc: 'High-value customers' },
    { id: uid(), name: 'Standard', desc: 'Regular enquiries' },
    { id: uid(), name: 'Enterprise', desc: 'Business accounts' },
  ]);
  const [newCategory, setNewCategory] = useState({ name: '', desc: '' });

  const addCategory = () => {
    if (!newCategory.name.trim()) { showToast('Category name required', 'error'); return; }
    setCategories((prev) => [...prev, { id: uid(), ...newCategory }]);
    setNewCategory({ name: '', desc: '' });
    showToast('Category added');
  };

  const removeCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category removed', 'error');
  };

  /* ========== SOURCES ========== */
  const [sources, setSources] = useState([
    { id: uid(), name: 'Website',     active: true },
    { id: uid(), name: 'Meta Ads',    active: true },
    { id: uid(), name: 'Google Ads',  active: true },
    { id: uid(), name: 'Walk-in',     active: true },
    { id: uid(), name: 'Referral',    active: true },
    { id: uid(), name: 'Cold Call',   active: false },
  ]);
  const [newSource, setNewSource] = useState('');

  const addSource = () => {
    if (!newSource.trim()) { showToast('Source name required', 'error'); return; }
    setSources((prev) => [...prev, { id: uid(), name: newSource, active: true }]);
    setNewSource('');
    showToast('Source added');
  };

  const toggleSource = (id) => {
    setSources((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
  };

  const removeSource = (id) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    showToast('Source removed', 'error');
  };

  /* ========== CUSTOM FIELDS ========== */
  const [customFields, setCustomFields] = useState([
    { id: uid(), label: 'Budget', type: 'number', required: false },
    { id: uid(), label: 'Preferred Location', type: 'text', required: false },
  ]);
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false });

  const addField = () => {
    if (!newField.label.trim()) { showToast('Field label required', 'error'); return; }
    setCustomFields((prev) => [...prev, { id: uid(), ...newField }]);
    setNewField({ label: '', type: 'text', required: false });
    showToast('Custom field added');
  };

  const removeField = (id) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    showToast('Field removed', 'error');
  };

  /* ========== WORKFLOW ========== */
  const [workflow, setWorkflow] = useState({
    autoAssign: true,
    assignmentMethod: 'Round Robin',
    maxLeadsPerAgent: 50,
    autoFollowUp: true,
    followUpDelay: 24,
    requireCallDisposition: true,
    allowReassignment: true,
    duplicateCheck: true,
    duplicateFields: ['phone', 'email'],
    statusTransitions: {
      fresh: ['followup', 'qualified', 'lost'],
      followup: ['qualified', 'won', 'lost', 'missed'],
      qualified: ['won', 'lost'],
      missed: ['followup', 'lost'],
    },
  });

  const toggleTransition = (from, to) => {
    setWorkflow((prev) => {
      const current = prev.statusTransitions[from] || [];
      const next = current.includes(to) ? current.filter((x) => x !== to) : [...current, to];
      return { ...prev, statusTransitions: { ...prev.statusTransitions, [from]: next } };
    });
  };

  /* ========== NOTIFICATIONS ========== */
  const [notifications, setNotifications] = useState({
    newLead: { email: true, sms: false, push: true },
    missedCall: { email: true, sms: true, push: true },
    followUpDue: { email: true, sms: false, push: true },
    assignment: { email: true, sms: false, push: true },
    campaignComplete: { email: true, sms: false, push: false },
    dailyDigest: { email: true, sms: false, push: false },
  });

  /* ========== CALLING ========== */
  const [calling, setCalling] = useState({
    provider: 'Exotel',
    callerId: '+91 22 4890 1234',
    recordCalls: true,
    recordingRetention: 90,
    autoDialer: true,
    dialerMode: 'Predictive',
    maxConcurrentCalls: 5,
    voicemailEnabled: true,
    callTimeout: 30,
  });

  /* ========== COMMUNICATION ========== */
  const [communication, setCommunication] = useState({
    smsEnabled: true,
    whatsappEnabled: true,
    emailEnabled: true,
    senderId: 'ELITEIN',
    whatsappNumber: '+91 9876543210',
    fromEmail: 'noreply@eliteinova.com',
    dailyLimitSms: 1000,
    dailyLimitWhatsapp: 500,
    dailyLimitEmail: 2000,
    signature: 'Best regards,\nEliteinova Team',
  });

  /* ========== PERMISSIONS ========== */
  const [permissions, setPermissions] = useState({
    adminCanDeleteLeads: false,
    adminCanExportData: true,
    agentCanViewAllLeads: false,
    agentCanEditLeads: true,
    agentCanScheduleFollowUp: true,
    agentCanMakeOutboundCalls: true,
    requireApprovalForBulkImport: true,
    twoFactorAuth: false,
  });

  const handleSave = () => {
    const payload = {
      profile,
      hours,
      holidays,
      leadSettings,
      statuses,
      categories,
      sources,
      customFields,
      workflow,
      notifications,
      calling,
      communication,
      permissions,
    };
    try {
      const key = `projectSettings:${activeWebsiteId ?? 'default'}`;
      localStorage.setItem(key, JSON.stringify(payload));
      showToast('Settings saved successfully');
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Project Settings
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <SettingsIcon size={13} className="text-brand-purple" />
            Configure your project workspace for{' '}
            <span className="font-semibold text-brand-purple">
              {activeWebsite?.name}
            </span>
          </p>
        </div>
        <button
          onClick={handleSave}
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          <Save size={14} /> Save Changes
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
      {tab === 'profile'       && (
        <ProfileTab
          profile={profile}
          setProfile={setProfile}
          showToast={showToast}
        />
      )}
      {tab === 'business'      && (
        <BusinessTab
          hours={hours} setHours={setHours}
          holidays={holidays} addHoliday={addHoliday} removeHoliday={removeHoliday}
          newHoliday={newHoliday} setNewHoliday={setNewHoliday}
        />
      )}
      {tab === 'leads'         && <LeadSettingsTab settings={leadSettings} setSettings={setLeadSettings} />}
      {tab === 'status'        && (
        <StatusSettingsTab
          statuses={statuses} addStatus={addStatus} removeStatus={removeStatus}
          newStatus={newStatus} setNewStatus={setNewStatus}
        />
      )}
      {tab === 'category'      && (
        <CategorySettingsTab
          categories={categories} addCategory={addCategory} removeCategory={removeCategory}
          newCategory={newCategory} setNewCategory={setNewCategory}
        />
      )}
      {tab === 'source'        && (
        <SourceSettingsTab
          sources={sources} addSource={addSource} toggleSource={toggleSource}
          removeSource={removeSource} newSource={newSource} setNewSource={setNewSource}
        />
      )}
      {tab === 'custom'        && (
        <CustomFieldsTab
          fields={customFields} addField={addField} removeField={removeField}
          newField={newField} setNewField={setNewField}
        />
      )}
      {tab === 'workflow'      && (
        <WorkflowTab
          workflow={workflow} setWorkflow={setWorkflow}
          statuses={statuses} toggleTransition={toggleTransition}
        />
      )}
      {tab === 'notifications' && <NotificationsTab notifications={notifications} setNotifications={setNotifications} />}
      {tab === 'calling'       && <CallingTab calling={calling} setCalling={setCalling} />}
      {tab === 'communication' && <CommunicationTab communication={communication} setCommunication={setCommunication} />}
      {tab === 'permissions'   && <PermissionsTab permissions={permissions} setPermissions={setPermissions} />}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1 — PROFILE
   ═══════════════════════════════════════════════════════════════ */
function ProfileTab({ profile, setProfile, showToast }) {
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('File must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile({ ...profile, logo: ev.target.result });
      showToast('Logo uploaded');
    };
    reader.onerror = () => showToast('Failed to read file', 'error');
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Palette size={14} className="text-brand-purple" /> Project Logo
        </h3>
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-lilac bg-gradient-to-br from-brand-lilac/30 to-brand-mist">
            {profile.logo ? (
              <img src={profile.logo} alt="logo" className="h-full w-full object-cover" />
            ) : (
              <Building2 size={32} className="text-brand-purple" />
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
            <Upload size={12} /> Upload Logo
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
          {profile.logo && (
            <button
              onClick={() => {
                setProfile({ ...profile, logo: null });
                showToast('Logo removed', 'error');
              }}
              className="text-[11px] font-semibold text-rose-500 hover:underline"
            >
              Remove logo
            </button>
          )}
          <p className="text-center text-[10px] text-brand-ink/40">
            PNG or JPG, max 2MB. Recommended 512×512.
          </p>
        </div>
      </div>

      <div className="card !p-5 space-y-4 lg:col-span-2">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Building2 size={14} className="text-brand-purple" /> General Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Project Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
          <Field label="Legal Name" value={profile.legalName} onChange={(v) => setProfile({ ...profile, legalName: v })} />
          <Field label="Support Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} icon={Mail} />
          <Field label="Support Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} icon={Phone} />
          <Field label="Website" value={profile.website} onChange={(v) => setProfile({ ...profile, website: v })} icon={Globe} />
          <Field label="Timezone" value={profile.timezone} onChange={(v) => setProfile({ ...profile, timezone: v })} icon={Clock} />
          <Field label="Currency" value={profile.currency} onChange={(v) => setProfile({ ...profile, currency: v })} />
          <Field label="Language" value={profile.language} onChange={(v) => setProfile({ ...profile, language: v })} />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Address</label>
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 — BUSINESS HOURS + HOLIDAYS
   ═══════════════════════════════════════════════════════════════ */
function BusinessTab({
  hours, setHours, holidays, addHoliday, removeHoliday, newHoliday, setNewHoliday,
}) {
  const toggleDay = (day) =>
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, enabled: !h.enabled } : h)));
  const updateHour = (day, key, value) =>
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, [key]: value } : h)));

  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-brand-purple" />
          <h3 className="font-display text-sm font-semibold text-brand-ink">Business Hours</h3>
          <span className="text-xs text-brand-ink/40">· Working days and hours</span>
        </div>

        <div className="space-y-2">
          {hours.map((h) => (
            <div
              key={h.day}
              className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-all ${
                h.enabled ? 'border-brand-lilac bg-white' : 'border-brand-lilac/40 bg-brand-mist/30 opacity-60'
              }`}
            >
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={h.enabled}
                  onChange={() => toggleDay(h.day)}
                  className="h-4 w-4 rounded border-brand-lilac text-brand-purple focus:ring-brand-purple/30"
                />
                <span className="w-20 text-sm font-semibold text-brand-ink">{h.day}</span>
              </label>
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="time"
                  value={h.from}
                  disabled={!h.enabled}
                  onChange={(e) => updateHour(h.day, 'from', e.target.value)}
                  className="rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple disabled:bg-brand-mist disabled:text-brand-ink/40"
                />
                <span className="text-xs text-brand-ink/40">to</span>
                <input
                  type="time"
                  value={h.to}
                  disabled={!h.enabled}
                  onChange={(e) => updateHour(h.day, 'to', e.target.value)}
                  className="rounded-lg border border-brand-lilac bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-purple disabled:bg-brand-mist disabled:text-brand-ink/40"
                />
              </div>
              {h.enabled ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">OPEN</span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">CLOSED</span>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-start gap-2 text-xs text-amber-700">
            <Info size={14} className="mt-0.5 shrink-0" />
            Outside business hours, calls will be routed to voicemail and follow-ups will be scheduled for the next business day.
          </p>
        </div>
      </div>

      {/* Holidays */}
      <div className="card !p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-brand-purple" />
            <h3 className="font-display text-sm font-semibold text-brand-ink">Holidays</h3>
            <span className="text-xs text-brand-ink/40">· {holidays.length} configured</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Field
              label="Holiday Name"
              value={newHoliday.name}
              onChange={(v) => setNewHoliday({ ...newHoliday, name: v })}
              placeholder="e.g. Diwali"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Date</label>
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addHoliday}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110"
            >
              <Plus size={14} /> Add Holiday
            </button>
          </div>
        </div>

        {holidays.length === 0 ? (
          <p className="rounded-xl bg-brand-mist/40 px-3 py-4 text-center text-xs text-brand-ink/50">
            No holidays configured yet.
          </p>
        ) : (
          <ul className="divide-y divide-brand-lilac/40 overflow-hidden rounded-xl border border-brand-lilac">
            {holidays.map((h) => (
              <li key={h.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-mist/30">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-brand-magenta">
                  <Calendar size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">{h.name}</p>
                  <p className="truncate font-mono text-[11px] text-brand-ink/50">
                    {new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {h.recurring && ' · Recurring yearly'}
                  </p>
                </div>
                <button
                  onClick={() => removeHoliday(h.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                  title="Remove"
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
   TAB 3 — LEAD SETTINGS
   ═══════════════════════════════════════════════════════════════ */
function LeadSettingsTab({ settings, setSettings }) {
  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Target size={14} className="text-brand-purple" /> Lead Capture Rules
        </h3>
        <ToggleRow
          label="Require phone number"
          desc="Every new lead must have a valid phone number"
          value={settings.requirePhone}
          onChange={(v) => setSettings({ ...settings, requirePhone: v })}
        />
        <ToggleRow
          label="Require email"
          desc="Every new lead must have an email address"
          value={settings.requireEmail}
          onChange={(v) => setSettings({ ...settings, requireEmail: v })}
        />
        <ToggleRow
          label="Allow duplicate leads"
          desc="Permit multiple leads with the same phone or email"
          value={settings.allowDuplicate}
          onChange={(v) => setSettings({ ...settings, allowDuplicate: v })}
        />
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Zap size={14} className="text-brand-purple" /> Automation
        </h3>
        <ToggleRow
          label="Auto-assign new leads"
          desc="Automatically assign incoming leads to agents"
          value={settings.autoAssign}
          onChange={(v) => setSettings({ ...settings, autoAssign: v })}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label="Auto follow-up (hours)"
            type="number"
            value={settings.autoFollowUpHours}
            onChange={(v) => setSettings({ ...settings, autoFollowUpHours: v })}
          />
          <Field
            label="Stale lead threshold (days)"
            type="number"
            value={settings.staleThresholdDays}
            onChange={(v) => setSettings({ ...settings, staleThresholdDays: v })}
          />
          <Field
            label="Max leads per agent"
            type="number"
            value={settings.maxLeadsPerAgent}
            onChange={(v) => setSettings({ ...settings, maxLeadsPerAgent: v })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Default priority</label>
          <div className="flex flex-wrap gap-2">
            {['Low', 'Medium', 'High', 'Urgent'].map((p) => {
              const active = settings.defaultPriority === p;
              return (
                <button
                  key={p}
                  onClick={() => setSettings({ ...settings, defaultPriority: p })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4 — STATUS SETTINGS
   ═══════════════════════════════════════════════════════════════ */
const COLOR_OPTIONS = [
  { key: 'violet',  label: 'Violet',  chip: 'bg-violet-100 text-brand-purple' },
  { key: 'amber',   label: 'Amber',   chip: 'bg-amber-100 text-amber-600' },
  { key: 'emerald', label: 'Emerald', chip: 'bg-emerald-100 text-emerald-600' },
  { key: 'rose',    label: 'Rose',    chip: 'bg-rose-100 text-brand-magenta' },
  { key: 'indigo',  label: 'Indigo',  chip: 'bg-indigo-100 text-indigo-600' },
  { key: 'slate',   label: 'Slate',   chip: 'bg-slate-100 text-slate-600' },
  { key: 'cyan',    label: 'Cyan',    chip: 'bg-cyan-100 text-cyan-600' },
];

function StatusSettingsTab({ statuses, addStatus, removeStatus, newStatus, setNewStatus }) {
  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <ListFilter size={14} className="text-brand-purple" /> Lead Statuses
        </h3>
        <p className="text-xs text-brand-ink/50">
          Define the pipeline stages a lead can move through.
        </p>

        <ul className="divide-y divide-brand-lilac/40 overflow-hidden rounded-xl border border-brand-lilac">
          {statuses.map((s) => {
            const colorStyle = COLOR_OPTIONS.find((c) => c.key === s.color)?.chip || 'bg-slate-100 text-slate-600';
            return (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-mist/30">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-lilac/40 text-brand-purple">
                  <GripVertical size={12} />
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${colorStyle}`}>
                  {s.name}
                </span>
                {s.isFinal && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    FINAL
                  </span>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => removeStatus(s.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                  title="Remove status"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-brand-lilac/60 bg-brand-mist/30 p-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Field
              label="New status name"
              value={newStatus.name}
              onChange={(v) => setNewStatus({ ...newStatus, name: v })}
              placeholder="e.g. Nurturing"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Color</label>
            <select
              value={newStatus.color}
              onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
              <input
                type="checkbox"
                checked={newStatus.isFinal}
                onChange={(e) => setNewStatus({ ...newStatus, isFinal: e.target.checked })}
                className="h-4 w-4 rounded border-brand-lilac text-brand-purple focus:ring-brand-purple/30"
              />
              Final
            </label>
            <button
              onClick={addStatus}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5 — CATEGORY SETTINGS
   ═══════════════════════════════════════════════════════════════ */
function CategorySettingsTab({ categories, addCategory, removeCategory, newCategory, setNewCategory }) {
  return (
    <div className="card !p-5 space-y-4">
      <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
        <Layers size={14} className="text-brand-purple" /> Lead Categories
      </h3>
      <p className="text-xs text-brand-ink/50">
        Group leads by business category to route and report more effectively.
      </p>

      {categories.length === 0 ? (
        <p className="rounded-xl bg-brand-mist/40 px-3 py-4 text-center text-xs text-brand-ink/50">
          No categories yet.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-start gap-3 rounded-xl border border-brand-lilac bg-white p-3.5 transition-all hover:shadow-md">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
                <Layers size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-ink">{c.name}</p>
                {c.desc && <p className="truncate text-xs text-brand-ink/50">{c.desc}</p>}
              </div>
              <button
                onClick={() => removeCategory(c.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-brand-lilac/60 bg-brand-mist/30 p-4 md:grid-cols-3">
        <Field
          label="Category name"
          value={newCategory.name}
          onChange={(v) => setNewCategory({ ...newCategory, name: v })}
          placeholder="e.g. Premium"
        />
        <Field
          label="Description"
          value={newCategory.desc}
          onChange={(v) => setNewCategory({ ...newCategory, desc: v })}
          placeholder="Short description"
        />
        <div className="flex items-end">
          <button
            onClick={addCategory}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 6 — SOURCE SETTINGS
   ═══════════════════════════════════════════════════════════════ */
function SourceSettingsTab({ sources, addSource, toggleSource, removeSource, newSource, setNewSource }) {
  return (
    <div className="card !p-5 space-y-4">
      <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
        <Globe2 size={14} className="text-brand-purple" /> Lead Sources
      </h3>
      <p className="text-xs text-brand-ink/50">
        Track where your leads come from. Toggle active sources for the current project.
      </p>

      <ul className="divide-y divide-brand-lilac/40 overflow-hidden rounded-xl border border-brand-lilac">
        {sources.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-mist/30">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              s.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <Globe2 size={14} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-ink">{s.name}</span>
            <button
              onClick={() => toggleSource(s.id)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                s.active
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              {s.active ? 'Active' : 'Inactive'}
            </button>
            <button
              onClick={() => removeSource(s.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-brand-lilac/60 bg-brand-mist/30 p-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Field
            label="New source name"
            value={newSource}
            onChange={setNewSource}
            placeholder="e.g. Instagram Ads"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={addSource}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2.5 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={14} /> Add Source
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 7 — CUSTOM FIELDS
   ═══════════════════════════════════════════════════════════════ */
const FIELD_TYPES = ['text', 'number', 'email', 'phone', 'date', 'select', 'textarea'];

function CustomFieldsTab({ fields, addField, removeField, newField, setNewField }) {
  return (
    <div className="card !p-5 space-y-4">
      <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
        <Hash size={14} className="text-brand-purple" /> Custom Fields
      </h3>
      <p className="text-xs text-brand-ink/50">
        Add project-specific fields to capture information unique to your business.
      </p>

      {fields.length === 0 ? (
        <p className="rounded-xl bg-brand-mist/40 px-3 py-4 text-center text-xs text-brand-ink/50">
          No custom fields yet.
        </p>
      ) : (
        <ul className="divide-y divide-brand-lilac/40 overflow-hidden rounded-xl border border-brand-lilac">
          {fields.map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-mist/30">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
                <Hash size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-ink">{f.label}</p>
                <p className="truncate font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">
                  {f.type}{f.required && ' · Required'}
                </p>
              </div>
              <span className="hidden rounded-full bg-brand-lilac px-2 py-0.5 text-[10px] font-bold text-brand-purple sm:inline-block">
                {f.type.toUpperCase()}
              </span>
              <button
                onClick={() => removeField(f.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-brand-lilac/60 bg-brand-mist/30 p-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Field
            label="Field label"
            value={newField.label}
            onChange={(v) => setNewField({ ...newField, label: v })}
            placeholder="e.g. Budget"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Field type</label>
          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70">
            <input
              type="checkbox"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
              className="h-4 w-4 rounded border-brand-lilac text-brand-purple focus:ring-brand-purple/30"
            />
            Required
          </label>
          <button
            onClick={addField}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 8 — WORKFLOW
   ═══════════════════════════════════════════════════════════════ */
function WorkflowTab({ workflow, setWorkflow, statuses, toggleTransition }) {
  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Users size={14} className="text-brand-purple" /> Lead Assignment
        </h3>

        <ToggleRow
          label="Auto-assign new leads"
          desc="Automatically assign incoming leads to agents"
          value={workflow.autoAssign}
          onChange={(v) => setWorkflow({ ...workflow, autoAssign: v })}
        />

        {workflow.autoAssign && (
          <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Assignment Method</label>
              <select
                value={workflow.assignmentMethod}
                onChange={(e) => setWorkflow({ ...workflow, assignmentMethod: e.target.value })}
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple"
              >
                <option>Round Robin</option>
                <option>Load Balanced</option>
                <option>Performance Based</option>
                <option>Manual</option>
              </select>
            </div>
            <Field
              label="Max Leads per Agent"
              type="number"
              value={workflow.maxLeadsPerAgent}
              onChange={(v) => setWorkflow({ ...workflow, maxLeadsPerAgent: v })}
            />
          </div>
        )}
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Calendar size={14} className="text-brand-purple" /> Follow-up Rules
        </h3>
        <ToggleRow
          label="Auto-create follow-up tasks"
          desc="Create follow-up tasks automatically after each call"
          value={workflow.autoFollowUp}
          onChange={(v) => setWorkflow({ ...workflow, autoFollowUp: v })}
        />
        {workflow.autoFollowUp && (
          <div className="pl-4">
            <Field
              label="Follow-up delay (hours)"
              type="number"
              value={workflow.followUpDelay}
              onChange={(v) => setWorkflow({ ...workflow, followUpDelay: v })}
            />
          </div>
        )}
        <ToggleRow
          label="Require call disposition"
          desc="Agents must select an outcome before ending a call"
          value={workflow.requireCallDisposition}
          onChange={(v) => setWorkflow({ ...workflow, requireCallDisposition: v })}
        />
        <ToggleRow
          label="Allow lead reassignment"
          desc="Admins can reassign leads between agents"
          value={workflow.allowReassignment}
          onChange={(v) => setWorkflow({ ...workflow, allowReassignment: v })}
        />
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Database size={14} className="text-brand-purple" /> Duplicate Detection
        </h3>
        <ToggleRow
          label="Enable duplicate check"
          desc="Warn when importing or adding leads that already exist"
          value={workflow.duplicateCheck}
          onChange={(v) => setWorkflow({ ...workflow, duplicateCheck: v })}
        />
        {workflow.duplicateCheck && (
          <div className="flex flex-wrap gap-2 pl-4">
            {['phone', 'email', 'name'].map((f) => {
              const active = workflow.duplicateFields.includes(f);
              return (
                <button
                  key={f}
                  onClick={() =>
                    setWorkflow({
                      ...workflow,
                      duplicateFields: active
                        ? workflow.duplicateFields.filter((x) => x !== f)
                        : [...workflow.duplicateFields, f],
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${
                    active
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Transitions */}
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <ArrowRight size={14} className="text-brand-purple" /> Status Transitions
        </h3>
        <p className="text-xs text-brand-ink/50">
          Define which statuses a lead can move to from each stage. Click a badge to toggle.
        </p>
        <div className="space-y-3">
          {statuses.map((fromStatus) => {
            const transitions = workflow.statusTransitions[fromStatus.id] || [];
            const fromStyle = COLOR_OPTIONS.find((c) => c.key === fromStatus.color)?.chip || 'bg-slate-100 text-slate-600';
            return (
              <div key={fromStatus.id} className="rounded-xl border border-brand-lilac/60 bg-brand-mist/30 p-3.5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${fromStyle}`}>
                    {fromStatus.name}
                  </span>
                  <ArrowRight size={12} className="text-brand-ink/40" />
                  <span className="text-[10px] text-brand-ink/50">
                    {transitions.length} possible transition{transitions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {statuses
                    .filter((s) => s.id !== fromStatus.id)
                    .map((toStatus) => {
                      const active = transitions.includes(toStatus.id);
                      const toStyle = COLOR_OPTIONS.find((c) => c.key === toStatus.color)?.chip || 'bg-slate-100 text-slate-600';
                      return (
                        <button
                          key={toStatus.id}
                          onClick={() => toggleTransition(fromStatus.id, toStatus.id)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${
                            active
                              ? `${toStyle} border-transparent ring-1 ring-brand-magenta/30`
                              : 'border-brand-lilac bg-white text-brand-ink/40 hover:bg-brand-lilac/30'
                          }`}
                        >
                          {toStatus.name}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 9 — NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */
function NotificationsTab({ notifications, setNotifications }) {
  const events = [
    { key: 'newLead',          label: 'New Lead Created',  icon: Zap },
    { key: 'missedCall',       label: 'Missed Call',       icon: Phone },
    { key: 'followUpDue',      label: 'Follow-up Due',     icon: Calendar },
    { key: 'assignment',       label: 'Lead Assigned',     icon: Users },
    { key: 'campaignComplete', label: 'Campaign Complete', icon: Bell },
    { key: 'dailyDigest',      label: 'Daily Digest',      icon: MessageSquare },
  ];

  const toggle = (key, channel) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  };

  return (
    <div className="card !p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Bell size={14} className="text-brand-purple" />
        <h3 className="font-display text-sm font-semibold text-brand-ink">Notification Preferences</h3>
        <span className="text-xs text-brand-ink/40">· Choose how you want to be notified</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-brand-lilac">
              <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">Event</th>
              <th className="pb-3 text-center text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">Email</th>
              <th className="pb-3 text-center text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">SMS</th>
              <th className="pb-3 text-center text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">Push</th>
            </tr>
          </thead>
          <tbody>
            {events.map(({ key, label, icon: Icon }) => (
              <tr key={key} className="border-b border-brand-lilac/40 last:border-0">
                <td className="py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-brand-ink">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-lilac/40 text-brand-purple">
                      <Icon size={12} />
                    </span>
                    {label}
                  </span>
                </td>
                {['email', 'sms', 'push'].map((ch) => (
                  <td key={ch} className="py-3 text-center">
                    <button
                      onClick={() => toggle(key, ch)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[key][ch]
                          ? 'bg-gradient-to-r from-brand-magenta to-brand-purple'
                          : 'bg-brand-lilac'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          notifications[key][ch] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 10 — CALLING
   ═══════════════════════════════════════════════════════════════ */
function CallingTab({ calling, setCalling }) {
  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Phone size={14} className="text-brand-purple" /> Telephony Settings
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Telephony Provider</label>
            <select
              value={calling.provider}
              onChange={(e) => setCalling({ ...calling, provider: e.target.value })}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple"
            >
              <option>Exotel</option>
              <option>Twilio</option>
              <option>Knowlarity</option>
              <option>Ozonetel</option>
              <option>Plivo</option>
            </select>
          </div>
          <Field
            label="Caller ID"
            value={calling.callerId}
            onChange={(v) => setCalling({ ...calling, callerId: v })}
            icon={Phone}
          />
          <Field
            label="Call Timeout (seconds)"
            type="number"
            value={calling.callTimeout}
            onChange={(v) => setCalling({ ...calling, callTimeout: v })}
          />
          <Field
            label="Max Concurrent Calls"
            type="number"
            value={calling.maxConcurrentCalls}
            onChange={(v) => setCalling({ ...calling, maxConcurrentCalls: v })}
          />
        </div>
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Smartphone size={14} className="text-brand-purple" /> Auto Dialer
        </h3>
        <ToggleRow
          label="Enable auto dialer"
          desc="Automatically dial the next lead after each call"
          value={calling.autoDialer}
          onChange={(v) => setCalling({ ...calling, autoDialer: v })}
        />
        {calling.autoDialer && (
          <div className="pl-4">
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">Dialer Mode</label>
            <div className="flex flex-wrap gap-2">
              {['Predictive', 'Progressive', 'Preview', 'Manual'].map((m) => (
                <button
                  key={m}
                  onClick={() => setCalling({ ...calling, dialerMode: m })}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    calling.dialerMode === m
                      ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta ring-1 ring-brand-magenta/30'
                      : 'border-brand-lilac bg-white text-brand-ink/60 hover:bg-brand-lilac/30'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <FileText size={14} className="text-brand-purple" /> Call Recording
        </h3>
        <ToggleRow
          label="Record all calls"
          desc="Store call recordings for quality and compliance"
          value={calling.recordCalls}
          onChange={(v) => setCalling({ ...calling, recordCalls: v })}
        />
        {calling.recordCalls && (
          <div className="pl-4">
            <Field
              label="Recording retention (days)"
              type="number"
              value={calling.recordingRetention}
              onChange={(v) => setCalling({ ...calling, recordingRetention: v })}
            />
          </div>
        )}
        <ToggleRow
          label="Enable voicemail"
          desc="Allow callers to leave a voicemail outside business hours"
          value={calling.voicemailEnabled}
          onChange={(v) => setCalling({ ...calling, voicemailEnabled: v })}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 11 — COMMUNICATION
   ═══════════════════════════════════════════════════════════════ */
function CommunicationTab({ communication, setCommunication }) {
  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <MessageSquare size={14} className="text-brand-purple" /> Channels
        </h3>
        <ToggleRow
          label="SMS"
          desc="Enable SMS communication for this project"
          value={communication.smsEnabled}
          onChange={(v) => setCommunication({ ...communication, smsEnabled: v })}
        />
        {communication.smsEnabled && (
          <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-2">
            <Field
              label="Sender ID"
              value={communication.senderId}
              onChange={(v) => setCommunication({ ...communication, senderId: v })}
            />
            <Field
              label="Daily SMS Limit"
              type="number"
              value={communication.dailyLimitSms}
              onChange={(v) => setCommunication({ ...communication, dailyLimitSms: v })}
            />
          </div>
        )}

        <ToggleRow
          label="WhatsApp"
          desc="Enable WhatsApp messaging for this project"
          value={communication.whatsappEnabled}
          onChange={(v) => setCommunication({ ...communication, whatsappEnabled: v })}
        />
        {communication.whatsappEnabled && (
          <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-2">
            <Field
              label="WhatsApp Business Number"
              value={communication.whatsappNumber}
              onChange={(v) => setCommunication({ ...communication, whatsappNumber: v })}
              icon={Phone}
            />
            <Field
              label="Daily WhatsApp Limit"
              type="number"
              value={communication.dailyLimitWhatsapp}
              onChange={(v) => setCommunication({ ...communication, dailyLimitWhatsapp: v })}
            />
          </div>
        )}

        <ToggleRow
          label="Email"
          desc="Enable email communication for this project"
          value={communication.emailEnabled}
          onChange={(v) => setCommunication({ ...communication, emailEnabled: v })}
        />
        {communication.emailEnabled && (
          <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-2">
            <Field
              label="From Email"
              value={communication.fromEmail}
              onChange={(v) => setCommunication({ ...communication, fromEmail: v })}
              icon={Mail}
            />
            <Field
              label="Daily Email Limit"
              type="number"
              value={communication.dailyLimitEmail}
              onChange={(v) => setCommunication({ ...communication, dailyLimitEmail: v })}
            />
          </div>
        )}
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Mail size={14} className="text-brand-purple" /> Email Signature
        </h3>
        <textarea
          value={communication.signature}
          onChange={(e) => setCommunication({ ...communication, signature: e.target.value })}
          rows={4}
          className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
        />
        <p className="text-[11px] text-brand-ink/50">
          This signature will be appended to all outbound emails from this project.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 12 — PERMISSIONS
   ═══════════════════════════════════════════════════════════════ */
function PermissionsTab({ permissions, setPermissions }) {
  const groups = [
    {
      title: 'Admin Permissions',
      icon: Shield,
      items: [
        { key: 'adminCanDeleteLeads', label: 'Delete leads', desc: 'Allow admins to permanently delete leads' },
        { key: 'adminCanExportData', label: 'Export data', desc: 'Allow admins to export leads and reports' },
        { key: 'requireApprovalForBulkImport', label: 'Require approval for bulk import', desc: 'Super admin approval needed for bulk imports' },
      ],
    },
    {
      title: 'Agent Permissions',
      icon: Users,
      items: [
        { key: 'agentCanViewAllLeads', label: 'View all leads', desc: 'Agents can see leads assigned to other agents' },
        { key: 'agentCanEditLeads', label: 'Edit leads', desc: 'Agents can update lead details' },
        { key: 'agentCanScheduleFollowUp', label: 'Schedule follow-ups', desc: 'Agents can create follow-up reminders' },
        { key: 'agentCanMakeOutboundCalls', label: 'Make outbound calls', desc: 'Agents can initiate outbound calls' },
      ],
    },
    {
      title: 'Security',
      icon: Lock,
      items: [
        { key: 'twoFactorAuth', label: 'Require 2FA for admins', desc: 'Enforce two-factor authentication for admin accounts' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div key={group.title} className="card !p-5 space-y-4">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
              <GroupIcon size={14} className="text-brand-purple" />
              {group.title}
            </h3>
            <div className="space-y-3">
              {group.items.map((item) => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  desc={item.desc}
                  value={permissions[item.key]}
                  onChange={(v) => setPermissions({ ...permissions, [item.key]: v })}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Field({ label, value, onChange, type = 'text', icon: Icon, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
        )}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(type === 'number' ? Number(e.target.value) : e.target.value)
          }
          className={`w-full rounded-xl border border-brand-lilac bg-white py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15 ${
            Icon ? 'pl-10 pr-3.5' : 'px-3.5'
          }`}
        />
      </div>
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
            ? 'bg-gradient-to-r from-brand-magenta to-brand-purple'
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