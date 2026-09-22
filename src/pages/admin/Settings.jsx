// src/pages/admin/Settings.jsx
import { useState } from 'react';
import {
  User,
  Shield,
  Building2,
  Bell,
  Palette,
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
  Globe,
  Lock,
  MapPin,
  UserCog,
  Target,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AGENTS, LEADS } from '../../data/mockData';

/* ================= MAIN SETTINGS PAGE ================= */
export default function Settings() {
  const { role, user, activeWebsite } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'website', label: 'Website', icon: Building2 },
    { key: 'team', label: 'Team', icon: Users },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'ivr', label: 'IVR & Line', icon: Phone },
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
          <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
            <Building2 size={13} className="text-brand-purple" />
            Preferences for <span className="font-semibold text-brand-purple">{activeWebsite?.name}</span>
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
          {activeTab === 'website' && <WebsiteTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'ivr' && <IvrTab />}
          {activeTab === 'billing' && <BillingTab />}
        </div>

        {/* Sidebar: quick info */}
        <div className="space-y-6">
          <InfoCard />
          <WebsiteHealthCard />
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
      <Section title="Admin Profile" subtitle="Your personal admin account.">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-magenta text-xl font-bold text-white shadow-card">
            {user?.avatar || 'AD'}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-brand-ink">
              {user?.name || 'Admin'}
            </p>
            <p className="text-sm capitalize text-brand-ink/50">
              {role} • {activeWebsite?.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="Full Name" defaultValue={user?.name || ''} />
          <InputField label="Username / ID" defaultValue={user?.id || ''} disabled />
          <InputField
            label="Email"
            type="email"
            defaultValue="admin@eliteinova.com"
          />
          <InputField label="Phone" defaultValue="+91 62047 20000" />
        </div>
      </Section>

      <Section title="Emergency Contact" subtitle="For critical alerts.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="Contact Name" defaultValue="Supervisor" />
          <InputField label="Contact Phone" defaultValue="+91 90000 00000" />
        </div>
      </Section>
    </>
  );
}

/* ================= TAB: SECURITY ================= */
function SecurityTab() {
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showPass, setShowPass] = useState(false);

  return (
    <>
      <Section
        title="Password"
        subtitle="Last changed 30 days ago."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <InputField
              label="Current Password"
              type={showPass ? 'text' : 'password'}
              defaultValue="password"
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

      <Section
        title="Active Sessions"
        subtitle="Devices currently signed into your account."
      >
        {[
          { device: 'Chrome on Windows', location: 'Chennai, IN', current: true, time: 'Now' },
          { device: 'Safari on iPhone', location: 'Chennai, IN', current: false, time: '1 day ago' },
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

/* ================= TAB: WEBSITE ================= */
function WebsiteTab() {
  const { activeWebsite } = useAuth();
  const [autoAssign, setAutoAssign] = useState(true);
  const [roundRobin, setRoundRobin] = useState(true);
  const [autoFollowUp, setAutoFollowUp] = useState(false);

  return (
    <>
      <Section
        title="Website Details"
        subtitle="Basic information about your website."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Website Name"
            defaultValue={activeWebsite?.name || ''}
            disabled
          />
          <InputField
            label="Website ID"
            defaultValue={activeWebsite?.id || ''}
            disabled
          />
          <InputField
            label="Plan"
            defaultValue={activeWebsite?.plan || ''}
            disabled
          />
          <InputField
            label="Expires On"
            defaultValue={activeWebsite?.expiresOn || ''}
            disabled
          />
        </div>

        <div className="rounded-xl bg-brand-lilac/40 p-3 text-xs text-brand-ink/60">
          <p className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            These details are managed by your Super Admin. Contact them to make
            changes.
          </p>
        </div>
      </Section>

      <Section
        title="Lead Automation"
        subtitle="Configure how leads are handled for your website."
      >
        <ToggleRow
          label="Auto-Assign New Leads"
          desc="Automatically assign incoming leads to agents."
          value={autoAssign}
          onChange={setAutoAssign}
          icon={Zap}
        />
        <ToggleRow
          label="Round Robin Distribution"
          desc="Distribute leads equally among active agents."
          value={roundRobin}
          onChange={setRoundRobin}
          icon={Users}
        />
        <ToggleRow
          label="Auto Follow-up Reminders"
          desc="Send reminders to agents 1 hour before follow-up."
          value={autoFollowUp}
          onChange={setAutoFollowUp}
          icon={Bell}
        />
      </Section>

      <Section
        title="Working Hours"
        subtitle="Calls outside these hours go to voicemail."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="Start Time" type="time" defaultValue="09:00" />
          <InputField label="End Time" type="time" defaultValue="19:00" />
          <SelectField
            label="Working Days"
            options={['Mon – Fri', 'Mon – Sat', 'All 7 Days']}
            defaultValue="Mon – Sat"
          />
          <SelectField
            label="Timezone"
            options={['IST (UTC+5:30)', 'UTC', 'EST', 'PST']}
            defaultValue="IST (UTC+5:30)"
          />
        </div>
      </Section>
    </>
  );
}

/* ================= TAB: TEAM ================= */
function TeamTab() {
  const { activeWebsiteId } = useAuth();
  const agents = AGENTS.filter((a) => a.websiteId === activeWebsiteId);

  return (
    <>
      <Section
        title="Team Members"
        subtitle={`${agents.length} agents assigned to your website.`}
      >
        {agents.length === 0 ? (
          <div className="py-8 text-center text-sm text-brand-ink/40">
            No agents yet. Ask your Super Admin to add agents.
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 rounded-xl border border-brand-lilac p-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-xs font-bold text-white">
                  {agent.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-ink">
                    {agent.name}
                  </p>
                  <p className="truncate text-xs text-brand-ink/50">
                    {agent.phone}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    agent.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {agent.status}
                </span>
                <button className="shrink-0 rounded-lg p-2 text-brand-ink/40 hover:bg-brand-lilac">
                  <UserCog size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-brand-lilac/40 p-3 text-xs text-brand-ink/60">
          <p className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            Adding or removing agents is handled by your Super Admin.
          </p>
        </div>
      </Section>

      <Section
        title="Permissions"
        subtitle="What your team can access."
      >
        <div className="space-y-3 text-sm">
          {[
            { label: 'View Leads', enabled: true },
            { label: 'Edit Leads', enabled: true },
            { label: 'Make Calls', enabled: true },
            { label: 'Export Data', enabled: false },
            { label: 'Manage Team', enabled: false },
            { label: 'Billing Access', enabled: false },
          ].map((p) => (
            <div
              key={p.label}
              className="flex items-center justify-between border-b border-brand-lilac/60 pb-2.5 last:border-0 last:pb-0"
            >
              <span className="text-brand-ink/70">{p.label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  p.enabled
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {p.enabled ? 'ALLOWED' : 'RESTRICTED'}
              </span>
            </div>
          ))}
        </div>
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
  const [daily, setDaily] = useState(false);
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
          desc="Whenever a new lead arrives for your website."
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
          label="Daily Summary"
          desc="Every evening — daily performance recap."
          value={daily}
          onChange={setDaily}
          icon={Zap}
        />
        <ToggleRow
          label="Weekly Report"
          desc="Every Monday at 9 AM — team performance."
          value={weekly}
          onChange={setWeekly}
          icon={Zap}
        />
        <ToggleRow
          label="Billing & Invoices"
          desc="Payment confirmations and renewals."
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
  const [compact, setCompact] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);

  return (
    <>
      <Section title="Theme" subtitle="Choose how your dashboard looks.">
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

      <Section title="Layout" subtitle="Personalize your view.">
        <ToggleRow
          label="Compact Mode"
          desc="Reduce padding for denser data views."
          value={compact}
          onChange={setCompact}
          icon={Palette}
        />
        <ToggleRow
          label="Show Avatars"
          desc="Display agent avatars in tables and lists."
          value={showAvatar}
          onChange={setShowAvatar}
          icon={Users}
        />
      </Section>
    </>
  );
}

/* ================= TAB: IVR & LINE ================= */
function IvrTab() {
  const { activeWebsite } = useAuth();
  const [recordCalls, setRecordCalls] = useState(true);
  const [ivrMenu, setIvrMenu] = useState(true);
  const [autoGreeting, setAutoGreeting] = useState(true);
  const [voicemail, setVoicemail] = useState(true);

  return (
    <>
      <Section
        title="IVR Configuration"
        subtitle="Manage your inbound call line."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Active IVR Number"
            defaultValue={activeWebsite?.ivrNumber || ''}
            disabled
          />
          <InputField
            label="Fallback Number"
            defaultValue="+91 62047 20001"
          />
          <SelectField
            label="Ring Duration (seconds)"
            options={['15', '20', '30', '45', '60']}
            defaultValue="30"
          />
          <SelectField
            label="Max Queue Size"
            options={['5', '10', '15', '20', 'Unlimited']}
            defaultValue="10"
          />
        </div>
      </Section>

      <Section title="Call Settings" subtitle="Recording, greetings, and routing.">
        <ToggleRow
          label="Record All Calls"
          desc="Save recordings for quality and compliance."
          value={recordCalls}
          onChange={setRecordCalls}
          icon={Phone}
        />
        <ToggleRow
          label="Enable IVR Menu"
          desc="Press 1 for sales, 2 for support, etc."
          value={ivrMenu}
          onChange={setIvrMenu}
          icon={Zap}
        />
        <ToggleRow
          label="Auto Greeting"
          desc="Play a welcome message before connecting."
          value={autoGreeting}
          onChange={setAutoGreeting}
          icon={Bell}
        />
        <ToggleRow
          label="Voicemail Fallback"
          desc="Let callers leave a message if no agent answers."
          value={voicemail}
          onChange={setVoicemail}
          icon={Phone}
        />
      </Section>

      <Section
        title="Greeting Message"
        subtitle="What callers hear first."
      >
        <textarea
          defaultValue={`Thank you for calling ${activeWebsite?.name}. Please hold while we connect you to an agent.`}
          rows={3}
          className="w-full rounded-xl border border-brand-lilac bg-white p-3.5 text-sm text-brand-ink outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
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
      <Section title="Current Plan" subtitle="Your subscription details.">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-brand-purple/10 to-brand-magenta/10 p-4">
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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Agents', value: '12 / 50' },
            { label: 'Leads/mo', value: '2,340 / ∞' },
            { label: 'Storage', value: '1.8 GB / 10 GB' },
            { label: 'Call Minutes', value: '4,120 / 10,000' },
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

      <Section title="Recent Invoices" subtitle="Past billing history.">
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

        <div className="rounded-xl bg-brand-lilac/40 p-3 text-xs text-brand-ink/60">
          <p className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            Billing is managed by your Super Admin.
          </p>
        </div>
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

function WebsiteHealthCard() {
  const { activeWebsiteId } = useAuth();
  const agents = AGENTS.filter((a) => a.websiteId === activeWebsiteId);
  const leads = LEADS.filter((l) => l.websiteId === activeWebsiteId);
  const won = leads.filter((l) => l.status === 'Won').length;
  const conversion = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0;

  const items = [
    { label: 'Active Agents', value: agents.filter((a) => a.status === 'Active').length, total: agents.length },
    { label: 'Total Leads', value: leads.length, total: null },
    { label: 'Conversion', value: `${conversion}%`, total: null },
  ];

  return (
    <div className="card">
      <h3 className="font-display text-sm font-semibold text-brand-ink">
        Website Health
      </h3>
      <div className="mt-4 space-y-2.5">
        {items.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm">
            <span className="text-brand-ink/70">{s.label}</span>
            <span className="font-semibold text-brand-ink">
              {s.value}
              {s.total !== null && (
                <span className="text-brand-ink/40"> / {s.total}</span>
              )}
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