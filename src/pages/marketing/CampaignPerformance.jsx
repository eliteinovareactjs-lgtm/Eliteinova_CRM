import { BarChart3, TrendingUp } from 'lucide-react';

const FUNNEL = [
  { stage: 'Leads Generated', value: 100, color: 'bg-violet-500' },
  { stage: 'Valid Leads',     value: 80,  color: 'bg-indigo-500' },
  { stage: 'Contacted',       value: 60,  color: 'bg-purple-500' },
  { stage: 'Interested',      value: 35,  color: 'bg-pink-500' },
  { stage: 'Qualified',       value: 20,  color: 'bg-orange-500' },
  { stage: 'Converted',       value: 10,  color: 'bg-emerald-500' },
];

const METRICS = [
  { label: 'Cost Per Lead',           value: '$10.08' },
  { label: 'Cost Per Qualified Lead', value: '$45.00' },
  { label: 'Cost Per Conversion',     value: '$125.00' },
  { label: 'Conversion Rate',         value: '8.5%' },
  { label: 'Revenue Generated',       value: '$45,000' },
];

export default function CampaignPerformance() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
          <BarChart3 size={18} />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Campaign Performance</h1>
          <p className="text-sm text-brand-ink/60">Funnel & cost analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-brand-ink">
            <TrendingUp size={14} className="text-brand-magenta" /> Marketing Funnel
          </h2>
          <div className="space-y-4">
            {FUNNEL.map((f) => (
              <div key={f.stage}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-brand-ink/70">{f.stage}</span>
                  <span className="font-bold text-brand-ink">{f.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-brand-lilac">
                  <div className={`h-3 rounded-full ${f.color}`} style={{ width: `${f.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 font-display text-sm font-bold text-brand-ink">Key Metrics</h2>
          <div className="space-y-3">
            {METRICS.map((m) => (
              <div key={m.label} className="flex justify-between rounded-lg bg-brand-mist/40 px-3 py-2.5 text-sm">
                <span className="text-brand-ink/70">{m.label}</span>
                <span className="font-bold text-brand-ink">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}