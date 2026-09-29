// src/pages/agent/Performance.jsx
import { TrendingUp, PhoneCall, CalendarCheck, Target } from 'lucide-react';

const CARDS = [
  { icon: TrendingUp,    label: 'Leads Contacted',  value: 84 },
  { icon: PhoneCall,     label: 'Calls Made',       value: 132 },
  { icon: CalendarCheck, label: 'Follow-Ups Done',  value: 47 },
  { icon: Target,        label: 'Converted Leads',  value: 18 },
];

export default function Performance() {
  return (
    <div className="space-y-5">
      <h1 className="font-display text-lg font-bold text-brand-ink">
        My Performance
      </h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CARDS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
              <Icon size={16} />
            </span>
            <p className="mt-3 text-xs text-brand-ink/50">{label}</p>
            <p className="font-display text-xl font-bold text-brand-ink">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}