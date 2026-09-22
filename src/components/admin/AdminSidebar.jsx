import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Phone, Users, ClipboardList, BarChart3, Settings, Headphones } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/live-calls', label: 'Live Calls', icon: Phone },
  { to: '/admin/agents', label: 'Agents', icon: Users },
  { to: '/admin/leads', label: 'Leads & Logs', icon: ClipboardList },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ open, onClose }) {
  const { role, activeWebsite } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 flex h-screen w-64 flex-col border-r border-brand-lilac bg-white transition-transform md:sticky md:top-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-button text-white shadow-card">
            <Headphones size={18} />
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-tight text-brand-ink">
              ELITEINOVA <span className="text-brand-magenta">CRM</span>
            </p>
            <p className="text-[9px] font-semibold tracking-wide text-brand-ink/40">
              {activeWebsite?.name?.toUpperCase() || 'ADMIN'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-4 mb-6 rounded-xl bg-brand-lilac/50 p-4 text-xs text-brand-ink/60">
          <p className="font-semibold text-brand-ink">Role: {role}</p>
          <p className="mt-1">Scoped to your website only.</p>
        </div>
      </aside>
    </>
  );
}