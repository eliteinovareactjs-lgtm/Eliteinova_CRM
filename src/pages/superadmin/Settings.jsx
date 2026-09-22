// src/pages/superadmin/Settings.jsx
import { useState } from 'react';
import {
  User,
  Shield,
  Building2,
  Bell,
  Palette,
  Globe,
  Lock,
  CreditCard,
  Save,
  Check,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Users,
  Database,
  Zap,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ================= MAIN SETTINGS PAGE ================= */
export default function Settings() {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'platform', label: 'Platform', icon: Building2 },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Settings
          </h1>
          <p className="text-sm text-brand-ink/50">
            Manage your account, platform, and preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card"
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

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 overflow-x-auto border-b border-brand-lilac pb-3">
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
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'platform' && <PlatformTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'billing' && <BillingTab />}
        </div>

        {/* Sidebar: quick info */}
        <div className="space-y-6">
          <InfoCard />
          <SystemStatusCard />
        </div>
      </div>
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
          <InputField
            label="Email"
            type="email"
            defaultValue="superadmin@eliteinova.com"
          />
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
function SecurityTab() {
  const [twoFA, setTwoFA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);
  const [auditLog, setAuditLog] = useState(true);
  const [showPass, setShowPass] = useState(false);

  return (
    <>
      <Section
        title="Password"
        subtitle="Last changed 45 days ago. Recommended: every 90 days."
      >
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
          label="IP Restriction"
          desc="Only allow logins from whitelisted IPs."
          value={ipRestriction}
          onChange={setIpRestriction}
          icon={Globe}
        />
        <ToggleRow
          label="Audit Log"
          desc="Record every admin action for compliance."
          value={auditLog}
          onChange={setAuditLog}
          icon={Database}
        />
      </Section>

      <Section
        title="Active Sessions"
        subtitle="Devices currently signed into your account."
      >
        {[
          { device: 'Chrome on Windows', location: 'Chennai, IN', current: true, time: 'Now' },
          { device: 'Safari on iPhone', location: 'Chennai, IN', current: false, time: '2 days ago' },
          { device: 'Edge on Windows', location: 'Bangalore, IN', current: false, time: '5 days ago' },
        ].map((s, i) => (
          <div
            key={i}
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
              <button className="text-xs font-semibold text-rose-500 hover:underline">
                Revoke
              </button>
            )}
          </div>
        ))}
      </Section>
    </>
  );
}

/* ================= TAB: PLATFORM ================= */
function PlatformTab() {
  const [maintenance, setMaintenance] = useState(false);
  const [signup, setSignup] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [ivrFallback, setIvrFallback] = useState(true);

  return (
    <>
      <Section
        title="Platform Preferences"
        subtitle="Configure behaviour across every website you manage."
      >
        <ToggleRow
          label="Allow New Website Signups"
          desc="Let businesses self-onboard onto the platform."
          value={signup}
          onChange={setSignup}
          icon={Plus}
        />
        <ToggleRow
          label="Auto-Assign Leads"
          desc="Distribute incoming leads round-robin to active agents."
          value={autoAssign}
          onChange={setAutoAssign}
          icon={Users}
        />
        <ToggleRow
          label="IVR Fallback"
          desc="Route missed IVR calls to the next available agent."
          value={ivrFallback}
          onChange={setIvrFallback}
          icon={Phone}
        />
        <ToggleRow
          label="Maintenance Mode"
          desc="Put the entire platform into read-only mode."
          value={maintenance}
          onChange={setMaintenance}
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
        {[
          { url: 'https://hooks.eliteinova.com/leads', event: 'lead.created' },
          { url: 'https://hooks.eliteinova.com/calls', event: 'call.completed' },
        ].map((w, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-brand-lilac/60 py-3 last:border-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-sm text-brand-ink">{w.url}</p>
              <p className="text-xs text-brand-ink/50">Event: {w.event}</p>
            </div>
            <button className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-lilac px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
          <Plus size={14} /> Add Webhook
        </button>
      </Section>
    </>
  );
}

/* ================= TAB: NOTIFICATIONS ================= */
function NotificationsTab() {
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [push, setPush] = useState(true);
  const [newLead, setNewLead] = useState(true);
  const [missedCall, setMissedCall] = useState(true);
  const [weekly, setWeekly] = useState(true);
  const [billing, setBilling] = useState(true);

  return (
    <>
      <Section title="Delivery Channels" subtitle="How you receive notifications.">
        <ToggleRow
          label="Email Notifications"
          desc="Send alerts to your registered email."
          value={email}
          onChange={setEmail}
          icon={Mail}
        />
        <ToggleRow
          label="SMS Notifications"
          desc="Text messages for urgent alerts only."
          value={sms}
          onChange={setSms}
          icon={Phone}
        />
        <ToggleRow
          label="Push Notifications"
          desc="Browser and mobile push notifications."
          value={push}
          onChange={setPush}
          icon={Bell}
        />
      </Section>

      <Section title="What to Notify" subtitle="Choose which events trigger alerts.">
        <ToggleRow
          label="New Lead Assigned"
          desc="When a new lead is assigned to you."
          value={newLead}
          onChange={setNewLead}
          icon={Users}
        />
        <ToggleRow
          label="Missed Call Alerts"
          desc="When an inbound call goes unanswered."
          value={missedCall}
          onChange={setMissedCall}
          icon={Phone}
        />
        <ToggleRow
          label="Weekly Summary"
          desc="Every Monday at 9 AM — your team's performance."
          value={weekly}
          onChange={setWeekly}
          icon={Zap}
        />
        <ToggleRow
          label="Billing & Invoices"
          desc="Payment confirmations and plan changes."
          value={billing}
          onChange={setBilling}
          icon={CreditCard}
        />
      </Section>
    </>
  );
}

/* ================= TAB: APPEARANCE ================= */
function AppearanceTab() {
  const [theme, setTheme] = useState('light');
  const [accent, setAccent] = useState('purple');
  const [compact, setCompact] = useState(false);

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
              onClick={() => setTheme(t)}
              className={`rounded-xl border-2 p-4 text-center capitalize transition-all ${
                theme === t
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
              onClick={() => setAccent(a.key)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                accent === a.key
                  ? 'border-brand-purple'
                  : 'border-transparent hover:border-brand-lilac'
              }`}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: a.color }}
              />
              {a.label}
              {accent === a.key && (
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
          value={compact}
          onChange={setCompact}
          icon={Palette}
        />
      </Section>
    </>
  );
}

/* ================= TAB: BILLING ================= */
function BillingTab() {
  const { activeWebsite } = useAuth();

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
          <button className="rounded-lg bg-brand-button px-4 py-2 text-sm font-semibold text-white">
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
              VISA
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-ink">
                •••• •••• •••• 4242
              </p>
              <p className="text-xs text-brand-ink/50">Expires 12/2027</p>
            </div>
          </div>
          <button className="text-sm font-semibold text-brand-purple hover:underline">
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
              <button className="text-xs font-semibold text-brand-purple hover:underline">
                Download
              </button>
            </div>
          </div>
        ))}
      </Section>
    </>
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

/* ================= REUSABLE COMPONENTS ================= */
function Section({ title, subtitle, children }) {
  return (
    <div className="card space-y-4">
      <div className="border-b border-brand-lilac/60 pb-3">
        <h2 className="font-display text-base font-semibold text-brand-ink">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-brand-ink/50">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-brand-lilac/60 pb-2.5 last:border-0 last:pb-0">
      <span className="text-sm text-brand-ink/50">{label}</span>
      <span className="truncate text-sm font-semibold text-brand-ink">
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

/* ================= FIXED TOGGLE ================= */
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
          value
            ? 'bg-gradient-to-r from-brand-purple to-brand-magenta'
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