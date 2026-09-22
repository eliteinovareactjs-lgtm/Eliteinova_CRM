// src/pages/admin/Settings.jsx
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { role, user, activeWebsite } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-ink">Settings</h1>
        <p className="text-sm text-brand-ink/50">Account and website preferences.</p>
      </div>

      <div className="card max-w-xl space-y-4">
        <h2 className="font-display text-base font-semibold text-brand-ink">Profile</h2>
        <Field label="Name" value={user.name} />
        <Field label="Role" value={role} />
        <Field label="Website" value={activeWebsite?.name} />
      </div>

      <div className="card max-w-xl space-y-4">
        <h2 className="font-display text-base font-semibold text-brand-ink">
          IVR &amp; Line Settings
        </h2>
        <Field label="Active IVR Number" value={activeWebsite?.ivrNumber} />
        <Field label="Plan" value={activeWebsite?.plan} />
        <Field label="Expires On" value={activeWebsite?.expiresOn} />
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-brand-lilac/60 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-brand-ink/50">{label}</span>
      <span className="text-sm font-semibold text-brand-ink">{value}</span>
    </div>
  );
}