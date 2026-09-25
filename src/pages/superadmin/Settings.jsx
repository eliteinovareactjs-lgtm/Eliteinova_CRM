// src/pages/superadmin/Settings.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  User, Shield, Building2, Bell, Palette, Globe, Lock, CreditCard,
  Save, Check, Eye, EyeOff, Phone, Mail, Users, Database, Zap,
  AlertTriangle, Plus, Trash2, X, Settings as SettingsIcon, Workflow,
  Clock, HardDrive, Download, Upload, LogOut, History, Key, RefreshCw,
  ChevronRight, Sliders, AlertCircle, CheckCircle2, Edit3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ============================================================
   STORAGE HELPERS — persist settings to localStorage
   ============================================================ */
const STORAGE_KEY = 'eliteinova-superadmin-settings-v1';

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const persist = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
};

/* ============================================================
   DEFAULTS
   ============================================================ */
const DEFAULTS = {
  twoFA: true,
  sessionTimeout: true,
  ipRestriction: false,
  auditLog: true,
  leadStatuses: [
    { id: 1, name: 'Fresh' },
    { id: 2, name: 'Follow Up' },
    { id: 3, name: 'Qualified' },
    { id: 4, name: 'Won' },
    { id: 5, name: 'Lost' },
    { id: 6, name: 'Missed' },
  ],
  categories: ['Matrimony', 'Property', 'Insurance', 'Education', 'Healthcare', 'Other'],
  sources: ['Website', 'Referral', 'Campaign', 'Walk-in', 'Social Media', 'Other'],
  stages: ['Enquiry', 'Contacted', 'Interested', 'Negotiation', 'Closed'],
  customFields: [
    { id: 1, name: 'Budget', type: 'Number' },
    { id: 2, name: 'Preferred Location', type: 'Text' },
  ],
  workflow: true,
  notifyOnAssign: true,
  autoFollowUp: false,
  callingRules: true,
  maintenance: false,
  signup: true,
  autoAssign: true,
  ivrFallback: true,
  email: true,
  sms: false,
  push: true,
  newLead: true,
  missedCall: true,
  weekly: true,
  billing: true,
  theme: 'light',
  accent: 'purple',
  compact: false,
  backupEnabled: true,
  webhooks: [
    { id: 1, url: 'https://hooks.eliteinova.com/leads', event: 'lead.created' },
    { id: 2, url: 'https://hooks.eliteinova.com/calls', event: 'call.completed' },
  ],
  sessions: [
    { id: 1, device: 'Chrome on Windows', location: 'Chennai, IN', current: true, time: 'Now' },
    { id: 2, device: 'Safari on iPhone', location: 'Chennai, IN', current: false, time: '2 days ago' },
    { id: 3, device: 'Edge on Windows', location: 'Bangalore, IN', current: false, time: '5 days ago' },
  ],
  paymentCard: { brand: 'VISA', last4: '4242', expiry: '12/2027' },
  logo: 'EI',
};

/* ============================================================
   TABS
   ============================================================ */
const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'crm', label: 'CRM Configuration', icon: Sliders },
  { key: 'platform', label: 'Platform', icon: Building2 },
  { key: 'system', label: 'System Settings', icon: SettingsIcon },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'account', label: 'My Account', icon: User },
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function Settings() {
  const { role, user, activeWebsite } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  /* ---- Persisted state (survives tab switches + page reloads) ---- */
  const [settings, setSettings] = useState(() => ({
    ...DEFAULTS,
    ...loadPersisted(),
  }));

  useEffect(() => {
    persist(settings);
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const handleSave = () => {
    persist(settings);
    setSaved(true);
    showToast('All changes saved');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!window.confirm('Reset all settings to defaults?')) return;
    setSettings(DEFAULTS);
    persist(DEFAULTS);
    showToast('Settings reset to defaults', 'error');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Settings
          </h1>
          <p className="text-sm text-brand-ink/50">
            Manage your account, CRM, system, and preferences.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            <RefreshCw size={15} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110 active:scale-[0.98]"
          >
            {saved ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 border-b border-brand-lilac pb-3">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card'
                : 'text-brand-ink/60 hover:bg-brand-lilac/50'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && (
            <SecurityTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === 'crm' && (
            <CrmConfigTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === 'platform' && (
            <PlatformTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === 'system' && (
            <SystemSettingsTab
              settings={settings}
              updateSetting={updateSetting}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === 'appearance' && (
            <AppearanceTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === 'billing' && (
            <BillingTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === 'account' && (
            <MyAccountTab settings={settings} updateSetting={updateSetting} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <InfoCard />
          <SystemStatusCard />
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= TAB: PROFILE ================= */
function ProfileTab() {
  const { role, user, activeWebsite } = useAuth();

  return (
    <>
      <Section title="Profile" subtitle="Your personal account information.">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-magenta text-xl font-bold text-white shadow-card">
            {user?.avatar || 'SA'}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-brand-ink">
              {user?.name || 'Super Admin'}
            </p>
            <p className="text-sm capitalize text-brand-ink/50">
              {role} • {activeWebsite?.name || 'Eliteinova Global'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="Full Name" defaultValue={user?.name || ''} />
          <InputField label="Username / ID" defaultValue={user?.id || ''} disabled />
          <InputField label="Email" type="email" defaultValue="superadmin@eliteinova.com" />
          <InputField label="Phone" defaultValue="+91 99404 93726" />
        </div>
      </Section>

      <Section title="Address" subtitle="Billing and contact address.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="Company Name" defaultValue="Eliteinova Global" />
          <InputField label="GSTIN" defaultValue="33AAACE1234A1Z5" />
          <InputField label="Address Line 1" defaultValue="123, Anna Salai" />
          <InputField label="City" defaultValue="Chennai" />
          <InputField label="State" defaultValue="Tamil Nadu" />
          <InputField label="Pincode" defaultValue="600002" />
        </div>
      </Section>
    </>
  );
}

/* ================= TAB: SECURITY ================= */
function SecurityTab({ settings, updateSetting }) {
  const [showPass, setShowPass] = useState(false);
  const [confirmSession, setConfirmSession] = useState(null);

  const revokeSession = (id) => {
    updateSetting(
      'sessions',
      settings.sessions.filter((s) => s.id !== id)
    );
    setConfirmSession(null);
  };

  return (
    <>
      <Section title="Password" subtitle="Last changed 45 days ago. Recommended: every 90 days.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <InputField
              label="Current Password"
              type={showPass ? 'text' : 'password'}
              defaultValue="password123"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-[38px] text-brand-ink/40 hover:text-brand-purple"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <InputField label="New Password" type="password" />
          <InputField label="Confirm New Password" type="password" />
        </div>
      </Section>

      <Section title="Authentication" subtitle="Extra layers of protection.">
        <ToggleRow
          label="Two-Factor Authentication (2FA)"
          desc="Require a code from your phone at login."
          value={settings.twoFA}
          onChange={(v) => updateSetting('twoFA', v)}
          icon={Shield}
        />
        <ToggleRow
          label="Session Timeout"
          desc="Auto logout after 30 minutes of inactivity."
          value={settings.sessionTimeout}
          onChange={(v) => updateSetting('sessionTimeout', v)}
          icon={Lock}
        />
        <ToggleRow
          label="IP Restriction"
          desc="Only allow logins from whitelisted IPs."
          value={settings.ipRestriction}
          onChange={(v) => updateSetting('ipRestriction', v)}
          icon={Globe}
        />
        <ToggleRow
          label="Audit Log"
          desc="Record every admin action for compliance."
          value={settings.auditLog}
          onChange={(v) => updateSetting('auditLog', v)}
          icon={Database}
        />
      </Section>

      <Section title="Active Sessions" subtitle="Devices currently signed into your account.">
        {settings.sessions.length === 0 ? (
          <p className="py-2 text-center text-xs text-brand-ink/40">
            No active sessions.
          </p>
        ) : (
          settings.sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border-b border-brand-lilac/60 py-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-semibold text-brand-ink">
                  {s.device}
                  {s.current && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      CURRENT
                    </span>
                  )}
                </p>
                <p className="text-xs text-brand-ink/50">
                  {s.location} • {s.time}
                </p>
              </div>
              {!s.current && (
                <button
                  onClick={() => revokeSession(s.id)}
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Revoke
                </button>
              )}
            </div>
          ))
        )}
      </Section>
    </>
  );
}

/* ================= TAB: CRM CONFIGURATION ================= */
function CrmConfigTab({ settings, updateSetting }) {
  const [newStatus, setNewStatus] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newStage, setNewStage] = useState('');
  const [newField, setNewField] = useState({ name: '', type: 'Text' });

  const addStatus = () => {
    if (!newStatus.trim()) return;
    updateSetting('leadStatuses', [
      ...settings.leadStatuses,
      { id: Date.now(), name: newStatus.trim() },
    ]);
    setNewStatus('');
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    updateSetting('categories', [...settings.categories, newCategory.trim()]);
    setNewCategory('');
  };

  const addSource = () => {
    if (!newSource.trim()) return;
    updateSetting('sources', [...settings.sources, newSource.trim()]);
    setNewSource('');
  };

  const addStage = () => {
    if (!newStage.trim()) return;
    updateSetting('stages', [...settings.stages, newStage.trim()]);
    setNewStage('');
  };

  const addField = () => {
    if (!newField.name.trim()) return;
    updateSetting('customFields', [
      ...settings.customFields,
      { id: Date.now(), ...newField },
    ]);
    setNewField({ name: '', type: 'Text' });
  };

  return (
    <>
      {/* Lead Statuses */}
      <Section title="Lead Status" subtitle="The statuses a lead can be in.">
        {settings.leadStatuses.length === 0 ? (
          <p className="py-2 text-center text-xs text-brand-ink/40">No statuses yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {settings.leadStatuses.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink"
              >
                {s.name}
                <button
                  onClick={() =>
                    updateSetting(
                      'leadStatuses',
                      settings.leadStatuses.filter((x) => x.id !== s.id)
                    )
                  }
                  className="rounded-full p-0.5 text-rose-500 hover:bg-rose-50"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addStatus()}
            placeholder="Add new status..."
            className="flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
          <button
            onClick={addStatus}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </Section>

      {/* Categories */}
      <Section title="Lead Categories" subtitle="Categories used to classify leads.">
        {settings.categories.length === 0 ? (
          <p className="py-2 text-center text-xs text-brand-ink/40">No categories yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {settings.categories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink"
              >
                {c}
                <button
                  onClick={() =>
                    updateSetting(
                      'categories',
                      settings.categories.filter((x) => x !== c)
                    )
                  }
                  className="rounded-full p-0.5 text-rose-500 hover:bg-rose-50"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            placeholder="Add new category..."
            className="flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
          <button
            onClick={addCategory}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </Section>

      {/* Sources */}
      <Section title="Lead Sources" subtitle="Where leads come from.">
        {settings.sources.length === 0 ? (
          <p className="py-2 text-center text-xs text-brand-ink/40">No sources yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {settings.sources.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink"
              >
                {c}
                <button
                  onClick={() =>
                    updateSetting(
                      'sources',
                      settings.sources.filter((x) => x !== c)
                    )
                  }
                  className="rounded-full p-0.5 text-rose-500 hover:bg-rose-50"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSource()}
            placeholder="Add new source..."
            className="flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
          <button
            onClick={addSource}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </Section>

      {/* Stages */}
      <Section title="Lead Stages" subtitle="Stages in your sales pipeline.">
        {settings.stages.length === 0 ? (
          <p className="py-2 text-center text-xs text-brand-ink/40">No stages yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {settings.stages.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink"
              >
                {c}
                <button
                  onClick={() =>
                    updateSetting(
                      'stages',
                      settings.stages.filter((x) => x !== c)
                    )
                  }
                  className="rounded-full p-0.5 text-rose-500 hover:bg-rose-50"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newStage}
            onChange={(e) => setNewStage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addStage()}
            placeholder="Add new stage..."
            className="flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
          <button
            onClick={addStage}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </Section>

      {/* Custom Fields */}
      <Section title="Custom Fields" subtitle="Extra fields for leads.">
        {settings.customFields.length === 0 ? (
          <p className="py-2 text-center text-xs text-brand-ink/40">
            No custom fields yet.
          </p>
        ) : (
          settings.customFields.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between border-b border-brand-lilac/60 py-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-semibold text-brand-ink">{f.name}</p>
                <p className="text-xs text-brand-ink/50">Type: {f.type}</p>
              </div>
              <button
                onClick={() =>
                  updateSetting(
                    'customFields',
                    settings.customFields.filter((x) => x.id !== f.id)
                  )
                }
                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input
            value={newField.name}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            placeholder="Field name"
            className="rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          />
          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            className="rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
          >
            <option>Text</option>
            <option>Number</option>
            <option>Date</option>
            <option>Dropdown</option>
            <option>Checkbox</option>
          </select>
          <button
            onClick={addField}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={12} /> Add Field
          </button>
        </div>
      </Section>

      {/* Rules */}
      <Section title="Rules" subtitle="Automation and workflow rules.">
        <ToggleRow
          label="Workflow Rules"
          desc="Enforce stage transitions and required fields."
          value={settings.workflow}
          onChange={(v) => updateSetting('workflow', v)}
          icon={Workflow}
        />
        <ToggleRow
          label="Notification Rules"
          desc="Alert assignee when a lead is assigned."
          value={settings.notifyOnAssign}
          onChange={(v) => updateSetting('notifyOnAssign', v)}
          icon={Bell}
        />
        <ToggleRow
          label="Follow-Up Rules"
          desc="Auto-create follow-ups after N days of inactivity."
          value={settings.autoFollowUp}
          onChange={(v) => updateSetting('autoFollowUp', v)}
          icon={Clock}
        />
        <ToggleRow
          label="Calling Rules"
          desc="Enforce calling hours and retry limits."
          value={settings.callingRules}
          onChange={(v) => updateSetting('callingRules', v)}
          icon={Phone}
        />
      </Section>
    </>
  );
}

/* ================= TAB: PLATFORM ================= */
function PlatformTab({ settings, updateSetting }) {
  const [showWebhookModal, setShowWebhookModal] = useState(false);

  const deleteWebhook = (id) => {
    updateSetting(
      'webhooks',
      settings.webhooks.filter((w) => w.id !== id)
    );
  };

  return (
    <>
      <Section
        title="Platform Preferences"
        subtitle="Configure behaviour across every website you manage."
      >
        <ToggleRow
          label="Allow New Website Signups"
          desc="Let businesses self-onboard onto the platform."
          value={settings.signup}
          onChange={(v) => updateSetting('signup', v)}
          icon={Plus}
        />
        <ToggleRow
          label="Auto-Assign Leads"
          desc="Distribute incoming leads round-robin to active agents."
          value={settings.autoAssign}
          onChange={(v) => updateSetting('autoAssign', v)}
          icon={Users}
        />
        <ToggleRow
          label="IVR Fallback"
          desc="Route missed IVR calls to the next available agent."
          value={settings.ivrFallback}
          onChange={(v) => updateSetting('ivrFallback', v)}
          icon={Phone}
        />
        <ToggleRow
          label="Maintenance Mode"
          desc="Put the entire platform into read-only mode."
          value={settings.maintenance}
          onChange={(v) => updateSetting('maintenance', v)}
          icon={AlertTriangle}
        />
      </Section>

      <Section
        title="Default Settings for New Websites"
        subtitle="Applied when a new website is added."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Default Plan"
            options={['Starter', 'Growth', 'Business']}
            defaultValue="Starter"
          />
          <SelectField
            label="Default Region"
            options={['India', 'US East', 'EU West', 'APAC']}
            defaultValue="India"
          />
          <InputField label="Trial Period (days)" defaultValue="14" type="number" />
          <InputField label="Max Agents per Website" defaultValue="50" type="number" />
        </div>
      </Section>

      <Section
        title="Webhooks"
        subtitle="Notify external services when events occur."
      >
        {settings.webhooks.length === 0 ? (
          <p className="py-2 text-center text-xs text-brand-ink/40">
            No webhooks configured.
          </p>
        ) : (
          settings.webhooks.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between border-b border-brand-lilac/60 py-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-sm text-brand-ink">{w.url}</p>
                <p className="text-xs text-brand-ink/50">Event: {w.event}</p>
              </div>
              <button
                onClick={() => deleteWebhook(w.id)}
                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
        <button
          onClick={() => setShowWebhookModal(true)}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-lilac px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
        >
          <Plus size={14} /> Add Webhook
        </button>
      </Section>

      {showWebhookModal && (
        <AddWebhookModal
          onClose={() => setShowWebhookModal(false)}
          onSubmit={(data) => {
            updateSetting('webhooks', [
              ...settings.webhooks,
              { id: Date.now(), ...data },
            ]);
            setShowWebhookModal(false);
          }}
        />
      )}
    </>
  );
}

/* ================= TAB: SYSTEM SETTINGS ================= */
function SystemSettingsTab({ settings, updateSetting }) {
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [backupToast, setBackupToast] = useState(false);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setUploadedLogo(evt.target.result);
      updateSetting('logo', 'uploaded');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setUploadedLogo(null);
    updateSetting('logo', 'EI');
  };

  const backupNow = () => {
    setBackupToast(true);
    setTimeout(() => setBackupToast(false), 2200);
  };

  return (
    <>
      <Section title="CRM Identity" subtitle="Basic platform branding and info.">
        <div className="flex items-center gap-4">
          {uploadedLogo ? (
            <img
              src={uploadedLogo}
              alt="Logo"
              className="h-16 w-16 rounded-2xl object-cover shadow-card"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-magenta text-xl font-bold text-white shadow-card">
              EI
            </div>
          )}
          <div>
            <p className="text-xs text-brand-ink/50">Current Logo</p>
            <div className="mt-1 flex gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-lilac px-3 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
                <Upload size={12} /> Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={removeLogo}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="CRM Name" defaultValue="Eliteinova CRM" />
          <InputField
            label="Company Name"
            defaultValue="Eliteinova Global Pvt Ltd"
          />
          <InputField label="Default Timezone" defaultValue="IST (GMT+5:30)" />
          <InputField label="Business Hours" defaultValue="09:00 – 19:00" />
        </div>
      </Section>

      <Section title="Email Settings" subtitle="Outbound email configuration.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="From Address"
            defaultValue="noreply@eliteinova.com"
            type="email"
          />
          <InputField label="SMTP Host" defaultValue="smtp.sendgrid.net" />
          <InputField label="SMTP Port" defaultValue="587" type="number" />
          <SelectField
            label="Encryption"
            options={['TLS', 'SSL', 'None']}
            defaultValue="TLS"
          />
        </div>
      </Section>

      <Section title="SMS Settings" subtitle="Sender IDs and gateway.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="Sender ID" defaultValue="ELITEINV" />
          <SelectField
            label="SMS Provider"
            options={['Twilio', 'Exotel', 'Plivo', 'Knowlarity']}
            defaultValue="Twilio"
          />
        </div>
      </Section>

      <Section title="Calling Settings" subtitle="Voice provider and defaults.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Telephony Provider"
            options={['Exotel', 'Twilio', 'Plivo']}
            defaultValue="Exotel"
          />
          <SelectField
            label="Default Recording"
            options={['Enabled', 'Disabled']}
            defaultValue="Enabled"
          />
          <InputField
            label="Max Call Duration (min)"
            defaultValue="30"
            type="number"
          />
          <InputField label="Retry Attempts" defaultValue="3" type="number" />
        </div>
      </Section>

      <Section title="Storage Settings" subtitle="Where files and recordings are stored.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Storage Region"
            options={[
              'ap-south-1 (Mumbai)',
              'us-east-1 (Virginia)',
              'eu-west-1 (Ireland)',
            ]}
            defaultValue="ap-south-1 (Mumbai)"
          />
          <SelectField
            label="Storage Class"
            options={['Standard', 'Infrequent Access', 'Archive']}
            defaultValue="Standard"
          />
        </div>
      </Section>

      <Section title="Backup Settings" subtitle="Automated backups of your data.">
        <ToggleRow
          label="Enable Automatic Backups"
          desc="Backups run on the schedule you set below."
          value={settings.backupEnabled}
          onChange={(v) => updateSetting('backupEnabled', v)}
          icon={HardDrive}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Backup Frequency"
            options={['Hourly', 'Daily', 'Weekly', 'Monthly']}
            defaultValue="Daily"
          />
          <InputField label="Retention (days)" defaultValue="30" type="number" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
            <Download size={12} /> Download Latest Backup
          </button>
          <button
            onClick={backupNow}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-magenta px-3 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            {backupToast ? (
              <>
                <Check size={12} /> Backup Started
              </>
            ) : (
              <>
                <RefreshCw size={12} /> Backup Now
              </>
            )}
          </button>
        </div>
      </Section>

      <Section title="Security Settings" subtitle="Platform-wide security policies.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Min Password Length"
            defaultValue="12"
            type="number"
          />
          <InputField
            label="Max Login Attempts"
            defaultValue="5"
            type="number"
          />
          <InputField
            label="Session Timeout (min)"
            defaultValue="30"
            type="number"
          />
          <SelectField
            label="Password Expiry"
            options={['30 days', '60 days', '90 days', 'Never']}
            defaultValue="90 days"
          />
        </div>
      </Section>
    </>
  );
}

/* ================= TAB: NOTIFICATIONS ================= */
function NotificationsTab({ settings, updateSetting }) {
  return (
    <>
      <Section title="Delivery Channels" subtitle="How you receive notifications.">
        <ToggleRow
          label="Email Notifications"
          desc="Send alerts to your registered email."
          value={settings.email}
          onChange={(v) => updateSetting('email', v)}
          icon={Mail}
        />
        <ToggleRow
          label="SMS Notifications"
          desc="Text messages for urgent alerts only."
          value={settings.sms}
          onChange={(v) => updateSetting('sms', v)}
          icon={Phone}
        />
        <ToggleRow
          label="Push Notifications"
          desc="Browser and mobile push notifications."
          value={settings.push}
          onChange={(v) => updateSetting('push', v)}
          icon={Bell}
        />
      </Section>

      <Section title="What to Notify" subtitle="Choose which events trigger alerts.">
        <ToggleRow
          label="New Lead Assigned"
          desc="When a new lead is assigned to you."
          value={settings.newLead}
          onChange={(v) => updateSetting('newLead', v)}
          icon={Users}
        />
        <ToggleRow
          label="Missed Call Alerts"
          desc="When an inbound call goes unanswered."
          value={settings.missedCall}
          onChange={(v) => updateSetting('missedCall', v)}
          icon={Phone}
        />
        <ToggleRow
          label="Weekly Summary"
          desc="Every Monday at 9 AM — your team's performance."
          value={settings.weekly}
          onChange={(v) => updateSetting('weekly', v)}
          icon={Zap}
        />
        <ToggleRow
          label="Billing & Invoices"
          desc="Payment confirmations and plan changes."
          value={settings.billing}
          onChange={(v) => updateSetting('billing', v)}
          icon={CreditCard}
        />
      </Section>
    </>
  );
}

/* ================= TAB: APPEARANCE ================= */
function AppearanceTab({ settings, updateSetting }) {
  const accents = [
    { key: 'purple', label: 'Purple', color: '#8B2FD6' },
    { key: 'magenta', label: 'Magenta', color: '#E31C79' },
    { key: 'teal', label: 'Teal', color: '#26A69A' },
    { key: 'blue', label: 'Blue', color: '#3B82F6' },
    { key: 'amber', label: 'Amber', color: '#F59E0B' },
  ];

  return (
    <>
      <Section title="Theme" subtitle="Choose how the CRM looks.">
        <div className="grid grid-cols-3 gap-3">
          {['light', 'dark', 'auto'].map((t) => (
            <button
              key={t}
              onClick={() => updateSetting('theme', t)}
              className={`rounded-xl border-2 p-4 text-center capitalize transition-all ${
                settings.theme === t
                  ? 'border-brand-purple bg-brand-lilac/40'
                  : 'border-brand-lilac hover:border-brand-purple/40'
              }`}
            >
              <div
                className={`mx-auto mb-2 h-12 w-16 rounded-lg ${
                  t === 'light'
                    ? 'border border-gray-200 bg-white'
                    : t === 'dark'
                    ? 'bg-gray-900'
                    : 'bg-gradient-to-r from-white to-gray-900'
                }`}
              />
              <p className="text-sm font-semibold text-brand-ink">{t}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Accent Color" subtitle="Pick the primary color across the UI.">
        <div className="flex flex-wrap gap-3">
          {accents.map((a) => (
            <button
              key={a.key}
              onClick={() => updateSetting('accent', a.key)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                settings.accent === a.key
                  ? 'border-brand-purple'
                  : 'border-transparent hover:border-brand-lilac'
              }`}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: a.color }}
              />
              {a.label}
              {settings.accent === a.key && (
                <Check size={14} className="text-brand-purple" />
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Layout Density" subtitle="Adjust spacing across the interface.">
        <ToggleRow
          label="Compact Mode"
          desc="Reduce padding and row height for dense data views."
          value={settings.compact}
          onChange={(v) => updateSetting('compact', v)}
          icon={Palette}
        />
      </Section>
    </>
  );
}

/* ================= TAB: BILLING ================= */
function BillingTab({ settings, updateSetting }) {
  const { activeWebsite } = useAuth();
  const [showCardModal, setShowCardModal] = useState(false);

  return (
    <>
      <Section title="Current Plan" subtitle="Your active subscription details.">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-brand-purple/10 to-brand-magenta/10 p-4">
          <div>
            <p className="font-display text-lg font-semibold text-brand-ink">
              {activeWebsite?.plan || 'Business'} Plan
            </p>
            <p className="text-sm text-brand-ink/50">
              Renews on {activeWebsite?.expiresOn || '30 Nov 2026'}
            </p>
          </div>
          <button className="rounded-lg bg-brand-button px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
            Upgrade
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Websites', value: '3 / 5' },
            { label: 'Agents', value: '12 / 50' },
            { label: 'Leads/mo', value: '2,340 / ∞' },
            { label: 'Storage', value: '4.2 GB / 20 GB' },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-brand-lilac p-3 text-center"
            >
              <p className="text-xs text-brand-ink/50">{m.label}</p>
              <p className="mt-1 font-display text-sm font-bold text-brand-ink">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Payment Method" subtitle="Card used for recurring payments.">
        <div className="flex items-center justify-between rounded-xl border border-brand-lilac p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-[10px] font-bold text-white">
              {settings.paymentCard.brand}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-ink">
                •••• •••• •••• {settings.paymentCard.last4}
              </p>
              <p className="text-xs text-brand-ink/50">
                Expires {settings.paymentCard.expiry}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCardModal(true)}
            className="text-sm font-semibold text-brand-purple hover:underline"
          >
            Change
          </button>
        </div>
      </Section>

      <Section title="Recent Invoices" subtitle="Download past receipts.">
        {[
          { id: 'INV-2026-011', date: '01 Nov 2026', amount: '₹24,999' },
          { id: 'INV-2026-010', date: '01 Oct 2026', amount: '₹24,999' },
          { id: 'INV-2026-009', date: '01 Sep 2026', amount: '₹24,999' },
        ].map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between border-b border-brand-lilac/60 py-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-semibold text-brand-ink">{inv.id}</p>
              <p className="text-xs text-brand-ink/50">{inv.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-brand-ink">{inv.amount}</p>
              <button
                onClick={() => {
                  const blob = new Blob(
                    [`Invoice ${inv.id}\nDate: ${inv.date}\nAmount: ${inv.amount}`],
                    { type: 'text/plain' }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${inv.id}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs font-semibold text-brand-purple hover:underline"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </Section>

      {showCardModal && (
        <ChangeCardModal
          current={settings.paymentCard}
          onClose={() => setShowCardModal(false)}
          onSubmit={(card) => {
            updateSetting('paymentCard', card);
            setShowCardModal(false);
          }}
        />
      )}
    </>
  );
}

/* ================= TAB: MY ACCOUNT ================= */
function MyAccountTab({ settings, updateSetting }) {
  const { user, role, activeWebsite } = useAuth();

  const handleSignOut = () => {
    if (window.confirm('Sign out of your account?')) {
      // In a real app this would call auth.signOut()
      window.location.href = '/login';
    }
  };

  return (
    <>
      <Section title="Account Overview" subtitle="Your profile at a glance.">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-magenta text-xl font-bold text-white shadow-card">
            {user?.avatar || 'SA'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold text-brand-ink">
              {user?.name || 'Super Admin'}
            </p>
            <p className="text-sm capitalize text-brand-ink/50">
              {role} • {activeWebsite?.name || 'Eliteinova Global'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <AccountAction
            icon={User}
            label="Edit Profile"
            description="Update name, email, and phone"
          />
          <AccountAction
            icon={Shield}
            label="Security"
            description="2FA, sessions, and IP rules"
          />
          <AccountAction
            icon={Key}
            label="Change Password"
            description="Set a new password"
          />
          <AccountAction
            icon={History}
            label="Login History"
            description="See recent sign-ins"
          />
        </div>
      </Section>

      <Section title="Login History" subtitle="Recent sign-ins to your account.">
        {[
          { device: 'Chrome on Windows', ip: '192.168.1.45', location: 'Chennai, IN', time: 'Today, 10:24 AM', status: 'Success' },
          { device: 'Safari on iPhone', ip: '192.168.1.46', location: 'Chennai, IN', time: 'Yesterday, 06:12 PM', status: 'Success' },
          { device: 'Edge on Windows', ip: '10.0.0.99', location: 'Bangalore, IN', time: '5 days ago', status: 'Failed' },
        ].map((h, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-lilac/60 py-3 last:border-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand-ink">{h.device}</p>
              <p className="truncate text-xs text-brand-ink/50">
                {h.location} · {h.ip} · {h.time}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                h.status === 'Success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-rose-100 text-rose-600'
              }`}
            >
              {h.status.toUpperCase()}
            </span>
          </div>
        ))}
      </Section>

      <Section title="Danger Zone" subtitle="Sign out of your account.">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4">
          <div>
            <p className="text-sm font-semibold text-rose-700">Sign Out</p>
            <p className="text-xs text-rose-600/70">
              Log out of your account on this device.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:bg-rose-600"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </Section>
    </>
  );
}

function AccountAction({ icon: Icon, label, description }) {
  return (
    <button className="group flex items-center gap-3 rounded-xl border border-brand-lilac bg-white p-3 text-left transition-all hover:border-brand-purple/40 hover:bg-brand-lilac/30">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-lilac/50 text-brand-purple transition-transform group-hover:scale-110">
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-ink">{label}</p>
        <p className="truncate text-[11px] text-brand-ink/50">{description}</p>
      </div>
      <ChevronRight
        size={14}
        className="text-brand-ink/30 transition-transform group-hover:translate-x-0.5"
      />
    </button>
  );
}

/* ================= SIDEBAR CARDS ================= */
function InfoCard() {
  const { user, role, activeWebsite } = useAuth();
  return (
    <div className="card">
      <h3 className="font-display text-sm font-semibold text-brand-ink">
        Account Info
      </h3>
      <div className="mt-4 space-y-3 text-sm">
        <Field label="Name" value={user?.name || '—'} />
        <Field label="Role" value={role} />
        <Field label="Website" value={activeWebsite?.name || '—'} />
        <Field label="Plan" value={activeWebsite?.plan || '—'} />
        <Field label="Expires" value={activeWebsite?.expiresOn || '—'} />
      </div>
    </div>
  );
}

function SystemStatusCard() {
  const items = [
    { label: 'API', status: 'Operational', color: 'bg-emerald-500' },
    { label: 'IVR', status: 'Operational', color: 'bg-emerald-500' },
    { label: 'Database', status: 'Operational', color: 'bg-emerald-500' },
    { label: 'Webhooks', status: 'Degraded', color: 'bg-amber-500' },
  ];

  return (
    <div className="card">
      <h3 className="font-display text-sm font-semibold text-brand-ink">
        System Status
      </h3>
      <div className="mt-4 space-y-2.5">
        {items.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${s.color}`} />
              <span className="text-brand-ink/70">{s.label}</span>
            </div>
            <span className="text-xs text-brand-ink/50">{s.status}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full rounded-lg border border-brand-lilac py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
        View Status Page
      </button>
    </div>
  );
}

/* ================= MODALS ================= */
function AddWebhookModal({ onClose, onSubmit }) {
  const [url, setUrl] = useState('');
  const [event, setEvent] = useState('lead.created');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!/^https?:\/\//.test(url)) {
      setError('URL must start with http:// or https://');
      return;
    }
    onSubmit({ url: url.trim(), event });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-brand-ink">
            Add Webhook
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Webhook URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.example.com/..."
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Event
            </label>
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            >
              <option value="lead.created">lead.created</option>
              <option value="lead.updated">lead.updated</option>
              <option value="call.completed">call.completed</option>
              <option value="campaign.completed">campaign.completed</option>
              <option value="customer.created">customer.created</option>
              <option value="payment.received">payment.received</option>
            </select>
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
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Add Webhook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangeCardModal({ current, onClose, onSubmit }) {
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const digits = number.replace(/\D/g, '');
    if (digits.length < 12) {
      setError('Card number must be at least 12 digits.');
      return;
    }
    if (!/^\d{2}\/\d{4}$/.test(expiry)) {
      setError('Expiry must be in MM/YYYY format.');
      return;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      setError('CVC must be 3 or 4 digits.');
      return;
    }
    onSubmit({
      brand: digits.startsWith('4') ? 'VISA' : 'CARD',
      last4: digits.slice(-4),
      expiry,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-brand-ink">
            Change Payment Method
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-brand-lilac bg-brand-mist/40 p-3 text-xs text-brand-ink/60">
          Current: {current.brand} •••• {current.last4} · expires {current.expiry}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Card Number
            </label>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Expiry (MM/YYYY)
              </label>
              <input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="12/2027"
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                CVC
              </label>
              <input
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
              />
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
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
            >
              Update Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */
function Section({ title, subtitle, children }) {
  return (
    <div className="card space-y-4">
      <div className="border-b border-brand-lilac/60 pb-3">
        <h2 className="font-display text-base font-semibold text-brand-ink">
          {title}
        </h2>
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
      <span className="truncate text-sm font-semibold capitalize text-brand-ink">
        {value}
      </span>
    </div>
  );
}

function InputField({ label, type = 'text', defaultValue, disabled }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className={`w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/30 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15 ${
          disabled ? 'cursor-not-allowed bg-brand-lilac/30 text-brand-ink/50' : ''
        }`}
      />
    </div>
  );
}

function SelectField({ label, options = [], defaultValue }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
        {label}
      </label>
      <select
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none transition-all focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-lilac/50 text-brand-purple">
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
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 ${
          value ? 'bg-gradient-to-r from-brand-purple to-brand-magenta' : 'bg-gray-300'
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