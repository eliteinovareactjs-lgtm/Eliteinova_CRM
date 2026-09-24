// src/pages/superadmin/Logs.jsx
import { useMemo, useState } from 'react';
import { FileText, Search, Filter } from 'lucide-react';
import { SYSTEM_LOGS, PROJECTS } from '../../data/mockData';

export default function Logs() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return SYSTEM_LOGS;
    const q = searchQuery.toLowerCase();
    return SYSTEM_LOGS.filter((l) =>
      `${l.user} ${l.action} ${l.target} ${l.role}`.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const projectName = (id) =>
    id ? PROJECTS.find((p) => p.id === id)?.name || id : '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-ink">System Logs</h1>
        <p className="text-sm text-brand-ink/50">Complete audit trail of platform activity.</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search logs..."
          className="w-full rounded-xl border border-brand-lilac bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
        />
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-brand-magenta to-brand-purple text-left text-white">
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Target</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-t border-brand-lilac/60 hover:bg-brand-mist/60">
                <td className="px-4 py-3 text-brand-ink/50 text-xs">{log.at}</td>
                <td className="px-4 py-3 text-brand-ink font-medium">{log.user}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-lilac px-2.5 py-1 text-xs font-semibold text-brand-purple capitalize">
                    {log.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-ink/70">{projectName(log.projectId)}</td>
                <td className="px-4 py-3 text-brand-ink/70">{log.action}</td>
                <td className="px-4 py-3 text-brand-ink/60 text-xs">{log.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}