import { Plus, CheckSquare } from 'lucide-react';

const TASKS = [
  { id: 1, task: 'Review Google Ads Leads',       due: 'Today',     priority: 'High',   status: 'Pending' },
  { id: 2, task: 'Validate Facebook Leads',       due: 'Today',     priority: 'Medium', status: 'In Progress' },
  { id: 3, task: 'Handover Qualified Leads',      due: 'Tomorrow',  priority: 'High',   status: 'Pending' },
  { id: 4, task: 'Update Campaign Budget',        due: 'Yesterday', priority: 'Low',    status: 'Overdue' },
  { id: 5, task: 'Social Media Posting',          due: 'Today',     priority: 'Medium', status: 'Completed' },
];

const PRIORITY = {
  High:   'bg-rose-100 text-brand-magenta',
  Medium: 'bg-amber-100 text-amber-600',
  Low:    'bg-emerald-100 text-emerald-600',
};
const STATUS = {
  Pending:     'bg-blue-100 text-blue-600',
  'In Progress': 'bg-violet-100 text-brand-purple',
  Completed:   'bg-emerald-100 text-emerald-600',
  Overdue:     'bg-rose-100 text-brand-magenta',
};

export default function MarketingTasks() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-white shadow-sm">
            <CheckSquare size={18} />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">Marketing Tasks</h1>
            <p className="text-sm text-brand-ink/60">{TASKS.length} tasks</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card">
          <Plus size={14} /> New Task
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {['Pending', 'In Progress', 'Completed', 'Overdue'].map((s) => (
          <div key={s} className="card !p-4">
            <p className="text-[11px] uppercase tracking-wider text-brand-ink/50">{s}</p>
            <p className="mt-1 font-display text-2xl font-bold text-brand-ink">
              {TASKS.filter((t) => t.status === s).length}
            </p>
          </div>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-lilac/60 bg-brand-mist/40 text-[11px] font-bold uppercase tracking-wider text-brand-ink/60">
            <tr>
              <th className="px-5 py-3">Task</th>
              <th className="px-5 py-3">Due</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-lilac/40">
            {TASKS.map((t) => (
              <tr key={t.id} className="hover:bg-brand-mist/30">
                <td className="px-5 py-3 font-semibold text-brand-ink">{t.task}</td>
                <td className="px-5 py-3 text-brand-ink/70">{t.due}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${PRIORITY[t.priority]}`}>{t.priority}</span></td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS[t.status]}`}>{t.status}</span></td>
                <td className="px-5 py-3 text-xs font-semibold text-brand-magenta hover:underline">Update</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}