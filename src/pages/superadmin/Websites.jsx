import { Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WEBSITES, statsForWebsite, AGENTS } from '../../data/mockData';

export default function Websites() {
  const { setActiveWebsiteId } = useAuth();
  const navigate = useNavigate();

  const openWebsite = (id) => {
    setActiveWebsiteId(id);
    navigate('/superadmin/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-ink">Websites</h1>
          <p className="text-sm text-brand-ink/50">Every tenant running on Eliteinova CRM.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Add Website
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {WEBSITES.map((w) => {
          const stats = statsForWebsite(w.id);
          const agentCount = AGENTS.filter((a) => a.websiteId === w.id).length;
          return (
            <div key={w.id} className="card flex flex-col">
              <div className="flex items-center justify-between">
                <p className="font-display text-base font-semibold text-brand-ink">{w.name}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  w.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {w.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-ink/50">IVR: {w.ivrNumber}</p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-brand-mist p-2">
                  <p className="font-display text-sm font-semibold text-brand-ink">{stats.totalLeads}</p>
                  <p className="text-[10px] text-brand-ink/50">Leads</p>
                </div>
                <div className="rounded-xl bg-brand-mist p-2">
                  <p className="font-display text-sm font-semibold text-brand-ink">{agentCount}</p>
                  <p className="text-[10px] text-brand-ink/50">Agents</p>
                </div>
                <div className="rounded-xl bg-brand-mist p-2">
                  <p className="font-display text-sm font-semibold text-brand-ink">{w.plan}</p>
                  <p className="text-[10px] text-brand-ink/50">Plan</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-brand-ink/40">Expires {w.expiresOn}</p>

              <button
                onClick={() => openWebsite(w.id)}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/50"
              >
                Open Dashboard <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}