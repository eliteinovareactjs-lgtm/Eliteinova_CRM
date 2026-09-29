// src/pages/agent/Account.jsx
import { useAuth } from '../../context/AuthContext';

export default function Account() {
  const { user, role, activeWebsite } = useAuth();

  return (
    <div className="card space-y-3">
      <h2 className="font-display text-base font-semibold text-brand-ink">
        My Account
      </h2>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <Row label="Name"    value={user?.name || 'Agent'} />
        <Row label="Role"    value={role} />
        <Row label="Project" value={activeWebsite?.name || '—'} />
        <Row label="Status"  value="Online" />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-brand-lilac/60 pb-2">
      <span className="text-brand-ink/50">{label}</span>
      <span className="font-medium capitalize text-brand-ink">{value}</span>
    </div>
  );
}