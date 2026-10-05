import { FileText } from 'lucide-react';

const REPORTS = [
  { title: 'Lead Reports',        desc: 'Total leads, valid, duplicates, qualified, lost', icon: '📊', tone: 'rose' },
  { title: 'Campaign Reports',    desc: 'Campaign-wise leads, spend, CPL, conversion rate', icon: '📈', tone: 'violet' },
  { title: 'Source Reports',      desc: 'Compare Google Ads, Meta, Website, WhatsApp', icon: '🌐', tone: 'emerald' },
  { title: 'Executive Performance', desc: 'Campaigns managed, leads handed over, conversion', icon: '👤', tone: 'amber' },
  { title: 'Cost Reports',        desc: 'Ad spend, cost per lead, cost per conversion', icon: '💰', tone: 'rose' },
  { title: 'Marketing Performance', desc: 'Overall ROI and funnel analysis', icon: '🚀', tone: 'violet' },
];

export default function MarketingReports() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
          <FileText size={18} />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Marketing Reports</h1>
          <p className="text-sm text-brand-ink/60">Generate detailed analytics reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <div key={r.title} className="card group cursor-pointer transition-all hover:-translate-y-1 hover:border-brand-magenta/40">
            <div className="text-3xl">{r.icon}</div>
            <h3 className="mt-3 font-display text-sm font-bold text-brand-ink">{r.title}</h3>
            <p className="mt-1 text-xs text-brand-ink/60">{r.desc}</p>
            <button className="mt-3 text-xs font-semibold text-brand-magenta hover:underline">
              Generate &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}