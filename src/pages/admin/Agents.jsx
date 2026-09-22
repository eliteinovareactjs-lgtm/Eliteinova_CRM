// src/pages/admin/Agents.jsx
import { useState } from 'react';
import { Plus, Phone, Users2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AGENTS } from '../../data/mockData';

export default function Agents() {
  const { activeWebsiteId } = useAuth();
  const [agents] = useState(
    AGENTS.filter((a) => a.websiteId === activeWebsiteId)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">
            Agents
          </h1>
          <p className="text-sm text-brand-ink/50">
            Manage calling agents for this website.
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent.id} className="card">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-button text-sm font-bold text-white">
                {agent.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <div>
                <p className="font-semibold text-brand-ink">{agent.name}</p>
                <p className="text-xs text-brand-ink/50">{agent.phone}</p>
              </div>
              <span
                className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${
                  agent.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                {agent.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-brand-mist p-3">
                <p className="font-display text-lg font-semibold text-brand-ink">
                  {agent.leadsAssigned}
                </p>
                <p className="text-xs text-brand-ink/50">Leads Assigned</p>
              </div>
              <div className="rounded-xl bg-brand-mist p-3">
                <p className="font-display text-lg font-semibold text-brand-ink">
                  {agent.callsToday}
                </p>
                <p className="text-xs text-brand-ink/50">Calls Today</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/50">
                <Phone size={14} /> Call
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/50">
                <Users2 size={14} /> View Leads
              </button>
            </div>
          </div>
        ))}

        {agents.length === 0 && (
          <div className="col-span-full card flex flex-col items-center justify-center gap-2 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lilac text-brand-purple">
              <Users2 size={22} />
            </span>
            <p className="font-display text-base font-semibold text-brand-ink">
              No agents yet
            </p>
            <p className="max-w-sm text-sm text-brand-ink/50">
              Add your first calling agent to start assigning leads for this
              website.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}