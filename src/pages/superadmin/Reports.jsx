import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { DAILY_CALL_TREND } from '../../data/mockData';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Reports</h1>
          <p className="text-sm text-brand-ink/50">Call and lead performance over time.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-brand-lilac px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="card">
        <h2 className="mb-4 font-display text-base font-semibold text-brand-ink">Call Volume Trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DAILY_CALL_TREND}>
              <CartesianGrid vertical={false} stroke="#F1E4FB" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8b7a9e' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="calls" stroke="#8B2FD6" strokeWidth={3} dot={{ fill: '#E31C79', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-base font-semibold text-brand-ink">Lead Conversion</h2>
          <p className="text-sm text-brand-ink/50">
            Connect a telephony/CRM backend to populate conversion rate, average handling time, and agent scorecards here.
          </p>
        </div>
        <div className="card">
          <h2 className="mb-3 font-display text-base font-semibold text-brand-ink">Follow-up Compliance</h2>
          <p className="text-sm text-brand-ink/50">
            Track how many follow-ups were completed on time versus missed, per agent and per source.
          </p>
        </div>
      </div>
    </div>
  );
}