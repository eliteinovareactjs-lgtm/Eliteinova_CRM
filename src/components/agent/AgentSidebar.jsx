// src/components/agent/AgentSidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Phone,
  ClipboardList,
  Headphones,
  LogOut,
  Menu,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agent/live-calls', label: 'Live Calls', icon: Phone },
  { to: '/agent/leads', label: 'My Leads', icon: ClipboardList },
];

export default function AgentSidebar({ open, collapsed, onToggleCollapse, onClose }) {
  const { user, role, activeWebsite, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const width = collapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 flex h-screen ${width} flex-col border-r border-brand-lilac bg-white transition-all duration-300 md:sticky md:top-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ================= BRAND + HAMBURGER TOGGLE ================= */}
        <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/60 px-4 py-5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card">
              <Headphones size={18} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold leading-tight text-brand-ink">
                  ELITEINOVA <span className="text-brand-magenta">CRM</span>
                </p>
                <p className="truncate text-[9px] font-semibold tracking-wide text-brand-ink/40">
                  {activeWebsite?.name?.toUpperCase() || 'AGENT'}
                </p>
              </div>
            )}
          </div>

          {/* Hamburger toggle — desktop collapse */}
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-brand-ink/60 hover:bg-brand-lilac md:flex"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <Menu size={18} />
          </button>

          {/* Mobile close — also 3 lines */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-ink/60 hover:bg-brand-lilac md:hidden"
            title="Close"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* ================= NAVIGATION (no scroll) ================= */}
        <nav className="flex-1 min-h-0 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              title={collapsed ? label : ''}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card'
                    : 'text-brand-ink/60 hover:bg-brand-lilac hover:text-brand-purple'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ================= HELP ================= */}
        <div className="px-3 pb-3">
          <button
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-ink/60 hover:bg-brand-lilac hover:text-brand-purple ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Help & Support' : ''}
          >
            <HelpCircle size={18} className="shrink-0" />
            {!collapsed && <span>Help &amp; Support</span>}
          </button>
        </div>

        {/* ================= USER + ROLE + LOGOUT ================= */}
        <div className="border-t border-brand-lilac/60 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl bg-brand-lilac/40 px-3 py-3 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-xs font-bold text-white">
              {user?.avatar || 'AG'}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-ink">
                  {user?.name || 'Agent'}
                </p>
                <p className="truncate text-[10px] capitalize text-brand-ink/50">
                  {role} • Scoped to your leads
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Sign out' : ''}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}