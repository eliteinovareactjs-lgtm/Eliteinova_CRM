import { Globe } from 'lucide-react';

const PLATFORMS = [
  { name: 'Facebook',  leads: 120, engagement: '4.5%', icon: '📘' },
  { name: 'Instagram', leads: 95,  engagement: '5.2%', icon: '📸' },
  { name: 'YouTube',   leads: 40,  engagement: '2.1%', icon: '▶️' },
  { name: 'LinkedIn',  leads: 60,  engagement: '3.8%', icon: '💼' },
  { name: 'WhatsApp',  leads: 150, engagement: '12%',  icon: '💬' },
];

export default function SocialMedia() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
          <Globe size={18} />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Social Media</h1>
          <p className="text-sm text-brand-ink/60">Leads generated across social platforms</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {PLATFORMS.map((p) => (
          <div key={p.name} className="card !p-4 text-center">
            <div className="mb-2 text-3xl">{p.icon}</div>
            <p className="font-display text-sm font-bold text-brand-ink">{p.name}</p>
            <p className="mt-1 text-xs text-brand-ink/60">Leads: <span className="font-bold text-brand-ink">{p.leads}</span></p>
            <p className="mt-0.5 text-[10px] text-emerald-600">Engagement: {p.engagement}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-sm font-bold text-brand-ink">Recent Social Leads</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[11px] font-bold uppercase tracking-wider text-brand-ink/60">
            <tr>
              <th className="px-4 py-2">Platform</th>
              <th className="px-4 py-2">Post / Content</th>
              <th className="px-4 py-2">Leads</th>
              <th className="px-4 py-2">Qualified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-lilac/40">
            <tr><td className="px-4 py-3">Facebook</td><td className="px-4 py-3">Summer Sale Carousel</td><td className="px-4 py-3">45</td><td className="px-4 py-3">12</td></tr>
            <tr><td className="px-4 py-3">Instagram</td><td className="px-4 py-3">Reel - Product Demo</td><td className="px-4 py-3">32</td><td className="px-4 py-3">8</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}