export default function StatCard({ icon: Icon, label, value, tint = 'rose', trend }) {
  const tints = {
    rose: 'bg-rose-50 text-brand-magenta',
    purple: 'bg-violet-50 text-brand-purple',
    amber: 'bg-amber-50 text-amber-500',
    emerald: 'bg-emerald-50 text-emerald-500',
  };

  return (
    <div className="card flex items-start gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tints[tint]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-brand-ink/50">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-brand-ink">{value}</p>
        {trend && <p className="mt-1 text-xs font-medium text-emerald-500">{trend}</p>}
      </div>
    </div>
  );
}