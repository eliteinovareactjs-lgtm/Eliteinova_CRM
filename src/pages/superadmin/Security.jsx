// src/pages/superadmin/Security.jsx
import { Shield, Lock, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Security() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-ink">Security &amp; Permissions</h1>
        <p className="text-sm text-brand-ink/50">Manage roles and access control.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">Role Permissions</h2>
          <div className="space-y-3">
            {[
              { role: 'Super Admin', scope: 'Full platform access', color: 'text-brand-magenta bg-rose-50' },
              { role: 'Admin', scope: 'Project-level management', color: 'text-brand-purple bg-violet-50' },
              { role: 'Agent', scope: 'Leads + Calls only', color: 'text-emerald-600 bg-emerald-50' },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between rounded-xl border border-brand-lilac p-4">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${r.color}`}>
                    <Shield size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-brand-ink">{r.role}</p>
                    <p className="text-xs text-brand-ink/50">{r.scope}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-brand-purple hover:underline">Edit</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">Security Features</h2>
          <div className="space-y-3">
            {[
              { label: 'Two-Factor Authentication', enabled: true },
              { label: 'IP Whitelisting', enabled: false },
              { label: 'Session Timeout', enabled: true },
              { label: 'Login Alerts', enabled: true },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-xl bg-brand-mist/60 px-4 py-3">
                <span className="text-sm text-brand-ink/70">{f.label}</span>
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  f.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {f.enabled ? <><CheckCircle2 size={10} /> ON</> : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}