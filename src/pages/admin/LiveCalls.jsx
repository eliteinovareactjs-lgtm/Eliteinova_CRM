// src/pages/admin/LiveCalls.jsx
import { useMemo, useState } from 'react';
import {
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Users, PhoneCall,
  Clock, User, Mic, Play, X,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { LEADS } from '../../data/mockData';

/* Demo live call records — scoped to the admin's website */
const SAMPLE_LIVE_CALLS = [
  { id: 'L-001', websiteId: 'eliteinova', customer: 'Ramesh Kannan', mobile: '9876543210', agent: 'Agent1', type: 'incoming', status: 'ringing', duration: '0:12' },
  { id: 'L-002', websiteId: 'eliteinova', customer: 'Kavitha Muthu', mobile: '9876543212', agent: 'Agent2', type: 'incoming', status: 'on-hold', duration: '1:05' },
  { id: 'L-003', websiteId: 'eliteinova', customer: 'Venu Gopal', mobile: '9876543213', agent: 'Agent1', type: 'outgoing', status: 'connected', duration: '4:32' },
];

export default function LiveCalls() {
  const { activeWebsiteId, activeWebsite } = useAuth();
  const [tab, setTab] = useState('incoming');
  const [selectedCall, setSelectedCall] = useState(null);

  /* ========== LIVE CALLS (scoped to this website) ========== */
  const liveCalls = useMemo(
    () =>
      SAMPLE_LIVE_CALLS.filter(
        (c) => c.websiteId === activeWebsiteId && c.type === tab
      ),
    [activeWebsiteId, tab]
  );

  /* ========== STATS ========== */
  const stats = useMemo(() => {
    const calls = SAMPLE_LIVE_CALLS.filter(
      (c) => c.websiteId === activeWebsiteId
    );
    return {
      total: calls.length,
      connected: calls.filter((c) => c.status === 'connected').length,
      missed: calls.filter((c) => c.status === 'missed').length,
      agents: new Set(calls.map((c) => c.agent)).size,
    };
  }, [activeWebsiteId]);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Live Calls
          </h1>
          <p className="text-sm text-brand-ink/50">
            Real-time calls on{' '}
            <span className="font-semibold text-brand-purple">
              {activeWebsite?.name}
            </span>{' '}
            IVR line.
          </p>
        </div>
        <button className="btn-pill">
          <PhoneCall size={14} />
          {tab === 'incoming' ? 'Incoming' : 'Outgoing'}{' '}
          <span className="rounded-full bg-white/25 px-1.5">
            {liveCalls.length}
          </span>
        </button>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex w-fit gap-6 border-b border-brand-lilac text-sm font-semibold text-brand-ink/40">
        <button
          onClick={() => setTab('incoming')}
          className={`pb-3 ${
            tab === 'incoming'
              ? 'border-b-2 border-brand-magenta text-brand-magenta'
              : ''
          }`}
        >
          Incoming
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className={`pb-3 ${
            tab === 'outgoing'
              ? 'border-b-2 border-brand-magenta text-brand-magenta'
              : ''
          }`}
        >
          Outgoing
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={tab === 'incoming' ? PhoneIncoming : PhoneOutgoing}
          label="Total No. of Calls"
          value={stats.total}
          tint="rose"
        />
        <StatCard
          icon={Users}
          label="Connected With Agent"
          value={stats.connected}
          tint="purple"
        />
        <StatCard
          icon={PhoneMissed}
          label={`Missed Calls on ${tab === 'incoming' ? 'IVR' : 'Agent'}`}
          value={stats.missed}
          tint="amber"
        />
        <StatCard
          icon={Users}
          label="Active In-Active Agents"
          value={stats.agents || 1}
          tint="emerald"
        />
      </div>

      {/* ================= LIVE CALLS LIST ================= */}
      {liveCalls.length === 0 ? (
        <div className="card flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
            <PhoneCall size={24} />
          </span>
          <p className="font-display text-base font-semibold text-brand-ink">
            No live calls right now
          </p>
          <p className="max-w-sm text-sm text-brand-ink/50">
            When a call connects on the active IVR number, it will appear here
            in real time with caller ID, agent, and duration.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {liveCalls.map((call) => (
            <div
              key={call.id}
              className="card flex flex-wrap items-center gap-3"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  call.type === 'incoming'
                    ? 'bg-emerald-50 text-emerald-500'
                    : 'bg-violet-50 text-brand-purple'
                }`}
              >
                {call.type === 'incoming' ? (
                  <PhoneIncoming size={18} />
                ) : (
                  <PhoneOutgoing size={18} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-brand-ink">
                  {call.customer}
                </p>
                <p className="truncate text-xs text-brand-ink/50">
                  {call.mobile} • Agent: {call.agent}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  call.status === 'connected'
                    ? 'bg-emerald-100 text-emerald-600'
                    : call.status === 'ringing'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {call.status}
              </span>

              <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 text-xs font-semibold text-brand-ink/60">
                <Clock size={11} />
                {call.duration}
              </span>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setSelectedCall(call)}
                  className="rounded-lg border border-brand-lilac p-2 text-brand-ink/60 hover:bg-brand-lilac/40"
                  title="View details"
                >
                  <User size={14} />
                </button>
                <button
                  className="rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta p-2 text-white shadow-card"
                  title="Join call"
                >
                  <PhoneCall size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CALL DETAILS DRAWER ================= */}
      {selectedCall && (
        <CallDetailDrawer
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
}

/* ================= CALL DETAIL DRAWER ================= */
function CallDetailDrawer({ call, onClose }) {
  const pastCalls = [
    { id: 1, type: 'inbound', duration: '2:14', date: 'Today · 9:30 AM', outcome: 'Discussed pricing' },
    { id: 2, type: 'outbound', duration: '0:52', date: 'Yesterday · 3:45 PM', outcome: 'Follow-up callback' },
    { id: 3, type: 'inbound', duration: '1:38', date: '3 days ago · 11:22 AM', outcome: 'Enquiry details' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-panel">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lilac bg-white p-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-ink">
              Call Details
            </h3>
            <p className="text-xs text-brand-ink/50">Live call</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-ink/50 hover:bg-brand-lilac"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Caller */}
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
              {call.customer
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-brand-ink">{call.customer}</p>
              <p className="text-sm text-brand-ink/50">{call.mobile}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Agent" value={call.agent} />
            <InfoBox label="Duration" value={call.duration} />
            <InfoBox label="Type" value={call.type} />
            <InfoBox label="Status" value={call.status} />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-primary">
              <PhoneCall size={16} /> Join Call
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50">
              <Mic size={16} /> Listen Live
            </button>
          </div>

          {/* Past recordings */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
                <Mic size={12} />
                Past Recordings
              </p>
              <span className="text-xs text-brand-ink/50">
                {pastCalls.length} recordings
              </span>
            </div>
            <div className="space-y-2.5">
              {pastCalls.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-xl border border-brand-lilac bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        rec.type === 'inbound'
                          ? 'bg-emerald-50 text-emerald-500'
                          : 'bg-violet-50 text-brand-purple'
                      }`}
                    >
                      {rec.type === 'inbound' ? (
                        <PhoneIncoming size={16} />
                      ) : (
                        <PhoneOutgoing size={16} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold capitalize text-brand-ink">
                        {rec.type} call
                      </p>
                      <p className="text-xs text-brand-ink/50">{rec.date}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-semibold text-brand-ink/60">
                      <Clock size={10} />
                      {rec.duration}
                    </span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card"
                      title="Play"
                    >
                      <Play size={12} fill="currentColor" />
                    </button>
                  </div>
                  <p className="mt-2 border-t border-brand-lilac/60 pt-2 text-xs text-brand-ink/60">
                    {rec.outcome}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-brand-mist p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/50">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold capitalize text-brand-ink">
        {value}
      </p>
    </div>
  );
}