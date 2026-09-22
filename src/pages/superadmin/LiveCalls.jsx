import { useState } from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Users, PhoneCall } from 'lucide-react';
import StatCard from '../../components/common/StatCard';

export default function LiveCalls() {
  const [tab, setTab] = useState('incoming');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Live Calls</h1>
          <p className="text-sm text-brand-ink/50">Real-time call activity for the active IVR line.</p>
        </div>
        <button className="btn-pill">
          <PhoneCall size={14} /> {tab === 'incoming' ? 'Incoming' : 'Outgoing'} <span className="rounded-full bg-white/25 px-1.5">0</span>
        </button>
      </div>

      <div className="flex w-fit gap-6 border-b border-brand-lilac text-sm font-semibold text-brand-ink/40">
        <button onClick={() => setTab('incoming')} className={`pb-3 ${tab === 'incoming' ? 'border-b-2 border-brand-magenta text-brand-magenta' : ''}`}>Incoming</button>
        <button onClick={() => setTab('outgoing')} className={`pb-3 ${tab === 'outgoing' ? 'border-b-2 border-brand-magenta text-brand-magenta' : ''}`}>Outgoing</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={tab === 'incoming' ? PhoneIncoming : PhoneOutgoing} label="Total No. of Calls" value={0} tint="rose" />
        <StatCard icon={Users} label="Connected With Agent" value={0} tint="purple" />
        <StatCard icon={PhoneMissed} label={`Missed Calls on ${tab === 'incoming' ? 'IVR' : 'Agent'}`} value={0} tint="amber" />
        <StatCard icon={Users} label="Active In-Active Agents" value={1} tint="emerald" />
      </div>

      <div className="card flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple"><PhoneCall size={24} /></span>
        <p className="font-display text-base font-semibold text-brand-ink">No live calls right now</p>
        <p className="max-w-sm text-sm text-brand-ink/50">
          When a call connects on the active IVR number, it will appear here in real time with caller ID, agent, and duration.
        </p>
      </div>
    </div>
  );
}