// src/pages/admin/ProjectSettings.jsx
import { useState } from 'react';
import {
  Building2, Globe, Clock, Bell, Phone, Shield, Save, Check, X,
  AlertCircle, CheckCircle2, Info, Users, Layers, Tag, ListFilter,
  GitBranch, Database, MessageSquare, Upload, Palette, Percent,
  Mail, MapPin, Calendar, Zap, Lock, Eye, EyeOff, Plus, Trash2,
  Settings as SettingsIcon, FileText, Smartphone, CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'profile', label: 'Project Profile', icon: Building2 },
  { key: 'business', label: 'Business Hours', icon: Clock },
  { key: 'workflow', label: 'Workflow', icon: GitBranch },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'calling', label: 'Calling', icon: Phone },
  { key: 'permissions', label: 'Permissions', icon: Shield },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProjectSettings() {
  const { activeWebsite, activeWebsiteId } = useAuth();
  const [tab, setTab] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ========== PROFILE STATE ========== */
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

  /* ========== BUSINESS HOURS ========== */
  const [hours, setHours] = useState(
    DAYS.map((d) => ({
      day: d,
      enabled: d !== 'Sunday',
      from: '09:00',
      to: '18:00',
    }))
  );

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
  });

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
    showToast('Settings saved successfully');
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
            Configure settings for{' '}
            <span className="font-semibold text-brand-purple">
              {activeWebsite?.name}
            </span>
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:brightness-110"
        >
          <Save size={16} /> Save Changes
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

      {/* TAB CONTENT */}
      {tab === 'profile' && (
        <ProfileTab profile={profile} setProfile={setProfile} />
      )}
      {tab === 'business' && (
        <BusinessHoursTab hours={hours} setHours={setHours} />
      )}
      {tab === 'workflow' && (
        <WorkflowTab workflow={workflow} setWorkflow={setWorkflow} />
      )}
      {tab === 'notifications' && (
        <NotificationsTab
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
      {tab === 'calling' && (
        <CallingTab calling={calling} setCalling={setCalling} />
      )}
      {tab === 'permissions' && (
        <PermissionsTab
          permissions={permissions}
          setPermissions={setPermissions}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

/* ================= PROFILE TAB ================= */
function ProfileTab({ profile, setProfile }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Logo card */}
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Palette size={14} className="text-brand-purple" />
          Project Logo
        </h3>
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-brand-lilac bg-gradient-to-br from-brand-lilac/30 to-brand-mist">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt="logo"
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <Building2 size={32} className="text-brand-purple" />
            )}
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-brand-lilac bg-white px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40">
            <Upload size={12} /> Upload Logo
          </button>
          <p className="text-[10px] text-brand-ink/40">
            PNG or JPG, max 2MB. Recommended 512×512.
          </p>
        </div>
      </div>

      {/* General info */}
      <div className="card !p-5 space-y-4 lg:col-span-2">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Building2 size={14} className="text-brand-purple" />
          General Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Project Name"
            value={profile.name}
            onChange={(v) => setProfile({ ...profile, name: v })}
          />
          <Field
            label="Legal Name"
            value={profile.legalName}
            onChange={(v) => setProfile({ ...profile, legalName: v })}
          />
          <Field
            label="Support Email"
            value={profile.email}
            onChange={(v) => setProfile({ ...profile, email: v })}
            icon={Mail}
          />
          <Field
            label="Support Phone"
            value={profile.phone}
            onChange={(v) => setProfile({ ...profile, phone: v })}
            icon={Phone}
          />
          <Field
            label="Website"
            value={profile.website}
            onChange={(v) => setProfile({ ...profile, website: v })}
            icon={Globe}
          />
          <Field
            label="Timezone"
            value={profile.timezone}
            onChange={(v) => setProfile({ ...profile, timezone: v })}
            icon={Clock}
          />
          <Field
            label="Currency"
            value={profile.currency}
            onChange={(v) => setProfile({ ...profile, currency: v })}
          />
          <Field
            label="Language"
            value={profile.language}
            onChange={(v) => setProfile({ ...profile, language: v })}
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Address
            </label>
            <textarea
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              rows={2}
              className="w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= BUSINESS HOURS TAB ================= */
function BusinessHoursTab({ hours, setHours }) {
  const toggleDay = (day) => {
    setHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, enabled: !h.enabled } : h))
    );
  };
  const updateHour = (day, key, value) => {
    setHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, [key]: value } : h))
    );
  };

  return (
    <div className="card !p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-brand-purple" />
        <h3 className="font-display text-sm font-semibold text-brand-ink">
          Business Hours
        </h3>
        <span className="text-xs text-brand-ink/40">
          · When your team is available
        </span>
      </div>

      <div className="space-y-2">
        {hours.map((h) => (
          <div
            key={h.day}
            className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-all ${
              h.enabled
                ? 'border-brand-lilac bg-white'
                : 'border-brand-lilac/40 bg-brand-mist/30 opacity-60'
            }`}
          >
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={h.enabled}
                onChange={() => toggleDay(h.day)}
                className="h-4 w-4 rounded border-brand-lilac text-brand-purple focus:ring-brand-purple/30"
              />
              <span className="w-20 text-sm font-semibold text-brand-ink">
                {h.day}
              </span>
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
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                OPEN
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                CLOSED
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="flex items-start gap-2 text-xs text-amber-700">
          <Info size={14} className="mt-0.5 shrink-0" />
          Outside business hours, calls will be routed to voicemail and
          follow-ups will be scheduled for the next business day.
        </p>
      </div>
    </div>
  );
}

/* ================= WORKFLOW TAB ================= */
function WorkflowTab({ workflow, setWorkflow }) {
  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Users size={14} className="text-brand-purple" />
          Lead Assignment
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
              <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
                Assignment Method
              </label>
              <select
                value={workflow.assignmentMethod}
                onChange={(e) =>
                  setWorkflow({
                    ...workflow,
                    assignmentMethod: e.target.value,
                  })
                }
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
              onChange={(v) =>
                setWorkflow({ ...workflow, maxLeadsPerAgent: v })
              }
            />
          </div>
        )}
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Calendar size={14} className="text-brand-purple" />
          Follow-up Rules
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
          onChange={(v) =>
            setWorkflow({ ...workflow, requireCallDisposition: v })
          }
        />

        <ToggleRow
          label="Allow lead reassignment"
          desc="Admins can reassign leads between agents"
          value={workflow.allowReassignment}
          onChange={(v) =>
            setWorkflow({ ...workflow, allowReassignment: v })
          }
        />
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Database size={14} className="text-brand-purple" />
          Duplicate Detection
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
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
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
    </div>
  );
}

/* ================= NOTIFICATIONS TAB ================= */
function NotificationsTab({ notifications, setNotifications }) {
  const events = [
    { key: 'newLead', label: 'New Lead Created', icon: Zap },
    { key: 'missedCall', label: 'Missed Call', icon: Phone },
    { key: 'followUpDue', label: 'Follow-up Due', icon: Calendar },
    { key: 'assignment', label: 'Lead Assigned', icon: Users },
    { key: 'campaignComplete', label: 'Campaign Complete', icon: Bell },
    { key: 'dailyDigest', label: 'Daily Digest', icon: MessageSquare },
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
        <h3 className="font-display text-sm font-semibold text-brand-ink">
          Notification Preferences
        </h3>
        <span className="text-xs text-brand-ink/40">
          · Choose how you want to be notified
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-brand-lilac">
              <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
                Event
              </th>
              <th className="pb-3 text-center text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
                Email
              </th>
              <th className="pb-3 text-center text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
                SMS
              </th>
              <th className="pb-3 text-center text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
                Push
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map(({ key, label, icon: Icon }) => (
              <tr
                key={key}
                className="border-b border-brand-lilac/40 last:border-0"
              >
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
                          ? 'bg-gradient-to-r from-brand-purple to-brand-magenta'
                          : 'bg-brand-lilac'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          notifications[key][ch]
                            ? 'translate-x-6'
                            : 'translate-x-1'
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

/* ================= CALLING TAB ================= */
function CallingTab({ calling, setCalling }) {
  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Phone size={14} className="text-brand-purple" />
          Telephony Settings
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Telephony Provider
            </label>
            <select
              value={calling.provider}
              onChange={(e) =>
                setCalling({ ...calling, provider: e.target.value })
              }
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
            onChange={(v) =>
              setCalling({ ...calling, maxConcurrentCalls: v })
            }
          />
        </div>
      </div>

      <div className="card !p-5 space-y-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
          <Smartphone size={14} className="text-brand-purple" />
          Auto Dialer
        </h3>
        <ToggleRow
          label="Enable auto dialer"
          desc="Automatically dial the next lead after each call"
          value={calling.autoDialer}
          onChange={(v) => setCalling({ ...calling, autoDialer: v })}
        />
        {calling.autoDialer && (
          <div className="pl-4">
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">
              Dialer Mode
            </label>
            <div className="flex flex-wrap gap-2">
              {['Predictive', 'Progressive', 'Preview', 'Manual'].map((m) => (
                <button
                  key={m}
                  onClick={() => setCalling({ ...calling, dialerMode: m })}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    calling.dialerMode === m
                      ? 'border-brand-purple bg-brand-lilac/40 text-brand-purple'
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
          <FileText size={14} className="text-brand-purple" />
          Call Recording
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
              onChange={(v) =>
                setCalling({ ...calling, recordingRetention: v })
              }
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

/* ================= PERMISSIONS TAB ================= */
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
      {groups.map((group) => (
        <div key={group.title} className="card !p-5 space-y-4">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-brand-ink">
            <group.icon size={14} className="text-brand-purple" />
            {group.title}
          </h3>
          <div className="space-y-3">
            {group.items.map((item) => (
              <ToggleRow
                key={item.key}
                label={item.label}
                desc={item.desc}
                value={permissions[item.key]}
                onChange={(v) =>
                  setPermissions({ ...permissions, [item.key]: v })
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= SHARED COMPONENTS ================= */
function Field({ label, value, onChange, type = 'text', icon: Icon }) {
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
          type={type}
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