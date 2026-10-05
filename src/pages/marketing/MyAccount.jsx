import { useState } from 'react';
import { User, Lock, Bell, Activity, Save, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'profile',      label: 'Profile',            icon: User },
  { key: 'password',     label: 'Change Password',    icon: Lock },
  { key: 'notifications',label: 'Notifications',      icon: Bell },
  { key: 'activity',     label: 'Login Activity',     icon: Activity },
];

export default function MyAccount() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profile');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">My Account</h1>
          <p className="text-sm text-brand-ink/60">Manage your profile and preferences</p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

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
                    ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-card'
                    : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        {tab === 'profile' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="flex flex-col items-center gap-3 lg:col-span-1">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-magenta to-brand-purple text-2xl font-bold text-white">
                {user?.name?.slice(0, 2).toUpperCase() || 'MK'}
              </div>
              <p className="font-display text-base font-semibold text-brand-ink">{user?.name || 'Marketing Exec'}</p>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold text-brand-purple">MARKETING</span>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Full Name" value={user?.name || ''} />
                <Field label="Email" value={user?.email || 'marketing@eliteinova.com'} />
                <Field label="Phone" value="+91 9876543210" />
                <Field label="Role" value="Marketing Executive" disabled />
              </div>
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card">
                <Save size={14} /> Save Profile
              </button>
            </div>
          </div>
        )}

        {tab === 'password' && (
          <div className="max-w-md space-y-4">
            <Field label="Current Password" type="password" />
            <Field label="New Password" type="password" />
            <Field label="Confirm New Password" type="password" />
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card">
              Update Password
            </button>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-3">
            {[
              'New lead assigned',
              'Campaign status change',
              'Lead handover updates',
              'Daily summary report',
            ].map((n) => (
              <div key={n} className="flex items-center justify-between rounded-xl border border-brand-lilac/60 p-3.5">
                <p className="text-sm font-semibold text-brand-ink">{n}</p>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30" />
              </div>
            ))}
          </div>
        )}

        {tab === 'activity' && (
          <div className="card !p-0 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[11px] font-bold uppercase tracking-wider text-brand-ink/60">
                <tr>
                  <th className="px-5 py-3">Device</th>
                  <th className="px-5 py-3">IP</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-lilac/40">
                <tr><td className="px-5 py-3">Chrome on Windows</td><td className="px-5 py-3">192.168.1.45</td><td className="px-5 py-3">Mumbai, IN</td><td className="px-5 py-3">2 min ago</td><td className="px-5 py-3 text-emerald-600 font-semibold">Success</td></tr>
                <tr><td className="px-5 py-3">Safari on iPhone</td><td className="px-5 py-3">10.0.0.12</td><td className="px-5 py-3">Mumbai, IN</td><td className="px-5 py-3">2 hrs ago</td><td className="px-5 py-3 text-emerald-600 font-semibold">Success</td></tr>
                <tr><td className="px-5 py-3">Unknown Device</td><td className="px-5 py-3">203.0.113.5</td><td className="px-5 py-3">London, UK</td><td className="px-5 py-3">3 days ago</td><td className="px-5 py-3 text-rose-600 font-semibold">Failed</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value = '', type = 'text', disabled }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink/70">{label}</label>
      <input
        type={type}
        defaultValue={value}
        disabled={disabled}
        className={`w-full rounded-xl border border-brand-lilac px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15 ${
          disabled ? 'bg-brand-mist/40 text-brand-ink/50' : 'bg-white'
        }`}
      />
    </div>
  );
}